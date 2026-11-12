/**
 * Readable summaries of the journal pages, written into the prerendered HTML at build time
 * (tools/prerender-static.js). AI crawlers (GPTBot, ClaudeBot, PerplexityBot) and many search
 * bots don't run JavaScript, so without this they saw only the empty SPA shell. Everyone gets
 * the same HTML: a page-specific <title>, description, canonical, JSON-LD and a plain summary
 * inside #root, which React replaces on load.
 */
import {
  ARTICLE_TYPES, FAQ, FEES, INDEXING, JOURNAL, PAGES, REVIEW, SCOPE, SITE_URL,
} from './journalFacts';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const list = (items: string[], ordered = false) =>
  `<${ordered ? 'ol' : 'ul'}>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`;

const keyFacts = () => list([
  `ISSN ${JOURNAL.issnPrint} (print), ${JOURNAL.issnOnline} (online)`,
  `Peer review: ${REVIEW.model}. ${REVIEW.firstDecision}`,
  `Open access under ${JOURNAL.licence}; authors keep copyright`,
  `Fees: ${FEES.summary}`,
  `Indexing: Crossref DOIs and Google Scholar`,
  `Editor-in-Chief: ${JOURNAL.editorInChief}`,
  `Contact: ${JOURNAL.email}`,
]);

const links = () =>
  `<ul>${PAGES.map((p) => `<li><a href="${p.path}">${esc(p.title)}</a>: ${esc(p.description)}</li>`).join('')}</ul>`;

const faqHtml = () => FAQ.map((f) => `<h2>${esc(f.q)}</h2><p>${esc(f.a)}</p>`).join('');

const periodical = {
  '@context': 'https://schema.org',
  '@type': 'Periodical',
  name: JOURNAL.title,
  alternateName: JOURNAL.abbreviation,
  url: SITE_URL,
  description: JOURNAL.summary,
  issn: [JOURNAL.issnPrint, JOURNAL.issnOnline],
  inLanguage: 'en',
  isAccessibleForFree: true,
  license: JOURNAL.licenceUrl,
  foundingDate: JOURNAL.founded,
  publisher: { '@type': 'Organization', name: 'Rivers State University', url: SITE_URL },
  editor: { '@type': 'Person', name: 'Mina Magaret Ogbanga', jobTitle: 'Editor-in-Chief' },
  about: SCOPE.map((name) => ({ '@type': 'Thing', name })),
  email: JOURNAL.email,
};

const faqPage = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export type Page = { path: string; title: string; description: string; body: () => string; jsonLd?: object };

const intro = () => `<p>${esc(JOURNAL.summary)}</p>`;

