/**
 * F_answer — does the opening of the page's main content directly answer
 * an implied query, front-loaded (claim → method/detail), rather than easing
 * in with throat-clearing? LLM retrievers disproportionately cite the first
 * 2-3 sentences of a retrieved passage, so this is weighted highest for GEO.
 *
 * This is necessarily heuristic — there is no public formula for "answer
 * quality". Treat this factor as a lint, not a ground truth.
 */
import type { FetchedPage } from "../fetchPage";
import type { FactorResult } from "../types";

const WEAK_OPENERS = [
  /^welcome to/i,
  /^this (page|article|site) (is|shows|discusses)/i,
  /^as (mentioned|discussed|shown) (above|previously|earlier)/i,
  /^in this (article|section|page)/i,
  /^click here/i,
];

export function computeAnswer(page: FetchedPage): FactorResult {
  const { $ } = page;
  const evidence: string[] = [];
  let points = 0;
  const total = 3;

  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const bodyClone = $("body").clone();
  bodyClone.find("script, style, noscript, nav, header, footer").remove();
  const firstParagraph =
    $("article p, main p").first().text().trim() ||
    bodyClone.find("p").first().text().trim();

  const answerText = description || firstParagraph;
  if (!answerText) {
    return {
      score: 0,
      evidence: ["No meta description or leading paragraph text found in raw HTML to evaluate"],
    };
  }

  const len = answerText.length;
  if (len >= 120 && len <= 300) {
    points += 1;
    evidence.push(`Opening content length is ${len} chars (in the 120-300 sweet spot)`);
  } else {
    evidence.push(`Opening content length is ${len} chars (outside the 120-300 sweet spot)`);
  }

  const hasWeakOpener = WEAK_OPENERS.some((re) => re.test(answerText.trim()));
  if (!hasWeakOpener) {
    points += 1;
    evidence.push("No throat-clearing opener detected");
  } else {
    evidence.push("Opens with a context-dependent phrase (e.g. \"as discussed above\") — won't stand alone as a retrieved chunk");
  }

  const referencesPriorContext = /\b(above|previously|earlier|this shows|as such)\b/i.test(
    firstParagraph.slice(0, 200),
  );
  if (!referencesPriorContext) {
    points += 1;
    evidence.push("First paragraph reads as self-contained");
  } else {
    evidence.push("First paragraph references context outside itself — won't make sense retrieved in isolation");
  }

  return { score: points / total, evidence };
}
