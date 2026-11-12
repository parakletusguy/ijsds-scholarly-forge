import type { BlogPost } from '@/lib/blogService';

const plainText = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

/** The post's excerpt, or the opening words of its body. */
export const getExcerpt = (post: BlogPost, words = 30): string => {
  if (post.excerpt) return post.excerpt;
  const all = plainText(post.content).split(' ');
  return all.slice(0, words).join(' ') + (all.length > words ? '…' : '');
};

/** Minutes to read at ~220 words a minute, never less than 1. */
export const readingMinutes = (post: BlogPost) => Math.max(1, Math.round(plainText(post.content).split(' ').filter(Boolean).length / 220));

/** Posts written as plain text (no tags) get paragraphs from their blank lines. */
export const toHtml = (content = '') =>
  /<[a-z][\s\S]*>/i.test(content)
    ? content
    : content.split(/\n\n+/).map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`).join('');

export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'IJ';
