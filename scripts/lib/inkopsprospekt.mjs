/**
 * Registret över inköpsprospect: leverantörer och produkter vi överväger att
 * köpa in, oavsett om de kommer från en kartläggning eller från något du själv
 * hittat.
 *
 * Registret ligger i data/inkopsprospekt.json och är avsiktligt en fil i repot,
 * inte en tabell. Databasen delas med DigitalSignal och migreringar får inte
 * skapas härifrån (se AGENTS.md), och prospect ska ändå granskas i en PR innan
 * de blir underlag för ett inköp.
 *
 * Modulen äger schemat: normalisering, validering och läs/skriv. Både
 * add-inkopsprospekt.mjs, list-inkopsprospekt.mjs och testerna går via den, så
 * att ett fält bara behöver ändras på ett ställe.
 */
import { readFileSync, writeFileSync } from "fs";

export const SCHEMA_VERSION = "1.0";

/** Var i inköpsflödet prospektet är. Ordningen är flödet, inte en sortering. */
export const STATUSAR = ["ny", "utvarderas", "kontaktad", "offert", "avvisad", "inkopt"];

/** Egen upptäckt eller resultat av en kartläggning i docs/reports/. */
export const KALLOR = ["egen", "kartlaggning"];

/** Vad prisuppgiften faktiskt är. "listpris" är inte vårt inköpspris. */
export const PRISBASER = ["listpris", "dealerpris", "offert", "inkopspris", "okant"];

/** Momsstatus på beloppet. Källor anger den ofta inte — då är den okänd. */
export const MOMSSTATUS = ["exkl", "inkl", "okant"];

const DATUM = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALUTA = /^[A-Z]{3}$/;
const LANDSKOD = /^[A-Z]{2}$/;

