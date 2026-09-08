import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getPublicRoutes } from "../../src/lib/publicRoutes";

/**
 * `publicRoutes.ts` är handskriven och kan glömmas bort när en ny sida läggs
 * till i `App.tsx`. Testet jämför de två i båda riktningarna, så att en rutt
 * utan sitemap-täckning — eller en sitemap-rutt utan sida — fastnar här.
 */

const APP = readFileSync("src/App.tsx", "utf-8");

/** Rutt-mönstren i App.tsx som ligger under den publika drönarsajten. */
const ROUTE_PATTERNS = [...APP.matchAll(/<Route path="(\/kommersiella-dronare[^"]*)"/g)].map(
  (m) => m[1],
);

function toRegExp(pattern: string): RegExp {
  const source = pattern
    .split("/")
    .map((part) => (part.startsWith(":") ? "[^/]+" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    .join("/");
  return new RegExp(`^${source}$`);
}

describe("getPublicRoutes", () => {
  it("hittade rutterna i App.tsx", () => {
    expect(ROUTE_PATTERNS.length).toBeGreaterThanOrEqual(15);
    expect(ROUTE_PATTERNS).toContain("/kommersiella-dronare/produkter/:productSlug");
    expect(ROUTE_PATTERNS).toContain("/kommersiella-dronare/paket/:packageSlug");
  });

  it("täcker varje publik rutt i App.tsx", () => {
    const routes = getPublicRoutes();
    for (const pattern of ROUTE_PATTERNS) {
      const re = toRegExp(pattern);
      expect(
        routes.some((route) => re.test(route)),
        `${pattern} saknar sökvägar i publicRoutes.ts`,
      ).toBe(true);
    }
  });

  it("innehåller bara sökvägar som en rutt i App.tsx matchar", () => {
    const patterns = ROUTE_PATTERNS.map(toRegExp);
    for (const route of getPublicRoutes()) {
      expect(
        patterns.some((re) => re.test(route)),
        `${route} matchas inte av någon rutt i App.tsx`,
      ).toBe(true);
    }
  });

  it("har inga dubbletter", () => {
    const routes = getPublicRoutes();
    expect(new Set(routes).size).toBe(routes.length);
  });

  it("utelämnar driftsvyer och inloggning", () => {
    for (const route of getPublicRoutes()) {
      expect(route.startsWith("/kommersiella-dronare"), route).toBe(true);
    }
  });
});
