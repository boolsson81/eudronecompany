#!/usr/bin/env node
/** Build JSON bundle for edge function deployment of EDP industry pages */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { EDP_INDUSTRY_PAGES } from "../src/data/edpIndustryPages.ts";
import { EDP_ENTERPRISE_PAGE } from "../src/data/edpEnterprisePage.ts";
import { renderEdpIndustryPageHtml, renderEdpIndustryFaqJsonLd } from "../src/lib/edpIndustryPageHtml.ts";
import { renderEdpEnterprisePageHtml } from "../src/data/edpEnterprisePage.ts";
import { EDP_INDUSTRY_CSS } from "../src/lib/edpIndustryStyles.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "supabase/functions/_shared/edp-industry-pages-bundle.json");
const THEME_CSS = readFileSync(join(ROOT, "shopify-theme/edp/assets/edp-industry.css"), "utf8");

const pages = [
  ...EDP_INDUSTRY_PAGES.map((p) => ({
    handle: p.handle,
    title: p.title,
    templateSuffix: p.templateSuffix,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    excerpt: p.shortDesc,
    tags: ["industry", "enterprise", p.handle],
    bodyHtml: renderEdpIndustryPageHtml(p),
    faqJsonLd: renderEdpIndustryFaqJsonLd(p),
  })),
  {
    handle: EDP_ENTERPRISE_PAGE.handle,
    title: EDP_ENTERPRISE_PAGE.title,
    templateSuffix: EDP_ENTERPRISE_PAGE.templateSuffix,
    metaTitle: EDP_ENTERPRISE_PAGE.metaTitle,
    metaDescription: EDP_ENTERPRISE_PAGE.metaDescription,
    excerpt: EDP_ENTERPRISE_PAGE.heroDesc,
    tags: ["enterprise", "hub"],
    bodyHtml: renderEdpEnterprisePageHtml(),
    faqJsonLd: null,
  },
];

writeFileSync(OUT, JSON.stringify({ pages, themeCss: THEME_CSS, generatedAt: new Date().toISOString() }, null, 2));
console.log(`Wrote ${OUT} (${pages.length} pages)`);
