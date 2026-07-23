#!/usr/bin/env tsx
/**
 * CI gate — the piece that makes this durable instead of decorative.
 * Without a build-blocking check, the first deadline-pressured page ship
 * bypasses everything above. With it, it can't reach production.
 *
 *   FAIL  G_gate == 0            → "page not crawlable"
 *   FAIL  F_schema < 1.0         → "invalid or missing structured data"
 *   WARN  F_render < 0.9         → "content depends on client JS"
 *
 * Usage: npm run seo:ci-gate -- --base http://localhost:4173
 * Exit code 1 on any FAIL (fails the CI job); 0 otherwise (warnings still print).
 */
import { fetchPage, fetchRobotsTxt } from "./fetchPage";
import { computeGate } from "./factors/gate";
import { computeRender } from "./factors/render";
import { computeSchema } from "./factors/schema";
import { PILOT_ROUTES } from "./routes";

function parseArgs() {
  const args = process.argv.slice(2);
  const baseIdx = args.indexOf("--base");
  const base = baseIdx >= 0 ? args[baseIdx + 1] : "http://localhost:4173";
  return { base };
}

async function main() {
  const { base } = parseArgs();
  let hasFailure = false;
  let hasWarning = false;

  console.log(`CI SEO/GEO gate — checking ${PILOT_ROUTES.length} route(s) against ${base}\n`);

  for (const route of PILOT_ROUTES) {
    const url = new URL(route.path, base).toString();
    let page;
    let robotsTxt: string;
    try {
      [page, robotsTxt] = await Promise.all([fetchPage(url), fetchRobotsTxt(new URL(base).origin)]);
    } catch (err: any) {
      console.error(`FAIL ${route.path}: could not fetch — ${err?.message ?? err}`);
      hasFailure = true;
      continue;
    }

    const gate = computeGate(page, robotsTxt, route.path);
    if (!gate.pass) {
      hasFailure = true;
      console.error(`FAIL ${route.path}: page not crawlable`);
      for (const check of gate.checks.filter((c) => !c.pass)) {
        console.error(`  ✗ ${check.label}${check.detail ? ` — ${check.detail}` : ""}`);
      }
      continue; // no point checking schema/render if the gate already failed
    }

    const schema = computeSchema(page, route.pageType);
    if (schema.score < 1.0) {
      hasFailure = true;
      console.error(`FAIL ${route.path}: invalid or missing structured data (F_schema=${schema.score.toFixed(2)})`);
      for (const e of schema.evidence) console.error(`  - ${e}`);
    }

    const render = computeRender(page, route.pageType);
    if (render.score < 0.9) {
      hasWarning = true;
      console.warn(`WARN ${route.path}: content depends on client JS (F_render=${render.score.toFixed(2)})`);
      for (const e of render.evidence) console.warn(`  - ${e}`);
    }

    if (gate.pass && schema.score >= 1.0 && render.score >= 0.9) {
      console.log(`PASS ${route.path}`);
    }
  }

  console.log("");
  if (hasFailure) {
    console.error("SEO/GEO gate: FAILED — see above.");
    // Set exitCode (not process.exit()) so Node drains the event loop and
    // closes fetch's keep-alive sockets normally — calling process.exit()
    // here while a keep-alive socket is still open crashes libuv on Windows.
    process.exitCode = 1;
    return;
  }
  if (hasWarning) {
    console.warn("SEO/GEO gate: passed with warnings.");
  } else {
    console.log("SEO/GEO gate: all checks passed.");
  }
}

main();
