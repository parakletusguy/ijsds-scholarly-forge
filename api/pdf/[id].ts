// Proxies article PDFs on the ijsds.org origin.
//
// Google Scholar requires full-text PDFs to be hosted on the same domain as the
// HTML abstract, and rejects PDFs served with 'x-robots-tag: none' (which Supabase
// Storage attaches by default).
//
// This serverless function:
// 1. Resolves the article by UUID, DOI, or slug.
// 2. Extracts the official published PDF from file_versions (or manuscript_file_url).
// 3. Streams the PDF from Supabase under the ijsds.org domain.
// 4. Injects clean headers: application/pdf, X-Robots-Tag: all, and edge caching.

const API_URL =
  process.env.VITE_API_URL ||
  'https://ijsds-database-ftb5hpfrfecegtbz.switzerlandnorth-01.azurewebsites.net';

const slugify = (text: string) =>
  String(text || 'article')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

const extractDoi = (id: string): string | null => {
  const clean = id.replace(/ /g, '+');
  const parts = clean.split('+');
  if (parts.length >= 2) {
    const potentialDoi = parts.slice(1).join('+');
    if (/^10\.\d{4,}/.test(potentialDoi)) return potentialDoi.replace(/-/g, '/');
  }
  if (/^10\.\d{4,}/.test(clean)) return clean.replace(/-/g, '/');
  return null;
};

const resolvePdfUrl = (article: any): string | null => {
  if (!article) return null;

  // 1. Prefer final published PDF from file_versions
  if (Array.isArray(article.file_versions) && article.file_versions.length > 0) {
    const publishedPdf = article.file_versions.find(
      (f: any) =>
        !f.is_archived &&
        (f.file_type === 'application/pdf' || String(f.file_url || '').toLowerCase().includes('.pdf')),
    );
    if (publishedPdf?.file_url) return publishedPdf.file_url;
  }

  // 2. Fall back to manuscript_file_url only if it is actually a PDF
  const manuscript = String(article.manuscript_file_url || '');
  if (manuscript && manuscript.toLowerCase().includes('.pdf')) {
    if (manuscript.startsWith('http://') || manuscript.startsWith('https://')) {
      return manuscript;
    }
    return `${API_URL}/${manuscript.replace(/^\//, '')}`;
  }

  return null;
};

const fetchArticle = async (rawId: string) => {
  const cleanId = rawId.replace(/\.pdf$/i, '').trim();

  // Try direct UUID lookup
  if (/^[0-9a-f-]{36}$/i.test(cleanId)) {
    try {
      const res = await fetch(`${API_URL}/api/articles/${cleanId}`);
      const body = await res.json();
      if (body?.success && body.data) return body.data;
    } catch {
      // Continue to search
    }
  }

  // Try DOI lookup
  const doi = extractDoi(cleanId);
  if (doi) {
    try {
      const res = await fetch(`${API_URL}/api/articles?doi=${encodeURIComponent(doi)}`);
      const body = await res.json();
      if (body?.success && body.data?.[0]) return body.data[0];
    } catch {
      // Continue
    }
  }

  return null;
};

export default async function handler(req: any, res: any) {
  const rawId = String(req.query?.id ?? req.query?.slug ?? '');
  if (!rawId) {
    return res.status(400).send('Article identifier is required.');
  }

  try {
    const article = await fetchArticle(rawId);
    if (!article) {
      return res.status(404).send('Article not found.');
    }

    const pdfUrl = resolvePdfUrl(article);
    if (!pdfUrl) {
      return res.status(404).send('No published PDF file is associated with this article.');
    }

    const pdfRes = await fetch(pdfUrl);
    if (!pdfRes.ok) {
      console.error('[api/pdf] upstream fetch failed:', pdfUrl, pdfRes.status);
      return res.status(502).send('Unable to retrieve article PDF from storage.');
    }

    const arrayBuffer = await pdfRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${slugify(article.title)}.pdf`;

    // Explicitly override Supabase's 'x-robots-tag: none'
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('X-Robots-Tag', 'all');
    res.setHeader('Content-Length', buffer.length);

    return res.status(200).send(buffer);
  } catch (error) {
    console.error('[api/pdf] error proxying PDF:', rawId, error);
    return res.status(500).send('Internal server error retrieving PDF.');
  }
}
