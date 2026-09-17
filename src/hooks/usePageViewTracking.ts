import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, trackPageView } from "@/lib/analytics";
import { initMetaPixel, trackMetaPageView } from "@/lib/metaPixel";

/**
 * Skickar en sidvisning (GA4 + Meta Pixel) vid varje ruttbyte, inklusive
 * första renderingen. Anropet fördröjs en frame så att SeoHead hinner sätta
 * document.title.
 */
let started = false;

export function usePageViewTracking() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // StrictMode monterar om i utvecklingsläge; taggarna ska bara startas en gång.
    if (started) return;
    started = true;
    initAnalytics();
    initMetaPixel();
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      trackPageView(`${pathname}${search}`);
      trackMetaPageView();
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, search]);
}
