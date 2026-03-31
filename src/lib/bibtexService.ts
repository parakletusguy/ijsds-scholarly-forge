import { Article } from './articleService';

/**
 * Builds a BibTeX citation string from an IJSDS Article record and triggers
 * a browser download of the resulting .bib file.
 *
 * Pattern (per IJSDS_Indexing_Implementation_Plan.md §JavaScript: BibTeX Export Button):
 *  1. Define article metadata object (pulled dynamically from the CMS)
 *  2. Format the BibTeX string using template literals
 *  3. Create a Blob and trigger the download via a temporary <a> element
 *
 * Source: IJSDS Master Implementation Guide for Indexing & Discoverability
 */

export interface BibtexMetadata {
  id: string;          // e.g. "ijsds_2024_1234567"
  title: string;
  author: string;      // e.g. "Doe, John and Smith, Jane"
  journal: string;
  year: string;
  volume: string;
  number: string;
  pages: string;
  doi: string;
  url: string;
}

/**
 * Maps an Article from the CMS into a flat BibtexMetadata object.
 * Static field: journal title (never changes).
 * Dynamic fields: all others sourced from the Supabase `articles` table.
 */
export function buildBibtexMetadata(article: Article): BibtexMetadata {
  // --- Dynamic fields from CMS ---
  const year = article.publication_date
    ? new Date(article.publication_date).getFullYear().toString()
    : new Date().getFullYear().toString();

  const authorString =
    article.authors && article.authors.length > 0
      ? article.authors.map((a) => a.name).join(' and ')
      : '[INSERT DYNAMIC PATH FROM CMS]';

  const pages =
    article.page_start && article.page_end
      ? `${article.page_start}-${article.page_end}`
      : '';

  // Entry key: ijsds_{year}_{doi-suffix or id}
  const doiSuffix = article.doi
    ? article.doi.split('/').pop() ?? article.id
    : article.id;
  const entryId = `ijsds_${year}_${doiSuffix}`;

  // Canonical article URL on ijsds.org
  const articleUrl = `https://ijsds.org/article/${article.id}`;

  return {
    id: entryId,
    title: article.title,
    author: authorString,
    // --- Static field ---
    journal: 'International Journal of Social Work and Development Studies (IJSDS)',
    year,
    volume: article.volume ? String(article.volume) : '',
    number: article.issue ? String(article.issue) : '',
    pages,
    doi: article.doi ?? '',
    url: articleUrl,
  };
}

/**
 * Formats a BibtexMetadata object into a valid BibTeX @article entry string.
 * Uses template literals exactly as specified in the implementation plan.
 */
export function formatBibtex(metadata: BibtexMetadata): string {
  // Build optional fields only when values are present, to keep the file clean
  const optionalFields = [
    metadata.volume ? `  volume    = {${metadata.volume}},` : null,
    metadata.number ? `  number    = {${metadata.number}},` : null,
    metadata.pages  ? `  pages     = {${metadata.pages}},`  : null,
    metadata.doi    ? `  doi       = {${metadata.doi}},`    : null,
    metadata.url    ? `  url       = {${metadata.url}}`     : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `@article{${metadata.id},
  title     = {${metadata.title}},
  author    = {${metadata.author}},
  journal   = {${metadata.journal}},
  year      = {${metadata.year}},
${optionalFields}
}`;
}

/**
 * Main export function.
 * Builds the BibTeX string from an Article and triggers a .bib file download
 * in the browser using a Blob, exactly as specified in the implementation plan.
 *
 * Usage on an article page:
 *   <button onClick={() => downloadBibTeX(article)}>Export Citation (BibTeX)</button>
 */
export function downloadBibTeX(article: Article): void {
  // 1. Define article metadata (pulled dynamically from the CMS)
  const metadata = buildBibtexMetadata(article);

  // 2. Format the BibTeX string using template literals
  const bibtex = formatBibtex(metadata);

  // 3. Create and trigger the download via a Blob
  const blob = new Blob([bibtex], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${metadata.id}.bib`;
  link.click();

  // Clean up the object URL to free memory
  setTimeout(() => URL.revokeObjectURL(link.href), 10_000);
}
