import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, trackPageView } from "@/lib/analytics";

/**
 * Skickar en GA4-sidvisning vid varje ruttbyte, inklusive första renderingen.
 * Anropet fördröjs en frame så att SeoHead hinner sätta document.title.
 */
let started = false;

export function usePageViewTracking() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // StrictMode monterar om i utvecklingsläge; taggen ska bara startas en gång.
    if (started) return;
    started = true;
    initAnalytics();
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => trackPageView(`${pathname}${search}`));
    return () => cancelAnimationFrame(frame);
  }, [pathname, search]);
}