/** Gör om fri text till en slug som duger som id eller tagg. */
export function slugga(text) {
  return String(text)
    .toLowerCase()
    .replace(/[åäàáâã]/g, "a")
    .replace(/[öòóôõ]/g, "o")
    .replace(/[éèêë]/g, "e")
    .replace(/[üùúû]/g, "u")
    .replace(/[íìîï]/g, "i")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function text(varde) {
  if (varde == null) return null;
  const trimmad = String(varde).trim();
  return trimmad === "" ? null : trimmad;
}

function tal(varde) {
  if (varde == null || varde === "") return null;
  const n = Number(varde);
  return Number.isFinite(n) ? n : varde;
}

/**
 * Fyller ut ett inskickat prospekt till registrets fulla form: alla fält finns,
 * saknade värden är null. Validering sker separat — normaliseringen ändrar
 * aldrig ett värde till något giltigt, den flyttar bara in det i schemat.
 */
export function normaliseraProspekt(input, { idag = new Date().toISOString().slice(0, 10) } = {}) {
  const kontakt = input.kontakt ?? {};
  const pris = input.pris ?? {};
  const harPris = pris.belopp != null && pris.belopp !== "";

  return {
    id: text(input.id),
    status: text(input.status) ?? "ny",
    kalla: text(input.kalla) ?? "egen",
    tillagd: text(input.tillagd) ?? idag,
    uppdaterad: text(input.uppdaterad) ?? text(input.tillagd) ?? idag,
    tillagd_av: text(input.tillagd_av),
    leverantor: text(input.leverantor),
    produkt: text(input.produkt),
    kategori: text(input.kategori),
    land: text(input.land)?.toUpperCase() ?? null,
    url: text(input.url),
    kontakt: {
      namn: text(kontakt.namn),
      epost: text(kontakt.epost),
      telefon: text(kontakt.telefon),
      webb: text(kontakt.webb),
    },
    pris: harPris
      ? {
          belopp: tal(pris.belopp),
          valuta: text(pris.valuta)?.toUpperCase() ?? null,
          basis: text(pris.basis) ?? "okant",
          moms: text(pris.moms) ?? "okant",
          per: text(pris.per) ?? "styck",
        }
      : null,
    moq: tal(input.moq),
    ledtid_dagar: tal(input.ledtid_dagar),
    taggar: Array.isArray(input.taggar) ? input.taggar.map((t) => slugga(t)).filter(Boolean) : [],
    anteckning: text(input.anteckning),
  };
}

function heltalFel(varde, falt, fel) {
  if (varde == null) return;
  if (!Number.isInteger(varde) || varde <= 0) fel.push(`${falt} ska vara ett positivt heltal`);
}

function urlFel(varde, falt, fel) {
  if (varde == null) return;
  if (!/^https?:\/\/\S+$/.test(varde)) fel.push(`${falt} ska vara en http- eller https-adress`);
}

function datumFel(varde, falt, fel) {
  if (varde == null) {
    fel.push(`${falt} saknas`);
    return;
  }
  if (!DATUM.test(varde) || Number.isNaN(Date.parse(varde))) {
    fel.push(`${falt} ska vara ett datum på formen ÅÅÅÅ-MM-DD`);
  }
}

/** Returnerar en lista med fel i klartext. Tom lista betyder giltigt prospekt. */
export function valideraProspekt(prospekt) {
  const fel = [];

  if (!prospekt.leverantor) fel.push("leverantor saknas");
  if (!prospekt.produkt) fel.push("produkt saknas");

  if (!prospekt.id) fel.push("id saknas");
  else if (!SLUG.test(prospekt.id)) fel.push(`id "${prospekt.id}" ska vara gemener med bindestreck`);

  if (!STATUSAR.includes(prospekt.status)) {
    fel.push(`status "${prospekt.status}" är okänd (${STATUSAR.join(", ")})`);
  }
  if (!KALLOR.includes(prospekt.kalla)) {
    fel.push(`kalla "${prospekt.kalla}" är okänd (${KALLOR.join(", ")})`);
  }

  datumFel(prospekt.tillagd, "tillagd", fel);
  datumFel(prospekt.uppdaterad, "uppdaterad", fel);

  if (prospekt.land != null && !LANDSKOD.test(prospekt.land)) {
    fel.push(`land "${prospekt.land}" ska vara en tvåbokstavig landskod, till exempel SE`);
  }

  urlFel(prospekt.url, "url", fel);
  urlFel(prospekt.kontakt.webb, "kontakt.webb", fel);
  if (prospekt.kontakt.epost != null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(prospekt.kontakt.epost)) {
    fel.push(`kontakt.epost "${prospekt.kontakt.epost}" ser inte ut som en adress`);
  }

  if (prospekt.pris) {
    const { belopp, valuta, basis, moms } = prospekt.pris;
    if (typeof belopp !== "number" || !Number.isFinite(belopp) || belopp <= 0) {
      fel.push("pris.belopp ska vara ett tal större än noll");
    }
    if (!valuta || !VALUTA.test(valuta)) {
      fel.push("pris.valuta ska vara en trebokstavig valutakod, till exempel EUR");
    }
    if (!PRISBASER.includes(basis)) {
      fel.push(`pris.basis "${basis}" är okänd (${PRISBASER.join(", ")})`);
    }
    if (!MOMSSTATUS.includes(moms)) {
      fel.push(`pris.moms "${moms}" är okänd (${MOMSSTATUS.join(", ")})`);
    }
  }

  heltalFel(prospekt.moq, "moq", fel);
  heltalFel(prospekt.ledtid_dagar, "ledtid_dagar", fel);

  for (const tagg of prospekt.taggar) {
    if (!SLUG.test(tagg)) fel.push(`taggen "${tagg}" ska vara gemener med bindestreck`);
  }

  return fel;
}

/** Tomt register, för första körningen och för testerna. */
export function tomtRegister({ idag = new Date().toISOString().slice(0, 10) } = {}) {
  return {
    version: SCHEMA_VERSION,
    uppdaterad: idag,
    dokumentation: "docs/INKOPSPROSPEKT.md",
    noteringar: [
      "Leverantörer och produkter vi överväger att köpa in. Inget här är beställt.",
      "Priser är det källan angav — se pris.basis. Listpris är inte vårt inköpspris.",
      "Lägg till med: npm run prospekt:add -- --leverantor ... --produkt ...",
    ],
    prospekt: [],
  };
}

export function lasRegister(sokvag) {
  const doc = JSON.parse(readFileSync(sokvag, "utf8"));
  if (!Array.isArray(doc.prospekt)) throw new Error(`${sokvag} saknar listan "prospekt"`);
  return doc;
}

export function skrivRegister(sokvag, doc) {
  writeFileSync(sokvag, `${JSON.stringify(doc, null, 2)}\n`);
}

/**
 * Id byggs av leverantör och produkt så att det går att läsa i en diff. Krockar
 * får ett löpnummer i stället för att skriva över ett befintligt prospekt.
 */
export function nyttId(register, leverantor, produkt) {
  const bas = [slugga(leverantor), slugga(produkt)].filter(Boolean).join("-") || "prospekt";
  const tagna = new Set(register.prospekt.map((p) => p.id));
  if (!tagna.has(bas)) return bas;
  for (let n = 2; ; n += 1) {
    const kandidat = `${bas}-${n}`;
    if (!tagna.has(kandidat)) return kandidat;
  }
}

/**
 * Lägger till ett prospekt i registret. Kastar om det inte validerar, så att en
 * halvfärdig post aldrig hamnar i filen.
 */
export function laggTill(register, input, { idag } = {}) {
  const prospekt = normaliseraProspekt(input, { idag });
  if (!prospekt.id && prospekt.leverantor && prospekt.produkt) {
    prospekt.id = nyttId(register, prospekt.leverantor, prospekt.produkt);
  }

  const fel = valideraProspekt(prospekt);
  if (register.prospekt.some((p) => p.id === prospekt.id)) {
    fel.push(`id "${prospekt.id}" finns redan i registret`);
  }
  if (fel.length > 0) {
    throw new Error(`Prospektet går inte att lägga till:\n  - ${fel.join("\n  - ")}`);
  }

  register.prospekt.push(prospekt);
  register.prospekt.sort((a, b) => a.id.localeCompare(b.id, "sv"));
  register.uppdaterad = prospekt.tillagd;
  return prospekt;
}
