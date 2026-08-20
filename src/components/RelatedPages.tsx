import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

interface RelatedPage {
  id: string;
  title: string;
  url: string;
}

interface RelatedPagesProps {
  /** The full public URL of the current page, e.g. "https://app.digitalsignal.io/boka-demo" */
  pageUrl: string;
  /** Optional heading override */
  heading?: string;
  /** Optional shop_id filter – defaults to looking up by URL */
  shopId?: string;
}

/**
 * Displays a "Relaterade sidor" section with links fetched from
 * the `product_related_links` table (source ↔ target).
 */
export default function RelatedPages({ pageUrl, heading = "Relaterade sidor", shopId }: RelatedPagesProps) {
  const [pages, setPages] = useState<RelatedPage[]>([]);

  useEffect(() => {
    if (!pageUrl) return;
    fetchRelated();
  }, [pageUrl]);

  const fetchRelated = async () => {
    // 1. Find current page id by URL
    const { data: currentPage } = await supabase
      .from("pages")
      .select("id")
      .eq("url", pageUrl)
      .limit(1)
      .maybeSingle();

    if (!currentPage) return;

    // 2. Get linked pages (both directions)
    const { data: links } = await supabase
      .from("product_related_links")
      .select(`
        target_page_id,
        target:pages!product_related_links_target_page_id_fkey (
          id, title, url
        )
      `)
      .eq("source_page_id", currentPage.id);

    if (links && links.length > 0) {
      const related: RelatedPage[] = links
        .filter((l) => l.target)
        .map((l) => ({
          id: (l.target as any).id,
          title: (l.target as any).title,
          url: (l.target as any).url,
        }));
      setPages(related);
    }
  };

  if (pages.length === 0) return null;

  // Convert full URL to relative path for react-router Link
  const toRelativePath = (fullUrl: string) => {
    try {
      const url = new URL(fullUrl);
      return url.pathname;
    } catch {
      return fullUrl;
    }
  };

  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">{heading}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Link
              key={page.id}
              to={toRelativePath(page.url)}
              className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200"
            >
              <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors truncate">
                {page.title}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
