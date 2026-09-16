/**
 * Analytics bridge for the enterprise payload architecture.
 *
 * Forwards `edp:analytics` CustomEvents (dispatched by edp-payload-finder.js,
 * edp-payload-comparison.js, edp-configurator.js and the inline snippets
 * below) to `window.dataLayer` — but ONLY if a dataLayer already exists,
 * i.e. a tag manager or analytics tag is already installed on this store.
 * This file never creates a dataLayer, never loads gtag.js, and never makes
 * a consent decision — it is a pure forwarder. (Note: this store's git repo
 * also contains an unrelated Vercel-hosted React app with its own
 * consent-gated GA4 relay — see docs/ANALYTICS.md — which has nothing to do
 * with this Shopify theme; do not confuse the two.)
 *
 * Event catalog (see docs/reports/ENTERPRISE_PAYLOAD_PHASE7_REPORT.md):
 * payload_category_view, payload_product_view, mission_view,
 * compatibility_check, payload_finder_started, payload_finder_completed,
 * product_comparison_started, product_added_to_configuration,
 * configuration_completed, enterprise_quote_started,
 * enterprise_quote_submitted, contact_expert_clicked.
 * (payload_filter_used is defined but not wired — see the Phase 7 report.)
 */
(function () {
  "use strict";

  function forward(detail) {
    if (!detail || !detail.event) return;
    if (window.dataLayer && typeof window.dataLayer.push === "function") {
      window.dataLayer.push(detail);
    }
  }

  window.addEventListener("edp:analytics", function (e) {
    forward(e.detail);
  });

  // Generic opt-in: any element with data-edp-event="<name>" fires that
  // event on click, so new CTAs can be wired without extra JS.
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-edp-event]");
    if (!el) return;
    forward({ event: el.getAttribute("data-edp-event"), href: el.getAttribute("href") || undefined });
  });
})();
