/**
 * F_schema — JSON-LD present, parseable, and carrying the fields the page
 * type actually needs. A page can have *a* JSON-LD block and still fail this
 * if it's the wrong @type or missing required fields (e.g. IJSDS's current
 * portfolio-wide `Periodical` block on every article route: present, valid
 * JSON, wrong shape for a ScholarlyArticle page).
 */
import type { FetchedPage } from "../fetchPage";
import type { FactorResult, PageType } from "../types";

const REQUIRED_FIELDS: Partial<Record<PageType, { type: string; fields: string[] }>> = {
  article: {
    type: "ScholarlyArticle",
    fields: ["headline", "datePublished", "author", "isPartOf", "identifier"],
  },
  issue: {
    type: "PublicationIssue",
    fields: ["issueNumber", "isPartOf"],
  },
  home: {
    type: "Organization",
    fields: ["name", "url"],
  },
};

export function computeSchema(page: FetchedPage, pageType: PageType): FactorResult {
  const { $ } = page;
  const evidence: string[] = [];
  const blocks: any[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    try {
      const parsed = JSON.parse(raw);
      blocks.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      evidence.push("Found a JSON-LD block that fails to parse as JSON");
    }
  });

  if (blocks.length === 0) {
    return { score: 0, evidence: ["No JSON-LD structured data found"] };
  }
  evidence.push(`Found ${blocks.length} JSON-LD block(s): ${blocks.map((b) => b["@type"]).join(", ")}`);

  const requirement = REQUIRED_FIELDS[pageType];
  if (!requirement) {
    // No specific schema requirement configured for this page type — presence
    // of *any* valid JSON-LD is treated as a pass.
    return { score: 1, evidence };
  }

  const match = blocks.find((b) => b["@type"] === requirement.type);
  if (!match) {
    evidence.push(`No block with @type "${requirement.type}" found for a ${pageType} page`);
    return { score: 0, evidence };
  }

  const missing = requirement.fields.filter((f) => match[f] === undefined || match[f] === null || match[f] === "");
  if (missing.length > 0) {
    evidence.push(`"${requirement.type}" block is missing: ${missing.join(", ")}`);
  } else {
    evidence.push(`"${requirement.type}" block has all required fields: ${requirement.fields.join(", ")}`);
  }

  return {
    score: (requirement.fields.length - missing.length) / requirement.fields.length,
    evidence,
  };
}
