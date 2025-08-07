import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { User, Mail, Building, Link, Save } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
  affiliation?: string;
  orcid_id?: string;
  is_editor: boolean;
  is_reviewer: boolean;
}

export const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bio: '',
    affiliation: '',
    orcidId: '',
    isEditor: false,
    isReviewer: false,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setFormData({
          fullName: data.full_name || '',
          email: data.email || '',
          bio: data.bio || '',
          affiliation: data.affiliation || '',
          orcidId: data.orcid_id || '',
          isEditor: data.is_editor || false,
          isReviewer: data.is_reviewer || false,
        });
      } else {
        // Create new profile
        setFormData({
          fullName: user.user_metadata?.full_name || '',
          email: user.email || '',
          bio: '',
          affiliation: '',
          orcidId: '',
          isEditor: false,
          isReviewer: false,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const profileData = {
        id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        bio: formData.bio,
        affiliation: formData.affiliation,
        orcid_id: formData.orcidId,
        is_editor: formData.isEditor,
        is_reviewer: formData.isReviewer,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const validateORCID = (orcid: string) => {
    const orcidRegex = /^(\d{4}-\d{4}-\d{4}-\d{3}[\dX])$/;
    return orcidRegex.test(orcid) || orcid === '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div>Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your personal information and academic profile
            </p>
          </div>

          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@institution.edu"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about your research interests and background..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="affiliation">Institutional Affiliation</Label>
                  <Input
                    id="affiliation"
                    value={formData.affiliation}
                    onChange={(e) => setFormData(prev => ({ ...prev, affiliation: e.target.value }))}
                    placeholder="University or Research Institution"
                  />
                </div>

                <div>
                  <Label htmlFor="orcid">ORCID iD</Label>
                  <div className="flex gap-2">
                    <Input
                      id="orcid"
                      value={formData.orcidId}
                      onChange={(e) => setFormData(prev => ({ ...prev, orcidId: e.target.value }))}
                      placeholder="0000-0000-0000-0000"
                      className={!validateORCID(formData.orcidId) ? 'border-destructive' : ''}
                    />
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://orcid.org/register', '_blank')}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Get ORCID
                    </Button>
                  </div>
                  {!validateORCID(formData.orcidId) && formData.orcidId && (
                    <p className="text-sm text-destructive mt-1">
                      Please enter a valid ORCID format (0000-0000-0000-0000)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Roles */}
            <Card>
              <CardHeader>
                <CardTitle>Journal Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is-reviewer">Reviewer</Label>
                    <p className="text-sm text-muted-foreground">
                      Participate in the peer review process
                    </p>
                  </div>
                  <Switch
                    id="is-reviewer"
                    checked={formData.isReviewer}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isReviewer: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is-editor">Editor</Label>
                    <p className="text-sm text-muted-foreground">
                      Manage submissions and review process
                    </p>
                  </div>
                  <Switch
                    id="is-editor"
                    checked={formData.isEditor}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEditor: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              disabled={saving || !validateORCID(formData.orcidId)}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};