/**
 * F_freshness — is a modification/publication date present and parseable.
 * This pipeline has no history store, so it cannot verify the date reflects
 * an *actual* content change (that needs a diff against a prior crawl) —
 * it only verifies the signal exists and is a real date, and says so.
 */
import type { FetchedPage } from "../fetchPage";
import type { FactorResult } from "../types";

export function computeFreshness(page: FetchedPage): FactorResult {
  const { $ } = page;
  const evidence: string[] = [];

  const candidates = [
    $('meta[name="citation_publication_date"]').attr("content"),
    $('meta[property="article:modified_time"]').attr("content"),
    $('meta[property="article:published_time"]').attr("content"),
  ].filter(Boolean) as string[];

  let jsonLdDate: string | undefined;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        jsonLdDate = jsonLdDate ?? item.datePublished ?? item.dateModified;
      }
    } catch {
      /* ignore */
    }
  });
  if (jsonLdDate) candidates.push(jsonLdDate);

  if (candidates.length === 0) {
    return { score: 0, evidence: ["No publication/modified date found in meta tags or JSON-LD"] };
  }

  const validDate = candidates.find((c) => !isNaN(new Date(c).getTime()));
  if (validDate) {
    return {
      score: 1,
      evidence: [
        `Found parseable date: ${validDate}`,
        "Note: this only confirms the field exists and parses — verifying it tracks real content changes needs a crawl-history diff, not implemented here",
      ],
    };
  }

  return { score: 0.3, evidence: [`Found a date field but it doesn't parse: ${candidates[0]}`] };
}
