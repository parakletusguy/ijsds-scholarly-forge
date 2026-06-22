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
const API_URL = process.env.VITE_API_URL || 'https://ijsdsbackend-429660256945.europe-southwest1.run.app';

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

    // Identify unique Volume/Issue combinations
    const volumeIssues = new Set<string>();
    articles.forEach((article: any) => {
      if (article.volume && article.issue) {
        volumeIssues.add(`${article.volume}-${article.issue}`);
      }
    });

    const staticLastMod = '2025-01-01'; // Fixed date for static routes

    // 3. Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static routes
    staticRoutes.forEach(route => {
      xml += `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${staticLastMod}</lastmod>
    <changefreq>${route === '' || route === '/articles' ? 'daily' : 'monthly'}</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>\n`;
    });

    // Volume/Issue Table of Contents routes
    volumeIssues.forEach(vi => {
      const [vol, iss] = vi.split('-');
      xml += `  <url>
    <loc>${BASE_URL}/archive/vol-${vol}/issue-${iss}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });

    // Article URLs and PDF URLs
    articles.forEach((article: any) => {
      const lastMod = article.publication_date ? article.publication_date.split('T')[0] : staticLastMod;
      
      // Article HTML page
      xml += `  <url>
    <loc>${BASE_URL}/article/${buildArticleSlug(article)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;


    });

    xml += `</urlset>`;

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
