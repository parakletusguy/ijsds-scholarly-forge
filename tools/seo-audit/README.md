# SEO/GEO eligibility & competitiveness pipeline (IJSDS pilot)

## What this is not

No algorithm — not this one, not an agency's, not Google's own guidance —
makes a page rank first. Ranking position is the output of a proprietary ML
system competing your page against every other page chasing the same query.
That part is not engineerable and nothing here claims to do it.

## What this is

What *is* engineerable is **eligibility and competitiveness**: removing
every reason a crawler or retrieval system would skip, downrank, or fail to
cite this page. This pipeline scores that, per page:

```
S_page = (Σ w_i · F_i) × G_gate
```

- **`F_i`** — nine individual signals, scored 0–1, in `factors/`.
- **`w_i`** — per-page-type weights in `weights.ts` (an article page weights
  `F_answer`/`F_render`/`F_schema` highest; a home page weights `F_entity`
  highest, etc).
- **`G_gate`** — a **binary gate, not a weight**. If the page fails
  crawlability basics (non-200 status, robots.txt block, `noindex`, a
  canonical that doesn't resolve to itself), `G_gate = 0` and `S_page = 0`
  regardless of how well every `F_i` scores. This is the check most teams
  skip while polishing everything else — see `factors/gate.ts`.

Two factors — `F_cwv` (Core Web Vitals) and `F_authority` (backlinks) —
**cannot be computed by this pipeline** (they need PageSpeed Insights /
Lighthouse and an external backlink index respectively). They're marked
`unmeasured: true` and excluded from the weighted sum rather than faked; see
`factors/unmeasured.ts` for why a fabricated number would be worse than none.

`F_aicrawl` (are GPTBot/ClaudeBot/PerplexityBot/Google-Extended/CCBot
allowed by robots.txt) is reported and CI-checked on its own rather than
folded into the weighted score — it's a policy switch, not a quality score.

## The finding that motivated this pilot

IJSDS is a Vite CSR React SPA (`index.html` ships `<div id="root">` + a
module script; `vite build` produces no server-rendered HTML). Per-article
metadata (Highwire `citation_*` tags, JSON-LD) is already built — see the
`Helmet` usage in `src/pages/ArticleInfo.tsx` — but it only exists once React
mounts in a browser. A plain HTTP fetch (which is what Scholarbot and most
GPTBot/ClaudeBot passes actually do — no JS execution) sees the same generic
`Periodical` JSON-LD from `index.html` on every route, never the per-article
`ScholarlyArticle` data. That's `G_gate` failing for every `/article/:slug`
page today, independent of every other factor. Run the audit below against a
built preview to see it directly.

## Running it

```bash
# 1. Build and serve the production bundle locally (this is what a crawler sees)
npm run build
npm run preview   # serves on http://localhost:4173 by default

# 2. In another terminal, run the audit
npm run seo:audit -- --base http://localhost:4173

# 3. Or run just the CI gate (no full report, just pass/fail)
npm run seo:ci-gate -- --base http://localhost:4173
```

Before running against a real article page, edit `routes.ts` and replace
`ARTICLE_SLUG_PLACEHOLDER` with a real published article slug (grab one from
`/articles`) — auditing a 404 correctly scores `G_gate = 0`, but tells you
nothing about the actual template's eligibility once content exists.

Results persist to `signals.db.json` (a flat JSON file, not a real database
by design — see the comment at the top of `db.ts` for why, and how to swap
in Postgres/SQLite later without touching any factor code).

## Wiring into CI

Add a step after the production build:

```yaml
- run: npm run build
- run: npm run preview & npx wait-on http://localhost:4173
- run: npm run seo:ci-gate -- --base http://localhost:4173
```

The gate (see `ci-gate.ts`) fails the job (`exit 1`) if any route's
`G_gate` fails or `F_schema < 1.0`; it warns (non-blocking) if
`F_render < 0.9`. This is the piece that makes the pipeline durable instead
of decorative — without it, the first page shipped under deadline pressure
bypasses everything above.

## Extending to other Parakletus properties

This pilot is scoped to IJSDS to validate the model on its clearest
content-type (papers) before rolling out further. The parts that are
already portable as-is: `fetchPage.ts`, `factors/gate.ts`,
`factors/render.ts`, `factors/semantic.ts`, `factors/answer.ts`,
`factors/aicrawl.ts`, `score.ts`, `db.ts`. The parts that need a per-site
variant: `weights.ts` (page-type weight bias differs — a SaaS product page
weights `FAQPage` presence, not `ScholarlyArticle` fields),
`factors/schema.ts`'s `REQUIRED_FIELDS` map (per-site-type JSON-LD shape:
`SoftwareApplication` for ParaLearn/SabiNote, `Product` for the storefronts,
`Book` for Parakletus Publishing), and `entity.config.ts` (each site's own
canonical name/logo, but sharing one `sameAs` array across all of them so
the entity graph resolves as one organization rather than eight).

This maps to the `@parakletus/seo-core` shared-package structure discussed
for the wider portfolio — this directory is effectively that package's first
draft, scoped to one site until the model's validated here.
