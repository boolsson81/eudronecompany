/**
 * Pure (no React) FAQPage JSON-LD builder.
 * Re-exported from src/components/FaqSection.tsx for backwards compatibility.
 *
 * Sanitization (prevents Rich Results Test warnings):
 *  - strips HTML tags from `question` and `answer`
 *  - decodes the most common HTML entities
 *  - collapses whitespace and trims
 *  - drops items with empty question or answer
 *  - dedupes by question (case-insensitive)
 *  - returns `null` when no valid items remain
 */

export interface FaqItem {
  question: string;
  answer: string;
}

function sanitizeText(input: string | undefined | null): string {
  if (!input) return "";
  return String(input)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function faqJsonLd(items: FaqItem[] | undefined | null): Record<string, unknown> | null {
  if (!items || items.length === 0) return null;

  const seen = new Set<string>();
  const mainEntity: Record<string, unknown>[] = [];

  for (const raw of items) {
    const question = sanitizeText(raw?.question);
    const answer = sanitizeText(raw?.answer);
    if (!question || !answer) continue;

    const key = question.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    mainEntity.push({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    });
  }

  if (mainEntity.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}
