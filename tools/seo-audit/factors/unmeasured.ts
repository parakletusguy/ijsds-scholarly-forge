/**
 * F_cwv and F_authority both need data this pipeline doesn't have access to:
 *
 * - F_cwv (Core Web Vitals: LCP/CLS/INP) needs real-user or lab performance
 *   measurement (Lighthouse/CrUX/PageSpeed Insights API) against a deployed
 *   URL — not something a plain HTML fetch can compute.
 * - F_authority (backlinks/citations/mentions on other domains) needs an
 *   external index (Ahrefs, Google Search Console, Semrush) — it is, by
 *   definition, the one factor this pipeline cannot generate itself.
 *
 * Rather than fabricate a plausible-looking number for either, both are
 * marked `unmeasured: true` and excluded from the weighted score entirely
 * (see score.ts) until a real data source is wired in. A fake 0.7 here would
 * be worse than no number: it would hide exactly the gap the model is
 * supposed to expose.
 */
import type { FactorResult } from "../types";

export function unmeasuredCwv(): FactorResult {
  return {
    score: 0,
    unmeasured: true,
    evidence: ["Not computed — wire in PageSpeed Insights API or Lighthouse CI against a deployed URL"],
  };
}

export function unmeasuredAuthority(): FactorResult {
  return {
    score: 0,
    unmeasured: true,
    evidence: ["Not computed — needs an external backlink data source (Search Console, Ahrefs, Semrush)"],
  };
}
