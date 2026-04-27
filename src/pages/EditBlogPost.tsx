import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ArrowLeft, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostById, createBlogPost, updateBlogPost, uploadBlogImage } from '@/lib/blogService';

const CATEGORIES = ['Research', 'News', 'Events', 'Guidelines', 'Community', 'Publications', 'Announcements'];

const labelClass = 'text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block';
const inputClass = 'border-stone-200 rounded-none focus:border-primary bg-white text-sm transition-colors';

export const EditBlogPost = () => {
  const { profile } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    category: '',
    tags: '',
    status: 'draft' as 'draft' | 'published',
  });

  const set = (key: string, value: string) => setFormData(p => ({ ...p, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadBlogImage(file);
      set('featured_image_url', url);
      toast({ title: 'Image uploaded.' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message || 'Could not upload image.', variant: 'destructive' });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (isEditing) {
      getPostById(id!)
        .then(data => {
          setFormData({
            title: data.title,
            content: data.content || '',
            excerpt: data.excerpt || '',
            featured_image_url: data.featured_image_url || '',
            category: data.category || '',
            tags: data.tags ? data.tags.join(', ') : '',
            status: data.status as 'draft' | 'published',
          });
        })
        .catch(() => navigate('/admin/blogs'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile) return;
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({ title: 'Title and content are required.', variant: 'destructive' });
      return;
    }
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
      if (isEditing) {
        await updateBlogPost(id!, payload);
        toast({ title: 'Post updated.' });
      } else {
        await createBlogPost(payload);
        toast({ title: 'Post created.' });
      }
      navigate('/admin/blogs');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save post.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pb-16 bg-stone-50 min-h-screen font-body text-stone-900">

      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-8 py-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/blogs')}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors"
            >
              <ArrowLeft size={12} /> All Posts
            </button>
            <span className="text-stone-200">/</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">
              {isEditing ? 'Edit Post' : 'New Post'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Select value={formData.status} onValueChange={v => set('status', v)}>
              <SelectTrigger className="h-9 w-32 text-[10px] font-bold uppercase tracking-widest border-stone-200 rounded-none bg-white focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none text-[10px] font-bold uppercase tracking-widest">
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save size={13} />
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main — title + excerpt + content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title */}
            <div className="bg-white border border-stone-100 p-6 space-y-3">
              <Label htmlFor="title" className={labelClass}>Title *</Label>
              <Input
                id="title"
                placeholder="Post title..."
                value={formData.title}
                onChange={e => set('title', e.target.value)}
                required
                className={inputClass + ' text-xl font-bold h-12'}
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white border border-stone-100 p-6 space-y-3">
              <Label htmlFor="excerpt" className={labelClass}>Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="Short summary shown in the blog list..."
                value={formData.excerpt}
                onChange={e => set('excerpt', e.target.value)}
                rows={3}
                className={inputClass + ' resize-none'}
              />
            </div>

            {/* Content */}
            <div className="bg-white border border-stone-100 p-6 space-y-3">
              <Label htmlFor="content" className={labelClass}>Content * <span className="normal-case font-normal text-stone-300 ml-1">HTML supported</span></Label>
              <Textarea
                id="content"
                placeholder="Write your post here..."
                value={formData.content}
                onChange={e => set('content', e.target.value)}
                required
                className={inputClass + ' min-h-[520px] resize-y font-mono text-sm leading-relaxed'}
              />
            </div>

          </div>

          {/* Sidebar — settings + image */}
          <div className="space-y-6">

            {/* Settings */}
            <div className="bg-white border border-stone-100 p-6 space-y-5">
              <p className={labelClass}>Settings</p>

              <div className="space-y-2">
                <Label htmlFor="category" className={labelClass}>Category</Label>
                <Select value={formData.category} onValueChange={v => set('category', v)}>
                  <SelectTrigger className="rounded-none border-stone-200 h-10 text-sm bg-white focus:border-primary w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none text-sm">
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className={labelClass}>Tags</Label>
                <Input
                  id="tags"
                  placeholder="research, news, events..."
                  value={formData.tags}
                  onChange={e => set('tags', e.target.value)}
                  className={inputClass + ' h-10'}
                />
                <p className="text-[10px] text-stone-400">Separate with commas</p>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white border border-stone-100 p-6 space-y-4">
              <p className={labelClass}>Featured Image</p>

              {/* Upload button */}
              <div>
                <label className={`inline-flex items-center gap-2 cursor-pointer border border-stone-200 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:border-primary hover:text-primary transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Upload size={12} />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>

              {/* URL fallback */}
              <div className="space-y-1">
                <Label htmlFor="featured_image" className={labelClass}>Or paste URL</Label>
                <Input
                  id="featured_image"
                  type="url"
                  placeholder="https://..."
                  value={formData.featured_image_url}
                  onChange={e => set('featured_image_url', e.target.value)}
                  className={inputClass + ' h-10'}
                />
              </div>

              {/* Preview */}
              {formData.featured_image_url ? (
                <div className="relative border border-stone-200 overflow-hidden aspect-video group">
                  <img
                    src={formData.featured_image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                  <button
                    type="button"
                    onClick={() => set('featured_image_url', '')}
                    className="absolute top-2 right-2 bg-white border border-stone-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200"
                    title="Remove image"
                  >
                    <X size={12} className="text-stone-500 hover:text-red-500" />
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-stone-200 aspect-video flex flex-col items-center justify-center bg-stone-50 gap-2">
                  <ImageIcon size={24} className="text-stone-300" />
                  <span className="text-[10px] uppercase tracking-widest text-stone-300">No image set</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
