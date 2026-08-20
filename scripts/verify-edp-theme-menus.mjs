#!/usr/bin/env node
/**
 * Lists Shopify menus on EuroDroneParts and checks theme wiring handles.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/verify-edp-theme-menus.mjs
 *
 * Requires a valid OAuth token in shopify_app_installations for ya1xhg-x6.myshopify.com
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOP = "ya1xhg-x6.myshopify.com";
const API_VERSION = "2025-07";

const EXPECTED = {
  menu_consumer_handle: ["main-menu"],
  menu_enterprise_handle: ["enterprise", "enterprise-drones", "enterprise-expansion-deploy"],
  footer: ["footer"],
};

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

async function shopifyGraphql(query) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
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
      shopify_graphql: { query },
    }),
  });
  const json = await r.json();
  if (!json.success) throw new Error(JSON.stringify(json.errors || json));
  return json.data;
}

function readHeaderGroup() {
  const p = join(ROOT, "theme/sections/header-group.json");
  if (!existsSync(p)) return null;
  const j = JSON.parse(readFileSync(p, "utf8"));
  const h = j.sections?.header?.settings || {};
  return { menu_consumer_handle: h.menu_consumer, menu_enterprise_handle: h.menu_enterprise };
}

async function main() {
  loadEnv();
  const wired = readHeaderGroup();

  console.log("# EuroDroneParts — Menu handle verification\n");
  console.log(`Store: ${SHOP}\n`);

  if (wired) {
    console.log("## Theme wiring (header-group.json)");
    console.log(`- menu_consumer_handle: \`${wired.menu_consumer_handle}\``);
    console.log(`- menu_enterprise_handle: \`${wired.menu_enterprise_handle}\`\n`);
  }

  let data;
  try {
    data = await shopifyGraphql("{ menus(first: 50) { nodes { handle title } } }");
  } catch (e) {
    console.error(`❌ Shopify API failed: ${e.message}`);
    console.error("Re-auth: …/shopify-app-install?shop=ya1xhg-x6.myshopify.com\n");
    process.exit(1);
  }

  const menus = data?.menus?.nodes || [];
  const handles = new Set(menus.map((m) => m.handle));

  console.log("## Live menus\n");
  for (const m of menus) {
    console.log(`- \`${m.handle}\` — ${m.title}`);
  }

  console.log("\n## Wiring check\n");
  let ok = true;
  for (const [role, candidates] of Object.entries(EXPECTED)) {
    const configured = role === "footer" ? "footer" : wired?.[role];
    const match = candidates.includes(configured) && handles.has(configured);
    const alt = candidates.find((h) => handles.has(h));
    const status = match ? "✅" : alt ? "⚠️" : "❌";
    if (!match) ok = false;
    console.log(
      `${status} ${role}: configured=\`${configured}\` live=${alt ? `\`${alt}\`` : "missing"} (accepted: ${candidates.join(", ")})`,
    );
    if (!match && alt && wired) {
      console.log(`   → Update header-group.json: "${role.replace("menu_", "menu_")}" → "${alt}"`);
    }
  }

  process.exit(ok ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
