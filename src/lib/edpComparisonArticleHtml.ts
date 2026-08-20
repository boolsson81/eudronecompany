import type { EdpComparisonArticle } from "@/data/edpComparisonArticles";
import {
  COMPARISON_SPEC_LABELS,
  getCamerasByIds,
  getSpecValue,
  type DroneCamera,
} from "@/data/droneCameras";
import { EDP_COMPARISON_CSS } from "@/lib/edpComparisonStyles";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isDifferentRow(label: string, cameras: DroneCamera[]): boolean {
  const values = cameras.map((c) => getSpecValue(c, label));
  return new Set(values).size > 1;
}

function renderComparisonTable(cameras: DroneCamera[]): string {
  const headerCells = cameras
    .map((c) => `<th scope="col">${escapeHtml(c.name)}</th>`)
    .join("\n          ");

  const rows = COMPARISON_SPEC_LABELS.map((label) => {
    const diff = isDifferentRow(label, cameras);
    const cells = cameras
      .map((camera) => {
        const value = getSpecValue(camera, label);
        const cls = value === "—" ? ' class="edp-comparison__dash"' : "";
        return `<td${cls}>${escapeHtml(value)}</td>`;
      })
      .join("\n          ");
    const rowClass = diff ? ' class="edp-comparison__row--diff"' : "";
    return `
        <tr${rowClass}>
          <th scope="row">${escapeHtml(label)}</th>
          ${cells}
        </tr>`;
  }).join("\n");

  return `
    <div class="edp-comparison__table-wrap">
      <table class="edp-comparison__table">
        <thead>
          <tr>
            <th scope="col">Specifikation</th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
}

export function renderEdpComparisonArticleHtml(article: EdpComparisonArticle): string {
  const cameras = getCamerasByIds(article.cameraIds);
  const faq = article.faq
    .map(
      (item) => `
    <details class="edp-comparison__faq-item">
      <summary>${escapeHtml(item.question)}</summary>
      <p>${escapeHtml(item.answer)}</p>
    </details>`,
    )
    .join("\n");

  const productLinks = cameras
    .filter((c) => c.edpUrl || c.shopUrl)
    .map(
      (c) =>
        `<a href="${escapeHtml(c.edpUrl || c.shopUrl!)}" class="edp-comparison__product-link">${escapeHtml(c.name)}</a>`,
    )
    .join("\n        ");

  return `<style>${EDP_COMPARISON_CSS}</style>
<div class="edp-comparison-page">
  <p class="edp-comparison__eyebrow">${escapeHtml(article.eyebrow)}</p>

  <section class="edp-comparison__intro">
    ${article.introParagraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n    ")}
  </section>

  <h2>Specifikationsjämförelse</h2>
  ${renderComparisonTable(cameras)}

  <section class="edp-comparison__verdict">
    <h2>Vår rekommendation</h2>
    ${article.verdictParagraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n    ")}
    ${productLinks ? `<div class="edp-comparison__product-links">\n        ${productLinks}\n      </div>` : ""}
  </section>

  <section>
    <h2>Vanliga frågor</h2>
    ${faq}
  </section>

  <section class="edp-comparison__cta">
    <h2>Behöver du hjälp att välja?</h2>
    <p>Kontakta vårt B2B-team för skräddarsydd rådgivning kring Zenmuse-kameror och payloads.</p>
    <div class="edp-comparison__cta-buttons">
      <a href="/pages/b2b" class="edp-comparison__cta-primary">Begär offert</a>
      <a href="/collections/dronar-kameror" class="edp-comparison__cta-secondary">Se alla drönarkameror</a>
    </div>
  </section>
</div>`;
}

export function renderEdpComparisonFaqJsonLd(article: EdpComparisonArticle): object | null {
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
