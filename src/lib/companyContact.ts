/**
 * Publika företags- och kontaktuppgifter för EU Drone Company.
 *
 * Källan är företagsuppgifterna för tenanten "European Drone Company" i den
 * delade databasen. De ligger som konstanter här i stället för att hämtas i
 * runtime: de behövs i JSON-LD och i statiska mejl- och telefonlänkar, och
 * sidorna ska rendera likadant utan databasanrop.
 *
 * Sidorna hade tidigare tre olika nummer: två uppenbara platshållare och ett
 * som gick till ActionKing. Ändras numret ska det ändras här;
 * `scripts/__tests__/contact-details.test.ts` ser till att inget av de gamla
 * numren och ingen gammal adress ligger kvar i sidorna eller i temat.
 *
 * Shopify-temat kan inte importera TypeScript. Samma värden står därför i
 * `theme/`-filerna och vaktas av samma test.
 */
export const COMPANY_CONTACT = {
  /** Firmanamnet som det står i företagsuppgifterna. */
  legalName: "European Drone Company",
  /** Varumärket som används i sidornas text. */
  brandName: "EU Drone Company",
  /**
   * Organisationsnummer. Verksamheten är en enskild firma, så numret är
   * samtidigt innehavarens personnummer — det är så Bolagsverket registrerar
   * enskilda firmor, och numret ska anges publikt enligt e-handelslagen.
   */
  orgNumber: "810912-2971",
  address: {
    street: "Lyddevägen 34",
    zip: "511 58",
    city: "Kinna",
    /** ISO 3166-1 alpha-2, för schema.org PostalAddress. */
    countryCode: "SE",
    country: "Sverige",
  },
  /** Så numret skrivs för läsaren. */
  phone: "076-285 00 65",
  /** E.164 för `tel:`-länkar och schema.org. */
  phoneE164: "+46762850065",
  email: "info@eudronecompany.com",
} as const;

/** Postadressen på en rad, som den skrivs i sidfot och kontaktuppgifter. */
export const COMPANY_ADDRESS_LINE = `${COMPANY_CONTACT.address.street}, ${COMPANY_CONTACT.address.zip} ${COMPANY_CONTACT.address.city}`;

/** `PostalAddress` för schema.org. */
export const COMPANY_POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: COMPANY_CONTACT.address.street,
  postalCode: COMPANY_CONTACT.address.zip,
  addressLocality: COMPANY_CONTACT.address.city,
  addressCountry: COMPANY_CONTACT.address.countryCode,
} as const;

/**
 * Organisationsnumret som `identifier` för schema.org. `taxID` vore fel —
 * organisationsnummer och skatteregistreringsnummer är inte samma sak.
 */
export const COMPANY_ORG_IDENTIFIER = {
  "@type": "PropertyValue",
  name: "Organisationsnummer",
  value: COMPANY_CONTACT.orgNumber,
} as const;

/** `tel:`-länk till växeln. */
export const COMPANY_PHONE_HREF = `tel:${COMPANY_CONTACT.phoneE164}`;

/** `mailto:`-länk, med valfri ämnesrad. */
export function companyMailto(subject?: string): string {
  const base = `mailto:${COMPANY_CONTACT.email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
