import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar, Search, ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getBlogPosts, BlogPost } from '@/lib/blogService';
import { formatDate } from '@/lib/dateUtils';

const getExcerpt = (post: BlogPost): string => {
  if (post.excerpt) return post.excerpt;
  const text = (post.content || '').replace(/<[^>]*>/g, '');
  const words = text.split(' ').slice(0, 25);
  return words.join(' ') + (words.length === 25 ? '...' : '');
};

const POSTS_PER_PAGE = 9;

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
    setSearchParams(params);
  }, [searchTerm, selectedCategory, currentPage, setSearchParams]);

  const categories = useMemo(
    () => [...new Set(allPosts.map(p => p.category).filter(Boolean))] as string[],
    [allPosts]
  );

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return allPosts.filter(p => {
      const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [allPosts, searchTerm, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const posts = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);


  return (
    <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
      <Helmet>
        <title>Blog — IJSDS</title>
        <meta name="description" content="News, updates, and perspectives from the International Journal of Social Work and Development Studies." />
      </Helmet>

      {/* Page Header */}
      <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-4 inline-block">
            ← Home
          </Link>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-headline font-light tracking-tight text-stone-900">
                Journal <span className="italic text-primary">Blog</span>
              </h1>
              <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl">
                News, updates, and perspectives from the editorial team.
              </p>
            </div>
            {isStaff && (
              <button
                onClick={() => navigate('/admin/blogs')}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors border border-stone-200 px-4 py-2 bg-white"
              >
                <Settings2 size={12} /> Manage
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-16 space-y-10">

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 text-sm border border-stone-200 bg-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="px-4 py-3 text-sm border border-stone-200 bg-white focus:border-primary focus:outline-none transition-colors text-stone-600 cursor-pointer"
            >
              <option value="all">All Topics</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-px">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse bg-white p-6 border border-stone-100">
                <div className="h-3 bg-stone-100 w-20 mb-4 rounded" />
                <div className="h-5 bg-stone-100 w-3/4 mb-3 rounded" />
                <div className="h-4 bg-stone-100 w-full rounded" />
                <div className="h-4 bg-stone-100 w-2/3 mt-2 rounded" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="space-y-px">
              {posts.map((post, index) => {
                const isFirst = index === 0 && currentPage === 1 && !searchTerm && selectedCategory === 'all' && post.featured_image_url;
                return isFirst ? (
                  /* Featured first post */
                  <article
                    key={post.id}
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    className="group cursor-pointer bg-white border border-stone-100 hover:border-primary/30 transition-all duration-300 overflow-hidden"
                  >
                    <div className="aspect-[16/6] overflow-hidden bg-stone-100">
                      <img
                        src={post.featured_image_url!}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-3">
                        {post.category && (
                          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{post.category}</span>
                        )}
                        <span className="text-[10px] text-stone-400 flex items-center gap-1.5">
                          <Calendar size={10} />
                          {formatDate(post.published_at)}
                        </span>
                      </div>
                      <h2 className="font-headline text-2xl font-bold text-stone-900 group-hover:text-primary transition-colors leading-snug mb-3">
                        {post.title}
                      </h2>
                      <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">
                        {getExcerpt(post)}
                      </p>
                    </div>
                  </article>
                ) : (
                  /* Standard list item */
                  <article
                    key={post.id}
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    className="group cursor-pointer bg-white border border-stone-100 hover:border-primary/30 transition-all duration-300 p-6 flex gap-5 items-start"
                  >
                    {post.featured_image_url && (
                      <div className="w-20 h-16 shrink-0 overflow-hidden bg-stone-100">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {post.category && (
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{post.category}</span>
                        )}
                        <span className="text-[10px] text-stone-400 flex items-center gap-1.5">
                          <Calendar size={9} />
                          {formatDate(post.published_at)}
                        </span>
                      </div>
                      <h2 className="font-headline text-base font-bold text-stone-900 group-hover:text-primary transition-colors leading-snug mb-1.5 line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-sm text-stone-400 leading-relaxed line-clamp-1">
                        {getExcerpt(post)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-8 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="text-xs text-stone-400 font-body">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center bg-white border border-stone-100">
            <p className="text-stone-400 text-sm">
              {searchTerm || selectedCategory !== 'all'
                ? 'No posts matched your search.'
                : 'No posts published yet.'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setCurrentPage(1); }}
                className="mt-5 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
