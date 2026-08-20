import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { resolveShopAccess, shopifyRest } from "./cloner-shopify-access.ts";
import { EDP_SHOPIFY_DOMAIN } from "./edp-launch/config.ts";
import bundle from "./edp-industry-pages-bundle.json" with { type: "json" };

const PAGE_CONTENT_SECTION = `{{ 'edp-industry.css' | asset_url | stylesheet_tag }}

<div class="page-width">
  <div class="rte">
    {{ page.content }}
  </div>
</div>

{% schema %}
{
  "name": "EDP Page Content",
  "tag": "section",
  "class": "section-edp-page-content",
  "settings": []
}
{% endschema %}
`;

const TEMPLATE_JSON = JSON.stringify({
  sections: { main: { type: "edp-page-content", settings: {} } },
  order: ["main"],
}, null, 2);

type BundlePage = {
  handle: string;
  title: string;
  templateSuffix: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  tags: string[];
  bodyHtml: string;
};

async function getMainThemeId(access: { domain: string; token: string; apiVersion: string }) {
  const res: any = await shopifyRest(access, "GET", "themes.json");
  const main = res?.themes?.find((t: any) => t.role === "main");
  if (!main?.id) throw new Error("No main Shopify theme found");
  return main.id as number;
}

async function deployThemeAssets(access: { domain: string; token: string; apiVersion: string }) {
  const themeId = await getMainThemeId(access);
  const assets = [
    { key: "assets/edp-industry.css", value: bundle.themeCss as string },
    { key: "sections/edp-page-content.liquid", value: PAGE_CONTENT_SECTION },
    { key: "templates/page.industry.json", value: TEMPLATE_JSON },
  ];
  const uploaded: string[] = [];
  for (const asset of assets) {
    await shopifyRest(access, "PUT", `themes/${themeId}/assets.json`, {
      asset: { key: asset.key, value: asset.value },
    });
    uploaded.push(asset.key);
  }
  return { themeId, uploaded };
}

async function resolveEdpShopId(admin: SupabaseClient, shopId?: string) {
  if (shopId) return shopId;
  const { data } = await admin
    .from("shops")
    .select("id, name, shopify_domain")
    .or("shopify_domain.ilike.%ya1xhg%,name.ilike.%eurodrone%")
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

async function shopifyGraphqlPage(
  access: { domain: string; token: string },
  page: BundlePage,
  shopifyId?: string | null,
) {
  const apiUrl = `https://${access.domain}/admin/api/2024-01/graphql.json`;
  const metafields = [];
  if (page.metaTitle) {
    metafields.push({ namespace: "global", key: "title_tag", value: page.metaTitle, type: "single_line_text_field" });
  }
  if (page.metaDescription) {
    metafields.push({ namespace: "global", key: "description_tag", value: page.metaDescription, type: "single_line_text_field" });
  }
  const pageInput: Record<string, unknown> = {
    title: page.title,
    handle: page.handle,
    body: page.bodyHtml,
    isPublished: true,
    templateSuffix: page.templateSuffix,
    ...(metafields.length ? { metafields } : {}),
  };

  const mutation = shopifyId
    ? `mutation pageUpdate($id: ID!, $page: PageUpdateInput!) {
        pageUpdate(id: $id, page: $page) { page { id handle templateSuffix } userErrors { message } }
      }`
    : `mutation pageCreate($page: PageCreateInput!) {
        pageCreate(page: $page) { page { id handle templateSuffix } userErrors { message } }
      }`;

  const variables = shopifyId
    ? { id: `gid://shopify/Page/${shopifyId}`, page: pageInput }
    : { page: pageInput };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": access.token,
    },
    body: JSON.stringify({ query: mutation, variables }),
  });
  const data = await res.json();
  const errors = shopifyId
    ? data?.data?.pageUpdate?.userErrors
    : data?.data?.pageCreate?.userErrors;
  if (errors?.length) throw new Error(errors.map((e: any) => e.message).join(", "));

  const node = shopifyId ? data?.data?.pageUpdate?.page : data?.data?.pageCreate?.page;
  const id = node?.id?.replace("gid://shopify/Page/", "") || shopifyId;
  return { shopifyId: id, templateSuffix: node?.templateSuffix };
}

export async function runEdpIndustryPagesDeploy(
  admin: SupabaseClient,
  opts: { shop_id?: string; deploy_theme?: boolean; dry_run?: boolean } = {},
) {
  const shopId = await resolveEdpShopId(admin, opts.shop_id);
  if (!shopId) throw new Error("Could not resolve EuroDroneParts shop_id");

  const access = await resolveShopAccess({ shop_domain: EDP_SHOPIFY_DOMAIN });
  const pages = bundle.pages as BundlePage[];
  const results: Array<Record<string, unknown>> = [];

  if (opts.dry_run) {
    return {
      ok: true,
      dry_run: true,
      shop_id: shopId,
      shop_domain: access.domain,
      pages: pages.map((p) => ({ handle: p.handle, templateSuffix: p.templateSuffix, bytes: p.bodyHtml.length })),
      theme_assets: ["assets/edp-industry.css", "sections/edp-page-content.liquid", "templates/page.industry.json"],
    };
  }

  let themeResult = null;
  if (opts.deploy_theme !== false) {
    themeResult = await deployThemeAssets(access);
  }

  for (const page of pages) {
    const { data: existing } = await admin
      .from("shopify_content_pages")
      .select("id, shopify_id")
      .eq("shop_id", shopId)
      .eq("handle", page.handle)
      .maybeSingle();

    const payload = {
      shop_id: shopId,
      content_type: "page",
      title: page.title,
      handle: page.handle,
      body_html: page.bodyHtml,
      meta_title: page.metaTitle,
      meta_description: page.metaDescription,
      excerpt: page.excerpt,
      template_suffix: page.templateSuffix,
      status: "published",
      tags: page.tags,
    };

    let contentPageId = existing?.id;
    if (existing?.id) {
      const { error } = await admin.from("shopify_content_pages").update({
        ...payload,
        shopify_published_at: new Date().toISOString(),
        shopify_status: "active",
      }).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { data, error } = await admin.from("shopify_content_pages").insert(payload).select("id").single();
      if (error) throw error;
      contentPageId = data.id;
    }

    const published = await shopifyGraphqlPage(access, page, existing?.shopify_id);
    await admin.from("shopify_content_pages").update({
      shopify_id: published.shopifyId,
      shopify_published_at: new Date().toISOString(),
      shopify_status: "active",
      status: "published",
    }).eq("id", contentPageId);

    results.push({
      handle: page.handle,
      templateSuffix: published.templateSuffix || page.templateSuffix,
      shopify_id: published.shopifyId,
      content_page_id: contentPageId,
    });
  }

  return {
    ok: true,
    shop_id: shopId,
    shop_domain: access.domain,
    theme: themeResult,
    pages: results,
  };
}
