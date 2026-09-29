import { describe, expect, it } from "vitest";
import {
  EDP_COMPARISON_ARTICLES,
  EDP_COMPARISON_BLOG,
  getEdpComparisonArticleByHandle,
} from "../../src/data/edpComparisonArticles";
import { renderEdpComparisonArticleHtml } from "../../src/lib/edpComparisonArticleHtml";

describe("edpComparisonArticles", () => {
  it("defines jämförer blog config", () => {
    expect(EDP_COMPARISON_BLOG.handle).toBe("jamforer");
    expect(EDP_COMPARISON_BLOG.title).toBe("Jämförer");
    expect(EDP_COMPARISON_BLOG.templateSuffix).toBe("jamforer");
  });

  it("has at least 10 comparison articles", () => {
    expect(EDP_COMPARISON_ARTICLES.length).toBeGreaterThanOrEqual(10);
  });

  it("has unique article handles", () => {
    const handles = EDP_COMPARISON_ARTICLES.map((a) => a.handle);
    expect(new Set(handles).size).toBe(handles.length);
  });

  it("renders comparison table HTML for each article", () => {
    for (const article of EDP_COMPARISON_ARTICLES) {
      const html = renderEdpComparisonArticleHtml(article);
      expect(html).toContain("edp-comparison__table");
      expect(html).toContain("Specifikationsjämförelse");
      for (const id of article.cameraIds) {
        const found = getEdpComparisonArticleByHandle(article.handle);
        expect(found?.cameraIds).toContain(id);
      }
    }
  });

  it("ties accent, text and background colors to the theme's color scheme instead of fixed hex values", () => {
    const html = renderEdpComparisonArticleHtml(EDP_COMPARISON_ARTICLES[0]);
    expect(html).toContain("var(--color-link)");
    expect(html).toContain("var(--color-foreground)");
    expect(html).toContain("var(--color-button)");
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });
});
