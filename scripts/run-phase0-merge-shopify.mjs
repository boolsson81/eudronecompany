#!/usr/bin/env node
/**
 * Execute Phase 0 approved collection merges via test-integration GraphQL proxy.
 * Uses OAuth install token (service role inside edge function). No redirects.
 *
 *   node scripts/run-phase0-merge-shopify.mjs              # dry-run
 *   EDP_LAUNCH_CONFIRM=1 node scripts/run-phase0-merge-shopify.mjs --live
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { resolveMergePlan, TAXONOMY_VERSION } from "./lib/taxonomy-approval-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "PHASE_0_EXECUTION_REPORT.md");
const SHOP = "ya1xhg-x6.myshopify.com";

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

async function shopifyGql(query, variables = {}) {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const url = process.env.SUPABASE_URL;
  const r = await fetch(`${url}/functions/v1/test-integration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({
      integration_type: "shopify",
      config: { store_domain: SHOP, access_token: "***configured***" },
      shopify_graphql: { query, variables },
    }),
  });
  const json = await r.json();
  if (!json.success) {
    throw new Error(JSON.stringify(json.errors || json.message || json));
  }
  return json.data;
}

async function fetchAllCollections() {
  const rows = [];
  let cursor = null;
  for (let i = 0; i < 30; i++) {
    const data = await shopifyGql(
      `query($cursor: String) {
        collections(first: 250, after: $cursor) {
          edges { cursor node { id handle title productsCount { count } ruleSet { appliedDisjunctively rules { column relation condition } } } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor },
    );
    for (const edge of data.collections.edges) {
      const n = edge.node;
      rows.push({
        id: n.id,
        handle: n.handle,
        title: n.title,
        products_count: n.productsCount?.count ?? 0,
        kind: (n.ruleSet?.rules?.length || 0) > 0 ? "smart" : "custom",
        ruleSet: n.ruleSet,
      });
      cursor = edge.cursor;
    }
    if (!data.collections.pageInfo.hasNextPage) break;
    cursor = data.collections.pageInfo.endCursor;
  }
  return rows;
}

function ruleKey(r) {
  return `${r.column}|${r.relation}|${r.condition}`;
}

function mergeRuleSets(canonical, absorb) {
  const merged = new Map();
  for (const r of canonical?.rules || []) merged.set(ruleKey(r), r);
  for (const r of absorb?.rules || []) merged.set(ruleKey(r), r);
  return { appliedDisjunctively: true, rules: [...merged.values()] };
}

async function deleteCollection(id) {
  const data = await shopifyGql(
    `mutation DeleteCollection($input: CollectionDeleteInput!) {
      collectionDelete(input: $input) { deletedCollectionId userErrors { message } }
    }`,
    { input: { id } },
  );
  const errs = data?.collectionDelete?.userErrors || [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
}

async function updateCollectionRules(id, ruleSet) {
  const data = await shopifyGql(
    `mutation CollectionUpdate($input: CollectionInput!) {
      collectionUpdate(input: $input) { collection { id handle } userErrors { message } }
    }`,
    { input: { id, ruleSet } },
  );
  const errs = data?.collectionUpdate?.userErrors || [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
}

async function executeMerge(canonical, absorb, live) {
  if (!live) {
    return { action: "dry_run", products_moved: absorb.products_count };
  }

  if (absorb.kind === "smart" && absorb.ruleSet?.rules?.length) {
    const merged = mergeRuleSets(canonical.ruleSet, absorb.ruleSet);
    await updateCollectionRules(canonical.id, merged);
    await deleteCollection(absorb.id);
    return { action: "merged", products_moved: absorb.products_count };
  }

  if (absorb.products_count === 0) {
    await deleteCollection(absorb.id);
    return { action: "merged", products_moved: 0 };
  }

  throw new Error(`Unsupported merge: ${absorb.handle} (${absorb.kind}, ${absorb.products_count} products)`);
}

function writeReport({ live, results, collectionCount }) {
  const now = new Date().toISOString();
  const lines = [
    "# Phase 0 Execution Report",
    "",
    `**Generated:** ${now}`,
    `**Mode:** ${live ? "LIVE" : "dry-run"}`,
    `**Taxonomy:** \`${TAXONOMY_VERSION}\``,
    `**Store:** ${SHOP}`,
    `**Collections on store:** ${collectionCount}`,
    "",
    "## Merge results",
    "",
    "| Canonical | Absorb | Action | Products | Error |",
    "| --- | --- | --- | ---: | --- |",
  ];
  for (const r of results) {
    lines.push(`| \`${r.canonical}\` | \`${r.absorb}\` | ${r.action} | ${r.products_moved} | ${r.error || "—"} |`);
  }
  lines.push("");
  lines.push("## Notes", "");
  lines.push("- No redirects created");
  lines.push("- Handles unchanged on canonical collections");
  lines.push("- Absorbed collections deleted after rule merge");
  lines.push("");
  writeFileSync(REPORT, lines.join("\n"));
}

async function main() {
  loadEnv();
  const live = process.argv.includes("--live");
  if (live && !process.env.EDP_LAUNCH_CONFIRM) {
    console.error("Set EDP_LAUNCH_CONFIRM=1 for live merges");
    process.exit(1);
  }

  console.log(`Phase 0 merge — ${live ? "LIVE" : "dry-run"}\n`);
  const collections = await fetchAllCollections();
  const byHandle = new Map(collections.map((c) => [c.handle, c]));
  console.log(`Live collections: ${collections.length}\n`);

  const mergePlan = resolveMergePlan(collections);
  console.log(`Merge plan (${mergePlan.length} pairs):\n`);
  for (const p of mergePlan) console.log(`  ${p.absorb} → ${p.canonical}`);

  const results = [];
  for (const plan of mergePlan) {
    const canonical = byHandle.get(plan.canonical);
    const absorb = byHandle.get(plan.absorb);
    if (!absorb) {
      results.push({ canonical: plan.canonical, absorb: plan.absorb, action: "skipped", products_moved: 0, error: "absorb not found" });
      continue;
    }
    if (!canonical) {
      results.push({ canonical: plan.canonical, absorb: plan.absorb, action: "skipped", products_moved: 0, error: "canonical not found" });
      continue;
    }
    try {
      const out = await executeMerge(canonical, absorb, live);
      results.push({ canonical: plan.canonical, absorb: plan.absorb, ...out });
      console.log(`${plan.absorb} → ${plan.canonical}: ${out.action}`);
    } catch (e) {
      results.push({ canonical: plan.canonical, absorb: plan.absorb, action: "failed", products_moved: 0, error: e.message });
      console.error(`${plan.absorb}: ${e.message}`);
    }
  }

  writeReport({ live, results, collectionCount: collections.length });
  console.log(`\nWrote ${REPORT}`);

  if (results.some((r) => r.action === "failed")) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
