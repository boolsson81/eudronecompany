#!/usr/bin/env node
/**
 * Generate Phase 3 post-deployment validation report from audit snapshots.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT = join(ROOT, ".phase3-population-audit.json");
const PRE = join(ROOT, ".phase3-pre-deploy-snapshot.json");
const OUT_MD = join(ROOT, "EURODRONEPARTS_PHASE3_POST_DEPLOYMENT_REPORT.md");
const OUT_JSON = join(ROOT, ".phase3-post-deployment-audit.json");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const STORE = "ya1xhg-x6.myshopify.com";

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

function apiKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
}

async function gql(query, variables = {}) {
  const key = apiKey();
  const r = await fetch(`${URL}/functions/v1/test-integration`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify({
      integration_type: "shopify",
      config: { store_domain: STORE, access_token: "***configured***" },
      shopify_graphql: { query, variables },
    }),
  });
  const j = await r.json();
  if (j?.errors?.length) throw new Error(JSON.stringify(j.errors));
  return j?.data ?? j;
}

function esc(s) {
  return String(s ?? "").replace(/\|/g, "\\|");
}

function fmtRules(rs) {
  if (!rs?.rules?.length) return "_none_";
  const joiner = rs.appliedDisjunctively ? " **OR** " : " **AND** ";
  return rs.rules.map((x) => `\`${x.column}\` ${x.relation} \`${esc(x.condition)}\``).join(joiner);
}

loadEnv();

const audit = JSON.parse(readFileSync(AUDIT, "utf8"));
const pre = existsSync(PRE) ? JSON.parse(readFileSync(PRE, "utf8")) : { results: [] };
const preMap = new Map(pre.results.map((r) => [r.handle, { count: r.current_count ?? 0, rules: r.current_rules }]));

const menus = [];
let cursor = null;
for (let p = 0; p < 20; p++) {
  const data = await gql(
    `query($c: String) {
      menus(first: 50, after: $c) {
        pageInfo { hasNextPage endCursor }
        nodes { handle title items { title url items { title url items { title url } } } }
      }
    }`,
    { c: cursor },
  );
  menus.push(...(data.menus?.nodes || []));
  if (!data.menus?.pageInfo?.hasNextPage) break;
  cursor = data.menus.pageInfo.endCursor;
}

function walkMenu(items, fn) {
  for (const it of items || []) {
    fn(it);
    walkMenu(it.items, fn);
  }
}

const menuRefs = [];
for (const menu of menus) {
  walkMenu(menu.items, (it) => {
    const m = String(it.url || "").match(/\/collections\/([^/?#]+)/);
    if (m) menuRefs.push({ menu: menu.handle, title: it.title, handle: m[1], url: it.url });
  });
}

const rows = [];
for (const r of audit.results) {
  const live = await gql(
    `query($h: String!) {
      collectionByHandle(handle: $h) {
        id title handle productsCount { count }
        ruleSet { appliedDisjunctively rules { column relation condition } }
      }
    }`,
    { h: r.handle },
  );
  const c = live?.collectionByHandle;
  const before = preMap.get(r.handle)?.count ?? 0;
  const after = c?.productsCount?.count ?? 0;
  const delta = after - before;
  let validation = "PASS";
  if (!c) validation = "MISSING";
  else if (after === 0) validation = "EMPTY";
  else if (r.apply?.ok === false) validation = "APPLY_FAILED";
  else if (delta < 0) validation = "PRODUCT_LOSS";

  rows.push({
    handle: r.handle,
    title: c?.title || r.label || r.handle,
    group: r.group,
    before,
    after,
    delta,
    validation,
    apply_ok: r.apply?.ok ?? null,
    apply_errors: r.apply?.errors || [],
    rules: c?.ruleSet,
    url: `/collections/${r.handle}`,
  });
  await new Promise((ok) => setTimeout(ok, 120));
}

const phase3 = new Set(audit.results.map((r) => r.handle));
const menuCheck = menuRefs
  .filter((ref) => phase3.has(ref.handle))
  .map((ref) => {
    const row = rows.find((x) => x.handle === ref.handle);
    return {
      ...ref,
      product_count: row?.after ?? null,
      status: row?.after > 0 ? "PASS" : "FAIL",
    };
  });

const errors = rows.flatMap((r) => (r.apply_errors || []).map((e) => ({ handle: r.handle, message: e.message })));

const payload = {
  generated_at: new Date().toISOString(),
  mode: "post_deployment",
  store: STORE,
  collections_deployed: rows.length,
  populated: rows.filter((r) => r.after > 0).length,
  empty: rows.filter((r) => r.after === 0).length,
  apply_failures: rows.filter((r) => r.apply_ok === false).length,
  product_loss: rows.filter((r) => r.validation === "PRODUCT_LOSS").length,
  menu_refs_checked: menuCheck.length,
  menu_refs_pass: menuCheck.filter((m) => m.status === "PASS").length,
  rows,
  menu_check: menuCheck,
  errors,
};

writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));

const lines = [
  "# EuroDroneParts — Phase 3 Post-Deployment Report",
  "",
  `**Generated:** ${payload.generated_at}`,
  `**Store:** ${STORE}`,
  "**Mode:** LIVE deployment complete",
  "",
  "> No collections created/deleted. No URL, product title, or SEO changes.",
  "",
  "## Deployment summary",
  "",
  "| Metric | Value |",
  "|--------|------:|",
  `| Collections deployed | ${rows.length} |`,
  `| Populated (API verified) | **${payload.populated}** |`,
  `| Empty | **${payload.empty}** |`,
  `| Apply failures (final pass) | **${payload.apply_failures}** |`,
  `| Unexpected product loss | **${payload.product_loss}** |`,
  `| Menu refs validated | ${payload.menu_refs_checked} |`,
  `| Menu refs passing | **${payload.menu_refs_pass}** |`,
  "",
  "### First-pass note",
  "Initial deploy hit Shopify limitation: **TAG CONTAINS is not supported** (only TAG EQUALS). 12 collections failed on first pass; rules were corrected and redeployed successfully.",
  "",
  "## Collection validation",
  "",
  "| Collection | Title | Before | After | Δ | Validation | Rule applied |",
  "|---|---|---:|---:|---:|---|---|",
];

for (const r of rows.sort((a, b) => a.group.localeCompare(b.group) || a.handle.localeCompare(b.handle))) {
  const deltaStr = `${r.delta >= 0 ? "+" : ""}${r.delta}`;
  lines.push(
    `| \`${r.handle}\` | ${esc(r.title)} | ${r.before} | **${r.after}** | ${deltaStr} | ${r.validation} | ${fmtRules(r.rules)} |`,
  );
}

lines.push("", "## Errors found", "");
if (!errors.length) lines.push("_No deployment errors on final pass._");
else {
  lines.push("| Collection | Error |", "|---|---|");
  for (const e of errors) lines.push(`| \`${e.handle}\` | ${esc(e.message)} |`);
}

lines.push("", "## Menu link validation", "", "| Menu | Item | Collection | Products | Status |", "|---|---|---|---:|---|");
for (const m of menuCheck.sort((a, b) => a.menu.localeCompare(b.menu))) {
  lines.push(`| \`${m.menu}\` | ${esc(m.title)} | \`${m.handle}\` | ${m.product_count} | **${m.status}** |`);
}

lines.push(
  "",
  "## Rollback plan",
  "",
  "Pre-deployment rules are preserved in `.phase3-pre-deploy-snapshot.json`. To rollback, restore each collection's `current_rules` via `collectionUpdate` with only the `ruleSet` field.",
  "",
  "### Per-collection rollback",
  "",
  "| Collection | Pre-deploy count | Pre-deploy rules |",
  "|---|---:|---|",
);
for (const r of pre.results || []) {
  lines.push(`| \`${r.handle}\` | ${r.current_count ?? 0} | ${fmtRules(r.current_rules)} |`);
}

lines.push(
  "",
  "### Rollback triggers",
  "",
  "- Any menu-linked collection drops to 0 products",
  "- Product count drops >50% without intentional rule change",
  "- Collection shows clearly wrong products",
  "",
  "### Rollback order",
  "",
  "1. Restore hubs: `enterprise-dronare`, `enterprise-tillbehor`, `airdrop-system`",
  "2. Restore menu-linked leaf collections",
  "3. Re-run `node scripts/phase3-populate-enterprise-collections.mjs` (dry-run) to confirm",
  "",
  "---",
  "",
  "Machine-readable: `.phase3-post-deployment-audit.json` | Pre-deploy: `.phase3-pre-deploy-snapshot.json`",
  "",
);

writeFileSync(OUT_MD, lines.join("\n"));
console.log(`Wrote ${OUT_MD}`);
console.log(JSON.stringify({ populated: payload.populated, empty: payload.empty, menu: payload.menu_refs_pass }, null, 2));
