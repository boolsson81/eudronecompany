#!/usr/bin/env node
/** Build JSON bundle for edge function deployment of EDP FAQ blog */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { EDP_FAQ_ARTICLES, EDP_FAQ_BLOG } from "../src/data/edpFaqArticles.ts";
import { renderEdpFaqArticleHtml, renderEdpFaqJsonLd } from "../src/lib/edpFaqArticleHtml.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "supabase/functions/_shared/edp-faq-bundle.json");
const THEME_CSS = readFileSync(join(ROOT, "shopify-theme/edp/assets/edp-faq.css"), "utf8");

const articles = EDP_FAQ_ARTICLES.map((a) => ({
  handle: a.handle,
  title: a.title,
  templateSuffix: EDP_FAQ_BLOG.templateSuffix,
  metaTitle: a.metaTitle,
  metaDescription: a.metaDescription,
  excerpt: a.excerpt,
  tags: a.tags,
  bodyHtml: renderEdpFaqArticleHtml(a),
  faqJsonLd: renderEdpFaqJsonLd(a),
}));

writeFileSync(
  OUT,
  JSON.stringify(
    {
      blog: EDP_FAQ_BLOG,
      articles,
      themeCss: THEME_CSS,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log(`Wrote ${OUT} (${articles.length} articles)`);
