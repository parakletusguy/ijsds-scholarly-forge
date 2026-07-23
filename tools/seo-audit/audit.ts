#!/usr/bin/env tsx
/**
 * CLI: audits every route in routes.ts against a running server (local
 * `vite preview` or a live origin), computes G_gate + every F_i, writes the
 * result to signals.db.json, and prints a report.
 *
 * Usage:
 *   npm run seo:audit -- --base http://localhost:4173
 *   npm run seo:audit -- --base https://ijsds.org
 */
import { fetchPage, fetchRobotsTxt } from "./fetchPage";
import { computeGate } from "./factors/gate";
import { computeRender } from "./factors/render";
import { computeSchema } from "./factors/schema";
import { computeSemantic } from "./factors/semantic";
import { computeAnswer } from "./factors/answer";
import { computeEntity } from "./factors/entity";
import { computeFreshness } from "./factors/freshness";
import { computeAiCrawl } from "./factors/aicrawl";
import { unmeasuredCwv, unmeasuredAuthority } from "./factors/unmeasured";
import { computeScore } from "./score";
import { upsertSignal } from "./db";
import { PILOT_ROUTES } from "./routes";
import type { FactorVector, PageAudit } from "./types";

function parseArgs() {
  const args = process.argv.slice(2);
  const baseIdx = args.indexOf("--base");
  const base = baseIdx >= 0 ? args[baseIdx + 1] : "http://localhost:4173";
  return { base };
}

async function auditRoute(base: string, route: (typeof PILOT_ROUTES)[number]): Promise<PageAudit> {
  const origin = new URL(base).origin;
  const url = new URL(route.path, base).toString();

  const [page, robotsTxt] = await Promise.all([fetchPage(url), fetchRobotsTxt(origin)]);

  const gate = computeGate(page, robotsTxt, route.path);

  const factors: FactorVector = {
    render: computeRender(page, route.pageType),
    cwv: unmeasuredCwv(),
    schema: computeSchema(page, route.pageType),
    semantic: computeSemantic(page),
    answer: computeAnswer(page),
    entity: computeEntity(page),
    authority: unmeasuredAuthority(),
    freshness: computeFreshness(page),
    aicrawl: computeAiCrawl(robotsTxt, route.path),
  };

  const { score, breakdown } = computeScore(gate, factors, route.pageType);

  return {
    url,
    pageType: route.pageType,
    computedAt: new Date().toISOString(),
    gate,
    factors,
    score,
    breakdown,
    httpStatus: page.status,
    htmlBytes: page.htmlBytes,
  };
}

function printReport(audit: PageAudit) {
  const gateLabel = audit.gate.pass ? "PASS" : "FAIL — score forced to 0";
  console.log(`\n${"=".repeat(70)}`);
  console.log(`${audit.url}  [${audit.pageType}]`);
  console.log(`${"=".repeat(70)}`);
  console.log(`G_gate: ${gateLabel}`);
  for (const check of audit.gate.checks) {
    console.log(`  ${check.pass ? "✓" : "✗"} ${check.label}${check.detail ? ` — ${check.detail}` : ""}`);
  }
  console.log(`\nS_page = ${audit.score.toFixed(3)}`);
  console.log(`\nFactor breakdown:`);
  for (const b of audit.breakdown) {
    console.log(`  F_${b.factor.padEnd(10)} score=${b.score.toFixed(2)}  weight=${b.weight.toFixed(2)}  contributes=${b.contribution.toFixed(3)}`);
  }
  const unmeasured = (Object.entries(audit.factors) as [string, any][]).filter(([, f]) => f.unmeasured);
  if (unmeasured.length > 0) {
    console.log(`\nUnmeasured (excluded from score, needs external data source): ${unmeasured.map(([id]) => id).join(", ")}`);
  }
  const aicrawl = audit.factors.aicrawl;
  console.log(`\nF_aicrawl (reported separately, not folded into S_page): ${aicrawl.score.toFixed(2)}`);
  for (const e of aicrawl.evidence) console.log(`  - ${e}`);
}

async function main() {
  const { base } = parseArgs();
  console.log(`Auditing ${PILOT_ROUTES.length} route(s) against ${base}\n`);

  for (const route of PILOT_ROUTES) {
    try {
      const audit = await auditRoute(base, route);
      upsertSignal(audit);
      printReport(audit);
    } catch (err: any) {
      console.error(`\nFailed to audit ${route.path}: ${err?.message ?? err}`);
    }
  }

  console.log(`\nWrote results to tools/seo-audit/signals.db.json`);
}

main();
