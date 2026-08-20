#!/usr/bin/env node
/**
 * P0 schema validation — dual mode per SCHEMA_DECISION.md
 *
 *   node scripts/run-p0-schema-validation.mjs --mode=current   # pre-db-push (legacy)
 *   node scripts/run-p0-schema-validation.mjs --mode=target    # post-db-push (GO gate)
 *
 * Writes: docs/go-live/evidence/P0_SCHEMA_VALIDATION.json
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EVIDENCE = join(ROOT, "docs/go-live/evidence");
const PROJECT_REF = "jzqgwsryxmgzcbjjddic";
const SHOP_ID = "e6ad2afc-e468-49a7-8d33-9b1837419ed8";

const MODE = (() => {
  const eq = process.argv.find((a) => a.startsWith("--mode="));
  if (eq) return eq.split("=")[1] === "current" ? "current" : "target";
  const idx = process.argv.indexOf("--mode");
  const v = idx >= 0 ? process.argv[idx + 1] : "target";
  return v === "current" ? "current" : "target";
})();

/** Columns that exist in production today (legacy + cogs.ts inputs). */
const CURRENT_COLUMNS = [
  "hs_code",
  "purchase_price",
  "shipping_cost",
  "import_duty_rate",
  "supplier_sku",
  "product_title",
  "quantity",
  "country_of_origin",
];

/** Full SUNSKY compliance platform (requires db push — migrations 202606181*). */
const TARGET_COLUMNS = [
  "landed_cost_sek",
  "landed_cost_usd",
  "import_compliance_status",
  "import_compliance_flags",
  "gpsr_required",
  "battery_regulation_required",
  "battery_required",
  "digital_product_passport_required",
  "dpp_required",
  "eu_responsible_person_required",
  "hs_code_source",
  "hs_code_confidence",
  "hs_code_last_verified_at",
  "duty_source",
  "estimated_freight",
  "freight_source",
  "review_flags",
  "publish_ready",
  "gross_margin_percent",
  "margin_percent",
  "recommended_price_sek_inc_vat",
  "recommended_price",
];

const CURRENT_PAGES = ["supplier_normalized", "supplier_raw"];

function loadDotEnv() {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const AUTH_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function probeColumn(column) {
  const url = `${SUPABASE_URL}/rest/v1/inventory?select=${column}&limit=1`;
  const res = await fetch(url, {
    headers: { apikey: AUTH_KEY, Authorization: `Bearer ${AUTH_KEY}` },
  });
  const text = await res.text();
  if (res.ok) return { column, exists: true, error: null };
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text };
  }
  const missing = json?.code === "42703" || /does not exist/i.test(json?.message ?? "");
  return { column, exists: !missing, error: json?.message ?? text.slice(0, 200) };
}

async function probePagesField(field) {
  const url = `${SUPABASE_URL}/rest/v1/pages?select=${field}&limit=1`;
  const res = await fetch(url, {
    headers: { apikey: AUTH_KEY, Authorization: `Bearer ${AUTH_KEY}` },
  });
  if (res.ok) return { field, exists: true };
  const text = await res.text();
  return { field, exists: false, error: text.slice(0, 200) };
}

async function testComplianceReport() {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/sunsky-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_KEY}`,
      apikey: AUTH_KEY,
    },
    body: JSON.stringify({ action: "compliance-report", shopId: SHOP_ID }),
  });
  const json = await res.json().catch(() => ({}));
  return {
    http_status: res.status,
    deployed: res.ok && json.success === true,
    error: json.error ?? null,
    note: "compliance-report is an action on sunsky-sync — deploy sunsky-sync, not a separate function",
  };
}

async function main() {
  if (!SUPABASE_URL || !AUTH_KEY) {
    console.error("Missing SUPABASE_URL or auth key");
    process.exit(1);
  }

  mkdirSync(EVIDENCE, { recursive: true });

  const columnsToCheck = MODE === "current" ? CURRENT_COLUMNS : TARGET_COLUMNS;
  const columns = [];
  for (const col of columnsToCheck) {
    columns.push(await probeColumn(col));
  }

  const pagesFields = MODE === "current"
    ? await Promise.all(CURRENT_PAGES.map(probePagesField))
    : await Promise.all(CURRENT_PAGES.map(probePagesField));

  const complianceReport = await testComplianceReport();

  const passed = columns.filter((c) => c.exists).length;
  const total = columns.length;

  const report = {
    generated_at: new Date().toISOString(),
    mode: MODE,
    schema_decision: "docs/go-live/operator/SCHEMA_DECISION.md",
    project_ref: PROJECT_REF,
    shop_id: SHOP_ID,
    columns,
    pages_fields: pagesFields,
    compliance_report: complianceReport,
    landed_cost_note: MODE === "current"
      ? "Landed cost via src/utils/cogs.ts (purchase_price + shipping_cost + import_duty_rate)"
      : "Landed cost via inventory.landed_cost_sek after backfill",
    migration_drift: MODE === "target" && columns.some((c) => !c.exists),
    passed,
    total,
    meets_gate: passed === total,
    critical_passed: {
      landed_cost_sek: columns.find((c) => c.column === "landed_cost_sek")?.exists
        ?? (MODE === "current" ? "n/a_use_cogs_ts" : false),
      import_compliance_status: columns.find((c) => c.column === "import_compliance_status")?.exists
        ?? (MODE === "current" ? "n/a_pending_migration" : false),
      cogs_inputs: MODE === "current" ? {
        purchase_price: columns.find((c) => c.column === "purchase_price")?.exists ?? false,
        shipping_cost: columns.find((c) => c.column === "shipping_cost")?.exists ?? false,
        import_duty_rate: columns.find((c) => c.column === "import_duty_rate")?.exists ?? false,
      } : undefined,
    },
  };

  const outPath = join(EVIDENCE, "P0_SCHEMA_VALIDATION.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(`Schema validation [${MODE}]:`, passed, "/", total);
  if (MODE === "current") {
    console.log("Landed cost: cogs.ts path (purchase_price, shipping_cost, import_duty_rate)");
  } else {
    console.log("landed_cost_sek:", report.critical_passed.landed_cost_sek);
    console.log("import_compliance_status:", report.critical_passed.import_compliance_status);
  }
  console.log("compliance-report (sunsky-sync action):", report.compliance_report.deployed);
  console.log("Written:", outPath);

  if (!report.meets_gate) {
    process.exit(MODE === "current" ? 0 : 2);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
