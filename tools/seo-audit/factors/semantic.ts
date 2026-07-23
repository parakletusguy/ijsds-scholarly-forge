/**
 * F_semantic — heading hierarchy integrity and real-markup usage. Chunkers
 * (the systems that split a page into passages for retrieval) use heading
 * structure as split boundaries and treat <table>/<dl> as fact-bearing;
 * a <div class="text-2xl font-bold"> styled to look like a heading is
 * invisible to them, and this factor penalizes that pattern.
 */
import type { FetchedPage } from "../fetchPage";
import type { FactorResult } from "../types";

export function computeSemantic(page: FetchedPage): FactorResult {
  const { $ } = page;
  const evidence: string[] = [];
  let points = 0;
  const total = 4;

  const h1Count = $("h1").length;
  if (h1Count === 1) {
    points += 1;
    evidence.push("Exactly one <h1> (correct)");
  } else {
    evidence.push(`Found ${h1Count} <h1> elements (want exactly 1)`);
  }

  const h2Count = $("h2").length;
  if (h2Count >= 1) {
    points += 1;
    evidence.push(`${h2Count} <h2> section heading(s) present`);
  } else {
    evidence.push("No <h2> section headings found");
  }

  const hasLandmark = $("main, article").length > 0;
  if (hasLandmark) {
    points += 1;
    evidence.push("Has a <main> or <article> landmark");
  } else {
    evidence.push("No <main> or <article> landmark element");
  }

  // Reward real data markup where the page has any tabular-looking content;
  // a page with none of these isn't penalized (not every page needs a table).
  const hasRealTable = $("table th, table td").length > 0;
  const hasDefinitionList = $("dl dt, dl dd").length > 0;
  const hasDivGrid = $('[class*="grid"]').filter((_, el) => $(el).find("table").length === 0).length > 3;
  if (hasRealTable || hasDefinitionList) {
    points += 1;
    evidence.push(
      hasRealTable ? "Uses real <table> markup for data" : "Uses real <dl> for term/value pairs",
    );
  } else if (hasDivGrid) {
    evidence.push("Heavy div-grid usage with no real <table>/<dl> found — likely fact data rendered as styled divs");
  } else {
    // Neutral: no data-shaped content on this page at all.
    points += 1;
  }

  return { score: points / total, evidence };
}
