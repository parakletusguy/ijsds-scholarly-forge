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
import * as partnersService from '@/lib/partnersService';

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
          description: 'You do not have permission to manage partners.',
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
      const data = await partnersService.getPartners();
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast({
        title: 'Error',
        description: 'Failed to load partners',
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
        await partnersService.updatePartner(editingPartner.id, partnerData);
        toast({
          title: 'Partner Updated',
          description: 'Partner details have been saved successfully.',
        });
      } else {
        await partnersService.createPartner(partnerData);
        toast({
          title: 'Partner Added',
          description: 'New partner institution has been registered.',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPartners();
    } catch (error: any) {
      console.error('Error saving partner:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save partner',
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
    if (!confirm('Are you sure you want to remove this partner?')) return;

    try {
      await partnersService.deletePartner(partnerId);
      toast({
        title: 'Partner Removed',
        description: 'The partner record has been deleted.',
      });
      fetchPartners();
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete partner record',
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
        partnersService.updatePartner(partner.id, { display_order: targetPartner.display_order }),
        partnersService.updatePartner(targetPartner.id, { display_order: partner.display_order })
      ]);

      toast({
        title: 'Order Updated',
        description: 'The display order has been updated.',
      });

      fetchPartners();
    } catch (error) {
      console.error('Error reordering partners:', error);
      toast({
        title: 'Error',
        description: 'Failed to update partner order',
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
        title="Journal" 
        subtitle="Partners" 
        accent="Management"
        description="Manage the institutions and organizations that partner with IJSDS. You can add, edit, or remove partner logos and information here."
      />

      <ContentSection>
        {/* Governance Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 pb-12 border-b border-border/20">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-primary text-white rounded-md"><Building2 size={20} /></div>
              <div>
                 <h2 className="text-2xl font-headline font-bold text-stone-900">Partner List</h2>
                 <p className="font-body text-xs text-stone-500">View and manage all active partner institutions.</p>
              </div>
           </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold uppercase text-[10px] tracking-widest px-6 py-3 rounded-md transition-all flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Partner
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-lg border-none shadow-2xl font-body">
              <div className="bg-stone-900 p-6 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-headline font-bold">
                       {editingPartner ? 'Edit Partner' : 'Add New Partner'}
                    </DialogTitle>
                    <DialogDescription className="text-stone-400 text-xs">
                       {editingPartner ? 'Update partner organization details.' : 'Enter details for a new institutional partner.'}
                    </DialogDescription>
                  </DialogHeader>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold text-stone-600">Organization Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="rounded-md border-stone-200 focus:ring-primary h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website_url" className="text-xs font-bold text-stone-600">Website URL</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                      placeholder="https://example.edu"
                      className="rounded-md border-stone-200 focus:ring-primary h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo_url" className="text-xs font-bold text-stone-600">Logo URL</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    className="rounded-md border-stone-200 focus:ring-primary h-10 text-sm"
                  />
                  <p className="text-[10px] text-stone-400">Provide a direct link to the organization's logo image.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-bold text-stone-600">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the partner..."
                    rows={4}
                    className="rounded-md border-stone-200 focus:ring-primary text-sm resize-none"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-100 rounded-md">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active" className="text-xs font-bold text-stone-700 cursor-pointer">Active (Show on website)</Label>
                  </div>
                </div>

                <DialogFooter className="pt-4 mt-2 border-t border-stone-100 flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-md text-[10px] font-bold px-4 py-2 h-9">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-md bg-stone-900 text-white hover:bg-stone-800 text-[10px] font-bold px-6 py-2 h-9 transition-all">
                    {editingPartner ? 'Save Changes' : 'Add Partner'}
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
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-6 px-6 w-32">Order</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-6">Organization</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-6">Website</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-6">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-6">Added On</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-6 text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner, index) => (
                  <TableRow key={partner.id} className="group hover:bg-secondary/5 transition-colors">
                    <TableCell className="py-6 px-6">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-stone-400">#{partner.display_order}</span>
                        <div className="flex flex-col gap-0.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleReorder(partner.id, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 text-stone-400 hover:text-primary"
                          >
                            <ArrowUp size={12} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleReorder(partner.id, 'down')}
                            disabled={index === partners.length - 1}
                            className="h-6 w-6 text-stone-400 hover:text-primary"
                          >
                            <ArrowDown size={12} />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 p-1.5 bg-white border border-stone-100 flex items-center justify-center shrink-0">
                          {partner.logo_url ? (
                            <img 
                              src={partner.logo_url} 
                              alt={partner.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-stone-200" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{partner.name}</div>
                          {partner.description && (
                            <div className="text-[10px] text-stone-400 line-clamp-1">
                              {partner.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      {partner.website_url ? (
                        <a 
                          href={partner.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 hover:underline"
                        >
                          Visit <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[10px] text-stone-300 italic">No Link</span>
                      )}
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge variant="outline" className={`rounded-full font-bold uppercase text-[8px] tracking-widest px-3 py-0.5 ${partner.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-stone-50 text-stone-400 border-stone-200'}`}>
                        {partner.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 text-[10px] text-stone-400">
                      {formatDate(partner.created_at)}
                    </TableCell>
                    <TableCell className="py-6 text-right px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(partner)}
                          className="h-8 w-8 text-stone-400 hover:text-primary hover:bg-primary/5"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(partner.id)}
                          className="h-8 w-8 text-stone-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        

      </ContentSection>
    </div>
  );
};