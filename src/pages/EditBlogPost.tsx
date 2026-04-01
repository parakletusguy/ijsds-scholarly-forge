import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, ArrowLeft, Image as ImageIcon, Tag, Hash, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';

interface BlogPostRecord {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  status: 'draft' | 'published';
  published_at: string | null;
}

export const EditBlogPost = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    category: '',
    tags: '',
    status: 'draft' as 'draft' | 'published'
  });

  const categories = [
    'Research', 'News', 'Events', 'Guidelines', 'Community', 'Publications', 'Announcements'
  ];

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s\-_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || '',
          featured_image_url: data.featured_image_url || '',
          category: data.category || '',
          tags: data.tags ? data.tags.join(', ') : '',
          status: data.status as 'draft' | 'published'
        });
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog post',
        variant: 'destructive',
      });
      navigate('/admin/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

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
        author_id: user.id,
        slug: slug,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Blog post updated successfully' });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Blog post created successfully' });
      }
      navigate('/admin/blogs');
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save blog post',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-12 text-center">
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blogs')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
            <p className="text-muted-foreground">Draft and polish your journal blog entry</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/blogs')}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : (isEditing ? 'Update Post' : 'Publish Post')}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" /> Content Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xl font-bold">Post Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a compelling title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="text-2xl font-bold h-14"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt / Summary</Label>
                <Textarea
                  id="excerpt"
                  placeholder="A brief summary for card previews..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Full Post Content</Label>
                <Textarea
                  id="content"
                  placeholder="Tell your story here..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  required
                  className="min-h-[500px] text-lg leading-relaxed font-serif"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Tag className="h-4 w-4" /> Categorization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Publication Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Journal Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Publishing Status</Label>
                <Select value={formData.status} onValueChange={(v: 'draft' | 'published') => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Private)</SelectItem>
                    <SelectItem value="published">Published (Live)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags <Hash className="h-3 w-3 inline" /></Label>
                <Input
                  id="tags"
                  placeholder="search, analytics, news"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                />
                <p className="text-[10px] text-muted-foreground">Comma separated tags</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Feature Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="featured_image">Cover Image URL</Label>
                <Input
                  id="featured_image"
                  type="url"
                  placeholder="https://..."
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                />
              </div>
              
              {formData.featured_image_url && (
                <div className="rounded-lg overflow-hidden border bg-muted aspect-video flex items-center justify-center">
                  <img 
                    src={formData.featured_image_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground italic">
                Images should be high resolution and professional for the journal blog.
              </p>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};
