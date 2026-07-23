import type { RouteConfig } from "./types";

/**
 * Pilot route list for IJSDS. `--base` (see audit.ts) is prepended to each
 * path, so this works against a local `vite preview` server or the live
 * ijsds.org origin.
 *
 * IMPORTANT: replace ARTICLE_SLUG_PLACEHOLDER with a real published article
 * slug before running against production — a nonexistent slug will
 * correctly score G_gate = 0 (404), but that tells you nothing about the
 * actual article template's eligibility. Grab a real one from `/articles`.
 */
const ARTICLE_SLUG_PLACEHOLDER = "REPLACE-WITH-REAL-SLUG";

export const PILOT_ROUTES: RouteConfig[] = [
  { path: "/", pageType: "home" },
  { path: "/articles", pageType: "listing" },
  { path: `/article/${ARTICLE_SLUG_PLACEHOLDER}`, pageType: "article" },
];
