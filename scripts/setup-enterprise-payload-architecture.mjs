#!/usr/bin/env node
/**
 * Enterprise Payload Architecture — Phase 2 provisioning.
 *
 * Idempotently creates the Shopify metaobject definitions, product metafield
 * definitions (namespace `edp`), and seeds the payload/mission/platform/package
 * taxonomy from data/edp-payload-taxonomy.json.
 *
 * This documents and reproduces the setup that was applied directly against
 * the live store via the Shopify Admin GraphQL API on 2026-09-15 (see
 * docs/reports/ENTERPRISE_PAYLOAD_PHASE1_AUDIT.md and
 * docs/reports/ENTERPRISE_PAYLOAD_PHASE2_REPORT.md). Safe to re-run: every
 * write is a create-if-missing or a handle-based upsert.
 *
 * Usage:
 *   node scripts/setup-enterprise-payload-architecture.mjs              # dry-run (reports plan only)
 *   node scripts/setup-enterprise-payload-architecture.mjs --execute    # apply
 *
 * Requires Shopify Admin credentials — see scripts/lib/shopify-admin-client.mjs
 * (EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN / SHOPIFY_ADMIN_ACCESS_TOKEN, or the
 * Supabase test-integration proxy env vars).
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { shopifyGraphQL } from "./lib/shopify-admin-client.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXECUTE = process.argv.includes("--execute");
const taxonomy = JSON.parse(readFileSync(join(ROOT, "data/edp-payload-taxonomy.json"), "utf8"));

const log = (...a) => console.log(...a);

// ---------------------------------------------------------------------------
// Metaobject definitions
// ---------------------------------------------------------------------------

async function existingMetaobjectTypes() {
  const data = await shopifyGraphQL(
    `query { metaobjectDefinitions(first: 250) { nodes { id type } } }`,
  );
  return new Map((data?.metaobjectDefinitions?.nodes || []).map((n) => [n.type, n.id]));
}

const METAOBJECT_DEFS = [
  {
    type: "uav_platform",
    name: "UAV-plattform",
    description:
      "Kanonisk lista över drönarplattformar som payloads kan vara kompatibla med (DJI Matrice 400, Freefly Astro …).",
    displayNameKey: "name",
    access: { storefront: "PUBLIC_READ" },
    capabilities: { publishable: { enabled: true }, translatable: { enabled: true } },
    fieldDefinitions: [
      { key: "name", name: "Namn", type: "single_line_text_field", required: true },
      { key: "manufacturer", name: "Tillverkare", type: "single_line_text_field" },
      { key: "series", name: "Serie", type: "single_line_text_field" },
      { key: "mount_interface", name: "Monteringsgränssnitt", type: "list.single_line_text_field" },
      { key: "max_payload_weight", name: "Max nyttolast", type: "weight" },
      { key: "product", name: "Produkt i butiken", type: "product_reference" },
      { key: "collection", name: "Kollektion", type: "collection_reference" },
      { key: "image", name: "Bild", type: "file_reference", validations: [{ name: "file_type_options", value: '["Image"]' }] },
      { key: "legacy_fits_value", name: "Motsvarande värde i custom.passsar_till", type: "single_line_text_field" },
      { key: "description", name: "Beskrivning", type: "multi_line_text_field" },
      { key: "active", name: "Aktiv", type: "boolean" },
    ],
  },
  {
    type: "payload_category",
    name: "Payload-kategori",
    description: "Dimension 1: toppnivåkategori för payloads. Renderas som sida under /payloads/<handle>.",
    displayNameKey: "name",
    access: { storefront: "PUBLIC_READ" },
    capabilities: {
      publishable: { enabled: true },
      translatable: { enabled: true },
      renderable: { enabled: true, data: { metaTitleKey: "seo_title", metaDescriptionKey: "seo_description" } },
      onlineStore: { enabled: true, data: { urlHandle: "payloads", createRedirects: true } },
    },
    fieldDefinitions: [
      { key: "name", name: "Namn", type: "single_line_text_field", required: true },
      { key: "name_en", name: "Namn (engelska)", type: "single_line_text_field" },
      { key: "priority", name: "Sorteringsordning", type: "number_integer" },
      {
        key: "technology",
        name: "Teknologi (finder-nyckel)",
        type: "single_line_text_field",
        validations: [{ name: "choices", value: '["rgb","zoom","thermal","eo-ir","lidar","mapping","multispectral","hyperspectral","gas","radiation","spotlight","speaker","other"]' }],
      },
      { key: "short_description", name: "Kort beskrivning", type: "multi_line_text_field" },
      { key: "description", name: "Introduktion", type: "rich_text_field" },
      { key: "technical_overview", name: "Teknisk översikt", type: "rich_text_field" },
      { key: "buying_guide", name: "Köpguide", type: "rich_text_field" },
      { key: "icon", name: "Ikon", type: "single_line_text_field" },
      { key: "hero_image", name: "Hero-bild", type: "file_reference", validations: [{ name: "file_type_options", value: '["Image"]' }] },
      { key: "banner_image", name: "Bannerbild", type: "file_reference", validations: [{ name: "file_type_options", value: '["Image"]' }] },
      { key: "typical_customers", name: "Typiska kunder", type: "list.single_line_text_field" },
      { key: "featured_products", name: "Utvalda produkter", type: "list.product_reference" },
      { key: "featured_brands", name: "Utvalda varumärken", type: "list.single_line_text_field" },
      { key: "collection", name: "Produktkollektion", type: "collection_reference" },
      { key: "faq", name: "FAQ", type: "json" },
      { key: "seo_title", name: "SEO-titel", type: "single_line_text_field" },
      { key: "seo_description", name: "SEO-beskrivning", type: "multi_line_text_field" },
      { key: "active", name: "Aktiv", type: "boolean" },
    ],
  },
  {
    type: "payload_specification",
    name: "Payload-specifikation",
    description:
      "Fullständigt, grupperat specifikationsblad för en payload, refererad 1:1 från produkten via edp.specification. Lämna fält tomma i stället för att gissa.",
    displayNameKey: "name",
    access: { storefront: "PUBLIC_READ" },
    capabilities: { publishable: { enabled: true } },
    fieldDefinitions: [
      { key: "name", name: "Namn", type: "single_line_text_field", required: true },
      { key: "product", name: "Produkt", type: "product_reference" },
      { key: "source_url", name: "Källa (datablad)", type: "url" },
      { key: "sensor_type", name: "Sensortyp", type: "list.single_line_text_field", validations: [{ name: "choices", value: '["RGB","Zoom","Vidvinkel","Termisk","EO/IR","LiDAR","Multispektral","Hyperspektral","Gas","Strålning","Sökljus","Högtalare","Laseravståndsmätare","NIR","SWIR","Radar","AIS","Annat"]' }] },
      { key: "sensor_resolution", name: "Sensorupplösning", type: "single_line_text_field" },
      { key: "rgb_resolution", name: "RGB-upplösning", type: "single_line_text_field" },
      { key: "thermal_resolution", name: "Termisk upplösning", type: "single_line_text_field" },
      { key: "thermal_range", name: "Temperaturområde", type: "single_line_text_field" },
      { key: "radiometric", name: "Radiometrisk", type: "boolean" },
      { key: "optical_zoom", name: "Optisk zoom (×)", type: "number_decimal" },
      { key: "digital_zoom", name: "Digital zoom (×)", type: "number_decimal" },
      { key: "laser_rangefinder", name: "Laseravståndsmätare", type: "boolean" },
      { key: "laser_range", name: "Laserräckvidd (m)", type: "number_decimal" },
      { key: "spectral_range", name: "Spektralt område", type: "single_line_text_field" },
      { key: "wavelength", name: "Våglängd", type: "single_line_text_field" },
      { key: "lidar_range", name: "LiDAR-räckvidd (m)", type: "number_decimal" },
      { key: "lidar_accuracy", name: "LiDAR-noggrannhet", type: "single_line_text_field" },
      { key: "lidar_points_per_second", name: "LiDAR punkter/s", type: "number_integer" },
      { key: "frame_rate", name: "Bildfrekvens", type: "single_line_text_field" },
      { key: "field_of_view", name: "Synfält", type: "single_line_text_field" },
      { key: "gimbal_axes", name: "Gimbalaxlar", type: "number_integer" },
      { key: "stabilization", name: "Stabilisering", type: "single_line_text_field" },
      { key: "weight", name: "Vikt", type: "weight" },
      { key: "dimensions", name: "Mått", type: "single_line_text_field" },
      { key: "operating_temperature", name: "Drifttemperatur", type: "single_line_text_field" },
      { key: "ip_rating", name: "IP-klass", type: "single_line_text_field" },
      { key: "power_consumption", name: "Effektförbrukning", type: "single_line_text_field" },
      { key: "interface", name: "Gränssnitt", type: "list.single_line_text_field" },
      { key: "sdk_available", name: "SDK tillgängligt", type: "boolean" },
      { key: "rtsp", name: "RTSP", type: "boolean" },
      { key: "ethernet", name: "Ethernet", type: "boolean" },
      { key: "serial", name: "Seriell", type: "boolean" },
      { key: "other_interfaces", name: "Övriga gränssnitt", type: "list.single_line_text_field" },
      { key: "notes", name: "Anteckningar", type: "multi_line_text_field" },
    ],
  },
  {
    type: "payload_compatibility",
    name: "Payload-kompatibilitet",
    description:
      "En rad per kombination av payload-produkt och UAV-plattform, med explicit status. Skriv aldrig kompatibilitet som inte är verifierad — använd 'unknown'.",
    displayNameKey: "name",
    access: { storefront: "PUBLIC_READ" },
    capabilities: { publishable: { enabled: true } },
    fieldDefinitions: [
      { key: "name", name: "Namn", type: "single_line_text_field", required: true },
      { key: "payload_product", name: "Payload-produkt", type: "product_reference", required: true },
      { key: "platform", name: "UAV-plattform", type: "metaobject_reference", required: true, refType: "uav_platform" },
      {
        key: "status",
        name: "Kompatibilitetsstatus",
        type: "single_line_text_field",
        required: true,
        validations: [{ name: "choices", value: '["fully_compatible","compatible_with_adapter","compatible_with_integration","not_compatible","unknown"]' }],
      },
      { key: "adapter_product", name: "Adapter/tillbehör som krävs", type: "product_reference" },
      { key: "notes", name: "Anteckningar", type: "multi_line_text_field" },
      { key: "source", name: "Källa", type: "single_line_text_field" },
      { key: "verified_at", name: "Verifierad", type: "date" },
    ],
  },
  // mission is created WITHOUT solution_packages first (circular reference),
  // then patched below once solution_package exists.
  {
    type: "mission",
    name: "Uppdrag",
    description: "Dimension 2: operativt problem kunden vill lösa. Renderas som mission-sida.",
    displayNameKey: "name",
    access: { storefront: "PUBLIC_READ" },
    capabilities: {
      publishable: { enabled: true },
      translatable: { enabled: true },
      renderable: { enabled: true, data: { metaTitleKey: "seo_title", metaDescriptionKey: "seo_description" } },
      onlineStore: { enabled: true, data: { urlHandle: "missions", createRedirects: true } },
    },
    fieldDefinitions: [
      { key: "name", name: "Namn", type: "single_line_text_field", required: true },
      { key: "name_en", name: "Namn (engelska)", type: "single_line_text_field" },
      { key: "description", name: "Beskrivning", type: "rich_text_field" },
      { key: "hero_image", name: "Hero-bild", type: "file_reference", validations: [{ name: "file_type_options", value: '["Image"]' }] },
      { key: "industry", name: "Bransch", type: "single_line_text_field" },
      { key: "customer_type", name: "Kundtyp", type: "list.single_line_text_field" },
      { key: "problem_statement", name: "Problembeskrivning", type: "multi_line_text_field" },
      { key: "tasks", name: "Uppgifter (finder-nycklar)", type: "list.single_line_text_field" },
      { key: "technologies", name: "Relevanta teknologier (finder-nycklar)", type: "list.single_line_text_field" },
      { key: "environments", name: "Miljöer (finder-nycklar)", type: "list.single_line_text_field" },
      { key: "recommended_uav_types", name: "Rekommenderade UAV-typer", type: "list.metaobject_reference", refType: "uav_platform" },
      { key: "recommended_payloads", name: "Rekommenderade payloads", type: "list.product_reference" },
      { key: "recommended_accessories", name: "Rekommenderade tillbehör", type: "list.product_reference" },
      { key: "recommended_software", name: "Rekommenderad programvara", type: "list.product_reference" },
      { key: "recommended_services", name: "Rekommenderade tjänster", type: "list.product_reference" },
      { key: "case_studies", name: "Referensuppdrag", type: "multi_line_text_field" },
      { key: "buying_guide", name: "Köpguide", type: "rich_text_field" },
      { key: "faq", name: "FAQ", type: "json" },
      { key: "seo_title", name: "SEO-titel", type: "single_line_text_field" },
      { key: "seo_description", name: "SEO-beskrivning", type: "multi_line_text_field" },
      { key: "active", name: "Aktiv", type: "boolean" },
    ],
  },
  {
    type: "payload_subcategory",
    name: "Payload-underkategori",
    description: "Dimension 1, andra nivån. Refererar till en payload_category.",
    displayNameKey: "name",
    access: { storefront: "PUBLIC_READ" },
    capabilities: { publishable: { enabled: true }, translatable: { enabled: true } },
    fieldDefinitions: [
      { key: "name", name: "Namn", type: "single_line_text_field", required: true },
      { key: "name_en", name: "Namn (engelska)", type: "single_line_text_field" },
      { key: "parent_category", name: "Överordnad kategori", type: "metaobject_reference", required: true, refType: "payload_category" },
      { key: "description", name: "Beskrivning", type: "multi_line_text_field" },
      { key: "technical_description", name: "Teknisk beskrivning", type: "rich_text_field" },
      { key: "typical_use_cases", name: "Typiska användningsfall", type: "list.single_line_text_field" },
      { key: "key_specifications", name: "Nyckelspecifikationer", type: "list.single_line_text_field" },
      { key: "recommended_missions", name: "Rekommenderade uppdrag", type: "list.metaobject_reference", refType: "mission" },
      { key: "products", name: "Produkter", type: "list.product_reference" },
      { key: "seo_title", name: "SEO-titel", type: "single_line_text_field" },
      { key: "seo_description", name: "SEO-beskrivning", type: "multi_line_text_field" },
      { key: "active", name: "Aktiv", type: "boolean" },
    ],
  },
  {
    type: "solution_package",
    name: "Lösningspaket",
    description: "En strukturerad mission-lösning: UAV + payload(s) + tillbehör + programvara + utbildning + service.",
    displayNameKey: "name",
    access: { storefront: "PUBLIC_READ" },
    capabilities: {
      publishable: { enabled: true },
      translatable: { enabled: true },
      renderable: { enabled: true },
      onlineStore: { enabled: true, data: { urlHandle: "solutions", createRedirects: true } },
    },
    fieldDefinitions: [
      { key: "name", name: "Namn", type: "single_line_text_field", required: true },
      { key: "name_en", name: "Namn (engelska)", type: "single_line_text_field" },
      { key: "mission", name: "Uppdrag", type: "metaobject_reference", refType: "mission" },
      { key: "description", name: "Beskrivning", type: "rich_text_field" },
      { key: "uav_products", name: "UAV", type: "list.product_reference" },
      { key: "payload_products", name: "Payloads", type: "list.product_reference" },
      { key: "accessory_products", name: "Tillbehör", type: "list.product_reference" },
      { key: "software_products", name: "Programvara", type: "list.product_reference" },
      { key: "training_products", name: "Utbildning", type: "list.product_reference" },
      { key: "service_products", name: "Service", type: "list.product_reference" },
      { key: "components_summary", name: "Komponentöversikt", type: "list.single_line_text_field" },
      { key: "estimated_price_note", name: "Prisanteckning", type: "single_line_text_field" },
      { key: "seo_title", name: "SEO-titel", type: "single_line_text_field" },
      { key: "seo_description", name: "SEO-beskrivning", type: "multi_line_text_field" },
      { key: "active", name: "Aktiv", type: "boolean" },
    ],
  },
];

function resolveRefTypes(fieldDefinitions, typeIds) {
  return fieldDefinitions.map((f) => {
    if (!f.refType) return f;
    const { refType, ...rest } = f;
    const id = typeIds.get(refType);
    if (!id) throw new Error(`Cannot resolve metaobject_definition_id for type "${refType}" — create it first`);
    return { ...rest, validations: [{ name: "metaobject_definition_id", value: id }] };
  });
}

async function ensureMetaobjectDefinitions() {
  const existing = await existingMetaobjectTypes();
  for (const def of METAOBJECT_DEFS) {
    if (existing.has(def.type)) {
      log(`  = metaobject definition "${def.type}" already exists`);
      continue;
    }
    const fieldDefinitions = resolveRefTypes(def.fieldDefinitions, existing);
    log(`  + creating metaobject definition "${def.type}"`);
    if (!EXECUTE) continue;
    const data = await shopifyGraphQL(
      `mutation CreateDef($definition: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition { id type }
          userErrors { field message code }
        }
      }`,
      { definition: { ...def, fieldDefinitions } },
    );
    const errs = data?.metaobjectDefinitionCreate?.userErrors || [];
    if (errs.length) throw new Error(`${def.type}: ${errs.map((e) => e.message).join("; ")}`);
    existing.set(def.type, data.metaobjectDefinitionCreate.metaobjectDefinition.id);
  }

  // Patch mission with the solution_packages back-reference now that
  // solution_package exists (breaks the mission <-> solution_package cycle).
  const missionId = existing.get("mission");
  const packageId = existing.get("solution_package");
  if (missionId && packageId) {
    const check = await shopifyGraphQL(
      `query($id: ID!) { metaobjectDefinition(id: $id) { fieldDefinitions { key } } }`,
      { id: missionId },
    );
    const hasField = (check?.metaobjectDefinition?.fieldDefinitions || []).some((f) => f.key === "solution_packages");
    if (!hasField) {
      log(`  + adding mission.solution_packages field`);
      if (EXECUTE) {
        const data = await shopifyGraphQL(
          `mutation($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
            metaobjectDefinitionUpdate(id: $id, definition: $definition) {
              userErrors { field message code }
            }
          }`,
          {
            id: missionId,
            definition: {
              fieldDefinitions: [
                {
                  create: {
                    key: "solution_packages",
                    name: "Lösningspaket",
                    type: "list.metaobject_reference",
                    validations: [{ name: "metaobject_definition_id", value: packageId }],
                  },
                },
              ],
            },
          },
        );
        const errs = data?.metaobjectDefinitionUpdate?.userErrors || [];
        if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
      }
    } else {
      log(`  = mission.solution_packages already present`);
    }
  }

  return existing;
}

// ---------------------------------------------------------------------------
// Product metafield definitions (namespace: edp)
// ---------------------------------------------------------------------------

function edpMetafieldDefs(typeIds) {
  const ref = (type) => [{ name: "metaobject_definition_id", value: typeIds.get(type) }];
  return [
    // Classification
    { key: "payload_category", name: "Payload-kategori", type: "metaobject_reference", validations: ref("payload_category") },
    { key: "payload_subcategory", name: "Payload-underkategori", type: "list.metaobject_reference", validations: ref("payload_subcategory") },
    { key: "mission_types", name: "Uppdragstyper", type: "list.metaobject_reference", validations: ref("mission") },
    { key: "industry", name: "Bransch", type: "list.single_line_text_field", validations: [{ name: "choices", value: '["public-safety","energy","infrastructure","construction","forestry","agriculture","industrial","mining","security","maritime","research"]' }] },
    { key: "customer_segment", name: "Kundsegment", type: "list.single_line_text_field", validations: [{ name: "choices", value: '["Enterprise","Myndighet","SMB","Prosumer","Forskning"]' }] },
    // Compatibility
    { key: "compatible_uav", name: "Kompatibla UAV-plattformar", type: "list.metaobject_reference", validations: ref("uav_platform") },
    { key: "compatibility_records", name: "Kompatibilitetsrader", type: "list.metaobject_reference", validations: ref("payload_compatibility") },
    { key: "compatible_mount", name: "Kompatibelt fäste", type: "list.single_line_text_field" },
    { key: "compatible_battery", name: "Kompatibelt batteri", type: "list.single_line_text_field" },
    { key: "compatible_controller", name: "Kompatibel fjärrkontroll", type: "list.single_line_text_field" },
    { key: "specification", name: "Specifikation", type: "metaobject_reference", validations: ref("payload_specification") },
    // Technical
    { key: "sensor_type", name: "Sensortyp", type: "list.single_line_text_field", validations: [{ name: "choices", value: '["RGB","Zoom","Vidvinkel","Termisk","EO/IR","LiDAR","Multispektral","Hyperspektral","Gas","Strålning","Sökljus","Högtalare","Laseravståndsmätare","NIR","SWIR","Radar","AIS","Annat"]' }] },
    { key: "sensor_resolution", name: "Sensorupplösning", type: "single_line_text_field" },
    { key: "thermal_resolution", name: "Termisk upplösning", type: "single_line_text_field" },
    { key: "optical_zoom", name: "Optisk zoom (×)", type: "number_decimal" },
    { key: "digital_zoom", name: "Digital zoom (×)", type: "number_decimal" },
    { key: "laser_rangefinder", name: "Laseravståndsmätare", type: "boolean" },
    { key: "lidar_range", name: "LiDAR-räckvidd (m)", type: "number_decimal" },
    { key: "accuracy", name: "Noggrannhet", type: "single_line_text_field" },
    { key: "weight", name: "Vikt", type: "weight" },
    { key: "ip_rating", name: "IP-klass", type: "single_line_text_field" },
    { key: "operating_temperature", name: "Drifttemperatur", type: "single_line_text_field" },
    // Commercial
    { key: "enterprise_product", name: "Enterprise-produkt", type: "boolean" },
    { key: "professional_grade", name: "Professionell klass", type: "boolean" },
    { key: "mission_critical", name: "Verksamhetskritisk", type: "boolean" },
    { key: "requires_quote", name: "Kräver offert", type: "boolean" },
    { key: "lead_time", name: "Leveranstid", type: "single_line_text_field" },
    { key: "demo_available", name: "Demo tillgänglig", type: "boolean" },
    { key: "training_available", name: "Utbildning tillgänglig", type: "boolean" },
    { key: "installation_available", name: "Installation tillgänglig", type: "boolean" },
    { key: "integration_available", name: "Integration tillgänglig", type: "boolean" },
    { key: "service_available", name: "Service tillgänglig", type: "boolean" },
    // Software
    { key: "software_required", name: "Programvara krävs", type: "boolean" },
    { key: "software_compatible", name: "Kompatibel programvara", type: "list.single_line_text_field" },
    { key: "sdk_available", name: "SDK tillgängligt", type: "boolean" },
    { key: "api_available", name: "API tillgängligt", type: "boolean" },
    // Bundling
    { key: "recommended_accessories", name: "Rekommenderade tillbehör", type: "list.product_reference" },
    { key: "required_accessories", name: "Nödvändiga tillbehör", type: "list.product_reference" },
    { key: "solution_packages", name: "Lösningspaket", type: "list.metaobject_reference", validations: ref("solution_package") },
    // Data quality
    { key: "data_quality_status", name: "Datakvalitetsstatus", type: "single_line_text_field", access: { storefront: "NONE" }, validations: [{ name: "choices", value: '["complete","needs_review","missing_data","compatibility_review_required"]' }] },
    { key: "data_quality_notes", name: "Datakvalitetsanteckningar", type: "multi_line_text_field", access: { storefront: "NONE" } },
  ];
}

async function ensureMetafieldDefinitions(typeIds) {
  const data = await shopifyGraphQL(
    `query { metafieldDefinitions(ownerType: PRODUCT, namespace: "edp", first: 100) { nodes { key } } }`,
  );
  const existing = new Set((data?.metafieldDefinitions?.nodes || []).map((n) => n.key));

  for (const def of edpMetafieldDefs(typeIds)) {
    if (existing.has(def.key)) {
      log(`  = metafield edp.${def.key} already exists`);
      continue;
    }
    log(`  + creating metafield edp.${def.key}`);
    if (!EXECUTE) continue;
    const data = await shopifyGraphQL(
      `mutation CreateMf($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition { id key }
          userErrors { field message code }
        }
      }`,
      {
        definition: {
          namespace: "edp",
          ownerType: "PRODUCT",
          access: { storefront: "PUBLIC_READ" },
          ...def,
        },
      },
    );
    const errs = data?.metafieldDefinitionCreate?.userErrors || [];
    if (errs.length) throw new Error(`edp.${def.key}: ${errs.map((e) => e.message).join("; ")}`);
  }
}

// ---------------------------------------------------------------------------
// Taxonomy seeding (metaobjects)
// ---------------------------------------------------------------------------

async function upsertMetaobject(type, handle, fields) {
  log(`  upsert ${type}/${handle}`);
  if (!EXECUTE) return null;
  const data = await shopifyGraphQL(
    `mutation($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
      metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
        metaobject { id handle }
        userErrors { field message code }
      }
    }`,
    {
      handle: { type, handle },
      metaobject: {
        fields: Object.entries(fields)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([key, value]) => ({ key, value: typeof value === "string" ? value : JSON.stringify(value) })),
      },
    },
  );
  const errs = data?.metaobjectUpsert?.userErrors || [];
  if (errs.length) throw new Error(`${type}/${handle}: ${errs.map((e) => e.message).join("; ")}`);
  return data.metaobjectUpsert.metaobject.id;
}

async function seedTaxonomy() {
  const categoryIds = {};
  for (const cat of taxonomy.categories) {
    categoryIds[cat.handle] = await upsertMetaobject("payload_category", cat.handle, {
      name: cat.name,
      name_en: cat.name_en,
      priority: String(cat.priority),
      technology: cat.technology,
      short_description: cat.short_description,
      typical_customers: cat.typical_customers,
      active: "true",
    });
  }

  for (const cat of taxonomy.categories) {
    const parentId = categoryIds[cat.handle];
    for (const sub of cat.subcategories) {
      await upsertMetaobject("payload_subcategory", sub.handle, {
        name: sub.name,
        name_en: sub.name_en,
        parent_category: parentId,
        active: "true",
      });
    }
  }

  const missionIds = {};
  for (const group of taxonomy.mission_groups) {
    for (const m of group.missions) {
      missionIds[m.handle] = await upsertMetaobject("mission", m.handle, {
        name: m.name,
        name_en: m.name_en,
        industry: group.industry,
        problem_statement: m.problem,
        tasks: m.tasks,
        technologies: m.technologies,
        environments: m.environments,
        active: "true",
      });
    }
  }

  const platformIds = {};
  for (const p of taxonomy.platforms) {
    platformIds[p.handle] = await upsertMetaobject("uav_platform", p.handle, {
      name: p.name,
      manufacturer: p.manufacturer || undefined,
      series: p.series || undefined,
      mount_interface: p.mount_interface?.length ? p.mount_interface : undefined,
      legacy_fits_value: p.legacy_fits_value || undefined,
      active: "true",
    });
  }

  const packageIds = {};
  for (const pkg of taxonomy.packages) {
    packageIds[pkg.handle] = await upsertMetaobject("solution_package", pkg.handle, {
      name: pkg.name,
      name_en: pkg.name_en,
      mission: missionIds[pkg.mission],
      components_summary: pkg.components,
      active: "true",
    });
  }

  for (const pkg of taxonomy.packages) {
    await upsertMetaobject("mission", pkg.mission, {
      solution_packages: [packageIds[pkg.handle]],
    });
  }

  return { categoryIds, missionIds, platformIds, packageIds };
}

// ---------------------------------------------------------------------------

async function main() {
  log(`Enterprise Payload Architecture setup — ${EXECUTE ? "EXECUTE" : "DRY RUN (pass --execute to apply)"}\n`);

  log("Step 1/3 — metaobject definitions");
  const typeIds = await ensureMetaobjectDefinitions();

  log("\nStep 2/3 — product metafield definitions (namespace edp)");
  await ensureMetafieldDefinitions(typeIds);

  log("\nStep 3/3 — taxonomy (categories, subcategories, missions, platforms, packages)");
  const ids = await seedTaxonomy();

  log("\nDone.");
  if (EXECUTE) {
    log(`Categories: ${Object.keys(ids.categoryIds).length}`);
    log(`Missions: ${Object.keys(ids.missionIds).length}`);
    log(`Platforms: ${Object.keys(ids.platformIds).length}`);
    log(`Packages: ${Object.keys(ids.packageIds).length}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
