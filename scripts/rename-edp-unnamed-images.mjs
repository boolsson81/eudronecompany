#!/usr/bin/env node
/**
 * Rename Shopify Files with "unnamed_*" filenames to SEO-friendly names from alt text.
 *
 * Usage:
 *   node scripts/rename-edp-unnamed-images.mjs              # dry-run (first 20)
 *   node scripts/rename-edp-unnamed-images.mjs --limit=100  # dry-run more
 *   node scripts/rename-edp-unnamed-images.mjs --execute --limit=50
 *   node scripts/rename-edp-unnamed-images.mjs --execute    # all unnamed files
 */
import { readFileSync, existsSync, writeFileSync, appendFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOP = "ya1xhg-x6.myshopify.com";
const LOG_PATH = join(ROOT, "EURODRONEPARTS_IMAGE_RENAME_LOG.jsonl");

const EXECUTE = process.argv.includes("--execute");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : EXECUTE ? Infinity : 20;
const BATCH_SIZE = 10;
const PAGE_SIZE = 100;

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

function slugify(s) {
  return (
    String(s || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[åä]/g, "a")
      .replace(/ö/g, "o")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) || "image"
  );
}

function cleanAlt(alt) {
  return String(alt || "")
    .replace(/\s*[-–]\s*EU Drone Parts\s*$/i, "")
    .replace(/\s*[-–]\s*bild\s*\d+\s*$/i, "")
    .replace(/\s*[-–]\s*image\s*\d+\s*$/i, "")
    .trim();
}

function basenameFromUrl(url) {
  try {
    const p = new URL(url).pathname.split("/").pop() || "";
    return decodeURIComponent(p.split("?")[0]);
  } catch {
    return "";
  }
}

function extFromFilename(name) {
  const m = name.match(/(\.[a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : ".webp";
}

function suggestFilename(alt, currentName, used) {
  const ext = extFromFilename(currentName);
  const base = slugify(cleanAlt(alt));
  let candidate = `${base}${ext}`;
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${String(n).padStart(2, "0")}${ext}`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}

async function gql(query, variables = {}) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");

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
  if (!json.success) throw new Error(JSON.stringify(json.errors || json));
  return json.data;
}

async function* listUnnamedFiles() {
  let cursor = null;
  while (true) {
    const data = await gql(
      `query($cursor: String) {
        files(first: ${PAGE_SIZE}, after: $cursor, query: "filename:unnamed") {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            alt
            ... on MediaImage { image { url } fileStatus }
            ... on GenericFile { url fileStatus }
          }
        }
      }`,
      { cursor },
    );
    for (const node of data.files.nodes) yield node;
    if (!data.files.pageInfo.hasNextPage) break;
    cursor = data.files.pageInfo.endCursor;
  }
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function logEntry(entry) {
  appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`);
}

async function renameBatch(batch) {
  const data = await gql(
    `mutation($files: [FileUpdateInput!]!) {
      fileUpdate(files: $files) {
        files { id ... on MediaImage { image { url } } }
        userErrors { field message code }
      }
    }`,
    { files: batch },
  );
  const errs = data.fileUpdate?.userErrors || [];
  if (errs.length) throw new Error(JSON.stringify(errs));
  return data.fileUpdate.files;
}

async function main() {
  loadEnv();
  console.log(`# Rename unnamed Shopify images\nStore: ${SHOP}`);
  console.log(`Mode: ${EXECUTE ? "EXECUTE" : "DRY-RUN"}`);
  console.log(`Limit: ${Number.isFinite(LIMIT) ? LIMIT : "none"}\n`);

  const used = new Set();
  const planned = [];
  let skipped = 0;

  for await (const node of listUnnamedFiles()) {
    if (planned.length >= LIMIT) break;

    const url = node.image?.url || node.url || "";
    const current = basenameFromUrl(url);
    if (!current || !/^unnamed/i.test(current)) {
      skipped += 1;
      continue;
    }

    const alt = cleanAlt(node.alt);
    if (!alt) {
      skipped += 1;
      continue;
    }

    const next = suggestFilename(alt, current, used);
    if (next === current) {
      skipped += 1;
      continue;
    }

    planned.push({
      id: node.id,
      from: current,
      to: next,
      alt: node.alt,
      fileStatus: node.fileStatus,
    });
  }

  console.log(`Planned renames: ${planned.length} | Skipped: ${skipped}\n`);
  planned.slice(0, 15).forEach((p) => console.log(`  ${p.from}\n    → ${p.to}`));
  if (planned.length > 15) console.log(`  … and ${planned.length - 15} more`);

  if (!EXECUTE) {
    console.log("\nRun with --execute to apply renames.");
    return;
  }

  if (!existsSync(LOG_PATH)) writeFileSync(LOG_PATH, "");
  let done = 0;
  let failed = 0;

  for (const batch of chunk(planned, BATCH_SIZE)) {
    const inputs = batch.map((p) => ({ id: p.id, filename: p.to, alt: p.alt }));
    try {
      const results = await renameBatch(inputs);
      for (let i = 0; i < batch.length; i++) {
        const p = batch[i];
        const url = results[i]?.image?.url || "";
        logEntry({
          ts: new Date().toISOString(),
          id: p.id,
          from: p.from,
          to: p.to,
          url,
          ok: true,
        });
      }
      done += batch.length;
      console.log(`Batch ✓ ${done}/${planned.length}`);
    } catch (e) {
      failed += batch.length;
      for (const p of batch) {
        logEntry({
          ts: new Date().toISOString(),
          id: p.id,
          from: p.from,
          to: p.to,
          ok: false,
          error: e.message,
        });
      }
      console.error(`Batch failed (${batch.length}):`, e.message);
    }
    await new Promise((r) => setTimeout(r, 450));
  }

  console.log(`\n## Done\nRenamed: ${done} | Failed: ${failed}`);
  console.log(`Log: ${LOG_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
