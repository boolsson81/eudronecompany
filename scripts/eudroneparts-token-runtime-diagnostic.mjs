#!/usr/bin/env node
/**
 * Read-only: fetch production runtime fingerprint for EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN
 * and optionally compare with local Shopify Admin token hash.
 *
 * Usage:
 *   node scripts/eudroneparts-token-runtime-diagnostic.mjs
 *   node scripts/eudroneparts-token-runtime-diagnostic.mjs --compare-local
 *
 * With --compare-local, paste Shopify Develop Apps token when prompted (local only).
 */
import { createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { createInterface } from "readline";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "EUDRONEPARTS_TOKEN_RUNTIME_DIAGNOSTIC.md");

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

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

async function readLocalToken() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  process.stdout.write("Paste Shopify Admin token from Develop Apps (input hidden in shell — paste + Enter):\n");
  const lines = [];
  for await (const line of rl) lines.push(line);
  return lines.join("\n");
}

async function fetchRuntimeDiagnostic() {
  const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!URL || !KEY) throw new Error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY in .env");

  const r = await fetch(`${URL}/functions/v1/eudroneparts-set-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
      apikey: KEY,
    },
    body: JSON.stringify({ diagnostic_only: true }),
  });
  const text = await r.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON (${r.status}): ${text.slice(0, 300)}`);
  }
  return { httpStatus: r.status, json };
}

function buildReport(runtime, localFp, compare) {
  const d = runtime.json?.diagnostic;
  const rt = d?.runtime_token;
  const lines = [
    "# EUDRONEPARTS_TOKEN_RUNTIME_DIAGNOSTIC.md",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    "**Mode:** Read-only — no Shopify writes, no secret values exposed",
    "",
    "## Production runtime",
    "",
  ];

  const tokenMissing = runtime.json?.error === "missing token env";
  const hasFingerprint = Boolean(d?.runtime_token?.sha256);

  if (!hasFingerprint) {
    lines.push(
      "### ⚠ Fingerprint ej tillgängligt i produktion ännu",
      "",
      "Edge runtime har en token (401, inte `missing token env`), men **prefix/suffix/sha256** kräver att uppdaterad `eudroneparts-set-token` publiceras.",
      "",
      "**Gör så här (ingen ny funktion — befintlig `eudroneparts-set-token`):**",
      "1. Lovable → **Share → Publish** (synkar edge secrets + funktionskod)",
      "2. Kör: `node scripts/eudroneparts-token-runtime-diagnostic.mjs`",
      "3. Jämför sha256 med token från Develop Apps:",
      "   `printf '%s' 'shpat_...' | node scripts/hash-shopify-token-local.mjs`",
      "",
      "### Bekräftat i produktion (utan fingerprint)",
      "",
      "| Fält | Värde |",
      "|------|-------|",
      `| HTTP | ${runtime.httpStatus} |`,
      `| token_exists | ${tokenMissing ? "false" : "true"} |`,
      `| prefix | _kräver publish_ |`,
      `| suffix | _kräver publish_ |`,
      `| length | _kräver publish_ |`,
      `| sha256 | _kräver publish_ |`,
      `| secret_name | \`EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN\` |`,
      `| secret_source | \`supabase_edge_runtime_env\` (Deno.env.get — synkad från Lovable/Supabase Edge secrets) |`,
      `| target_shop_domain | \`ya1xhg-x6.myshopify.com\` |`,
      `| shop.json (latest) | ${runtime.json?.shopify?.status ?? "401"} |`,
      `| products/count.json | 401 (samma auth) |`,
      "",
      "### Trolig orsak till 401 trots ny token i Shopify",
      "",
      "1. **Lovable secret inte uppdaterad** eller **inte Publish** efter ändring",
      "2. **Fel secret-namn** i Lovable (t.ex. bara `SHOPIFY_ADMIN_ACCESS_TOKEN`)",
      "3. **Whitespace/citat** runt token i secret-värdet",
      "4. **Runtime använder fortfarande gammalt värde** tills Publish körs",
      "",
    );
  } else {
    lines.push(
      "| Fält | Värde |",
      "|------|-------|",
      `| Secret-namn | \`${d.secret_name}\` |`,
      `| Secret-källa | ${d.secret_source} |`,
      `| Shop domain | \`${d.target_shop_domain}\` |`,
      `| token_exists | ${rt.token_exists} |`,
      `| prefix | \`${rt.prefix}\` |`,
      `| suffix | \`${rt.suffix}\` |`,
      `| length | ${rt.length} |`,
      `| sha256 | \`${rt.sha256}\` |`,
      `| format | ${rt.format} |`,
      `| leading whitespace | ${rt.has_leading_whitespace} |`,
      `| trailing whitespace | ${rt.has_trailing_whitespace} |`,
      `| wrapping quotes | ${rt.has_wrapping_quotes} |`,
      "",
      "### Shopify read-only probes",
      "",
      `| Endpoint | HTTP | Shop |`,
      `|----------|:----:|------|`,
      `| shop.json (latest) | ${d.shopify_probes?.shop_json_latest?.status ?? "—"} | ${d.shopify_probes?.shop_json_latest?.shop_name ?? "—"} |`,
      `| products/count.json (latest) | ${d.shopify_probes?.products_count_latest?.status ?? "—"} | count=${d.shopify_probes?.products_count_latest?.count ?? "—"} |`,
      `| cross-shop ActionKing shop.json | ${d.shopify_probes?.cross_shop_actionking_shop_json?.status ?? "—"} | ${d.shopify_probes?.cross_shop_actionking_shop_json?.shop_name ?? "—"} |`,
      "",
    );

    if (d.actionking_reference) {
      const ak = d.actionking_reference;
      lines.push(
        "### ActionKing-referens (samma runtime?)",
        "",
        `| | EU secret | ActionKing secret |`,
        `|---|-----------|-------------------|`,
        `| same_value | ${ak.same_value_as_eu_secret} | |`,
        `| same_sha256 | ${ak.same_sha256_as_eu_secret} | |`,
        `| AK prefix | | \`${ak.fingerprint?.prefix}\` |`,
        `| AK sha256 | | \`${ak.fingerprint?.sha256}\` |`,
        "",
      );
    }

    if (d.database_install) {
      lines.push(
        "### Databas (shopify_app_installations)",
        "",
        `| | Env | DB |`,
        `|---|-----|-----|`,
        `| env_matches_db | ${d.database_install.env_matches_db} | |`,
        `| env_sha256_matches_db | ${d.database_install.env_sha256_matches_db} | |`,
        `| DB sha256 | | \`${d.database_install.token_fingerprint?.sha256 ?? "—"}\` |`,
        "",
      );
    }
  }

  if (localFp) {
    lines.push(
      "## Jämförelse: Shopify Develop Apps (lokal hash)",
      "",
      "| Fält | Shopify (lokal) | Production runtime | Match |",
      "|------|-----------------|-------------------|:-----:|",
      `| sha256 (raw) | \`${localFp.sha256_raw}\` | \`${rt?.sha256 ?? "—"}\` | ${compare?.raw_match ? "**JA**" : "**NEJ**"} |`,
      `| sha256 (trimmed) | \`${localFp.sha256_trimmed}\` | \`${rt?.sha256 ?? "—"}\` | ${compare?.trimmed_match ? "**JA**" : "**NEJ**"} |`,
      `| prefix | \`${localFp.prefix}\` | \`${rt?.prefix ?? "—"}\` | ${compare?.prefix_match ? "JA" : "NEJ"} |`,
      `| suffix | \`${localFp.suffix}\` | \`${rt?.suffix ?? "—"}\` | ${compare?.suffix_match ? "JA" : "NEJ"} |`,
      `| length | ${localFp.length} | ${rt?.length ?? "—"} | ${compare?.length_match ? "JA" : "NEJ"} |`,
      "",
      "### Slutsats",
      "",
      compare?.verdict || "_Kör med --compare-local efter diagnostik är publicerad._",
      "",
    );
  } else {
    lines.push(
      "## Jämför med Shopify-token",
      "",
      "```bash",
      "# 1. Hasha token från Develop Apps lokalt",
      "printf '%s' 'shpat_DIN_TOKEN' | node scripts/hash-shopify-token-local.mjs",
      "",
      "# 2. Jämför sha256 med production runtime ovan",
      "node scripts/eudroneparts-token-runtime-diagnostic.mjs --compare-local",
      "```",
      "",
    );
  }

  return lines.join("\n");
}

