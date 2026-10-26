import { useState, useEffect, type FormEvent } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getArticles, Article } from '@/lib/articleService';
import { buildArticleSlug } from '@/lib/articleSlug';
import { useAuth } from '@/hooks/useAuth';
import { getBlogPosts, BlogPost } from '@/lib/blogService';
import { formatDate } from '@/lib/dateUtils';
import mina from "../images/editors/Mina.jpeg";

// Facts a reader can check. No marketing numbers: credibility comes from verifiable detail.
const JOURNAL_FACTS: { label: string; value: string; href?: string }[] = [
  { label: 'ISSN (print)', value: '3115-6940', href: 'https://portal.issn.org/resource/ISSN/3115-6940' },
  { label: 'eISSN (online)', value: '3115-6932', href: 'https://portal.issn.org/resource/ISSN/3115-6932' },
  { label: 'Peer review', value: 'Double-blind' },
  { label: 'Access', value: 'Open access, CC BY 4.0' },
  { label: 'Identifiers', value: 'Crossref DOI for every article' },
  { label: 'Discovery', value: 'Google Scholar, OAI-PMH' },
];

const formatAuthors = (authors: any) => {
  if (!Array.isArray(authors) || authors.length === 0) return 'IJSDS Editorial';
  const names = authors.map((a: any) => a?.name).filter(Boolean);
  if (names.length === 0) return 'IJSDS Editorial';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names[0]} et al.`;
};

const citationLine = (a: Article) => {
  const parts: string[] = [];
  if (a.volume) parts.push(`Vol. ${a.volume}`);
  if (a.issue) parts.push(`Issue ${a.issue}`);
  if (a.publication_date) parts.push(new Date(a.publication_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }));
  return parts.join(' · ');
};

const Doi = ({ doi }: { doi?: string | null }) =>
  doi ? (
    <a
      href={`https://doi.org/${doi}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-stone-500 hover:text-primary underline decoration-stone-300 underline-offset-2 break-all"
    >
      doi.org/{doi}
    </a>
  ) : null;

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    Promise.all([getArticles({ status: 'published' }), getBlogPosts()])
      .then(([a, p]) => {
        setArticles(a.slice(0, 6));
        setPosts(p.slice(0, 3));
      })
      .catch((error) => {
        console.error('Error fetching home data:', error);
        setLoadFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const submitPath = user ? '/submit' : '/auth?reason=submit';
  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/articles?q=${encodeURIComponent(q)}` : '/articles');
  };

  const [featured, ...rest] = articles;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-orange-100 selection:text-primary">

      {/* ── Masthead ─────────────────────────────────────────────────────── */}
      <header className="border-b border-stone-200">
        <div className="container mx-auto px-4 sm:px-8 py-14 md:py-20 grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          <div className="lg:col-span-8">
            <h1 className="font-headline font-light tracking-tight leading-[1.05] text-[clamp(2.4rem,6vw,5rem)] mb-6">
              Amplifying African voices through <span className="italic text-primary">rigorous research.</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-[60ch] mb-10">
              The International Journal of Social Work and Development Studies publishes original research on
              social work, social policy and development, free for anyone to read.
            </p>

            <form onSubmit={onSearch} role="search" className="flex max-w-2xl mb-6">
              <label htmlFor="home-search" className="sr-only">Search published articles</label>
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  id="home-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles"
                  className="w-full h-14 bg-white border border-stone-300 border-r-0 pl-11 pr-4 text-base focus:outline-none focus:border-primary"
                />
              </div>
              <button type="submit" className="h-14 px-6 bg-stone-900 text-white text-sm font-semibold hover:bg-primary transition-colors">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold">
              <Link to={submitPath} className="text-primary inline-flex items-center gap-1.5 hover:underline underline-offset-4">
                Submit a manuscript <ArrowRight size={15} />
              </Link>
              <Link to="/archive" className="text-stone-700 hover:text-primary hover:underline underline-offset-4">
                Browse issues
              </Link>
              <Link to="/author-guide" className="text-stone-700 hover:text-primary hover:underline underline-offset-4">
                Author guidelines
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-4 lg:pt-14" aria-labelledby="facts-heading">
            <h2 id="facts-heading" className="font-headline text-xl mb-4">The journal</h2>
            <dl className="border-t border-stone-300 text-sm">
              {JOURNAL_FACTS.map((f) => (
                <div key={f.label} className="flex justify-between gap-6 py-3 border-b border-stone-200">
                  <dt className="text-stone-500">{f.label}</dt>
                  <dd className="text-right font-medium text-stone-800">
                    {f.href ? (
                      <a href={f.href} target="_blank" rel="noopener noreferrer" className="hover:text-primary underline decoration-stone-300 underline-offset-2">
                        {f.value}
                      </a>
                    ) : f.value}
                  </dd>
                </div>
              ))}
            </dl>
            <Link to="/indexing" className="mt-4 inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-primary">
              How IJSDS is indexed <ArrowRight size={14} />
            </Link>
          </aside>
        </div>
      </header>

      {/* ── Latest research ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28" aria-labelledby="latest-heading">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="flex flex-wrap justify-between items-baseline gap-4 mb-12">
            <h2 id="latest-heading" className="font-headline text-3xl md:text-5xl">Latest research</h2>
            <Link to="/articles" className="text-sm font-semibold text-primary inline-flex items-center gap-1.5 hover:underline underline-offset-4">
              All articles <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-6" aria-busy="true" aria-label="Loading articles">
              <div className="h-40 bg-stone-100 animate-pulse" />
              <div className="h-20 bg-stone-100 animate-pulse" />
              <div className="h-20 bg-stone-100 animate-pulse" />
            </div>
          ) : loadFailed ? (
            <div className="py-16 border-y border-stone-200 text-center">
              <p className="font-headline text-2xl text-stone-500 mb-6">We couldn't load the latest articles.</p>
              <Link to="/articles" className="text-sm font-semibold text-primary hover:underline underline-offset-4">
                Go to the article list
              </Link>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-16 border-y border-stone-200 text-center">
              <p className="font-headline text-2xl text-stone-500 mb-6">No articles have been published yet.</p>
              <Link to={submitPath} className="inline-block bg-primary text-white px-7 py-3 text-sm font-semibold hover:bg-primary/90">
                Submit your research
              </Link>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              {featured && (
                <article className="lg:col-span-7 border-t-2 border-stone-900 pt-6">
                  {featured.subject_area && (
                    <p className="text-xs font-semibold tracking-wide uppercase text-primary mb-4">{featured.subject_area}</p>
                  )}
                  <h3 className="font-headline text-3xl md:text-4xl leading-tight mb-5">
                    <Link to={`/article/${buildArticleSlug(featured)}`} className="hover:text-primary transition-colors">
                      {featured.title}
                    </Link>
                  </h3>
                  <p className="text-stone-600 leading-relaxed line-clamp-4 mb-6 max-w-[65ch]">{featured.abstract}</p>
                  <p className="text-sm font-medium text-stone-800">{formatAuthors(featured.authors)}</p>
                  <p className="text-sm text-stone-500 mt-1">{citationLine(featured)}</p>
                  <p className="text-sm mt-1"><Doi doi={featured.crossrefDoi} /></p>
                </article>
              )}

              {rest.length > 0 && (
                <ol className="lg:col-span-5 border-t border-stone-300">
                  {rest.map((a) => (
                    <li key={a.id} className="py-5 border-b border-stone-200">
                      <h3 className="font-headline text-lg md:text-xl leading-snug mb-2">
                        <Link to={`/article/${buildArticleSlug(a)}`} className="hover:text-primary transition-colors">
                          {a.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-stone-600">{formatAuthors(a.authors)}</p>
                      <p className="text-xs text-stone-500 mt-1 flex flex-wrap gap-x-3">
                        {citationLine(a) && <span>{citationLine(a)}</span>}
                        <Doi doi={a.crossrefDoi} />
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── From the Editor-in-Chief ─────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-stone-100 border-y border-stone-200" aria-labelledby="editor-heading">
        <div className="container mx-auto px-4 sm:px-8 grid gap-10 md:grid-cols-12 md:gap-16 items-center">
          <div className="md:col-span-4">
            <img src={mina} alt="Prof. Mina Magaret Ogbanga, Editor-in-Chief of IJSDS" className="w-full max-w-xs md:max-w-none aspect-[4/5] object-cover" />
          </div>
          <figure className="md:col-span-8">
            <h2 id="editor-heading" className="text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-6">From the Editor-in-Chief</h2>
            <blockquote className="font-headline font-light text-2xl md:text-4xl leading-snug mb-8 max-w-[34ch]">
              “Research is not just an academic exercise; it is how we shape the future. Through our journal, we give
              African scholars the platform they deserve to lead global conversations.”
            </blockquote>
            <figcaption>
              <p className="font-headline text-lg">Prof. Mina Magaret Ogbanga</p>
              <p className="text-sm text-stone-500">Editor-in-Chief</p>
              <Link to="/editorial-board" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4">
                Meet the editorial board <ArrowRight size={14} />
              </Link>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── For authors ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-primary text-white" aria-labelledby="authors-heading">
        <div className="container mx-auto px-4 sm:px-8 grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-6">
            <h2 id="authors-heading" className="font-headline font-light text-4xl md:text-5xl leading-tight mb-6">
              Publish with IJSDS
            </h2>
            <p className="text-white/80 leading-relaxed max-w-[50ch] mb-8">
              We welcome original research articles, case studies and reviews in social work and development studies
              from researchers everywhere.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={submitPath} className="bg-white text-primary px-7 py-3.5 text-sm font-semibold hover:bg-stone-100 transition-colors">
                Submit a manuscript
              </Link>
              <Link to="/author-guide" className="border border-white/60 px-7 py-3.5 text-sm font-semibold hover:bg-white/10 transition-colors">
                Read the author guidelines
              </Link>
            </div>
          </div>
          <dl className="md:col-span-6 grid gap-6 sm:grid-cols-2 content-start">
            {[
              ['Double-blind peer review', 'Independent experts evaluate every manuscript without knowing who wrote it.'],
              ['Free to read', 'Every article is open access under CC BY 4.0. Authors keep their copyright.'],
              ['A DOI for every article', 'Each paper gets a permanent Crossref DOI, so it can always be found and cited.'],
              ['Discoverable', 'Article pages carry full citation metadata for Google Scholar and OAI-PMH harvesters.'],
            ].map(([t, d]) => (
              <div key={t} className="border-t border-white/30 pt-4">
                <dt className="font-semibold mb-1.5">{t}</dt>
                <dd className="text-sm text-white/75 leading-relaxed">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── News ─────────────────────────────────────────────────────────── */}
      {posts.length > 0 && (
        <section className="py-20 md:py-24" aria-labelledby="news-heading">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="flex flex-wrap justify-between items-baseline gap-4 mb-10">
              <h2 id="news-heading" className="font-headline text-3xl md:text-4xl">News from the journal</h2>
              <Link to="/blog" className="text-sm font-semibold text-primary inline-flex items-center gap-1.5 hover:underline underline-offset-4">
                All news <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid gap-10 sm:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id}>
                  <Link to={`/blog/${post.slug}`} className="block aspect-[16/10] overflow-hidden bg-stone-100 mb-4" tabIndex={-1} aria-hidden="true">
                    {post.featured_image_url ? (
                      <img src={post.featured_image_url} alt="" loading="lazy" className="w-full h-full object-cover object-top" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center font-headline text-3xl text-stone-300">IJSDS</span>
                    )}
                  </Link>
                  <p className="text-xs text-stone-500 mb-2">
                    {formatDate(post.published_at, 'short')}{post.category ? ` · ${post.category}` : ''}
                  </p>
                  <h3 className="font-headline text-xl leading-snug">
                    <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">{post.title}</Link>
                  </h3>
                  {post.excerpt && <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed mt-2">{post.excerpt}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
