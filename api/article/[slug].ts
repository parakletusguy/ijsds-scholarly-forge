// Server-renders the <head> of the article page for Google Scholar and search bots.
//
// Google Scholar's crawler does not execute JavaScript, so it cannot read citation
// metadata from the React app. This function serves the normal SPA shell with Highwire Press
// and Dublin Core tags injected into <head>, so crawlers read raw HTML tags.

const API_URL =
  process.env.VITE_API_URL ||
  'https://ijsds-database-ftb5hpfrfecegtbz.switzerlandnorth-01.azurewebsites.net';

const SITE_URL = 'https://www.ijsds.org';
const JOURNAL_TITLE = 'International Journal of Social Work and Development Studies';
const PUBLISHER = 'Rivers State University';

/**
 * Escapes characters for HTML attribute values enclosed in double quotes.
 * NOTE: Single quote/apostrophe (') is intentionally NOT escaped to &apos;
 * because Google Scholar indexes the literal attribute value string, and
 * escaping &apos; breaks title and author string matching.
 */
const esc = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Strips academic credentials, degrees, and honorary prefixes from an author name.
 */
const cleanDegreeAndTitles = (name: unknown): string => {
  if (!name) return '';
  return String(name)
    .replace(/\s*\((?:PhD|Ph\.D\.|MSc|M\.Sc\.|BSc|B\.Sc\.|MD|Esq\.|BL)\)/gi, '')
    .replace(/\b(?:Dr\.|Prof\.|Professor|Engr\.|Rev\.|Mr\.|Mrs\.|Ms\.)\s+/gi, '')
    .replace(/,\s*(?:PhD|Ph\.D\.|MSc|M\.Sc\.|BSc|B\.Sc\.|MD|Esq\.|BL)\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/[,\s]+$/, '')
    .trim();
};

/**
 * Cleans titles for Google Scholar: unescapes HTML entities, normalizes spacing,
 * and fixes ALL-CAPS titles.
 */
const cleanTitleForScholar = (title: unknown): string => {
  if (!title) return '';
  let cleaned = String(title)
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

  // If title is ALL CAPS, convert to title case
  const letters = cleaned.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 5 && letters === letters.toUpperCase()) {
    cleaned = cleaned
      .toLowerCase()
      .split(' ')
      .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
      .join(' ');
  }

  return cleaned;
};

/**
 * Formats author names into Highwire Press standard: "LastName, FirstName"
 * Strips titles and ensures zero trailing commas.
 */
interface FormattedAuthor {
  formattedName: string;
  affiliation: string;
}

const formatAuthorsForScholar = (rawAuthors: unknown): FormattedAuthor[] => {
  if (!rawAuthors) return [];
  const authorsList = Array.isArray(rawAuthors) ? rawAuthors : [rawAuthors];

  return authorsList
    .map((author: any) => {
      let rawName = '';
      let affiliation = '';

      if (typeof author === 'string') {
        rawName = author;
      } else if (typeof author === 'object' && author !== null) {
        affiliation = String(author.affiliation ?? author.institution ?? '').trim();
        const firstName = String(author.firstName ?? author.first_name ?? author.given ?? '').trim();
        const lastName = String(author.lastName ?? author.last_name ?? author.family ?? author.surname ?? '').trim();

        if (firstName && lastName) {
          rawName = `${lastName}, ${firstName}`;
        } else if (lastName && !firstName) {
          rawName = lastName;
        } else if (author.name) {
          rawName = String(author.name).trim();
        }
      }

      let cleaned = cleanDegreeAndTitles(rawName);
      if (!cleaned) return null;

      let formattedName = cleaned;
      if (cleaned.includes(',')) {
        const parts = cleaned.split(',').map((p) => p.trim()).filter(Boolean);
        formattedName = parts.join(', ');
      } else {
        const parts = cleaned.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          const last = parts[parts.length - 1];
          const firstRest = parts.slice(0, -1).join(' ');
          formattedName = `${last}, ${firstRest}`;
        }
      }

      // Guard against trailing commas
      formattedName = formattedName.replace(/[,\s]+$/, '').trim();

      return {
        formattedName,
        affiliation,
      };
    })
    .filter((a): a is FormattedAuthor => a !== null && a.formattedName.length > 0);
};

