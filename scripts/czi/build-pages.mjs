#!/usr/bin/env node
/**
 * Genererar temamallar och siddefinitioner för CZI:s produktsidor (serie-/sortimentssidor).
 *
 * Följer samma mönster som scripts/wisson/build-pages.mjs: sektionen
 * `enterprise-industry-landing` med solution-/benefit-block, följd av
 * `enterprise-contact` och metafältsstyrd FAQ. Varumärkesnavet `page.czi.json`
 * lämnas orört och länkas som brödsmula.
 *
 * Inga priser visas på sidorna — listpris är inte säljpris (se docs/INKOPSPROSPEKT.md).
 * Produktuppgifter är hämtade ur butikens produktbeskrivningar och CZI Q3 2026-prislistan.
 *
 * Kör:  node scripts/czi/build-pages.mjs
 * Ut:   theme/templates/page.czi-<serie>.json  +  data/czi-pages.json
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BRAND = "EU Drone Company";
const PHONE = "tel:+46762850065";
const QUOTE = "/pages/contact-quote";
const CRUMB = { label: "CZI", link: "/pages/czi" };

const PAGES = [
  {
    handle: "czi-sokljus",
    title: "CZI sökljus och IR-belysning för DJI-drönare",
    eyebrow: "CZI sökljus",
    intro:
      "CZI:s gimbalstyrda sökljus förlänger uppdraget in i mörkret. GL-serien passar allt från Mavic 3 Enterprise till Matrice 300 och 350, SL60 lägger till strobe och IR-modellerna ger osynlig belysning för spaning.",
    solutionsHeading: "Modeller",
    solutions: [
      { title: "GL10 V2", text: "Dubbelaxlad gimbal-sökarlampa för DJI Mavic 3E och 3T.", link: "/products/dubbelaxlad-gimbal-sokarlampa-for-dji-mavic-3e-3t" },
      { title: "GL60 Mini och GL60 Plus", text: "Gimbalsökljus för Matrice 30-serien respektive avancerad belysning under svåra förhållanden.", link: "/products/czi-gl60-mini-sokljus" },
      { title: "GL300 och SL60", text: "Kraftfullt sökljus för Matrice 200/300, samt SL60 med strobefunktion för M350/M300." },
      { title: "IR3 och IR10", text: "Infraröda fill-in-ljus. IR10 är en 808 nm-laser med upp till 12 W, osynlig för blotta ögat." },
    ],
    benefitsHeading: "Användningsområden",
    benefits: [
      "Sök och räddning i mörker",
      "Nattinspektion av infrastruktur",
      "Polis och skyddsuppdrag",
      "Spaning med osynligt IR-ljus",
    ],
    contact: {
      title: "Vilket sökljus passar din drönare?",
      text: "Berätta vilken DJI-modell ni flyger så bekräftar vi passform och rätt modell i GL-serien.",
    },
    seo: {
      title: `CZI sökljus för DJI-drönare — GL, SL och IR | ${BRAND}`,
      description:
        "Gimbalstyrda sökljus och IR-belysning från CZI för Mavic 3 Enterprise, Matrice 30, 300 och 350. Offert och support på svenska.",
    },
  },
  {
    handle: "czi-sokljus-hogtalare",
    title: "CZI sökljus med högtalare — LP- och MP-serien",
    eyebrow: "CZI LP- och MP-serien",
    intro:
      "LP-serien kombinerar sökljus och högtalare i en enhet, MP-serien är rena röst- och utropssystem. Drönaren blir en luftburen utropsenhet för myndigheter, räddningstjänst och säkerhetsuppdrag.",
    solutionsHeading: "Modeller",
    solutions: [
      { title: "LP12 och LP20", text: "Sökljus och sändningssystem för DJI M30 respektive Matrice 3D/3TD.", link: "/products/matrice-3d-sokarlampa-dji-matrice-3d-3dt-czi" },
      { title: "LP35", text: "Sökljus och högtalare i ett, upp till 90 W, ansluten via OSDK till DJI M350 RTK.", link: "/products/czi-lp35-sokarljus-m350-dji" },
      { title: "MP130 V2 och MP130 Pro", text: "Digitalt röstsändningssystem för Matrice 400/350/300 med realtidsutrop, inspelade meddelanden och TTS.", link: "/products/czi-mp130-v2-h-gtalare" },
      { title: "MP140, MP120 och PK10", text: "MP140 för stora områden på M300/M350, MP120 varningsljus och PK10 ljudupptagare." },
    ],
    benefitsHeading: "Användningsområden",
    benefits: [
      "Utrop och varning vid räddningsinsatser",
      "Sökning efter försvunna personer",
      "Ordning och säkerhet vid stora evenemang",
      "Kommunikation med personer utom räckhåll",
    ],
    contact: {
      title: "Behöver ni utrop från luften?",
      text: "Vi går igenom uppdraget och rekommenderar rätt kombination av sökljus och högtalare för er plattform.",
    },
    seo: {
      title: `CZI LP och MP — sökljus och högtalare för drönare | ${BRAND}`,
      description:
        "CZI LP12, LP20, LP35 och MP130/MP140 — sökljus och högtalarsystem för DJI Matrice och Mavic. Offert och support på svenska.",
    },
  },
  {
    handle: "czi-matrix-tether",
    title: "CZI Matrix Light och tjudrad belysning",
    eyebrow: "CZI ML, CZ och TK",
    intro:
      "Matrix Light-serien ger bred arbetsbelysning från luften, och tjudrade system som TK3/TK4 och CZ10 matar drönaren med ström från marken så att belysningen kan stå uppe hela natten.",
    solutionsHeading: "System",
    solutions: [
      { title: "ML200 Matrix Light", text: "Belysningsset i flera effekter: 400 W, 800 W och 1500 W, för DJI M350/M300.", link: "/products/czi-ml200-800w-matrix-light-for-m350-300" },
      { title: "TK3 och TK4", text: "Tjudrat kraftsystem som omvandlar 220 V AC till drönarens strömförsörjning. TK4 finns med 110 m lina." },
      { title: "CZ10 Tethered Hover Light", text: "Portabelt, snabbt utplacerat luftburet ljus med hopfällbar konstruktion för utomhusbruk." },
      { title: "CZ100 och CZ100V", text: "Tjudrade belysningssystem, CZ100V med zoom och värmekamera." },
    ],
    benefitsHeading: "Användningsområden",
    benefits: [
      "Belysning av olycks- och skadeplatser",
      "Långvariga nattarbeten utan batteribyte",
      "Byggplatser och evenemang",
      "Insatser vid strömavbrott och katastrofer",
    ],
    contact: {
      title: "Planerar ni långvarig belysning?",
      text: "Vi hjälper er välja mellan Matrix Light på fri flygning och tjudrade system med kontinuerlig ström.",
    },
    seo: {
      title: `CZI Matrix Light och tjudrad belysning för drönare | ${BRAND}`,
      description:
        "CZI ML200 Matrix Light, TK3/TK4 tjudrat kraftsystem och CZ10 tjudrat hoverljus för DJI Matrice. Offert på svenska.",
    },
  },
  {
    handle: "czi-lastslapp",
    title: "CZI lastsläpp och logistiknyttolaster",
    eyebrow: "CZI TH- och FS-serien",
    intro:
      "CZI:s lastsläpp låter drönaren leverera utrustning på exakt plats. TH-serien är kroksläpp för Matrice och FlyCart, FS-serien är logistiknyttolaster för leveransuppdrag.",
    solutionsHeading: "Modeller",
    solutions: [
      { title: "TH4 V2", text: "Kroksläpp på 320 g med 40 kg lastkapacitet. Genomför fyra uppdrag på en flygning. För Matrice 210 V2 och M300 RTK.", link: "/products/czi-th4-v2-airdrop-kit" },
      { title: "Throwing Hook för Matrice 4", text: "Kompakt släpp för DJI Matrice 4." },
      { title: "TH6", text: "Precisionssläpp för FlyCart 100 och AGRAS T100 med laseravståndsmätning för meterprecis avlämning." },
      { title: "FS32 och FS35", text: "Logistiknyttolaster för leveranser med DJI FlyCart-serien." },
    ],
    benefitsHeading: "Användningsområden",
    benefits: [
      "Leverans av nödutrustning och livlinor",
      "Materialtransport till svårtillgängliga platser",
      "Logistik i glesbygd och skärgård",
      "Precisionsavlämning på fasta punkter",
    ],
    contact: {
      title: "Vad ska drönaren leverera?",
      text: "Berätta om last, vikt och plattform så väljer vi rätt släpp.",
    },
    seo: {
      title: `CZI lastsläpp — TH4 V2, TH6 och FS-serien | ${BRAND}`,
      description:
        "CZI kroksläpp och logistiknyttolaster för DJI Matrice, FlyCart och AGRAS. Offert och support på svenska.",
    },
  },
  {
    handle: "czi-kameror",
    title: "CZI DT1K och C30N — nattkameror för DJI Matrice",
    eyebrow: "CZI kameror",
    intro:
      "CZI:s nattkameror ger lång räckvidd för målsökning och områdeskartläggning på DJI Matrice 300 och 350 RTK. DT1K är den mest utbyggda modellen i sortimentet.",
    solutionsHeading: "Modeller",
    solutions: [
      { title: "DT1K", text: "Termisk nattkamera byggd för långdistansdetektering och kartläggning av större områden på M300/M350." },
      { title: "C30N", text: "Nattkamera för Matrice 300/350 RTK. Pris och tillgänglighet bekräftas på förfrågan." },
    ],
    benefitsHeading: "Användningsområden",
    benefits: [
      "Sök och räddning i mörker",
      "Gränsövervakning och skydd",
      "Brandspaning och värmeläckage",
      "Kartläggning av stora områden",
    ],
    contact: {
      title: "Behöver ni en nattkamera?",
      text: "Vi går igenom uppdraget och jämför DT1K och C30N mot er plattform. Kamerorna offereras per uppdrag.",
    },
    seo: {
      title: `CZI DT1K och C30N nattkameror | ${BRAND}`,
      description:
        "CZI nattkameror för DJI Matrice 300 och 350 RTK — termisk detektering på lång räckvidd. Offert på svenska.",
    },
  },
  {
    handle: "czi-specialnyttolaster",
    title: "CZI specialnyttolaster — vatten, eld och lastutlösning",
    eyebrow: "CZI specialnyttolaster",
    intro:
      "För uppdrag som kräver mer än belysning och ljud: DH100 vattensystem för brandbekämpning, FT10 V2 för hinderröjning och ES638 för elektrisk utlösning. Alla är avsedda för professionell användning.",
    solutionsHeading: "Modeller",
    solutions: [
      { title: "DH100", text: "Multifunktionellt högtrycksvattensystem för medelstora och stora multirotordrönare, avsett för bland annat skogsbrandbekämpning." },
      { title: "FT10 V2", text: "Drönarmonterad eldkastare för precis röjning av hinder och markvård." },
      { title: "ES638", text: "Elektrisk utlösare för M400/M350/M300 med 2, 6 eller 8 skott i en last för 38 mm/64 mm ammunition. Snabbmontering." },
    ],
    benefitsHeading: "Användningsområden",
    benefits: [
      "Skogs- och markbrandbekämpning",
      "Röjning av hinder på svåråtkomlig mark",
      "Höghöjdsarbete utan personal i fara",
      "Myndighetsuppdrag med särskilda krav",
    ],
    contact: {
      title: "Särskilda krav på uppdraget?",
      text: "Dessa nyttolaster kan omfattas av tillstånds- och exportregler. Kontakta oss innan beställning så går vi igenom vad som gäller.",
    },
    seo: {
      title: `CZI DH100, FT10 V2 och ES638 specialnyttolaster | ${BRAND}`,
      description:
        "CZI:s vattensystem, eldkastare och elektriska utlösare för DJI-drönare. Offert efter genomgång av regelverk.",
    },
  },
];

function template(p) {
  const blocks = {};
  const order = [];
  p.solutions.forEach((s, i) => {
    const k = `solution_${i + 1}`;
    blocks[k] = { type: "solution", settings: { title: s.title, text: s.text, ...(s.link ? { link: s.link } : {}) } };
    order.push(k);
  });
  p.benefits.forEach((b, i) => {
    const k = `benefit_${i + 1}`;
    blocks[k] = { type: "benefit", settings: { text: b } };
    order.push(k);
  });

  return {
    sections: {
      industry_landing: {
        type: "enterprise-industry-landing",
        blocks,
        block_order: order,
        settings: {
          show_breadcrumb: true,
          breadcrumb_label: CRUMB.label,
          breadcrumb_link: CRUMB.link,
          eyebrow: p.eyebrow,
          title: p.title,
          text: p.intro,
          solutions_heading: p.solutionsHeading,
          benefits_heading: p.benefitsHeading,
          color_scheme: "scheme-edp",
          padding_top: 36,
          padding_bottom: 24,
        },
      },
      enterprise_contact: {
        type: "enterprise-contact",
        settings: {
          title: p.contact.title,
          text: p.contact.text,
          button_label_1: "Skicka offertförfrågan",
          button_link_1: QUOTE,
          button_label_2: "Ring oss",
          button_link_2: PHONE,
          color_scheme: "scheme-edp",
          padding_top: 24,
          padding_bottom: 48,
        },
      },
      faq: {
        type: "edp-metafield-faq",
        settings: { color_scheme: "scheme-edp", padding_top: 36, padding_bottom: 36 },
      },
    },
    order: ["industry_landing", "enterprise_contact", "faq"],
  };
}

for (const p of PAGES) {
  writeFileSync(
    join(ROOT, "theme", "templates", `page.${p.handle}.json`),
    JSON.stringify(template(p), null, 2) + "\n"
  );
}

writeFileSync(
  join(ROOT, "data", "czi-pages.json"),
  JSON.stringify(
    PAGES.map((p) => ({
      handle: p.handle,
      title: p.title,
      templateSuffix: p.handle,
      body: `<p>${p.intro}</p>`,
      seo: p.seo,
    })),
    null,
    1
  ) + "\n"
);

console.log(`Skrev ${PAGES.length} temamallar och data/czi-pages.json`);
