import { useEffect } from "react";
import { trackMetaViewContent } from "@/lib/metaPixel";

/** Skickar Meta Pixels ViewContent när en produkt-, kamera- eller paketsida visar sitt innehåll. */
export function useViewContentTracking(
  content: { slug: string; name: string; category?: string } | undefined,
): void {
  useEffect(() => {
    if (!content) return;
    trackMetaViewContent({
      contentId: content.slug,
      contentName: content.name,
      contentCategory: content.category,
    });
  }, [content]);
}
