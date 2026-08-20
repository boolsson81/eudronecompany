#!/usr/bin/env node
/**
 * Apply approved EuroDroneParts menu structure + delete orphan menus.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".menu-structure-execution.json");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const MID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";
const STORE = "ya1xhg-x6.myshopify.com";
const DRY_RUN = process.argv.includes("--dry-run");

const KEEP_MENUS = new Set([
  "main-menu",
  "meny",
  "footer",
  "enterprise-dr-nare",
  "customer-account-main-menu",
]);

const DELETE_MENU_PATTERNS = [
  /^partnership(-\d+)?$/,
  /^actionkameror(-\d+)?$/,
  /^dronare(-\d+)?$/,
];

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

function item(title, url, children = []) {
  const node = { title, type: "HTTP", url };
  if (children.length) node.items = children;
  return node;
}

const MAIN_MENU_ITEMS = [
  item("Drönare", "/collections/dji-dronare", [
    item("DJI Mini", "/collections/dji-mini-4-serien"),
    item("DJI Air", "/collections/dji-air-serien"),
    item("DJI Mavic", "/collections/dji-mavic-serien"),
    item("DJI Avata", "/collections/dji-avata-serien"),
    item("DJI Neo", "/collections/dji-neo"),
    item("DJI Flip", "/collections/dji-flip-dronare"),
    item("Alla konsumentdrönare", "/collections/dji-dronare"),
  ]),
  item("Enterprise Drönare", "/collections/enterprise-dronare", [
    item("Enterprise översikt", "/collections/enterprise-dronare"),
    item("DJI Matrice", "/collections/dji-matrice-serien"),
    item("Mavic Enterprise", "/collections/dji-mavic-serien-enterprise"),
    item("DJI Agras", "/collections/dji-agras-dronare"),
    item("Sensors & Payloads", "/collections/enterprise-sensorer"),
    item("Enterprise tillbehör", "/collections/enterprise-tillbehor"),
  ]),
  item("FlyCart", "/collections/dji-flycart-serien", [
    item("FlyCart 100", "/collections/dji-flycart-100-lastdronare"),
    item("FlyCart serie", "/collections/dji-flycart-serien"),
  ]),
  item("Branschlösningar", "/collections/inspektionsdronare", [
    item("Inspektion", "/collections/inspektionsdronare"),
    item("Energi & Infrastruktur", "/collections/energi-infrastruktur"),
    item("Jordbruk", "/collections/jordbruksdronare"),
    item("Skogsbruk", "/collections/skogsbruksdronare"),
    item("Kartläggning", "/collections/kartlaggnings-och-matdronare"),
    item("Transport & Logistik", "/collections/transport-logistik"),
  ]),
  item("Reservdelar", "/collections/dji-dronar-reservdelar", [
    item("Gimbal & motorer", "/collections/reservdelar-gimbal-dronare-motorer"),
    item("Elektronik & flight components", "/collections/dronarelektronik-flight-components"),
    item("Neo reservdelar", "/collections/reparation-dji-neo-reservdelar"),
  ]),
  item("Tillbehör", "/collections/dronartillbehor-kop", [
    item("Propellrar", "/collections/dronare-propeller-tillbehor"),
    item("Filter", "/collections/filter-till-dronare"),
    item("Batterier", "/collections/batterier"),
    item("Väskor & cases", "/collections/dronarryggsack-vaskor"),
    item("Fjärrkontroller", "/collections/fjarrkontroll-dronare"),
    item("PolarPro", "/collections/polarpro"),
  ]),
  item("Legacy DJI", "/collections/dji-phantom-3-se", [
    item("Phantom", "/collections/dji-phantom-3-se"),
    item("Air 2 / Air 2S", "/collections/dji-air-2-serien"),
    item("Mini 2", "/collections/tillbehor-dji-mini-2-2-se"),
    item("Mavic 2", "/collections/dji-mavic-2-serien"),
  ]),
];

const ENTERPRISE_MENU_ITEMS = [
  item("Enterprise drönare", "/collections/enterprise-dronare"),
  item("Matrice", "/collections/dji-matrice-serien"),
  item("Mavic Enterprise", "/collections/dji-mavic-3-enterprise"),
  item("Agras", "/collections/dji-agras-dronare"),
  item("FlyCart", "/collections/dji-flycart-serien"),
  item("Värmekamera", "/collections/dronare-med-varmekamera"),
  item("Airdrop", "/collections/airdrop-system"),
];

const FOOTER_ITEMS = [item("Alla produkter", "/collections/alla-produkter")];

async function fetchMenus() {
  const all = [];
  let cursor = null;
  for (let p = 0; p < 30; p++) {
    const data = await gql(
      `query($cursor: String) {
        menus(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id handle title }
        }
      }`,
      { cursor },
    );
    all.push(...(data?.menus?.nodes || []));
    if (!data?.menus?.pageInfo?.hasNextPage) break;
    cursor = data.menus.pageInfo.endCursor;
  }
  return all;
}

async function updateMenu(handle, title, items) {
  const menus = await fetchMenus();
  const menu = menus.find((m) => m.handle === handle);
  if (!menu) return { handle, result: "not_found" };
  if (DRY_RUN) return { handle, id: menu.id, result: "would_update", item_count: items.length };
  const data = await gql(
    `mutation($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
      menuUpdate(id: $id, title: $title, items: $items) {
        menu { id handle }
        userErrors { field message }
      }
    }`,
    { id: menu.id, title, items },
  );
  const errs = data?.menuUpdate?.userErrors || [];
  return { handle, id: menu.id, result: errs.length ? "failed" : "updated", errors: errs };
}

async function deleteMenu(handle) {
  const menus = await fetchMenus();
  const menu = menus.find((m) => m.handle === handle);
  if (!menu) return { handle, result: "not_found" };
  if (DRY_RUN) return { handle, id: menu.id, result: "would_delete" };
  const data = await gql(
    `mutation($id: ID!) {
      menuDelete(id: $id) { deletedMenuId userErrors { field message } }
    }`,
    { id: menu.id },
  );
  const errs = data?.menuDelete?.userErrors || [];
  return { handle, result: errs.length ? "failed" : "deleted", errors: errs };
}

function shouldDeleteMenu(handle) {
  if (KEEP_MENUS.has(handle)) return false;
  return DELETE_MENU_PATTERNS.some((re) => re.test(handle));
}

loadEnv();
console.log(DRY_RUN ? "DRY RUN" : "LIVE", "— menu structure");

const results = {
  generated_at: new Date().toISOString(),
  mode: DRY_RUN ? "dry_run" : "live",
  updates: [],
  deletes: [],
};

for (const [handle, title, items] of [
  ["main-menu", "Huvudmeny", MAIN_MENU_ITEMS],
  ["enterprise-dr-nare", "Enterprise Drönare", ENTERPRISE_MENU_ITEMS],
  ["footer", "Sidfotsmeny", FOOTER_ITEMS],
]) {
  console.log(`Update menu: ${handle}`);
  const res = await updateMenu(handle, title, items);
  results.updates.push(res);
}

const allMenus = await fetchMenus();
for (const m of allMenus) {
  if (!shouldDeleteMenu(m.handle)) continue;
  console.log(`Delete orphan menu: ${m.handle}`);
  const res = await deleteMenu(m.handle);
  results.deletes.push(res);
  await new Promise((ok) => setTimeout(ok, 300));
}

writeFileSync(OUT, JSON.stringify(results, null, 2));
console.log(`Wrote ${OUT}`);
