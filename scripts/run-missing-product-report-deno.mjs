#!/usr/bin/env node
/**
 * Run missing product_type report via Deno + shared edge modules.
 * Requires SUPABASE_SERVICE_ROLE_KEY.
 */
import { spawnSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

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
loadEnv();

const code = `
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildMissingProductTypeReport } from "../supabase/functions/_shared/missing-product-type-report.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const shopId = Deno.env.get("SHOP_ID") ?? "010120e6-6def-431e-8614-905cb69f85b9";
const report = await buildMissingProductTypeReport(supabase, shopId);
console.log(JSON.stringify(report));
`;

const r = spawnSync(
  "deno",
  ["eval", "--allow-net", "--allow-env", "--allow-read", code],
  {
    cwd: ROOT,
    env: { ...process.env },
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  },
);

if (r.status !== 0) {
  console.error(r.stderr || r.stdout);
  process.exit(r.status || 1);
}

process.stdout.write(r.stdout);
