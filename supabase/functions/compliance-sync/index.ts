// Product compliance sync — Supabase ↔ Shopify metafields.
// Single Deno.serve handler; every action is gated by requireShopAccess.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getShopifyContext } from "../_shared/shopify-client.ts";
import { requireShopAccess, jsonResponse, errorResponse, jsonHeaders } from "../_shared/shopify-auth.ts";
import {
  setProductComplianceOnShopify,
  syncProductComplianceFromShopify,
} from "../_shared/product-compliance-shopify.ts";
import { validateCompliance } from "../_shared/product-compliance.ts";
import {
  buildComplianceRecord,
  ensureOriginMetafieldDefinitions,
  syncOriginMetafieldsToShopify,
  upsertProductCompliance,
} from "../_shared/compliance-sync.ts";
import { evaluateComplianceRisk, resolveManualOrigin } from "../_shared/origin-compliance.ts";

type Action =
  | "push"
  | "pull"
  | "pull_all"
  | "sync_sku"
  | "sync_shop"
  | "manual_override"
  | "force_publish"
  | "ensure_metafield_definitions";

async function auditLog(
  supabase: ReturnType<typeof createClient>,
  entry: {
    tenant_id: string;
    shop_id: string;
    sku: string;
    action: string;
    changed_by?: string | null;
    before_values?: Record<string, unknown>;
    after_values?: Record<string, unknown>;
    reason?: string;
  },
) {
  await supabase.from("product_compliance_audit_log").insert({
    ...entry,
    changed_fields: entry.after_values ? Object.keys(entry.after_values) : [],
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });
  try {
    const body = await req.json();
    const action = (body.action ?? "push") as Action;
    const shop_id = body.shop_id as string | undefined;

    // AuthZ: every action requires the caller to have access to shop_id.
    const authorized = await requireShopAccess(req, shop_id);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ---- push / pull / pull_all (Shopify metafield round-trip) ----
    if (action === "pull" && body.product_id) {
      const ctx = await getShopifyContext({ shopId: shop_id!, fnName: "compliance-sync" });
      const complianceData = await syncProductComplianceFromShopify(supabase, ctx, shop_id!, body.product_id);
      return jsonResponse({ success: true, compliance: complianceData });
    }

    if (action === "pull_all" && Array.isArray(body.shopify_product_ids)) {
      const ctx = await getShopifyContext({ shopId: shop_id!, fnName: "compliance-sync" });
      let synced = 0;
      for (const pid of body.shopify_product_ids.slice(0, 100)) {
        await syncProductComplianceFromShopify(supabase, ctx, shop_id!, pid);
        synced++;
      }
      return jsonResponse({ success: true, synced });
    }

    if (action === "push" && body.product_id && body.compliance) {
      const ctx = await getShopifyContext({ shopId: shop_id!, fnName: "compliance-sync" });
      const compliance = body.compliance;
      const issues = validateCompliance(compliance);
      const errors = issues.filter((i) => i.severity === "error");
      if (errors.length > 0) {
        return jsonResponse({ success: false, validation_errors: errors }, 400);
      }

      await setProductComplianceOnShopify(ctx, body.product_id, compliance);

      const { data: row } = await supabase
        .from("product_compliance")
        .select("product_title, sku")
        .eq("shop_id", shop_id!)
        .eq("shopify_product_id", Number(body.product_id))
        .maybeSingle();

      await supabase.from("product_compliance").upsert({
        shop_id: shop_id!,
        shopify_product_id: Number(body.product_id),
        product_title: row?.product_title ?? compliance.product_title ?? null,
        sku: row?.sku ?? compliance.sku ?? null,
        hs_code: compliance.hs_code?.replace(/\D/g, "") || null,
        country_of_origin: compliance.country_of_origin?.toUpperCase() || null,
        economic_operator: compliance.economic_operator || null,
        battery_type: compliance.battery_type || null,
        ce_document_url: compliance.ce_document_url || null,
        validation_errors: issues,
        updated_at: new Date().toISOString(),
      }, { onConflict: "shop_id,shopify_product_id" });

      return jsonResponse({ success: true, validation_errors: issues });
    }

    // ---- Bulk actions that need shop.tenant_id + integrations credentials ----
    const { data: shop } = await supabase
      .from("shops")
      .select("id, tenant_id, domain, platform")
      .eq("id", shop_id!)
      .maybeSingle();

    if (!shop?.tenant_id) {
      return jsonResponse({ error: "shop not found" }, 404);
    }

    const { data: integration } = await supabase
      .from("integrations")
      .select("credentials")
      .eq("shop_id", shop_id!)
      .eq("integration_type", "shopify")
      .maybeSingle();

    const accessToken = (integration?.credentials as { access_token?: string })?.access_token;
    const graphqlUrl = shop.domain
      ? `https://${shop.domain}/admin/api/2024-01/graphql.json`
      : null;

    if (action === "ensure_metafield_definitions") {
      if (!graphqlUrl || !accessToken) {
        return jsonResponse({ error: "Shopify not configured" }, 400);
      }
      await ensureOriginMetafieldDefinitions(graphqlUrl, accessToken);
      return jsonResponse({ ok: true, action });
    }

    if (action === "manual_override") {
      const sku = body.sku as string;
      const country = body.country_of_origin as string;
      if (!sku || !country) {
        return jsonResponse({ error: "sku and country_of_origin required" }, 400);
      }

      const origin = resolveManualOrigin(country);
      const { data: inv } = await supabase
        .from("inventory")
        .select("id, page_id, product_title, hs_code, contains_battery, category")
        .eq("shop_id", shop_id!)
        .eq("sku", sku)
        .maybeSingle();

      const evaluation = evaluateComplianceRisk({
        title: inv?.product_title,
        category: inv?.category,
        contains_battery: inv?.contains_battery,
        hs_code: inv?.hs_code,
        country_of_origin: origin.country_of_origin,
        origin_verified: origin.origin_verified,
      });

      const record = {
        tenant_id: shop.tenant_id,
        shop_id: shop_id!,
        inventory_id: inv?.id ?? null,
        page_id: inv?.page_id ?? null,
        sku,
        product_title: inv?.product_title ?? null,
        hs_code: inv?.hs_code ?? null,
        country_of_origin: origin.country_of_origin,
        origin_verified: origin.origin_verified,
        origin_source: origin.origin_source,
        origin_last_verified_at: new Date().toISOString(),
        contains_battery: inv?.contains_battery ?? false,
        compliance_review_required: evaluation.compliance_review_required,
        compliance_review_reasons: evaluation.compliance_review_reasons,
        auto_publish_blocked: !evaluation.auto_publish_allowed,
        auto_publish_block_reason: evaluation.auto_publish_block_reasons.join("; ") || null,
      };

      await upsertProductCompliance(supabase, record);

      await auditLog(supabase, {
        tenant_id: shop.tenant_id,
        shop_id: shop_id!,
        sku,
        action: "manual_override",
        // Force server-authenticated user id; never trust client-supplied user_id.
        changed_by: authorized.userId,
        after_values: record as Record<string, unknown>,
        reason: `Manual origin override to ${origin.country_of_origin}`,
      });

      if (inv?.id) {
        await supabase.from("inventory").update({
          country_of_origin: origin.country_of_origin,
          updated_at: new Date().toISOString(),
        }).eq("id", inv.id);
      }

      if (graphqlUrl && accessToken && body.shopify_product_id) {
        const gid = String(body.shopify_product_id).startsWith("gid://")
          ? body.shopify_product_id
          : `gid://shopify/Product/${body.shopify_product_id}`;
        await syncOriginMetafieldsToShopify(graphqlUrl, accessToken, gid, record);
        await supabase.from("product_compliance").update({
          synced_to_shopify_at: new Date().toISOString(),
        }).eq("shop_id", shop_id!).eq("sku", sku);
      }

      return jsonResponse({ ok: true, record });
    }

    if (action === "force_publish") {
      const sku = body.sku as string;
      const reason = body.force_publish_reason as string;
      if (!sku || !reason) {
        return jsonResponse({ error: "sku and force_publish_reason required" }, 400);
      }
      // Force server-authenticated user id.
      const userId = authorized.userId;

      const { data: before } = await supabase
        .from("product_compliance")
        .select("*")
        .eq("shop_id", shop_id!)
        .eq("sku", sku)
        .maybeSingle();

      const after = {
        force_publish: true,
        force_publish_reason: reason,
        force_publish_by: userId,
        force_publish_at: new Date().toISOString(),
        auto_publish_blocked: false,
        updated_at: new Date().toISOString(),
      };

      await supabase.from("product_compliance").update(after).eq("shop_id", shop_id!).eq("sku", sku);

      await auditLog(supabase, {
        tenant_id: shop.tenant_id,
        shop_id: shop_id!,
        sku,
        action: "force_publish",
        changed_by: userId,
        before_values: before ?? undefined,
        after_values: after,
        reason,
      });

      return jsonResponse({ ok: true, sku, force_publish: true });
    }

    // sync_sku / sync_shop bulk metafield sync
    const skus: string[] = action === "sync_shop"
      ? ((await supabase.from("product_compliance").select("sku").eq("shop_id", shop_id!)).data ?? []).map(
        (r) => r.sku,
      )
      : [body.sku as string].filter(Boolean);

    if (skus.length === 0) {
      return jsonResponse({ error: "no skus to sync" }, 400);
    }

    let synced = 0;
    let failed = 0;

    for (const sku of skus) {
      const { data: compliance } = await supabase
        .from("product_compliance")
        .select("*")
        .eq("shop_id", shop_id!)
        .eq("sku", sku)
        .maybeSingle();

      if (!compliance || !graphqlUrl || !accessToken) {
        failed++;
        continue;
      }

      const query = `
        query findProduct($query: String!) {
          products(first: 1, query: $query) {
            edges { node { id } }
          }
        }
      `;
      const findResp = await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query, variables: { query: `sku:${sku}` } }),
      });
      const findData = await findResp.json();
      const productGid = findData?.data?.products?.edges?.[0]?.node?.id;
      if (!productGid) {
        failed++;
        continue;
      }

      await ensureOriginMetafieldDefinitions(graphqlUrl, accessToken);
      const ok = await syncOriginMetafieldsToShopify(graphqlUrl, accessToken, productGid, compliance);
      if (ok) {
        synced++;
        await supabase.from("product_compliance").update({
          synced_to_shopify_at: new Date().toISOString(),
        }).eq("shop_id", shop_id!).eq("sku", sku);
      } else {
        failed++;
      }
    }

    return jsonResponse({ ok: true, action, synced, failed, total: skus.length });
  } catch (e) {
    return errorResponse(e, 400);
  }
});

// Re-export for importers that refresh compliance from raw SUNSKY detail
export { buildComplianceRecord, upsertProductCompliance };
