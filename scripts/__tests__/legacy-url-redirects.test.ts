import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  INDUSTRY_DATA,
  getIndustryBySlug,
  getSolutionBySlug,
} from "../../src/data/commercialDroneIndustries";

/**
 * Taxonomin ändrades efter att URL:erna indexerades på app.digitalsignal.io:
 * fem sidor som var branscher är nu lösningar under en annan bransch.
 * Wildcard-redirecten bevarar sökvägen, så de tio URL:erna nedan landade på
 * 404 tills vercel.json fick explicita 301:or. Testet ser till att målen
 * fortsätter peka på sidor som faktiskt finns, även om taxonomin ändras igen.
 *
 * Listan över indexerade URL:er finns i docs/FRONTEND_MIGRATION.md.
 */

const vercel = JSON.parse(readFileSync("vercel.json", "utf-8")) as {
  redirects?: { source: string; destination: string; permanent?: boolean }[];
};

const REDIRECTS = vercel.redirects ?? [];

/** De tio indexerade URL:er som inte längre finns i nuvarande routing. */
const LEGACY_URLS = [
  "/kommersiella-dronare/faltkartlaggning",
  "/kommersiella-dronare/faltkartlaggning/3d-modellering",
  "/kommersiella-dronare/fasadinspektion",
  "/kommersiella-dronare/fasadinspektion/precisionsspruta",
  "/kommersiella-dronare/raddningsinsatser",
  "/kommersiella-dronare/raddningsinsatser/ledningsinspektion",
  "/kommersiella-dronare/transformatorinspektion",
  "/kommersiella-dronare/transformatorinspektion/fastighetsfotografi",
  "/kommersiella-dronare/volymberakning",
  "/kommersiella-dronare/volymberakning/perimetersakerhet",
];

describe("vercel.json legacy-redirects", () => {
  it("täcker samtliga indexerade URL:er som saknar sida", () => {
    const sources = REDIRECTS.map((r) => r.source);
    for (const url of LEGACY_URLS) {
      expect(sources, `saknar redirect för ${url}`).toContain(url);
    }
  });

  it("är 301, inte 302", () => {
    for (const r of REDIRECTS) {
      expect(r.permanent, r.source).toBe(true);
    }
  });

  it("pekar bara på sidor som finns", () => {
    for (const r of REDIRECTS) {
      const segments = r.destination.replace(/^\/kommersiella-dronare\/?/, "").split("/");
      if (segments.length === 1) {
        expect(getIndustryBySlug(segments[0]), r.destination).toBeDefined();
      } else {
        expect(getSolutionBySlug(segments[0], segments[1]), r.destination).toBeDefined();
      }
    }
  });

  it("skickar inte vidare till en URL som i sin tur redirectas", () => {
    const sources = new Set(REDIRECTS.map((r) => r.source));
    for (const r of REDIRECTS) {
      expect(sources.has(r.destination), `${r.source} → ${r.destination} är en kedja`).toBe(false);
    }
  });

  it("listar mer specifik sökväg först", () => {
    // Vercel matchar exakta sökvägar, så ordningen spelar ingen roll så länge alla
    // källor är exakta. Konventionen är defensiv: läggs en wildcard-källa till
    // senare blir ordningen plötsligt avgörande, och då ska listan redan vara rätt.
    REDIRECTS.forEach((r, i) => {
      const prefix = r.source.split("/").slice(0, 3).join("/");
      if (prefix === r.source) return;
      const prefixIndex = REDIRECTS.findIndex((o) => o.source === prefix);
      if (prefixIndex !== -1) {
        expect(i, `${r.source} måste ligga före ${prefix}`).toBeLessThan(prefixIndex);
      }
    });
  });
});

describe("canonical", () => {
  const PAGES = join("src", "pages");
  /** Sidor som medvetet saknar canonical: inloggning och driftsvyer. */
  const EXEMPT = ["Login.tsx", "ShopifyCloner.tsx"];

  const publicPages = readdirSync(PAGES).filter(
    (f) => f.endsWith(".tsx") && !EXEMPT.includes(f),
  );

  it("finns på varje publik sida", () => {
    const missing = publicPages.filter(
      (f) => !readFileSync(join(PAGES, f), "utf-8").includes("canonical"),
    );
    expect(missing).toEqual([]);
  });

  it("byggs från den centrala origin-konstanten, inte hårdkodad domän", () => {
    const hardcoded = publicPages.filter((f) => {
      const src = readFileSync(join(PAGES, f), "utf-8");
      return /canonical=\{?["'`]https:\/\//.test(src);
    });
    expect(hardcoded, "använd droneUrl() från @/lib/publicSite").toEqual([]);
  });
});

describe("INDUSTRY_DATA", () => {
  it("har unika bransch- och lösningsslugs", () => {
    const industrySlugs = INDUSTRY_DATA.map((i) => i.slug);
    expect(new Set(industrySlugs).size).toBe(industrySlugs.length);
    for (const industry of INDUSTRY_DATA) {
      const solutionSlugs = (industry.solutions ?? []).map((s) => s.slug);
      expect(new Set(solutionSlugs).size, industry.slug).toBe(solutionSlugs.length);
    }
  });
});
