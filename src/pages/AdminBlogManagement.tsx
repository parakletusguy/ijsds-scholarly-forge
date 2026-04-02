import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Eye, Calendar, User, Search, Filter, ArrowLeft, BookOpen, GraduationCap, ShieldCheck, Activity, ChevronRight, Hash, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

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

  const cardClasses = "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group mb-12";
  const labelClasses = "font-headline font-black text-[10px] uppercase tracking-widest text-foreground/40 mb-4 block";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <PageHeader 
        title="Scholarly" 
        subtitle="Press" 
        accent="Narrative Governance"
        description="Curate judicial and social work narratives. Manage the dissemination of high-impact journal blog content, community insights, and professional briefings."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate('/dashboard')} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Return to Command Hub
           </Button>
           
           <Button onClick={() => navigate('/admin/blogs/new')} className="bg-primary hover:bg-secondary text-white rounded-none font-headline font-black uppercase text-xs tracking-widest px-12 py-7 h-auto shadow-xl group">
              <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              Generate New Narrative
           </Button>
        </div>

        {/* Intelligence Search Bar */}
        <div className="bg-white p-8 border-t-8 border-foreground shadow-xl mb-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
           <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
              <div className="relative flex-1 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                 <Input
                   placeholder="Audit by title, category, or scholarly theme..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-12 bg-muted/10 border-border/40 rounded-none h-16 font-body text-sm focus:border-primary transition-all"
                 />
              </div>
              <div className="flex items-center gap-4 bg-muted/20 p-4 border border-border/10">
                 <ShieldCheck size={14} className="text-secondary" />
                 <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40 italic">Audit Stream: {filteredPosts.length} Registered Narratives</span>
              </div>
           </div>
        </div>

        {/* Narrative Registry Table */}
        <div className="bg-white border border-border/40 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b border-border/40 hover:bg-transparent">
                    <TableHead className="font-headline font-black uppercase text-[10px] tracking-[0.2em] py-8 px-8 text-foreground/40">Publication Intelligence</TableHead>
                    <TableHead className="font-headline font-black uppercase text-[10px] tracking-[0.2em] py-8 px-6 text-foreground/40">Scholarly Identity</TableHead>
                    <TableHead className="font-headline font-black uppercase text-[10px] tracking-[0.2em] py-8 px-6 text-foreground/40 text-center">Protocol State</TableHead>
                    <TableHead className="font-headline font-black uppercase text-[10px] tracking-[0.2em] py-8 px-6 text-foreground/40">Temporal Audit</TableHead>
                    <TableHead className="font-headline font-black uppercase text-[10px] tracking-[0.2em] py-8 px-8 text-foreground/40 text-right">Audit Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-24 text-center font-body text-sm italic opacity-40">Narrative registry is currently clear.</TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id} className="border-b border-border/10 hover:bg-secondary/5 transition-colors group">
                        <TableCell className="py-10 px-8">
                           <div className="flex flex-col gap-2">
                              <h3 className="font-headline font-black uppercase text-sm tracking-tight leading-tight group-hover:text-primary transition-colors max-w-[400px]">{post.title}</h3>
                              {post.category && (
                                <div className="flex items-center gap-2 font-headline font-bold text-[9px] uppercase tracking-[0.2em] text-secondary">
                                   <Hash size={10} /> {post.category}
                                </div>
                              )}
                           </div>
                        </TableCell>
                        <TableCell className="py-10 px-6">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-none text-foreground/30"><User size={12} /></div>
                              <span className="font-body text-xs text-foreground/60">{post.author_profile?.full_name || 'System Curator'}</span>
                           </div>
                        </TableCell>
                        <TableCell className="py-10 px-6 text-center">
                           <Badge variant="outline" className={`rounded-none font-headline font-bold uppercase text-[8px] tracking-[0.2em] px-3 py-1.5 border-2 ${post.status === 'published' ? 'bg-green-500/5 text-green-600 border-green-500/30' : 'bg-muted/50 text-foreground/30 border-border/40'}`}>
                             {post.status}
                           </Badge>
                        </TableCell>
                        <TableCell className="py-10 px-6">
                           <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[10px] font-body text-foreground/30">
                                 <Clock size={10} /> <span className="italic">Created:</span> {formatDate(post.created_at)}
                              </div>
                              {post.published_at && (
                                <div className="flex items-center gap-2 text-[10px] font-body text-primary font-bold">
                                   <Activity size={10} /> <span className="italic">Finalized:</span> {formatDate(post.published_at)}
                                </div>
                              )}
                           </div>
                        </TableCell>
                        <TableCell className="py-10 px-8 text-right">
                           <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                             <Button
                               size="icon"
                               variant="outline"
                               onClick={() => navigate(`/blog/${post.id}`)}
                               disabled={post.status !== 'published'}
                               className="rounded-none h-12 w-12 border-border/40 hover:border-primary hover:text-primary transition-all"
                             >
                               <Eye className="h-4 w-4" />
                             </Button>
                             <Button
                               size="icon"
                               variant="outline"
                               onClick={() => navigate(`/admin/blogs/edit/${post.id}`)}
                               className="rounded-none h-12 w-12 border-border/40 hover:border-secondary hover:text-secondary transition-all"
                             >
                               <Edit2 className="h-4 w-4" />
                             </Button>
                             <Button
                               size="icon"
                               variant="outline"
                               className="rounded-none h-12 w-12 border-border/40 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-all"
                               onClick={() => handleDelete(post.id)}
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
        </div>
      </ContentSection>
    </div>
  );
};
