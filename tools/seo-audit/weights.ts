/**
 * Per-page-type weight profiles (w_i in S_page = (Σ w_i · F_i) × G_gate).
 *
 * Weights for `cwv` and `authority` are set here for completeness, but
 * score.ts excludes any factor marked `unmeasured` from the actual weighted
 * sum and renormalizes across what WAS measured — so these numbers describe
 * "how much this would matter once measured," not a live contribution today.
 */
import type { FactorId, PageType, WeightProfile } from "./types";

const ARTICLE: Record<FactorId, number> = {
  render: 0.2,
  cwv: 0.1,
  schema: 0.18,
  semantic: 0.12,
  answer: 0.18,
  entity: 0.07,
  authority: 0.1,
  freshness: 0.05,
  aicrawl: 0,
};

const ISSUE: Record<FactorId, number> = {
  render: 0.22,
  cwv: 0.1,
  schema: 0.15,
  semantic: 0.15,
  answer: 0.1,
  entity: 0.08,
  authority: 0.1,
  freshness: 0.1,
  aicrawl: 0,
};

const HOME: Record<FactorId, number> = {
  render: 0.15,
  cwv: 0.12,
  schema: 0.15,
  semantic: 0.1,
  answer: 0.08,
  entity: 0.2,
  authority: 0.15,
  freshness: 0.05,
  aicrawl: 0,
};

const LISTING: Record<FactorId, number> = {
  render: 0.25,
  cwv: 0.12,
  schema: 0.08,
  semantic: 0.15,
  answer: 0.1,
  entity: 0.05,
  authority: 0.1,
  freshness: 0.15,
  aicrawl: 0,
};

const GENERIC: Record<FactorId, number> = {
  render: 0.2,
  cwv: 0.15,
  schema: 0.1,
  semantic: 0.15,
  answer: 0.1,
  entity: 0.1,
  authority: 0.15,
  freshness: 0.05,
  aicrawl: 0,
};

// aicrawl is a gate-adjacent factor (allow AI crawlers or don't) — it's
// reported and CI-checked on its own rather than folded into the weighted
// average, so every profile above weights it 0 by design. See ci-gate.ts.
export const WEIGHT_PROFILES: Record<PageType, WeightProfile> = {
  article: { pageType: "article", weights: ARTICLE },
  issue: { pageType: "issue", weights: ISSUE },
  home: { pageType: "home", weights: HOME },
  listing: { pageType: "listing", weights: LISTING },
  generic: { pageType: "generic", weights: GENERIC },
};
