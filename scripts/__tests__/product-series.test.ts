import { describe, expect, it } from "vitest";
import {
  PRODUCT_SERIES,
  getPackagesForSeries,
  getSeriesBySlug,
  getSeriesForIndustry,
} from "../../src/data/productSeries";
import { getPackageBySlug } from "../../src/data/enterprisePackages";
import { INDUSTRY_DATA, getIndustryBySlug } from "../../src/data/commercialDroneIndustries";

describe("PRODUCT_SERIES", () => {
  it("has unique slugs", () => {
    const slugs = PRODUCT_SERIES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("pekar bara på branscher och paket som finns", () => {
    for (const series of PRODUCT_SERIES) {
      expect(getIndustryBySlug(series.industrySlug), series.slug).toBeDefined();
      expect(series.packageSlugs.length, series.slug).toBeGreaterThanOrEqual(1);
      for (const slug of series.packageSlugs) {
        expect(getPackageBySlug(slug), `${series.slug} → ${slug}`).toBeDefined();
      }
    }
  });

  it("varje paket i en serie hör till samma bransch som serien", () => {
    for (const series of PRODUCT_SERIES) {
      for (const pkg of getPackagesForSeries(series)) {
        expect(pkg.industrySlug, `${series.slug} → ${pkg.slug}`).toBe(series.industrySlug);
      }
    }
  });

  it("varje bransch har minst en produktserie", () => {
    for (const industry of INDUSTRY_DATA) {
      expect(getSeriesForIndustry(industry.slug).length, industry.slug).toBeGreaterThanOrEqual(1);
    }
  });

  it("resolves by slug och bransch", () => {
    expect(getSeriesBySlug("inspektionsserien")?.industrySlug).toBe("inspektion");
    expect(getSeriesBySlug("finns-inte")).toBeUndefined();
    expect(getSeriesForIndustry("bygg-anlaggning").map((s) => s.slug)).toEqual([
      "markkartlaggning-massaberakning",
      "bygguppfoljning-sakerhet",
    ]);
  });

  it("hämtar paketen i packageSlugs-ordning", () => {
    const series = getSeriesBySlug("inspektionsserien")!;
    expect(getPackagesForSeries(series).map((p) => p.slug)).toEqual([
      "inspektion-bas",
      "inspektion-pro",
      "inspektion-enterprise",
    ]);
  });
});
