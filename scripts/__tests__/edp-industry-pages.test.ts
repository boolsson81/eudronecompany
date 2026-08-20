import { describe, expect, it } from "vitest";
import { EDP_INDUSTRY_PAGES, getEdpIndustryByHandle } from "../../src/data/edpIndustryPages";
import { renderEdpEnterprisePageHtml } from "../../src/data/edpEnterprisePage";
import {
  renderEdpIndustryPageHtml,
  renderEdpIndustryFaqJsonLd,
} from "../../src/lib/edpIndustryPageHtml";
import { EDP_INDUSTRY_CSS } from "../../src/lib/edpIndustryStyles";

describe("edpIndustryPages", () => {
  it("defines all three solution pages", () => {
    const handles = EDP_INDUSTRY_PAGES.map((p) => p.handle);
    expect(handles).toEqual([
      "energy-infrastructure",
      "gis-mapping",
      "emergency-services",
    ]);
  });

  it("resolves by English and Swedish handle", () => {
    expect(getEdpIndustryByHandle("energy-infrastructure")?.title).toBe(
      "Energi & Infrastruktur",
    );
    expect(getEdpIndustryByHandle("gis-kartlaggning")?.titleEn).toBe(
      "GIS & Mapping",
    );
    expect(getEdpIndustryByHandle("unknown")).toBeUndefined();
  });

  it("each page has required content sections", () => {
    for (const page of EDP_INDUSTRY_PAGES) {
      expect(page.applications.length).toBeGreaterThanOrEqual(4);
      expect(page.recommendedProducts.length).toBeGreaterThanOrEqual(2);
      expect(page.benefits.length).toBeGreaterThanOrEqual(4);
      expect(page.faq.length).toBeGreaterThanOrEqual(4);
      expect(page.templateSuffix).toBe("industry");
      expect(page.metaTitle.length).toBeLessThanOrEqual(70);
      expect(page.metaDescription.length).toBeLessThanOrEqual(160);
    }
  });
});

describe("renderEdpEnterprisePageHtml", () => {
  it("renders industry hub with Lösningar per bransch", () => {
    const html = renderEdpEnterprisePageHtml();
    expect(html).toContain("Lösningar per bransch");
    expect(html).toContain("/pages/energy-infrastructure");
    expect(html).toContain("/pages/gis-mapping");
    expect(html).toContain("/pages/emergency-services");
    expect(html).toContain("<style>");
  });
});

describe("EDP_INDUSTRY_CSS", () => {
  it("includes enterprise card styles", () => {
    expect(EDP_INDUSTRY_CSS).toContain(".edp-enterprise__card");
  });
});

describe("renderEdpIndustryPageHtml", () => {
  it("renders semantic HTML with key sections", () => {
    const html = renderEdpIndustryPageHtml(EDP_INDUSTRY_PAGES[0]);
    expect(html).toContain('class="edp-industry-page"');
    expect(html).toContain("<style>");
    expect(html).toContain("<h1>");
    expect(html).toContain("Användningsområden");
    expect(html).toContain("Rekommenderad utrustning");
    expect(html).toContain("Vanliga frågor");
    expect(html).toContain("/pages/b2b");
    expect(html).not.toContain("<script");
  });

  it("escapes HTML in user-facing text", () => {
    const page = {
      ...EDP_INDUSTRY_PAGES[0],
      heroTitle: 'Test <script>alert("xss")</script>',
    };
    const html = renderEdpIndustryPageHtml(page);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("renderEdpIndustryFaqJsonLd", () => {
  it("produces valid FAQPage schema", () => {
    const json = renderEdpIndustryFaqJsonLd(EDP_INDUSTRY_PAGES[2]);
    const parsed = JSON.parse(json);
    expect(parsed["@type"]).toBe("FAQPage");
    expect(parsed.mainEntity.length).toBe(EDP_INDUSTRY_PAGES[2].faq.length);
    expect(parsed.mainEntity[0].acceptedAnswer.text).toBeTruthy();
  });
});
