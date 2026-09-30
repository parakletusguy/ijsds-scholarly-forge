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
