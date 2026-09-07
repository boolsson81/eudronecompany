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

  it("står på kontaktsidan, i JSON-LD och på specialtillverkningssidan", () => {
    const contact = readFileSync("src/pages/CommercialDronesContact.tsx", "utf-8");
    expect(contact).toContain(`email: "${CONTACT_EMAIL}"`);
    expect(contact).toContain(`mailto:${CONTACT_EMAIL}`);

    const customParts = readFileSync("src/pages/CustomParts.tsx", "utf-8");
    expect(customParts).toContain(`mailto:${CONTACT_EMAIL}`);
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
