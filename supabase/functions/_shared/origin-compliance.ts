/**
 * Country-of-origin resolution for supplier imports (SUNSKY → DigitalSignal → Shopify).
 *
 * Priority:
 * 1. Valid madeIn from supplier API → verified
 * 2. Missing/invalid → default CN, unverified
 */

export type OriginSource = "supplier_api" | "default_cn" | "manual_override";

export type OriginResolution = {
  country_of_origin: string;
  origin_verified: boolean;
  origin_source: OriginSource;
  /** True when supplier value was present but failed ISO validation */
  invalid_supplier_value?: string;
};

export type ComplianceRiskInput = {
  title?: string | null;
  category?: string | null;
  containsBattery?: boolean;
  hs_code?: string | null;
};

export type ComplianceEvaluation = {
  compliance_review_required: boolean;
  compliance_review_reasons: string[];
  auto_publish_allowed: boolean;
  auto_publish_block_reasons: string[];
};

/** ISO 3166-1 alpha-2 codes commonly returned by SUNSKY and used in EU trade. */
const ALLOWED_COUNTRY_CODES = new Set([
  "CN", "TW", "VN", "MY", "IN", "HK", "US", "JP", "KR", "DE", "GB", "FR", "IT", "ES", "PL", "SE",
  "TH", "ID", "PH", "BD", "PK", "TR", "MX", "BR", "AU", "CA", "NL", "BE", "AT", "CH", "CZ", "HU",
  "RO", "BG", "PT", "IE", "DK", "FI", "NO", "SG", "AE", "SA", "IL", "ZA", "RU", "UA", "LT", "LV",
  "EE", "SK", "SI", "HR", "GR", "LU", "MT", "CY",
]);

const RISK_KEYWORDS = [
  { pattern: /\bbatter(y|ies|i|ier|ipack|ipack)\b|\bbattery\b/i, reason: "Batteriprodukt" },
  { pattern: /\blithium\b/i, reason: "Litiumbatteri" },
  { pattern: /\bli-ion\b|\blipo\b|\bli-po\b/i, reason: "Litiumbatteri" },
  { pattern: /\bcharger\b|\bladdare\b|\bcharging\b|\bpower\s*adapter\b|\bströmadapter\b/i, reason: "Laddare" },
  { pattern: /\bdrone\b|\bdrönare\b|\bquadcopter\b|\bfpv\b|\bmavic\b|\bphantom\b|\bmini\s*\d/i, reason: "Drönare" },
  { pattern: /\bradio\b|\btransmitter\b|\bsändare\b|\bremote\s*control\b|\brc\b/i, reason: "Radiosändare/RC" },
  { pattern: /\belectronic\b|\belektronik\b|\bcircuit\b|\bpcb\b|\bmodul\b|\bcontroller\b|\bboard\b/i, reason: "Elektronik" },
  { pattern: /\bmotor\b|\besc\b|\bpropeller\b|\bgimbal\b|\bcamera\s*module\b/i, reason: "Elektronik (drönardel)" },
];

/**
 * Normalize a supplier country value to ISO 3166-1 alpha-2, or null if invalid/empty.
 */
export function normalizeCountryCode(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;

  const upper = s.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper) && ALLOWED_COUNTRY_CODES.has(upper)) {
    return upper;
  }

  const aliases: Record<string, string> = {
    CHINA: "CN",
    "PEOPLE'S REPUBLIC OF CHINA": "CN",
    PRC: "CN",
    "MAINLAND CHINA": "CN",
    TAIWAN: "TW",
    VIETNAM: "VN",
    "VIET NAM": "VN",
    MALAYSIA: "MY",
    INDIA: "IN",
    "HONG KONG": "HK",
    "UNITED STATES": "US",
    USA: "US",
  };
  const alias = aliases[upper];
  if (alias) return alias;

  return null;
}

/**
 * Resolve country of origin from SUNSKY madeIn (or aliases).
 */
