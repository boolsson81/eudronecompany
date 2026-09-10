#!/usr/bin/env node
/**
 * Genererar temamallar och siddefinitioner för Wisson-landningssidorna.
 *
 * Mallarna följer samma mönster som page.jordbruk.json: sektionen
 * `enterprise-industry-landing` med solution-/benefit-block, följd av
 * `enterprise-contact`.
 *
 * Kör:  node scripts/wisson/build-pages.mjs
 * Ut:   theme/templates/page.<suffix>.json  +  data/wisson-pages.json
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BRAND = "EU Drone Company";
const PHONE = "tel:+46762850065";
const QUOTE = "/pages/contact-quote";

const PAGES = [
  {
    handle: "wisson",
    title: "Wisson Orion — flygburna robotsystem",
    eyebrow: "Wisson",
    breadcrumb: { label: "Enterprise", link: "/pages/enterprise" },
    intro:
      "Wisson Orion gör industridrönaren till en arbetsmaskin. Pliabot-tekniken bygger på mjuka bioniska muskler med pneumatisk drivning, vilket ger armar som både böjer sig och teleskoperar — och som tål att slå emot utan att flygningen havererar.",
    solutionsHeading: "Fyra serier och ett färdigt paket",
    solutions: [
      { title: "N-serien — manipulation", text: "Robotarm som griper, lyfter och arbetar i luften. AP30-N1 lyfter 15 kg vid 8 kg egenvikt." },
      { title: "G-serien — lastsläpp", text: "Aktivt styrd avlämning, från 2 kg gripdon till 40 kg tunglast på 100 meters lina." },
      { title: "P-serien — sprutning och tvätt", text: "Sex system för höghöjdsarbete: sprutmoduler, högtryckstvätt och slangmatad fasadtvätt med renvatten." },
      { title: "D-serien — kontaktinspektion", text: "Mätning med fysisk kontakt: 20 N anliggning i 30 sekunder med kraftåterkoppling i realtid." },
      { title: "AP3-S1 — hela tvättekipaget", text: "Systempaketet för fasadtvätt: AP3-P3-robot, DJI Matrice 400 och DIC-vattenrening i ett." },
    ],
    benefitsHeading: "Därför Pliabot",
    benefits: [
      "Mjuka leder gör kontakt med arbetsytan ofarlig",
      "Noll strömförbrukning när greppet håller",
      "Monteras och byts på plats, ofta under en minut",
      "Integrerad med DJI-kontrollen — en operatör räcker",
    ],
    contact: {
      title: "Vill du veta om Orion passar er verksamhet?",
      text: "Vi går igenom uppdraget, plattformen ni redan flyger och vilken serie som är rätt. Systemen offereras per uppdrag.",
    },
    seo: {
      title: `Wisson Orion — flygburna robotsystem | ${BRAND}`,
      description:
        "Pliabot-baserade robotarmar, gripdon, sprutmoduler och fasadtvättsystem för DJI-industridrönare. Offert, utbildning och support på svenska.",
    },
  },
  {
    handle: "wisson-n-serien",
    title: "Wisson N-serien — flygburen manipulation",
    eyebrow: "Wisson N-serien",
    breadcrumb: { label: "Wisson", link: "/pages/wisson" },
    intro:
      "N-serien flyttar drönaren från att observera till att arbeta. Armen böjer sig 360 grader och teleskoperar, och verktyget byts i ett steg — samma flygning kan gripa, ta prov, spruta och mäta.",
    solutionsHeading: "System i serien",
    solutions: [
      { title: "AP30-N1", text: "8 kg egenvikt, 15 kg vertikal lyftkapacitet, 390–800 mm räckvidd. Byggd för DJI FlyCart 30." },
      { title: "Verktyg", text: "Gripdon med två eller tre fingrar, visionmodul och fler verktyg som byts utan verktyg." },
      { title: "Drift i kyla", text: "Testad ned till -40 °C med skydd mot vatten, damm, strålning och korrosion." },
      { title: "Strömbudget", text: "60 W i drift och 0 W när armen håller sin position, vilket sparar flygtid." },
    ],
    benefitsHeading: "Användningsområden",
    benefits: [
      "Underhåll i energianläggningar",
      "Räddningsinsatser och akut hantering",
      "Infrastrukturinspektion",
      "Provtagning av gas, vätska och fast material",
    ],
    contact: {
      title: "Diskutera ett N-seriesystem",
      text: "AP30-N1 är byggd för DJI FlyCart 30, med anpassning till andra plattformar på beställning.",
    },
    seo: {
      title: `Wisson N-serien — flygburen manipulation | ${BRAND}`,
      description:
        "AP30-N1 flygburen Pliabot-manipulator: 15 kg lyftkapacitet, 360° böjning, verktygsbyte i ett steg. För DJI FlyCart 30.",
    },
  },
  {
    handle: "wisson-g-serien",
    title: "Wisson G-serien — flygburet lastsläpp",
    eyebrow: "Wisson G-serien",
    breadcrumb: { label: "Wisson", link: "/pages/wisson" },
    intro:
      "G-serien lämnar last exakt där den ska ligga. Gemensamt för systemen är aktiv utlösning: operatören bestämmer ögonblicket, i stället för att lasten släpps när linan slaknar.",
    solutionsHeading: "System i serien",
    solutions: [
      { title: "AP3-G1", text: "Mjukt gripdon för 2 kg som formar sig efter oregelbundna föremål. Självlåsande utan ström." },
      { title: "AP30-G2", text: "40 kg last som sänks på lina från 100 meters höjd, med AR-positionering för precis avlämning." },
      { title: "Kraftkontroll", text: "Greppkraften styrs steglöst och visas i realtid, så känsligt gods kan hanteras säkert." },
      { title: "Snabb rigg", text: "AP3-G1 monteras på 30 sekunder, AP30-G2 riggas på 3 minuter." },
    ],
    benefitsHeading: "Användningsområden",
    benefits: [
      "Blåljus, räddning och sjukvårdstransport",
      "Kraftnätsunderhåll och kraftledningsstolpar",
      "Geoteknik och terräng utan bärighet",
      "Avlämning vid stup och raserade vägar",
    ],
    contact: {
      title: "Vilken lastnivå behöver ni?",
      text: "AP3-G1 flyger på DJI Matrice 300 och 350, AP30-G2 på DJI FlyCart 30. Vi hjälper er välja.",
    },
    seo: {
      title: `Wisson G-serien — flygburet lastsläpp | ${BRAND}`,
      description:
        "AP3-G1 gripdon 2 kg och AP30-G2 tunglastsläppare 40 kg med 100 m hisshöjd. Aktiv utlösning och AR-positionering.",
    },
  },
  {
    handle: "wisson-p-serien",
    title: "Wisson P-serien — flygburen sprutning och tvätt",
    eyebrow: "Wisson P-serien",
    breadcrumb: { label: "Wisson", link: "/pages/wisson" },
    intro:
      "P-serien utför arbete på höga ytor utan ställning eller lift. Den mjuka upphängningen dämpar både pendling och kontakt med ytan, vilket gör att drönaren kan arbeta tätt intill i stället för att spruta på avstånd.",
    solutionsHeading: "System i serien",
    solutions: [
      { title: "AP3-P1", text: "Sprutmodul med 2-liters behållare som sprutar åt alla håll, även i trånga utrymmen. Fälls till 0,7 m." },
      { title: "AP30-P2", text: "Högtryckstvätt med 30 liters tank, vridbart munstycke och laser som mäter arbetsavståndet." },
      { title: "AP3-P3", text: "Slangmatat fasadtvättsystem med renvatten och 40° Pliabot-skrapa. Torkar utan ränder." },
      { title: "AP30-P4", text: "Dimspruta där atomiseringen lägger ett jämnt skikt utan överskott eller dropp." },
      { title: "AP30-P4H", text: "Högtrycksvariant för rengöring och sprutning med modulära arbetsenheter." },
      { title: "AP3-P5", text: "Sprutmodul med luftridå runt strålen. Minskar spillet med över 80 % enligt tillverkaren." },
    ],
    benefitsHeading: "Användningsområden",
    benefits: [
      "Fasadtvätt och höghöjdsrengöring",
      "Vindkraftverk, blad och torn",
      "Isolatorer, master och broar",
      "Solpaneler och stora takytor",
    ],
    contact: {
      title: "Sprutning eller tvätt?",
      text: "Valet styrs av yta, vätska och vilken drönare ni flyger. Vi går igenom uppdraget och offererar rätt konfiguration.",
    },
    seo: {
      title: `Wisson P-serien — flygburen sprutning och tvätt | ${BRAND}`,
      description:
        "AP3-P1 sprutmodul, AP30-P2 högtryckstvätt, AP3-P3 fasadtvätt med renvatten, AP30-P4 dimspruta, AP30-P4H högtryck och AP3-P5 luftridå.",
    },
  },
  {
    handle: "wisson-d-serien",
    title: "Wisson D-serien — flygburen kontaktinspektion",
    eyebrow: "Wisson D-serien",
    breadcrumb: { label: "Wisson", link: "/pages/wisson" },
    intro:
      "D-serien mäter med fysisk kontakt från luften. Modulen arbetar i sidled ut från drönaren och trycker givaren mot ytan, medan den mjuka upphängningen dämpar anslaget och håller flygningen i balans.",
    solutionsHeading: "System i serien",
    solutions: [
      { title: "AP3-D1", text: "20 N kontaktkraft i upp till 30 sekunder, med kraftåterkoppling i realtid på skärmen." },
      { title: "Sidoarbete", text: "Den mjuka upphängningen justerar modulens läge så att drönaren håller balansen under mätning." },
      { title: "Inbyggd sprutning", text: "Väter ytan före mätning och kan märka mätpunkter med färg för dokumentation." },
      { title: "Sensorval", text: "Stöd för olika givare beroende på vad som ska mätas. Modulbyte på under en minut." },
    ],
    benefitsHeading: "Användningsområden",
    benefits: [
      "Byggnadsprovning och fasadkontroll",
      "Brokontroll och bärverk",
      "Vindkraftsunderhåll",
      "Dokumenterade mätpunkter med färgmarkering",
    ],
    contact: {
      title: "Vad ska mätas?",
      text: "AP3-D1 är integrerad med DJI Matrice 300 och 350. Berätta vilken givare uppdraget kräver.",
    },
    seo: {
      title: `Wisson D-serien — flygburen kontaktinspektion | ${BRAND}`,
      description:
        "AP3-D1 kontaktinspektionsrobot: 20 N anliggning i 30 sekunder, kraftåterkoppling i realtid och inbyggd färgmarkering.",
    },
  },
  {
    handle: "wisson-ap3-s1",
    productHandle: "wisson-orion-ap3-s1-komplett-fasadtvattsystem-paket",
    title: "Wisson Orion AP3-S1 — fasadtvättsystem i paket",
    eyebrow: "Wisson systempaket",
    breadcrumb: { label: "Wisson", link: "/pages/wisson" },
    intro:
      "AP3-S1 är Wissons namn på hela tvättekipaget, inte en egen maskin. Kärnan är tre delar: AP3-P3-roboten, en flygplattform och AP-P-seriens DIC-vattenrening. Paketet finns i två former — komplett med drönare, eller utan drönare för den som redan flyger Matrice 400 eller Matrice 350 RTK.",
    solutionsHeading: "Två paket, tre kärnmoduler",
    solutions: [
      { title: "Komplett paket", text: "Robot, drönare, vattenrening och kringutrustning. För den som ska börja från noll." },
      { title: "Paket utan drönare", text: "Samma innehåll men utan flygplattform. För den som redan flyger Matrice 400 eller Matrice 350 RTK." },
      { title: "AP3-P3 tvättrobot", text: "Pliabot-leder, 40° gummiskrapa och 60° vertikal sprutjustering. Arbetar tätt intill ytan i stället för att spola på avstånd." },
      { title: "Flygplattform", text: "DJI Matrice 400 eller Matrice 350 RTK. AP3-P3 är PSDK-certifierad för serieproduktion på M400." },
      { title: "AP-P DIC-vattenrening", text: "Dubbelpatenterad rening som ger medicinskt rent vatten. Ytan torkar utan ränder och inget kemikalieavfall uppstår." },
    ],
    benefitsHeading: "Kringutrustning i båda paketen",
    benefits: [
      "AP-P vattenhanteringssystem",
      "AP-P rengöringsmedel för glasfasad",
      "Slangvinsch och säkerhetslinvinsch",
      "Högtrycksslang på 70 meter med tillhörande kopplingar",
    ],
    contact: {
      title: "Sätt ihop ett AP3-S1",
      text: "Valet mellan paketen styrs av om ni redan äger rätt drönare. Berätta om byggnaden och vattentillgången så återkommer vi med innehåll och offert.",
    },
    seo: {
      title: `Wisson AP3-S1 — fasadtvättsystem i paket | ${BRAND}`,
      description:
        "AP3-S1 för fasadtvätt i två paket: med eller utan drönare. AP3-P3-robot, Matrice 400 eller 350 RTK och DIC-vattenrening.",
    },
  },
  {
    handle: "fasadtvatt-dronare",
    title: "Fasadtvätt med drönare",
    eyebrow: "Lösning",
    breadcrumb: { label: "Enterprise", link: "/pages/enterprise" },
    intro:
      "Fasadtvätt med drönare tar bort behovet av ställning, lift och reparbete. Med Wisson AP3-P3 arbetar drönaren tätt intill ytan och tvättar med renvatten — inga kemikalier, inga ränder.",
    solutionsHeading: "Så går det till",
    solutions: [
      { title: "Renvatten", text: "Medicinskt rent vatten genom dubbelpatenterad DIC-rening. Ytan torkar utan ränder och inget hamnar i marken." },
      { title: "Slangmatning", text: "Vattnet matas från marken, så arbetet begränsas inte av hur mycket drönaren kan bära." },
      { title: "Pliabot-skrapa", text: "40° solfjäderformad gummiskrapa som ligger an mot ytan i stället för att spola på avstånd." },
      { title: "Vinklad sprutbild", text: "60° vertikal justering når in under utsprång och listverk." },
    ],
    benefitsHeading: "Fördelar",
    benefits: [
      "Ingen ställning, lift eller reparbete",
      "Personal står kvar på marken",
      "Kortare avstängning av gata och entré",
      "Kemikaliefritt, inget avrinningsavfall",
    ],
    contact: {
      title: "Räkna på ett fasadobjekt",
      text: "Berätta om byggnaden och ytan, så återkommer vi med upplägg, utrustning och offert.",
    },
    seo: {
      title: `Fasadtvätt med drönare | ${BRAND}`,
      description:
        "Tvätta fasader från luften med Wisson AP3-P3: renvatten utan kemikalier, ingen ställning och personal kvar på marken.",
    },
  },
  {
    handle: "vindkraftsunderhall-dronare",
    title: "Vindkraftsunderhåll med drönare",
    eyebrow: "Lösning",
    breadcrumb: { label: "Enterprise", link: "/pages/enterprise" },
    intro:
      "Underhåll av vindkraftverk kräver att någon tar sig upp på tornet eller bladet. Med flygburna robotsystem utförs rengöring, sprutning och kontaktmätning från luften — snabbare, och utan att någon hänger i rep.",
    solutionsHeading: "Vad som går att göra",
    solutions: [
      { title: "Rengöring", text: "Blad och torn tvättas från luften med högtryck eller renvatten, utan uppställning av lift." },
      { title: "Sprutning", text: "Ytbehandling och avisningsmedel läggs jämnt med dimsprutning som varken rinner eller droppar." },
      { title: "Kontaktmätning", text: "AP3-D1 trycker givaren mot ytan med 20 N och återkopplar kraften i realtid." },
      { title: "Tunga lyft", text: "AP30-G2 lyfter upp till 40 kg materiel till svåråtkomliga platser i parken." },
    ],
    benefitsHeading: "Fördelar",
    benefits: [
      "Kortare stillestånd per verk",
      "Ingen personal på hög höjd",
      "Arbete även där lift inte kommer fram",
      "Dokumenterade mätpunkter från varje pass",
    ],
    contact: {
      title: "Planera underhåll för er park",
      text: "Vi går igenom antal verk, åtgärder och tidsfönster, och föreslår utrustning och upplägg.",
    },
    seo: {
      title: `Vindkraftsunderhåll med drönare | ${BRAND}`,
      description:
        "Rengöring, sprutning, kontaktmätning och tunga lyft på vindkraftverk med flygburna Wisson-robotsystem. Ingen personal på hög höjd.",
    },
  },
];

function template(p) {
  const blocks = {};
  const order = [];
  p.solutions.forEach((s, i) => {
    const k = `solution_${i + 1}`;
    blocks[k] = { type: "solution", settings: { title: s.title, text: s.text } };
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
          breadcrumb_label: p.breadcrumb.label,
          breadcrumb_link: p.breadcrumb.link,
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
    },
    order: ["industry_landing", "enterprise_contact"],
  };
}

let written = 0;
for (const p of PAGES) {
  const dest = join(ROOT, "theme", "templates", `page.${p.handle}.json`);
  writeFileSync(dest, JSON.stringify(template(p), null, 2) + "\n");
  written++;
}

writeFileSync(
  join(ROOT, "data", "wisson-pages.json"),
  JSON.stringify(
    PAGES.map((p) => ({
      handle: p.handle,
      title: p.title,
      templateSuffix: p.handle,
      body: p.productHandle
        ? `<p>${p.intro}</p><p><a href="/products/${p.productHandle}">Se paketet som produkt</a></p>`
        : `<p>${p.intro}</p>`,
      seo: p.seo,
    })),
    null,
    1
  ) + "\n"
);

console.log(`Skrev ${written} temamallar och data/wisson-pages.json`);
