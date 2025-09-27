import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Shield, FileText, Database, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  updated_at: string;
}

export const SystemSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState<SystemSetting[]>([]);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
      fetchSettings();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (!profile?.is_admin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access system settings.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load system settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingKey: string, newValue: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: newValue,
          updated_by: user?.id 
        })
        .eq('setting_key', settingKey);

      if (error) throw error;

      // Update local state
      setSettings(prev => prev.map(setting => 
        setting.setting_key === settingKey 
          ? { ...setting, setting_value: newValue }
          : setting
      ));

      toast({
        title: 'Setting Updated',
        description: `Successfully updated ${settingKey.replace('_', ' ')}.`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update system setting.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to access system settings.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You do not have permission to access system settings.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const submissionEnabledSetting = settings.find(s => s.setting_key === 'submission_enabled');
  const maintenanceModeSetting = settings.find(s => s.setting_key === 'maintenance_mode');
  const maxFileSizeSetting = settings.find(s => s.setting_key === 'max_file_size_mb');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">System Settings</h1>
              <p className="text-muted-foreground">
                Configure system-wide settings and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Submission Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submission Management
              </CardTitle>
              <CardDescription>
                Control whether authors can submit new articles to the journal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Enable New Submissions</Label>
                  <p className="text-xs text-muted-foreground">
                    When disabled, authors will not be able to submit new articles
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={submissionEnabledSetting?.setting_value === 'true' ? 'default' : 'destructive'}>
                    {submissionEnabledSetting?.setting_value === 'true' ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Switch
                    checked={submissionEnabledSetting?.setting_value === 'true'}
                    onCheckedChange={(checked) => 
                      updateSetting('submission_enabled', checked.toString())
                    }
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Maintenance
              </CardTitle>
              <CardDescription>
                Enable maintenance mode to prevent user access during updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    When enabled, only administrators can access the system
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={maintenanceModeSetting?.setting_value === 'true' ? 'destructive' : 'default'}>
                    {maintenanceModeSetting?.setting_value === 'true' ? 'Active' : 'Inactive'}
                  </Badge>
                  <Switch
                    checked={maintenanceModeSetting?.setting_value === 'true'}
                    onCheckedChange={(checked) => 
                      updateSetting('maintenance_mode', checked.toString())
                    }
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                File Upload Configuration
              </CardTitle>
              <CardDescription>
                Configure file upload limits and restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Maximum File Size (MB)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={maxFileSizeSetting?.setting_value || '10'}
                    onChange={(e) => updateSetting('max_file_size_mb', e.target.value)}
                    className="w-32"
                    disabled={saving}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSetting('max_file_size_mb', maxFileSizeSetting?.setting_value || '10')}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum size for manuscript and supplementary file uploads
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Settings Overview */}
          <Card>
            <CardHeader>
              <CardTitle>All System Settings</CardTitle>
              <CardDescription>
                Overview of all configured system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {typeof setting.setting_value === 'string' 
                          ? setting.setting_value 
                          : JSON.stringify(setting.setting_value)
                        }
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated: {new Date(setting.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};