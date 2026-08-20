#!/usr/bin/env node
/** Build JSON bundle for edge function deployment of EDP jämförer blog */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { EDP_COMPARISON_ARTICLES, EDP_COMPARISON_BLOG } from "../src/data/edpComparisonArticles.ts";
import {
  renderEdpComparisonArticleHtml,
  renderEdpComparisonFaqJsonLd,
} from "../src/lib/edpComparisonArticleHtml.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "supabase/functions/_shared/edp-comparison-bundle.json");
const THEME_CSS = readFileSync(join(ROOT, "shopify-theme/edp/assets/edp-comparison.css"), "utf8");

const articles = EDP_COMPARISON_ARTICLES.map((a) => ({
  handle: a.handle,
  title: a.title,
  templateSuffix: EDP_COMPARISON_BLOG.templateSuffix,
  metaTitle: a.metaTitle,
  metaDescription: a.metaDescription,
  excerpt: a.excerpt,
  tags: a.tags,
  bodyHtml: renderEdpComparisonArticleHtml(a),
  faqJsonLd: renderEdpComparisonFaqJsonLd(a),
}));

writeFileSync(
  OUT,
  JSON.stringify(
    {
      blog: EDP_COMPARISON_BLOG,
      articles,
      themeCss: THEME_CSS,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log(`Wrote ${OUT} (${articles.length} articles)`);
