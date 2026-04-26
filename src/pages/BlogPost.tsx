import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft, Share2, Clock, Tag, UserCheck, Layers, Zap, ArrowRight, Quote } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getBlogPostBySlug, getBlogPosts, BlogPost as BlogPostType } from '@/lib/blogService';

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);

  useEffect(() => {
    if (slug) fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchPost = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const data = await getBlogPostBySlug(slug);
      setPost(data);

      if (data.category) {
        const all = await getBlogPosts();
        setRelatedPosts(
          all.filter(p => p.category === data.category && p.id !== data.id).slice(0, 3)
        );
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load post', variant: 'destructive' });
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.title, text: post?.excerpt, url });
      } catch {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Link Copied', description: 'URL copied to clipboard.' });
    } catch {}
  };

  const formatDate = (dateString?: string | null) =>
    dateString
      ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/5 flex items-center justify-center font-body">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body relative overflow-hidden">
      <Helmet>
        <title>{post.title} — IJSDS</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-primary/5 rounded-full -mr-32 -mt-32 blur-[100px] opacity-40" />
      <div className="absolute top-[20%] left-0 w-64 h-64 bg-secondary/5 opacity-40" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Nav */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-10 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-border/20 -z-0" />
          <button
            onClick={() => navigate('/blog')}
            className="relative z-10 flex items-center gap-6 font-headline font-black text-xs uppercase tracking-[0.4em] text-foreground/40 hover:text-primary transition-colors bg-secondary/5 px-8 py-6 border border-border/10"
          >
            <ArrowLeft size={16} /> Back to Blog
          </button>
          <div className="relative z-10 flex items-center gap-6">
            <button
              onClick={handleShare}
              className="h-16 w-16 bg-white border border-border/10 flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all shadow-xl group/share"
            >
              <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
            </button>
            <div className="bg-white p-6 md:px-10 border border-border/10 shadow-2xl flex items-center gap-6">
              <Clock size={16} className="text-secondary opacity-40" />
              <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-foreground/30 italic">{formatDate(post.published_at)}</span>
            </div>
          </div>
        </div>

        <article className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-20 text-center md:text-left">
            <div className="flex items-center gap-4 mb-10 justify-center md:justify-start">
              <div className="h-0.5 w-12 bg-primary" />
              {post.category && (
                <span className="font-headline font-black text-[11px] uppercase tracking-[0.5em] text-secondary italic">{post.category}</span>
              )}
            </div>
            <h1 className="text-5xl md:text-8xl font-headline font-black uppercase tracking-tighter leading-[0.85] mb-12 text-foreground">
              {post.title}
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-10 border-t border-border/10 pt-10 justify-center md:justify-start">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-primary flex items-center justify-center text-white border border-primary/10 shadow-xl">
                  <User size={24} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-headline font-black text-[9px] uppercase tracking-[0.5em] text-foreground/20 italic">Curated By</span>
                  <span className="font-headline font-black text-sm uppercase tracking-widest text-foreground">{post.author?.full_name || 'Editorial Office'}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {post.tags?.map(tag => (
                  <Badge key={tag} className="bg-white border border-border/10 text-foreground/40 rounded-none font-headline font-black text-[9px] uppercase tracking-[0.3em] px-5 py-2">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="aspect-video overflow-hidden relative mb-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border border-border/10 group">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
              />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
            </div>
          )}

          {/* Content */}
          <div className="relative mb-32">
            <div className="absolute top-0 right-0 -mr-24 opacity-5 pointer-events-none">
              <Quote size={200} className="text-primary" />
            </div>
            <div className="prose prose-xl max-w-none prose-headings:font-headline prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:font-body prose-p:text-foreground/70 prose-p:leading-[1.8] prose-blockquote:border-l-8 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:p-10 prose-blockquote:italic prose-blockquote:text-2xl lg:prose-blockquote:text-3xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              <div
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
                className="text-foreground lg:text-2xl"
              />
            </div>
          </div>

          {/* Author Bio */}
          {post.author?.bio && (
            <div className="mb-32 p-12 md:p-16 bg-foreground text-white relative overflow-hidden group/bio shadow-2xl border-l-[16px] border-secondary">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 -z-0" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
              <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left">
                <div className="w-24 h-24 bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-xl shrink-0">
                  <User size={48} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
                    <UserCheck size={16} className="text-secondary" />
                    <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-white/30 italic">Author</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-headline font-black uppercase tracking-tighter mb-4">{post.author.full_name}</h3>
                  <p className="font-body text-lg italic text-white/40 leading-relaxed max-w-2xl">{post.author.bio}</p>
                </div>
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="pt-24 border-t border-border/10">
              <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white border border-border/10 flex items-center justify-center text-secondary shadow-xl">
                    <Layers size={21} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/20 italic">More Articles</span>
                    <h3 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter">Continued Reading</h3>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/blog')}
                  className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary hover:text-foreground transition-all group/all"
                >
                  View All <ArrowRight size={14} className="inline ml-2 group-hover/all:translate-x-2 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {relatedPosts.map(related => (
                  <div
                    key={related.id}
                    className="bg-white border border-border/10 group/rel cursor-pointer hover:shadow-2xl transition-all h-full flex flex-col"
                    onClick={() => navigate(`/blog/${related.slug}`)}
                  >
                    {related.featured_image_url && (
                      <div className="aspect-video overflow-hidden relative">
                        <img
                          src={related.featured_image_url}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover/rel:scale-110 transition-transform duration-[1.5s]"
                        />
                      </div>
                    )}
                    <div className="p-8 flex flex-col flex-grow">
                      <h4 className="font-headline font-black text-xl uppercase tracking-tight line-clamp-2 mb-6 group-hover/rel:text-primary transition-colors">{related.title}</h4>
                      <div className="mt-auto pt-6 border-t border-border/5 flex items-center justify-between">
                        <span className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/30 truncate max-w-[150px]">{related.author?.full_name || 'Editorial Office'}</span>
                        <span className="font-headline font-black text-[9px] uppercase tracking-[0.3em] text-secondary">{formatDate(related.published_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
