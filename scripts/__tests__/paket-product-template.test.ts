import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PAKET_METAFIELD_DEFINITIONS, PAKET_NAMESPACE } from "../setup-paket-metafields.mjs";

/**
 * Paketmallen (`product.paket.json`) bygger på custom_liquid-block som renderar
 * snippets, och snippets som läser metafält i namespace `paket` och
 * översättningsnycklar under `products.package`. Inget av det verifieras av
 * Shopify vid uppladdning: ett felstavat snippet-namn, en saknad nyckel eller
 * ett metafält som inte finns definierat ger bara en tom eller trasig sida.
 *
 * Testet vaktar att alla tre lagren hänger ihop.
 */

const ROOT = join(__dirname, "..", "..");
const THEME = join(ROOT, "theme");

const template = JSON.parse(readFileSync(join(THEME, "templates/product.paket.json"), "utf8"));
const mainProduct = readFileSync(join(THEME, "sections/main-product.liquid"), "utf8");
const sv = JSON.parse(readFileSync(join(THEME, "locales/sv.json"), "utf8"));
const en = JSON.parse(readFileSync(join(THEME, "locales/en.default.json"), "utf8"));

const PACKAGE_SNIPPETS = ["edp-package-badge", "edp-package-contents", "edp-package-addons"];

function snippetSource(name: string): string {
  return readFileSync(join(THEME, "snippets", `${name}.liquid`), "utf8");
}

function schemaBlockTypes(sectionSource: string): Set<string> {
  const schema = sectionSource.match(/{% schema %}([\s\S]*?){% endschema %}/);
  if (!schema) throw new Error("main-product.liquid saknar schema");
  const parsed = JSON.parse(schema[1]);
  return new Set(parsed.blocks.map((b: { type: string }) => b.type));
}

function lookup(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

describe("product.paket.json", () => {
  const main = template.sections.main;

  it("använder bara blocktyper som main-product känner till", () => {
    const known = schemaBlockTypes(mainProduct);
    for (const [id, block] of Object.entries<{ type: string }>(main.blocks)) {
      expect(known.has(block.type), `${id}: ${block.type}`).toBe(true);
    }
  });

  it("listar varje block i block_order exakt en gång", () => {
    const ids = Object.keys(main.blocks).sort();
    expect([...main.block_order].sort()).toEqual(ids);
    expect(new Set(main.block_order).size).toBe(main.block_order.length);
  });

  it("visar innehåll och tillval före köpknapparna", () => {
    const order: string[] = main.block_order;
    expect(order.indexOf("package_contents")).toBeLessThan(order.indexOf("buy_buttons"));
    expect(order.indexOf("package_addons")).toBeLessThan(order.indexOf("buy_buttons"));
    expect(order.indexOf("package_badge")).toBeLessThan(order.indexOf("title"));
  });

  it("renderar snippets som finns i temat", () => {
    const rendered = new Set<string>();
    for (const block of Object.values<{ type: string; settings: Record<string, string> }>(main.blocks)) {
      if (block.type !== "custom_liquid") continue;
      for (const m of block.settings.custom_liquid.matchAll(/render '([^']+)'/g)) rendered.add(m[1]);
    }
    expect([...rendered].sort()).toEqual([...PACKAGE_SNIPPETS].sort());
    for (const name of rendered) {
      expect(existsSync(join(THEME, "snippets", `${name}.liquid`)), name).toBe(true);
    }
  });

  it("har sektionsfiler för allt i order", () => {
    for (const id of template.order) {
      const type = template.sections[id].type;
      expect(existsSync(join(THEME, "sections", `${type}.liquid`)), `${id} → ${type}`).toBe(true);
    }
  });
});

describe("paket-snippets", () => {
  const sources = Object.fromEntries(PACKAGE_SNIPPETS.map((n) => [n, snippetSource(n)]));

  it("läser bara metafält som setup-skriptet definierar", () => {
    const defined = new Set(PAKET_METAFIELD_DEFINITIONS.map((d) => d.key));
    expect(PAKET_METAFIELD_DEFINITIONS.every((d) => d.namespace === PAKET_NAMESPACE)).toBe(true);
    const used = new Set<string>();
    for (const src of Object.values(sources)) {
      for (const m of src.matchAll(/metafields\.paket\.([a-z_]+)/g)) used.add(m[1]);
    }
    expect(used.size).toBeGreaterThan(0);
    for (const key of used) expect(defined.has(key), `paket.${key}`).toBe(true);
    for (const key of defined) expect(used.has(key), `paket.${key} definieras men används inte`).toBe(true);
  });

  it("har alla översättningsnycklar i både sv och en", () => {
    const keys = new Set<string>();
    for (const src of Object.values(sources)) {
      for (const m of src.matchAll(/'(products\.package\.[a-z_.]+)'\s*\|\s*t\b/g)) keys.add(m[1]);
    }
    expect(keys.size).toBeGreaterThan(0);
    for (const key of keys) {
      expect(typeof lookup(sv, key), `sv ${key}`).toBe("string");
      expect(typeof lookup(en, key), `en ${key}`).toBe("string");
    }
  });

  it("laddar css och js som finns i assets", () => {
    for (const asset of ["edp-package.css", "edp-package.js"]) {
      expect(existsSync(join(THEME, "assets", asset)), asset).toBe(true);
      const referenced = Object.values(sources).some((src) => src.includes(`'${asset}' | asset_url`));
      expect(referenced, asset).toBe(true);
    }
  });

  it("markerar tillvalen så att edp-package.js hittar dem", () => {
    expect(sources["edp-package-addons"]).toContain("data-edp-package-addons");
    expect(sources["edp-package-addons"]).toContain("data-edp-addon");
    const js = readFileSync(join(THEME, "assets/edp-package.js"), "utf8");
    expect(js).toContain("[data-edp-package-addons]");
    expect(js).toContain("input[data-edp-addon]:checked");
    expect(js).toContain("items[0][id]");
  });
});
