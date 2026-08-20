#!/usr/bin/env node
/**
 * Execute approved EuroDroneParts collection cleanup:
 * - 301 redirects (merge + 6 deletes)
 * - Delete 6 orphan collections + merge source
 * - Keep 4 SEO landing pages (no delete, no redirect)
 * Does NOT modify products.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".collection-cleanup-execution.json");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const MID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";
const STORE = "ya1xhg-x6.myshopify.com";
const DRY_RUN = process.argv.includes("--dry-run");

/** Approved deletes — excludes user-modified SEO keepers */
const DELETE_HANDLES = [
  "dji-air-3-serien",
  "dji-avata",
  "dji-mini-3-pro-dronare-set",
  "gopro-batterier",
  "osmo-action-6-tillbehor",
  "ringlampa",
];

const MERGE_SOURCE = "dji-mavic-3-classic-1";

const KEEP_SEO = new Set([
  "dronare-reservdelar-ovriga",
  "ji-mini-5-pro-filter",
  "minneskort-lagring",
  "kamerastativ-tripod",
]);

const REDIRECTS = [
  { from: "dji-mavic-3-classic-1", to: "dji-mavic-3-classic", reason: "MERGE" },
  { from: "dji-air-3-serien", to: "dij-air-3-serien", reason: "DELETE → active Air 3 hub" },
  { from: "dji-avata", to: "dji-avata-serien", reason: "DELETE → active Avata hub" },
  { from: "dji-mini-3-pro-dronare-set", to: "dji-mini-3-serien", reason: "DELETE → Mini 3 hub" },
  { from: "gopro-batterier", to: "gopro-tillbehor-vendors", reason: "DELETE → GoPro accessories" },
  { from: "osmo-action-6-tillbehor", to: "alla-produkter", reason: "DELETE → catalog" },
  { from: "ringlampa", to: "belysning-till-dronare", reason: "DELETE → drone lighting" },
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

async function fetchCollectionId(handle) {
  const data = await gql(
    `query($h: String!) { collectionByHandle(handle: $h) { id handle title } }`,
    { h: handle },
  );
  return data?.collectionByHandle || null;
}

async function createRedirect(fromHandle, toHandle) {
  const path = `/collections/${fromHandle}`;
  const target = `/collections/${toHandle}`;
  if (DRY_RUN) return { path, target, result: "would_create" };
  const data = await gql(
    `mutation($urlRedirect: UrlRedirectInput!) {
      urlRedirectCreate(urlRedirect: $urlRedirect) {
        urlRedirect { id path target }
        userErrors { field message }
      }
    }`,
    { urlRedirect: { path, target } },
  );
  const errs = data?.urlRedirectCreate?.userErrors || [];
  const taken = errs.some((e) => /already been taken/i.test(e.message));
  return {
    path,
    target,
    result: taken ? "already_exists" : errs.length ? "failed" : "created",
    errors: errs,
    id: data?.urlRedirectCreate?.urlRedirect?.id,
  };
}

async function deleteCollection(handle) {
  const col = await fetchCollectionId(handle);
  if (!col?.id) return { handle, result: "not_found" };
  if (DRY_RUN) return { handle, id: col.id, result: "would_delete" };
  const data = await gql(
    `mutation($input: CollectionDeleteInput!) {
      collectionDelete(input: $input) {
        deletedCollectionId
        userErrors { field message }
      }
    }`,
    { input: { id: col.id } },
  );
  const errs = data?.collectionDelete?.userErrors || [];
  return {
    handle,
    id: col.id,
    result: errs.length ? "failed" : "deleted",
    errors: errs,
    deletedId: data?.collectionDelete?.deletedCollectionId,
  };
}

loadEnv();

console.log(DRY_RUN ? "DRY RUN" : "LIVE", "— EuroDroneParts collection cleanup");

const results = {
  generated_at: new Date().toISOString(),
  mode: DRY_RUN ? "dry_run" : "live",
  kept_seo_handles: [...KEEP_SEO],
  redirects: [],
  deletes: [],
};

for (const r of REDIRECTS) {
  console.log(`Redirect: ${r.from} → ${r.to}`);
  const res = await createRedirect(r.from, r.to);
  results.redirects.push({ ...r, ...res });
  await new Promise((ok) => setTimeout(ok, 300));
}

const toDelete = [...DELETE_HANDLES, MERGE_SOURCE];
for (const h of toDelete) {
  if (KEEP_SEO.has(h)) {
    console.log(`SKIP delete (SEO keep): ${h}`);
    continue;
  }
  console.log(`Delete: ${h}`);
  const res = await deleteCollection(h);
  results.deletes.push(res);
  await new Promise((ok) => setTimeout(ok, 400));
}

writeFileSync(OUT, JSON.stringify(results, null, 2));
console.log(`Wrote ${OUT}`);
console.log(JSON.stringify({
  redirects: results.redirects.length,
  deleted: results.deletes.filter((d) => d.result === "deleted").length,
  failed: [...results.redirects, ...results.deletes].filter((x) => x.result === "failed").length,
}, null, 2));
