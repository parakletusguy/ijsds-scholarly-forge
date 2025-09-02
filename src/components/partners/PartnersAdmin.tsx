import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, ExternalLink, Save, X, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
          description: 'You do not have permission to access this page',
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
        const { error } = await supabase
          .from('partners')
          .update(partnerData)
          .eq('id', editingPartner.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Partner updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('partners')
          .insert([partnerData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Partner added successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPartners();
    } catch (error: any) {
      console.error('Error saving partner:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save partner',
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
    if (!confirm('Are you sure you want to delete this partner?')) return;

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', partnerId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Partner deleted successfully',
      });
      
      fetchPartners();
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete partner',
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

      // Swap display orders
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
        title: 'Success',
        description: 'Partner order updated',
      });

      fetchPartners();
    } catch (error) {
      console.error('Error reordering partners:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order',
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Partners Administration</h1>
          <p className="text-muted-foreground">Manage partnership organizations and institutions</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
              <DialogDescription>
                {editingPartner ? 'Update the partner details' : 'Fill out the form to add a new partner'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the partnership..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active Partner</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingPartner ? 'Update' : 'Add'} Partner
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partners</CardTitle>
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
                  <TableHead>Order</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner, index) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">#{partner.display_order}</span>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReorder(partner.id, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReorder(partner.id, 'down')}
                            disabled={index === partners.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {partner.logo_url ? (
                          <img 
                            src={partner.logo_url} 
                            alt={`${partner.name} logo`}
                            className="w-10 h-10 object-contain rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{partner.name}</div>
                          {partner.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {partner.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {partner.website_url ? (
                        <a 
                          href={partner.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visit
                        </a>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={partner.is_active ? 'default' : 'secondary'}>
                        {partner.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(partner.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(partner)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(partner.id)}
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