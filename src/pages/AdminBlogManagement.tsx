import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Search, ArrowLeft, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getAllBlogPosts, deleteBlogPost, BlogPost } from '@/lib/blogService';
import { formatDate } from '@/lib/dateUtils';

export const AdminBlogManagement = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { navigate('/auth'); return; }
    if (!profile.is_admin && !profile.is_editor) {
      toast({ title: 'Access Denied', description: 'Editor credentials required.', variant: 'destructive' });
      navigate('/dashboard');
      return;
    }
    fetchPosts();
  }, [profile, authLoading]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      setPosts(await getAllBlogPosts());
    } catch {
      toast({ title: 'Error', description: 'Failed to load posts.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await deleteBlogPost(id);
      toast({ title: 'Deleted', description: 'Post removed.' });
      fetchPosts();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete post.', variant: 'destructive' });
    }
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateDisplay = (date?: string | null) => date ? formatDate(date, 'short') : '—';

  if (loading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pb-16 bg-stone-50 min-h-screen font-body text-stone-900">

      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors"
            >
              <ArrowLeft size={12} /> Admin
            </button>
            <span className="text-stone-200">/</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">Blog Posts</span>
          </div>
          <button
            onClick={() => navigate('/admin/blogs/new')}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            <Plus size={13} /> New Post
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10 space-y-6">

        {/* Search + count */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 bg-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <span className="text-xs text-stone-400 font-body">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white border border-stone-100 overflow-hidden">
          {filteredPosts.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-stone-400">
              <FileText size={32} className="opacity-30" />
              <p className="text-sm">{searchQuery ? 'No posts matched your search.' : 'No posts yet.'}</p>
              {!searchQuery && (
                <button
                  onClick={() => navigate('/admin/blogs/new')}
                  className="text-xs font-bold uppercase tracking-widest text-primary hover:underline mt-1"
                >
                  Create your first post
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">Title</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 hidden sm:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-stone-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-900 line-clamp-1 max-w-xs group-hover:text-primary transition-colors">
                        {post.title}
                      </p>
                      {post.author?.full_name && (
                        <p className="text-xs text-stone-400 mt-0.5">{post.author.full_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      {post.category
                        ? <span className="text-xs text-stone-500">{post.category}</span>
                        : <span className="text-xs text-stone-300">—</span>}
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 ${
                        post.status === 'published'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-stone-100 text-stone-500'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-xs text-stone-400">
                      {formatDateDisplay(post.status === 'published' ? post.published_at : post.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/blog/${post.slug}`)}
                          disabled={post.status !== 'published'}
                          className="p-2 text-stone-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/blogs/edit/${post.id}`)}
                          className="p-2 text-stone-400 hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};
