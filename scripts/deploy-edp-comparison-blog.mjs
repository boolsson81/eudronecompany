#!/usr/bin/env node
/**
 * Deploy EuroDroneParts jämförer blog (theme + 16 articles).
 *
 * Uses shopify-cloner-worker when deployed; otherwise falls back to
 * test-integration (OAuth token from shopify_app_installations).
 *
 * Usage:
 *   npx tsx scripts/build-edp-comparison-bundle.mjs
 *   node scripts/deploy-edp-comparison-blog.mjs --dry-run
 *   node scripts/deploy-edp-comparison-blog.mjs
 *   node scripts/deploy-edp-comparison-blog.mjs --no-theme
 *
 * Requires .env: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "reports/edp-comparison-deploy.json");
const BUNDLE = join(ROOT, "supabase/functions/_shared/edp-comparison-bundle.json");
const THEME_DIR = join(ROOT, "shopify-theme/edp");
const SHOP = "ya1xhg-x6.myshopify.com";

const THEME_ASSETS = [
  "assets/edp-comparison.css",
  "sections/edp-comparison-blog.liquid",
  "sections/edp-comparison-article.liquid",
  "templates/blog.jamforer.json",
  "templates/article.jamforer.json",
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

function supabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );
}

function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
}

async function invokeWorker(body) {
  const key = supabaseKey();
  const url = supabaseUrl();
  const res = await fetch(`${url}/functions/v1/shopify-cloner-worker`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
  }
  if (json.error?.includes?.("Unknown action")) return null;
  if (!res.ok && !json.ok) throw new Error(json.error || text.slice(0, 500));
  return json;
}

async function shopifyProxy({ shopify_graphql, shopify_rest }) {
  const key = supabaseKey();
  const url = supabaseUrl();
  const body = {
    integration_type: "shopify",
    config: { store_domain: SHOP, access_token: "***configured***" },
  };
  if (shopify_graphql) body.shopify_graphql = shopify_graphql;
  if (shopify_rest) body.shopify_rest = shopify_rest;

  const res = await fetch(`${url}/functions/v1/test-integration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(JSON.stringify(json.errors || json.message || json.data || json).slice(0, 500));
  }
  return json.data;
}

async function gql(query, variables = {}) {
  return shopifyProxy({ shopify_graphql: { query, variables } });
}

async function getMainThemeGid() {
  const data = await gql(`{ themes(first: 20) { nodes { id role } } }`);
  const main = data?.themes?.nodes?.find((t) => t.role === "MAIN");
  if (!main?.id) throw new Error("No main Shopify theme found");
  return main.id;
}

async function deployThemeAssets() {
  const themeId = await getMainThemeGid();
  const uploaded = [];
  for (const key of THEME_ASSETS) {
    const value = readFileSync(join(THEME_DIR, key), "utf8");
    const data = await gql(
      `mutation($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: $themeId, files: $files) {
          upsertedThemeFiles { filename }
          userErrors { field message }
        }
      }`,
      {
        themeId,
        files: [{ filename: key, body: { type: "TEXT", value } }],
      },
    );
    const errors = data?.themeFilesUpsert?.userErrors;
    if (errors?.length) throw new Error(`${key}: ${errors.map((e) => e.message).join(", ")}`);
    uploaded.push(key);
    console.log(`  ✓ ${key}`);
    await new Promise((r) => setTimeout(r, 250));
  }
  return { themeId, uploaded };
}

async function ensureBlog(blog) {
  const found = await gql(`{ blogs(first: 50) { nodes { id handle title } } }`);
  const existing = found?.blogs?.nodes?.find((b) => b.handle === blog.handle);
  if (existing?.id) {
    return existing.id.replace("gid://shopify/Blog/", "");
  }

  const created = await gql(
    `mutation blogCreate($blog: BlogCreateInput!) {
      blogCreate(blog: $blog) { blog { id handle } userErrors { message } }
    }`,
    { blog: { title: blog.title, handle: blog.handle, templateSuffix: "jamforer" } },
  );
  const errors = created?.blogCreate?.userErrors;
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
  const id = created?.blogCreate?.blog?.id;
  if (!id) throw new Error("blogCreate returned no blog id");
  return id.replace("gid://shopify/Blog/", "");
}

async function listExistingArticles(blogId) {
  const data = await gql(
    `query($id: ID!) {
      blog(id: $id) {
        articles(first: 100) { nodes { id handle } }
      }
    }`,
    { id: `gid://shopify/Blog/${blogId}` },
  );
  const map = new Map();
  for (const node of data?.blog?.articles?.nodes || []) {
    const id = node.id.replace("gid://shopify/Article/", "");
    map.set(node.handle, id);
  }
  return map;
}

async function publishArticle(blogId, article, shopifyId) {
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

  if (shopifyId) {
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
    const data = await gql(
      `mutation articleUpdate($id: ID!, $article: ArticleUpdateInput!) {
        articleUpdate(id: $id, article: $article) {
          article { id handle templateSuffix }
          userErrors { message }
        }
      }`,
      { id: `gid://shopify/Article/${shopifyId}`, article: updateInput },
    );
    const errors = data?.articleUpdate?.userErrors;
    if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
    return { shopifyId, templateSuffix: article.templateSuffix };
  }

  const articleInput = {
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
  const data = await gql(
    `mutation articleCreate($article: ArticleCreateInput!) {
      articleCreate(article: $article) {
        article { id handle templateSuffix }
        userErrors { message }
      }
    }`,
    { article: articleInput },
  );
  const errors = data?.articleCreate?.userErrors;
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
  const id = data?.articleCreate?.article?.id?.replace("gid://shopify/Article/", "");
  return { shopifyId: id, templateSuffix: article.templateSuffix };
}

async function deployViaProxy(opts) {
  const bundle = JSON.parse(readFileSync(BUNDLE, "utf8"));
  const blogConfig = bundle.blog;
  const articles = bundle.articles;

  if (opts.dry_run) {
    return {
      ok: true,
      dry_run: true,
      via: "test-integration",
      shop_domain: SHOP,
      blog: blogConfig,
      articles: articles.map((a) => ({ handle: a.handle, bytes: a.bodyHtml.length })),
    };
  }

  let themeResult = null;
  if (opts.deploy_theme !== false) {
    console.log("Uploading theme assets…");
    themeResult = await deployThemeAssets();
  }

  console.log("Ensuring blog…");
  const blogId = await ensureBlog(blogConfig);
  console.log(`  Blog id: ${blogId}`);

  const existing = await listExistingArticles(blogId);
  const results = [];

  for (const article of articles) {
    const shopifyId = existing.get(article.handle);
    const published = await publishArticle(blogId, article, shopifyId);
    results.push({ handle: article.handle, shopify_id: published.shopifyId, action: shopifyId ? "update" : "create" });
    console.log(`  ${shopifyId ? "↻" : "+"} ${article.handle}`);
    await new Promise((r) => setTimeout(r, 300));
  }

  return {
    ok: true,
    via: "test-integration",
    shop_domain: SHOP,
    blog: { ...blogConfig, shopify_id: blogId },
    theme: themeResult,
    articles: results,
  };
}

async function main() {
  loadEnv();
  const dryRun = process.argv.includes("--dry-run");
  const noTheme = process.argv.includes("--no-theme");

  console.log(`\nEDP Jämförer blog deploy — ${dryRun ? "DRY RUN" : "LIVE"}\n`);

  let result = await invokeWorker({
    action: "edp_deploy_comparison_blog",
    dry_run: dryRun,
    deploy_theme: !noTheme,
  });

  if (!result) {
    console.log("Worker action not deployed — using test-integration proxy\n");
    result = await deployViaProxy({ dry_run: dryRun, deploy_theme: !noTheme });
  }

  writeFileSync(REPORT, JSON.stringify(result, null, 2));
  console.log(`\nReport: ${REPORT}`);

  if (!result.ok) {
    process.exit(1);
  }

  if (dryRun) {
    console.log(`\nDry run complete (${result.via || "worker"}). Re-run without --dry-run to publish.`);
  } else {
    console.log("\nDeploy complete.");
    console.log(`Blog: https://eurodroneparts.se/blogs/${result.blog?.handle || "jamforer"}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
