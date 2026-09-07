import { describe, expect, it } from "vitest";
import {
  ENTERPRISE_PACKAGES,
  getPackageBySlug,
  getPackageServices,
  getPackagesForDrone,
  getPackagesForIndustry,
  getRelatedPackages,
  PACKAGE_LEVELS,
  PACKAGE_SERVICES,
} from "../../src/data/enterprisePackages";
import { getDroneProductBySlug } from "../../src/data/enterpriseDroneProducts";
import { getCameraBySlug } from "../../src/data/enterpriseCameraProducts";
import { getIndustryBySlug } from "../../src/data/commercialDroneIndustries";
import { INDUSTRY_CONFIGS } from "../../src/data/droneConfigurations";

describe("ENTERPRISE_PACKAGES", () => {
  it("has unique slugs", () => {
    const slugs = ENTERPRISE_PACKAGES.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("ger varje konfigurationssida tre nivåer", () => {
    for (const config of INDUSTRY_CONFIGS) {
      const packages = getPackagesForIndustry(config.slug);
      expect(packages.map((p) => p.level), config.slug).toEqual([
        "standard",
        "pro",
        "enterprise",
      ]);
    }
  });

  it("har det innehåll landningssidan renderar", () => {
    for (const pkg of ENTERPRISE_PACKAGES) {
      expect(pkg.components.length, pkg.slug).toBeGreaterThanOrEqual(5);
      expect(pkg.outcomes.length, pkg.slug).toBeGreaterThanOrEqual(3);
      expect(pkg.faq.length, pkg.slug).toBeGreaterThanOrEqual(2);
      expect(pkg.longDesc.length, pkg.slug).toBeGreaterThan(160);
      expect(pkg.heroDesc.length, pkg.slug).toBeGreaterThan(40);
      expect(pkg.idealFor.length, pkg.slug).toBeGreaterThan(20);
      expect(PACKAGE_LEVELS[pkg.level], pkg.slug).toBeDefined();
    }
  });

  it("håller SEO-titel och beskrivning inom sökresultatens gränser", () => {
    for (const pkg of ENTERPRISE_PACKAGES) {
      expect(pkg.seoTitle.length, pkg.slug).toBeLessThanOrEqual(70);
      expect(pkg.seoDesc.length, pkg.slug).toBeLessThanOrEqual(160);
    }
  });

  it("pekar bara på branscher, drönare och payloads som finns", () => {
    for (const pkg of ENTERPRISE_PACKAGES) {
      expect(getIndustryBySlug(pkg.industrySlug), pkg.slug).toBeDefined();
      expect(pkg.droneSlugs.length, pkg.slug).toBeGreaterThanOrEqual(1);
      for (const slug of pkg.droneSlugs) {
        expect(getDroneProductBySlug(slug), `${pkg.slug} → ${slug}`).toBeDefined();
      }
      for (const slug of pkg.payloadSlugs) {
        expect(getCameraBySlug(slug), `${pkg.slug} → ${slug}`).toBeDefined();
      }
    }
  });

  it("nämner varje refererad drönare i paketets komponentlista", () => {
    for (const pkg of ENTERPRISE_PACKAGES) {
      const components = pkg.components.join(" ");
      for (const slug of pkg.droneSlugs) {
        const drone = getDroneProductBySlug(slug)!;
        // "DJI Mavic 3 Enterprise" räcker som "Mavic 3" i komponentlistan (t.ex. Mavic 3T).
        const needle = drone.name.replace(/^DJI /, "").split(" ").slice(0, 2).join(" ");
        expect(components, `${pkg.slug} saknar ${drone.name}`).toContain(needle);
      }
    }
  });

  it("resolves by slug och bransch", () => {
    expect(getPackageBySlug("inspektion-pro")?.name).toBe("Inspektionspaket Pro");
    expect(getPackageBySlug("finns-inte")).toBeUndefined();
    expect(getPackagesForIndustry("energi").map((p) => p.slug)).toEqual([
      "energi-bas",
      "energi-pro",
      "energi-enterprise",
    ]);
  });

  it("hittar paket per drönare", () => {
    const packages = getPackagesForDrone("agras-t50");
    expect(packages.map((p) => p.slug)).toEqual(["lantbruk-pro", "lantbruk-enterprise"]);
    expect(getPackagesForDrone("finns-inte")).toEqual([]);
  });

  it("föreslår relaterade paket utan att föreslå sig själv", () => {
    const related = getRelatedPackages("kartlaggning-pro");
    expect(related.length).toBeGreaterThan(0);
    expect(related.map((p) => p.slug)).not.toContain("kartlaggning-pro");
  });

  it("lägger nivåns tjänster före paketets egna", () => {
    const pkg = getPackageBySlug("inspektion-enterprise")!;
    const services = getPackageServices(pkg);
    expect(services.slice(0, PACKAGE_SERVICES.enterprise.length)).toEqual(
      PACKAGE_SERVICES.enterprise,
    );
    expect(services).toEqual(expect.arrayContaining(pkg.extraServices!));
  });
});
