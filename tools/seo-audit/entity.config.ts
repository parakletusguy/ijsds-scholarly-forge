/**
 * The canonical identity this site must present consistently, across every
 * page, for F_entity to score well. This is the "same name, same logo, same
 * sameAs array everywhere" rule from the portfolio-wide GEO spec — it's what
 * lets retrieval systems resolve IJSDS as one entity instead of a fragmented
 * guess, and lets it inherit authority from sibling Parakletus properties.
 *
 * Update this file, not the per-page code, when the canonical identity changes.
 */
export const CANONICAL_ENTITY = {
  name: "International Journal of Social Work and Development Studies",
  alternateName: "IJSDS",
  url: "https://ijsds.org",
  logo: "https://ijsds.org/Logo_Black_Edited-removebg-preview.png",
  sameAs: [
    // Fill in as accounts/profiles go live — every URL here should also list
    // ijsds.org back, so the entity graph is symmetric in both directions.
  ] as string[],
};

export const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
];
