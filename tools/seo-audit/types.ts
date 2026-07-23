/**
 * Shared types for the SEO/GEO eligibility & competitiveness pipeline.
 *
 * Model (see README.md for the full writeup):
 *
 *   S_page = (Σ w_i · F_i) × G_gate
 *
 * G_gate is a binary pass/fail — if it's 0, S_page is 0 regardless of how
 * good every F_i scores. This file defines the shapes both halves produce.
 */

export type PageType =
  | "article" // ScholarlyArticle — IJSDS /article/:slug
  | "issue" // journal issue / archive listing
  | "home" // portfolio-entity home page
  | "listing" // generic index/search/filter page
  | "generic"; // anything else (about, contact, etc.)

/** Result of a single gate check. `pass: false` zeroes the whole page score. */
export interface GateCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

export interface GateResult {
  pass: boolean; // AND of every check
  checks: GateCheck[];
}

/** One scored factor, 0–1, plus the evidence used to compute it. */
export interface FactorResult {
  score: number; // 0..1
  evidence: string[];
  /** Set when the factor genuinely can't be computed from this pipeline
   *  (e.g. F_authority needs an external backlink API) instead of faking a number. */
  unmeasured?: boolean;
}

export type FactorId =
  | "render"
  | "cwv"
  | "schema"
  | "semantic"
  | "answer"
  | "entity"
  | "authority"
  | "freshness"
  | "aicrawl";

export type FactorVector = Record<FactorId, FactorResult>;

export interface WeightProfile {
  pageType: PageType;
  weights: Record<FactorId, number>; // should sum to 1.0 across *measured* factors
}

export interface PageAudit {
  url: string;
  pageType: PageType;
  computedAt: string; // ISO timestamp
  gate: GateResult;
  factors: FactorVector;
  score: number; // final S_page, 0..1
  breakdown: { factor: FactorId; weight: number; score: number; contribution: number }[];
  httpStatus: number;
  htmlBytes: number;
}

export interface RouteConfig {
  path: string; // path relative to --base, e.g. "/article/some-slug"
  pageType: PageType;
  /** Only used by F_entity to check org name / sameAs consistency, optional per-route. */
  expectCanonicalHost?: string;
}
