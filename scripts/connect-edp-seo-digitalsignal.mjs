#!/usr/bin/env node
/**
 * Connect EDP SEO to DigitalSignal and produce a gap report.
 *
 * Usage:
 *   node scripts/connect-edp-seo-digitalsignal.mjs
 *   node scripts/connect-edp-seo-digitalsignal.mjs --connect
 *   node scripts/connect-edp-seo-digitalsignal.mjs --audit-only
 *
 * Env:
 *   SUPABASE_URL / VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_PUBLISHABLE_KEY
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_MD = join(ROOT, "reports/edp-seo-digitalsignal-connection.md");
const REPORT_JSON = join(ROOT, "reports/edp-seo-digitalsignal-connection.json");
const EDP_SHOP_ID = "e6ad2afc-e468-49a7-8d33-9b1837419ed8";

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

function statusIcon(status) {
  if (status === "ok") return "✅";
  if (status === "warning") return "⚠️";
  if (status === "error") return "❌";
  return "⬜";
}

function renderMarkdown(result) {
  const audit = result.audit ?? result;
  const lines = [
    "# EDP SEO ↔ DigitalSignal — Kopplingsrapport",
    "",
    `**Genererad:** ${audit.auditedAt ?? new Date().toISOString()}`,
    `**Butik:** ${audit.shopName ?? "Europe Drone Parts"} (\`${audit.shopId}\`)`,
    `**Shopify:** ${audit.shopifyDomain ?? "ya1xhg-x6.myshopify.com"}`,
    `**Publik domän:** ${audit.publicDomain ?? "eurodroneparts.com"}`,
    `**Kopplingspoäng:** ${audit.score ?? 0}/100`,
    `**Redo för SEO i DigitalSignal:** ${audit.ready ? "Ja" : "Nej — se luckor nedan"}`,
    "",
  ];

  if (result.connected?.length) {
    lines.push("## Genomförda kopplingar", "");
    for (const c of result.connected) lines.push(`- ${c}`);
    lines.push("");
  }

  lines.push("## Kontrollista", "", "| Status | Komponent | Meddelande |", "|--------|-----------|------------|");
  for (const check of audit.checks ?? []) {
    lines.push(`| ${statusIcon(check.status)} | ${check.label} | ${check.message}${check.action ? ` → *${check.action}*` : ""} |`);
  }
  lines.push("");

  if (audit.gaps?.length) {
    lines.push("## Luckor som återstår", "");
    for (const gap of audit.gaps) lines.push(`- ${gap}`);
    lines.push("");
  }

  if (audit.nextSteps?.length) {
    lines.push("## Rekommenderade nästa steg", "");
    for (const step of audit.nextSteps) lines.push(`1. ${step}`);
    lines.push("");
  }

  lines.push(
    "## Jämförelse med ActionKing",
    "",
    "| Komponent | ActionKing | EDP (efter koppling) |",
    "|-----------|------------|----------------------|",
    "| `shop_domains` | 4 marknader (.se, .eu/de, .dk, .fi) | 4 marknader (.com, .se, .de, .dk) |",
    "| `integrations.shopify` | ✅ connected | Se kontrollista ovan |",
    "| `integrations.google_search_console` | ✅ connected | Se kontrollista ovan |",
    "| `tech_seo_settings` | ✅ | Se kontrollista ovan |",
    "| `tenant_module_overrides` (ds.seo) | ✅ aktiv | Se kontrollista ovan |",
    "| `pages` (sync-shopify-pages) | ✅ fylld | Se kontrollista ovan |",
    "| `merchant_account_overrides` | ✅ per marknad | Se kontrollista ovan |",
    "| GSC BigQuery datasets | ✅ per marknad | Se kontrollista ovan |",
    "| Storefront SEO-tema | Standard Dawn | EDP SEO + AI snippets |",
    "",
    "## Manuella blockers (kan ej lösas i kod)",
    "",
    "1. **Shopify OAuth-token** — Om token returnerar 401 måste appen återinstalleras via `shopify-app-install?shop=ya1xhg-x6.myshopify.com`",
    "2. **Lösenordsskydd** — Butiken måste öppnas publikt innan Google kan indexera och teknisk crawl fungerar fullt ut",
    "3. **GSC-export** — BigQuery-datasets måste provisioneras och kopplas per marknad i Admin → GSC BigQuery",
    "",
  );

  return lines.join("\n");
}

async function invoke(action) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Saknar SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY i .env");
  }

  const res = await fetch(`${url}/functions/v1/shop-seo-connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({ action, shopId: EDP_SHOP_ID }),
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text.slice(0, 500) };
  }

  if (!res.ok) {
    throw new Error(`shop-seo-connect ${res.status}: ${data.error || text.slice(0, 200)}`);
  }

  return data;
}

async function main() {
  loadEnv();
  mkdirSync(join(ROOT, "reports"), { recursive: true });

  const doConnect = process.argv.includes("--connect");
  const auditOnly = process.argv.includes("--audit-only");

  console.log(`\nEDP SEO ↔ DigitalSignal ${doConnect ? "CONNECT + AUDIT" : "AUDIT"}\n`);

  let result;
  if (doConnect && !auditOnly) {
    console.log("Kör connect...");
    result = await invoke("connect");
    console.log(`Kopplade: ${(result.connected ?? []).join(", ") || "inga"}`);
  } else {
    result = await invoke("audit");
  }

  const audit = result.audit ?? result;
  console.log(`Poäng: ${audit.score}/100 — ${audit.gaps?.length ?? 0} luckor`);

  writeFileSync(REPORT_JSON, JSON.stringify(result, null, 2));
  writeFileSync(REPORT_MD, renderMarkdown(result));

  console.log(`\nRapport: ${REPORT_MD}`);
  console.log(`JSON:   ${REPORT_JSON}`);

  if (audit.gaps?.length) {
    console.log("\nLuckor:");
    for (const g of audit.gaps) console.log(`  - ${g}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