export function resolveCountryOfOrigin(
  raw: unknown,
  options: { source?: OriginSource; logInvalid?: (msg: string) => void } = {},
): OriginResolution {
  const rawStr = raw != null ? String(raw).trim() : "";
  const normalized = normalizeCountryCode(raw);

  if (normalized) {
    return {
      country_of_origin: normalized,
      origin_verified: options.source !== "manual_override",
      origin_source: options.source ?? "supplier_api",
      ...(rawStr && normalized !== rawStr.toUpperCase().slice(0, 2)
        ? { invalid_supplier_value: undefined }
        : {}),
    };
  }

  if (rawStr) {
    options.logInvalid?.(
      `[origin-compliance] Invalid country code "${rawStr}" — defaulting to CN`,
    );
  }

  return {
    country_of_origin: "CN",
    origin_verified: false,
    origin_source: "default_cn",
    ...(rawStr ? { invalid_supplier_value: rawStr } : {}),
  };
}

/** Manual override from admin — always verified when saved explicitly. */
export function resolveManualOrigin(countryCode: string): OriginResolution {
  const normalized = normalizeCountryCode(countryCode);
  if (normalized) {
    return {
      country_of_origin: normalized,
      origin_verified: true,
      origin_source: "manual_override",
    };
  }
  return {
    country_of_origin: "CN",
    origin_verified: false,
    origin_source: "default_cn",
    invalid_supplier_value: countryCode,
  };
}

export function isElectronicProduct(input: ComplianceRiskInput): boolean {
  const haystack = `${input.title ?? ""} ${input.category ?? ""}`.toLowerCase();
  return RISK_KEYWORDS.some(({ pattern }) => pattern.test(haystack));
}

export function evaluateComplianceRisk(input: ComplianceRiskInput & {
  country_of_origin?: string | null;
  origin_verified?: boolean;
  contains_battery?: boolean;
}): ComplianceEvaluation {
  const reasons: string[] = [];
  const containsBattery = Boolean(input.containsBattery ?? input.contains_battery);
  const electronic = isElectronicProduct(input);

  if (containsBattery) reasons.push("Innehåller batteri (SUNSKY flagga)");
  if (electronic) {
    for (const { pattern, reason } of RISK_KEYWORDS) {
      const haystack = `${input.title ?? ""} ${input.category ?? ""}`;
      if (pattern.test(haystack) && !reasons.includes(reason)) {
        reasons.push(reason);
      }
    }
  }

  const compliance_review_required = containsBattery || electronic;

  const hasOrigin = Boolean(input.country_of_origin?.trim());
  const hasHs = Boolean(input.hs_code?.trim());
  const auto_publish_allowed =
    hasOrigin &&
    hasHs &&
    !(compliance_review_required && !input.origin_verified);

  const blockReasons: string[] = [];
  if (!hasHs) blockReasons.push("Saknar HS-kod");
  if (!hasOrigin) blockReasons.push("Saknar ursprungsland");
  if (compliance_review_required && !input.origin_verified) {
    blockReasons.push("Overifierat ursprungsland i riskkategori");
  }
  if (containsBattery && compliance_review_required) {
    blockReasons.push("Batteriprodukt kräver compliance-granskning");
  }

  return {
    compliance_review_required,
    compliance_review_reasons: reasons,
    auto_publish_allowed,
    auto_publish_block_reasons: auto_publish_allowed ? [] : blockReasons,
  };
}

export type OriginBadgeVariant = "verified" | "default_cn" | "invalid";

export function originBadgeVariant(row: {
  origin_verified?: boolean;
  origin_source?: string | null;
  country_of_origin?: string | null;
  invalid_supplier_value?: string | null;
}): OriginBadgeVariant {
  if (row.invalid_supplier_value && !row.origin_verified) return "invalid";
  if (row.origin_verified) return "verified";
  if (row.origin_source === "default_cn" || !row.origin_verified) return "default_cn";
  return "default_cn";
}
