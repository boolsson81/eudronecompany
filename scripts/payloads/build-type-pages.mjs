#!/usr/bin/env node
/**
 * Genererar temamallar och siddefinitioner för nyttolasttyp-sidor (generella, varumärkesneutrala).
 *
 * Sidorna beskriver nyttolasttyper — sökljus, sökljus med högtalare, tjudrad belysning,
 * lastsläpp, nattkameror och specialnyttolaster — inte ett enskilt märke. Konkreta produkter
 * och kollektioner kopplas på i ett senare steg, per märke (se `linkedCollection` nedan).
 *
 * Sektionen `enterprise-industry-landing` med solution-/benefit-block, följd av
 * `enterprise-contact` och metafältsstyrd FAQ. Nyttolastnavet `/pages/payloads` länkas som brödsmula.
 *
 * Inga priser visas på sidorna — listpris är inte säljpris (se docs/INKOPSPROSPEKT.md).
 *
 * Kör:  node scripts/payloads/build-type-pages.mjs
 * Ut:   theme/templates/page.payload-<typ>.json  +  data/payload-type-pages.json
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BRAND = "EU Drone Company";
const PHONE = "tel:+46762850065";
const QUOTE = "/pages/contact-quote";
const CRUMB = { label: "Nyttolaster", link: "/pages/payloads" };

const PAGES = [
  {
    handle: "payload-sokljus",
    title: "Sökljus och IR-belysning för drönare",
    eyebrow: "Sökljus",
    intro:
      "Gimbalstyrda sökljus förlänger uppdraget in i mörkret. Modellerna skiljer sig i ljusstyrka, strobefunktion och om ljuset är synligt eller infrarött för spaning.",
    solutionsHeading: "Typer",
    solutions: [
      { title: "Gimbalstyrda sökljus", text: "Riktbart ljus med egen gimbal som följer kameran eller styrs separat, i storlekar för både kompakta och stora plattformar." },
      { title: "Sökljus med strobe", text: "Blinkfunktion som gör drönaren synlig från marken och kan användas för att markera en plats." },
      { title: "Infraröda fill-in-ljus", text: "Osynlig belysning för nattkameror och spaning, där ljuset inte ska synas för blotta ögat." },
      { title: "Fast monterad arbetsbelysning", text: "Enklare ljus utan gimbal för belysning rakt under eller framför drönaren." },
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
      text: "Berätta vilken drönarmodell ni flyger så bekräftar vi passform och rekommenderar rätt sökljus.",
    },
    seo: {
      title: `Sökljus och IR-belysning för drönare | ${BRAND}`,
      description:
        "Gimbalstyrda sökljus, strobe och infraröd belysning för professionella drönare. Offert och support på svenska.",
    },
  },
  {
    handle: "payload-sokljus-hogtalare",
    title: "Sökljus och högtalare för drönare",
    eyebrow: "Sökljus och högtalare",
    intro:
      "Kombinerade sökljus och högtalare samt rena röst- och utropssystem gör drönaren till en luftburen utropsenhet för myndigheter, räddningstjänst och säkerhetsuppdrag.",
    solutionsHeading: "Typer",
    solutions: [
      { title: "Sökljus och högtalare i en enhet", text: "Ljus och ljud i samma nyttolast, vilket sparar vikt och fäste på plattformen." },
      { title: "Röst- och utropssystem", text: "Digital röstsändning med realtidsutrop, inspelade meddelanden och text-till-tal." },
      { title: "Varningsljus", text: "Ljus som drar uppmärksamhet och förstärker ett utrop eller en varning." },
      { title: "Ljudupptagare", text: "Mikrofon för att höra vad som sägs på marken vid kommunikation åt två håll." },
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
      title: `Sökljus och högtalare för drönare | ${BRAND}`,
      description:
        "Kombinerade sökljus och högtalare samt röstsystem för professionella drönare. Offert och support på svenska.",
    },
  },
  {
    handle: "payload-tjudrad-belysning",
    title: "Matrix-belysning och tjudrad belysning för drönare",
    eyebrow: "Arbetsbelysning och tjudrade system",
    intro:
      "Bred arbetsbelysning från luften, och tjudrade system som matar drönaren med ström från marken så att belysningen kan stå uppe hela natten.",
    solutionsHeading: "System",
    solutions: [
      { title: "Matrix-belysning", text: "Belysningsset i flera effektsteg för bred ljussättning av större ytor, på fri flygning." },
      { title: "Tjudrade kraftsystem", text: "Marken matar drönaren med ström via lina, så flygtiden begränsas inte av batterierna." },
      { title: "Portabelt tjudrat hoverljus", text: "Snabbt utplacerat och hopfällbart luftburet ljus för utomhusbruk." },
      { title: "Tjudrade system med kamera", text: "Tjudrad plattform med zoom- och värmekamera för långvarig övervakning." },
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
      text: "Vi hjälper er välja mellan belysning på fri flygning och tjudrade system med kontinuerlig ström.",
    },
    seo: {
      title: `Matrix-belysning och tjudrad belysning för drönare | ${BRAND}`,
      description:
        "Arbetsbelysning och tjudrade kraftsystem för professionella drönare. Offert på svenska.",
    },
  },
  {
    handle: "payload-lastslapp",
    title: "Lastsläpp och logistiknyttolaster för drönare",
    eyebrow: "Lastsläpp och logistik",
    intro:
      "Lastsläpp låter drönaren leverera utrustning på exakt plats. Kroksläpp passar räddnings- och materialuppdrag, logistiknyttolaster är byggda för leveranser med större transportdrönare.",
    solutionsHeading: "Typer",
    solutions: [
      { title: "Kroksläpp", text: "Släpp för krok eller lina, med olika lastkapacitet och möjlighet till flera avlämningar på en flygning." },
      { title: "Precisionssläpp", text: "Släpp med avståndsmätning för meterprecis avlämning från större plattformar." },
      { title: "Kompakta släpp", text: "Lätta släpp för mindre enterprise-drönare där vikten är avgörande." },
      { title: "Logistiknyttolaster", text: "Lådor och hållare för leveransuppdrag med transportdrönare." },
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
      title: `Lastsläpp och logistiknyttolaster för drönare | ${BRAND}`,
      description:
        "Kroksläpp, precisionssläpp och logistiknyttolaster för professionella drönare. Offert och support på svenska.",
    },
  },
  {
    handle: "payload-kameror",
    title: "Nattkameror och termiska kameror för drönare",
    eyebrow: "Kameror",
    intro:
      "Nattkameror och termiska kameror ger lång räckvidd för målsökning och kartläggning av större områden på enterprise-plattformar.",
    solutionsHeading: "Typer",
    solutions: [
      { title: "Termiska nattkameror", text: "Långdistansdetektering av värme, för spaning och kartläggning av större områden." },
      { title: "Nattkameror", text: "Kameror med bra ljuskänslighet för sök och övervakning i mörker." },
      { title: "Zoomkameror", text: "Optisk zoom för att identifiera mål på avstånd utan att närma sig." },
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
      text: "Vi går igenom uppdraget och jämför kameraalternativ mot er plattform. Kameror offereras per uppdrag.",
    },
    seo: {
      title: `Nattkameror och termiska kameror för drönare | ${BRAND}`,
      description:
        "Nattkameror och termisk detektering på lång räckvidd för professionella drönare. Offert på svenska.",
    },
  },
  {
    handle: "payload-specialnyttolaster",
    title: "Specialnyttolaster — vatten, eld och lastutlösning",
    eyebrow: "Specialnyttolaster",
    intro:
      "För uppdrag som kräver mer än belysning och ljud: vattensystem för brandbekämpning, verktyg för hinderröjning och elektriska utlösare. Alla är avsedda för professionell användning.",
    solutionsHeading: "Typer",
    solutions: [
      { title: "Vattensystem", text: "Högtrycksvattensystem för medelstora och stora multirotordrönare, avsett för bland annat skogsbrandbekämpning." },
      { title: "Röjningsverktyg", text: "Drönarmonterade verktyg för precis röjning av hinder och markvård." },
      { title: "Elektriska utlösare", text: "Utlösare för flera laster i samma nyttolast, med snabbmontering på plattformen." },
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
      title: `Specialnyttolaster för drönare — vatten, röjning och utlösning | ${BRAND}`,
      description:
        "Vattensystem, röjningsverktyg och elektriska utlösare för professionella drönare. Offert efter genomgång av regelverk.",
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
  join(ROOT, "data", "payload-type-pages.json"),
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

console.log(`Skrev ${PAGES.length} temamallar och data/payload-type-pages.json`);
