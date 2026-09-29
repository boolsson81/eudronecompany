import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Vercel transpilerar `api/` fil för fil utan att bundla, och `package.json`
 * har `"type": "module"`. Då löser Node relativa importer bokstavligt: utan
 * `.js` på slutet kastar funktionen ERR_MODULE_NOT_FOUND vid laddning och
 * varje anrop blir 500. Varken `tsc -p tsconfig.app.json` eller vitest märker
 * det, eftersom båda kör `moduleResolution: "bundler"` — därför vaktas det här.
 */

function collectTs(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectTs(full, out);
    else if (entry.endsWith(".ts")) out.push(full);
  }
  return out;
}

const RELATIVE_IMPORT = /\bfrom\s+["'](\.{1,2}\/[^"']+)["']|\bimport\s*\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g;

describe("api/ — relativa importer fungerar i Node ESM", () => {
  for (const file of collectTs("api")) {
    it(`${file} importerar med .js-ändelse`, () => {
      const text = readFileSync(file, "utf-8");
      const missing = [...text.matchAll(RELATIVE_IMPORT)]
        .map((m) => m[1] ?? m[2])
        .filter((spec) => !spec.endsWith(".js"));
      expect(missing, "lägg till .js på relativa importer under api/").toEqual([]);
    });
  }
});
