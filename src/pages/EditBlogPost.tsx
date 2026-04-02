import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, ArrowLeft, Image as ImageIcon, Tag, Hash, FileText, BookOpen, GraduationCap, ShieldCheck, Send, Activity, Info, ChevronRight, Layout } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

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
    if (isEditing) fetchPost();
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
    } catch (error) { navigate('/admin/blogs'); }
    finally { setLoading(false); }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        await supabase.from('blog_posts').update(postData).eq('id', id);
        toast({ title: 'Narrative Optimized', description: 'Institutional repository updated successfully.' });
      } else {
        await supabase.from('blog_posts').insert([postData]);
        toast({ title: 'Scholarly Record Created', description: 'New blog post has been synchronized with the press registry.' });
      }
      navigate('/admin/blogs');
    } catch (error: any) {
      toast({ title: 'Command Refused', description: 'Failed to synchronize narrative with the registry.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const cardClasses = "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group";
  const labelClasses = "font-headline font-black text-[10px] uppercase tracking-widest text-foreground/40 mb-4 block";
  const inputClasses = "bg-muted/10 border-border/60 rounded-none focus:border-primary transition-all font-body text-sm py-6";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <PageHeader 
        title={isEditing ? "Edit" : "Issue"} 
        subtitle="Narrative" 
        accent="Editorial Workspace"
        description="Draft and synchronize high-impact scholarly blog entries. Curate narratives that bridge judicial practice and social work research."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate('/admin/blogs')} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Exit Workspace
           </Button>
           
           <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate('/admin/blogs')} className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest px-8 py-6 h-auto h-auto border-border/40 hover:border-primary hover:text-primary transition-all">
                 <X className="h-4 w-4 mr-2" /> Discard Changes
              </Button>
              <Button onClick={() => handleSave()} disabled={saving} className="bg-primary hover:bg-secondary text-white rounded-none font-headline font-black uppercase text-[10px] tracking-widest px-12 py-6 h-auto shadow-xl group">
                 {saving ? 'Synchronizing...' : <><Save className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform" /> {isEditing ? 'Archive Narrative' : 'Finalize & Publish'}</>}
              </Button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Narrative Editor Main */}
          <div className="lg:col-span-8 space-y-12">
            <div className={cardClasses + " border-t-8 border-foreground"}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-muted/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
               <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-4 pb-6 border-b border-border/20">
                     <div className="p-3 bg-primary text-white"><Layout className="h-5 w-5" /></div>
                     <h2 className="text-2xl font-headline font-black uppercase tracking-tighter">Content Intelligence</h2>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="title" className="text-xl font-headline font-black uppercase tracking-tight text-foreground/40">Manuscript Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter a compelling scholarly title..."
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="text-4xl font-headline font-black bg-transparent border-0 border-b-4 border-muted/50 focus:border-primary rounded-none h-24 px-0 placeholder:text-foreground/10 transition-all tracking-tight"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="excerpt" className={labelClasses}>Dossier Abstract / Summary</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Enter a concise high-impact summary for archival previews..."
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      rows={3}
                      className={inputClasses + " resize-none min-h-[120px] font-body italic italic-primary"}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="content" className={labelClasses}>Full Scholarly Narrative *</Label>
                    <div className="relative">
                       <Textarea
                         id="content"
                         placeholder="Synthesize your research findings and insights here..."
                         value={formData.content}
                         onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                         required
                         className="min-h-[700px] bg-muted/5 border-border/40 rounded-none focus:border-primary text-lg leading-relaxed font-serif p-10 transition-all"
                       />
                       <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none font-headline font-black text-8xl uppercase tracking-tighter select-none">Scholarly</div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Metadata Dossier Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <div className={cardClasses}>
               <div className="flex items-center gap-4 mb-10">
                  <Tag className="h-4 w-4 text-primary" />
                  <h4 className="font-headline font-black text-[11px] uppercase tracking-[0.3em] text-foreground/40">Categorization</h4>
               </div>
               
               <div className="space-y-10">
                  <div className="space-y-4">
                    <Label className={labelClasses}>Registry Stream</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                      <SelectTrigger className="rounded-none border-border/40 h-14 font-headline font-black uppercase text-[10px] tracking-widest bg-muted/10 px-6">
                        <SelectValue placeholder="Select Intelligence Stream" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest">
                        {categories.map(c => (
                          <SelectItem key={c} value={c} className="py-4 hover:bg-primary/5">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className={labelClasses}>Publication State</Label>
                    <Select value={formData.status} onValueChange={(v: 'draft' | 'published') => setFormData(p => ({ ...p, status: v }))}>
                      <SelectTrigger className="rounded-none border-border/40 h-14 font-headline font-black uppercase text-[10px] tracking-widest bg-muted/10 px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest">
                        <SelectItem value="draft" className="py-4">Draft (Registry Archive)</SelectItem>
                        <SelectItem value="published" className="py-4">Published (Live Stream)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="tags" className={labelClasses}>Taxonomy Tags <Hash size={10} className="inline ml-1" /></Label>
                    <div className="relative">
                       <Input
                         id="tags"
                         placeholder="research, metadata, news..."
                         value={formData.tags}
                         onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                         className={inputClasses + " pl-10 h-14"}
                       />
                       <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                    </div>
                    <p className="text-[10px] font-body text-foreground/30 italic">Utilize commas for distinct scholarly classification.</p>
                  </div>
               </div>
            </div>

            <div className={cardClasses}>
               <div className="flex items-center gap-4 mb-10">
                  <ImageIcon className="h-4 w-4 text-secondary" />
                  <h4 className="font-headline font-black text-[11px] uppercase tracking-[0.3em] text-foreground/40">Visual Identity</h4>
               </div>
               
               <div className="space-y-8">
                  <div className="space-y-4">
                    <Label htmlFor="featured_image" className={labelClasses}>Cover Asset URL</Label>
                    <Input
                      id="featured_image"
                      type="url"
                      placeholder="https://institutional-assets.ijsds.org/image.jpg"
                      value={formData.featured_image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                      className={inputClasses + " h-14"}
                    />
                  </div>
                  
                  {formData.featured_image_url ? (
                    <div className="border-4 border-foreground p-2 shadow-2xl group relative">
                       <div className="absolute inset-0 bg-primary mix-blend-multiply opacity-10 group-hover:opacity-0 transition-opacity"></div>
                       <div className="overflow-hidden aspect-video">
                          <img 
                            src={formData.featured_image_url} 
                            alt="Dossier Identity Preview" 
                            className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                       </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-border/40 aspect-video flex flex-col items-center justify-center bg-muted/10 gap-4">
                       <ImageIcon className="h-8 w-8 text-foreground/20" />
                       <span className="font-headline font-black uppercase text-[8px] tracking-widest text-foreground/30">Asset Preview Unavailable</span>
                    </div>
                  )}
                  
                  <div className="bg-secondary/5 p-6 border-l-4 border-secondary">
                     <p className="text-[10px] font-body text-foreground/40 leading-relaxed italic">
                        Visual assets must maintain high institutional fidelity and strictly adhere to the journal's scholarly branding standards.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </ContentSection>
    </div>
  );
};
