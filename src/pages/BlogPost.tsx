import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Link2, Check, Linkedin, Twitter, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getBlogPostBySlug, getBlogPosts, BlogPost as BlogPostType } from '@/lib/blogService';
import { formatDate } from '@/lib/dateUtils';
import { getExcerpt, initials, readingMinutes, toHtml } from '@/lib/blogFormat';

const SITE = 'https://www.ijsds.org';

/** Thin bar at the very top that fills as the reader moves through the article. */
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div aria-hidden className="fixed top-0 inset-x-0 h-[3px] z-50 pointer-events-none">
      <div className="h-full bg-primary origin-left" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
};

const ShareLinks = ({ url, title }: { url: string; title: string }) => {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Couldn't copy the link", variant: 'destructive' });
    }
  };
  const btn = 'w-9 h-9 inline-flex items-center justify-center border border-stone-200 text-stone-500 hover:text-primary hover:border-primary/40 transition-colors';
  return (
    <div className="flex items-center gap-2">
      <a className={btn} aria-label="Share on WhatsApp" href={`https://wa.me/?text=${enc(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /></a>
      <a className={btn} aria-label="Share on LinkedIn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener noreferrer"><Linkedin size={15} /></a>
      <a className={btn} aria-label="Share on X" href={`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`} target="_blank" rel="noopener noreferrer"><Twitter size={15} /></a>
      <button type="button" className={btn} aria-label={copied ? 'Link copied' : 'Copy link'} onClick={copy}>
        {copied ? <Check size={15} className="text-primary" /> : <Link2 size={15} />}
      </button>
    </div>
  );
};

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [morePosts, setMorePosts] = useState<BlogPostType[]>([]);

  useEffect(() => {
    if (!slug) return;
    window.scrollTo(0, 0);
    setLoading(true);
    Promise.all([getBlogPostBySlug(slug), getBlogPosts().catch(() => [] as BlogPostType[])])
      .then(([data, all]) => {
        setPost(data);
        const others = all.filter((p) => p.id !== data.id);
        const sameTopic = others.filter((p) => data.category && p.category === data.category);
        setMorePosts([...sameTopic, ...others.filter((p) => !sameTopic.includes(p))].slice(0, 3));
      })
      .catch(() => {
        toast({ title: "Couldn't load this post", variant: 'destructive' });
        navigate('/blog');
      })
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[44.5rem] mx-auto px-5 pt-24 space-y-5 animate-pulse">
          <div className="h-3 w-24 bg-stone-200" />
          <div className="h-10 w-full bg-stone-200" />
          <div className="h-10 w-2/3 bg-stone-200" />
          <div className="h-5 w-5/6 bg-stone-100 mt-8" />
        </div>
      </div>
    );
  }
  if (!post) return null;

  const url = `${SITE}/blog/${post.slug}`;
  const author = post.author?.full_name || 'IJSDS Editorial Office';
  const minutes = readingMinutes(post);
  const description = getExcerpt(post, 40);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    datePublished: post.published_at ?? undefined,
    author: { '@type': post.author ? 'Person' : 'Organization', name: author },
    publisher: { '@type': 'Organization', name: 'International Journal of Social Work and Development Studies', url: SITE },
    image: post.featured_image_url ?? undefined,
    mainEntityOfPage: url,
    keywords: post.tags?.join(', '),
  };

  return (
    <div className="bg-background min-h-screen text-stone-900 pb-24">
      <Helmet>
        <title>{`${post.title} | IJSDS Blog`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        {post.featured_image_url && <meta property="og:image" content={post.featured_image_url} />}
        <meta name="twitter:card" content={post.featured_image_url ? 'summary_large_image' : 'summary'} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <ReadingProgress />

      <article>
        {/* Masthead */}
        <header className="max-w-[44.5rem] mx-auto px-5 pt-14 md:pt-20">
          <Link to="/blog" className="inline-flex items-center gap-1.5 font-body text-sm text-stone-500 hover:text-primary transition-colors">
            <ArrowLeft size={14} /> IJSDS Blog
          </Link>

          {post.category && (
            <Link
              to={`/blog?category=${encodeURIComponent(post.category)}`}
              className="block mt-10 font-body text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:underline underline-offset-4"
            >
              {post.category}
            </Link>
          )}

          <h1 className="mt-3 font-headline font-medium text-stone-950 tracking-[-0.015em] leading-[1.08] text-[clamp(2.1rem,5.2vw,3.4rem)]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-5 font-headline text-[1.3rem] md:text-[1.45rem] leading-[1.45] text-stone-600">{post.excerpt}</p>
          )}

          <div className="mt-8 py-5 border-y border-stone-200 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span aria-hidden className="w-10 h-10 rounded-full bg-primary/10 text-primary font-body text-sm font-semibold flex items-center justify-center">
                {initials(author)}
              </span>
              <div className="font-body leading-tight">
                <p className="text-sm font-semibold text-stone-900">{author}</p>
                <p className="text-[13px] text-stone-500 mt-0.5">
                  {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
                  {post.published_at && ' · '}
                  {minutes} min read
                </p>
              </div>
            </div>
            <ShareLinks url={url} title={post.title} />
          </div>
        </header>

        {post.featured_image_url && (
          <figure className="max-w-5xl mx-auto mt-10 md:mt-12 px-0 md:px-5">
            <img src={post.featured_image_url} alt="" className="w-full max-h-[620px] object-cover bg-stone-100" />
          </figure>
        )}

        {/* Body */}
        <div className="px-5 mt-10 md:mt-12">
          <div className="article-body mx-auto" dangerouslySetInnerHTML={{ __html: toHtml(post.content || '') }} />
        </div>

        {/* After the article */}
        <footer className="max-w-[44.5rem] mx-auto px-5 mt-14">
          {post.tags && post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Topics">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to={`/blog?search=${encodeURIComponent(tag)}`}
                    className="inline-block font-body text-[13px] text-stone-600 bg-stone-100 hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-full transition-colors"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 pt-6 border-t border-stone-200 flex items-center justify-between gap-4 flex-wrap">
            <p className="font-body text-sm text-stone-500">Found this useful? Share it with a colleague.</p>
            <ShareLinks url={url} title={post.title} />
          </div>

          {post.author?.bio && (
            <div className="mt-10 flex gap-4">
              <span aria-hidden className="w-12 h-12 shrink-0 rounded-full bg-primary/10 text-primary font-body font-semibold flex items-center justify-center">
                {initials(author)}
              </span>
              <div>
                <p className="font-body text-xs uppercase tracking-[0.14em] text-stone-500">Written by</p>
                <p className="font-headline text-lg font-semibold text-stone-900 mt-1">{author}</p>
                <p className="font-body text-sm text-stone-600 leading-relaxed mt-1.5">{post.author.bio}</p>
              </div>
            </div>
          )}
        </footer>
      </article>

      {/* Journal call to action */}
      <section className="mt-20 bg-stone-900 text-stone-100">
        <div className="max-w-[44.5rem] mx-auto px-5 py-14">
          <p className="font-headline text-2xl md:text-[1.75rem] leading-snug text-white">
            Publish your research with IJSDS
          </p>
          <p className="mt-3 font-body text-[15px] leading-relaxed text-stone-300">
            An open-access, double-blind peer-reviewed journal for social work, social policy and development research.
            Every article gets a Crossref DOI and is indexed in Google Scholar.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 font-body text-sm">
            <Link to="/submit" className="bg-primary hover:bg-[#8f3514] text-white px-5 py-3 font-semibold transition-colors">
              Submit a manuscript
            </Link>
            <Link to="/why-publish" className="text-stone-200 underline underline-offset-4 decoration-stone-500 hover:decoration-stone-200">
              Why publish with IJSDS
            </Link>
          </div>
        </div>
      </section>

      {morePosts.length > 0 && (
        <section className="max-w-[44.5rem] mx-auto px-5 mt-16" aria-labelledby="more-posts">
          <h2 id="more-posts" className="font-headline text-2xl font-semibold text-stone-900">More from the blog</h2>
          <ul className="mt-4 divide-y divide-stone-200 border-t border-stone-200">
            {morePosts.map((p) => (
              <li key={p.id}>
                <Link to={`/blog/${p.slug}`} className="group block py-6">
                  <p className="font-body text-xs text-stone-500">
                    {p.category && <span className="text-primary font-semibold uppercase tracking-[0.12em]">{p.category}</span>}
                    {p.category && p.published_at && <span className="mx-2 text-stone-300">·</span>}
                    {p.published_at && formatDate(p.published_at)}
                  </p>
                  <p className="mt-1.5 font-headline text-xl leading-snug text-stone-900 group-hover:text-primary transition-colors">{p.title}</p>
                  <p className="mt-1.5 font-body text-sm text-stone-500 leading-relaxed line-clamp-2">{getExcerpt(p)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default BlogPost;
