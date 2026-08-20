#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MID = "3d9876af-885c-49e9-a4b0-c4943c06112f";

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

async function post(base, path, body) {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const r = await fetch(`${base}/functions/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  return { status: r.status, json: text ? JSON.parse(text) : {} };
}

async function main() {
  loadEnv();
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const CANONICAL = "https://wsncjdajweoujhidlxas.supabase.co";
  const bases = [
    ["canonical", process.env.SUPABASE_URL || process.env.CLONER_SUPABASE_URL || CANONICAL],
  ];

  for (const [label, base] of bases) {
    console.log(`\n=== ${label} ${base} ===`);
    const pages = await post(base, "menu-dependency-pages", { migration_id: MID, dry_run: true });
    console.log("menu-dependency-pages", pages.status, pages.json.ok, pages.json.error || pages.json.summary);

    const workerPages = await post(base, "shopify-cloner-worker", {
      action: "publish_menu_dependency_pages",
      migration_id: MID,
      dry_run: true,
    });
    console.log("worker publish_menu_dependency_pages", workerPages.status, workerPages.json.ok, workerPages.json.error || workerPages.json.summary);

    const fix = await post(base, "cloner-fix-collections-and-menus", {
      migration_id: MID,
      dry_run: true,
      skip_collections: true,
      publish_menu_pages: true,
      menus_only: true,
    });
    console.log("cloner-fix menus_only", fix.status, fix.json.menu_pages?.summary, fix.json.menus?.summary);
  }
}

main().catch(console.error);
