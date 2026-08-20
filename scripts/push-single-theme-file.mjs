#!/usr/bin/env node
/**
 * Push exactly one file from theme/ to a specific Shopify theme.
 * Used for targeted, minimal-blast-radius updates (e.g. adding one section
 * to the live theme) where the full push-edp-theme.mjs (which uploads the
 * entire theme/ directory) would be unsafe because theme/ has diverged from
 * the target theme's other files.
 *
 * Usage:
 *   node scripts/push-single-theme-file.mjs --theme-id=188345319752 --file=sections/main-order.liquid --execute
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const THEME_DIR = join(ROOT, "theme");
const SHOP = "ya1xhg-x6.myshopify.com";

const EXECUTE = process.argv.includes("--execute");
const themeArg = process.argv.find((a) => a.startsWith("--theme-id="));
const fileArg = process.argv.find((a) => a.startsWith("--file="));

if (!themeArg || !fileArg) {
  console.error("Usage: node scripts/push-single-theme-file.mjs --theme-id=<id> --file=<relative path> [--execute]");
  process.exit(1);
}

const THEME_GID = `gid://shopify/OnlineStoreTheme/${themeArg.split("=")[1]}`;
const FILENAME = fileArg.split("=")[1];

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

async function gql(query, variables = {}) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");

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
  if (!json.success || json.errors?.length) {
    throw new Error(JSON.stringify(json.errors || json));
  }
  return json.data;
}

async function main() {
  loadEnv();
  const full = join(THEME_DIR, FILENAME);
  if (!existsSync(full)) throw new Error(`Missing ${full}`);
  const content = readFileSync(full, "utf8");

  console.log(`# Single-file theme push`);
  console.log(`Store: ${SHOP}`);
  console.log(`Theme: ${THEME_GID}`);
  console.log(`File: ${FILENAME} (${content.length} bytes)`);
  console.log(`Mode: ${EXECUTE ? "EXECUTE" : "DRY-RUN"}\n`);

  if (!EXECUTE) {
    console.log("Run with --execute to upload.");
    return;
  }

  const data = await gql(
    `mutation($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
      themeFilesUpsert(themeId: $themeId, files: $files) {
        upsertedThemeFiles { filename }
        userErrors { field message }
      }
    }`,
    { themeId: THEME_GID, files: [{ filename: FILENAME, body: { type: "TEXT", value: content } }] },
  );

  const errs = data.themeFilesUpsert?.userErrors || [];
  if (errs.length) {
    console.error("Errors:", errs);
    process.exit(1);
  }
  console.log("Upserted:", data.themeFilesUpsert.upsertedThemeFiles);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
