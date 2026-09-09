/**
 * GA4 via gtag.js. Själva taggen laddas i index.html med
 * `send_page_view: false` — sajten är en SPA, så sidvisningarna skickas
 * härifrån vid varje ruttbyte i stället för bara vid första laddningen.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Skickar en page_view för aktuell rutt. No-op om taggen är blockerad. */
export function trackPageView(path: string) {
  window.gtag?.("event", "page_view", {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
  });
}

/** Skickar ett valfritt GA4-event. */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  window.gtag?.("event", name, params);
}
