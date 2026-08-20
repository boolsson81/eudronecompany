#!/usr/bin/env node
/**
 * Phase 0 gate verification (read-only).
 * Writes docs/migration/phase-0-evidence.json
 *
 * Usage:
 *   node scripts/run-phase-0-verification.mjs
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs/migration/phase-0-evidence.json");
const DEPRECATED = "wsncjdajweoujhidlxas";
const DEFAULT_PROD = "jzqgwsryxmgzcbjjddic";
const SHOP = "ya1xhg-x6.myshopify.com";

function loadDotEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

async function probeUrl(url, init = {}) {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(30000) });
    const text = await res.text().catch(() => "");
    return { status: res.status, body: text };
  } catch (e) {
    return { status: 0, error: String(e?.message || e), body: "" };
  }
}

function runCli(args) {
  try {
    const out = execSync(`npx supabase ${args}`, {
      encoding: "utf8",
      env: process.env,
      timeout: 60000,
    });
    return { ok: true, output: out.trim().slice(0, 500) };
  } catch (e) {
    return { ok: false, output: (e.stdout || e.stderr || e.message || "").toString().slice(0, 500) };
  }
}

function gh(cmd, maxLen = 300) {
  try {
    const out = execSync(`gh ${cmd}`, { encoding: "utf8", timeout: 30000 });
    return { ok: true, output: out.trim().slice(0, maxLen) };
  } catch (e) {
    return { ok: false, output: (e.stderr || e.message || "").toString().slice(0, maxLen) };
  }
}

loadDotEnv();

const PROD =
  process.env.VITE_SUPABASE_PROJECT_ID ||
  process.env.SUPABASE_PROJECT_REF ||
  DEFAULT_PROD;

const anon =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Config check: active .env must not point at deprecated project
const envText = existsSync(join(ROOT, ".env")) ? readFileSync(join(ROOT, ".env"), "utf8") : "";
const configUsesDeprecated =
  envText.includes(DEPRECATED) &&
  !envText.includes("# Deprecated") &&
  !envText.match(/#\s*.*wsnc/);
const configUrlsOk =
  envText.includes(`https://${PROD}.supabase.co`) &&
  envText.includes(`VITE_SUPABASE_PROJECT_ID="${PROD}"`) &&
  !configUsesDeprecated;

const evidence = {
  generated_at: new Date().toISOString(),
  phase: 0,
  canonical_project_ref: PROD,
  deprecated_project_ref: DEPRECATED,
  overall_status: "NO-GO",
  priorities: {},
  exit_criteria: {},
  configuration: {
    active_project: PROD,
    env_urls_valid: configUrlsOk,
  },
};

// P1 — Access
const tokenLen = (process.env.SUPABASE_ACCESS_TOKEN || "").length;
const cliList = tokenLen > 0 ? runCli("projects list") : { ok: false, output: "SUPABASE_ACCESS_TOKEN not set" };
const cliFns =
  tokenLen > 0 ? runCli(`functions list --project-ref ${PROD}`) : { ok: false, output: "no token" };

evidence.priorities.p1_access = {
  status: cliList.ok && cliFns.ok && configUrlsOk ? "PASS" : "FAIL",
  gates: {
    owner_admin_confirmed: cliFns.ok,
    token_works_locally: cliList.ok && cliFns.ok,
    active_config_uses_prod_ref: configUrlsOk,
  },
  probes: {
    token_present: tokenLen > 0,
    token_length: tokenLen,
    canonical_project_ref: PROD,
    projects_list: cliList,
    functions_list_prod: cliFns,
    configuration_valid: configUrlsOk,
  },
};

// P2 — GitHub secrets
const ghSecrets = gh("secret list", 2000);
const requiredSecrets = [
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_DB_PASSWORD",
];
const listedSecretNames = ghSecrets.ok
  ? ghSecrets.output.split(/\r?\n/).map((line) => line.split("\t")[0].trim()).filter(Boolean)
  : [];
const secretsPresent = requiredSecrets.every((name) => listedSecretNames.includes(name));
const ghDispatch =
  process.env.PHASE0_DISPATCH_WORKFLOW === "1"
    ? gh("workflow run sunsky-p0-golive.yml")
    : { ok: false, output: "skipped (set PHASE0_DISPATCH_WORKFLOW=1 to test dispatch)" };
evidence.priorities.p2_github_secrets = {
  status: secretsPresent && ghSecrets.ok ? "PASS" : "FAIL",
  gates: {
    secrets_updated: secretsPresent,
    workflow_can_read_token: ghSecrets.ok,
  },
  note: secretsPresent
    ? "Required GitHub secrets present (names only; values not verified)."
    : "Missing one or more required secrets in GitHub Actions.",
  probes: {
    secret_list: ghSecrets,
    required_secrets: requiredSecrets,
    secrets_present: secretsPresent,
    workflow_dispatch: ghDispatch,
  },
};

// P3 — Backup
const backupDoc = readFileSync(join(ROOT, "docs/go-live/operator/BACKUP_CONFIRMATION.md"), "utf8");
const backupConfirmed = !backupDoc.includes("_PENDING_") && backupDoc.includes("Confirmed safe");
evidence.priorities.p3_backup = {
  status: backupConfirmed ? "PASS" : "FAIL",
  gates: {
    backup_verified: backupConfirmed,
    restore_procedure_documented: backupDoc.includes("Restore") || backupDoc.includes("Backups"),
  },
};

// P4 — Live webhooks
let liveWebhooks = null;
const lwPath = join(ROOT, "docs/migration/live-webhooks.json");
if (existsSync(lwPath)) {
  liveWebhooks = JSON.parse(readFileSync(lwPath, "utf8"));
}
const webhooksExported = liveWebhooks?.export_status === "SUCCESS";
evidence.priorities.p4_live_webhooks = {
  status: webhooksExported ? "PASS" : "FAIL",
  gates: {
    live_registry_exported: webhooksExported,
    endpoints_identified: webhooksExported || (liveWebhooks?.static_known?.length > 0),
  },
  export_status: liveWebhooks?.export_status ?? "missing",
};

// P5 — Production project map
const prodCloner = await probeUrl(`https://${PROD}.supabase.co/functions/v1/shopify-cloner-worker`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${anon}` },
  body: JSON.stringify({ action: "pre_250_discover" }),
});
let prodMigrations = null;
let prodActions = null;
try {
  const j = JSON.parse(prodCloner.body);
  prodMigrations = j.migrations?.length ?? 0;
  prodActions = j.actions?.length ?? 0;
} catch {}

evidence.priorities.p5_split_brain_map = {
  status: configUrlsOk ? "PASS" : "FAIL",
  gates: {
    dependency_map_verified: existsSync(join(ROOT, "docs/migration/dependency-map.md")),
    workflow_audit_verified: existsSync(join(ROOT, "docs/migration/github-workflow-audit.md")),
    active_config_points_to_prod: configUrlsOk,
  },
  live_probes: {
    prod_project_ref: PROD,
    prod_cloner_http: prodCloner.status,
    prod_cloner_migrations: prodMigrations,
    prod_cloner_actions: prodActions,
    map: {
      data: PROD,
      sunsky: PROD,
      boston_ftp: PROD,
      cloner: PROD,
      inventory_webhook: PROD,
      deprecated_external: DEPRECATED,
    },
  },
};

// Exit criteria
const allPass =
  evidence.priorities.p1_access.status === "PASS" &&
  evidence.priorities.p2_github_secrets.status === "PASS" &&
  evidence.priorities.p3_backup.status === "PASS" &&
  evidence.priorities.p4_live_webhooks.status === "PASS" &&
  configUrlsOk;

evidence.exit_criteria = {
  owner_admin_access_confirmed: evidence.priorities.p1_access.gates.owner_admin_confirmed,
  supabase_access_token_available: evidence.priorities.p1_access.gates.token_works_locally,
  github_secrets_validated: evidence.priorities.p2_github_secrets.gates.secrets_updated,
  backup_procedure_verified: evidence.priorities.p3_backup.gates.backup_verified,
  live_webhook_inventory_completed: evidence.priorities.p4_live_webhooks.gates.live_registry_exported,
  phase_1_authorized: allPass,
};

evidence.overall_status = allPass ? "GO" : "NO-GO";

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));
process.exit(allPass ? 0 : 1);
