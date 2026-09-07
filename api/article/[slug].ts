// Server-renders the <head> of the article page.
//
// Google Scholar's crawler does not execute JavaScript, so it cannot read the
// citation metadata from the React app. This function serves the normal SPA
// shell with the Highwire Press / Dublin Core tags injected into <head>, so
// crawlers read the tags from raw HTML while humans still get the full React UI
// at the same URL. No cloaking: both are served identical bytes.

const API_URL =
  process.env.VITE_API_URL ||
  'https://ijsds-database-ftb5hpfrfecegtbz.switzerlandnorth-01.azurewebsites.net';

const SITE_URL = 'https://www.ijsds.org';
const JOURNAL_TITLE = 'International Journal of Social Work and Development Studies';

const esc = (value: unknown) =>
  String(value ?? '').replace(
    /[<>&'"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string,
  );

// Mirrors extractDoiFromSlug in src/lib/articleSlug.ts
const extractDoiFromSlug = (slug: string): string | null => {
  const parts = slug.split('+');
  if (parts.length < 2) return null;
  const potentialDoi = parts.slice(1).join('+');
  if (/^10\.\d{4,}/.test(potentialDoi)) return potentialDoi.replace('-', '/');
  return null;
};

const normalizeAuthors = (authors: unknown): Array<{ first: string; last: string; affiliation: string }> => {
  if (!Array.isArray(authors)) return [];
  return authors.map((a: any) => {
    if (typeof a === 'string') return { first: '', last: a, affiliation: '' };
    return {
      first: a?.firstName ?? a?.first_name ?? a?.given ?? '',
      last: a?.lastName ?? a?.last_name ?? a?.family ?? a?.surname ?? a?.name ?? '',
      affiliation: a?.affiliation ?? '',
    };
  });
};

const formatScholarDate = (value: unknown) => {
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

const fetchArticle = async (slug: string) => {
  const doi = extractDoiFromSlug(slug);

  let found: any = null;

  if (doi) {
    try {
      const res = await fetch(`${API_URL}/api/articles?doi=${encodeURIComponent(doi)}`);
      const body = await res.json();
      if (body?.success && body.data?.length > 0) found = body.data[0];
    } catch {}
  }

  // Check if slug contains full UUID
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

  // Check if slug ends with an 8-char hex prefix
  if (!found) {
    const shortIdMatch = slug.match(/([0-9a-f]{8})$/i);
    if (shortIdMatch) {
      try {
        const res = await fetch(`${API_URL}/api/articles?status=published`);
        const body = await res.json();
        if (body?.success && Array.isArray(body.data)) {
          found = body.data.find((a: any) => a.id?.toLowerCase().startsWith(shortIdMatch[1].toLowerCase()));
        }
      } catch {}
    }
  }

  // Slugs without a DOI fall back to the bare article UUID
  if (!found && /^[0-9a-f-]{36}$/i.test(slug)) {
    try {
      const res = await fetch(`${API_URL}/api/articles/${slug}`);
      const body = await res.json();
      if (body?.success) found = body.data;
    } catch {}
  }

  if (found) {
    if (!found.file_versions && found.id) {
      try {
        const detailRes = await fetch(`${API_URL}/api/articles/${found.id}`);
        const detailBody = await detailRes.json();
        if (detailBody?.success && detailBody.data) return detailBody.data;
      } catch {}
    }
    return found;
  }

  return null;
};

const buildMetaTags = (article: any, slug: string) => {
  const canonical = `${SITE_URL}/article/${slug}`;
  const authors = normalizeAuthors(article.authors);
  const doi = article.crossrefDoi || article.doi;
  const pubDate = formatScholarDate(article.publication_date ?? article.created_at);
  const abstract = String(article.abstract ?? '').replace(/\s+/g, ' ').trim();
  const pdfAvailable = hasValidPdf(article);
  const sameDomainPdfUrl = pdfAvailable ? `${SITE_URL}/api/pdf/${article.id}.pdf` : null;

  const tags: string[] = [
    `<title>${esc(article.title)} - IJSDS</title>`,
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta name="description" content="${esc(abstract.slice(0, 160))}">`,

    // Highwire Press — what Google Scholar reads
    `<meta name="citation_title" content="${esc(article.title)}">`,
    `<meta name="citation_journal_title" content="${esc(JOURNAL_TITLE)}">`,
    `<meta name="citation_journal_abbrev" content="IJSDS">`,
    `<meta name="citation_issn" content="3115-6932">`,
    `<meta name="citation_publisher" content="IJSDS Publishing">`,
    `<meta name="citation_language" content="en">`,
    `<meta name="citation_abstract_html_url" content="${esc(canonical)}">`,
  ];

  if (pubDate) tags.push(`<meta name="citation_publication_date" content="${esc(pubDate)}">`);

  for (const a of authors) {
    const name = [a.last, a.first].filter(Boolean).join(', ');
    if (name) tags.push(`<meta name="citation_author" content="${esc(name)}">`);
    if (a.affiliation) tags.push(`<meta name="citation_author_institution" content="${esc(a.affiliation)}">`);
  }

  if (doi) tags.push(`<meta name="citation_doi" content="${esc(doi)}">`);
  if (article.volume) tags.push(`<meta name="citation_volume" content="${esc(article.volume)}">`);
  if (article.issue) tags.push(`<meta name="citation_issue" content="${esc(article.issue)}">`);
  if (article.page_start) tags.push(`<meta name="citation_firstpage" content="${esc(article.page_start)}">`);
  if (article.page_end) tags.push(`<meta name="citation_lastpage" content="${esc(article.page_end)}">`);
  if (sameDomainPdfUrl) tags.push(`<meta name="citation_pdf_url" content="${esc(sameDomainPdfUrl)}">`);

  // Dublin Core
  tags.push(
    `<meta name="DC.title" content="${esc(article.title)}">`,
    `<meta name="DC.creator" content="${esc(authors.map((a) => [a.last, a.first].filter(Boolean).join(', ')).join('; '))}">`,
    `<meta name="DC.publisher" content="${esc(JOURNAL_TITLE)}">`,
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

export default async function handler(req: any, res: any) {
  // Slugs carry a literal "+" (title+doi). Served as a path segment that is safe,
  // but if anything ever routes this through a query string the "+" decodes to a
  // space — which would silently strip the DOI and emit a page with no citation
  // tags. Restore it rather than fail quietly.
  const slug = String(req.query?.slug ?? '').replace(/ /g, '+');

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const shellUrl = `https://${host}/index.html`;

  try {
    // Always fetch the real SPA shell so the app keeps booting normally.
    const shellRes = await fetch(shellUrl);
    let html = await shellRes.text();

    const article = await fetchArticle(slug);

    if (article) {
      // Drop the build's static <title> so ours is the only one.
      html = html.replace(/<title>.*?<\/title>/i, '');
      html = html.replace('</head>', `    ${buildMetaTags(article, slug)}\n  </head>`);
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    } else {
      // Unknown slug: serve the shell untouched and let the SPA render its own
      // not-found view. Never 500 — a crawler seeing 500 will drop the URL.
      res.setHeader('Cache-Control', 'no-store');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    console.error('[api/article] failed to render', slug, error);
    // Degrade to a redirect rather than an error page.
    res.setHeader('Location', `${SITE_URL}/articles`);
    return res.status(302).end();
  }
}
