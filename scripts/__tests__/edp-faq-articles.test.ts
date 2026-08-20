import { describe, expect, it } from "vitest";
import { EDP_FAQ_ARTICLES, EDP_FAQ_BLOG, getEdpFaqArticleByHandle } from "../../src/data/edpFaqArticles";
import { renderEdpFaqArticleHtml, renderEdpFaqJsonLd } from "../../src/lib/edpFaqArticleHtml";

describe("edpFaqArticles", () => {
  it("defines FAQ blog config", () => {
    expect(EDP_FAQ_BLOG.handle).toBe("vanliga-fragor");
    expect(EDP_FAQ_BLOG.title).toBe("Vanliga frågor");
    expect(EDP_FAQ_BLOG.templateSuffix).toBe("vanliga-fragor");
  });

  it("has at least 10 FAQ articles", () => {
    expect(EDP_FAQ_ARTICLES.length).toBeGreaterThanOrEqual(10);
  });

  it("has unique article handles", () => {
    const handles = EDP_FAQ_ARTICLES.map((a) => a.handle);
    expect(new Set(handles).size).toBe(handles.length);
  });

  it("each article has at least 4 FAQ items", () => {
    for (const article of EDP_FAQ_ARTICLES) {
      expect(article.faq.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("renders FAQ accordion HTML for each article", () => {
    for (const article of EDP_FAQ_ARTICLES) {
      const html = renderEdpFaqArticleHtml(article);
      expect(html).toContain("edp-faq__item");
      expect(html).toContain("Vanliga frågor");
      expect(html).toContain(article.faq[0].question);
    }
  });

  it("embeds FAQPage JSON-LD in article HTML", () => {
    const html = renderEdpFaqArticleHtml(EDP_FAQ_ARTICLES[0]);
    expect(html).toContain('application/ld+json');
    expect(html).toContain("FAQPage");

    const jsonLd = renderEdpFaqJsonLd(EDP_FAQ_ARTICLES[0]);
    expect(jsonLd).toMatchObject({ "@type": "FAQPage" });
  });

  it("uses EDP blue accent in inline CSS", () => {
    const html = renderEdpFaqArticleHtml(EDP_FAQ_ARTICLES[0]);
    expect(html).toContain("#0066cc");
  });

  it("lookup by handle works", () => {
    const first = EDP_FAQ_ARTICLES[0];
    expect(getEdpFaqArticleByHandle(first.handle)?.title).toBe(first.title);
  });
});
