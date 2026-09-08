import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Kontaktadressen låg kvar som `Sales@actionking.se` när drönarsidorna skrevs
 * om till EU Drone Company: sidorna sa ett varumärke och skickade
 * förfrågningarna till ett annat. Samma sak i temat, där standardvärdet var
 * kvar på `eudroneparts.se` efter namnbytet.
 *
 * Testet vaktar den publika kontaktadressen så att en återinförd gammal adress
 * fastnar här i stället för i inkorgen hos fel bolag.
 */

export const CONTACT_EMAIL = "info@eudronecompany.com";
export const CONTACT_PHONE = "076-285 00 65";
export const CONTACT_PHONE_E164 = "+46762850065";
export const ORG_NUMBER = "810912-2971";
export const ADDRESS_STREET = "Lyddevägen 34";
export const ADDRESS_ZIP = "511 58";
export const ADDRESS_CITY = "Kinna";

/**
 * Numren som låg i sidorna innan företagsuppgifterna slogs upp: två
 * platshållare, ActionKings växel och dess visningsform. Inget av dem får
 * tillbaka.
 *
 * Formulärfältens platshållare (`070-123 45 67`, `08-123 45 67`) är exempeltext
 * i inmatningsfält, inte bolagets nummer, och står kvar med flit.
 */
const RETIRED_PHONES = ["+4612345678", "+46 8 123 45 67", "+46320123456", "+46101025591", "010-102 55 91"];

const ROOTS = ["src", "theme", "shopify-theme"];
const EXTENSIONS = [".ts", ".tsx", ".liquid", ".json"];

function collectFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== "node_modules") collectFiles(full, out);
    } else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

const FILES = ROOTS.flatMap((root) => collectFiles(root)).map((path) => ({
  path,
  text: readFileSync(path, "utf-8"),
}));

describe("publik kontaktadress", () => {
  it("använder inte längre ActionKings säljadress", () => {
    const hits = FILES.filter((f) => /sales@actionking\.se/i.test(f.text)).map((f) => f.path);
    expect(hits, "drönarsidorna säger EU Drone Company — adressen ska göra det med").toEqual([]);
  });

  it("har inte kvar det gamla varumärkets adress", () => {
    const hits = FILES.filter((f) => /@eudroneparts\.se/i.test(f.text)).map((f) => f.path);
    expect(hits, "bolaget heter EU Drone Company sedan 2026-08-23").toEqual([]);
  });

  it("kommer från en enda konstant i frontenden", () => {
    expect(readFileSync("src/lib/companyContact.ts", "utf-8")).toContain(
      `email: "${CONTACT_EMAIL}"`,
    );
  });

  it("används på kontaktsidan och på specialtillverkningssidan", () => {
    const contact = readFileSync("src/pages/CommercialDronesContact.tsx", "utf-8");
    expect(contact).toContain("COMPANY_CONTACT.email");
    expect(contact).toContain("companyMailto()");

    const customParts = readFileSync("src/pages/CustomParts.tsx", "utf-8");
    expect(customParts).toContain("companyMailto(");
  });

  it("är samma adress i Shopify-temats offertformulär", () => {
    for (const path of [
      "theme/sections/enterprise-quote-form.liquid",
      "theme/templates/page.contact-quote.json",
    ]) {
      expect(readFileSync(path, "utf-8"), path).toContain(CONTACT_EMAIL);
    }
  });
});

describe("publikt telefonnummer", () => {
  it("har inte kvar platshållarna eller ActionKings växel", () => {
    for (const phone of RETIRED_PHONES) {
      const hits = FILES.filter((f) => f.text.includes(phone)).map((f) => f.path);
      expect(hits, `${phone} ska vara ersatt av företagsuppgifternas nummer`).toEqual([]);
    }
  });

  it("kommer från en enda konstant i frontenden", () => {
    const module = readFileSync("src/lib/companyContact.ts", "utf-8");
    expect(module).toContain(`phone: "${CONTACT_PHONE}"`);
    expect(module).toContain(`phoneE164: "${CONTACT_PHONE_E164}"`);

    // Sidorna ska läsa konstanten, inte upprepa siffrorna.
    for (const path of [
      "src/pages/CommercialDrones.tsx",
      "src/pages/CommercialDronesContact.tsx",
    ]) {
      const page = readFileSync(path, "utf-8");
      expect(page, path).toContain("COMPANY_CONTACT");
      expect(page, path).not.toContain(CONTACT_PHONE_E164);
    }
  });

  it("står i Shopify-temats ring-oss-knappar, som inte kan importera konstanten", () => {
    const callButtons = FILES.filter(
      (f) => f.path.startsWith("theme/") && f.text.includes("tel:"),
    );
    expect(callButtons.length).toBeGreaterThan(0);
    for (const file of callButtons) {
      for (const [, number] of file.text.matchAll(/tel:([+0-9 -]+)/g)) {
        expect(number.trim(), file.path).toBe(CONTACT_PHONE_E164);
      }
    }
  });
});


describe("organisationsnummer och postadress", () => {
  it("står i konstanten, inte utspritt i sidorna", () => {
    const module = readFileSync("src/lib/companyContact.ts", "utf-8");
    expect(module).toContain(`orgNumber: "${ORG_NUMBER}"`);
    expect(module).toContain(`street: "${ADDRESS_STREET}"`);
    expect(module).toContain(`zip: "${ADDRESS_ZIP}"`);
    expect(module).toContain(`city: "${ADDRESS_CITY}"`);

    const elsewhere = FILES.filter(
      (f) => f.path !== "src/lib/companyContact.ts" && f.text.includes(ORG_NUMBER),
    ).map((f) => f.path);
    expect(elsewhere, "organisationsnumret ska läsas från companyContact.ts").toEqual([]);
  });

  it("visas i sidfoten på varje sida som har en", () => {
    const footer = readFileSync("src/components/EnterpriseFooter.tsx", "utf-8");
    expect(footer).toContain("COMPANY_CONTACT.orgNumber");
    expect(footer).toContain("COMPANY_ADDRESS_LINE");

    // Sidfoten låg tidigare inline och identisk i nio sidor. Ingen får ha en egen.
    const inlineFooters = FILES.filter(
      (f) => f.path.startsWith("src/pages/") && f.text.includes("<footer"),
    ).map((f) => f.path);
    expect(inlineFooters, "använd EnterpriseFooter i stället").toEqual([]);
  });

  it("ligger i sidornas Organization-strukturdata", () => {
    for (const path of [
      "src/pages/CommercialDrones.tsx",
      "src/pages/CommercialDronesContact.tsx",
    ]) {
      const page = readFileSync(path, "utf-8");
      expect(page, path).toContain("COMPANY_ORG_IDENTIFIER");
      expect(page, path).toContain("COMPANY_POSTAL_ADDRESS");
    }
  });

  it("har inte kvar butikens avvikande gatuadress", () => {
    // Shopifys företagsuppgifter säger Kristinebergsgatan 22A. Företagsuppgifterna
    // i databasen säger Lyddevägen 34, och det är den som gäller på sajten.
    const hits = FILES.filter((f) => /Kristinebergsgatan/i.test(f.text)).map((f) => f.path);
    expect(hits).toEqual([]);
  });
});
