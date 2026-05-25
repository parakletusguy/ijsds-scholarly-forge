const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const buildArticleSlug = (article: { title: string; doi?: string | null; crossrefDoi?: string | null; id: string }) => {
  const titleSlug = slugify(article.title);
  const activeDoi = article.crossrefDoi || article.doi;
  if (activeDoi) {
    // Replace / with - so the slug is URL-safe (10.67007/ijsds-2026-... → 10.67007-ijsds-2026-...)
    const doiSlug = activeDoi.replace(/\//g, '-');
    return `${titleSlug}+${doiSlug}`;
  }
  return article.id;
};

export const extractDoiFromSlug = (slug: string): string | null => {
  // DOIs always start with 10. followed by 4+ digit registrant code
  const parts = slug.split('+');
  if (parts.length < 2) return null;
  
  const potentialDoi = parts.slice(1).join('+');
  if (potentialDoi.match(/^10\.\d{4,}/)) {
    // Reverse the first - back to / (assumes standard DOI format)
    return potentialDoi.replace('-', '/');
  }
  return null;
};
