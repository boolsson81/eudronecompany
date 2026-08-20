#!/usr/bin/env node
/**
 * Read-only token mismatch probe for EUDroneParts clone verification.
 * Calls production edge functions and prints fingerprint / probe summary.
 */
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadDotEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let value = t.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function post(path, body = {}) {
  const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const r = await fetch(`${URL}/functions/v1/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
      apikey: KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  try {
    return { status: r.status, json: JSON.parse(text) };
  } catch {
    return { status: r.status, json: { raw: text.slice(0, 500) } };
  }
}

async function main() {
  loadDotEnv();
  const [setToken, testToken, bindingProbe] = await Promise.all([
    post("eudroneparts-set-token"),
    post("test-shopify-token", {}),
    post("eudroneparts-token-binding-probe"),
  ]);

  console.log(JSON.stringify({
    generated_at: new Date().toISOString(),
    eudroneparts_set_token: setToken,
    test_shopify_token: testToken,
    token_binding_probe: bindingProbe,
  }, null, 2));
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
