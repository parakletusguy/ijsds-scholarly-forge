import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
        .select(`
          *,
          author_profile:profiles!blog_posts_author_id_fkey(full_name)
        `)
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

      setPosts(data || []);
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
    
    // Strip HTML tags and get first 50 words
    const textContent = content.replace(/<[^>]*>/g, '');
    const words = textContent.split(' ').slice(0, 50);
    return words.join(' ') + (words.length === 50 ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Latest insights, updates, and announcements from the International Journal of Social Work and Development Studies
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {(userRole.is_admin || userRole.is_editor) && (
            <Button onClick={() => navigate('/blog/admin')}>
              Manage Posts
            </Button>
          )}
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <div className="aspect-video bg-muted animate-pulse rounded-t-lg" />
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/blog/${post.id}`)}>
                  {post.featured_image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img 
                        src={post.featured_image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.published_at)}
                      </div>
                      {post.category && (
                        <Badge variant="secondary">{post.category}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {post.author_profile?.full_name || 'Anonymous'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {generateExcerpt(post.content, post.excerpt)}
                    </p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Check back soon for updates and insights.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};