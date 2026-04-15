import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Search, ChevronLeft, ChevronRight, Layers, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  published_at: string;
  author_profile: {
    full_name: string;
  } | null;
}

export const Blog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [userRole, setUserRole] = useState<{ is_admin: boolean; is_editor: boolean }>({ is_admin: false, is_editor: false });

  const POSTS_PER_PAGE = 8;

  useEffect(() => {
    fetchUserRole();
    fetchPosts();
    fetchCategories();
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params);
  }, [searchTerm, selectedCategory, currentPage, setSearchParams]);

  const fetchUserRole = async () => {
    if (!user) return;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, is_editor')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      if (profile) setUserRole(profile);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('category')
        .eq('status', 'published')
        .not('category', 'is', null);
      if (error) throw error;
      const uniqueCategories = [...new Set(data.map(post => post.category))].filter(Boolean);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (searchTerm) query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      if (selectedCategory !== 'all') query = query.eq('category', selectedCategory);

      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      const authorIds = [...new Set(data?.map(post => post.author_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', authorIds);

      const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);

      const typedData = (data || []).map(post => ({
        ...post,
        author_profile: post.author_id && profileMap.has(post.author_id)
          ? { full_name: profileMap.get(post.author_id)!.full_name }
          : { full_name: 'Editorial Office' }
      }));

      setPosts(typedData as BlogPost[]);
      setTotalPages(Math.ceil((count || 0) / POSTS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const generateExcerpt = (content: string, excerpt?: string) => {
    if (excerpt) return excerpt;
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(' ').slice(0, 30);
    return words.join(' ') + (words.length === 30 ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8] font-body">
      <Helmet>
        <title>Blog — IJSDS</title>
        <meta name="description" content="Latest news, updates, and perspectives from the International Journal of Social Work and Development Studies." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-24">

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-stone-200">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary block mb-3">
                From the Editorial Office
              </span>
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
                News & Updates
              </h1>
            </div>
            {(userRole.is_admin || userRole.is_editor) && (
              <button
                onClick={() => navigate('/blog/admin')}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors border border-stone-200 px-4 py-2"
              >
                <Layers size={13} /> Manage Posts
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 bg-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 text-sm border border-stone-200 bg-white focus:border-primary focus:outline-none transition-colors text-stone-600"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse border-b border-stone-100 pb-6">
                <div className="h-3 bg-stone-100 w-24 mb-3 rounded" />
                <div className="h-5 bg-stone-100 w-3/4 mb-2 rounded" />
                <div className="h-4 bg-stone-100 w-full rounded" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="divide-y divide-stone-100">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="py-8 group cursor-pointer"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {post.featured_image_url && (
                      <div className="sm:w-32 sm:h-20 w-full h-40 shrink-0 overflow-hidden bg-stone-100">
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
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                            {post.category}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {formatDate(post.published_at)}
                        </span>
                      </div>
                      <h2 className="font-headline text-lg font-bold text-stone-900 group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-sm text-stone-500 leading-relaxed line-clamp-2 mb-3">
                        {generateExcerpt(post.content, post.excerpt)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-400 flex items-center gap-1.5">
                          <User size={11} />
                          {post.author_profile?.full_name || 'Editorial Office'}
                        </span>
                        <span className="text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Read <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 pt-8 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-primary disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="text-xs text-stone-400">
                  Page {currentPage} of {totalPages}
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
          <div className="py-20 text-center border border-stone-100 bg-white">
            <p className="text-stone-400 text-sm mb-2">
              {searchTerm || selectedCategory !== 'all'
                ? 'No articles matched your search.'
                : 'No posts have been published yet.'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setCurrentPage(1); }}
                className="mt-4 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Blog;