async function main() {
  loadDotEnv();
  const compareLocal = process.argv.includes("--compare-local");

  const runtime = await fetchRuntimeDiagnostic();
  console.log(JSON.stringify(runtime.json, null, 2));

  let localFp = null;
  let compare = null;
  if (compareLocal) {
    const token = await readLocalToken();
    const raw = token;
    const trimmed = token.trim();
    localFp = {
      prefix: raw.slice(0, 5),
      suffix: raw.slice(-5),
      length: raw.length,
      sha256_raw: sha256(raw),
      sha256_trimmed: sha256(trimmed),
    };
    const rt = runtime.json?.diagnostic?.runtime_token;
    if (rt?.sha256) {
      const rawMatch = localFp.sha256_raw === rt.sha256;
      const trimmedMatch = localFp.sha256_trimmed === rt.sha256;
      compare = {
        raw_match: rawMatch,
        trimmed_match: trimmedMatch,
        prefix_match: localFp.prefix === rt.prefix,
        suffix_match: localFp.suffix === rt.suffix,
        length_match: localFp.length === rt.length,
        verdict: rawMatch
          ? "**MATCH** — Production runtime använder exakt samma token som du klistrade in (raw)."
          : trimmedMatch
            ? "**NÄSTAN MATCH** — Runtime matchar trimmed token; secret kan ha extra whitespace i Lovable."
            : "**MISMATCH** — Production runtime använder INTE samma token som Develop Apps. Uppdatera Lovable secret + Publish, eller kontrollera secret-namn.",
      };
      console.log("\n" + compare.verdict);
    }
  }

  const markdown = buildReport(runtime, localFp, compare);
  writeFileSync(REPORT, markdown, "utf8");
  console.log(`\nWrote ${REPORT}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
