#!/usr/bin/env node
/**
 * Publish a theme on the EuroDroneParts Shopify store — makes it the live
 * (MAIN) theme every storefront visitor sees. Uses the same test-integration
 * edge function proxy as push-edp-theme.mjs, authenticated as service role.
 *
 * Usage:
 *   node scripts/publish-edp-theme.mjs --theme-id=186020200776              # dry-run
 *   node scripts/publish-edp-theme.mjs --theme-id=186020200776 --execute    # actually publish
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOP = "ya1xhg-x6.myshopify.com";

const EXECUTE = process.argv.includes("--execute");
const themeArg = process.argv.find((a) => a.startsWith("--theme-id="));
const themeNumericId = themeArg?.split("=")[1];
if (!themeNumericId) {
  console.error("Missing required --theme-id=<numeric id>");
  process.exit(1);
}
const THEME_GID = `gid://shopify/OnlineStoreTheme/${themeNumericId}`;

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
  // test-integration's requireAuth() only accepts a real user session JWT or
  // an exact match against SUPABASE_SERVICE_ROLE_KEY (see requireAuth.ts).
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

  console.log(`# EuroDroneParts theme publish\n`);
  console.log(`Store: ${SHOP}`);
  console.log(`Target theme: ${THEME_GID}`);
  console.log(`Mode: ${EXECUTE ? "EXECUTE" : "DRY-RUN"}\n`);

  const before = await gql(`
    query {
      themes(first: 20) {
        nodes { id name role }
      }
    }
  `);
  const currentMain = before.themes.nodes.find((t) => t.role === "MAIN");
  const target = before.themes.nodes.find((t) => t.id === THEME_GID);
  if (!target) throw new Error(`Theme ${THEME_GID} not found on store`);

  console.log(`Currently live: ${currentMain ? `${currentMain.name} (${currentMain.id})` : "unknown"}`);
  console.log(`Publishing:     ${target.name} (${target.id}, role=${target.role})\n`);

  if (target.role === "MAIN") {
    console.log("Target is already the live theme. Nothing to do.");
    return;
  }

  if (!EXECUTE) {
    console.log("Dry-run only. Re-run with --execute to actually publish.");
    return;
  }

  const result = await gql(
    `
    mutation themePublish($id: ID!) {
      themePublish(id: $id) {
        theme { id name role }
        userErrors { field message }
      }
    }
  `,
    { id: THEME_GID },
  );

  const errors = result.themePublish?.userErrors ?? [];
  if (errors.length > 0) {
    throw new Error(`themePublish userErrors: ${JSON.stringify(errors)}`);
  }

  const published = result.themePublish?.theme;
  console.log(`✅ Published: ${published?.name} (${published?.id}, role=${published?.role})`);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
