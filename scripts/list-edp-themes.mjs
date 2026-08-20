#!/usr/bin/env node
/**
 * Read-only: list Shopify themes on the EDP store with their numeric ID and
 * role (MAIN = live, UNPUBLISHED = preview/draft). Makes no changes.
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
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

async function gql(query, variables = {}) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
  if (!json.success) throw new Error(JSON.stringify(json.errors || json));
  return json.data;
}

async function main() {
  loadEnv();
  const themes = await gql("{ themes(first: 20) { nodes { id name role updatedAt } } }");

  console.log(`Store: ${SHOP}\n`);
  console.log("Theme                                    | Numeric ID   | Role         | Updated");
  console.log("------------------------------------------------------------------------------------");
  for (const t of themes.themes.nodes) {
    const id = t.id.split("/").pop();
    const mark = t.role === "MAIN" ? "  <- LIVE" : t.role === "UNPUBLISHED" ? "  <- preview/draft" : "";
    console.log(`${t.name.padEnd(40)} | ${id.padEnd(12)} | ${t.role.padEnd(12)} | ${t.updatedAt}${mark}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
