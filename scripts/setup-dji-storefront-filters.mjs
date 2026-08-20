#!/usr/bin/env node
/**
 * Create DJI metafield definitions required for storefront collection filters.
 * After running, add filter sources in Shopify Admin → Search & Discovery:
 *   Passar till → dji.compatible_models_display
 *   DJI-serie → dji.series
 *   Deltyp → dji.accessory_type
 *
 * Usage:
 *   node scripts/setup-dji-storefront-filters.mjs              # dry-run
 *   node scripts/setup-dji-storefront-filters.mjs --execute    # create definitions
 */
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOP = "ya1xhg-x6.myshopify.com";
const EXECUTE = process.argv.includes("--execute");

const DJI_METAFIELD_DEFINITIONS = [
  {
    name: "Compatible DJI models (canonical)",
    namespace: "dji",
    key: "compatible_models",
    type: "list.single_line_text_field",
    description: "Canonical DJI model IDs for smart collections (dji_mini_4_pro, etc.)",
  },
  {
    name: "Compatible DJI models (display)",
    namespace: "dji",
    key: "compatible_models_display",
    type: "list.single_line_text_field",
    description: "Human-readable DJI model names for storefront filter Passar till",
  },
  {
    name: "DJI series",
    namespace: "dji",
    key: "series",
    type: "list.single_line_text_field",
    description: "DJI product series for storefront filter DJI-serie",
  },
  {
    name: "Accessory type",
    namespace: "dji",
    key: "accessory_type",
    type: "single_line_text_field",
    description: "Part type for storefront filter Deltyp (propeller, battery, etc.)",
  },
  {
    name: "Option list role",
    namespace: "dji",
    key: "option_list_role",
    type: "single_line_text_field",
    description: "Sunsky optionList role (kit_picker, variant, etc.) — internal",
  },
  {
    name: "Extraction confidence",
    namespace: "dji",
    key: "confidence",
    type: "single_line_text_field",
    description: "DJI compatibility extraction confidence — internal",
  },
];

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

async function shopifyGql(query, variables = {}) {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const url = process.env.SUPABASE_URL;
  if (!key || !url) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in .env");
  }
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
  if (!json.success) {
    throw new Error(JSON.stringify(json.errors || json.message || json));
  }
  return json.data;
}

async function listExistingDefinitions() {
  const rows = [];
  let cursor = null;
  for (let i = 0; i < 10; i++) {
    const data = await shopifyGql(
      `query($cursor: String) {
        metafieldDefinitions(first: 50, after: $cursor, ownerType: PRODUCT, namespace: "dji") {
          edges { node { id namespace key name type { name } } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor },
    );
    for (const edge of data.metafieldDefinitions.edges) {
      rows.push(edge.node);
    }
    if (!data.metafieldDefinitions.pageInfo.hasNextPage) break;
    cursor = data.metafieldDefinitions.pageInfo.endCursor;
  }
  return rows;
}

function isFilterableKey(key) {
  return ["compatible_models", "compatible_models_display", "series", "accessory_type"].includes(key);
}

async function createDefinition(def) {
  const filterable = isFilterableKey(def.key);
  const mutation = `
    mutation CreateDjiMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition { id namespace key name }
        userErrors { field message code }
      }
    }
  `;
  const definition = {
    name: def.name,
    namespace: def.namespace,
    key: def.key,
    description: def.description,
    type: def.type,
    ownerType: "PRODUCT",
    pin: filterable,
    access: { storefront: "PUBLIC_READ" },
    capabilities: filterable
      ? {
          adminFilterable: { enabled: true },
          smartCollectionCondition: { enabled: true },
        }
      : undefined,
  };
  const data = await shopifyGql(mutation, { definition });
  const result = data.metafieldDefinitionCreate;
  const errs = result?.userErrors ?? [];
  if (errs.length) {
    const alreadyExists = errs.some(
      (e) =>
        e.message?.includes("already exists") ||
        e.message?.includes("Key is in use") ||
        e.code === "TAKEN",
    );
    if (alreadyExists) return { status: "exists", key: def.key };
    throw new Error(`metafieldDefinitionCreate ${def.key}: ${JSON.stringify(errs)}`);
  }
  return { status: "created", key: def.key, id: result.createdDefinition?.id };
}

async function main() {
  loadEnv();
  console.log(`DJI storefront filter setup (${EXECUTE ? "EXECUTE" : "dry-run"}) — ${SHOP}\n`);

  const existing = await listExistingDefinitions();
  const existingKeys = new Set(existing.map((d) => d.key));
  console.log(`Existing dji.* definitions: ${existing.length ? [...existingKeys].join(", ") : "(none)"}\n`);

  const results = [];
  for (const def of DJI_METAFIELD_DEFINITIONS) {
    const label = `${def.namespace}.${def.key}`;
    if (existingKeys.has(def.key)) {
      console.log(`  skip  ${label} — already exists`);
      results.push({ key: def.key, status: "exists" });
      continue;
    }
    if (!EXECUTE) {
      console.log(`  plan  ${label} (${def.type})${isFilterableKey(def.key) ? " [filterable]" : ""}`);
      results.push({ key: def.key, status: "planned" });
      continue;
    }
    const r = await createDefinition(def);
    console.log(`  ${r.status === "created" ? "create" : "skip "} ${label}`);
    results.push(r);
  }

  console.log("\n--- Next steps (manual in Shopify Admin) ---");
  console.log("Search & Discovery → Filters → Add filter:");
  console.log("  1. Passar till      → dji.compatible_models_display");
  console.log("  2. DJI-serie        → dji.series");
  console.log("  3. Deltyp           → dji.accessory_type");
  console.log("\nTheme: Produktrutnät → Filter ON, Filterlayout Stående (recommended).");
  console.log("Publish DJI products via publish-sunsky-to-shopify so metafield values populate.");

  if (!EXECUTE) {
    console.log("\nRun with --execute to create missing definitions.");
  }

  return results;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
