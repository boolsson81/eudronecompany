import { describe, expect, it } from "vitest";
import {
  DRONE_PRODUCT_CATEGORIES,
  ENTERPRISE_DRONE_PRODUCTS,
  getDroneProductBySlug,
  getDroneProductPathByName,
  getDroneProductsByCategory,
  getRelatedDroneProducts,
} from "../../src/data/enterpriseDroneProducts";
import { getCameraBySlug } from "../../src/data/enterpriseCameraProducts";
import { getIndustryBySlug, INDUSTRY_DATA } from "../../src/data/commercialDroneIndustries";
import { getComparisonBySlug } from "../../src/data/droneComparisons";
import { DRONE_ACCESSORIES } from "../../src/data/droneAccessories";

describe("ENTERPRISE_DRONE_PRODUCTS", () => {
  it("has unique slugs", () => {
    const slugs = ENTERPRISE_DRONE_PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("covers plattformarna sortimentet marknadsförs med", () => {
    const slugs = ENTERPRISE_DRONE_PRODUCTS.map((p) => p.slug);
    for (const expected of [
      "matrice-400",
      "matrice-350-rtk",
      "mavic-3-enterprise",
      "mavic-3-multispectral",
      "agras-t50",
      "inspire-3",
      "mavic-3-pro",
    ]) {
      expect(slugs).toContain(expected);
    }
  });

  it("har det innehåll landningssidan renderar", () => {
    for (const product of ENTERPRISE_DRONE_PRODUCTS) {
      expect(product.features.length, product.slug).toBeGreaterThanOrEqual(4);
      expect(product.specs.length, product.slug).toBeGreaterThanOrEqual(4);
      expect(product.applications.length, product.slug).toBeGreaterThanOrEqual(4);
      expect(product.faq.length, product.slug).toBeGreaterThanOrEqual(2);
      expect(product.longDesc.length, product.slug).toBeGreaterThan(120);
      expect(product.industries.length, product.slug).toBeGreaterThanOrEqual(1);
      expect(DRONE_PRODUCT_CATEGORIES[product.category], product.slug).toBeDefined();
    }
  });

  it("håller SEO-titel och beskrivning inom sökresultatens gränser", () => {
    for (const product of ENTERPRISE_DRONE_PRODUCTS) {
      expect(product.seoTitle.length, product.slug).toBeLessThanOrEqual(70);
      expect(product.seoDesc.length, product.slug).toBeLessThanOrEqual(160);
    }
  });

  it("pekar bara på payloads som har en egen sida", () => {
    for (const product of ENTERPRISE_DRONE_PRODUCTS) {
      for (const slug of product.compatiblePayloads) {
        expect(getCameraBySlug(slug), `${product.slug} → ${slug}`).toBeDefined();
      }
    }
  });

  it("pekar bara på branscher och jämförelser som finns", () => {
    for (const product of ENTERPRISE_DRONE_PRODUCTS) {
      for (const slug of product.industries) {
        expect(getIndustryBySlug(slug), `${product.slug} → ${slug}`).toBeDefined();
      }
      if (product.comparisonSlug) {
        expect(getComparisonBySlug(product.comparisonSlug), product.slug).toBeDefined();
      }
    }
  });

  it("använder samma drönarnamn som tillbehörslistorna", () => {
    const accessoryNames = new Set(Object.keys(DRONE_ACCESSORIES));
    for (const product of ENTERPRISE_DRONE_PRODUCTS) {
      expect(accessoryNames, product.slug).toContain(product.name);
    }
  });

  it("resolves by slug och kategori", () => {
    expect(getDroneProductBySlug("agras-t50")?.name).toBe("DJI Agras T50");
    expect(getDroneProductBySlug("finns-inte")).toBeUndefined();
    expect(getDroneProductsByCategory("platform").map((p) => p.slug)).toEqual([
      "matrice-400",
      "matrice-350-rtk",
    ]);
  });

  it("föreslår relaterade drönare utan att föreslå sig själv", () => {
    const related = getRelatedDroneProducts("matrice-350-rtk");
    expect(related.length).toBeGreaterThan(0);
    expect(related.map((p) => p.slug)).not.toContain("matrice-350-rtk");
  });

  it("slår upp sökväg från drönarnamn", () => {
    expect(getDroneProductPathByName("DJI Inspire 3")).toBe(
      "/kommersiella-dronare/produkter/inspire-3",
    );
    expect(getDroneProductPathByName("DJI Matrice 30T")).toBeUndefined();
  });

  it("täcker varje drönare som rekommenderas på branschsidorna", () => {
    const recommended = new Set(
      INDUSTRY_DATA.flatMap((industry) => industry.recommendedDrones.map((d) => d.name)),
    );
    for (const name of recommended) {
      expect(getDroneProductPathByName(name), name).toBeDefined();
    }
  });
});
