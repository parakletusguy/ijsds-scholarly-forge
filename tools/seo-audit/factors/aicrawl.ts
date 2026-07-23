/**
 * F_aicrawl — are the GEO-relevant AI crawlers actually allowed in? This is
 * a strategic call, not a default: for a Global South visibility mission,
 * blocking GPTBot/ClaudeBot/PerplexityBot/Google-Extended/CCBot is
 * self-defeating, since LLM answer engines are a primary route by which this
 * research reaches audiences who query an assistant instead of a search box.
 */
import { isDisallowed } from "../fetchPage";
import { AI_CRAWLER_USER_AGENTS } from "../entity.config";
import type { FactorResult } from "../types";

export function computeAiCrawl(robotsTxt: string, path: string): FactorResult {
  const evidence: string[] = [];
  let allowedCount = 0;

  for (const ua of AI_CRAWLER_USER_AGENTS) {
    const blocked = isDisallowed(robotsTxt, ua, path);
    if (blocked) {
      evidence.push(`${ua} is disallowed on ${path}`);
    } else {
      allowedCount += 1;
    }
  }

  if (allowedCount === AI_CRAWLER_USER_AGENTS.length) {
    evidence.push(`All ${AI_CRAWLER_USER_AGENTS.length} tracked AI crawlers are allowed`);
  }

  return { score: allowedCount / AI_CRAWLER_USER_AGENTS.length, evidence };
}
