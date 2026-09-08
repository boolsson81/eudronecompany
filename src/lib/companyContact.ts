/**
 * Publika kontaktuppgifter för EU Drone Company.
 *
 * Källan är företagsuppgifterna för tenanten "European Drone Company" i den
 * delade databasen (`tenants.settings.contact_phone` / `contact_email`). De
 * ligger som konstanter här i stället för att hämtas i runtime, eftersom de
 * behövs i JSON-LD och i statiska mejl- och telefonlänkar — inte för att de är
 * hemliga, utan för att sidorna ska rendera likadant utan databasanrop.
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
  /** Så numret skrivs för läsaren. */
  phone: "076-285 00 65",
  /** E.164 för `tel:`-länkar och schema.org. */
  phoneE164: "+46762850065",
  email: "info@eudronecompany.com",
} as const;

/** `tel:`-länk till växeln. */
export const COMPANY_PHONE_HREF = `tel:${COMPANY_CONTACT.phoneE164}`;

/** `mailto:`-länk, med valfri ämnesrad. */
export function companyMailto(subject?: string): string {
  const base = `mailto:${COMPANY_CONTACT.email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
