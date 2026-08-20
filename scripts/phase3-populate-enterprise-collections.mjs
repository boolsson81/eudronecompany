#!/usr/bin/env node
/**
 * Phase 3 — Enterprise collection population (read-only validation + optional rule deploy).
 * Does NOT: create/delete collections, change URLs, modify product titles, or SEO.
 *
 * Usage:
 *   node scripts/phase3-populate-enterprise-collections.mjs           # dry-run report
 *   node scripts/phase3-populate-enterprise-collections.mjs --apply     # deploy ruleSet only
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RULES_IN = join(ROOT, "data/edp-phase3-population-rules.json");
const NAV_IN = join(ROOT, "data/edp-navigation-structure.json");
const OUT_MD = join(ROOT, "EURODRONEPARTS_PHASE3_POPULATION_REPORT.md");
const OUT_JSON = join(ROOT, ".phase3-population-audit.json");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const STORE = "ya1xhg-x6.myshopify.com";
const APPLY = process.argv.includes("--apply");

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

function productMatchesRule(product, rule) {
  const col = String(rule.column).toUpperCase();
  const rel = String(rule.relation).toUpperCase();
  const cond = String(rule.condition);
  const condL = cond.toLowerCase();

  if (col === "TAG") {
    const tags = product.tags || [];
    if (rel === "EQUALS") return tags.some((t) => t === cond);
    if (rel === "CONTAINS") return tags.some((t) => t.toLowerCase().includes(condL));
    return false;
  }

  let field = "";
  if (col === "TYPE") field = product.productType || "";
  else if (col === "VENDOR") field = product.vendor || "";
  else if (col === "TITLE") field = product.title || "";
  else return false;

  const fieldL = field.toLowerCase();
  if (rel === "EQUALS") return fieldL === condL;
  if (rel === "CONTAINS") return fieldL.includes(condL);
  return false;
}

function productMatchesRuleSet(product, ruleSet) {
  const rules = ruleSet.rules || [];
  if (!rules.length) return false;
  if (ruleSet.appliedDisjunctively) return rules.some((r) => productMatchesRule(product, r));
  return rules.every((r) => productMatchesRule(product, r));
}

function sanitizeRuleSet(ruleSet) {
  const rules = (ruleSet.rules || []).filter((r) => {
    if (String(r.column).toUpperCase() === "TAG" && String(r.relation).toUpperCase() === "CONTAINS") {
      console.warn(`  WARN: dropping unsupported TAG CONTAINS rule: ${r.condition}`);
      return false;
    }
    return true;
  });
  return { ...ruleSet, rules };
}

function formatRuleSet(rs) {
  if (!rs?.rules?.length) return "_none_";
  const joiner = rs.appliedDisjunctively ? " **OR** " : " **AND** ";
  return rs.rules.map((r) => `\`${r.column}\` ${r.relation} \`${esc(r.condition)}\``).join(joiner);
}

async function fetchAllProducts() {
  const all = [];
  let cursor = null;
  for (let p = 0; p < 50; p++) {
    const data = await gql(
      `query($c: String) {
        products(first: 250, after: $c) {
          pageInfo { hasNextPage endCursor }
          edges { node { id title vendor productType tags } }
        }
      }`,
      { c: cursor },
    );
    if (!data?.products) break;
    for (const e of data.products.edges || []) all.push(e.node);
    if (!data.products.pageInfo?.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return all;
}

async function fetchCollection(handle) {
  const data = await gql(
    `query($h: String!) {
      collectionByHandle(handle: $h) {
        id handle title
        productsCount { count }
        ruleSet { appliedDisjunctively rules { column relation condition } }
      }
    }`,
    { h: handle },
  );
  return data?.collectionByHandle;
}

async function fetchMenus() {
  const all = [];
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
    if (!data?.menus) break;
    all.push(...(data.menus.nodes || []));
    if (!data.menus.pageInfo?.hasNextPage) break;
    cursor = data.menus.pageInfo.endCursor;
  }
  return all;
}

function walkMenu(items, fn) {
  for (const it of items || []) {
    fn(it);
    walkMenu(it.items, fn);
  }
}

function flattenRules(rulesJson) {
  const out = [];
  for (const [group, collections] of Object.entries(rulesJson)) {
    if (group === "version" || group === "status" || group === "notes") continue;
    for (const [handle, cfg] of Object.entries(collections)) {
      out.push({
        handle,
        group,
        label: cfg.label || handle,
        appliedDisjunctively: cfg.appliedDisjunctively,
        rules: cfg.rules,
        notes: cfg.notes,
      });
    }
  }
  return out;
}

async function applyRuleSet(collectionId, ruleSet) {
  const safe = sanitizeRuleSet(ruleSet);
  const data = await gql(
    `mutation($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { id handle productsCount { count } }
        userErrors { field message }
      }
    }`,
    {
      input: {
        id: collectionId,
        ruleSet: {
          appliedDisjunctively: safe.appliedDisjunctively,
          rules: safe.rules.map((r) => ({
            column: r.column,
            relation: r.relation,
            condition: r.condition,
          })),
        },
      },
    },
  );
  const errs = data?.collectionUpdate?.userErrors || [];
  return { ok: !errs.length, errors: errs, count: data?.collectionUpdate?.collection?.productsCount?.count };
}

loadEnv();

console.log(APPLY ? "LIVE APPLY (rules only)" : "DRY RUN (read-only validation)");

const rulesJson = JSON.parse(readFileSync(RULES_IN, "utf8"));
const navJson = existsSync(NAV_IN) ? JSON.parse(readFileSync(NAV_IN, "utf8")) : { menus: {} };
const targets = flattenRules(rulesJson);

console.log("Fetching products...");
const products = await fetchAllProducts();
console.log(`Products loaded: ${products.length}`);

const results = [];
for (const t of targets) {
  const live = await fetchCollection(t.handle);
  const ruleSet = { appliedDisjunctively: t.appliedDisjunctively, rules: t.rules };
  const projected = products.filter((p) => productMatchesRuleSet(p, ruleSet));
  let applyResult = null;

  if (APPLY && live?.id) {
    applyResult = await applyRuleSet(live.id, ruleSet);
    await new Promise((ok) => setTimeout(ok, 400));
    const refreshed = await fetchCollection(t.handle);
    results.push({
      ...t,
      exists: !!live,
      current_count: live?.productsCount?.count ?? null,
      projected_count: projected.length,
      post_apply_count: refreshed?.productsCount?.count ?? null,
      current_rules: live?.ruleSet,
      proposed_rules: ruleSet,
      apply: applyResult,
    });
  } else {
    results.push({
      ...t,
      exists: !!live,
      current_count: live?.productsCount?.count ?? null,
      projected_count: projected.length,
      current_rules: live?.ruleSet,
      proposed_rules: ruleSet,
    });
  }
}

const menus = await fetchMenus();
const menuRefs = [];
for (const menu of menus) {
  walkMenu(menu.items, (it) => {
    const m = String(it.url || "").match(/\/collections\/([^/?#]+)/);
    if (m) menuRefs.push({ menu: menu.handle, title: it.title, collection: m[1] });
  });
}

const countByHandle = new Map(results.map((r) => [r.handle, APPLY ? (r.post_apply_count ?? r.current_count) : r.projected_count]));

const menuReadiness = menuRefs.map((ref) => {
  const count = countByHandle.get(ref.collection);
  const inScope = targets.some((t) => t.handle === ref.collection);
  return {
    ...ref,
    product_count: count ?? null,
    in_phase3_scope: inScope,
    status: count == null ? "not_in_scope" : count > 0 ? "populated" : "empty",
  };
});

const empty = results.filter((r) => (APPLY ? r.post_apply_count : r.projected_count) === 0);
const populated = results.filter((r) => (APPLY ? r.post_apply_count : r.projected_count) > 0);

const payload = {
  generated_at: new Date().toISOString(),
  mode: APPLY ? "apply" : "dry_run",
  product_catalog_size: products.length,
  collections_in_scope: results.length,
  projected_populated: populated.length,
  projected_empty: empty.length,
  results,
  menu_readiness: menuReadiness,
  empty_collections: empty.map((r) => r.handle),
  menu_empty_refs: menuReadiness.filter((m) => m.in_phase3_scope && m.status === "empty"),
};

writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));

const lines = [
  "# EuroDroneParts — Phase 3 Population Report",
  "",
  `**Generated:** ${payload.generated_at}`,
  `**Mode:** ${APPLY ? "LIVE — smart rules deployed" : "DRY RUN — read-only validation"}`,
  `**Catalog:** ${products.length} products scanned`,
  "",
  "> No collections created/deleted. No URL, product title, or SEO changes.",
  "",
  "## Summary",
  "",
  "| Metric | Value |",
  "|--------|------:|",
  `| Collections in scope | ${results.length} |`,
  `| ${APPLY ? "Populated after apply" : "Projected populated"} | ${populated.length} |`,
  `| ${APPLY ? "Empty after apply" : "Projected empty"} | ${empty.length} |`,
  `| Menu refs to phase-3 collections | ${menuReadiness.filter((m) => m.in_phase3_scope).length} |`,
  `| Menu refs still empty | ${payload.menu_empty_refs.length} |`,
  "",
  "## A. Enterprise DJI",
  "",
  "| Collection | Label | Current | Projected | Rules (proposed) |",
  "|---|---|---:|---:|---|",
];

for (const r of results.filter((x) => x.group === "enterprise_dji")) {
  const proj = APPLY ? r.post_apply_count : r.projected_count;
  lines.push(
    `| \`${r.handle}\` | ${esc(r.label)} | ${r.current_count ?? "—"} | **${proj}** | ${formatRuleSet(r.proposed_rules)} |`,
  );
}

lines.push("", "## B. FlyCart", "", "| Collection | Current | Projected | Rules |", "|---|---:|---:|---|");
for (const r of results.filter((x) => x.group === "flycart")) {
  const proj = APPLY ? r.post_apply_count : r.projected_count;
  lines.push(`| \`${r.handle}\` | ${r.current_count ?? "—"} | **${proj}** | ${formatRuleSet(r.proposed_rules)} |`);
}

lines.push("", "## C. Sensors & Payloads", "", "| Collection | Maps to | Current | Projected | Rules |", "|---|---|---:|---:|---|");
const sensorMap = {
  "enterprise-sensorer": "Zenmuse + LiDAR",
  "dronare-med-varmekamera": "Thermal Cameras",
  "enterprise-belysning": "Searchlights",
  "enterprise-hogtalarsystem": "Speakers",
  "airdrop-system": "Airdrop Systems",
  "enterprise-lyftsystem": "Parachute Systems",
};
for (const r of results.filter((x) => x.group === "sensors_payloads")) {
  const proj = APPLY ? r.post_apply_count : r.projected_count;
  lines.push(
    `| \`${r.handle}\` | ${sensorMap[r.handle] || r.label || "—"} | ${r.current_count ?? "—"} | **${proj}** | ${formatRuleSet(r.proposed_rules)} |`,
  );
}
for (const r of results.filter((x) => x.group === "enterprise_dji" && ["enterprise-belysning", "enterprise-hogtalarsystem", "enterprise-lyftsystem"].includes(x.handle))) {
  const proj = APPLY ? r.post_apply_count : r.projected_count;
  lines.push(
    `| \`${r.handle}\` | ${sensorMap[r.handle]} | ${r.current_count ?? "—"} | **${proj}** | ${formatRuleSet(r.proposed_rules)} |`,
  );
}

lines.push("", "## D. Industry Solutions", "", "| Collection | Vertical | Current | Projected | Rules |", "|---|---|---:|---:|---|");
const industryLabels = {
  inspektionsdronare: "Inspection + Public Safety (interim)",
  "energi-infrastruktur": "Energy & Infrastructure",
  jordbruksdronare: "Agriculture",
  skogsbruksdronare: "Forestry",
  "kartlaggnings-och-matdronare": "Surveying & Mapping",
  "transport-logistik": "Transport & Logistics",
  "last-och-transportdronare": "Transport & Logistics",
};
for (const r of results.filter((x) => x.group === "industry_solutions")) {
  const proj = APPLY ? r.post_apply_count : r.projected_count;
  lines.push(
    `| \`${r.handle}\` | ${industryLabels[r.handle] || r.label} | ${r.current_count ?? "—"} | **${proj}** | ${formatRuleSet(r.proposed_rules)} |`,
  );
}

lines.push("", "## E. Validation — remaining empty collections", "");
if (!empty.length) lines.push("_All in-scope collections projected to have products._");
else {
  lines.push("| Handle | Group | Current | Projected | Notes |", "|---|---|---:|---:|---|");
  for (const r of empty) {
    lines.push(`| \`${r.handle}\` | ${r.group} | ${r.current_count ?? 0} | 0 | ${esc(r.notes || "No catalog matches — review rules or add tags")} |`);
  }
}

lines.push("", "## F. Menu readiness", "", "| Menu | Item | Collection | Products | Status |", "|---|---|---|---:|---|");
for (const m of menuReadiness.filter((x) => x.in_phase3_scope).sort((a, b) => a.menu.localeCompare(b.menu))) {
  lines.push(`| \`${m.menu}\` | ${esc(m.title)} | \`${m.collection}\` | ${m.product_count ?? "—"} | ${m.status} |`);
}

lines.push("", "## Recommended next actions", "");
if (!APPLY) {
  lines.push("1. **Review** projected counts above — especially collections with 0 projected matches");
  lines.push("2. **Deploy rules** — `node scripts/phase3-populate-enterprise-collections.mjs --apply`");
  lines.push("3. **Tag gap** — products matching by title but missing tags won't appear in TYPE+TAG-only live rules until rules deploy");
  lines.push("4. **Public Safety** — no dedicated collection; `inspektionsdronare` serves interim menu link");
  lines.push("5. **FlyCart 100** — catalog has FlyCart 30 SKUs; rules include both until FlyCart 100 products arrive");
} else {
  lines.push("1. Re-run dry-run to confirm live counts match projection");
  lines.push("2. Tag high-value unmatched products (see empty collections)");
  lines.push("3. Consider expanded `enterprise-dr-nare` menu from Phase 2 nav spec");
}

lines.push("", "---", "", `Machine-readable: \`.phase3-population-audit.json\` | Rules: \`data/edp-phase3-population-rules.json\``, "");

writeFileSync(OUT_MD, lines.join("\n"));
console.log(`Wrote ${OUT_MD}`);
console.log(`Wrote ${OUT_JSON}`);
console.log(JSON.stringify({ populated: populated.length, empty: empty.length, mode: payload.mode }, null, 2));
