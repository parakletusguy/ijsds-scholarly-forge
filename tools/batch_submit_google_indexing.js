import fs from 'fs';
import crypto from 'crypto';

const keyFilePath = 'C:\\Users\\HP\\IJSDSBackend\\new-project-499802-a9987f9001b1.json';
const INDEXNOW_KEY = 'ijsds-scholar-indexer-2026-c748fae45b88';
const HOST = 'www.ijsds.org';

async function getGoogleAccessToken() {
  const keyData = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
  const { client_email: clientEmail, private_key: privateKey } = keyData;

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const claimSet = Buffer.from(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${claimSet}`);
  const signature = sign.sign(privateKey, 'base64url');
  const jwt = `${header}.${claimSet}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenJson = await tokenRes.json();
  if (!tokenJson.access_token) {
    throw new Error('Could not obtain access token: ' + JSON.stringify(tokenJson));
  }
  return tokenJson.access_token;
}

async function fetchAllTargets() {
  // 1. Fetch live sitemap
  console.log('Fetching live sitemap from https://www.ijsds.org/sitemap.xml ...');
  const sitemapRes = await fetch('https://www.ijsds.org/sitemap.xml');
  const xml = await sitemapRes.text();
  const sitemapUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());

  // 2. Fetch live published articles from backend to get PDF proxy URLs
  console.log('Fetching published articles from backend for PDF endpoints...');
  const backendRes = await fetch('https://ijsds-database-ftb5hpfrfecegtbz.switzerlandnorth-01.azurewebsites.net/api/articles?status=published&limit=100');
  const backendData = await backendRes.json();
  const articles = backendData?.success ? backendData.data : [];

  const pdfUrls = [];
  for (const art of articles) {
    // Check if article has PDF
    const hasPdf = (Array.isArray(art.file_versions) && art.file_versions.some(f => !f.is_archived && (f.file_type === 'application/pdf' || String(f.file_url || '').toLowerCase().includes('.pdf')))) ||
      String(art.manuscript_file_url || '').toLowerCase().includes('.pdf');
    if (hasPdf && art.id) {
      pdfUrls.push(`https://${HOST}/api/pdf/${art.id}.pdf`);
    }
  }

  // 3. Core academic feeds and pages
  const extraUrls = [
    `https://${HOST}/papers`,
    `https://${HOST}/feed/latest-articles.xml`,
    `https://${HOST}/sitemap.xml`,
  ];

  const combined = Array.from(new Set([...sitemapUrls, ...pdfUrls, ...extraUrls]));
  return { sitemapUrls, pdfUrls, combined };
}

async function submitIndexNow(urls) {
  console.log(`\n=== 1. SUBMITTING ${urls.length} URLS TO INDEXNOW (Bing / Yandex / Partners) ===`);
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
    console.log(`IndexNow Response Status: ${res.status} ${res.statusText}`);
    if (res.status === 200 || res.status === 202) {
      console.log('IndexNow successfully accepted the URL batch!');
    } else {
      const text = await res.text();
      console.warn('IndexNow notice:', text);
    }
  } catch (err) {
    console.error('IndexNow submission error:', err.message);
  }
}

async function submitGoogleIndexing(urls) {
  console.log(`\n=== 2. SUBMITTING URLS TO GOOGLE INDEXING API (Googlebot) ===`);
  const accessToken = await getGoogleAccessToken();
  console.log('Google OAuth2 Token successfully acquired.\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          type: 'URL_UPDATED',
        }),
      });

      const data = await res.json();
      const label = url.includes('/api/pdf/')
        ? `[PDF] ${url.split('/').pop()}`
        : url.split('/').pop().slice(0, 50);

      if (res.status === 200) {
        successCount++;
        console.log(`[${i + 1}/${urls.length}] 200 OK | ${label}`);
      } else {
        failCount++;
        console.warn(`[${i + 1}/${urls.length}] ${res.status} ERR | ${label} | ${data.error?.message || JSON.stringify(data)}`);
      }
    } catch (err) {
      failCount++;
      console.error(`[${i + 1}/${urls.length}] EXCEPTION | ${url} | ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 120));
  }

  console.log('\n========================================');
  console.log(`GOOGLE INDEXING API RESULTS:`);
  console.log(`Total URLs: ${urls.length}`);
  console.log(`Successful (200 OK): ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log('========================================');
}

async function main() {
  const { sitemapUrls, pdfUrls, combined } = await fetchAllTargets();
  console.log(`Discovered:`);
  console.log(`- ${sitemapUrls.length} Sitemap URLs (Articles, Issues, Static pages)`);
  console.log(`- ${pdfUrls.length} Direct PDF Proxy URLs`);
  console.log(`- Total Unique Targets: ${combined.length}\n`);

  // Submit to IndexNow
  await submitIndexNow(combined);

  // Submit all 45 canonical articles + core pages to Google Indexing API
  // (Keeping total within standard Google daily limits)
  const googlePriorityUrls = combined.filter(u => 
    u.includes('/article/') || 
    u.includes('/archive/vol-') || 
    u === `https://${HOST}` || 
    u === `https://${HOST}/articles` || 
    u === `https://${HOST}/papers` ||
    u === `https://${HOST}/sitemap.xml`
  );

  console.log(`\nDispatching ${googlePriorityUrls.length} priority URLs to Googlebot...`);
  await submitGoogleIndexing(googlePriorityUrls);
}

main().catch(console.error);
