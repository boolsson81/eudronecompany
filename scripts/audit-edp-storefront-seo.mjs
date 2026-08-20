#!/usr/bin/env node
/**
 * Static + optional live SEO audit for Europe Drone Parts Shopify storefront.
 *
 * Usage:
 *   node scripts/audit-edp-storefront-seo.mjs
 *   node scripts/audit-edp-storefront-seo.mjs --live
 *
 * Env (optional for Shopify Admin audit):
 *   EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN
 *   SHOPIFY_STORE_DOMAIN (default ya1xhg-x6.myshopify.com)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REPORT_JSON = join(ROOT, "reports/edp-storefront-seo-audit.json");
const REPORT_MD = join(ROOT, "reports/edp-storefront-seo-audit.md");

const EDP_DOMAINS = [
  "eurodroneparts.com",
  "eurodroneparts.se",
  "eurodroneparts.de",
  "eurodroneparts.dk",
];
const THEME_DIR = join(ROOT, "theme");
const REQUIRED_SNIPPETS = [
  "snippets/edp-seo-breadcrumbs.liquid",
  "snippets/edp-seo-collection.liquid",
  "snippets/edp-seo-faq.liquid",
  "snippets/edp-seo-structured-data.liquid",
  "snippets/edp-ai-content.liquid",
  "snippets/edp-ai-entity-schema.liquid",
  "snippets/edp-ai-itemlist.liquid",
  "snippets/edp-ai-speakable.liquid",
  "snippets/meta-tags.liquid",
];

function loadDotEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let value = t.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function auditThemeFiles() {
  const checks = [];
  for (const rel of REQUIRED_SNIPPETS) {
    const exists = existsSync(join(THEME_DIR, rel));
    checks.push({
      name: rel,
      status: exists ? "pass" : "fail",
      message: exists ? "Finns i temat" : "Saknas i temat",
    });
  }

  const themeLiquid = readFileSync(join(THEME_DIR, "layout/theme.liquid"), "utf8");
  checks.push({
    name: "canonical",
    status: themeLiquid.includes('rel="canonical"') ? "pass" : "fail",
    message: themeLiquid.includes('rel="canonical"') ? "Canonical i theme.liquid" : "Saknar canonical",
  });
  checks.push({
    name: "structured-data-render",
    status: themeLiquid.includes("edp-seo-structured-data") ? "pass" : "fail",
    message: themeLiquid.includes("edp-seo-structured-data")
      ? "EDP structured data renderas"
      : "Saknar edp-seo-structured-data render",
  });
  checks.push({
    name: "noindex-search-cart",
    status: themeLiquid.includes('name="robots"') ? "pass" : "warning",
    message: themeLiquid.includes('name="robots"')
      ? "noindex på sök/kundvagn"
      : "Saknar noindex för sök/kundvagn",
  });

  const entitySchema = readFileSync(join(THEME_DIR, "snippets/edp-ai-entity-schema.liquid"), "utf8");
  checks.push({
    name: "organization-schema",
    status: entitySchema.includes('"@type": ["Organization", "Store"]') || entitySchema.includes('"@type": "Organization"') ? "pass" : "fail",
    message: "Organization/Store JSON-LD i edp-ai-entity-schema",
  });
  checks.push({
    name: "ai-entity-knowsAbout",
    status: entitySchema.includes("knowsAbout") ? "pass" : "warning",
    message: entitySchema.includes("knowsAbout") ? "knowsAbout för AI-entity" : "Saknar knowsAbout",
  });
  checks.push({
    name: "https-schema-context",
    status: entitySchema.includes("https://schema.org") ? "pass" : "warning",
    message: entitySchema.includes("https://schema.org")
      ? "Använder https://schema.org"
      : "Använder gammal http://schema.org context",
  });

  const metaTags = readFileSync(join(THEME_DIR, "snippets/meta-tags.liquid"), "utf8");
  checks.push({
    name: "twitter-image",
    status: metaTags.includes("twitter:image") ? "pass" : "warning",
    message: metaTags.includes("twitter:image") ? "Twitter image meta" : "Saknar twitter:image",
  });
  checks.push({
    name: "og-locale",
    status: metaTags.includes("og:locale") ? "pass" : "warning",
    message: metaTags.includes("og:locale") ? "og:locale meta" : "Saknar og:locale",
  });

  const productTemplates = existsSync(join(THEME_DIR, "templates/product.json"));
  checks.push({
    name: "default-product-template",
    status: productTemplates ? "pass" : "fail",
    message: productTemplates ? "product.json finns" : "Saknar product.json",
  });

  const llmsTemplate = existsSync(join(THEME_DIR, "templates/page.llms.json"));
  checks.push({
    name: "llms-txt-template",
    status: llmsTemplate ? "pass" : "fail",
    message: llmsTemplate ? "llms.txt-mall finns" : "Saknar page.llms.json",
  });

  const aiCss = existsSync(join(THEME_DIR, "assets/edp-ai.css"));
  checks.push({
    name: "ai-content-styles",
    status: aiCss ? "pass" : "warning",
    message: aiCss ? "AI-innehållsstilar finns" : "Saknar edp-ai.css",
  });

  const passed = checks.filter((c) => c.status === "pass").length;
  const score = Math.round((passed / checks.length) * 100);
  return { checks, score, passed, total: checks.length };
}

async function shopifyGraphql(domain, token, query, variables = {}) {
  const res = await fetch(`https://${domain}/admin/api/2025-07/graphql.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (!res.ok || data.errors) {
    throw new Error(data.errors?.[0]?.message || `Shopify API ${res.status}`);
  }
  return data.data;
}

async function auditShopifyAdmin() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || "ya1xhg-x6.myshopify.com";
  const token = process.env.EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN;
  if (!token) {
    return { available: false, message: "EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN saknas — hoppar över Admin API-audit" };
  }

  const summarize = (nodes, isProduct = false) => {
    const total = nodes.length;
    const missingSeoTitle = nodes.filter((n) => !n.seo?.title?.trim()).length;
    const missingSeoDescription = nodes.filter((n) => !n.seo?.description?.trim()).length;
    const missingBoth = nodes.filter((n) => !n.seo?.title?.trim() && !n.seo?.description?.trim()).length;
    const invalidTemplate = isProduct
      ? nodes.filter((n) => n.templateSuffix && n.templateSuffix !== "").length
      : 0;
    const draft = isProduct ? nodes.filter((n) => n.status === "DRAFT").length : 0;
    return { total, missingSeoTitle, missingSeoDescription, missingBoth, invalidTemplate, draft };
  };

  async function fetchAll(resource, fields) {
    const nodes = [];
    let cursor = null;
    let guard = 0;
    while (guard < 30) {
      const data = await shopifyGraphql(
        domain,
        token,
        `query($cursor: String) { ${resource}(first: 100, after: $cursor) { pageInfo { hasNextPage endCursor } nodes { ${fields} } } }`,
        { cursor },
      );
      const block = data[resource];
      nodes.push(...(block?.nodes || []));
      if (!block?.pageInfo?.hasNextPage) break;
      cursor = block.pageInfo.endCursor;
      guard++;
    }
    return nodes;
  }

  const [products, collections, pages] = await Promise.all([
    fetchAll("products", "handle title status templateSuffix seo { title description }"),
    fetchAll("collections", "handle title seo { title description }"),
    fetchAll("pages", "handle title seo { title description }"),
  ]);

  return {
    available: true,
    domain,
    products: summarize(products, true),
    collections: summarize(collections),
    pages: summarize(pages),
    samples: {
      productsMissingSeo: products
        .filter((p) => !p.seo?.title?.trim() || !p.seo?.description?.trim())
        .slice(0, 10)
        .map((p) => p.handle),
      productsInvalidTemplate: products
        .filter((p) => p.templateSuffix)
        .slice(0, 10)
        .map((p) => ({ handle: p.handle, templateSuffix: p.templateSuffix })),
    },
  };
}

async function auditLiveDomains() {
  const results = [];
  for (const domain of EDP_DOMAINS) {
    const entry = { domain, status: "fail", checks: [] };
    for (const origin of [`https://${domain}`, `https://www.${domain}`]) {
      try {
        const res = await fetch(origin, { redirect: "follow", signal: AbortSignal.timeout(12000) });
        const html = await res.text();
        entry.status = res.ok ? "reachable" : "fail";
        entry.httpStatus = res.status;
        entry.finalUrl = res.url;
        entry.checks = [
          { name: "canonical", ok: html.includes('rel="canonical"') },
          { name: "meta-description", ok: html.includes('name="description"') },
          { name: "og-title", ok: html.includes('property="og:title"') },
          { name: "json-ld", ok: html.includes("application/ld+json") },
          { name: "password-protected", ok: !(html.toLowerCase().includes("enter store using password")) },
        ];
        break;
      } catch (e) {
        entry.error = e instanceof Error ? e.message : String(e);
      }
    }
    results.push(entry);
  }
  return results;
}

function buildMarkdown(report) {
  const lines = [
    "# Europe Drone Parts — Storefront SEO Audit",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Theme SEO (kodbas)",
    "",
    `Score: **${report.theme.score}/100** (${report.theme.passed}/${report.theme.total} checks)`,
    "",
    "| Check | Status | Message |",
    "| --- | --- | --- |",
    ...report.theme.checks.map((c) => `| ${c.name} | ${c.status} | ${c.message} |`),
    "",
  ];

  if (report.shopifyAdmin?.available) {
    lines.push(
      "## Shopify Admin metadata",
      "",
      `Domain: \`${report.shopifyAdmin.domain}\``,
      "",
      "| Resurs | Totalt | Saknar SEO-titel | Saknar meta desc | Saknar båda |",
      "| --- | ---: | ---: | ---: | ---: |",
      `| Produkter | ${report.shopifyAdmin.products.total} | ${report.shopifyAdmin.products.missingSeoTitle} | ${report.shopifyAdmin.products.missingSeoDescription} | ${report.shopifyAdmin.products.missingBoth} |`,
      `| Kollektioner | ${report.shopifyAdmin.collections.total} | ${report.shopifyAdmin.collections.missingSeoTitle} | ${report.shopifyAdmin.collections.missingSeoDescription} | ${report.shopifyAdmin.collections.missingBoth} |`,
      `| Sidor | ${report.shopifyAdmin.pages.total} | ${report.shopifyAdmin.pages.missingSeoTitle} | ${report.shopifyAdmin.pages.missingSeoDescription} | ${report.shopifyAdmin.pages.missingBoth} |`,
      "",
      `Utkast (produkter): ${report.shopifyAdmin.products.draft}`,
      `Produkter med template_suffix: ${report.shopifyAdmin.products.invalidTemplate}`,
      "",
    );
  } else {
    lines.push("## Shopify Admin metadata", "", `_${report.shopifyAdmin.message}_`, "");
  }

  lines.push("## Live-domäner", "");
  for (const d of report.liveDomains) {
    lines.push(`### ${d.domain}`, "");
    if (d.error && !d.checks?.length) {
      lines.push(`- **Ej nåbar:** ${d.error}`, "");
      continue;
    }
    lines.push(`- HTTP: ${d.httpStatus} → ${d.finalUrl || "n/a"}`, "");
    for (const c of d.checks || []) {
      lines.push(`- ${c.ok ? "✅" : "❌"} ${c.name}`);
    }
    lines.push("");
  }

  if (report.priorityIssues?.length) {
    lines.push("## Prioriterade åtgärder", "");
    for (const issue of report.priorityIssues) lines.push(`- ${issue}`);
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  loadDotEnv();
  const live = process.argv.includes("--live");

  const theme = auditThemeFiles();
  const shopifyAdmin = await auditShopifyAdmin();
  const liveDomains = live ? await auditLiveDomains() : [];

  const priorityIssues = [];
  if (theme.score < 100) priorityIssues.push("Komplettera saknade SEO-snippetar i temat");
  if (shopifyAdmin.available && shopifyAdmin.products.missingBoth > 0) {
    priorityIssues.push(`${shopifyAdmin.products.missingBoth} produkter saknar SEO-metadata i Shopify Admin`);
  }
  if (shopifyAdmin.available && shopifyAdmin.products.invalidTemplate > 0) {
    priorityIssues.push(`${shopifyAdmin.products.invalidTemplate} produkter har template_suffix satt (risk för 404)`);
  }
  if (liveDomains.some((d) => d.checks?.some((c) => c.name === "password-protected" && !c.ok))) {
    priorityIssues.push("Butiken är lösenordsskyddad — öppna för indexering före lansering");
  }

  const report = {
    generatedAt: new Date().toISOString(),
    theme,
    shopifyAdmin,
    liveDomains,
    priorityIssues,
  };

  mkdirSync(join(ROOT, "reports"), { recursive: true });
  writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));
  writeFileSync(REPORT_MD, buildMarkdown(report));

  console.log(`Theme SEO score: ${theme.score}/100`);
  if (shopifyAdmin.available) {
    console.log(`Products missing SEO: ${shopifyAdmin.products.missingBoth}/${shopifyAdmin.products.total}`);
  } else {
    console.log(shopifyAdmin.message);
  }
  console.log(`Report: ${REPORT_MD}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
