/**
 * F_render — how much of the content a browser shows is actually present in
 * the raw HTML response. This is the factor that a CSR SPA fails hardest:
 * a React root div with a <script type="module"> scores ~0 here even if the
 * rendered page (post-JS) looks perfect.
 */
import type { FetchedPage } from "../fetchPage";
import type { FactorResult, PageType } from "../types";

const MIN_BODY_TEXT_CHARS: Record<PageType, number> = {
  article: 600, // title + abstract + author list, in real prose
  issue: 300,
  home: 200,
  listing: 200,
  generic: 150,
};

export function computeRender(page: FetchedPage, pageType: PageType): FactorResult {
  const { $ } = page;
  const evidence: string[] = [];
  let points = 0;
  const total = 4;

  const title = $("title").text().trim();
  if (title.length > 0) {
    points += 1;
    evidence.push(`<title> present (${title.length} chars)`);
  } else {
    evidence.push("<title> missing or empty");
  }

  const h1 = $("h1").first().text().trim();
  if (h1.length > 0) {
    points += 1;
    evidence.push(`<h1> present with text (${h1.length} chars)`);
  } else {
    evidence.push("<h1> missing or empty in raw HTML");
  }

  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";
  if (description.length > 50) {
    points += 1;
    evidence.push(`meta description present (${description.length} chars)`);
  } else {
    evidence.push("meta description missing or too short");
  }

  // Strip script/style before measuring visible text so an empty React root
  // plus a large inline script doesn't get miscounted as "content".
  const bodyClone = $("body").clone();
  bodyClone.find("script, style, noscript").remove();
  const bodyText = bodyClone.text().replace(/\s+/g, " ").trim();
  const threshold = MIN_BODY_TEXT_CHARS[pageType];
  if (bodyText.length >= threshold) {
    points += 1;
    evidence.push(`Body text in raw HTML: ${bodyText.length} chars (>= ${threshold} needed)`);
  } else {
    evidence.push(
      `Body text in raw HTML: only ${bodyText.length} chars (need ${threshold}) — content likely requires JS to render`,
    );
  }

  return { score: points / total, evidence };
}
