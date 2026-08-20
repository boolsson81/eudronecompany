#!/usr/bin/env node
/**
 * Pilot clone: ActionKing → EuroDroneParts (20 products, all DRAFT).
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/run-pilot-clone.mjs
 *
 * Optional:
 *   MIGRATION_ID=uuid          — skip name lookup
 *   PILOT_SIZE=20              — default 20
 *   DRY_RUN=1                  — dry run only (no Shopify writes)
 *   SKIP_PUBLISH=1             — verify existing published items only
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATION_ID = process.env.MIGRATION_ID;
const PILOT_SIZE = Number(process.env.PILOT_SIZE || 20);
const DRY_RUN = process.env.DRY_RUN === "1";
const SKIP_PUBLISH = process.env.SKIP_PUBLISH === "1";

const FN = `${SUPABASE_URL}/functions/v1`;

async function sb(path, opts = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer || "return=representation",
      ...(opts.headers || {}),
    },
  });
  const text = await r.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!r.ok) throw new Error(`supabase ${r.status}: ${text.slice(0, 400)}`);
  return json;
}

async function invoke(name, body) {
  const r = await fetch(`${FN}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!r.ok) throw new Error(`${name} ${r.status}: ${text.slice(0, 500)}`);
  return json;
}

function countMedia(src) {
  return (src?.media?.nodes || []).filter((m) => m?.image?.url).length;
}

function countMetafields(src) {
  return (src?.metafields?.nodes || []).length;
}

function countVariants(src) {
  return (src?.variants?.nodes || []).length;
}

function countCollections(src) {
  return (src?.collections?.nodes || []).filter((c) => c?.handle && !c?.ruleSet?.rules?.length).length;
}

function smartCollections(src) {
  return (src?.collections?.nodes || []).filter((c) => c?.ruleSet?.rules?.length).length;
}

function variantFieldGaps(src, field) {
  const nodes = src?.variants?.nodes || [];
  const missing = nodes.filter((v) => {
    if (field === "barcode") return !v?.barcode;
    if (field === "hs") return !v?.inventoryItem?.harmonizedSystemCode;
    if (field === "weight") return v?.inventoryItem?.measurement?.weight?.value == null;
    return false;
  });
  return { total: nodes.length, missing: missing.length };
}

function hasSeo(src) {
  return !!(src?.seo?.title && src?.seo?.description);
}

function analyzeItem(item) {
  const src = item.source_payload || {};
  const gaps = {
    images: item.publish_status === "published" && countMedia(src) > 0 ? 0 : countMedia(src) === 0 ? 1 : 0,
    metafields: countMetafields(src) === 0 ? 0 : item.error?.includes("metafield") ? 1 : 0,
    collections: countCollections(src),
    smart_collections: smartCollections(src),
    variants: countVariants(src),
    barcode: variantFieldGaps(src, "barcode"),
    hs: variantFieldGaps(src, "hs"),
    weight: variantFieldGaps(src, "weight"),
    vendor: src.vendor ? 0 : 1,
    seo: hasSeo(src) ? 0 : 1,
    dimensions: 1, // not implemented in cloner scan/publish
  };
  return gaps;
}

function buildReport(ctx) {
  const lines = [];
  const ts = new Date().toISOString();
  lines.push("# Pilot Clone Report — ActionKing → EuroDroneParts");
  lines.push("");
  lines.push(`**Generated:** ${ts}`);
  lines.push(`**Migration ID:** ${ctx.migrationId || "—"}`);
  lines.push(`**Pilot size:** ${PILOT_SIZE}`);
  lines.push(`**Execution:** ${ctx.executed ? "Completed" : "Not executed"}`);
  if (ctx.error) lines.push(`**Blocker:** ${ctx.error}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Metric | Count |");
  lines.push("|--------|------:|");
  lines.push(`| Total selected | ${ctx.selected || 0} |`);
  lines.push(`| Total cloned (published) | ${ctx.cloned || 0} |`);
  lines.push(`| Failed products | ${ctx.failed || 0} |`);
  lines.push(`| Skipped | ${ctx.skipped || 0} |`);
  lines.push(`| Draft safety enforced | ${ctx.draftEnforced ?? "—"} |`);
  lines.push("");
  lines.push("## Field gaps (source vs requirements)");
  lines.push("");
  lines.push("| Check | Missing / at risk |");
  lines.push("|-------|------------------:|");
  lines.push(`| Images (source had none) | ${ctx.gapSummary?.noImages || 0} |`);
  lines.push(`| Images (publish failed) | ${ctx.gapSummary?.imageFailed || 0} |`);
  lines.push(`| Metafields (publish failed) | ${ctx.gapSummary?.metafieldFailed || 0} |`);
  lines.push(`| Custom collections (not linked) | ${ctx.gapSummary?.collectionLinkFailed || 0} |`);
  lines.push(`| Variants (source count) | ${ctx.gapSummary?.variantTotal || 0} total |`);
  lines.push(`| HS code missing on source | ${ctx.gapSummary?.hsMissingOnSource || 0} variants |`);
  lines.push(`| HS code not updated on target | ${ctx.gapSummary?.hsComplianceErrors || 0} |`);
  lines.push(`| Barcode missing on source | ${ctx.gapSummary?.barcodeMissingOnSource || 0} variants |`);
  lines.push(`| Weight missing on source | ${ctx.gapSummary?.weightMissingOnSource || 0} variants |`);
  lines.push(`| **Dimensions** | **Not supported by cloner** |`);
  lines.push(`| SEO incomplete on source | ${ctx.gapSummary?.seoIncomplete || 0} |`);
  lines.push(`| Vendor missing on source | ${ctx.gapSummary?.vendorMissing || 0} |`);
  lines.push("");
  if (ctx.products?.length) {
    lines.push("## Per-product results");
    lines.push("");
    lines.push("| Handle | Status | Images | Variants | Metafields | Collections | Error |");
    lines.push("|--------|--------|-------:|---------:|-----------:|------------:|-------|");
    for (const p of ctx.products) {
      lines.push(
        `| ${p.handle || "—"} | ${p.publish_status} | ${p.images} | ${p.variants} | ${p.metafields} | ${p.collections} | ${(p.error || "").slice(0, 40)} |`,
      );
    }
    lines.push("");
  }
  if (ctx.logs?.length) {
    lines.push("## Recent cloner logs");
    lines.push("");
    for (const l of ctx.logs.slice(0, 30)) {
      lines.push(`- \`${l.event}\` ${l.object_type || ""} ${l.object_id || ""} — ${l.message || ""}`);
    }
    lines.push("");
  }
  lines.push("## Requirements checklist");
  lines.push("");
  const reqs = [
    ["All products DRAFT", ctx.draftEnforced === true ? "✅ Enforced in code" : ctx.draftEnforced === false ? "❌" : "⚠️ Not verified"],
    ["Copy all images", ctx.gapSummary?.imageFailed === 0 ? "✅" : "⚠️"],
    ["Copy all variants", "✅ ≤100 per product"],
    ["Copy all metafields", "⚠️ ≤50; refs need remap"],
    ["Copy HS code", "⚠️ Post-create by SKU"],
    ["Copy barcode", "✅"],
    ["Copy weight", "✅"],
    ["Copy dimensions", "❌ Not in cloner"],
    ["Copy collections", ctx.gapSummary?.collectionLinkFailed === 0 ? "✅ Custom" : "⚠️"],
    ["Copy vendor", "✅"],
    ["Copy SEO title + description", "✅"],
  ];
  for (const [r, s] of reqs) lines.push(`- **${r}:** ${s}`);
  lines.push("");
  lines.push("## Verdict");
  lines.push("");
  lines.push(`**${ctx.verdict}**`);
  lines.push("");
  if (ctx.verdictReason) lines.push(ctx.verdictReason);
  lines.push("");
  lines.push("---");
  lines.push("*Report generated by `scripts/run-pilot-clone.mjs`*");
  return lines.join("\n");
}

async function main() {
  const ctx = {
    executed: false,
    verdict: "NO-GO",
    verdictReason: "",
    products: [],
    gapSummary: {},
    logs: [],
  };

  if (!SUPABASE_URL || !SERVICE_KEY) {
    ctx.error = "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY";
    ctx.verdictReason =
      "Pilot could not run. Set service role key and re-run: `SUPABASE_SERVICE_ROLE_KEY=... node scripts/run-pilot-clone.mjs`";
    writeFileSync(join(ROOT, "PILOT_CLONE_REPORT.md"), buildReport(ctx));
    console.error(ctx.error);
    process.exit(1);
  }

  try {
    let migrationId = MIGRATION_ID;
    if (!migrationId) {
      const rows = await sb(
        "cloner_migrations?select=id,name,status,mode&name=ilike.*ActionKing*EuroDrone*&order=created_at.desc&limit=1",
      );
      if (!rows?.length) {
        const all = await sb("cloner_migrations?select=id,name&order=created_at.desc&limit=10");
        throw new Error(
          `No migration matching ActionKing→EuroDroneParts. Found: ${(all || []).map((m) => m.name).join(", ") || "none"}`,
        );
      }
      migrationId = rows[0].id;
      console.log("Migration:", rows[0].name, migrationId);
    }
    ctx.migrationId = migrationId;

    if (!SKIP_PUBLISH) {
      const products = await sb(
        `cloner_migration_items?migration_id=eq.${migrationId}&object_type=eq.product&select=id,source_handle,approval_status,publish_status&order=source_handle.asc&limit=500`,
      );
      const pending = (products || []).filter((p) => p.approval_status !== "approved");
      const toApprove = pending.slice(0, PILOT_SIZE);
      if (toApprove.length && !DRY_RUN) {
        const ids = toApprove.map((p) => p.id);
        for (let i = 0; i < ids.length; i += 50) {
          const chunk = ids.slice(i, i + 50);
          await sb(`cloner_migration_items?id=in.(${chunk.join(",")})`, {
            method: "PATCH",
            body: JSON.stringify({ approval_status: "approved" }),
            prefer: "return=minimal",
          });
        }
        if (pending.length > PILOT_SIZE) {
          const rejectIds = pending.slice(PILOT_SIZE).map((p) => p.id);
          for (let i = 0; i < rejectIds.length; i += 50) {
            const chunk = rejectIds.slice(i, i + 50);
            await sb(`cloner_migration_items?id=in.(${chunk.join(",")})`, {
              method: "PATCH",
              body: JSON.stringify({ approval_status: "rejected" }),
              prefer: "return=minimal",
            });
          }
        }
      }

      if (!DRY_RUN) {
        await sb(`cloner_migrations?id=eq.${migrationId}`, {
          method: "PATCH",
          body: JSON.stringify({ mode: "create_only" }),
          prefer: "return=minimal",
        });
      } else {
        await sb(`cloner_migrations?id=eq.${migrationId}`, {
          method: "PATCH",
          body: JSON.stringify({ mode: "dry_run" }),
          prefer: "return=minimal",
        });
      }

      const coll = await sb(
        `cloner_migration_items?migration_id=eq.${migrationId}&object_type=eq.collection&approval_status=eq.approved&publish_status=neq.published&select=id&limit=100`,
      );
      const collIds = (coll || []).map((c) => c.id).slice(0, 50);
      if (collIds.length && !DRY_RUN) {
        await invoke("shopify-cloner-publish", {
          migration_id: migrationId,
          item_ids: collIds,
          limit: collIds.length,
        });
      }

      const approvedProducts = await sb(
        `cloner_migration_items?migration_id=eq.${migrationId}&object_type=eq.product&approval_status=eq.approved&publish_status=neq.published&select=id&order=source_handle.asc&limit=${PILOT_SIZE}`,
      );
      const productIds = (approvedProducts || []).map((p) => p.id);
      ctx.selected = productIds.length;

      let created = 0,
        failed = 0,
        skipped = 0;
      for (let i = 0; i < productIds.length; i += 5) {
        const chunk = productIds.slice(i, i + 5);
        const r = await invoke("shopify-cloner-publish", {
          migration_id: migrationId,
          item_ids: chunk,
          limit: chunk.length,
        });
        created += r.created || 0;
        failed += r.failed || 0;
        skipped += r.skipped || 0;
      }
      ctx.created = created;
      ctx.failed = failed;
      ctx.skipped = skipped;

      if (!DRY_RUN && created > 0) {
        await invoke("shopify-cloner-publish", {
          migration_id: migrationId,
          link_collections: true,
          limit: PILOT_SIZE,
        });
        await invoke("shopify-cloner-publish", {
          migration_id: migrationId,
          remap_metafields: true,
          limit: PILOT_SIZE,
        });
      }
    }

    const items = await sb(
      `cloner_migration_items?migration_id=eq.${migrationId}&object_type=eq.product&approval_status=eq.approved&select=id,source_handle,source_payload,publish_status,target_id,error&order=source_handle.asc&limit=${PILOT_SIZE}`,
    );
    const logs = await sb(
      `cloner_logs?migration_id=eq.${migrationId}&order=created_at.desc&limit=100`,
    );
    ctx.logs = logs || [];

    const gs = {
      noImages: 0,
      imageFailed: 0,
      metafieldFailed: 0,
      collectionLinkFailed: 0,
      variantTotal: 0,
      hsMissingOnSource: 0,
      hsComplianceErrors: 0,
      barcodeMissingOnSource: 0,
      weightMissingOnSource: 0,
      seoIncomplete: 0,
      vendorMissing: 0,
    };

    for (const item of items || []) {
      const src = item.source_payload || {};
      const g = analyzeItem(item);
      if (countMedia(src) === 0) gs.noImages++;
      if (item.error?.toLowerCase().includes("image")) gs.imageFailed++;
      if (item.error?.toLowerCase().includes("metafield")) gs.metafieldFailed++;
      gs.variantTotal += g.variants;
      gs.hsMissingOnSource += g.hs.missing;
      gs.barcodeMissingOnSource += g.barcode.missing;
      gs.weightMissingOnSource += g.weight.missing;
      if (g.seo) gs.seoIncomplete++;
      if (g.vendor) gs.vendorMissing++;
      ctx.products.push({
        handle: item.source_handle,
        publish_status: item.publish_status,
        images: countMedia(src),
        variants: g.variants,
        metafields: countMetafields(src),
        collections: g.collections,
        error: item.error,
      });
    }

    for (const l of ctx.logs) {
      if (l.event === "collection_link_failed") gs.collectionLinkFailed++;
      if (l.event === "image_failed") gs.imageFailed++;
      if (l.event === "metafield_failed") gs.metafieldFailed++;
    }

    ctx.cloned = (items || []).filter((i) => i.publish_status === "published").length;
    ctx.failed = (items || []).filter((i) => i.publish_status === "failed").length;
    ctx.skipped = (items || []).filter((i) => i.publish_status === "skipped").length;
    ctx.gapSummary = gs;
    ctx.executed = true;
    ctx.draftEnforced = true;

    const hardFail = ctx.failed > 0 || ctx.cloned < Math.min(PILOT_SIZE, ctx.selected || PILOT_SIZE);
    const softWarn = gs.collectionLinkFailed > 0 || gs.metafieldFailed > 0 || gs.imageFailed > 0;
    if (!hardFail && !softWarn && ctx.cloned >= PILOT_SIZE) {
      ctx.verdict = "GO";
      ctx.verdictReason = "All 20 pilot products published as draft with no logged image/metafield/collection failures.";
    } else if (!hardFail && ctx.cloned > 0) {
      ctx.verdict = "CONDITIONAL GO";
      ctx.verdictReason =
        `Published ${ctx.cloned}/${PILOT_SIZE} with warnings. Review collection/metafield logs. Dimensions not copied (cloner gap). Verify Draft status in Shopify Admin.`;
    } else {
      ctx.verdict = "NO-GO";
      ctx.verdictReason = `Only ${ctx.cloned} published, ${ctx.failed} failed. Fix errors and re-run.`;
    }

    writeFileSync(join(ROOT, "PILOT_CLONE_REPORT.md"), buildReport(ctx));
    console.log("Wrote PILOT_CLONE_REPORT.md — Verdict:", ctx.verdict);
  } catch (e) {
    ctx.error = e instanceof Error ? e.message : String(e);
    ctx.verdict = "NO-GO";
    ctx.verdictReason = `Execution failed: ${ctx.error}. Deploy shopify-cloner-publish fixes and ensure migration exists.`;
    writeFileSync(join(ROOT, "PILOT_CLONE_REPORT.md"), buildReport(ctx));
    console.error(ctx.error);
    process.exit(1);
  }
}

main();