const formatScholarDate = (value: unknown): string => {
  if (!value) return '';
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

const hasValidPdf = (article: any): boolean => {
  if (!article) return false;
  if (Array.isArray(article.file_versions) && article.file_versions.length > 0) {
    const publishedPdf = article.file_versions.find(
      (f: any) =>
        !f.is_archived &&
        (f.file_type === 'application/pdf' || String(f.file_url || '').toLowerCase().includes('.pdf')),
    );
    if (publishedPdf?.file_url) return true;
  }
  const raw = String(article.manuscript_file_url || '');
  return raw.toLowerCase().includes('.pdf');
};

const extractDoiFromSlug = (slug: string): string | null => {
  const parts = slug.split('+');
  if (parts.length < 2) return null;
  const potentialDoi = parts.slice(1).join('+');
  if (/^10\.\d{4,}/.test(potentialDoi)) {
    return potentialDoi.replace('-', '/');
  }
  return null;
};

const fetchArticle = async (slug: string) => {
  const doi = extractDoiFromSlug(slug);

  let found: any = null;

  // 1. Try finding by DOI query
  if (doi) {
    try {
      const res = await fetch(`${API_URL}/api/articles?doi=${encodeURIComponent(doi)}`);
      const body = await res.json();
      if (body?.success && Array.isArray(body.data) && body.data.length > 0) {
        found = body.data[0];
      }
    } catch {}
  }

  // 2. Try UUID in slug
  if (!found) {
    const uuidMatch = slug.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (uuidMatch) {
      try {
        const res = await fetch(`${API_URL}/api/articles/${uuidMatch[1]}`);
        const body = await res.json();
        if (body?.success && body.data) found = body.data;
      } catch {}
    }
  }

  // 3. Fallback: Search all published articles if DOI or slug didn't match immediately
  if (!found) {
    try {
      const res = await fetch(`${API_URL}/api/articles?status=published`);
      const body = await res.json();
      if (body?.success && Array.isArray(body.data)) {
        found = body.data.find((a: any) => {
          if (doi && (a.crossrefDoi === doi || a.doi === doi)) return true;
          if (a.id && slug.includes(a.id)) return true;
          const cleanSlugTitle = slug.split('+')[0];
          const articleTitleSlug = String(a.title ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return cleanSlugTitle === articleTitleSlug;
        });
      }
    } catch {}
  }

  // If found but missing file_versions, fetch full article detail
  if (found && !found.file_versions && found.id) {
    try {
      const detailRes = await fetch(`${API_URL}/api/articles/${found.id}`);
      const detailBody = await detailRes.json();
      if (detailBody?.success && detailBody.data) return detailBody.data;
    } catch {}
  }

  return found;
};

// Must stay in sync with buildArticleSlug in src/lib/articleSlug.ts and api/sitemap.ts
const buildArticleSlug = (article: any) => {
  const titleSlug = String(article.title ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const activeDoi = article.crossrefDoi || article.doi;
  return activeDoi ? `${titleSlug}+${activeDoi.replace(/\//g, '-')}` : article.id;
};

const buildMetaTags = (article: any) => {
  // Canonical comes from the article data, not the requested slug, so variant
  // URLs (UUID, old title slugs) all point at the single sitemap URL.
  const canonical = `${SITE_URL}/article/${buildArticleSlug(article)}`;
  const cleanTitle = cleanTitleForScholar(article.title);
  const authors = formatAuthorsForScholar(article.authors);
  const doi = article.crossrefDoi || article.doi;
  const pubDate = formatScholarDate(article.publication_date ?? article.created_at);
  const abstract = String(article.abstract ?? '').replace(/\s+/g, ' ').trim();
  const pdfAvailable = hasValidPdf(article);
  const sameDomainPdfUrl = pdfAvailable ? `${SITE_URL}/api/pdf/${article.id}.pdf` : null;

  const tags: string[] = [
    `<title>${esc(cleanTitle)} - IJSDS</title>`,
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta name="description" content="${esc(abstract.slice(0, 160))}">`,

    // Highwire Press / Google Scholar standard tags
    `<meta name="citation_title" content="${esc(cleanTitle)}">`,
    `<meta name="citation_journal_title" content="${esc(JOURNAL_TITLE)}">`,
    `<meta name="citation_journal_abbrev" content="IJSDS">`,
    `<meta name="citation_issn" content="3115-6932">`,
    `<meta name="citation_issn" content="3115-6940">`,
    `<meta name="citation_publisher" content="${esc(PUBLISHER)}">`,
    `<meta name="citation_language" content="en">`,
    `<meta name="citation_abstract_html_url" content="${esc(canonical)}">`,
  ];

  if (pubDate) tags.push(`<meta name="citation_publication_date" content="${esc(pubDate)}">`);

  for (const a of authors) {
    tags.push(`<meta name="citation_author" content="${esc(a.formattedName)}">`);
    if (a.affiliation) {
      tags.push(`<meta name="citation_author_institution" content="${esc(a.affiliation)}">`);
    }
  }

  if (doi) tags.push(`<meta name="citation_doi" content="${esc(doi)}">`);
  if (article.volume) tags.push(`<meta name="citation_volume" content="${esc(article.volume)}">`);
  if (article.issue) tags.push(`<meta name="citation_issue" content="${esc(article.issue)}">`);
  if (article.page_start) tags.push(`<meta name="citation_firstpage" content="${esc(article.page_start)}">`);
  if (article.page_end) tags.push(`<meta name="citation_lastpage" content="${esc(article.page_end)}">`);
  if (sameDomainPdfUrl) tags.push(`<meta name="citation_pdf_url" content="${esc(sameDomainPdfUrl)}">`);

  // Dublin Core
  tags.push(
    `<meta name="DC.title" content="${esc(cleanTitle)}">`,
    `<meta name="DC.creator" content="${esc(authors.map((a) => a.formattedName).join('; '))}">`,
    `<meta name="DC.publisher" content="${esc(PUBLISHER)}">`,
    `<meta name="DC.type" content="Text">`,
    `<meta name="DC.language" content="en">`,
    `<meta name="DC.rights" content="Creative Commons Attribution 4.0 International">`,
    `<meta name="DC.rights.uri" content="https://creativecommons.org/licenses/by/4.0/">`,
    `<meta name="DC.rights.holder" content="The Author(s)">`,
  );

  if (pubDate) tags.push(`<meta name="DC.date" content="${esc(pubDate)}">`);
  if (doi) tags.push(`<meta name="DC.identifier" content="https://doi.org/${esc(doi)}">`);

  return tags.join('\n    ');
};

/**
 * Visible article content placed inside #root. Google Scholar does not run
 * JavaScript and requires the title, authors and full abstract to be visible in
 * the HTML body (meta tags alone are not enough). React's createRoot().render()
 * replaces this markup on load, so browsers still get the normal SPA page.
 */
const buildBodyHtml = (article: any) => {
  const cleanTitle = cleanTitleForScholar(article.title);
  const authors = formatAuthorsForScholar(article.authors);
  const doi = article.crossrefDoi || article.doi;
  const pubDate = formatScholarDate(article.publication_date ?? article.created_at);
  const abstract = String(article.abstract ?? '').replace(/\s+/g, ' ').trim();
  const keywords = Array.isArray(article.keywords) ? article.keywords.filter(Boolean) : [];
  const pdfUrl = hasValidPdf(article) ? `${SITE_URL}/api/pdf/${article.id}.pdf` : null;

  // "Last, First" -> "First Last" for human-readable display
  const displayName = (formatted: string) => {
    const [last, ...rest] = formatted.split(',').map((p) => p.trim());
    return rest.length ? `${rest.join(' ')} ${last}` : last;
  };

  const citation = [
    JOURNAL_TITLE,
    article.volume ? `Vol. ${article.volume}` : '',
    article.issue ? `No. ${article.issue}` : '',
    pubDate ? pubDate.slice(0, 4) : '',
  ].filter(Boolean).join(', ');

  const authorsHtml = authors
    .map((a) => `${esc(displayName(a.formattedName))}${a.affiliation ? ` <small>(${esc(a.affiliation)})</small>` : ''}`)
    .join(', ');

  return [
    '<article class="scholar-ssr">',
    `<h1>${esc(cleanTitle)}</h1>`,
    authorsHtml && `<p class="authors">${authorsHtml}</p>`,
    `<p class="citation">${esc(citation)}</p>`,
    pubDate && `<p>Published: ${esc(pubDate)}</p>`,
    doi && `<p>DOI: <a href="https://doi.org/${esc(doi)}">https://doi.org/${esc(doi)}</a></p>`,
    abstract && `<h2>Abstract</h2><p class="abstract">${esc(abstract)}</p>`,
    keywords.length > 0 && `<p>Keywords: ${esc(keywords.join(', '))}</p>`,
    pdfUrl && `<p><a href="${esc(pdfUrl)}">Download full text (PDF)</a></p>`,
    '</article>',
  ].filter(Boolean).join('\n      ');
};

export default async function handler(req: any, res: any) {
  const slug = String(req.query?.slug ?? '').replace(/ /g, '+');

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const shellUrl = `https://${host}/index.html`;

  try {
    const shellRes = await fetch(shellUrl);
    let html = await shellRes.text();

    const article = await fetchArticle(slug);

    if (article) {
      // Drop any static <title> from index.html
      html = html.replace(/<title>.*?<\/title>/i, '');
      // Drop default homepage canonical from index.html
      html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, '');
      // Inject accurate SSR meta tags
      html = html.replace('</head>', `    ${buildMetaTags(article)}\n  </head>`);
      // Visible title/authors/abstract for non-JS crawlers (replaced by React on load)
      html = html.replace(/<div id=["']root["']>/i, (m) => `${m}\n      ${buildBodyHtml(article)}`);
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    console.error('[api/article] failed to render', slug, error);
    res.setHeader('Location', `${SITE_URL}/articles`);
    return res.status(302).end();
  }
}
