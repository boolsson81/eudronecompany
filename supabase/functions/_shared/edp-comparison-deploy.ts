import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { resolveShopAccess, shopifyRest } from "./cloner-shopify-access.ts";
import { EDP_SHOPIFY_DOMAIN } from "./edp-launch/config.ts";
import bundle from "./edp-comparison-bundle.json" with { type: "json" };

type BundleArticle = {
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
  const fs = await import("node:fs");
  const path = await import("node:path");
  const root = path.join(new URL(".", import.meta.url).pathname, "../../../shopify-theme/edp");

  const assets = [
    { key: "assets/edp-comparison.css", file: "assets/edp-comparison.css" },
    { key: "sections/edp-comparison-blog.liquid", file: "sections/edp-comparison-blog.liquid" },
    { key: "sections/edp-comparison-article.liquid", file: "sections/edp-comparison-article.liquid" },
    { key: "templates/blog.jamforer.json", file: "templates/blog.jamforer.json" },
    { key: "templates/article.jamforer.json", file: "templates/article.jamforer.json" },
  ];

  const uploaded: string[] = [];
  for (const asset of assets) {
    const value = fs.readFileSync(path.join(root, asset.file), "utf8");
    await shopifyRest(access, "PUT", `themes/${themeId}/assets.json`, {
      asset: { key: asset.key, value },
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

async function shopifyGraphql(
  access: { domain: string; token: string },
  query: string,
  variables?: Record<string, unknown>,
) {
  const res = await fetch(`https://${access.domain}/admin/api/2024-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": access.token,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

async function ensureBlog(
  access: { domain: string; token: string },
  blog: { handle: string; title: string },
): Promise<string> {
  const findQuery = `{ blogs(first: 50) { nodes { id handle title } } }`;
  const found = await shopifyGraphql(access, findQuery);
  const existing = found?.data?.blogs?.nodes?.find((b: any) => b.handle === blog.handle);
  if (existing?.id) {
    return existing.id.replace("gid://shopify/Blog/", "");
  }

  const createMutation = `mutation blogCreate($blog: BlogCreateInput!) {
    blogCreate(blog: $blog) { blog { id handle } userErrors { message } }
  }`;
  const created = await shopifyGraphql(access, createMutation, {
    blog: { title: blog.title, handle: blog.handle, templateSuffix: "jamforer" },
  });
  const errors = created?.data?.blogCreate?.userErrors;
  if (errors?.length) throw new Error(errors.map((e: any) => e.message).join(", "));
  const id = created?.data?.blogCreate?.blog?.id;
  if (!id) throw new Error("blogCreate returned no blog id");
  return id.replace("gid://shopify/Blog/", "");
}

async function publishArticle(
  access: { domain: string; token: string },
  blogId: string,
  article: BundleArticle,
  shopifyId?: string | null,
) {
  const metafields = [];
  if (article.metaTitle) {
    metafields.push({
      namespace: "global",
      key: "title_tag",
      value: article.metaTitle,
      type: "single_line_text_field",
    });
  }
  if (article.metaDescription) {
    metafields.push({
      namespace: "global",
      key: "description_tag",
      value: article.metaDescription,
      type: "single_line_text_field",
    });
  }

  const articleInput: Record<string, unknown> = {
    blogId: `gid://shopify/Blog/${blogId}`,
    title: article.title,
    handle: article.handle,
    body: article.bodyHtml,
    summary: article.excerpt,
    tags: article.tags,
    isPublished: true,
    templateSuffix: article.templateSuffix,
    author: { name: "EuroDroneParts" },
    ...(metafields.length ? { metafields } : {}),
  };

  if (shopifyId) {
    const mutation = `mutation articleUpdate($id: ID!, $article: ArticleUpdateInput!) {
      articleUpdate(id: $id, article: $article) {
        article { id handle templateSuffix }
        userErrors { message }
      }
    }`;
    const updateInput = {
      title: article.title,
      handle: article.handle,
      body: article.bodyHtml,
      summary: article.excerpt,
      tags: article.tags,
      isPublished: true,
      templateSuffix: article.templateSuffix,
      ...(metafields.length ? { metafields } : {}),
    };
    const data = await shopifyGraphql(access, mutation, {
      id: `gid://shopify/Article/${shopifyId}`,
      article: updateInput,
    });
    const errors = data?.data?.articleUpdate?.userErrors;
    if (errors?.length) throw new Error(errors.map((e: any) => e.message).join(", "));
    return { shopifyId, templateSuffix: article.templateSuffix };
  }

  const mutation = `mutation articleCreate($article: ArticleCreateInput!) {
    articleCreate(article: $article) {
      article { id handle templateSuffix }
      userErrors { message }
    }
  }`;
  const data = await shopifyGraphql(access, mutation, { article: articleInput });
  const errors = data?.data?.articleCreate?.userErrors;
  if (errors?.length) throw new Error(errors.map((e: any) => e.message).join(", "));
  const id = data?.data?.articleCreate?.article?.id?.replace("gid://shopify/Article/", "");
  return { shopifyId: id, templateSuffix: article.templateSuffix };
}

export async function runEdpComparisonBlogDeploy(
  admin: SupabaseClient,
  opts: { shop_id?: string; deploy_theme?: boolean; dry_run?: boolean } = {},
) {
  const shopId = await resolveEdpShopId(admin, opts.shop_id);
  if (!shopId) throw new Error("Could not resolve EuroDroneParts shop_id");

  const access = await resolveShopAccess({ shop_domain: EDP_SHOPIFY_DOMAIN });
  const blogConfig = bundle.blog as { handle: string; title: string; templateSuffix: string };
  const articles = bundle.articles as BundleArticle[];

  if (opts.dry_run) {
    return {
      ok: true,
      dry_run: true,
      shop_id: shopId,
      shop_domain: access.domain,
      blog: blogConfig,
      articles: articles.map((a) => ({ handle: a.handle, bytes: a.bodyHtml.length })),
    };
  }

  let themeResult = null;
  if (opts.deploy_theme !== false) {
    themeResult = await deployThemeAssets(access);
  }

  const blogId = await ensureBlog(access, blogConfig);
  const results: Array<Record<string, unknown>> = [];

  for (const article of articles) {
    const { data: existing } = await admin
      .from("shopify_content_pages")
      .select("id, shopify_id")
      .eq("shop_id", shopId)
      .eq("handle", article.handle)
      .eq("content_type", "blog_article")
      .maybeSingle();

    const payload = {
      shop_id: shopId,
      content_type: "blog_article",
      title: article.title,
      handle: article.handle,
      body_html: article.bodyHtml,
      meta_title: article.metaTitle,
      meta_description: article.metaDescription,
      excerpt: article.excerpt,
      template_suffix: article.templateSuffix,
      blog_id: blogId,
      blog_title: blogConfig.title,
      status: "published",
      tags: article.tags,
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

    const published = await publishArticle(access, blogId, article, existing?.shopify_id);
    await admin.from("shopify_content_pages").update({
      shopify_id: published.shopifyId,
      shopify_published_at: new Date().toISOString(),
      shopify_status: "active",
      status: "published",
    }).eq("id", contentPageId);

    results.push({
      handle: article.handle,
      shopify_id: published.shopifyId,
      content_page_id: contentPageId,
    });
  }

  return {
    ok: true,
    shop_id: shopId,
    shop_domain: access.domain,
    blog: { ...blogConfig, shopify_id: blogId },
    theme: themeResult,
    articles: results,
  };
}
