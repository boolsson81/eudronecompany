import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

// Temafilen är ett vanligt webbläsarskript (IIFE). Den körs här i en vm-kontext utan
// customElements, och exporterar sina rena funktioner via module.exports.
const source = readFileSync(new URL("../../theme/assets/drone-compatible-products.js", import.meta.url), "utf8");
const sandbox: { module: { exports: Record<string, (...a: unknown[]) => unknown> } } = { module: { exports: {} } };
vm.runInNewContext(source, sandbox);
const { matchModels, normalize } = sandbox.module.exports as {
  matchModels: (values: string[], candidates: string[]) => string[];
  normalize: (value: string) => string;
};

const VALUES = [
  "DJI Air 3",
  "DJI Air 3S",
  "DJI Mini 3",
  "DJI Mini 3 Pro",
  "DJI Mini 5 Pro",
  "DJI Neo",
  "DJI Neo 2",
  "DJI Mavic 3",
  "DJI Mavic 3 Classic",
  "DJI Avata",
  "DJI Avata 2",
  "DJI Matrice 600",
];

describe("drone-compatible-products – modellmatchning", () => {
  it("normaliserar bort DJI och skiljetecken", () => {
    expect(normalize("DJI Air 3S – Fly More Combo (RC-N3)")).toBe("air 3s fly more combo rc n3");
  });

  it("matchar Air 3S men inte Air 3", () => {
    expect(matchModels(VALUES, ["DJI Air 3S Fly More Combo – Avancerad Drönare"])).toEqual(["DJI Air 3S"]);
  });

  it("matchar Air 3 men inte Air 3S", () => {
    expect(matchModels(VALUES, ["DJI Air 3 Fly More Combo (RC 2)"])).toEqual(["DJI Air 3"]);
  });

  it("behåller bara längsta träffen (Mini 3 Pro, Neo 2, Avata 2)", () => {
    expect(matchModels(VALUES, ["DJI Mini 3 Pro Drönare"])).toEqual(["DJI Mini 3 Pro"]);
    expect(matchModels(VALUES, ["DJI Neo 2 Motion Fly More Combo"])).toEqual(["DJI Neo 2"]);
    expect(matchModels(VALUES, ["DJI Avata 2 Fly More Combo"])).toEqual(["DJI Avata 2"]);
  });

  it("använder flera kandidater (titel + modellfält)", () => {
    expect(matchModels(VALUES, ["Okänd titel", "Mavic 3 Classic Fly More"])).toEqual(["DJI Mavic 3 Classic"]);
  });

  it("ger tomt resultat när inget matchar", () => {
    expect(matchModels(VALUES, ["Sunnylife kameraskydd"])).toEqual([]);
    expect(matchModels(VALUES, [])).toEqual([]);
  });
});
