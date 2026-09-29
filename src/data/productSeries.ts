import { getPackageBySlug, type EnterprisePackage } from "./enterprisePackages";

/**
 * Produktserier — grupperar de färdiga Enterprise-paketen (`enterprisePackages.ts`)
 * under ett gemensamt ändamål på branschsidan.
 *
 * En bransch kan ha en eller flera serier: branscher med ett enda huvudsakligt
 * användningsområde (t.ex. Lantbruk) har en serie som samlar Bas/Pro/Enterprise,
 * medan branscher med flera distinkta ändamål (t.ex. Bygg & Anläggning, där
 * markkartläggning och byggprojektuppföljning löses med olika paket) har en
 * serie per ändamål.
 *
 * `packageSlugs` pekar på `enterprisePackages.ts`. Testerna i
 * `scripts/__tests__/product-series.test.ts` slår upp varje slug och bransch,
 * så en felstavad referens fastnar där.
 */
export interface ProductSeries {
  slug: string;
  /** Slug i `commercialDroneIndustries.ts` — serien hör hemma på den branschsidan. */
  industrySlug: string;
  name: string;
  /** Ändamålet serien löser, t.ex. "Markkartläggning & massaberäkning". */
  purpose: string;
  desc: string;
  /** Slugs i `enterprisePackages.ts`, i ordningen de ska visas. */
  packageSlugs: string[];
}

export const PRODUCT_SERIES: ProductSeries[] = [
  // ----------------------------------------------------------------- Inspektion
  {
    slug: "inspektionsserien",
    industrySlug: "inspektion",
    name: "Inspektionsserien",
    purpose: "Tak-, fasad-, vindkraft- och solpanelsinspektion",
    desc: "Från portabel punktinspektion till en flotta med två drönare — tre nivåer för hur ofta och hur avancerat ni inspekterar.",
    packageSlugs: ["inspektion-bas", "inspektion-pro", "inspektion-enterprise"],
  },

  // -------------------------------------------------------------------- Lantbruk
  {
    slug: "lantbruksserien",
    industrySlug: "lantbruk",
    name: "Lantbruksserien",
    purpose: "Fältkartläggning, växtanalys och precisionsbesprutning",
    desc: "Från kartläggning av fältens hälsa till komplett besprutning och spridning — tre nivåer för precisionsodling.",
    packageSlugs: ["lantbruk-bas", "lantbruk-pro", "lantbruk-enterprise"],
  },

  // ---------------------------------------------------------------- Kartläggning
  {
    slug: "kartlaggningsserien",
    industrySlug: "kartlaggning",
    name: "Kartläggningsserien",
    purpose: "3D-modellering, fotogrammetri och LiDAR-kartläggning",
    desc: "Från portabel fotogrammetri till LiDAR-kartläggning under vegetation — tre nivåer för mätuppdrag med olika krav på noggrannhet.",
    packageSlugs: ["kartlaggning-bas", "kartlaggning-pro", "kartlaggning-enterprise"],
  },

  // -------------------------------------------------------------------- Säkerhet
  {
    slug: "bevakningsserien",
    industrySlug: "sakerhet",
    name: "Bevakningsserien",
    purpose: "Snabb insats, perimeterbevakning och automatiserad dockning",
    desc: "Från en snabbväska för utryckning till en helautomatiserad dockningslösning dygnet runt — tre nivåer för säkerhetsuppdrag.",
    packageSlugs: ["sakerhet-bas", "sakerhet-pro", "sakerhet-enterprise"],
  },

  // ---------------------------------------------------------------------- Energi
  {
    slug: "elnatsserien",
    industrySlug: "energi",
    name: "Elnätsserien",
    purpose: "Ledningsinspektion, transformatorkontroll och vegetationsanalys",
    desc: "Från portabel punktinspektion till komplett system med termisk och LiDAR-sensor — tre nivåer för inspektion av energiinfrastruktur.",
    packageSlugs: ["energi-bas", "energi-pro", "energi-enterprise"],
  },

  // ------------------------------------------------------------------ Film & media
  {
    slug: "produktionsserien",
    industrySlug: "film-media",
    name: "Produktionsserien",
    purpose: "Fastighetsfoto, filmproduktion och flerkameraproduktioner",
    desc: "Från fastighetsfoto med tre kameror till dubbeldrönarsystem för stora produktioner — tre nivåer för film och media.",
    packageSlugs: ["film-media-bas", "film-media-pro", "film-media-enterprise"],
  },

  // -------------------------------------------------------------- Bygg & Anläggning
  {
    slug: "markkartlaggning-massaberakning",
    industrySlug: "bygg-anlaggning",
    name: "Markkartläggning & Massaberäkning",
    purpose: "Terrängmodeller och volymberäkning inför och under schaktarbete",
    desc: "Från portabel markkartläggning till fotogrammetri med dokumenterbar noggrannhet för fakturaunderlag — två nivåer för massabalans.",
    packageSlugs: ["bygg-markkartlaggning-bas", "bygg-markkartlaggning-pro"],
  },
  {
    slug: "bygguppfoljning-sakerhet",
    industrySlug: "bygg-anlaggning",
    name: "Bygguppföljning & Säkerhet",
    purpose: "Regelbunden projektdokumentation och säkerhetsronder på arbetsplatsen",
    desc: "Från en väska platschefen kan ta upp mellan möten till repeterbara flygningar med termisk kontroll — två nivåer för byggprojektuppföljning.",
    packageSlugs: ["bygg-uppfoljning-bas", "bygg-uppfoljning-pro"],
  },
];

export function getSeriesBySlug(slug: string): ProductSeries | undefined {
  return PRODUCT_SERIES.find((s) => s.slug === slug);
}

/** Serierna för en bransch, i den ordning de ska visas på branschsidan. */
export function getSeriesForIndustry(industrySlug: string): ProductSeries[] {
  return PRODUCT_SERIES.filter((s) => s.industrySlug === industrySlug);
}

/** Paketen en serie består av, i `packageSlugs`-ordning. */
export function getPackagesForSeries(series: ProductSeries): EnterprisePackage[] {
  return series.packageSlugs
    .map((slug) => getPackageBySlug(slug))
    .filter((pkg): pkg is EnterprisePackage => !!pkg);
}
