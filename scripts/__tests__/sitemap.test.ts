import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error — generatorn är vanlig JS och har inga typer.
import { renderRobots, renderSitemap } from "../generate-sitemap.mjs";
import { getPublicRoutes } from "../../src/lib/publicRoutes";
import { DRONE_SITE_ORIGIN } from "../../src/lib/publicSite";

const SITEMAP = readFileSync("public/sitemap.xml", "utf-8");
const ROBOTS = readFileSync("public/robots.txt", "utf-8");

/** `lastmod` ändras varje gång skriptet körs och säger inget om innehållet. */
function withoutLastmod(xml: string): string {
  return xml.replace(/^\s*<lastmod>.*<\/lastmod>\n/gm, "");
}

describe("public/sitemap.xml", () => {
  it("är inte inaktuell — matchar det skriptet skulle generera", () => {
    const generated = renderSitemap(getPublicRoutes(), DRONE_SITE_ORIGIN, "2000-01-01");
    expect(withoutLastmod(SITEMAP), "kör `npm run sitemap`").toBe(withoutLastmod(generated));
  });

  it("listar varje publik sökväg exakt en gång", () => {
    const locs = [...SITEMAP.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(new Set(locs).size).toBe(locs.length);
    expect(locs.length).toBe(getPublicRoutes().length);
  });

  it("pekar på den domän canonical-URL:erna använder", () => {
    for (const [, loc] of SITEMAP.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      expect(loc.startsWith(`${DRONE_SITE_ORIGIN}/`), loc).toBe(true);
    }
  });

  it("innehåller de nya produkt- och paketsidorna", () => {
    for (const path of [
      "/kommersiella-dronare/produkter/matrice-350-rtk",
      "/kommersiella-dronare/paket/inspektion-pro",
      "/kommersiella-dronare/paket/film-media-enterprise",
    ]) {
      expect(SITEMAP).toContain(`<loc>${DRONE_SITE_ORIGIN}${path}</loc>`);
    }
  });

  it("släpper inte in driftsvyerna", () => {
    expect(SITEMAP).not.toContain("/admin");
    expect(SITEMAP).not.toContain("/login");
  });
});

describe("public/robots.txt", () => {
  it("är inte inaktuell", () => {
    expect(ROBOTS, "kör `npm run sitemap`").toBe(renderRobots(DRONE_SITE_ORIGIN));
  });

  it("stänger ute driftsvyerna och pekar på sitemapen", () => {
    expect(ROBOTS).toContain("Disallow: /admin");
    expect(ROBOTS).toContain("Disallow: /login");
    expect(ROBOTS).toContain(`Sitemap: ${DRONE_SITE_ORIGIN}/sitemap.xml`);
  });
});
