import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// @ts-expect-error — .mjs-skript utan typdeklarationer
import {
  laggTill,
  normaliseraProspekt,
  nyttId,
  slugga,
  tomtRegister,
  valideraProspekt,
} from "../lib/inkopsprospekt.mjs";

/**
 * Registret är underlag för inköpsbeslut och redigeras av både skript och hand.
 * Testet vaktar det som gör en post obrukbar: prisuppgifter utan valuta eller
 * basis, id som krockar, och statusvärden som inte finns i flödet.
 */

const REGISTER = join(__dirname, "..", "..", "data", "inkopsprospekt.json");
const doc = JSON.parse(readFileSync(REGISTER, "utf8"));

const MINIMALT = { leverantor: "Drone Volt", produkt: "Hercules 20 HIGH-DRA" };

describe("validering", () => {
  it("godtar ett prospekt med bara leverantör och produkt", () => {
    const register = tomtRegister({ idag: "2026-09-10" });
    const prospekt = laggTill(register, MINIMALT, { idag: "2026-09-10" });
    expect(prospekt.id).toBe("drone-volt-hercules-20-high-dra");
    expect(prospekt.status).toBe("ny");
    expect(prospekt.kalla).toBe("egen");
    expect(prospekt.pris).toBeNull();
  });

  it("kräver valuta när ett pris är angivet", () => {
    const prospekt = normaliseraProspekt({ ...MINIMALT, pris: { belopp: 46850 } });
    expect(valideraProspekt(prospekt)).toContainEqual(
      expect.stringContaining("pris.valuta"),
    );
  });

  it("stoppar okänd status och okänd prisbasis", () => {
    const prospekt = normaliseraProspekt({
      ...MINIMALT,
      id: "x",
      status: "kanske",
      pris: { belopp: 1, valuta: "EUR", basis: "gissning" },
    });
    const fel = valideraProspekt(prospekt);
    expect(fel).toContainEqual(expect.stringContaining("status"));
    expect(fel).toContainEqual(expect.stringContaining("pris.basis"));
  });

  it("stoppar pris som inte är ett tal", () => {
    const prospekt = normaliseraProspekt({
      ...MINIMALT,
      id: "x",
      pris: { belopp: "ca 47 000", valuta: "EUR" },
    });
    expect(valideraProspekt(prospekt)).toContainEqual(expect.stringContaining("pris.belopp"));
  });

  it("stoppar halva kontaktuppgifter", () => {
    const prospekt = normaliseraProspekt({
      ...MINIMALT,
      id: "x",
      url: "dronevolt.com",
      kontakt: { epost: "sales at dronevolt.com" },
    });
    const fel = valideraProspekt(prospekt);
    expect(fel).toContainEqual(expect.stringContaining("url"));
    expect(fel).toContainEqual(expect.stringContaining("kontakt.epost"));
  });

  it("normaliserar land, valuta och taggar", () => {
    const prospekt = normaliseraProspekt({
      ...MINIMALT,
      land: "fr",
      pris: { belopp: 46850, valuta: "eur" },
      taggar: ["Tak", "Fasad & vindkraft"],
    });
    expect(prospekt.land).toBe("FR");
    expect(prospekt.pris.valuta).toBe("EUR");
    expect(prospekt.taggar).toEqual(["tak", "fasad-vindkraft"]);
  });

  it("sluggar svenska tecken", () => {
    expect(slugga("Söderberg & Ahlén Tvättsystem")).toBe("soderberg-ahlen-tvattsystem");
  });
});

describe("registret", () => {
  it("ger krockande id ett löpnummer i stället för att skriva över", () => {
    const register = tomtRegister({ idag: "2026-09-10" });
    laggTill(register, MINIMALT, { idag: "2026-09-10" });
    const andra = laggTill(register, MINIMALT, { idag: "2026-09-10" });
    expect(andra.id).toBe("drone-volt-hercules-20-high-dra-2");
    expect(nyttId(register, "Drone Volt", "Hercules 20 HIGH-DRA")).toBe(
      "drone-volt-hercules-20-high-dra-3",
    );
  });

  it("vägrar lägga till ett prospekt med ett id som redan finns", () => {
    const register = tomtRegister({ idag: "2026-09-10" });
    laggTill(register, { ...MINIMALT, id: "eget-id" }, { idag: "2026-09-10" });
    expect(() => laggTill(register, { ...MINIMALT, id: "eget-id" })).toThrow(/finns redan/);
  });

  it("vägrar lägga till ett prospekt utan leverantör", () => {
    const register = tomtRegister({ idag: "2026-09-10" });
    expect(() => laggTill(register, { produkt: "Hercules 20" })).toThrow(/leverantor saknas/);
  });

  it("håller datafilen giltig", () => {
    expect(Array.isArray(doc.prospekt)).toBe(true);
    const idn = new Set();
    for (const post of doc.prospekt) {
      expect(valideraProspekt(post), post.id ?? post.produkt).toEqual([]);
      expect(idn.has(post.id), `dubblett-id ${post.id}`).toBe(false);
      idn.add(post.id);
    }
  });
});
