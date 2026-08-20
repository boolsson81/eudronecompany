import { EDP_INDUSTRY_PAGES } from "./edpIndustryPages";
import { EDP_INDUSTRY_CSS } from "@/lib/edpIndustryStyles";

export interface EdpEnterprisePage {
  handle: string;
  title: string;
  heroTitle: string;
  heroDesc: string;
  intro: string;
  templateSuffix: string;
  metaTitle: string;
  metaDescription: string;
}

export const EDP_ENTERPRISE_PAGE: EdpEnterprisePage = {
  handle: "enterprise",
  title: "Enterprise",
  heroTitle: "Professionella drönarlösningar för företag",
  heroDesc:
    "DJI Matrice, Agras, Zenmuse-sensorer och kompletta enterprise-system — från inspektion och kartläggning till räddningsinsatser.",
  intro:
    "EuroDroneParts är din partner för professionella UAV-lösningar. Vi levererar enterprise-drönare, sensorer och tillbehör med expertstöd, utbildning och B2B-villkor. Oavsett om du arbetar med energi, GIS eller räddningstjänst — vi hjälper dig hitta rätt utrustning.",
  templateSuffix: "enterprise",
  metaTitle: "Enterprise-drönare & professionella UAV-lösningar | EuroDroneParts",
  metaDescription:
    "Professionella drönarlösningar för företag. DJI Matrice, Agras, Zenmuse-sensorer och kompletta system för inspektion, kartläggning och räddning.",
};

const INDUSTRY_ICONS: Record<string, string> = {
  "energy-infrastructure": "⚡",
  "gis-mapping": "🗺️",
  "emergency-services": "🚒",
};

export function renderEdpEnterprisePageHtml(): string {
  const cards = EDP_INDUSTRY_PAGES.map(
    (page) => `
    <a href="/pages/${page.handle}" class="edp-enterprise__card">
      <div class="edp-enterprise__card-icon">${INDUSTRY_ICONS[page.handle] || "🚁"}</div>
      <h3>${page.title}</h3>
      <p>${page.shortDesc}</p>
      <span class="edp-enterprise__card-link">Läs mer →</span>
    </a>`,
  ).join("\n");

  return `<style>${EDP_INDUSTRY_CSS}</style>
<div class="edp-industry-page">
  <section class="edp-industry__hero">
    <p class="edp-industry__eyebrow">Enterprise</p>
    <h1>${EDP_ENTERPRISE_PAGE.heroTitle}</h1>
    <p class="edp-industry__lead">${EDP_ENTERPRISE_PAGE.heroDesc}</p>
  </section>

  <section class="edp-industry__intro">
    <p>${EDP_ENTERPRISE_PAGE.intro}</p>
  </section>

  <section class="edp-enterprise__industries">
    <h2>Lösningar per bransch</h2>
    <p class="edp-enterprise__subtitle">Effektivisera arbetsflöden med drönarteknik anpassad för din sektor.</p>
    <div class="edp-enterprise__grid">
      ${cards}
    </div>
  </section>

  <section class="edp-industry__cta">
    <h2>Redo att komma igång?</h2>
    <p>Kontakta vårt B2B-team för skräddarsydd rådgivning, demo och offert.</p>
    <div class="edp-industry__cta-buttons">
      <a href="/pages/b2b" class="edp-industry__cta-primary">Begär offert</a>
      <a href="/collections/enterprise-drones" class="edp-industry__cta-secondary">Se enterprise-drönare</a>
    </div>
  </section>
</div>`;
}
