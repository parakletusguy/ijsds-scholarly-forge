import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Eye, Calendar, User, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getAllBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, getPostById, BlogPost } from '@/lib/blogService';
import { formatDate } from '@/lib/dateUtils';

const CATEGORIES = ['Research', 'News', 'Events', 'Guidelines', 'Community', 'Publications', 'Announcements'];

interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  category: string;
  tags: string;
  status: 'draft' | 'published';
}

const EMPTY_FORM: PostFormData = { title: '', content: '', excerpt: '', featured_image_url: '', category: '', tags: '', status: 'draft' };

export const BlogAdmin = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PostFormData>(EMPTY_FORM);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { navigate('/blog'); return; }
    if (!profile.is_admin && !profile.is_editor) {
      toast({ title: 'Access Denied', variant: 'destructive' });
      navigate('/blog');
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

  const handleEdit = async (post: BlogPost) => {
    try {
      const full = await getPostById(post.id);
      setEditingPost(full);
      setFormData({
        title: full.title,
        content: full.content || '',
        excerpt: full.excerpt || '',
        featured_image_url: full.featured_image_url || '',
        category: full.category || '',
        tags: full.tags ? full.tags.join(', ') : '',
        status: full.status as 'draft' | 'published',
      });
      setIsDialogOpen(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to load post.', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        featured_image_url: formData.featured_image_url || undefined,
        category: formData.category || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        status: formData.status,
      };

      if (editingPost) {
        await updateBlogPost(editingPost.id, payload);
        toast({ title: 'Updated', description: 'Post updated successfully.' });
      } else {
        await createBlogPost(payload);
        toast({ title: 'Created', description: 'Post created successfully.' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save post.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await deleteBlogPost(id);
      toast({ title: 'Deleted' });
      fetchPosts();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete post.', variant: 'destructive' });
    }
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setEditingPost(null); };

  const formatDateDisplay = (date?: string | null) => date ? formatDate(date, 'short') : '—';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog Administration</h1>
          <p className="text-muted-foreground">Manage blog posts and content</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={open => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
              <DialogDescription>{editingPost ? 'Update the blog post details' : 'Fill out the form to create a new blog post'}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt (Optional)</Label>
                <Textarea id="excerpt" value={formData.excerpt} onChange={e => setFormData(p => ({ ...p, excerpt: e.target.value }))} rows={3} placeholder="Brief summary..." />
              </div>
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea id="content" value={formData.content} onChange={e => setFormData(p => ({ ...p, content: e.target.value }))} required rows={10} placeholder="Write your post here..." />
              </div>
              <div>
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <Input id="featured_image" type="url" value={formData.featured_image_url} onChange={e => setFormData(p => ({ ...p, featured_image_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v: 'draft' | 'published') => setFormData(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" value={formData.tags} onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))} placeholder="tag1, tag2, tag3" />
                <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}><X className="h-4 w-4 mr-2" /> Cancel</Button>
                <Button type="submit" disabled={saving}><Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : editingPost ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Blog Posts</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map(post => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="font-medium">{post.title}</div>
                      {post.tags && (
                        <div className="flex gap-1 mt-1">
                          {post.tags.slice(0, 3).map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {post.author?.full_name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.category ? <Badge variant="secondary">{post.category}</Badge> : <span className="text-muted-foreground">None</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>{post.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDateDisplay(post.published_at || post.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {post.status === 'published' && (
                          <Button size="sm" variant="outline" onClick={() => navigate(`/blog/${post.slug}`)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