export const PAGE_CONTENT: Record<string, Page> = {
  home: {
    path: '/',
    title: `${JOURNAL.title} (${JOURNAL.abbreviation})`,
    description: 'Open-access, double-blind peer-reviewed journal for social work, social policy and development research. Crossref DOIs, Google Scholar indexing, first decision in 3 to 4 weeks.',
    body: () => `<h1>${esc(JOURNAL.title)} (${JOURNAL.abbreviation})</h1>${intro()}<h2>Key facts</h2>${keyFacts()}<h2>For authors</h2><p><a href="/why-publish">Publishing with IJSDS: questions and answers</a> | <a href="/submit">Submit a manuscript</a></p><h2>Journal pages</h2>${links()}`,
    jsonLd: periodical,
  },
  'why-publish': {
    path: '/why-publish',
    title: 'Publishing with IJSDS: questions and answers',
    description: 'Scope, cost, peer review time, indexing and how to submit to the International Journal of Social Work and Development Studies.',
    body: () => `<h1>Publishing with IJSDS</h1>${intro()}${faqHtml()}<p><a href="/submit">Submit your manuscript</a></p>`,
    jsonLd: faqPage,
  },
  about: {
    path: '/about',
    title: 'About IJSDS',
    description: 'The mission, scope and editorial leadership of the International Journal of Social Work and Development Studies.',
    body: () => `<h1>About IJSDS</h1>${intro()}<p>Founded in ${esc(JOURNAL.founded)} and based at the ${esc(JOURNAL.home)}. Editor-in-Chief: ${esc(JOURNAL.editorInChief)}.</p><h2>Scope</h2>${list(SCOPE)}<h2>Key facts</h2>${keyFacts()}`,
    jsonLd: periodical,
  },
  'journal-information': {
    path: '/journal-information',
    title: 'Journal information | IJSDS',
    description: 'ISSNs, peer review, open access licensing, fees, indexing and contact details for IJSDS.',
    body: () => `<h1>Journal information</h1>${intro()}${keyFacts()}<h2>Indexing</h2>${list(INDEXING)}`,
    jsonLd: periodical,
  },
  'submission-guidelines': {
    path: '/submission-guidelines',
    title: 'Submission guidelines | IJSDS',
    description: 'Article types, formatting, blind-review preparation and ethics requirements for submitting to IJSDS.',
    body: () => `<h1>Submission guidelines</h1><h2>Article types</h2><ul>${ARTICLE_TYPES.map((t) => `<li><strong>${esc(t.type)}</strong> (${esc(t.length)}): ${esc(t.desc)}</li>`).join('')}</ul><h2>Preparing your manuscript</h2>${list([
      'Microsoft Word, 12pt standard font, double-spaced, 1-inch margins, continuous line numbering',
      'References in APA 7th edition',
      'Abstract of 250 to 300 words and 5 to 7 keywords',
      'Remove all identifying details from the main file for double-blind review; put author details on a separate title page',
      'Declare ethics approval, conflicts of interest and any AI tools used',
    ])}<h2>How to submit</h2><p>Create an account, then submit at <a href="/submit">${esc(JOURNAL.submitUrl)}</a>. ${esc(REVIEW.firstDecision)}</p>`,
  },
  'peer-review': {
    path: '/peer-review',
    title: 'Peer review process | IJSDS',
    description: 'How double-blind peer review works at IJSDS, how long it takes and the possible decisions.',
    body: () => `<h1>Peer review process</h1><p>${esc(REVIEW.model)}. ${esc(REVIEW.firstDecision)}</p>${list(REVIEW.steps, true)}`,
  },
  openAccess: {
    path: '/openAccess',
    title: 'Open access policy and fees | IJSDS',
    description: 'IJSDS is fully open access under CC BY 4.0; authors keep copyright. Fee schedule and waivers.',
    body: () => `<h1>Open access policy and fees</h1><p>Every article is free to read and download immediately on publication, with no embargo or paywall, under the <a href="${JOURNAL.licenceUrl}">${esc(JOURNAL.licence)}</a> licence. Authors keep their copyright.</p><h2>Fees</h2><p>${esc(FEES.summary)}</p>`,
  },
  indexing: {
    path: '/indexing',
    title: 'Indexing and visibility | IJSDS',
    description: 'IJSDS articles receive Crossref DOIs and are indexed in Google Scholar; an OAI-PMH feed serves harvesters.',
    body: () => `<h1>Indexing and visibility</h1>${list(INDEXING)}`,
  },
  contact: {
    path: '/contact',
    title: 'Contact | IJSDS',
    description: 'Contact the IJSDS editorial office.',
    body: () => `<h1>Contact the editorial office</h1><p>Email <a href="mailto:${JOURNAL.email}">${JOURNAL.email}</a>. ${esc(JOURNAL.home)}. We aim to reply within 24 to 48 hours on working days.</p>`,
  },
};

export const renderPage = (shell: string, page: Page) => {
  let html = shell
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/i, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, '')
    .replace(/<meta\s+property=["']og:(title|description|url)["'][^>]*>/gi, '');
  // The shell's own Periodical JSON-LD is replaced on pages that bring their own.
  if (page.jsonLd) html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '');
  const url = `${SITE_URL}${page.path}`;
  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:title" content="${esc(page.title)}">`,
    `<meta property="og:description" content="${esc(page.description)}">`,
    `<meta property="og:url" content="${url}">`,
    page.jsonLd ? `<script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n    ');
  html = html.replace('</head>', `    ${head}\n  </head>`);
  // Replace the shell's hidden directory nav with the page summary (React replaces it on load).
  const summary = `<div id="root">\n      <article class="ssr-summary">${page.body()}</article>\n    </div>`;
  const withNav = /<div id=["']root["']>\s*<nav[\s\S]*?<\/nav>\s*<\/div>/i;
  return withNav.test(html) ? html.replace(withNav, summary) : html.replace(/<div id=["']root["']>/i, (m) => `${m}\n      <article class="ssr-summary">${page.body()}</article>`);
};


/**
 * dist/index.html is also the shell for every app route (and the service worker's fallback),
 * so the home summary goes in <noscript>: crawlers without JavaScript read it, people never see it.
 */
export const renderHomeShell = (shell: string) => {
  const home = PAGE_CONTENT.home;
  return shell
    .replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(home.description)}">`)
    .replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${esc(home.description)}">`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script type="application/ld+json">${JSON.stringify(periodical).replace(/</g, '\\u003c')}</script>`)
    .replace(/<div id=["']root["']>\s*<nav[\s\S]*?<\/nav>\s*<\/div>/i, `<div id="root">\n      <noscript><article class="ssr-summary">${home.body()}</article></noscript>\n    </div>`);
};
