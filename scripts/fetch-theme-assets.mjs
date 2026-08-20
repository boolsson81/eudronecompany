#!/usr/bin/env node
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATION_ID = "3d9876af-885c-49e9-a4b0-c4943c06112f";
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";

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

function apiKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );
}

async function post(fn, body) {
  const key = apiKey();
  const r = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify(body),
  });
  return { status: r.status, json: await r.json().catch(() => ({})) };
}

async function shopifyRest(path, method = "GET", body) {
  const { status, json } = await post("test-integration", {
    integration_type: "shopify",
    config: { store_domain: "ya1xhg-x6.myshopify.com", access_token: "***configured***" },
    shopify_rest: { method, path, body },
  });
  if (!json?.data && json?.error) throw new Error(json.error);
  return json.data ?? json;
}

async function main() {
  loadEnv();
  const outDir = join(ROOT, ".theme-live");
  mkdirSync(outDir, { recursive: true });

  const themes = (await shopifyRest("themes.json")).themes || [];
  const main = themes.find((t) => t.role === "main") || themes[0];
  console.log("theme", main.id, main.name);

  const assets = (await shopifyRest(`themes/${main.id}/assets.json`)).assets || [];
  const keys = assets
    .map((a) => a.key)
    .filter(
      (k) =>
        k.includes("header") ||
        k.includes("menu") ||
        k.includes("drawer") ||
        k.includes("footer-group") ||
        k === "config/settings_data.json",
    );
  console.log("matching assets", keys.length);

  for (const key of keys) {
    const data = await shopifyRest(`themes/${main.id}/assets.json?asset[key]=${encodeURIComponent(key)}`);
    const val = data?.asset?.value || "";
    const safe = key.replace(/\//g, "__");
    writeFileSync(join(outDir, safe), val);
    console.log("wrote", key, val.length);
  }

  writeFileSync(join(outDir, "_theme-meta.json"), JSON.stringify({ theme_id: main.id, keys }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
