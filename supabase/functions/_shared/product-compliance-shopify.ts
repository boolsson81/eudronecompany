import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  COMPLIANCE_METAFIELD_DEFINITIONS,
  COMPLIANCE_METAFIELDS,
  COMPLIANCE_NAMESPACE,
  ProductComplianceData,
  metafieldsToCompliance,
  validateCompliance,
} from "./product-compliance.ts";
import { ShopifyContext, shopifyGraphQL } from "./shopify-client.ts";

function metafieldInput(ownerId: string, key: string, type: string, value: string) {
  return { ownerId, namespace: COMPLIANCE_NAMESPACE, key, type, value };
}

export async function ensureComplianceMetafieldDefinitions(ctx: ShopifyContext): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  for (const def of COMPLIANCE_METAFIELD_DEFINITIONS) {
    const data = await shopifyGraphQL(ctx, `mutation($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition { id }
        userErrors { field message code }
      }
    }`, {
      definition: {
        name: def.name,
        namespace: COMPLIANCE_NAMESPACE,
        key: def.key,
        type: def.type,
        ownerType: "PRODUCT",
        access: { storefront: "PUBLIC_READ" },
      },
    });
    const errors = data?.metafieldDefinitionCreate?.userErrors ?? [];
    if (errors.some((e: { code?: string }) => e.code === "TAKEN" || /already exists/i.test(e.message ?? ""))) {
      skipped++;
    } else if (errors.length > 0) {
      skipped++;
    } else {
      created++;
    }
  }

  return { created, skipped };
}

export async function fetchProductComplianceFromShopify(
  ctx: ShopifyContext,
  productId: string | number,
): Promise<ProductComplianceData> {
  const gid = String(productId).startsWith("gid://") ? String(productId) : `gid://shopify/Product/${productId}`;
  const data = await shopifyGraphQL(ctx, `query($id: ID!) {
    product(id: $id) {
      id title
      variants(first: 1) { edges { node { sku } } }
      metafields(first: 10, namespace: "${COMPLIANCE_NAMESPACE}") {
        edges { node { key value type } }
      }
    }
  }`, { id: gid });

  const fields = new Map<string, string>();
  for (const edge of data?.product?.metafields?.edges ?? []) {
    fields.set(edge.node.key, edge.node.value);
  }
  return metafieldsToCompliance(fields);
}

export async function setProductComplianceOnShopify(
  ctx: ShopifyContext,
  productId: string | number,
  compliance: ProductComplianceData,
): Promise<void> {
  const gid = String(productId).startsWith("gid://") ? String(productId) : `gid://shopify/Product/${productId}`;
  const metafields = [];

  if (compliance.hs_code) {
    metafields.push(metafieldInput(gid, COMPLIANCE_METAFIELDS.hsCode, "single_line_text_field", compliance.hs_code.replace(/\D/g, "")));
  }
  if (compliance.country_of_origin) {
    metafields.push(metafieldInput(gid, COMPLIANCE_METAFIELDS.countryOfOrigin, "single_line_text_field", compliance.country_of_origin.toUpperCase()));
  }
  if (compliance.economic_operator) {
    metafields.push(metafieldInput(gid, COMPLIANCE_METAFIELDS.economicOperator, "single_line_text_field", compliance.economic_operator));
  }
  if (compliance.battery_type) {
    metafields.push(metafieldInput(gid, COMPLIANCE_METAFIELDS.batteryType, "single_line_text_field", compliance.battery_type));
  }
  if (compliance.ce_document_url) {
    metafields.push(metafieldInput(gid, COMPLIANCE_METAFIELDS.ceDocumentUrl, "url", compliance.ce_document_url));
  }

  if (metafields.length === 0) return;

  await shopifyGraphQL(ctx, `mutation($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) { userErrors { field message } }
  }`, { metafields });
}

export async function upsertProductComplianceInSupabase(
  supabase: SupabaseClient,
  shopId: string,
  shopifyProductId: string | number,
  productTitle: string | null,
  sku: string | null,
  compliance: ProductComplianceData,
): Promise<void> {
  const validation_errors = validateCompliance(compliance);

  await supabase.from("product_compliance").upsert({
    shop_id: shopId,
    shopify_product_id: Number(shopifyProductId),
    product_title: productTitle,
    sku,
    hs_code: compliance.hs_code?.replace(/\D/g, "") || null,
    country_of_origin: compliance.country_of_origin?.toUpperCase() || null,
    economic_operator: compliance.economic_operator || null,
    battery_type: compliance.battery_type || null,
    ce_document_url: compliance.ce_document_url || null,
    validation_errors,
    synced_from_shopify_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "shop_id,shopify_product_id" });
}

export async function syncProductComplianceFromShopify(
  supabase: SupabaseClient,
  ctx: ShopifyContext,
  shopId: string,
  productId: string | number,
  productTitle?: string | null,
  sku?: string | null,
): Promise<ProductComplianceData> {
  const compliance = await fetchProductComplianceFromShopify(ctx, productId);
  await upsertProductComplianceInSupabase(supabase, shopId, productId, productTitle ?? null, sku ?? null, compliance);
  return compliance;
}
