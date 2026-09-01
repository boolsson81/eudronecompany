/**
 * Publik origin för den här frontenden.
 *
 * Medvetet utan default. Drönarsidorna hade `https://actionking.se` hårdkodat
 * som canonical efter flytten hit, vilket hade sagt åt Google att originalet
 * ligger kvar hos ActionKing. Måldomänen är samtidigt inte beslutad — apexen
 * `eudronecompany.com` är Shopify-butiken och saknar `/kommersiella-dronare/*`
 * (se `docs/FRONTEND_MIGRATION.md`). I stället för att gissa läses origin ur
 * `VITE_SITE_ORIGIN`.
 *
 * Produktionsbygget avbryts om variabeln saknas — kontrollen ligger i
 * `vite.config.ts` så att felet kommer före deploy, inte som vit skärm efter.
 * I `npm run dev` används sidans egen origin, så localhost fungerar
 * okonfigurerat; en canonical mot localhost indexeras aldrig.
 */

const CONFIGURED = import.meta.env.VITE_SITE_ORIGIN?.trim();

function resolveOrigin(): string {
  if (CONFIGURED) return CONFIGURED.replace(/\/+$/, "");
  if (import.meta.env.DEV && typeof window !== "undefined") return window.location.origin;
  throw new Error(
    "VITE_SITE_ORIGIN saknas. Sätt den till frontendens publika origin " +
      "(t.ex. https://dronare.eudronecompany.com) i Vercel-projektet. " +
      "Se docs/FRONTEND_MIGRATION.md § Måldomän.",
  );
}

export const SITE_ORIGIN = resolveOrigin();

/** Absolut URL på den här sajten. `siteUrl("/kommersiella-dronare")` etc. */
export function siteUrl(path = "/"): string {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Varumärkets huvudsajt — Shopify-butiken. Används i JSON-LD för
 * `Organization`/`publisher`/`provider`, som ska peka på bolagets sajt och inte
 * på den här frontenden. Håll i synk med `EDP_DOMAIN` i `edp-hreflang.ts`.
 */
export const BRAND_ORIGIN = "https://eudronecompany.com";
