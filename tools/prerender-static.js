import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('prerender-static: dist/index.html not found! Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(templatePath, 'utf8');

const staticRoutes = [
  {
    path: '/articles',
    title: 'Research Articles - IJSDS',
    description: 'Browse peer-reviewed research articles published in the International Journal of Social Work and Development Studies.',
  },
  {
    path: '/archive',
    title: 'Journal Archive & Issues - IJSDS',
    description: 'Explore the complete archive of volumes and issues from the International Journal of Social Work and Development Studies.',
  },
  {
    path: '/about',
    title: 'About the Journal - IJSDS',
    description: 'Learn about IJSDS aims, scope, indexing, and publication ethics in social work and community development.',
  },
  {
    path: '/editorial-board',
    title: 'Editorial Board - IJSDS',
    description: 'Meet the distinguished editorial board and editors of the International Journal of Social Work and Development Studies.',
  },
  {
    path: '/journal-information',
    title: 'Journal Information - IJSDS',
    description: 'Key publishing information, ISSN, frequency, open access model, and publisher details for IJSDS.',
  },
  {
    path: '/submission-guidelines',
    title: 'Submission Guidelines - IJSDS',
    description: 'Manuscript preparation, formatting instructions, and submission criteria for authors submitting to IJSDS.',
  },
  {
    path: '/peer-review',
    title: 'Peer Review Process - IJSDS',
    description: 'Our rigorous double-blind peer review policy, evaluation workflow, and ethical standards.',
  },
  {
    path: '/openAccess',
    title: 'Open Access Policy - IJSDS',
    description: 'IJSDS open access statement, Creative Commons CC-BY 4.0 license, and free knowledge dissemination commitment.',
  },
  {
    path: '/plagiarism-policy',
    title: 'Plagiarism Policy - IJSDS',
    description: 'Plagiarism screening standards, similarity thresholds, and academic integrity guidelines at IJSDS.',
  },
  {
    path: '/ai-policy',
    title: 'AI Usage Policy - IJSDS',
    description: 'Guidelines on generative AI tools, transparency, and author responsibility in academic writing.',
  },
  {
    path: '/author-guide',
    title: 'Author Guidelines - IJSDS',
    description: 'Comprehensive guide for submitting, revising, and publishing research papers with IJSDS.',
  },
  {
    path: '/ethical-guidelines',
    title: 'Ethical Guidelines - IJSDS',
    description: 'Publication ethics and malpractice statement conforming to COPE standards.',
  },
  {
    path: '/preservation-policy',
    title: 'Digital Preservation Policy - IJSDS',
    description: 'Long-term digital archiving, repository redundancy, and content preservation at IJSDS.',
  },
  {
    path: '/indexing',
    title: 'Indexing & Abstracting - IJSDS',
    description: 'Indexing databases, academic repositories, and scholarly discovery services listing IJSDS.',
  },
  {
    path: '/copyright',
    title: 'Copyright & Licensing - IJSDS',
    description: 'Author copyright retention, open access licensing, and reuse terms for IJSDS publications.',
  },
  {
    path: '/partners',
    title: 'Partners & Collaborators - IJSDS',
    description: 'Institutional partnerships and scholarly collaborations supporting IJSDS research.',
  },
  {
    path: '/contact',
    title: 'Contact Editorial Office - IJSDS',
    description: 'Get in touch with the editorial and technical team of IJSDS.',
  },
  {
    path: '/blog',
    title: 'Blog & Academic News - IJSDS',
    description: 'Latest research insights, announcements, and academic updates from IJSDS.',
  },
  {
    path: '/orcidGuide',
    title: 'ORCID Integration Guide - IJSDS',
    description: 'How to connect and link your ORCID iD to your research submissions in IJSDS.',
  },
];

console.log(`Prerendering ${staticRoutes.length} static routes for SEO & canonical indexing...`);

staticRoutes.forEach(({ path: routePath, title, description }) => {
  const canonicalUrl = `https://www.ijsds.org${routePath}`;
  let routeHtml = baseHtml;

  // Replace canonical tag
  routeHtml = routeHtml.replace(
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${canonicalUrl}">`
  );

  // Replace title tag
  routeHtml = routeHtml.replace(
    /<title>.*?<\/title>/i,
    `<title>${title}</title>`
  );

  // Replace meta description
  routeHtml = routeHtml.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${description}">`
  );

  // Replace og:title and og:description
  routeHtml = routeHtml.replace(
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${title}">`
  );
  routeHtml = routeHtml.replace(
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${description}">`
  );

  // Create folder in dist: e.g. dist/about/index.html
  const targetDir = path.join(distDir, routePath.replace(/^\//, ''));
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(path.join(targetDir, 'index.html'), routeHtml, 'utf8');
});

console.log('Successfully prerendered all static route HTML files!');
