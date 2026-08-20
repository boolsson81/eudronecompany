import type { EdpFaqArticle } from "@/data/edpFaqArticles";
import { EDP_FAQ_CSS } from "@/lib/edpFaqStyles";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderEdpFaqArticleHtml(article: EdpFaqArticle): string {
  const faqItems = article.faq
    .map(
      (item) => `
    <details class="edp-faq__item">
      <summary>${escapeHtml(item.question)}</summary>
      <p>${escapeHtml(item.answer)}</p>
    </details>`,
    )
    .join("\n");

  const relatedLinks = (article.relatedLinks ?? [])
    .map(
      (link) =>
        `<a href="${escapeHtml(link.url)}" class="edp-faq__related-link">${escapeHtml(link.label)}</a>`,
    )
    .join("\n        ");

  const jsonLd = renderEdpFaqJsonLd(article);
  const jsonLdScript = jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
    : "";

  return `<style>${EDP_FAQ_CSS}</style>
<div class="edp-faq-page">
  <p class="edp-faq__eyebrow">${escapeHtml(article.eyebrow)}</p>

  <section class="edp-faq__intro">
    ${article.introParagraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n    ")}
  </section>

  <h2>Vanliga frågor</h2>
  <div class="edp-faq__list">
    ${faqItems}
  </div>

  ${
    relatedLinks
      ? `<section class="edp-faq__related">
    <h2>Läs mer</h2>
    <div class="edp-faq__related-links">
        ${relatedLinks}
    </div>
  </section>`
      : ""
  }

  <section class="edp-faq__cta">
    <h2>Hittade du inte svaret?</h2>
    <p>Kontakta vårt B2B-team för personlig rådgivning kring enterprise-drönare och Zenmuse-kameror.</p>
    <div class="edp-faq__cta-buttons">
      <a href="/pages/b2b" class="edp-faq__cta-primary">Begär offert</a>
      <a href="/collections/enterprise-drones" class="edp-faq__cta-secondary">Se enterprise-drönare</a>
    </div>
  </section>
</div>
${jsonLdScript}`;
}

export function renderEdpFaqJsonLd(article: EdpFaqArticle): object | null {
  if (!article.faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
