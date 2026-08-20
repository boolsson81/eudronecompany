#!/usr/bin/env node
/**
 * Turn on the AI chat widget in a theme's settings_data.json on the
 * EuroDroneParts/European Drone Company Shopify store, via the same
 * test-integration REST proxy push-edp-theme.mjs uses.
 *
 * Usage:
 *   node scripts/configure-edp-ai-chat.mjs --theme-id=186020200776 --widget-key=<key>              # dry-run
 *   node scripts/configure-edp-ai-chat.mjs --theme-id=186020200776 --widget-key=<key> --execute
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOP = "ya1xhg-x6.myshopify.com";
const ASSET_KEY = "config/settings_data.json";

const EXECUTE = process.argv.includes("--execute");
const themeArg = process.argv.find((a) => a.startsWith("--theme-id="));
const keyArg = process.argv.find((a) => a.startsWith("--widget-key="));
const themeNumericId = themeArg?.split("=")[1];
const widgetKey = keyArg?.split("=")[1];
if (!themeNumericId) throw new Error("Missing required --theme-id=<numeric id>");
if (!widgetKey) throw new Error("Missing required --widget-key=<key>");

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

async function proxy(body) {
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
    body: JSON.stringify(body),
  });
  const json = await r.json();
  if (!json.success) throw new Error(JSON.stringify(json));
  return json.data;
}

async function main() {
  loadEnv();

  console.log(`# EuroDroneParts AI chat config\n`);
  console.log(`Store: ${SHOP}`);
  console.log(`Theme: ${themeNumericId}`);
  console.log(`Mode: ${EXECUTE ? "EXECUTE" : "DRY-RUN"}\n`);

  // proxy() already unwraps to the Shopify response body (and throws if
  // Shopify returned a non-2xx status), so this is `{ asset: {...} }` directly.
  const getRes = await proxy({
    integration_type: "shopify",
    config: { store_domain: SHOP, access_token: "***configured***" },
    shopify_rest: { method: "GET", path: `themes/${themeNumericId}/assets.json?asset[key]=${encodeURIComponent(ASSET_KEY)}` },
  });

  const settings = JSON.parse(getRes.asset.value);
  // "current" is either an overrides object, or the literal string "Default"
  // meaning "no overrides yet, use presets.Default as-is". Setting a property
  // directly on that string would throw, and replacing it with {} would drop
  // every other setting the Default preset provides - so materialize it from
  // the preset first, then layer our keys on top.
  if (typeof settings.current === "string") {
    const presetName = settings.current;
    settings.current = { ...(settings.presets?.[presetName] ?? {}) };
  }
  const before = {
    ai_chat_enabled: settings.current.ai_chat_enabled,
    ai_chat_widget_key: settings.current.ai_chat_widget_key,
  };

  settings.current.ai_chat_enabled = true;
  settings.current.ai_chat_widget_key = widgetKey;
  if (!settings.current.ai_chat_widget_url) {
    settings.current.ai_chat_widget_url = `${process.env.SUPABASE_URL}/functions/v1/storefront-widget`;
  }

  console.log("Before:", before);
  console.log("After: ", {
    ai_chat_enabled: settings.current.ai_chat_enabled,
    ai_chat_widget_key: settings.current.ai_chat_widget_key,
    ai_chat_widget_url: settings.current.ai_chat_widget_url,
  });

  if (!EXECUTE) {
    console.log("\nDry-run only. Re-run with --execute to write the asset.");
    return;
  }

  await proxy({
    integration_type: "shopify",
    config: { store_domain: SHOP, access_token: "***configured***" },
    shopify_rest: {
      method: "PUT",
      path: "themes/" + themeNumericId + "/assets.json",
      body: { asset: { key: ASSET_KEY, value: JSON.stringify(settings, null, 2) } },
    },
  });

  console.log("\n✅ ai_chat_enabled + ai_chat_widget_key written to theme settings_data.json");
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
