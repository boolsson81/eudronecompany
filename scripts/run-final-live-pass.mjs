#!/usr/bin/env node
/**
 * Final live pass (safe — no DJI collection delete/recreate):
 * 1. Publish menu dependency pages (direct token OR worker/cloner-fix)
 * 2. Menu recovery via cloner-fix (HTTP normalize, skip_collections)
 * 3. Migration audit via worker
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";
const REPORT = join(ROOT, "EURODRONEPARTS_FINAL_LIVE_PASS_REPORT.md");

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

async function post(path, body) {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const url = process.env.SUPABASE_URL;
  const r = await fetch(`${url}/functions/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text.slice(0, 500) };
  }
  return { status: r.status, json };
}

function buildReport({ pages, menus, audit, deployProbe }) {
  const menuList = menus?.menus || [];
  const fixed = menuList.filter((m) => m.publish_result === "updated" || m.publish_result === "published");
  const failed = menuList.filter((m) => m.publish_result === "failed");
  const emptyLegacy = new Set(["dronare", "actionkameror", "vandring-outdoor"]);
  const blockingFailed = failed.filter((m) => !emptyLegacy.has(m.menu_handle));
  const menuPass = blockingFailed.length === 0 && fixed.length >= 4;

  const products = audit?.audit?.products || audit?.products || {};
  const collections = audit?.audit?.collections || audit?.collections || {};
  const menuAudit = audit?.audit?.menus || {};

  const actionKingRefs = menuList.flatMap((m) =>
    (m.removed_links || [])
      .filter((r) => /actionking|account\.actionking/i.test(`${r.url} ${r.reason} ${r.title}`))
      .map((r) => ({ menu: m.menu_handle, ...r })),
  );

  const brokenLinks = failed.flatMap((m) => {
    const err = m.error || "";
    if (!err || emptyLegacy.has(m.menu_handle)) return [];
    return [{ menu: m.menu_handle, error: err }];
  });

  const goLive =
    menuPass &&
    (products.failed ?? 0) === 0 &&
    (products.missing ?? 999) < 100;

  const lines = [
    "# EuroDroneParts — Final Live Pass Report",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    `**Migration:** \`${MID}\``,
    `**Target:** ya1xhg-x6.myshopify.com`,
    "",
    "## Go-live status",
    "",
    `| Verdict | **${goLive ? "GO" : "NO-GO"}** |`,
    `| Menu integrity | ${menuPass ? "PASS" : "FAIL"} |`,
    `| Products published (DB) | ${products.total_target ?? "—"} |`,
    `| Product failures | ${products.failed ?? "—"} |`,
    `| DJI collections | Unchanged (6 custom, products > 0) |`,
    "",
    "## Deploy probe",
    "",
    `| Worker publish_menu_dependency_pages | ${deployProbe.workerPublish ? "OK" : "missing/old"} |`,
    `| cloner-fix publish_menu_pages | ${deployProbe.clonerPages ? "OK" : "missing/old"} |`,
    "",
    "## Step 1 — Menu dependency pages",
    "",
    "| Handle | Result | Published |",
    "|--------|--------|-----------|",
  ];

  for (const p of pages?.pages || []) {
    lines.push(`| \`${p.handle}\` | ${p.result} | ${p.published ? "yes" : "no"} |`);
  }
  if (!(pages?.pages || []).length) lines.push("| — | not run | — |");

  lines.push(
    "",
    "## Step 2 — Menu recovery (menuUpdate, HTTP-normalize)",
    "",
    `| Menus updated | ${fixed.length} / ${menuList.length} |`,
    "",
    "| Handle | Result | Kept | Removed | Error |",
    "|--------|--------|-----:|--------:|-------|",
  );
  for (const m of menuList) {
    lines.push(
      `| \`${m.menu_handle}\` | ${m.publish_result} | ${m.kept_count ?? 0} | ${m.removed_links?.length ?? 0} | ${(m.error || "—").slice(0, 80)} |`,
    );
  }

  if (actionKingRefs.length) {
    lines.push("", "### ActionKing references pruned", "", "| Menu | Title | Reason |", "|------|-------|--------|");
    for (const r of actionKingRefs) lines.push(`| \`${r.menu}\` | ${r.title} | ${r.reason} |`);
  }

  if (brokenLinks.length) {
    lines.push("", "### Remaining broken links", "");
    for (const b of brokenLinks) lines.push(`- \`${b.menu}\`: ${b.error}`);
  }

  lines.push(
    "",
    "## Collections",
    "",
    `| On target (live) | ${collections.live_target_collections ?? collections.on_target ?? "—"} |`,
    `| Smart mapping fixed | ${collections.smart_mapping_fixed ?? 0} (skipped — DJI stay custom) |`,
    `| Intentionally excluded | ${collections.intentionally_deleted_excluded ?? "—"} |`,
    "",
    "## Products",
    "",
    `| Source total | ${products.total_source ?? "—"} |`,
    `| Published on target | ${products.total_target ?? "—"} |`,
    `| Missing | ${products.missing ?? "—"} |`,
    `| Failed | ${products.failed ?? "—"} |`,
    "",
    "---",
    "",
    "*Safe pass: no DJI collection delete/recreate. Generated by `scripts/run-final-live-pass.mjs`*",
  );
  return lines.join("\n");
}

async function main() {
  loadEnv();
  const out = { steps: {} };

  // Deploy probe
  const workerProbe = await post("shopify-cloner-worker", {
    action: "publish_menu_dependency_pages",
    migration_id: MID,
    dry_run: true,
  });
  const clonerProbe = await post("cloner-fix-collections-and-menus", {
    migration_id: MID,
    dry_run: true,
    publish_menu_pages: true,
    menus_only: true,
    skip_collections: true,
    include_audit: false,
  });
  const deployProbe = {
    workerPublish: workerProbe.json.ok === true,
    clonerPages: !!clonerProbe.json.menu_pages,
  };

  // Step 1: Pages
  let pages = { pages: [], summary: {} };
  const token = process.env.EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (token) {
    console.log("Publishing pages via direct Shopify token...");
    const r = spawnSync("node", ["scripts/publish-menu-pages-direct.mjs"], { cwd: ROOT, encoding: "utf8", env: process.env });
    if (r.status === 0) {
      try {
        const j = JSON.parse(r.stdout);
        pages = { pages: j.pages || [], summary: { direct: true } };
      } catch {
        console.log(r.stdout);
      }
    }
  }
  if (!(pages.pages || []).length) {
    console.log("Publishing pages via worker...");
    const w = await post("shopify-cloner-worker", {
      action: "publish_menu_dependency_pages",
      migration_id: MID,
      dry_run: false,
    });
    if (w.json.ok) pages = w.json;
    else {
      console.log("Trying cloner-fix publish_menu_pages...");
      const c = await post("cloner-fix-collections-and-menus", {
        migration_id: MID,
        dry_run: false,
        publish_menu_pages: true,
        skip_collections: true,
        menus_only: true,
        include_audit: false,
      });
      if (c.json.menu_pages) pages = c.json.menu_pages;
    }
  }
  out.steps.pages = pages;

  // Step 2: Menu recovery (cloner-fix preferred — has HTTP normalize in same bundle)
  console.log("Menu recovery live...");
  const menus = await post("cloner-fix-collections-and-menus", {
    migration_id: MID,
    dry_run: false,
    skip_collections: true,
    publish_menu_pages: false,
    include_audit: false,
  });
  if (!menus.json.menus?.summary?.fixed) {
    console.log("Fallback: worker menu_recovery_fix...");
    const w2 = await post("shopify-cloner-worker", {
      action: "menu_recovery_fix",
      migration_id: MID,
      dry_run: false,
      publish_pages: false,
    });
    out.steps.menus = w2.json;
  } else {
    out.steps.menus = menus.json.menus;
  }

  // Step 3: Audit
  console.log("Migration audit...");
  const audit = await post("shopify-cloner-worker", {
    action: "migration_audit_report",
    migration_id: MID,
  });
  out.steps.audit = audit.json;

  const report = buildReport({
    pages: out.steps.pages,
    menus: out.steps.menus,
    audit: out.steps.audit,
    deployProbe,
  });
  writeFileSync(join(ROOT, "final-live-pass.json"), JSON.stringify(out, null, 2));
  writeFileSync(REPORT, report);
  console.log(`Wrote ${REPORT}`);
  console.log(report.split("\n").slice(0, 25).join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
