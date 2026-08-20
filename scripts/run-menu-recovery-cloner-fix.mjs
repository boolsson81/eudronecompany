#!/usr/bin/env node
/** Menu recovery via cloner-fix on data project (has dronare→dji-dronare remap). */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";

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

async function main() {
  loadEnv();
  const dryRun = process.argv.includes("--dry-run");
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const url = process.env.SUPABASE_URL;
  const r = await fetch(`${url}/functions/v1/cloner-fix-collections-and-menus`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify({
      migration_id: MID,
      dry_run: dryRun,
      skip_collections: true,
      menus_only: true,
      include_audit: false,
    }),
  });
  const j = await r.json();
  writeFileSync(join(ROOT, "menu-cloner-fix-result.json"), JSON.stringify(j, null, 2));
  console.log(JSON.stringify(j.menus?.summary, null, 2));
  for (const m of j.menus?.menus || []) {
    console.log(m.menu_handle, m.publish_result, m.error?.slice?.(0, 80) || "");
  }
}

main().catch(console.error);
