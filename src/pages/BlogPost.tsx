import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Tag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getBlogPostBySlug, getBlogPosts, BlogPost as BlogPostType } from '@/lib/blogService';
import { formatDate } from '@/lib/dateUtils';

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
      const [data, all] = await Promise.all([getBlogPostBySlug(slug), getBlogPosts()]);
      setPost(data);
      if (data.category) {
        setRelatedPosts(all.filter(p => p.category === data.category && p.id !== data.id).slice(0, 3));
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
      try { await navigator.share({ title: post?.title, text: post?.excerpt, url }); }
      catch { copyToClipboard(url); }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Link copied to clipboard.' });
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center font-body">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
      <Helmet>
        <title>{post.title} — IJSDS Blog</title>
        <meta name="description" content={post.excerpt || `Read ${post.title} on the IJSDS Blog.`} />
      </Helmet>

      {/* Page Header */}
      <header className="pt-20 pb-10 px-8 border-b border-stone-100 bg-white">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={12} /> Blog
          </Link>

          {/* Category + Date */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {post.category && (
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{post.category}</span>
            )}
            {post.category && post.published_at && <span className="text-stone-200">·</span>}
            <span className="text-[10px] text-stone-400 flex items-center gap-1.5">
              <Calendar size={10} />
              {formatDate(post.published_at)}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-headline text-3xl md:text-4xl font-light tracking-tight text-stone-900 leading-snug mb-6">
            {post.title}
          </h1>

          {/* Author + Share */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <User size={14} className="text-stone-400" />
              <span>{post.author?.full_name || 'Editorial Office'}</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors border border-stone-200 px-4 py-2"
            >
              <Share2 size={12} /> Share
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-12 space-y-12">

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="overflow-hidden border border-stone-100 shadow-sm">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full aspect-video object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-stone-500 leading-relaxed border-l-4 border-primary pl-5 italic">
            {post.excerpt}
          </p>
        )}

        {/* Body */}
        <div
          className="prose prose-stone max-w-none prose-headings:font-headline prose-headings:font-bold prose-headings:tracking-tight prose-p:text-stone-600 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:italic prose-blockquote:text-stone-500 prose-img:border prose-img:border-stone-100"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 border-t border-stone-100 flex items-center gap-3 flex-wrap">
            <Tag size={12} className="text-stone-400" />
            {post.tags.map(tag => (
              <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-stone-400 border border-stone-200 px-3 py-1 bg-white">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio */}
        {post.author?.bio && (
          <div className="p-8 bg-white border border-stone-100 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">About the author</p>
            <p className="text-sm font-bold text-stone-900 mb-3">{post.author.full_name}</p>
            <p className="text-sm text-stone-500 leading-relaxed">{post.author.bio}</p>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="pt-12 border-t border-stone-100 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">More in {post.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map(related => (
                <div
                  key={related.id}
                  onClick={() => navigate(`/blog/${related.slug}`)}
                  className="bg-white border border-stone-100 hover:border-primary/30 transition-all cursor-pointer group overflow-hidden"
                >
                  {related.featured_image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={related.featured_image_url}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-[10px] text-stone-400 mb-1">{formatDate(related.published_at)}</p>
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {related.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default BlogPost;
