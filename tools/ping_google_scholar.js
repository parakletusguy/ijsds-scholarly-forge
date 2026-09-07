import fs from 'fs';

const SITE_URL = 'https://ijsds.org';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const GOOGLEBOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

async function pingSearchEngines() {
  console.log('=== 1. PINGING SEARCH ENGINES ===');

  // Google sitemap ping
  try {
    const googlePing = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
    const res = await fetch(googlePing);
    console.log(`[Google Ping] ${googlePing} -> Status: ${res.status}`);
  } catch (err) {
    console.log(`[Google Ping] Failed:`, err.message);
  }

  // Bing sitemap ping
  try {
    const bingPing = `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
    const res = await fetch(bingPing);
    console.log(`[Bing Ping] ${bingPing} -> Status: ${res.status}`);
  } catch (err) {
    console.log(`[Bing Ping] Failed:`, err.message);
  }
}

async function verifyCoreEndpoints() {
  console.log('\n=== 2. VERIFYING CORE CRAWLER ENDPOINTS ===');
  
  const endpoints = [
    '/robots.txt',
    '/sitemap.xml',
    '/feed/latest-articles.xml',
    '/oai',
    '/papers'
  ];

  for (const ep of endpoints) {
    try {
      const url = `${SITE_URL}${ep}`;
      const res = await fetch(url, { headers: { 'User-Agent': GOOGLEBOT_UA } });
      console.log(`[Endpoint] ${ep} -> Status: ${res.status} (${res.headers.get('content-type') || 'unknown'})`);
    } catch (err) {
      console.log(`[Endpoint] ${ep} -> Error:`, err.message);
    }
  }
}

async function warmAllArticles() {
  console.log('\n=== 3. HARVESTING SITEMAP & WARMING ARTICLES AS GOOGLEBOT ===');
  
  try {
    const sitemapRes = await fetch(SITEMAP_URL, { headers: { 'User-Agent': GOOGLEBOT_UA } });
    const sitemapXml = await sitemapRes.text();
    const articleUrls = [...sitemapXml.matchAll(/<loc>(https:\/\/ijsds\.org\/article\/[^<]+)<\/loc>/g)].map(m => m[1]);
    
    console.log(`Found ${articleUrls.length} published article URLs in sitemap.`);

    let successCount = 0;
    let pdfTagsFound = 0;

    for (let i = 0; i < articleUrls.length; i++) {
      const url = articleUrls[i];
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': GOOGLEBOT_UA,
            'Accept': 'text/html,application/xhtml+xml'
          }
        });
        const html = await res.text();
        const hasPdfTag = html.includes('name="citation_pdf_url"');
        if (hasPdfTag) pdfTagsFound++;
        successCount++;

        const slugPart = url.split('/article/')[1].slice(0, 35);
        console.log(`[${i + 1}/${articleUrls.length}] 200 OK | PDF Tag: ${hasPdfTag ? 'YES' : 'NO '} | ${slugPart}...`);
      } catch (err) {
        console.log(`[${i + 1}/${articleUrls.length}] FAIL | ${url} | ${err.message}`);
      }
    }

    console.log(`\nWarmed ${successCount}/${articleUrls.length} articles.`);
    console.log(`Articles with clean same-domain citation_pdf_url tags: ${pdfTagsFound}/${articleUrls.length}`);
  } catch (err) {
    console.error('Failed to parse sitemap:', err);
  }
}

async function testPdfProxies() {
  console.log('\n=== 4. TESTING LIVE PDF ENDPOINTS (X-Robots-Tag Check) ===');
  
  try {
    const sitemapRes = await fetch(SITEMAP_URL);
    const xml = await sitemapRes.text();
    const articleUrls = [...xml.matchAll(/<loc>(https:\/\/ijsds\.org\/article\/[^<]+)<\/loc>/g)].map(m => m[1]);

    // Sample 3 articles
    const samples = articleUrls.slice(0, 3);
    for (const url of samples) {
      const pageRes = await fetch(url);
      const pageHtml = await pageRes.text();
      const match = pageHtml.match(/<meta name="citation_pdf_url" content="([^"]+)"/);
      if (match) {
        const pdfUrl = match[1];
        const headRes = await fetch(pdfUrl, { method: 'HEAD', headers: { 'User-Agent': GOOGLEBOT_UA } });
        console.log(`[PDF Check] ${pdfUrl}`);
        console.log(`            Status: ${headRes.status}`);
        console.log(`            Content-Type: ${headRes.headers.get('content-type')}`);
        console.log(`            X-Robots-Tag: ${headRes.headers.get('x-robots-tag')} (Must NOT be none)`);
        console.log(`            Cache: ${headRes.headers.get('cache-control')}`);
      }
    }
  } catch (err) {
    console.error('Error testing PDF proxies:', err);
  }
}

async function main() {
  await pingSearchEngines();
  await verifyCoreEndpoints();
  await warmAllArticles();
  await testPdfProxies();
  console.log('\n=== PING & REVALIDATION COMPLETE ===');
}

main().catch(console.error);
