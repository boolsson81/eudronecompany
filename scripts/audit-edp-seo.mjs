#!/usr/bin/env node
/**
 * Audit EDP Shopify theme SEO coverage in theme files.
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "theme");
const TEMPLATES = join(ROOT, "templates");

const REQUIRED_SNIPPETS = [
  "snippets/meta-tags.liquid",
  "snippets/edp-seo-robots.liquid",
  "snippets/edp-structured-data.liquid",
];

const REQUIRED_LAYOUT_CHECKS = [
  {
    file: "layout/theme.liquid",
    patterns: [
      "canonical_url",
      "page_title",
      "meta name=\"description\"",
      "render 'edp-seo-robots'",
      "render 'meta-tags'",
      "render 'edp-structured-data'",
    ],
  },
  {
    file: "layout/password.liquid",
    patterns: ["canonical_url", "noindex", "render 'meta-tags'"],
  },
];

const META_TAG_CHECKS = [
  "og:locale",
  "twitter:image",
  "settings.brand_description",
];

const STRUCTURED_DATA_CHECKS = [
  "https://schema.org",
  "BreadcrumbList",
  "CollectionPage",
  "WebPage",
  "Organization",
  "WebSite",
];

const CUSTOM_PAGE_TEMPLATES = [
  "page.enterprise.json",
  "page.consumer.json",
  "page.contact.json",
  "page.contact-quote.json",
  "page.jordbruk.json",
  "page.energi-infrastruktur.json",
  "page.gis-kartlaggning.json",
  "page.raddningstjanst.json",
  "page.skogsbruk.json",
  "page.bygg-anlaggning.json",
];

const SETUP_SCRIPT_PAGES = [
  "enterprise",
  "consumer",
  "contact-quote",
  "jordbruk",
  "energi-infrastruktur",
  "gis-kartlaggning",
  "raddningstjanst",
  "skogsbruk",
  "bygg-anlaggning",
];

function fail(msg) {
  return { ok: false, msg };
}

function pass(msg) {
  return { ok: true, msg };
}

const results = [];

function check(name, fn) {
  const r = fn();
  results.push({ name, ...r });
}

function readTheme(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

function readRepo(rel) {
  return readFileSync(join(ROOT, "..", rel), "utf8");
}

check("SEO snippets exist", () => {
  const missing = REQUIRED_SNIPPETS.filter((p) => !existsSync(join(ROOT, p.replace(/^theme\//, ""))));
  return missing.length ? fail(`Missing: ${missing.join(", ")}`) : pass("All SEO snippets present");
});

for (const layout of REQUIRED_LAYOUT_CHECKS) {
  check(`${layout.file} head tags`, () => {
    const content = readTheme(layout.file);
    const missing = layout.patterns.filter((p) => !content.includes(p));
    return missing.length ? fail(`Missing in ${layout.file}: ${missing.join(", ")}`) : pass("OK");
  });
}

check("meta-tags.liquid completeness", () => {
  const content = readTheme("snippets/meta-tags.liquid");
  const missing = META_TAG_CHECKS.filter((p) => !content.includes(p));
  return missing.length ? fail(`Missing: ${missing.join(", ")}`) : pass("OG/Twitter tags complete");
});

check("structured data coverage", () => {
  const content = readTheme("snippets/edp-structured-data.liquid");
  const missing = STRUCTURED_DATA_CHECKS.filter((p) => !content.includes(p));
  return missing.length ? fail(`Missing schema types: ${missing.join(", ")}`) : pass("Schema types present");
});

check("robots noindex for utility pages", () => {
  const content = readTheme("snippets/edp-seo-robots.liquid");
  const required = ["404", "cart", "search", "customers", "noindex"];
  const missing = required.filter((p) => !content.includes(p));
  return missing.length ? fail(`Missing: ${missing.join(", ")}`) : pass("Robots rules present");
});

check("product JSON-LD", () => {
  const content = readTheme("sections/main-product.liquid");
  return content.includes("structured_data") ? pass("Product schema via Shopify filter") : fail("Missing product structured_data");
});

check("article JSON-LD", () => {
  const content = readTheme("sections/main-article.liquid");
  return content.includes("structured_data") ? pass("Article schema via Shopify filter") : fail("Missing article structured_data");
});

check("custom page templates exist", () => {
  const missing = CUSTOM_PAGE_TEMPLATES.filter((t) => !existsSync(join(TEMPLATES, t)));
  return missing.length ? fail(`Missing templates: ${missing.join(", ")}`) : pass(`${CUSTOM_PAGE_TEMPLATES.length} custom page templates`);
});

check("setup script SEO entries", () => {
  const content = readRepo("scripts/setup-edp-theme-pages.mjs");
  const missing = SETUP_SCRIPT_PAGES.filter((h) => !content.includes(`handle: "${h}"`));
  const missingSeo = SETUP_SCRIPT_PAGES.filter((h) => !content.includes(`handle: "${h}"`) || !content.includes("seoTitle"));
  if (missing.length) return fail(`Missing page handles: ${missing.join(", ")}`);
  if (missingSeo.length) return fail(`Missing SEO for: ${missingSeo.join(", ")}`);
  return pass(`${SETUP_SCRIPT_PAGES.length} pages with SEO in setup script`);
});

check("breadcrumb locale keys", () => {
  const sv = readTheme("locales/sv.json");
  const en = readTheme("locales/en.default.json");
  if (!sv.includes('"breadcrumbs"') || !en.includes('"breadcrumbs"')) {
    return fail("Missing general.breadcrumbs in locale files");
  }
  return pass("Breadcrumb labels localized");
});

check("all standard templates present", () => {
  const required = [
    "index.json",
    "product.json",
    "collection.json",
    "page.json",
    "blog.json",
    "article.json",
    "cart.json",
    "search.json",
    "404.json",
    "list-collections.json",
    "password.json",
  ];
  const missing = required.filter((t) => !existsSync(join(TEMPLATES, t)));
  return missing.length ? fail(`Missing: ${missing.join(", ")}`) : pass("Standard templates present");
});

const failed = results.filter((r) => !r.ok);
console.log("# EDP Theme SEO Audit\n");
for (const r of results) {
  console.log(`${r.ok ? "✅" : "❌"} ${r.name}: ${r.msg}`);
}
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  process.exit(1);
}
