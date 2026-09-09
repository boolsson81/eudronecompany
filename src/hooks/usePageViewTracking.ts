import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

/**
 * Skickar en GA4-sidvisning vid varje ruttbyte, inklusive första renderingen.
 * Anropet fördröjs en frame så att SeoHead hinner sätta document.title.
 */
export function usePageViewTracking() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const frame = requestAnimationFrame(() => trackPageView(`${pathname}${search}`));
    return () => cancelAnimationFrame(frame);
  }, [pathname, search]);
}
