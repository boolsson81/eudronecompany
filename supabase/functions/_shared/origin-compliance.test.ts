/**
 * Run: deno test supabase/functions/_shared/origin-compliance.test.ts
 */
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  evaluateComplianceRisk,
  normalizeCountryCode,
  originBadgeVariant,
  resolveCountryOfOrigin,
  resolveManualOrigin,
} from "./origin-compliance.ts";

Deno.test("normalizeCountryCode: valid ISO codes", () => {
  assertEquals(normalizeCountryCode("CN"), "CN");
  assertEquals(normalizeCountryCode("vn"), "VN");
  assertEquals(normalizeCountryCode("  MY  "), "MY");
  assertEquals(normalizeCountryCode("China"), "CN");
  assertEquals(normalizeCountryCode("TAIWAN"), "TW");
});

Deno.test("normalizeCountryCode: invalid values return null", () => {
  assertEquals(normalizeCountryCode(""), null);
  assertEquals(normalizeCountryCode(null), null);
  assertEquals(normalizeCountryCode("XX"), null);
  assertEquals(normalizeCountryCode("INVALID"), null);
  assertEquals(normalizeCountryCode("123"), null);
});

Deno.test("resolveCountryOfOrigin: madeIn = CN", () => {
  const r = resolveCountryOfOrigin("CN");
  assertEquals(r.country_of_origin, "CN");
  assertEquals(r.origin_verified, true);
  assertEquals(r.origin_source, "supplier_api");
});

Deno.test("resolveCountryOfOrigin: madeIn = VN", () => {
  const r = resolveCountryOfOrigin("VN");
  assertEquals(r.country_of_origin, "VN");
  assertEquals(r.origin_verified, true);
  assertEquals(r.origin_source, "supplier_api");
});

Deno.test("resolveCountryOfOrigin: empty value defaults to CN", () => {
  const r = resolveCountryOfOrigin("");
  assertEquals(r.country_of_origin, "CN");
  assertEquals(r.origin_verified, false);
  assertEquals(r.origin_source, "default_cn");
});

Deno.test("resolveCountryOfOrigin: invalid value defaults to CN", () => {
  const logs: string[] = [];
  const r = resolveCountryOfOrigin("NOT-A-COUNTRY", { logInvalid: (m) => logs.push(m) });
  assertEquals(r.country_of_origin, "CN");
  assertEquals(r.origin_verified, false);
  assertEquals(r.origin_source, "default_cn");
  assertEquals(r.invalid_supplier_value, "NOT-A-COUNTRY");
  assertEquals(logs.length, 1);
});

Deno.test("resolveCountryOfOrigin: battery product without madeIn", () => {
  const r = resolveCountryOfOrigin(undefined);
  assertEquals(r.country_of_origin, "CN");
  assertEquals(r.origin_verified, false);
  const eval_ = evaluateComplianceRisk({
    title: "Li-ion Battery Pack for Drone",
    containsBattery: true,
    hs_code: "85076000",
    country_of_origin: r.country_of_origin,
    origin_verified: r.origin_verified,
  });
  assertEquals(eval_.compliance_review_required, true);
  assertEquals(eval_.auto_publish_allowed, false);
});

Deno.test("resolveManualOrigin: admin override", () => {
  const r = resolveManualOrigin("VN");
  assertEquals(r.country_of_origin, "VN");
  assertEquals(r.origin_verified, true);
  assertEquals(r.origin_source, "manual_override");
});

Deno.test("evaluateComplianceRisk: auto publish with default CN non-risk", () => {
  const eval_ = evaluateComplianceRisk({
    title: "USB Cable 1m",
    containsBattery: false,
    hs_code: "85444290",
    country_of_origin: "CN",
    origin_verified: false,
  });
  assertEquals(eval_.compliance_review_required, false);
  assertEquals(eval_.auto_publish_allowed, true);
});

Deno.test("evaluateComplianceRisk: default CN in risk category blocks auto publish", () => {
  const eval_ = evaluateComplianceRisk({
    title: "DJI Mavic Battery Charger",
    containsBattery: true,
    hs_code: "85044030",
    country_of_origin: "CN",
    origin_verified: false,
  });
  assertEquals(eval_.compliance_review_required, true);
  assertEquals(eval_.auto_publish_allowed, false);
  assertEquals(eval_.auto_publish_block_reasons.some((r) => r.includes("Overifierat")), true);
});

Deno.test("originBadgeVariant", () => {
  assertEquals(originBadgeVariant({ origin_verified: true, origin_source: "supplier_api" }), "verified");
  assertEquals(originBadgeVariant({ origin_verified: false, origin_source: "default_cn" }), "default_cn");
  assertEquals(
    originBadgeVariant({ origin_verified: false, invalid_supplier_value: "BAD" }),
    "invalid",
  );
});
