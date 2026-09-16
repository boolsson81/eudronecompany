/**
 * Katalog-hälsokontroll för enterprise payload-produkter (fas 7).
 *
 * Går igenom produkter som klassificerats i payload-taxonomin (har
 * edp.payload_category satt, eller edp.enterprise_product = true) och sätter
 * edp.data_quality_status / edp.data_quality_notes utifrån vilka fält som
 * faktiskt finns ifyllda — gissar aldrig ett värde, bara rapporterar vad som
 * saknas.
 *
 * Status (samma choices som metafältets validering):
 *   - "missing_data": ingen payload-kategori satt än — produkten är inte
 *     klassificerad i taxonomin.
 *   - "compatibility_review_required": klassificerad, men varken
 *     edp.compatibility_records eller edp.compatible_uav är ifyllt — enligt
 *     datakvalitetsregeln får kompatibilitet aldrig antas.
 *   - "needs_review": klassificerad och kompatibilitet finns, men varken
 *     edp.specification eller de vanligaste tekniska fälten
 *     (sensor_type/sensor_resolution/weight/ip_rating) är ifyllda.
 *   - "complete": klassificering, kompatibilitet och minst grundläggande
 *     teknisk data finns.
 *
 * Dry-run som standard (skriver bara en rapport). Kör med --execute för att
 * faktiskt uppdatera edp.data_quality_status/notes i Shopify.
 */
import { shopifyGraphQL } from "./lib/shopify-admin-client.mjs";

const EXECUTE = process.argv.includes("--execute");

const PRODUCTS_QUERY = `
  query PayloadProducts($cursor: String) {
    products(first: 100, after: $cursor, query: "metafield:edp.enterprise_product:true OR metafield:edp.payload_category:*") {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        handle
        title
        category: metafield(namespace: "edp", key: "payload_category") { value }
        compatRecords: metafield(namespace: "edp", key: "compatibility_records") { value }
        compatUav: metafield(namespace: "edp", key: "compatible_uav") { value }
        spec: metafield(namespace: "edp", key: "specification") { value }
        sensorType: metafield(namespace: "edp", key: "sensor_type") { value }
        sensorResolution: metafield(namespace: "edp", key: "sensor_resolution") { value }
        weight: metafield(namespace: "edp", key: "weight") { value }
        ipRating: metafield(namespace: "edp", key: "ip_rating") { value }
      }
    }
  }
`;

const SET_STATUS_MUTATION = `
  mutation SetDataQuality($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id }
      userErrors { field message }
    }
  }
`;

export function isBlank(value) {
  if (value === null || value === undefined) return true;
  if (value === "") return true;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.length === 0;
  } catch {
    /* not JSON — a plain scalar string counts as present */
  }
  return false;
}

export function evaluate(product) {
  const notes = [];

  if (isBlank(product.category?.value)) {
    notes.push("Ingen payload-kategori satt (edp.payload_category).");
    return { status: "missing_data", notes };
  }

  const hasCompatibility = !isBlank(product.compatRecords?.value) || !isBlank(product.compatUav?.value);
  if (!hasCompatibility) {
    notes.push("Ingen UAV-kompatibilitet registrerad (edp.compatibility_records eller edp.compatible_uav).");
    return { status: "compatibility_review_required", notes };
  }

  const hasSpec = !isBlank(product.spec?.value);
  const hasBasicTechFields =
    !isBlank(product.sensorType?.value) ||
    !isBlank(product.sensorResolution?.value) ||
    !isBlank(product.weight?.value) ||
    !isBlank(product.ipRating?.value);

  if (!hasSpec && !hasBasicTechFields) {
    notes.push("Ingen teknisk specifikation (varken edp.specification eller grundläggande edp.*-fält som sensor_type/vikt/IP-klass).");
    return { status: "needs_review", notes };
  }

  return { status: "complete", notes: [] };
}

async function fetchPayloadProducts() {
  const products = [];
  let cursor = null;
  for (;;) {
    const data = await shopifyGraphQL(PRODUCTS_QUERY, { cursor });
    products.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return products;
}

async function main() {
  console.log(`Katalog-hälsokontroll för enterprise payload-produkter (${EXECUTE ? "EXECUTE" : "DRY-RUN"})\n`);

  const products = await fetchPayloadProducts();
  console.log(`Hittade ${products.length} klassificerade payload-produkter.\n`);

  const counts = { complete: 0, needs_review: 0, missing_data: 0, compatibility_review_required: 0 };
  const updates = [];

  for (const product of products) {
    const { status, notes } = evaluate(product);
    counts[status] += 1;
    updates.push({ product, status, notes });
    if (status !== "complete") {
      console.log(`  [${status}] ${product.title} (${product.handle})`);
      for (const note of notes) console.log(`      - ${note}`);
    }
  }

  console.log("\nSammanfattning:");
  for (const [status, count] of Object.entries(counts)) {
    console.log(`  ${status}: ${count}`);
  }

  if (!EXECUTE) {
    console.log("\nDry-run — inga ändringar skrivna. Kör med --execute för att uppdatera edp.data_quality_status/notes.");
    return;
  }

  console.log("\nSkriver edp.data_quality_status/notes...");
  const BATCH_SIZE = 25;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    const metafields = batch.flatMap(({ product, status, notes }) => [
      { ownerId: product.id, namespace: "edp", key: "data_quality_status", type: "single_line_text_field", value: status },
      { ownerId: product.id, namespace: "edp", key: "data_quality_notes", type: "multi_line_text_field", value: notes.join("\n") },
    ]);
    const result = await shopifyGraphQL(SET_STATUS_MUTATION, { metafields });
    const errors = result.metafieldsSet.userErrors;
    if (errors?.length) {
      console.error("  Fel:", errors.map((e) => e.message).join("; "));
    } else {
      console.log(`  Uppdaterade ${batch.length} produkter (${i + batch.length}/${updates.length}).`);
    }
  }

  console.log("\nKlart.");
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
