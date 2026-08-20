#!/usr/bin/env node
/**
 * Apply SEO metadata to hierarchy hub collections (no handle/URL changes).
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SEO = join(ROOT, "data/edp-hierarchy-seo.json");
const OUT = join(ROOT, ".collection-seo-execution.json");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const STORE = "ya1xhg-x6.myshopify.com";
const DRY_RUN = process.argv.includes("--dry-run");

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

loadEnv();

const meta = JSON.parse(readFileSync(SEO, "utf8"));
const all = Object.assign({}, ...Object.values(meta));

const results = { generated_at: new Date().toISOString(), mode: DRY_RUN ? "dry_run" : "live", updates: [] };

for (const [handle, seo] of Object.entries(all)) {
  const col = await gql(`query($h: String!) { collectionByHandle(handle: $h) { id handle } }`, { h: handle });
  if (!col?.collectionByHandle?.id) {
    results.updates.push({ handle, result: "not_found" });
    continue;
  }
  if (DRY_RUN) {
    results.updates.push({ handle, result: "would_update" });
    continue;
  }
  const data = await gql(
    `mutation($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { id handle updatedAt }
        userErrors { field message }
      }
    }`,
    {
      input: {
        id: col.collectionByHandle.id,
        descriptionHtml: seo.descriptionHtml,
        seo: { title: seo.seoTitle, description: seo.seoDescription },
      },
    },
  );
  const errs = data?.collectionUpdate?.userErrors || [];
  results.updates.push({ handle, result: errs.length ? "failed" : "updated", errors: errs });
  await new Promise((ok) => setTimeout(ok, 350));
}

writeFileSync(OUT, JSON.stringify(results, null, 2));
console.log(`Wrote ${OUT} — ${results.updates.filter((u) => u.result === "updated").length} updated`);
