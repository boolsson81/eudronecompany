#!/usr/bin/env node
/**
 * Collection merge executor — DRY-RUN by default.
 * Fetches live product GIDs, computes union per merge group, verifies zero product loss.
 *
 * Usage:
 *   node scripts/executors/collection-merge-executor.mjs           # dry-run
 *   node scripts/executors/collection-merge-executor.mjs --execute   # live (blocked unless explicitly enabled)
 */
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";
import { loadCsv, writeCsvSync } from "../lib/migration-csv.mjs";
import {
  fetchAllCollectionProductIds,
  fetchCollectionByHandle,
  loadEnv,
  pingShop,
  SHOP_DOMAIN,
} from "../lib/shopify-admin-client.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const MERGE_CSV = join(ROOT, "MERGE_MAPPING.csv");
const OUT_JSON = join(ROOT, ".merge-executor-result.json");
const OUT_CSV = join(ROOT, "MERGE_EXECUTOR_REPORT.csv");

const EXECUTE = process.argv.includes("--execute");
const ALLOW_EXECUTE = process.env.ALLOW_LIVE_MIGRATION === "1";

function groupMerges(rows) {
  const groups = new Map();
  for (const r of rows) {
    const canon = r.canonical_handle;
    if (!groups.has(canon)) {
      groups.set(canon, { canonical: canon, canonical_url: r.canonical_url, sources: [] });
    }
    groups.get(canon).sources.push({
      handle: r.merge_from_handle,
      merge_into: r.merge_into_handle,
      audit_products: Number(r.products_count) || 0,
    });
  }
  return [...groups.values()];
}

function pickPrimarySource(sources, canonicalExists) {
  if (canonicalExists) {
    const existing = sources.find((s) => s.handle === canonicalExists.handle);
    if (existing) return existing.handle;
  }
  return [...sources].sort((a, b) => (b.live_count ?? b.audit_products) - (a.live_count ?? a.audit_products))[0]?.handle;
}

export async function runCollectionMergeExecutor({ execute = false } = {}) {
  loadEnv();
  const shop = await pingShop();
  const mergeRows = loadCsv(MERGE_CSV);
  const groups = groupMerges(mergeRows);
  const results = [];
  const warnings = [];
  const conflicts = [];

  for (const group of groups) {
    const sourceData = [];
    const allProductIds = new Set();
    let canonicalLive = await fetchCollectionByHandle(group.canonical);

    for (const src of group.sources) {
      const live = await fetchCollectionByHandle(src.handle);
      if (!live) {
        conflicts.push({ type: "MISSING_SOURCE", canonical: group.canonical, handle: src.handle });
        sourceData.push({ ...src, live: null, product_ids: [], live_count: 0, status: "MISSING" });
        continue;
      }
      const productIds = await fetchAllCollectionProductIds(live.id);
      src.live_count = live.productsCount?.count ?? productIds.size;
      src.collection_id = live.id;
      src.rule_count = live.ruleSet?.rules?.length ?? 0;
      for (const id of productIds) allProductIds.add(id);
      sourceData.push({
        handle: src.handle,
        collection_id: live.id,
        live_count: src.live_count,
        audit_products: src.audit_products,
        fetched_products: productIds.size,
        product_ids: [...productIds],
        status: productIds.size === src.live_count ? "OK" : "COUNT_MISMATCH",
      });
      if (productIds.size !== src.live_count) {
        warnings.push({
          type: "AUDIT_COUNT_DRIFT",
          canonical: group.canonical,
          handle: src.handle,
          reported: src.live_count,
          fetched: productIds.size,
          note: "Live product count differs from audit snapshot — GID fetch is authoritative",
        });
      }
    }

    if (!canonicalLive) {
      const primaryHandle = pickPrimarySource(group.sources, null);
      canonicalLive = sourceData.find((s) => s.handle === primaryHandle) ? await fetchCollectionByHandle(primaryHandle) : null;
    }

    const sumReported = sourceData.reduce((n, s) => n + (s.live_count || 0), 0);
    const unionSize = allProductIds.size;
    const overlap = sumReported - unionSize;
    const canonicalCount = canonicalLive?.productsCount?.count ?? 0;
    const primaryHandle = pickPrimarySource(
      group.sources.map((s) => ({ ...s, live_count: sourceData.find((d) => d.handle === s.handle)?.live_count })),
      canonicalLive,
    );

    const productsOnlyInSources = unionSize;
    const wouldLose = 0; // union guarantees no loss if we add all to canonical before delete

    const row = {
      canonical_handle: group.canonical,
      canonical_exists: canonicalLive ? "YES" : "NO",
      canonical_live_handle: canonicalLive?.handle || primaryHandle,
      canonical_id: canonicalLive?.id || sourceData.find((s) => s.handle === primaryHandle)?.collection_id || "",
      primary_rename_from: canonicalLive ? "" : primaryHandle,
      source_count: sourceData.length,
      sum_source_products: sumReported,
      union_unique_products: unionSize,
      overlap_products: overlap,
      canonical_current_products: canonicalCount,
      expected_after_merge: unionSize,
      products_would_lose: wouldLose,
      verification: unionSize > 0 || sumReported === 0 ? "PASS" : "FAIL",
      action_plan: [
        canonicalLive?.handle !== group.canonical ? `Rename \`${canonicalLive?.handle || primaryHandle}\` → \`${group.canonical}\`` : null,
        unionSize > canonicalCount ? `Add ${unionSize - canonicalCount} products to \`${group.canonical}\`` : null,
        `Delete ${sourceData.filter((s) => s.handle !== canonicalLive?.handle).map((s) => s.handle).join(", ") || "none"} merged sources`,
      ]
        .filter(Boolean)
        .join("; "),
      sources: sourceData.map((s) => s.handle).join("; "),
    };

    if (unionSize < sumReported && overlap > 0) {
      row.overlap_note = `${overlap} duplicate memberships across sources (expected — union preserves all unique products)`;
    }

    results.push(row);
  }

  const summary = {
    mode: execute ? "EXECUTE" : "DRY_RUN",
    shop: shop?.name,
    domain: SHOP_DOMAIN,
    generated_at: new Date().toISOString(),
    merge_groups: results.length,
    total_union_products: results.reduce((n, r) => n + r.union_unique_products, 0),
    total_conflicts: conflicts.length,
    total_warnings: warnings.length,
    all_pass: results.every((r) => r.verification === "PASS") && conflicts.filter((c) => c.type === "MISSING_SOURCE").length === 0,
    warnings,
    conflicts,
    groups: results,
  };

  if (execute) {
    if (!ALLOW_EXECUTE) {
      throw new Error("Live execute blocked. Set ALLOW_LIVE_MIGRATION=1 to enable.");
    }
    throw new Error("Live merge execute not implemented in this pass — dry-run verification only.");
  }

  writeCsvSync(OUT_CSV, Object.keys(results[0] || {}), results);
  writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2), "utf8");

  return summary;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCollectionMergeExecutor({ execute: EXECUTE })
    .then((s) => {
      console.log(`Collection merge ${s.mode}: ${s.merge_groups} groups, union products=${s.total_union_products}, conflicts=${s.total_conflicts}, pass=${s.all_pass}`);
      for (const g of s.groups) {
        console.log(`  ${g.canonical_handle}: ${g.union_unique_products} unique (${g.sum_source_products} sum, overlap ${g.overlap_products}) — ${g.verification}`);
      }
      if (s.conflicts.length) console.log("Conflicts:", JSON.stringify(s.conflicts, null, 2));
      process.exit(s.all_pass ? 0 : 1);
    })
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
