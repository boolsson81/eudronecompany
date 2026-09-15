#!/usr/bin/env node
/**
 * Skapar metafältsdefinitionerna som paketmallen (theme/templates/product.paket.json)
 * läser. Namespace: `paket`.
 *
 *   paket.etikett        single_line_text_field  – etikett över titeln, t.ex. "Tvättpaket"
 *   paket.sammanfattning multi_line_text_field   – kort text i rutan under titeln
 *   paket.innehall       list.product_reference  – produkterna som ingår, i visningsordning
 *   paket.antal          list.number_integer     – antal per rad i innehall (tomt = 1)
 *   paket.tillval        list.product_reference  – valbara tillbehör med kryssruta
 *
 * Usage:
 *   node scripts/setup-paket-metafields.mjs              # dry-run
 *   node scripts/setup-paket-metafields.mjs --execute    # skapa definitioner som saknas
 */
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOP = "ya1xhg-x6.myshopify.com";
const EXECUTE = process.argv.includes("--execute");

export const PAKET_NAMESPACE = "paket";

export const PAKET_METAFIELD_DEFINITIONS = [
  {
    name: "Paket: etikett",
    namespace: PAKET_NAMESPACE,
    key: "etikett",
    type: "single_line_text_field",
    description: "Kort etikett som visas över paketets titel, t.ex. Tvättpaket eller Pro-paket",
  },
  {
    name: "Paket: sammanfattning",
    namespace: PAKET_NAMESPACE,
    key: "sammanfattning",
    type: "multi_line_text_field",
    description: "Kort text i rutan under titeln: vem paketet passar och vad som ingår",
  },
  {
    name: "Paket: innehåll",
    namespace: PAKET_NAMESPACE,
    key: "innehall",
    type: "list.product_reference",
    description: "Produkterna som ingår i paketet, i den ordning de ska visas",
  },
  {
    name: "Paket: antal per rad",
    namespace: PAKET_NAMESPACE,
    key: "antal",
    type: "list.number_integer",
    description: "Antal av varje produkt i innehåll, i samma ordning. Tom post eller tomt fält = 1",
    validations: [{ name: "min", value: "1" }],
  },
  {
    name: "Paket: tillval",
    namespace: PAKET_NAMESPACE,
    key: "tillval",
    type: "list.product_reference",
    description: "Tillbehör kunden kan bocka i och lägga i varukorgen tillsammans med paketet",
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
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
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
      `query($cursor: String, $namespace: String!) {
        metafieldDefinitions(first: 50, after: $cursor, ownerType: PRODUCT, namespace: $namespace) {
          edges { node { id namespace key name type { name } } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor, namespace: PAKET_NAMESPACE },
    );
    for (const edge of data.metafieldDefinitions.edges) {
      rows.push(edge.node);
    }
    if (!data.metafieldDefinitions.pageInfo.hasNextPage) break;
    cursor = data.metafieldDefinitions.pageInfo.endCursor;
  }
  return rows;
}

async function createDefinition(def) {
  const mutation = `
    mutation CreatePaketMetafieldDefinition($definition: MetafieldDefinitionInput!) {
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
    pin: true,
    access: { storefront: "PUBLIC_READ" },
    validations: def.validations,
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

/**
 * Jämför befintliga definitioner med de mallen kräver. En definition med samma
 * nyckel men annan typ ger snippets data i fel form (t.ex. en textsträng i
 * stället för en produktlista), så den ska stoppa körningen i stället för att
 * rapporteras som "finns redan".
 */
export function findTypeMismatches(required, existing) {
  const byKey = new Map(existing.map((d) => [d.key, d]));
  const mismatches = [];
  for (const def of required) {
    const found = byKey.get(def.key);
    if (!found) continue;
    const actual = typeof found.type === "string" ? found.type : found.type?.name;
    if (actual && actual !== def.type) {
      mismatches.push({ namespace: def.namespace, key: def.key, expected: def.type, actual });
    }
  }
  return mismatches;
}

async function main() {
  loadEnv();
  console.log(`Paket-metafält (${EXECUTE ? "EXECUTE" : "dry-run"}) — ${SHOP}\n`);

  const existing = await listExistingDefinitions();
  const existingByKey = new Map(existing.map((d) => [d.key, d]));
  console.log(`Befintliga ${PAKET_NAMESPACE}.*-definitioner: ${existing.length ? [...existingByKey.keys()].join(", ") : "(inga)"}\n`);

  const typeMismatches = findTypeMismatches(PAKET_METAFIELD_DEFINITIONS, existing);
  if (typeMismatches.length) {
    for (const m of typeMismatches) {
      console.error(`  FEL   ${m.namespace}.${m.key} finns redan med typen ${m.actual}, mallen kräver ${m.expected}`);
    }
    throw new Error(
      "Metafältsdefinitioner med fel typ. Migrera värdena till ett nytt fält, ta bort den gamla definitionen " +
        "i Shopify admin (Inställningar → Anpassade data → Produkter) och kör skriptet igen.",
    );
  }

  const results = [];
  for (const def of PAKET_METAFIELD_DEFINITIONS) {
    const label = `${def.namespace}.${def.key}`;
    if (existingByKey.has(def.key)) {
      console.log(`  hoppa ${label} — finns redan (${def.type})`);
      results.push({ key: def.key, status: "exists" });
      continue;
    }
    if (!EXECUTE) {
      console.log(`  plan  ${label} (${def.type})`);
      results.push({ key: def.key, status: "planned" });
      continue;
    }
    const r = await createDefinition(def);
    console.log(`  ${r.status === "created" ? "skapa" : "hoppa"} ${label}`);
    results.push(r);
  }

  console.log("\n--- Nästa steg (manuellt i Shopify admin) ---");
  console.log("1. Skapa paketprodukten med eget pris och egna bilder (en variant räcker).");
  console.log("2. Webbshopsmall → välj `paket`.");
  console.log("3. Fyll i metafälten Paket: innehåll / antal per rad / tillval / sammanfattning / etikett.");
  console.log("4. Publicera temat: node scripts/push-edp-theme.mjs --execute");

  if (!EXECUTE) {
    console.log("\nKör med --execute för att skapa definitioner som saknas.");
  }

  return results;
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
