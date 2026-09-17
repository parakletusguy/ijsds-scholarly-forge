const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Must stay in sync with buildArticleSlug in src/lib/articleSlug.ts — the app
// prefers crossrefDoi, so the sitemap has to as well or it emits URLs that
// don't match the real article pages.
const buildArticleSlug = (article: { title: string; doi?: string | null; crossrefDoi?: string | null; id: string }) => {
  const titleSlug = slugify(article.title);
  const activeDoi = article.crossrefDoi || article.doi;
  if (activeDoi) {
    const doiSlug = activeDoi.replace(/\//g, '-');
    return `${titleSlug}+${doiSlug}`;
  }
  return article.id;
};

const BASE_URL = 'https://www.ijsds.org';
const API_URL = process.env.VITE_API_URL || 'https://ijsds-database-ftb5hpfrfecegtbz.switzerlandnorth-01.azurewebsites.net';

export default async function handler(req: any, res: any) {
  try {
    // 1. Fetch live articles from Backend
    const response = await fetch(`${API_URL}/api/articles?status=published`);
    const result = await response.json();
    const articles = result.success ? result.data : [];

    // 2. Define static routes with explicit priorities and change frequencies
    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/papers', priority: '1.0', changefreq: 'daily' },
      { path: '/articles', priority: '0.9', changefreq: 'daily' },
      { path: '/archive', priority: '0.8', changefreq: 'weekly' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/editorial-board', priority: '0.8', changefreq: 'monthly' },
      { path: '/journal-information', priority: '0.8', changefreq: 'monthly' },
      { path: '/submission-guidelines', priority: '0.8', changefreq: 'monthly' },
      { path: '/peer-review', priority: '0.8', changefreq: 'monthly' },
      { path: '/author-guide', priority: '0.8', changefreq: 'monthly' },
      { path: '/openAccess', priority: '0.8', changefreq: 'monthly' },
      { path: '/indexing', priority: '0.8', changefreq: 'monthly' },
      { path: '/plagiarism-policy', priority: '0.7', changefreq: 'monthly' },
      { path: '/ai-policy', priority: '0.7', changefreq: 'monthly' },
      { path: '/ethical-guidelines', priority: '0.7', changefreq: 'monthly' },
      { path: '/preservation-policy', priority: '0.7', changefreq: 'monthly' },
      { path: '/copyright', priority: '0.7', changefreq: 'monthly' },
      { path: '/partners', priority: '0.7', changefreq: 'monthly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/blog', priority: '0.7', changefreq: 'weekly' },
      { path: '/orcidGuide', priority: '0.7', changefreq: 'monthly' },
    ];

    // Identify unique Volume/Issue combinations
    const volumeIssues = new Set<string>();
    articles.forEach((article: any) => {
      if (article.volume && article.issue) {
        volumeIssues.add(`${article.volume}-${article.issue}`);
      }
    });

    const staticLastMod = '2026-09-17';

    // 3. Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static routes
    staticRoutes.forEach(({ path, priority, changefreq }) => {
      const loc = path === '/' ? `${BASE_URL}/` : `${BASE_URL}${path}`;
      xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${staticLastMod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
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

    // Article URLs
    articles.forEach((article: any) => {
      const lastMod = article.publication_date ? article.publication_date.split('T')[0] : staticLastMod;
      
      xml += `  <url>
    <loc>${BASE_URL}/article/${buildArticleSlug(article)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
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
  <url><loc>${BASE_URL}/papers</loc><priority>1.0</priority></url>
  <url><loc>${BASE_URL}/articles</loc><priority>0.9</priority></url>
</urlset>`);
  }
}
