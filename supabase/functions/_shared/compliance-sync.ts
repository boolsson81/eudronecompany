/**
 * Upsert product_compliance rows and sync origin metafields to Shopify.
 */
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  evaluateComplianceRisk,
  resolveManualOrigin,
  type OriginResolution,
  type OriginSource,
} from "./origin-compliance.ts";
import type { SunskyNormalizedProduct } from "./sunsky-product-map.ts";

export type ProductComplianceRow = {
  tenant_id: string;
  shop_id: string;
  inventory_id?: string | null;
  page_id?: string | null;
  sku: string;
  product_title?: string | null;
  hs_code?: string | null;
  country_of_origin: string;
  origin_verified: boolean;
  origin_source: OriginSource;
  origin_last_verified_at?: string | null;
  contains_battery?: boolean;
  compliance_review_required: boolean;
  compliance_review_reasons: string[];
  auto_publish_blocked: boolean;
  auto_publish_block_reason?: string | null;
};

export function buildComplianceRecord(
  normalized: SunskyNormalizedProduct,
  ctx: {
    tenantId: string;
    shopId: string;
    pageId: string;
    inventoryId?: string | null;
    sku: string;
  },
): ProductComplianceRow {
  const evaluation = evaluateComplianceRisk({
    title: normalized.title,
    category: normalized.category_name,
    containsBattery: normalized.contains_battery,
    contains_battery: normalized.contains_battery,
    hs_code: normalized.hs_code,
    country_of_origin: normalized.country_of_origin,
    origin_verified: normalized.origin_verified,
  });

  return {
    tenant_id: ctx.tenantId,
    shop_id: ctx.shopId,
    inventory_id: ctx.inventoryId ?? null,
    page_id: ctx.pageId,
    sku: ctx.sku,
    product_title: normalized.title,
    hs_code: normalized.hs_code,
    country_of_origin: normalized.country_of_origin,
    origin_verified: normalized.origin_verified,
    origin_source: normalized.origin_source,
    origin_last_verified_at: normalized.origin_verified ? new Date().toISOString() : null,
    contains_battery: normalized.contains_battery,
    compliance_review_required: evaluation.compliance_review_required,
    compliance_review_reasons: evaluation.compliance_review_reasons,
    auto_publish_blocked: !evaluation.auto_publish_allowed,
    auto_publish_block_reason: evaluation.auto_publish_block_reasons.join("; ") || null,
  };
}

export async function upsertProductCompliance(
  supabase: SupabaseClient,
  record: ProductComplianceRow,
): Promise<void> {
  const { error } = await supabase.from("product_compliance").upsert(
    {
      ...record,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "shop_id,sku" },
  );
  if (error) {
    console.warn(`[compliance] upsert failed for ${record.sku}: ${error.message}`);
  }
}

export async function upsertComplianceFromNormalized(
  supabase: SupabaseClient,
  normalized: SunskyNormalizedProduct,
  ctx: {
    tenantId: string;
    shopId: string;
    pageId: string;
    inventoryId?: string | null;
    sku: string;
  },
): Promise<ProductComplianceRow> {
  const record = buildComplianceRecord(normalized, ctx);
  await upsertProductCompliance(supabase, record);
  return record;
}

export function applyManualOriginOverride(
  current: Pick<ProductComplianceRow, "country_of_origin" | "origin_verified" | "origin_source">,
  newCountry: string,
): OriginResolution & { origin_last_verified_at: string } {
  const resolved = resolveManualOrigin(newCountry);
  return {
    ...resolved,
    origin_last_verified_at: new Date().toISOString(),
  };
}

const METAFIELD_DEFINITIONS = [
  {
    namespace: "custom",
    key: "country_of_origin",
    name: "Country of origin",
    type: "single_line_text_field",
    ownerType: "PRODUCT",
  },
  {
    namespace: "custom",
    key: "origin_verified",
    name: "Origin verified",
    type: "boolean",
    ownerType: "PRODUCT",
  },
] as const;

export async function ensureOriginMetafieldDefinitions(
  graphqlUrl: string,
  accessToken: string,
  fetchFn: typeof fetch = fetch,
): Promise<void> {
  for (const def of METAFIELD_DEFINITIONS) {
    const mutation = `
      mutation metafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition { id }
          userErrors { field message code }
        }
      }
    `;
    const response = await fetchFn(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          definition: {
            namespace: def.namespace,
            key: def.key,
            name: def.name,
            type: def.type,
            ownerType: def.ownerType,
          },
        },
      }),
    });
    const result = await response.json();
    const errors = result?.data?.metafieldDefinitionCreate?.userErrors ?? [];
    const alreadyExists = errors.some(
      (e: { code?: string; message?: string }) =>
        e.code === "TAKEN" || String(e.message ?? "").includes("taken"),
    );
    if (errors.length > 0 && !alreadyExists) {
      console.warn(`[compliance-sync] metafield definition ${def.namespace}.${def.key}:`, errors);
    }
  }
}

export async function syncOriginMetafieldsToShopify(
  graphqlUrl: string,
  accessToken: string,
  productGid: string,
  compliance: Pick<ProductComplianceRow, "country_of_origin" | "origin_verified">,
  fetchFn: typeof fetch = fetch,
): Promise<boolean> {
  const mutation = `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id namespace key }
        userErrors { field message }
      }
    }
  `;
  const response = await fetchFn(graphqlUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        metafields: [
          {
            ownerId: productGid,
            namespace: "custom",
            key: "country_of_origin",
            type: "single_line_text_field",
            value: compliance.country_of_origin,
          },
          {
            ownerId: productGid,
            namespace: "custom",
            key: "origin_verified",
            type: "boolean",
            value: String(compliance.origin_verified),
          },
        ],
      },
    }),
  });
  const result = await response.json();
  const userErrors = result?.data?.metafieldsSet?.userErrors ?? [];
  if (userErrors.length > 0) {
    console.warn("[compliance-sync] metafieldsSet errors:", userErrors);
    return false;
  }
  return true;
}
