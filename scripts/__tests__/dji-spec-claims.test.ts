import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Zenmuse-specarna låg fel på flera ställen samtidigt — samma siffra kopierad
 * mellan produktkort, FAQ-artiklar, jämförelser och Shopify-temat. Testet
 * vaktar de påståenden som faktiskt var fel, så att en återinförd formulering
 * fastnar här i stället för att gå live.
 *
 * Källor: DJI Enterprise (H30-serien, H20-serien, H20N, P1, L1/L2/L3, S1, V1).
 */

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

/** Formuleringar som var faktafel och inte får återinföras. */
const FORBIDDEN: { pattern: RegExp; why: string }[] = [
  {
    pattern: /40×\s*(optisk|zoom)|40x\s*(optisk|zoom)/i,
    why: "H30-seriens zoom är 34× optisk (400× digital). 40 MP är zoomkamerans upplösning, inte zoomfaktorn.",
  },
  {
    pattern: /1500\s*m(?!\w)/,
    why: "Zenmuse V1 har 700 m effektiv räckvidd, inte 1500 m.",
  },
  {
    pattern: /4\s*(×|x)?\s*LED|IR-belysning/i,
    why: "Zenmuse S1 anges av DJI som 10 000 lumen och 500 m räckvidd; '4 LED + IR' gick inte att belägga.",
  },
  {
    pattern: /20\s*MP visuell|label: "Vidvinkel", value: "20 MP"/i,
    why: "På H20-serien är 20 MP zoomkameran och 12 MP vidvinkeln — inte tvärtom.",
  },
  {
    pattern: /1–3 cm med RTK/,
    why: "Zenmuse P1 anges som 3 cm horisontellt och 5 cm vertikalt utan markstöd.",
  },
  {
    pattern: /Quad-sensor \(vidvinkel \+ zoom \+ LRF\)/,
    why: "Zenmuse H20 är DJI:s triple-sensor; H20T är quad-sensorn.",
  },
  {
    pattern: /IP45/,
    why: "Matrice 350 RTK är IP55. IP45 är föregångaren Matrice 300 RTK.",
  },
  {
    pattern: /"Termisk kamera",/,
    why: "Mavic 3 Enterprise (3E) saknar termisk kamera — den sitter på 3T. Skriv 'Termisk kamera (3T)'.",
  },
  {
    pattern: /50 kg nyttolast/,
    why: "Agras T50 tar 40 kg i sprutläge; 50 kg är spridarlasten.",
  },
];

describe("DJI-specpåståenden", () => {
  for (const { pattern, why } of FORBIDDEN) {
    it(`återinför inte: ${why}`, () => {
      const hits = FILES.filter(
        (f) => !f.path.includes("__tests__") && pattern.test(f.text),
      ).map((f) => f.path);
      expect(hits, why).toEqual([]);
    });
  }
});

describe("verifierade nyckeltal finns kvar", () => {
  const catalog = readFileSync("src/data/enterpriseCameraProducts.ts", "utf-8");

  it.each([
    ["34× optisk", "H30-seriens optiska zoom"],
    ["400× digital", "H30-seriens maximala digitala zoom"],
    ["1280×1024", "H30T:s termiska upplösning"],
    ["3–3000 m", "H30-seriens laser-avståndsmätare"],
    ["700 m", "V1:s effektiva räckvidd"],
    ["10 000 lumen", "S1:s ljusstyrka"],
    ["Upp till 16", "L3:s antal returer"],
    ["Upp till 3", "L1:s antal returer"],
    ["Upp till 5", "L2:s antal returer"],
  ])("%s — %s", (needle) => {
    expect(catalog).toContain(needle);
  });
});
