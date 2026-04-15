const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const buildArticleSlug = (article: { title: string; doi?: string | null; id: string }) => {
  const titleSlug = slugify(article.title);
  if (article.doi) {
    const doiSlug = article.doi.replace(/\//g, '-');
    return `${titleSlug}+${doiSlug}`;
  }
  return article.id;
};

const BASE_URL = 'https://ijsds.org';
const API_URL = process.env.VITE_API_URL || 'https://api.ijsds.org';

export default async function handler(req: any, res: any) {
  try {
    // 1. Fetch live articles from Backend
    const response = await fetch(`${API_URL}/api/articles?status=published`);
    const result = await response.json();
    const articles = result.success ? result.data : [];

    // 2. Define static routes
    const staticRoutes = [
      '',
      '/articles',
      '/archive',
      '/about',
      '/blog',
      '/partners',
      '/contact',
      '/openAccess',
      '/plagiarism-policy',
      '/preservation-policy',
      '/indexing',
      '/copyright',
      '/orcidGuide',
    ];

    // 3. Build XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes
    .map(
      (route) => `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === '' || route === '/articles' ? 'daily' : 'monthly'}</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`,
    )
    .join('')}
  ${articles
    .map(
      (article: any) => `
  <url>
    <loc>${BASE_URL}/article/${buildArticleSlug(article)}</loc>
    <lastmod>${article.publication_date ? article.publication_date.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
    )
    .join('')}
</urlset>`;

    // 4. Return XML with correct headers
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache for 24 hours
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    // Fallback to minimal static sitemap on error to avoid breaking crawlers
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}/</loc><priority>1.0</priority></url>
  <url><loc>${BASE_URL}/articles</loc><priority>0.9</priority></url>
</urlset>`);
  }
}
