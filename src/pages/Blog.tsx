import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Search, ChevronLeft, ChevronRight, BookOpen, Clock, Tag, ArrowRight, Layers, Zap, Globe } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

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

  const POSTS_PER_PAGE = 6;

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
      if (profile) {
        setUserRole(profile);
      }
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

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

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
          : { full_name: 'Anonymous' }
      }));

      setPosts(typedData as BlogPost[]);
      setTotalPages(Math.ceil((count || 0) / POSTS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateExcerpt = (content: string, excerpt?: string) => {
    if (excerpt) return excerpt;
    const textContent = content.replace(/<[^>]*>/g, '');
    const words = textContent.split(' ').slice(0, 35);
    return words.join(' ') + (words.length === 35 ? '...' : '');
  };

  const inputClasses = "bg-white border-border/20 rounded-none focus:border-primary transition-all font-body h-14 text-lg lg:text-xl";

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>Blog IJSDS — Scholarly Discourse Hub</title>
        <meta name="description" content="Latest insights, academic updates, and announcements from the International Journal of Social Work and Development Studies." />
      </Helmet>

      <PageHeader 
        title="Scholarly" 
        subtitle="Discourse" 
        accent="Intellectual Insights"
        description="Explore the latest perspectives, institutional updates, and critical announcements from the IJSDS editorial office and our global community of scholars."
      />

      <ContentSection>
        {/* Discourse Discovery Bar — High Fidelity */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-24 gap-10 relative">
           <div className="absolute top-1/2 left-0 w-full h-px bg-border/10 -z-0"></div>
           
           <div className="relative z-10 flex-1 w-full lg:w-auto">
              <div className="relative group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-hover:text-primary transition-colors" />
                 <Input
                   placeholder="Search the discourse archive..."
                   value={searchTerm}
                   onChange={(e) => {
                     setSearchTerm(e.target.value);
                     setCurrentPage(1);
                   }}
                   className={inputClasses + " pl-16 shadow-2xl"}
                 />
              </div>
           </div>

           <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
              <Select value={selectedCategory} onValueChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className={inputClasses + " w-full sm:w-64 border-border/10 text-foreground/50 shadow-xl"}>
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border/10 font-headline font-black uppercase text-xs tracking-widest">
                  <SelectItem value="all">Global Ledger</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {(userRole.is_admin || userRole.is_editor) && (
                <button 
                  onClick={() => navigate('/blog/admin')}
                  className="w-full sm:w-auto bg-foreground text-white py-4 px-10 font-headline font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary transition-all shadow-2xl flex items-center justify-center gap-4 group"
                >
                  <Layers size={14} className="group-hover:rotate-12 transition-transform" /> Manage Archives
                </button>
              )}
           </div>
        </div>

        {/* Global Progress Indicator */}
        <div className="flex items-center gap-6 mb-16 px-4">
           <Zap size={18} className="text-secondary opacity-30 animate-pulse" />
           <p className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/20 italic">Disseminating Academic Perspectives</p>
           <div className="flex-grow h-px bg-border/5"></div>
        </div>

        {/* Discourse Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border border-border/10 animate-pulse h-[500px]">
                <div className="aspect-video bg-muted/50" />
                <div className="p-10 space-y-6">
                   <div className="h-4 bg-muted/30 w-1/4" />
                   <div className="h-10 bg-muted/30 w-full" />
                   <div className="h-20 bg-muted/30 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-24">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-white border border-border/10 group/card cursor-pointer relative overflow-hidden transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex flex-col h-full"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  {/* Visual Metadata Overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -z-0" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                  
                  {post.featured_image_url && (
                    <div className="aspect-video overflow-hidden relative">
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/card:opacity-100 transition-opacity z-10 flex items-center justify-center">
                         <div className="w-16 h-16 bg-white flex items-center justify-center text-primary shadow-2xl scale-0 group-hover/card:scale-100 transition-transform duration-500">
                            <BookOpen size={24} />
                         </div>
                      </div>
                      <img 
                        src={post.featured_image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-[1.5s]"
                      />
                    </div>
                  )}

                  <div className="p-10 md:p-12 flex flex-col flex-grow relative z-20">
                    <div className="flex items-center justify-between mb-8">
                       {post.category && (
                         <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-secondary"></div>
                            <span className="font-headline font-black text-[9px] uppercase tracking-[0.4em] text-secondary italic">{post.category}</span>
                         </div>
                       )}
                       <div className="flex items-center gap-3 font-headline font-black text-[9px] uppercase tracking-[0.3em] text-foreground/30">
                          <Clock size={12} className="opacity-40" />
                          {formatDate(post.published_at)}
                       </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-headline font-black uppercase tracking-tighter leading-none mb-8 group-hover/card:text-primary transition-colors line-clamp-3">
                      {post.title}
                    </h2>

                    <p className="font-body text-lg italic text-foreground/40 leading-relaxed mb-10 line-clamp-3 border-l-2 border-border/10 pl-6 h-24">
                      {generateExcerpt(post.content, post.excerpt)}
                    </p>

                    <div className="mt-auto pt-8 border-t border-border/5 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-muted rounded-none flex items-center justify-center border border-border/10 group-hover/card:bg-foreground group-hover/card:text-white transition-all">
                             <User size={14} />
                          </div>
                          <span className="font-headline font-black text-[10px] uppercase tracking-widest text-foreground/30 group-hover/card:text-foreground transition-colors">{post.author_profile?.full_name || 'Anonymous Scholar'}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-primary group/link">
                          <span className="font-headline font-black text-[10px] uppercase tracking-[0.3em] opacity-0 group-hover/card:opacity-100 transition-opacity">Read Ledger</span>
                          <ArrowRight size={18} className="group-hover/card:translate-x-2 transition-transform" />
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination — Chronicle Navigation */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-10">
                 <div className="h-px w-32 bg-border/20"></div>
                 <div className="flex items-center gap-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-16 w-16 bg-white border border-border/10 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary disabled:opacity-20 transition-all shadow-xl group/nav"
                    >
                      <ChevronLeft size={24} className="group-hover/nav:-translate-x-1 transition-transform" />
                    </button>
                    
                    <div className="flex items-center gap-3">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`h-16 w-16 font-headline font-black text-xs uppercase tracking-widest transition-all ${currentPage === page ? "bg-primary text-white shadow-2xl scale-110" : "bg-white text-foreground/30 border border-border/10 hover:border-secondary hover:text-secondary"}`}
                          >
                            0{page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="h-16 w-16 bg-white border border-border/10 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary disabled:opacity-20 transition-all shadow-xl group/nav"
                    >
                      <ChevronRight size={24} className="group-hover/nav:translate-x-1 transition-transform" />
                    </button>
                 </div>
                 <p className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/10 italic">Archive Chronology Node {currentPage} of {totalPages}</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-foreground text-white p-24 text-center relative overflow-hidden group shadow-2xl">
             <div className="absolute inset-0 bg-white opacity-5 -z-0" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
             <div className="relative z-10 max-w-2xl mx-auto">
                <Search className="h-16 w-16 text-secondary mx-auto mb-10 opacity-20" />
                <h3 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter mb-6 leading-none">Record <br/><span className="text-secondary italic">Anomaly</span></h3>
                <p className="text-xl font-body italic text-white/40 mb-12 border-l-4 border-primary/40 pl-8 text-left">
                  {searchTerm || selectedCategory !== 'all' 
                    ? "Your query did not yield any discourse entries within the current archive parameters."
                    : "The scholarly discourse ledger is currently undergoing synchronization. Please check back for updates."
                  }
                </p>
                <button 
                  onClick={() => {setSearchTerm(''); setSelectedCategory('all'); setCurrentPage(1);}}
                  className="bg-white text-foreground px-12 py-6 font-headline font-black text-[10px] uppercase tracking-[0.4em] hover:bg-secondary hover:text-white transition-all shadow-xl"
                >
                  Reset Discovery Node
                </button>
             </div>
          </div>
        )}
      </ContentSection>
    </div>
  );
};

export default Blog;