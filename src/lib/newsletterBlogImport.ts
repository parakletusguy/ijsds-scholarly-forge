export interface NewsletterBlogDraft {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
}

const ALLOWED_TAGS = new Set([
  'a', 'blockquote', 'br', 'code', 'div', 'em', 'figcaption', 'figure', 'h2',
  'h3', 'h4', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'section', 'span',
  'strong', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul',
]);

const REMOVE_WITH_CONTENT = new Set([
  'base', 'button', 'embed', 'form', 'iframe', 'input', 'link', 'meta',
  'object', 'option', 'script', 'select', 'style', 'textarea', 'title',
]);

const NEWSLETTER_COMPONENT_STYLES: Record<string, string> = {
  kicker: 'color:#903516;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin:0 0 15px;',
  evidence: 'margin:34px 0;border-left:4px solid #903516;background:#ffffff;padding:22px 24px;',
  'evidence-copy': 'margin:0;',
  checklist: 'margin:0 0 28px;padding:0;list-style:none;',
  'checklist-item': 'border-top:1px solid #E5DCC9;padding:13px 0 13px 29px;position:relative;',
  'checklist-arrow': 'color:#903516;left:0;position:absolute;font-weight:700;',
  cta: 'background:#1A1A1A;color:#ffffff;margin:44px 0 0;padding:34px;text-align:center;',
  'cta-heading': "color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;margin:0 0 12px;",
  'cta-copy': 'color:#ffffff;margin:0 0 22px;',
  'cta-button': 'background:#ffffff;color:#903516;display:inline-block;font-size:11px;font-weight:700;letter-spacing:.1em;padding:14px 19px;text-decoration:none;text-transform:uppercase;',
};

const allowedUrl = (value: string, kind: 'href' | 'src') => {
  try {
    const url = new URL(value, window.location.origin);
    if (kind === 'src') return url.protocol === 'https:' || url.protocol === 'http:';
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) || value.startsWith('#');
  } catch {
    return false;
  }
};

const cleanText = (value: string | null | undefined) => (value || '').replace(/\s+/g, ' ').trim();

const markNewsletterComponents = (article: Element) => {
  const mark = (selector: string, component: keyof typeof NEWSLETTER_COMPONENT_STYLES) => {
    article.querySelectorAll(selector).forEach((element) => element.setAttribute('data-ijsds-component', component));
  };

  mark('.kicker', 'kicker');
  mark('.evidence', 'evidence');
  mark('.evidence > p', 'evidence-copy');
  mark('.checklist', 'checklist');
  mark('.checklist li', 'checklist-item');
  mark('.cta-band', 'cta');
  mark('.cta-band h2', 'cta-heading');
  mark('.cta-band p', 'cta-copy');
  mark('.cta-band a.button', 'cta-button');

  article.querySelectorAll('.checklist li').forEach((item) => {
    const arrow = document.createElement('span');
    arrow.textContent = '→';
    arrow.setAttribute('data-ijsds-component', 'checklist-arrow');
    item.prepend(arrow);
  });
};

const sanitizeArticle = (article: Element) => {
  const nodes = [article, ...Array.from(article.querySelectorAll('*'))];

  nodes.forEach((node) => {
    if (node !== article && !ALLOWED_TAGS.has(node.tagName.toLowerCase())) {
      if (REMOVE_WITH_CONTENT.has(node.tagName.toLowerCase())) {
        node.remove();
        return;
      }
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }

    const href = node.getAttribute('href');
    const src = node.getAttribute('src');
    const alt = node.getAttribute('alt');
    const title = node.getAttribute('title');
    const newsletterComponent = node.getAttribute('data-ijsds-component');
    Array.from(node.attributes).forEach((attribute) => node.removeAttribute(attribute.name));

    if (node instanceof HTMLAnchorElement) {
      if (href && allowedUrl(href, 'href')) {
        node.setAttribute('href', href);
        if (/^https?:/i.test(href)) node.setAttribute('rel', 'noopener noreferrer');
      } else {
        node.removeAttribute('href');
      }
    }

    if (node instanceof HTMLImageElement) {
      if (src && allowedUrl(src, 'src')) {
        node.setAttribute('src', src);
        if (alt) node.setAttribute('alt', alt);
        if (title) node.setAttribute('title', title);
      } else {
        node.remove();
      }
    }

    if (newsletterComponent && NEWSLETTER_COMPONENT_STYLES[newsletterComponent]) {
      node.setAttribute('style', NEWSLETTER_COMPONENT_STYLES[newsletterComponent]);
    }
  });

  return article.innerHTML.trim();
};

/**
 * Converts an IJSDS newsletter blog-page HTML file into the content fragment
 * used by the website's blog CMS. It intentionally omits standalone layout,
 * styles, draft labels, and duplicated page-heading metadata.
 */
export const importNewsletterBlogHtml = (html: string): NewsletterBlogDraft => {
  if (!html.trim()) throw new Error('Choose or paste a newsletter HTML file first.');

  const document = new DOMParser().parseFromString(html, 'text/html');
  const article = document.querySelector('main.article, main, article, [data-newsletter-body]');
  if (!article) throw new Error('No newsletter article was found. Expected a <main> or <article> section.');

  const title = cleanText(article.querySelector('h1')?.textContent) || cleanText(document.title)
    .replace(/^draft\s*[—–-]\s*/i, '')
    .replace(/\s*[|—–-]\s*IJSDS$/i, '');
  const lead = article.querySelector('.lead');
  const excerpt = cleanText(lead?.textContent) || cleanText(document.querySelector('meta[name="description"]')?.getAttribute('content'));

  // The site supplies the page title, date, and excerpt itself. Keeping these
  // source-page elements would duplicate them after the CMS renders the post.
  article.querySelector('h1')?.remove();
  article.querySelector('.byline')?.remove();
  lead?.remove();
  article.querySelectorAll('.draft, [data-newsletter-draft]').forEach((element) => element.remove());
  markNewsletterComponents(article);

  const content = sanitizeArticle(article);
  if (!title || !content) throw new Error('The newsletter needs a title and article body before it can be imported.');

  return {
    title,
    excerpt,
    content,
    category: 'Announcements',
    tags: ['newsletter'],
  };
};
