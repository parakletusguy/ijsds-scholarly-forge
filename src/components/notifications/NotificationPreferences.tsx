
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    email_notifications_enabled: true,
    deadline_reminder_days: 3,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_notifications_enabled, deadline_reminder_days')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setPreferences({
          email_notifications_enabled: data.email_notifications_enabled ?? true,
          deadline_reminder_days: data.deadline_reminder_days ?? 3,
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const updatePreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(preferences)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved.',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications for important updates
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={preferences.email_notifications_enabled}
            onCheckedChange={(checked) =>
              setPreferences(prev => ({ ...prev, email_notifications_enabled: checked }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder-days">Deadline Reminder (Days)</Label>
          <p className="text-sm text-muted-foreground">
            How many days before a deadline to send reminder emails
          </p>
          <Input
            id="reminder-days"
            type="number"
            min="1"
            max="14"
            value={preferences.deadline_reminder_days}
            onChange={(e) =>
              setPreferences(prev => ({ ...prev, deadline_reminder_days: parseInt(e.target.value) || 3 }))
            }
            className="w-24"
          />
        </div>

        <Button onClick={updatePreferences} disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
};
