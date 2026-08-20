import { useEffect } from "react";
import { getHreflangAlternates } from "@/lib/hreflang";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface HreflangItem {
  lang: string;
  href: string;
}

interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  articleAuthor?: string;
  articlePublishedTime?: string;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, unknown> | null | undefined | Array<Record<string, unknown> | null | undefined>;
  hreflang?: HreflangItem[];
}

/**
 * Sets document title, meta description, canonical URL, OG image, hreflang, breadcrumbs and injects JSON-LD.
 * Cleans up on unmount so each page has its own SEO.
 */
export default function SeoHead({ title, description, canonical, ogImage, ogType, articleAuthor, articlePublishedTime, breadcrumbs, jsonLd, hreflang }: SeoHeadProps) {
  useEffect(() => {
    // Remove server-prerendered SEO tags so SeoHead becomes the single source
    // of truth post-hydration (avoids duplicate canonical/hreflang).
    document
      .querySelectorAll('link[data-prerendered], meta[data-prerendered]')
      .forEach((el) => el.remove());

    // Title
    const prevTitle = document.title;
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const prevDesc = metaDesc?.content || "";
    if (metaDesc) metaDesc.content = description;

    // OG tags (create if missing so each route can self-describe)
    const ensureMetaEl = (attr: string, attrValue: string): HTMLMetaElement => {
      let el = document.querySelector(`meta[${attr}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, attrValue);
        el.setAttribute("data-seo-head", "true");
        document.head.appendChild(el);
      }
      return el;
    };

    const ogTitle = ensureMetaEl("property", "og:title");
    const ogDesc = ensureMetaEl("property", "og:description");
    const prevOgTitle = ogTitle.content || "";
    const prevOgDesc = ogDesc.content || "";
    ogTitle.content = title;
    ogDesc.content = description;

    // Dynamic meta tags (OG image, type, article tags, og:url)
    const dynamicMetas: HTMLMetaElement[] = [];

    const ensureMeta = (attr: string, attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, attrValue);
        document.head.appendChild(el);
        dynamicMetas.push(el);
      }
      el.content = content;
    };

    if (ogImage) {
      ensureMeta("property", "og:image", ogImage);
      ensureMeta("name", "twitter:image", ogImage);
      ensureMeta("name", "twitter:card", "summary_large_image");
    }

    if (ogType) {
      ensureMeta("property", "og:type", ogType);
    }

    if (articleAuthor) {
      ensureMeta("name", "author", articleAuthor);
      ensureMeta("property", "article:author", articleAuthor);
    }

    if (articlePublishedTime) {
      ensureMeta("property", "article:published_time", articlePublishedTime);
    }

    // Canonical + og:url — create if missing so each route self-references
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    let canonicalCreated = false;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.rel = "canonical";
      canonicalEl.setAttribute("data-seo-head", "true");
      document.head.appendChild(canonicalEl);
      canonicalCreated = true;
    }
    const prevCanonical = canonicalEl.href || "";
    const resolvedCanonical = canonical
      ? canonical
      : (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "");
    if (resolvedCanonical) {
      canonicalEl.href = resolvedCanonical;
      ensureMeta("property", "og:url", resolvedCanonical);
    }

    // Hreflang links — explicit prop wins; otherwise auto-derive from current path.
    const hreflangLinks: HTMLLinkElement[] = [];
    const resolvedHreflang =
      hreflang && hreflang.length > 0
        ? hreflang
        : (typeof window !== "undefined"
            ? getHreflangAlternates(window.location.pathname)
            : null) ?? [];
    if (resolvedHreflang && resolvedHreflang.length > 0) {
      resolvedHreflang.forEach(({ lang, href }) => {
        const link = document.createElement("link");
        link.rel = "alternate";
        link.hreflang = lang;
        link.href = href;
        link.setAttribute("data-seo-head", "true");
        document.head.appendChild(link);
        hreflangLinks.push(link);
      });
    }

    // JSON-LD (including breadcrumbs)
    const scripts: HTMLScriptElement[] = [];

    const allLd: Record<string, unknown>[] = [];

    if (breadcrumbs && breadcrumbs.length > 0) {
      allLd.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      });
    }

    if (jsonLd) {
      const items = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(
        (x): x is Record<string, unknown> => !!x && typeof x === "object",
      );
      allLd.push(...items);
    }

    allLd.forEach((ld) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(ld);
      script.setAttribute("data-seo-head", "true");
      document.head.appendChild(script);
      scripts.push(script);
    });

    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc.content = prevDesc;
      if (ogTitle) ogTitle.content = prevOgTitle;
      if (ogDesc) ogDesc.content = prevOgDesc;
      if (canonicalCreated && canonicalEl) {
        canonicalEl.remove();
      } else if (canonicalEl && prevCanonical) {
        canonicalEl.href = prevCanonical;
      }
      dynamicMetas.forEach((m) => m.remove());
      hreflangLinks.forEach((l) => l.remove());
      scripts.forEach((s) => s.remove());
    };
  }, [title, description, canonical, ogImage, ogType, articleAuthor, articlePublishedTime, breadcrumbs, jsonLd, hreflang]);

  return null;
}
