import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getBlogPosts, BlogPost } from '@/lib/blogService';
import { formatDate } from '@/lib/dateUtils';
import { getExcerpt, readingMinutes } from '@/lib/blogFormat';

const POSTS_PER_PAGE = 10;

const Meta = ({ post }: { post: BlogPost }) => (
  <p className="font-body text-xs text-stone-500">
    {post.category && <span className="text-primary font-semibold uppercase tracking-[0.12em]">{post.category}</span>}
    {post.category && <span className="mx-2 text-stone-300">·</span>}
    {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
    <span className="mx-2 text-stone-300">·</span>
    {readingMinutes(post)} min read
  </p>
);

export const Blog = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));

  const isStaff = profile?.is_admin || profile?.is_editor;

  useEffect(() => {
    getBlogPosts()
      .then(setAllPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedCategory, currentPage, setSearchParams]);

  const categories = useMemo(
    () => [...new Set(allPosts.map((p) => p.category).filter(Boolean))] as string[],
    [allPosts],
  );

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return allPosts.filter((p) => {
      const matchSearch = !q
        || p.title.toLowerCase().includes(q)
        || (p.excerpt || '').toLowerCase().includes(q)
        || (p.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [allPosts, searchTerm, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const pagePosts = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
  const showLead = currentPage === 1 && !searchTerm && selectedCategory === 'all' && pagePosts.length > 0;
  const lead = showLead ? pagePosts[0] : null;
  const rows = showLead ? pagePosts.slice(1) : pagePosts;

  const pickCategory = (c: string) => { setSelectedCategory(c); setCurrentPage(1); };
  const tab = (active: boolean) =>
    `shrink-0 font-body text-sm pb-3 -mb-px border-b-2 transition-colors ${active ? 'border-primary text-stone-900 font-semibold' : 'border-transparent text-stone-500 hover:text-stone-900'}`;

  return (
    <div className="bg-background min-h-screen text-stone-900 pb-28">
      <Helmet>
        <title>Blog | IJSDS</title>
        <meta name="description" content="News, calls for papers and perspectives from the editorial office of the International Journal of Social Work and Development Studies." />
        <link rel="canonical" href="https://www.ijsds.org/blog" />
      </Helmet>

      {/* Masthead */}
      <header className="max-w-5xl mx-auto px-5 pt-14 md:pt-20">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="font-headline font-medium tracking-[-0.02em] leading-none text-[clamp(2.6rem,7vw,4.5rem)] text-stone-950">
              The IJSDS Blog
            </h1>
            <p className="mt-4 max-w-xl font-body text-[15px] leading-relaxed text-stone-600">
              News, calls for papers and perspectives from the editorial office of the International Journal of Social Work and Development Studies.
            </p>
          </div>
          {isStaff && (
            <button
              onClick={() => navigate('/admin/blogs')}
              className="shrink-0 flex items-center gap-2 font-body text-xs text-stone-500 hover:text-primary border border-stone-200 px-3 py-2 transition-colors"
            >
              <Settings2 size={13} /> Manage
            </button>
          )}
        </div>

        {/* Topics + search */}
        <div className="mt-10 border-b border-stone-200 flex flex-col-reverse gap-4 md:flex-row md:items-end md:justify-between">
          <nav aria-label="Topics" className="flex gap-6 overflow-x-auto">
            <button type="button" className={tab(selectedCategory === 'all')} onClick={() => pickCategory('all')}>All posts</button>
            {categories.map((c) => (
              <button type="button" key={c} className={tab(selectedCategory === c)} onClick={() => pickCategory(c)}>{c}</button>
            ))}
          </nav>
          <label className="relative block md:w-64 md:mb-2.5">
            <span className="sr-only">Search posts</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search posts"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 font-body text-sm bg-white border border-stone-200 focus:border-primary focus:outline-none transition-colors"
            />
          </label>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5">
        {loading ? (
          <div className="mt-10 space-y-10 animate-pulse" aria-label="Loading posts">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-3 w-40 bg-stone-200" />
                <div className="h-7 w-3/4 bg-stone-200" />
                <div className="h-4 w-full bg-stone-100" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-headline text-2xl text-stone-800">
              {searchTerm || selectedCategory !== 'all' ? 'No posts match that search.' : 'No posts yet.'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setCurrentPage(1); }}
                className="mt-4 font-body text-sm text-primary underline underline-offset-4"
              >
                Show all posts
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Lead story */}
            {lead && (
              <Link to={`/blog/${lead.slug}`} className="group block mt-10 md:mt-12">
                <article className={lead.featured_image_url ? 'grid md:grid-cols-[1.15fr_1fr] gap-6 md:gap-10 items-center' : ''}>
                  {lead.featured_image_url && (
                    <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                      <img src={lead.featured_image_url} alt="" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                    </div>
                  )}
                  <div className={lead.featured_image_url ? '' : 'max-w-3xl'}>
                    <Meta post={lead} />
                    <h2 className="mt-3 font-headline font-medium tracking-[-0.015em] leading-[1.1] text-[clamp(1.9rem,4vw,2.9rem)] text-stone-950 group-hover:text-primary transition-colors">
                      {lead.title}
                    </h2>
                    <p className="mt-4 font-headline text-lg md:text-xl leading-relaxed text-stone-600 line-clamp-4">{getExcerpt(lead, 45)}</p>
                    <span className="mt-5 inline-block font-body text-sm font-semibold text-primary">Read the post</span>
                  </div>
                </article>
              </Link>
            )}

            {/* The rest */}
            {rows.length > 0 && (
              <ul className={`${lead ? 'mt-12 md:mt-16' : 'mt-4'} border-t border-stone-200 divide-y divide-stone-200`}>
                {rows.map((post) => (
                  <li key={post.id}>
                    <Link to={`/blog/${post.slug}`} className="group flex gap-5 md:gap-8 py-7 md:py-8">
                      <div className="flex-1 min-w-0">
                        <Meta post={post} />
                        <h2 className="mt-2 font-headline text-[1.4rem] md:text-[1.6rem] leading-snug text-stone-950 group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                        <p className="mt-2 font-body text-[15px] leading-relaxed text-stone-600 line-clamp-2">{getExcerpt(post)}</p>
                      </div>
                      {post.featured_image_url && (
                        <div className="w-24 h-24 md:w-40 md:h-28 shrink-0 overflow-hidden bg-stone-100 self-center">
                          <img src={post.featured_image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <nav aria-label="Pages" className="mt-10 pt-6 border-t border-stone-200 flex items-center justify-between font-body text-sm">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 text-stone-600 hover:text-primary disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={15} /> Newer
                </button>
                <span className="text-stone-500">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 text-stone-600 hover:text-primary disabled:opacity-30 transition-colors"
                >
                  Older <ChevronRight size={15} />
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Blog;
