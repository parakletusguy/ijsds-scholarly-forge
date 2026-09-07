import fs from 'fs';
import crypto from 'crypto';

const keyFilePath = 'C:\\Users\\HP\\IJSDSBackend\\new-project-499802-a9987f9001b1.json';

async function getAccessToken() {
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

async function run() {
  console.log('=== 1. FETCHING SITEMAP FOR ALL PUBLISHED ARTICLES ===');
  const sitemapRes = await fetch('https://www.ijsds.org/sitemap.xml');
  const xml = await sitemapRes.text();
  
  const rawUrls = [...xml.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)].map(m => m[1]);
  // Filter for article URLs and ensure canonical 'https://www.ijsds.org' prefix
  const articleUrls = rawUrls
    .filter(u => u.includes('/article/'))
    .map(u => u.replace('https://ijsds.org', 'https://www.ijsds.org'));

  // Also include the core academic discovery landing pages
  const coreUrls = [
    'https://www.ijsds.org/papers',
    'https://www.ijsds.org/feed/latest-articles.xml',
    'https://www.ijsds.org/sitemap.xml',
  ];

  const allUrls = Array.from(new Set([...coreUrls, ...articleUrls]));
  console.log(`Found ${articleUrls.length} articles + ${coreUrls.length} core pages (${allUrls.length} total URLs to index)`);

  console.log('\n=== 2. AUTHENTICATING WITH GOOGLE INDEXING API ===');
  const accessToken = await getAccessToken();
  console.log('Authentication successful! Token acquired.');

  console.log('\n=== 3. DISPATCHING URL_UPDATED NOTIFICATIONS TO GOOGLEBOT ===');
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < allUrls.length; i++) {
    const url = allUrls[i];
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
      if (res.status === 200) {
        successCount++;
        const slug = url.split('/').pop().slice(0, 45);
        console.log(`[${i + 1}/${allUrls.length}] 200 OK | ${slug}`);
      } else {
        failureCount++;
        console.warn(`[${i + 1}/${allUrls.length}] ${res.status} FAILED | ${url} | ${data.error?.message || JSON.stringify(data)}`);
      }
    } catch (err) {
      failureCount++;
      console.error(`[${i + 1}/${allUrls.length}] ERROR | ${url} | ${err.message}`);
    }

    // Google Indexing API rate limit is generous (380 requests/min), but 100ms pause keeps it smooth
    await new Promise(r => setTimeout(r, 120));
  }

  console.log('\n========================================');
  console.log(`TOTAL SUBMITTED: ${allUrls.length}`);
  console.log(`SUCCESSFUL (200 OK): ${successCount}`);
  console.log(`FAILED: ${failureCount}`);
  console.log('========================================\n');
}

run().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
