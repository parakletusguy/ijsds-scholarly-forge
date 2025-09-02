import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, ArrowLeft, Share2, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    bio?: string;
  } | null;
}

export const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author_profile:profiles(full_name, bio)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      setPost(data as BlogPost);
      
      // Fetch related posts
      if (data.category) {
        const { data: related } = await supabase
          .from('blog_posts')
          .select(`
            id, title, content, excerpt, category, tags, featured_image_url, published_at,
            author_profile:profiles(full_name)
          `)
          .eq('status', 'published')
          .eq('category', data.category)
          .neq('id', id)
          .order('published_at', { ascending: false })
          .limit(3);

        setRelatedPosts((related || []) as BlogPost[]);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog post',
        variant: 'destructive',
      });
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: url,
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Link copied!',
        description: 'Post URL copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-muted animate-pulse rounded mb-8" />
            <div className="aspect-video bg-muted animate-pulse rounded-lg mb-8" />
            <div className="space-y-4">
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Button onClick={() => navigate('/blog')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/blog')}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        <article className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img 
                src={post.featured_image_url} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {post.category && (
                <Badge variant="secondary">{post.category}</Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author_profile?.full_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="text-foreground"
            />
          </div>

          {/* Author Bio */}
          {post.author_profile?.bio && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">About the Author</h3>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{post.author_profile.full_name}</h4>
                    <p className="text-muted-foreground mt-1">{post.author_profile.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section>
              <h3 className="text-2xl font-bold mb-6">Related Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card 
                    key={relatedPost.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/blog/${relatedPost.id}`)}
                  >
                    {relatedPost.featured_image_url && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img 
                          src={relatedPost.featured_image_url} 
                          alt={relatedPost.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h4 className="font-semibold line-clamp-2 mb-2">{relatedPost.title}</h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{relatedPost.author_profile?.full_name || 'Anonymous'}</span>
                        <span>{formatDate(relatedPost.published_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  );
};