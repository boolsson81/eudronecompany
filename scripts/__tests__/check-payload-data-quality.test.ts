import { describe, expect, it } from "vitest";
import { evaluate, isBlank } from "../check-payload-data-quality.mjs";

/**
 * Katalog-hälsokontrollen får aldrig gissa datakvalitet — den ska bara
 * rapportera vad som faktiskt saknas. Dessa tester vaktar att statusordningen
 * (missing_data > compatibility_review_required > needs_review > complete)
 * och tomhetskontrollen (isBlank) fungerar för både skalärer, JSON-listor och
 * metaobject-referenser.
 */

describe("isBlank", () => {
  it("räknar null, undefined och tom sträng som tomt", () => {
    expect(isBlank(null)).toBe(true);
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank("")).toBe(true);
  });

  it("räknar en tom JSON-lista som tomt", () => {
    expect(isBlank("[]")).toBe(true);
  });

  it("räknar en JSON-lista med innehåll som ifylld", () => {
    expect(isBlank('["gid://shopify/Metaobject/1"]')).toBe(false);
  });

  it("räknar en vanlig skalär sträng som ifylld", () => {
    expect(isBlank("IP54")).toBe(false);
  });
});

function product(overrides: Record<string, { value: string | null } | undefined>) {
  return {
    id: "gid://shopify/Product/1",
    handle: "test-produkt",
    title: "Testprodukt",
    category: undefined,
    compatRecords: undefined,
    compatUav: undefined,
    spec: undefined,
    sensorType: undefined,
    sensorResolution: undefined,
    weight: undefined,
    ipRating: undefined,
    ...overrides,
  };
}

describe("evaluate", () => {
  it("flaggar missing_data när ingen payload-kategori är satt", () => {
    const result = evaluate(product({}));
    expect(result.status).toBe("missing_data");
    expect(result.notes[0]).toMatch(/payload-kategori/i);
  });

  it("flaggar compatibility_review_required när kategori finns men ingen kompatibilitet", () => {
    const result = evaluate(
      product({ category: { value: "gid://shopify/Metaobject/1" } })
    );
    expect(result.status).toBe("compatibility_review_required");
  });

  it("flaggar needs_review när kompatibilitet finns men ingen teknisk data", () => {
    const result = evaluate(
      product({
        category: { value: "gid://shopify/Metaobject/1" },
        compatUav: { value: '["gid://shopify/Metaobject/2"]' },
      })
    );
    expect(result.status).toBe("needs_review");
  });

  it("räknar specification-referens som tillräcklig teknisk data", () => {
    const result = evaluate(
      product({
        category: { value: "gid://shopify/Metaobject/1" },
        compatUav: { value: '["gid://shopify/Metaobject/2"]' },
        spec: { value: "gid://shopify/Metaobject/3" },
      })
    );
    expect(result.status).toBe("complete");
  });

  it("räknar grundläggande edp.*-fält som tillräcklig teknisk data utan specification", () => {
    const result = evaluate(
      product({
        category: { value: "gid://shopify/Metaobject/1" },
        compatRecords: { value: '["gid://shopify/Metaobject/2"]' },
        ipRating: { value: "IP54" },
      })
    );
    expect(result.status).toBe("complete");
    expect(result.notes).toHaveLength(0);
  });
});
