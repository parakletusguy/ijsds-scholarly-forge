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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  author_profile: {
    full_name: string;
  } | null;
}

interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  category: string;
  tags: string;
  status: 'draft' | 'published';
}

export const BlogAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [userRole, setUserRole] = useState<{ is_admin: boolean; is_editor: boolean }>({ is_admin: false, is_editor: false });
  
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    category: '',
    tags: '',
    status: 'draft'
  });

  const categories = [
    'Research',
    'News',
    'Events',
    'Guidelines',
    'Community',
    'Publications',
    'Announcements'
  ];

  useEffect(() => {
    checkUserRole();
  }, [user]);

  useEffect(() => {
    if (userRole.is_admin || userRole.is_editor) {
      fetchPosts();
    }
  }, [userRole]);

  const checkUserRole = async () => {
    if (!user) {
      navigate('/blog');
      return;
    }
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, is_editor')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (profile && (profile.is_admin || profile.is_editor)) {
        setUserRole(profile);
      } else {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this page',
          variant: 'destructive',
        });
        navigate('/blog');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate('/blog');
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author_profile:profiles!blog_posts_author_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : null;

      const slug = generateSlug(formData.title);
      
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || null,
        featured_image_url: formData.featured_image_url || null,
        category: formData.category || null,
        tags: tagsArray,
        status: formData.status,
        slug: editingPost ? editingPost.id : slug, // Keep existing slug for edits, generate for new
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
        author_id: user.id,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Blog post updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Blog post created successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save blog post',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      featured_image_url: post.featured_image_url || '',
      category: post.category || '',
      tags: post.tags ? post.tags.join(', ') : '',
      status: post.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Blog post deleted successfully',
      });
      
      fetchPosts();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      featured_image_url: '',
      category: '',
      tags: '',
      status: 'draft'
    });
    setEditingPost(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog Administration</h1>
          <p className="text-muted-foreground">Manage blog posts and content</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
              <DialogDescription>
                {editingPost ? 'Update the blog post details' : 'Fill out the form to create a new blog post'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt (Optional)</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief summary of the post..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  required
                  rows={10}
                  placeholder="Write your blog post content here..."
                />
              </div>

              <div>
                <Label htmlFor="featured_image">Featured Image URL (Optional)</Label>
                <Input
                  id="featured_image"
                  type="url"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'draft' | 'published') => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingPost ? 'Update' : 'Create'} Post
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
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
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{post.title}</div>
                        {post.tags && (
                          <div className="flex gap-1 mt-1">
                            {post.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {post.author_profile?.full_name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.category ? (
                        <Badge variant="secondary">{post.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.published_at || post.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {post.status === 'published' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/blog/${post.id}`)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(post.id)}
                        >
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