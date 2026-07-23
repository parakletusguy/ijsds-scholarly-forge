/**
 * F_entity — organization/author identity consistency. Retrieval systems
 * resolve "is this the same entity as that other page" largely off exact
 * name strings and `sameAs` links; drift here fragments the entity graph
 * across the Parakletus portfolio instead of letting sites inherit authority
 * from each other.
 */
import type { FetchedPage } from "../fetchPage";
import type { FactorResult } from "../types";
import { CANONICAL_ENTITY } from "../entity.config";

export function computeEntity(page: FetchedPage): FactorResult {
  const { $ } = page;
  const evidence: string[] = [];
  let points = 0;
  const total = 3;

  const blocks: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      blocks.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      /* invalid JSON-LD is already flagged by F_schema */
    }
  });

  const orgLike = blocks.find(
    (b) => b["@type"] === "Organization" || b?.publisher?.name || b?.isPartOf?.isPartOf?.publisher?.name,
  );
  const foundName =
    orgLike?.name ?? orgLike?.publisher?.name ?? orgLike?.isPartOf?.isPartOf?.publisher?.name;

  if (foundName === CANONICAL_ENTITY.name || foundName === CANONICAL_ENTITY.alternateName) {
    points += 1;
    evidence.push(`Organization name matches canonical entity: "${foundName}"`);
  } else if (foundName) {
    evidence.push(
      `Organization name "${foundName}" does not match canonical "${CANONICAL_ENTITY.name}" — entity graph will fragment`,
    );
  } else {
    evidence.push("No organization/publisher name found in structured data");
  }

  const ogSiteName = $('meta[property="og:site_name"]').attr("content");
  if (ogSiteName === CANONICAL_ENTITY.name || ogSiteName === CANONICAL_ENTITY.alternateName) {
    points += 1;
    evidence.push(`og:site_name matches canonical entity: "${ogSiteName}"`);
  } else {
    evidence.push(
      ogSiteName
        ? `og:site_name "${ogSiteName}" does not match canonical name`
        : "No og:site_name meta tag present",
    );
  }

  const sameAs: string[] = orgLike?.sameAs ?? [];
  if (CANONICAL_ENTITY.sameAs.length === 0) {
    // Nothing configured yet to check against — don't penalize, but flag it.
    evidence.push("CANONICAL_ENTITY.sameAs is empty in entity.config.ts — add sibling profile URLs to enable this check");
    points += 1;
  } else if (CANONICAL_ENTITY.sameAs.every((url) => sameAs.includes(url))) {
    points += 1;
    evidence.push("sameAs array includes all configured sibling identities");
  } else {
    evidence.push("sameAs array is missing one or more configured sibling identities");
  }

  return { score: points / total, evidence };
}
