/** Inline CSS for EDP FAQ blog articles (Shopify body_html). */
export const EDP_FAQ_CSS = `
.edp-faq-page {
  --edp-accent: #0066cc;
  --edp-accent-hover: #0052a3;
  --edp-text: #1a1a1a;
  --edp-muted: #5c5c5c;
  --edp-border: #e5e7eb;
  --edp-bg: #f8fafc;
  --edp-radius: 12px;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 0 2rem;
  color: var(--edp-text);
  font-family: inherit;
  line-height: 1.6;
}
.edp-faq-page h2 {
  font-size: clamp(1.15rem, 3vw, 1.35rem);
  font-weight: 600;
  margin: 2rem 0 1rem;
  color: var(--edp-text);
  line-height: 1.2;
}
.edp-faq-page p { margin: 0 0 1rem; color: var(--edp-muted); }
.edp-faq__eyebrow {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--edp-accent);
  margin-bottom: 0.75rem;
}
.edp-faq__intro p:last-child { margin-bottom: 0; }
.edp-faq__list { margin: 1rem 0 2rem; }
.edp-faq__item {
  border: 1px solid var(--edp-border);
  border-radius: var(--edp-radius);
  margin-bottom: 0.5rem;
  padding: 0 1rem;
  background: #fff;
}
.edp-faq__item summary {
  cursor: pointer;
  font-weight: 600;
  padding: 1rem 0;
  color: var(--edp-text);
  list-style: none;
}
.edp-faq__item summary::-webkit-details-marker { display: none; }
.edp-faq__item[open] summary { color: var(--edp-accent); }
.edp-faq__item p { padding-bottom: 1rem; margin: 0; color: var(--edp-muted); }
.edp-faq__related {
  padding: 1.25rem 1.5rem;
  background: var(--edp-bg);
  border-radius: var(--edp-radius);
  margin: 2rem 0;
}
.edp-faq__related h2 { margin-top: 0; font-size: 1rem; }
.edp-faq__related-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.edp-faq__related-link {
  display: inline-block;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--edp-border);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--edp-accent);
  text-decoration: none;
  background: #fff;
}
.edp-faq__related-link:hover {
  border-color: var(--edp-accent);
  background: rgba(0, 102, 204, 0.06);
}
.edp-faq__cta {
  text-align: center;
  padding: 2rem 1.5rem;
  background: var(--edp-bg);
  border-radius: var(--edp-radius);
  margin-top: 2rem;
}
.edp-faq__cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1.25rem;
}
.edp-faq__cta-primary,
.edp-faq__cta-secondary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
}
.edp-faq__cta-primary { background: var(--edp-accent); color: #fff; }
.edp-faq__cta-primary:hover { background: var(--edp-accent-hover); color: #fff; }
.edp-faq__cta-secondary {
  background: #fff;
  color: var(--edp-text);
  border: 1px solid var(--edp-border);
}
.edp-faq__cta-secondary:hover { border-color: var(--edp-accent); color: var(--edp-accent); }
`;
