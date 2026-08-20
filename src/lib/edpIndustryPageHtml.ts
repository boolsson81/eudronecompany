import type { EdpIndustryPage } from "@/data/edpIndustryPages";
import { EDP_INDUSTRY_CSS } from "@/lib/edpIndustryStyles";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Generates Shopify-compatible HTML for an EDP industry page.
 * Includes inline CSS so content renders correctly even before theme assets are deployed.
 */
export function renderEdpIndustryPageHtml(page: EdpIndustryPage): string {
  const applications = page.applications
    .map(
      (app) => `
    <div class="edp-industry__application">
      <h3>${escapeHtml(app.title)}</h3>
      <p>${escapeHtml(app.description)}</p>
    </div>`,
    )
    .join("\n");

  const products = page.recommendedProducts
    .map(
      (product) => `
    <div class="edp-industry__product">
      <span class="edp-industry__product-tag">${escapeHtml(product.tag)}</span>
      <h3>${escapeHtml(product.name)}</h3>
      <p>${escapeHtml(product.description)}</p>
      <ul>
        ${product.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("\n        ")}
      </ul>
      <a href="${escapeHtml(product.collectionUrl)}" class="edp-industry__link">Se produkter →</a>
    </div>`,
    )
    .join("\n");

  const benefits = page.benefits
    .map((b) => `<li>${escapeHtml(b)}</li>`)
    .join("\n      ");

  const faq = page.faq
    .map(
      (item) => `
    <details class="edp-industry__faq-item">
      <summary>${escapeHtml(item.question)}</summary>
      <p>${escapeHtml(item.answer)}</p>
    </details>`,
    )
    .join("\n");

  const relatedLinks = page.relatedCollections
    .map(
      (col) =>
        `<a href="${escapeHtml(col.url)}" class="edp-industry__related-link">${escapeHtml(col.label)}</a>`,
    )
    .join("\n      ");

  return `<style>${EDP_INDUSTRY_CSS}</style>
<div class="edp-industry-page">
  <section class="edp-industry__hero">
    <p class="edp-industry__eyebrow">${escapeHtml(page.title)}</p>
    <h1>${escapeHtml(page.heroTitle)}</h1>
    <p class="edp-industry__lead">${escapeHtml(page.heroDesc)}</p>
  </section>

  <section class="edp-industry__intro">
    <p>${escapeHtml(page.intro)}</p>
  </section>

  <section class="edp-industry__applications">
    <h2>Användningsområden</h2>
    <div class="edp-industry__grid">
      ${applications}
    </div>
  </section>

  <section class="edp-industry__products">
    <h2>Rekommenderad utrustning</h2>
    <div class="edp-industry__grid">
      ${products}
    </div>
  </section>

  <section class="edp-industry__benefits">
    <h2>Fördelar</h2>
    <ul>
      ${benefits}
    </ul>
  </section>

  <section class="edp-industry__faq">
    <h2>Vanliga frågor</h2>
    ${faq}
  </section>

  <section class="edp-industry__related">
    <h2>Relaterade produktkategorier</h2>
    <div class="edp-industry__related-links">
      ${relatedLinks}
    </div>
  </section>

  <section class="edp-industry__cta">
    <h2>Behöver du hjälp att välja rätt lösning?</h2>
    <p>Kontakta vårt B2B-team för skräddarsydd rådgivning, offert och demonstrationsflygning.</p>
    <div class="edp-industry__cta-buttons">
      <a href="/pages/b2b" class="edp-industry__cta-primary">Begär offert</a>
      <a href="/pages/contact" class="edp-industry__cta-secondary">Kontakta oss</a>
    </div>
  </section>
</div>`;
}

/**
 * FAQ JSON-LD for structured data (Shopify page metafields or theme injection).
 */
export function renderEdpIndustryFaqJsonLd(page: EdpIndustryPage): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  });
}
