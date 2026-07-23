/**
 * Fetches a URL exactly the way a non-JS crawler would: plain fetch, no
 * browser, no JS execution. This is the honest measurement — if content only
 * shows up after React mounts, it will NOT show up here, which is the point.
 */
import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

// A generic, well-behaved bot UA. Not impersonating a specific crawler —
// the point is "does this page work without JS", which is UA-independent
// for any fetch-based retriever (Googlebot's first pass, GPTBot, ClaudeBot, etc).
const BOT_USER_AGENT =
  "Mozilla/5.0 (compatible; ParakletusSEOAudit/1.0; +https://ijsds.org/seo-audit)";

export interface FetchedPage {
  url: string;
  status: number;
  html: string;
  htmlBytes: number;
  $: CheerioAPI;
}

export async function fetchPage(url: string): Promise<FetchedPage> {
  const res = await fetch(url, {
    headers: { "User-Agent": BOT_USER_AGENT, Accept: "text/html" },
    redirect: "follow",
  });
  const html = await res.text();
  return {
    url,
    status: res.status,
    html,
    htmlBytes: Buffer.byteLength(html, "utf-8"),
    $: cheerio.load(html),
  };
}

let robotsCache: Map<string, string> | null = null;
let robotsCacheOrigin: string | null = null;

/** Fetches and caches robots.txt for the given origin (once per audit run). */
export async function fetchRobotsTxt(origin: string): Promise<string> {
  if (robotsCacheOrigin === origin && robotsCache) {
    return robotsCache.get(origin) ?? "";
  }
  try {
    const res = await fetch(new URL("/robots.txt", origin).toString(), {
      headers: { "User-Agent": BOT_USER_AGENT },
    });
    const text = res.ok ? await res.text() : "";
    robotsCache = new Map([[origin, text]]);
    robotsCacheOrigin = origin;
    return text;
  } catch {
    return "";
  }
}

/**
 * Minimal robots.txt group parser: is `path` disallowed for `userAgent`?
 * Falls back to the `*` group when no exact UA group matches. Good enough
 * for the gate check — not a full RFC 9309 implementation.
 */
export function isDisallowed(
  robotsTxt: string,
  userAgent: string,
  path: string,
): boolean {
  const lines = robotsTxt.split(/\r?\n/).map((l) => l.trim());
  const groups: { agents: string[]; rules: { type: "allow" | "disallow"; path: string }[] }[] = [];
  let current: (typeof groups)[number] | null = null;

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if (key === "allow" && current) {
      current.rules.push({ type: "allow", path: value });
    } else if (key === "disallow" && current) {
      current.rules.push({ type: "disallow", path: value });
    }
  }

  const matchesUA = (agents: string[]) =>
    agents.includes(userAgent.toLowerCase()) || agents.includes("*");

  const relevantGroups =
    groups.filter((g) => g.agents.includes(userAgent.toLowerCase())).length > 0
      ? groups.filter((g) => g.agents.includes(userAgent.toLowerCase()))
      : groups.filter((g) => g.agents.includes("*"));

  for (const group of relevantGroups) {
    for (const rule of group.rules) {
      if (rule.path === "") continue; // "Disallow:" empty = allow all
      if (path.startsWith(rule.path)) {
        return rule.type === "disallow";
      }
    }
  }
  return false;
}
