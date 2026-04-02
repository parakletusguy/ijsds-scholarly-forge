import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, ExternalLink, Save, X, Users, ArrowUp, ArrowDown, Building2, ShieldCheck, Globe, ListOrdered } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface PartnerFormData {
  name: string;
  logo_url: string;
  website_url: string;
  description: string;
  is_active: boolean;
}

export const PartnersAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [userRole, setUserRole] = useState<{ is_admin: boolean }>({ is_admin: false });
  
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    logo_url: '',
    website_url: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    checkUserRole();
  }, [user]);

  useEffect(() => {
    if (userRole.is_admin) {
      fetchPartners();
    }
  }, [userRole]);

  const checkUserRole = async () => {
    if (!user) {
      navigate('/partners');
      return;
    }
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (profile && profile.is_admin) {
        setUserRole(profile);
      } else {
        toast({
          title: 'Access Denied',
          description: 'Higher clearance required for institutional governance',
          variant: 'destructive',
        });
        navigate('/partners');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate('/partners');
    }
  };

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast({
        title: 'Error',
        description: 'Failed to load institutional registry',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const partnerData = {
        name: formData.name,
        logo_url: formData.logo_url || null,
        website_url: formData.website_url || null,
        description: formData.description || null,
        is_active: formData.is_active,
        display_order: editingPartner?.display_order || partners.length + 1
      };

      if (editingPartner) {
        const { error } = await supabase
          .from('partners')
          .update(partnerData)
          .eq('id', editingPartner.id);

        if (error) throw error;

        toast({
          title: 'Registry Updated',
          description: 'Institutional partner details have been synchronized.',
        });
      } else {
        const { error } = await supabase
          .from('partners')
          .insert([partnerData]);

        if (error) throw error;

        toast({
          title: 'Partner Onboarded',
          description: 'New scholarly institution added to the global network.',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPartners();
    } catch (error: any) {
      console.error('Error saving partner:', error);
      toast({
        title: 'Governance Error',
        description: error.message || 'Failed to update partnership ledger',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      logo_url: partner.logo_url || '',
      website_url: partner.website_url || '',
      description: partner.description || '',
      is_active: partner.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (partnerId: string) => {
    if (!confirm('Execute partnership termination? This will remove the institution from the registry.')) return;

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', partnerId);

      if (error) throw error;

      toast({
        title: 'Registry Purged',
        description: 'Institutional record removed successfully.',
      });
      
      fetchPartners();
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      toast({
        title: 'Error',
        description: 'Failed to purge institutional record',
        variant: 'destructive',
      });
    }
  };

  const handleReorder = async (partnerId: string, direction: 'up' | 'down') => {
    const partnerIndex = partners.findIndex(p => p.id === partnerId);
    if (partnerIndex === -1) return;

    const targetIndex = direction === 'up' ? partnerIndex - 1 : partnerIndex + 1;
    if (targetIndex < 0 || targetIndex >= partners.length) return;

    try {
      const partner = partners[partnerIndex];
      const targetPartner = partners[targetIndex];

      await Promise.all([
        supabase
          .from('partners')
          .update({ display_order: targetPartner.display_order })
          .eq('id', partner.id),
        supabase
          .from('partners')
          .update({ display_order: partner.display_order })
          .eq('id', targetPartner.id)
      ]);

      toast({
        title: 'Order Synchronized',
        description: 'Institutional hierarchy updated.',
      });

      fetchPartners();
    } catch (error) {
      console.error('Error reordering partners:', error);
      toast({
        title: 'Error',
        description: 'Failed to update institutional order',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      website_url: '',
      description: '',
      is_active: true
    });
    setEditingPartner(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <PageHeader 
        title="Strategic" 
        subtitle="Partners" 
        accent="Institutional Alignment"
        description="Global partnership oversight and scholarly network governance. Manage institutional collaborations, archival integrations, and developmental synergies."
      />

      <ContentSection>
        {/* Governance Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 pb-12 border-b border-border/20">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-foreground text-white shadow-xl rotate-3"><Building2 size={24} /></div>
             <div>
                <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">Institutional Registry</h2>
                <p className="font-body text-sm text-foreground/40 italic">Active global collaborators and supporting academic bodies.</p>
             </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-secondary text-white font-headline font-black uppercase text-[10px] tracking-widest px-10 py-8 h-auto shadow-2xl rounded-none transition-all group">
                <Plus className="h-4 w-4 mr-3 group-hover:rotate-90 transition-transform" />
                Onboard Institution
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl rounded-none border-none p-0 overflow-hidden shadow-2xl font-body">
              <div className="bg-foreground p-12 text-white relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}></div>
                  <DialogHeader className="relative z-10">
                    <DialogTitle className="text-4xl font-headline font-black uppercase tracking-tighter mb-2">
                       {editingPartner ? 'Update Institution' : 'Onboard Institution'}
                    </DialogTitle>
                    <DialogDescription className="text-white/40 italic font-body text-sm">
                       {editingPartner ? 'Synchronizing institutional archival details.' : 'Registering new scholarly partnership protocol.'}
                    </DialogDescription>
                  </DialogHeader>
              </div>

              <form onSubmit={handleSubmit} className="p-12 space-y-8 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="font-headline font-black uppercase text-[10px] tracking-widest text-foreground/40">Organization Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="rounded-none border-border/40 focus:border-primary h-12 shadow-sm font-headline font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="website_url" className="font-headline font-black uppercase text-[10px] tracking-widest text-foreground/40">Portal Link (Institutional)</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                      placeholder="https://example.edu"
                      className="rounded-none border-border/40 focus:border-secondary h-12 shadow-sm font-headline font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="logo_url" className="font-headline font-black uppercase text-[10px] tracking-widest text-foreground/40">Branding Asset URL (Logo)</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/branding_v1.png"
                    className="rounded-none border-border/40 focus:border-primary h-12 shadow-sm font-headline font-bold text-xs"
                  />
                  <p className="text-[9px] font-body italic text-foreground/20">Preferably high-fidelity PNG or SVG assets with negative space.</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="font-headline font-black uppercase text-[10px] tracking-widest text-foreground/40">Archival Synopsis (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the institutional alignment or partnership history..."
                    rows={4}
                    className="rounded-none border-border/40 focus:border-secondary shadow-sm font-body text-sm resize-none"
                  />
                </div>

                <div className="flex items-center justify-between p-6 bg-secondary/5 border border-secondary/10">
                  <div className="flex items-center space-x-4">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active" className="font-headline font-black uppercase text-[10px] tracking-widest cursor-pointer">Live Partnership Stream</Label>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-secondary animate-pulse"></div>
                </div>

                <DialogFooter className="pt-8 border-t border-border/10">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-8 px-10 h-auto">
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                  <Button type="submit" className="rounded-none bg-foreground text-white hover:bg-primary font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-8 px-12 h-auto shadow-xl transition-all">
                    <Save className="h-4 w-4" /> {editingPartner ? 'Update Registry' : 'Commit Onboarding'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* High-Fidelity Partnership Ledger */}
        <div className="bg-white border border-border/20 shadow-sm animate-fade-in-up">
          {loading ? (
            <div className="p-12 space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted/20 animate-pulse border border-border/5" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow className="hover:bg-transparent border-b-2 border-border/20">
                  <TableHead className="font-headline font-black uppercase text-[9px] tracking-widest py-8 px-8 w-40"><div className="flex items-center gap-2"><ListOrdered size={12} /> Hierarchy</div></TableHead>
                  <TableHead className="font-headline font-black uppercase text-[9px] tracking-widest py-8"><div className="flex items-center gap-2"><Building2 size={12} /> Institution</div></TableHead>
                  <TableHead className="font-headline font-black uppercase text-[9px] tracking-widest py-8">Portal</TableHead>
                  <TableHead className="font-headline font-black uppercase text-[9px] tracking-widest py-8">Efficacy</TableHead>
                  <TableHead className="font-headline font-black uppercase text-[9px] tracking-widest py-8">Archived</TableHead>
                  <TableHead className="font-headline font-black uppercase text-[9px] tracking-widest py-8 text-right px-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner, index) => (
                  <TableRow key={partner.id} className="group hover:bg-secondary/5 transition-colors">
                    <TableCell className="py-10 px-8">
                      <div className="flex items-center gap-5">
                        <span className="font-headline font-black text-2xl text-foreground/10 group-hover:text-primary/20 transition-colors">0{partner.display_order}</span>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReorder(partner.id, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 p-0 rounded-none border-border/20 hover:border-primary transition-all shadow-sm"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReorder(partner.id, 'down')}
                            disabled={index === partners.length - 1}
                            className="h-8 w-8 p-0 rounded-none border-border/20 hover:border-secondary transition-all shadow-sm"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 p-2 bg-white border border-border/20 shadow-sm flex items-center justify-center shrink-0">
                          {partner.logo_url ? (
                            <img 
                              src={partner.logo_url} 
                              alt={partner.name}
                              className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-foreground/10" />
                          )}
                        </div>
                        <div className="max-w-md">
                          <div className="font-headline font-black text-lg uppercase tracking-tight leading-tight mb-1 group-hover:text-primary transition-colors">{partner.name}</div>
                          {partner.description && (
                            <div className="text-[10px] font-body text-foreground/40 italic line-clamp-1">
                              {partner.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-10">
                      {partner.website_url ? (
                        <a 
                          href={partner.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-headline font-black text-[9px] uppercase tracking-widest text-primary flex items-center gap-2 hover:text-secondary transition-colors"
                        >
                          <Globe className="h-3 w-3" /> External Access
                        </a>
                      ) : (
                        <span className="text-[9px] font-headline font-bold uppercase tracking-widest text-foreground/10 italic">N/A Digital Link</span>
                      )}
                    </TableCell>
                    <TableCell className="py-10">
                      <Badge className={`rounded-none font-headline font-black uppercase text-[8px] tracking-[0.2em] px-4 py-1 shadow-sm border-none ${partner.is_active ? 'bg-secondary text-white' : 'bg-muted text-foreground/30'}`}>
                        {partner.is_active ? 'High Density' : 'Dormant Stream'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-10 text-[10px] font-headline font-bold text-foreground/20 italic">
                      {formatDate(partner.created_at)}
                    </TableCell>
                    <TableCell className="py-10 text-right px-8">
                      <div className="flex items-center justify-end gap-3 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(partner)}
                          className="h-10 w-10 p-0 rounded-none border-border/20 text-foreground hover:bg-foreground hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(partner.id)}
                          className="h-10 w-10 p-0 rounded-none border-border/20 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        {/* Ledger Footer Branding */}
        <div className="mt-16 flex items-center justify-center gap-8 py-12 border-t border-border/10 opacity-30">
           <ShieldCheck size={18} />
           <p className="font-headline font-bold text-[9px] uppercase tracking-[0.5em]">Institutional Governance Protocol — Secure Access Stream</p>
           <ShieldCheck size={18} />
        </div>
      </ContentSection>
    </div>
  );
};