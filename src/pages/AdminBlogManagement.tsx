import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Eye, Search, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getAllBlogPosts, deleteBlogPost, BlogPost } from '@/lib/blogService';

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

  const formatDate = (date?: string | null) => {
    if (!date) return 'Draft';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative py-3">
        <Button variant="outline" onClick={() => navigate('/admin')} className="mb-4 absolute top-1 left-3">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Blog Management</h1>
            <p className="text-muted-foreground">Create, edit, and publish blog posts.</p>
          </div>
          <Button onClick={() => navigate('/admin/blogs/new')} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" /> New Post
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
            <CardDescription>Manage published and draft content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or category..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Badge variant="secondary" className="px-4 py-2">{filteredPosts.length} Posts</Badge>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title & Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No posts found.</TableCell>
                    </TableRow>
                  ) : filteredPosts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="font-medium line-clamp-1 max-w-[300px]">{post.title}</div>
                        {post.category && <div className="text-xs text-muted-foreground mt-1">{post.category}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{post.author?.full_name || 'System'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>{post.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {post.status === 'published' ? formatDate(post.published_at) : formatDate(post.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm" variant="outline"
                            onClick={() => navigate(`/blog/${post.slug}`)}
                            disabled={post.status !== 'published'}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            onClick={() => navigate(`/admin/blogs/edit/${post.id}`)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
