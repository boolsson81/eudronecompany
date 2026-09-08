import { DRONE_CATEGORIES, TRAINING_REQUIREMENTS } from "@/data/droneRegulations";
import { DRONE_COMPARISONS } from "@/data/droneComparisons";
import { INDUSTRY_DATA } from "@/data/commercialDroneIndustries";
import { INDUSTRY_CONFIGS } from "@/data/droneConfigurations";
import { ENTERPRISE_CAMERA_PRODUCTS } from "@/data/enterpriseCameraProducts";
import { ENTERPRISE_DRONE_PRODUCTS } from "@/data/enterpriseDroneProducts";
import { ENTERPRISE_PACKAGES } from "@/data/enterprisePackages";

/**
 * Varje publik sökväg i drönarfrontenden, härledd ur samma datamoduler som
 * sidorna renderar. Används av `scripts/generate-sitemap.mjs`.
 *
 * Driftsvyerna under `/admin` och `/login` hör inte hit — de kräver inloggning
 * och ska inte indexeras.
 *
 * Lägger du till en publik rutt i `App.tsx` ska den läggas till här också.
 * `scripts/__tests__/public-routes.test.ts` jämför listan mot rutterna i
 * `App.tsx`, så en glömd rutt fastnar i testet.
 */
export function getPublicRoutes(): string[] {
  const base = "/kommersiella-dronare";

  return [
    base,
    `${base}/kontakt`,
    `${base}/specialtillverkning`,

    `${base}/produkter`,
    ...ENTERPRISE_DRONE_PRODUCTS.map((p) => `${base}/produkter/${p.slug}`),

    `${base}/paket`,
    ...ENTERPRISE_PACKAGES.map((p) => `${base}/paket/${p.slug}`),

    `${base}/kameror`,
    ...ENTERPRISE_CAMERA_PRODUCTS.map((c) => `${base}/kameror/${c.slug}`),
    `${base}/jamfor-kameror`,

    `${base}/jamforelser`,
    ...DRONE_COMPARISONS.map((c) => `${base}/jamforelser/${c.slug}`),

    `${base}/regelverk`,
    ...DRONE_CATEGORIES.map((c) => `${base}/regelverk/${c.slug}`),
    ...TRAINING_REQUIREMENTS.map((t) => `${base}/utbildning/${t.slug}`),

    ...INDUSTRY_CONFIGS.map((c) => `${base}/konfiguration/${c.slug}`),

    ...INDUSTRY_DATA.flatMap((industry) => [
      `${base}/${industry.slug}`,
      ...industry.solutions.map((s) => `${base}/${industry.slug}/${s.slug}`),
    ]),
  ];
}
