/**
 * G_gate — binary. Any failure here zeroes S_page regardless of every F_i.
 * This is deliberately the first thing computed and the loudest thing
 * reported: optimizing factors while this is silently 0 is the single most
 * common way these projects fail in practice.
 */
import type { FetchedPage } from "../fetchPage";
import { isDisallowed } from "../fetchPage";
import type { GateResult, GateCheck } from "../types";

export function computeGate(
  page: FetchedPage,
  robotsTxt: string,
  path: string,
): GateResult {
  const { status, $ } = page;
  const checks: GateCheck[] = [];

  checks.push({
    id: "status_200",
    label: "Returns 200 to a bot UA with JS disabled",
    pass: status === 200,
    detail: `HTTP ${status}`,
  });

  const disallowedForGooglebot = isDisallowed(robotsTxt, "googlebot", path);
  checks.push({
    id: "robots_allow",
    label: "Not blocked by robots.txt",
    pass: !disallowedForGooglebot,
    detail: disallowedForGooglebot ? `Disallowed for Googlebot on ${path}` : undefined,
  });

  const metaRobots = $('meta[name="robots"]').attr("content")?.toLowerCase() ?? "";
  const hasNoindex = metaRobots.includes("noindex");
  checks.push({
    id: "no_noindex",
    label: "No noindex directive present",
    pass: !hasNoindex,
    detail: hasNoindex ? `<meta name="robots" content="${metaRobots}">` : undefined,
  });

  const canonicalHref = $('link[rel="canonical"]').attr("href");
  let canonicalOk = false;
  let canonicalDetail: string | undefined;
  if (!canonicalHref) {
    canonicalDetail = "No <link rel=\"canonical\"> present";
  } else {
    try {
      const canonicalUrl = new URL(canonicalHref, page.url);
      const requestedUrl = new URL(page.url);
      canonicalOk = canonicalUrl.pathname.replace(/\/$/, "") === requestedUrl.pathname.replace(/\/$/, "");
      if (!canonicalOk) canonicalDetail = `Canonical points to ${canonicalUrl.pathname}, not self`;
    } catch {
      canonicalDetail = `Unparseable canonical href: ${canonicalHref}`;
    }
  }
  checks.push({
    id: "canonical_self",
    label: "Canonical resolves to self",
    pass: canonicalOk,
    detail: canonicalDetail,
  });

  return { pass: checks.every((c) => c.pass), checks };
}
