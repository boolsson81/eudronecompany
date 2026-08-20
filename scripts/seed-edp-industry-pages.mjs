#!/usr/bin/env node
/**
 * Seed EuroDroneParts industry pages into shopify_content_pages.
 *
 * Usage:
 *   npx tsx scripts/seed-edp-industry-pages.mjs              # preview HTML
 *   npx tsx scripts/seed-edp-industry-pages.mjs --write     # upsert to Supabase
 *   npx tsx scripts/seed-edp-industry-pages.mjs --publish   # write + publish to Shopify
 *   npx tsx scripts/seed-edp-industry-pages.mjs --deploy-theme  # upload theme assets to Shopify
 *
 * Requires .env with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and optionally EDP_SHOP_ID.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { EDP_INDUSTRY_PAGES } from "../src/data/edpIndustryPages.ts";
import { EDP_ENTERPRISE_PAGE, renderEdpEnterprisePageHtml } from "../src/data/edpEnterprisePage.ts";
import {
  renderEdpIndustryPageHtml,
  renderEdpIndustryFaqJsonLd,
} from "../src/lib/edpIndustryPageHtml.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = join(ROOT, "reports/edp-industry-pages");

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

async function resolveShopId(supabase) {
  const envShopId = process.env.EDP_SHOP_ID;
  if (envShopId) return envShopId;

  const { data } = await supabase
    .from("shops")
    .select("id, platform_domain")
    .or("platform_domain.ilike.%eurodroneparts%,name.ilike.%eurodrone%")
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

async function main() {
  loadEnv();
  const write = process.argv.includes("--write");
  const publish = process.argv.includes("--publish");
  const deployTheme = process.argv.includes("--deploy-theme");
  const dryRun = !write && !publish && !deployTheme;

  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\nEDP Industry Pages — ${dryRun ? "preview" : write ? "write" : "publish"}\n`);

  for (const page of EDP_INDUSTRY_PAGES) {
    const bodyHtml = renderEdpIndustryPageHtml(page);
    const faqJsonLd = renderEdpIndustryFaqJsonLd(page);

    const outPath = join(OUTPUT_DIR, `${page.handle}.html`);
    writeFileSync(outPath, bodyHtml);
    writeFileSync(join(OUTPUT_DIR, `${page.handle}.faq.json`), faqJsonLd);
    console.log(`✓ ${page.handle} → ${outPath} (${bodyHtml.length} bytes)`);
  }

  const enterpriseHtml = renderEdpEnterprisePageHtml();
  writeFileSync(join(OUTPUT_DIR, "enterprise.html"), enterpriseHtml);
  console.log(`✓ enterprise → ${join(OUTPUT_DIR, "enterprise.html")} (${enterpriseHtml.length} bytes)`);

  if (dryRun) {
    console.log(`\nPreview written to ${OUTPUT_DIR}/`);
    console.log("Run with --write to upsert to shopify_content_pages");
    console.log("Run with --deploy-theme to upload theme templates to Shopify");
    return;
  }

  if (deployTheme) {
    await deployThemeAssets();
    if (!write && !publish) return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key);
  const shopId = await resolveShopId(supabase);
  if (!shopId) {
    console.error("Could not resolve EDP shop_id. Set EDP_SHOP_ID in .env");
    process.exit(1);
  }

  console.log(`\nUsing shop_id: ${shopId}\n`);

  const allPages = [
    ...EDP_INDUSTRY_PAGES.map((p) => ({
      handle: p.handle,
      title: p.title,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      excerpt: p.shortDesc,
      templateSuffix: p.templateSuffix,
      tags: ["industry", "enterprise", p.handle],
      renderHtml: () => renderEdpIndustryPageHtml(p),
    })),
    {
      handle: EDP_ENTERPRISE_PAGE.handle,
      title: EDP_ENTERPRISE_PAGE.title,
      metaTitle: EDP_ENTERPRISE_PAGE.metaTitle,
      metaDescription: EDP_ENTERPRISE_PAGE.metaDescription,
      excerpt: EDP_ENTERPRISE_PAGE.heroDesc,
      templateSuffix: EDP_ENTERPRISE_PAGE.templateSuffix,
      tags: ["enterprise", "hub"],
      renderHtml: renderEdpEnterprisePageHtml,
    },
  ];

  await publishPages(supabase, url, key, shopId, allPages, publish);

async function publishPages(supabase, url, key, shopId, pages, publish) {
  for (const page of pages) {
    const bodyHtml = page.renderHtml();
    const payload = {
      shop_id: shopId,
      content_type: "page",
      title: page.title,
      handle: page.handle,
      body_html: bodyHtml,
      meta_title: page.metaTitle,
      meta_description: page.metaDescription,
      excerpt: page.excerpt || page.metaDescription,
      template_suffix: page.templateSuffix,
      status: "ready",
      tags: page.tags || ["enterprise", page.handle],
    };

    const { data: existing } = await supabase
      .from("shopify_content_pages")
      .select("id")
      .eq("shop_id", shopId)
      .eq("handle", page.handle)
      .maybeSingle();

    let pageId;
    if (existing?.id) {
      const { error } = await supabase
        .from("shopify_content_pages")
        .update(payload)
        .eq("id", existing.id);
      if (error) throw error;
      pageId = existing.id;
      console.log(`↻ Updated: ${page.handle} (${pageId})`);
    } else {
      const { data, error } = await supabase
        .from("shopify_content_pages")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      pageId = data.id;
      console.log(`+ Created: ${page.handle} (${pageId})`);
    }

    if (publish) {
      const res = await fetch(`${url}/functions/v1/shopify-publish-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          apikey: key,
        },
        body: JSON.stringify({ pageId, shopId }),
      });
      const result = await res.json();
      console.log(`  → Publish: ${result.success ? result.message : result.error}`);
    }
  }
}

async function deployThemeAssets() {
  const token = process.env.EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  const domain = (process.env.SHOPIFY_STORE_DOMAIN || process.env.EUDRONEPARTS_DOMAIN || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  if (!token || !domain) {
    console.error("Missing SHOPIFY_STORE_DOMAIN and EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN for theme deploy");
    process.exit(1);
  }

  const themeDir = join(ROOT, "shopify-theme/edp");
  const assetFiles = [
    "assets/edp-industry.css",
    "sections/edp-page-content.liquid",
    "templates/page.industry.json",
    "templates/page.enterprise.json",
  ];

  const themesRes = await fetch(`https://${domain}/admin/api/2024-01/themes.json`, {
    headers: { "X-Shopify-Access-Token": token },
  });
  const themesData = await themesRes.json();
  const mainTheme = themesData.themes?.find((t) => t.role === "main");
  if (!mainTheme) throw new Error("No main theme found");

  console.log(`\nDeploying theme assets to ${domain} (theme: ${mainTheme.name})\n`);

  for (const key of assetFiles) {
    const filePath = join(themeDir, key);
    const value = readFileSync(filePath, "utf8");
    const res = await fetch(`https://${domain}/admin/api/2024-01/themes/${mainTheme.id}/assets.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ asset: { key, value } }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to upload ${key}: ${err.slice(0, 200)}`);
    }
    console.log(`✓ Uploaded ${key}`);
  }
  console.log("\nTheme assets deployed.");
}

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
