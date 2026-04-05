import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Eye, Search, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  status: 'draft' | 'published';
  category: string | null;
  created_at: string;
  published_at: string | null;
  author_id: string | null;
  author_profile?: {
    full_name: string;
  } | null;
}

export const AdminBlogManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<{ is_admin: boolean; is_editor: boolean }>({ is_admin: false, is_editor: false });

  useEffect(() => {
    checkUserRole();
  }, [user]);

  const checkUserRole = async () => {
    if (!user) { navigate('/auth'); return; }
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, is_editor')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (profile && (profile.is_admin || profile.is_editor)) {
        setUserRole(profile);
        fetchPosts();
      } else {
        toast({ title: 'Access Denied', description: 'Institutional credentials required.', variant: 'destructive' });
        navigate('/dashboard');
      }
    } catch (error) { navigate('/dashboard'); }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author_profile:profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data as any[]);
    } catch (error) {
      toast({ title: 'Sync Error', description: 'Failed to access narrative registry.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently archive this scholarly narrative?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Registry Updated', description: 'Blog post has been removed from the public architecture.' });
      fetchPosts();
    } catch (error) {
      toast({ title: 'Command Refused', description: 'Failed to update narrative registry.', variant: 'destructive' });
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (date: string | null) => {
    if (!date) return 'Awaiting Submission';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex items-center gap-2">
        <div className="w-4 h-4 bg-primary rounded-full animate-bounce" />
        <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-.3s]" />
        <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-.5s]" />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative py-3">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin')}
          className="mb-4 absolute top-1 left-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Command Hub
        </Button>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Blog Management</h1>
            <p className="text-muted-foreground">
              Create, edit, and publish scholarly narratives and community insights.
            </p>
          </div>
          <Button onClick={() => navigate('/admin/blogs/new')} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Narrative Registry</CardTitle>
            <CardDescription>
              Manage all your published and drafted scholarly content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, category, or theme..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <Badge variant="secondary" className="px-4 py-2">
                {filteredPosts.length} Posts
              </Badge>
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
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No posts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="font-medium line-clamp-1 max-w-[300px]" title={post.title}>
                            {post.title}
                          </div>
                          {post.category && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {post.category}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {post.author_profile?.full_name || 'System Curator'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {post.status === 'published' ? formatDate(post.published_at) : formatDate(post.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/blog/${post.id}`)}
                              disabled={post.status !== 'published'}
                              title="View post"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/blogs/edit/${post.id}`)}
                              title="Edit post"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(post.id)}
                              title="Delete post"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
