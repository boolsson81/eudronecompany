#!/usr/bin/env node
/**
 * Push local theme/ to EuroDroneParts Shopify store (unpublished theme).
 * Uses test-integration edge function as authenticated GraphQL proxy.
 *
 * Usage:
 *   node scripts/push-edp-theme.mjs              # dry-run
 *   node scripts/push-edp-theme.mjs --execute    # upload files
 *   node scripts/push-edp-theme.mjs --execute --theme-id 186020200776
 */
import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const THEME_DIR = join(ROOT, "theme");
const SHOP = "ya1xhg-x6.myshopify.com";
const DEFAULT_THEME_NUMERIC_ID = "186020200776"; // Horizon (unpublished)
const BATCH_SIZE = 12;

const EXECUTE = process.argv.includes("--execute");
const KEEP_NAME = process.argv.includes("--keep-name");
const themeArg = process.argv.find((a) => a.startsWith("--theme-id="));
const THEME_GID = `gid://shopify/OnlineStoreTheme/${themeArg?.split("=")[1] || DEFAULT_THEME_NUMERIC_ID}`;

const BINARY_EXT = new Set([
  ".gif", ".png", ".jpg", ".jpeg", ".webp", ".ico", ".svg", ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".webm",
]);

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

function walk(dir, base = dir) {
  const SKIP_PREFIXES = [".github/", ".vscode/"];
  const SKIP_FILES = new Set([
    ".gitignore", ".prettierrc.json", ".theme-check.yml", "LICENSE.md", "README.md",
    "release-notes.md", "translation.yml",
  ]);
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === ".git") continue;
    const full = join(dir, name);
    const rel = relative(base, full).replace(/\\/g, "/");
    if (SKIP_FILES.has(name) || SKIP_PREFIXES.some((p) => rel.startsWith(p))) continue;
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full, base));
    else out.push(rel);
  }
  return out.sort();
}

function toFileInput(filename, textOverride) {
  const full = join(THEME_DIR, filename);
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (textOverride != null) {
    return { filename, body: { type: "TEXT", value: textOverride } };
  }
  const buf = readFileSync(full);
  if (BINARY_EXT.has(ext)) {
    return { filename, body: { type: "BASE64", value: buf.toString("base64") } };
  }
  return { filename, body: { type: "TEXT", value: buf.toString("utf8") } };
}

async function uploadBatch(batch, label) {
  const inputs = batch.map((item) =>
    typeof item === "string" ? toFileInput(item) : toFileInput(item.filename, item.text),
  );
  const data = await gql(
    `mutation($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
      themeFilesUpsert(themeId: $themeId, files: $files) {
        upsertedThemeFiles { filename }
        userErrors { field message }
      }
    }`,
    { themeId: THEME_GID, files: inputs },
  );
  const errs = data.themeFilesUpsert?.userErrors || [];
  if (errs.length) {
    console.error(`${label} errors:`, errs);
    return { ok: false, count: batch.length };
  }
  console.log(`${label} ✓ (${batch.length} file${batch.length === 1 ? "" : "s"})`);
  return { ok: true, count: batch.length };
}

async function gql(query, variables = {}) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // test-integration's requireAuth() only accepts a real user session JWT
  // (via auth.getUser()) or an exact match against SUPABASE_SERVICE_ROLE_KEY
  // (see supabase/functions/_shared/requireAuth.ts:isServiceRoleBearer).
  // A CI job has neither a logged-in user nor a browser session, so it must
  // authenticate as service role - the anon/publishable key is rejected with
  // "Invalid token" since it isn't tied to any user.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");

  const r = await fetch(`${url}/functions/v1/test-integration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({
      integration_type: "shopify",
      config: { store_domain: SHOP, access_token: "***configured***" },
      shopify_graphql: { query, variables },
    }),
  });
  const json = await r.json();
  if (!json.success || json.errors?.length) {
    throw new Error(JSON.stringify(json.errors || json));
  }
  return json.data;
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function renameTheme(name) {
  const data = await gql(
    `mutation($id: ID!, $input: OnlineStoreThemeInput!) {
      themeUpdate(id: $id, input: $input) { theme { id name } userErrors { message } }
    }`,
    { id: THEME_GID, input: { name } },
  );
  const errs = data.themeUpdate?.userErrors || [];
  if (errs.length) console.warn("themeUpdate warnings:", errs);
}

async function main() {
  loadEnv();
  if (!existsSync(THEME_DIR)) throw new Error(`Missing ${THEME_DIR}`);

  const files = walk(THEME_DIR);
  console.log(`# EuroDroneParts theme push\n`);
  console.log(`Store: ${SHOP}`);
  console.log(`Theme: ${THEME_GID}`);
  console.log(`Files: ${files.length}`);
  console.log(`Mode: ${EXECUTE ? "EXECUTE" : "DRY-RUN"}\n`);

  if (!EXECUTE) {
    console.log("Sample files:");
    files.slice(0, 8).forEach((f) => console.log(`  - ${f}`));
    console.log(`  … and ${files.length - 8} more`);
    console.log("\nRun with --execute to upload.");
    return;
  }

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  if (!KEEP_NAME) {
    await renameTheme(`EDP Dawn v1 — ${stamp}`);
    console.log("Renamed theme → EDP Dawn v1\n");
  } else {
    console.log("Keeping existing theme name\n");
  }

  let uploaded = 0;
  let failed = 0;

  // config/settings_schema.json and config/settings_data.json are already
  // mutually consistent (validated: every settings_data value matches a
  // valid option/range in settings_schema.json), so they upload like any
  // other theme file — no cross-schema translation needed.
  const batches = chunk(files, BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      const result = await uploadBatch(batch, `Batch ${i + 1}/${batches.length}`);
      if (result.ok) uploaded += result.count;
      else failed += result.count;
    } catch (e) {
      failed += batch.length;
      console.error(`Batch ${i + 1}/${batches.length} failed:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  const previewUrl = `https://${SHOP}?preview_theme_id=${THEME_GID.split("/").pop()}`;
  console.log(`\n## Done`);
  console.log(`Uploaded: ${uploaded} | Failed: ${failed}`);
  console.log(`Preview: ${previewUrl}`);
  console.log(`Admin: https://${SHOP}/admin/themes/${THEME_GID.split("/").pop()}/editor`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
