import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Shield, FileText, Database, AlertCircle, ShieldCheck, ArrowLeft, Activity, Info, Lock, Zap, Server, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

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
        toast({ title: 'Access Denied', description: 'Administrative credentials required.', variant: 'destructive' });
        navigate('/dashboard'); return;
      }

      setIsAdmin(true);
    } catch (error) { navigate('/dashboard'); }
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
      toast({ title: 'Sync Error', description: 'Failed to access infrastructure registry.', variant: 'destructive' });
    } finally { setLoading(false); }
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

      setSettings(prev => prev.map(setting => 
        setting.setting_key === settingKey 
          ? { ...setting, setting_value: newValue }
          : setting
      ));

      toast({ title: 'Registry Updated', description: `Protocol "${settingKey.replace('_', ' ')}" has been synchronized.` });
    } catch (error) {
      toast({ title: 'Command Refused', description: 'Failed to update infrastructure protocol.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const cardClasses = "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group";
  const labelClasses = "font-headline font-black text-[10px] uppercase tracking-widest text-foreground/40 mb-4 block";

  if (!user || !isAdmin || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const submissionEnabledSetting = settings.find(s => s.setting_key === 'submission_enabled');
  const maintenanceModeSetting = settings.find(s => s.setting_key === 'maintenance_mode');
  const maxFileSizeSetting = settings.find(s => s.setting_key === 'max_file_size_mb');
  const authorReuploadEnabledSetting = settings.find(s => s.setting_key === 'author_reupload_enabled');

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <PageHeader 
        title="System" 
        subtitle="Infrastructure" 
        accent="Governance Controls"
        description="Configure the foundational architectural parameters of the journal. Manage publication protocols, institutional boundaries, and high-fidelity operational settings."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate('/admin')} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Return to Command Hub
           </Button>
           
           <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
              <ShieldCheck size={16} className="text-secondary" />
              <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Authorized Domain Control</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Controls Grid */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Submission Control */}
            <div className={cardClasses + " border-t-8 border-primary"}>
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-primary text-white shadow-lg"><FileText size={18} /></div>
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight">Manuscript Intake Protocol</h3>
               </div>
               
               <div className="flex items-center justify-between bg-muted/5 p-8 border border-border/10">
                 <div className="space-y-1 max-w-[70%]">
                   <Label className="text-sm font-headline font-black uppercase tracking-tighter">Global Submission Stream</Label>
                   <p className="text-xs text-foreground/40 italic leading-relaxed">
                     When deactivated, the journal will refuse all new scholarly entries. Existing dossiers will remain accessible for editorial processing.
                   </p>
                 </div>
                 <div className="flex flex-col items-end gap-3">
                   <Badge className={`rounded-none font-headline font-bold text-[8px] uppercase tracking-widest px-3 py-1 ${submissionEnabledSetting?.setting_value === 'true' ? 'bg-secondary text-white' : 'bg-destructive text-white'}`}>
                     {submissionEnabledSetting?.setting_value === 'true' ? 'Active Stream' : 'Intake Halted'}
                   </Badge>
                   <Switch
                     checked={submissionEnabledSetting?.setting_value === 'true'}
                     onCheckedChange={(checked) => updateSetting('submission_enabled', checked.toString())}
                     disabled={saving}
                     className="data-[state=checked]:bg-secondary"
                   />
                 </div>
               </div>
            </div>

            {/* Maintenance Mode */}
            <div className={cardClasses + " border-t-8 border-secondary"}>
               <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-secondary text-white shadow-lg"><Server size={18} /></div>
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight">Architectural Integrity</h3>
               </div>
               
               <div className="flex items-center justify-between bg-muted/5 p-8 border border-border/10">
                 <div className="space-y-1 max-w-[70%]">
                   <Label className="text-sm font-headline font-black uppercase tracking-tighter">Institutional Maintenance Mode</Label>
                   <p className="text-xs text-foreground/40 italic leading-relaxed">
                     Deploys a governance shield. Only users with Top-Level Administrative credentials will be granted access to the domain architecture.
                   </p>
                 </div>
                 <div className="flex flex-col items-end gap-3">
                   <Badge className={`rounded-none font-headline font-bold text-[8px] uppercase tracking-widest px-3 py-1 ${maintenanceModeSetting?.setting_value === 'true' ? 'bg-destructive text-white' : 'bg-primary text-white'}`}>
                     {maintenanceModeSetting?.setting_value === 'true' ? 'Shield Active' : 'Public Access'}
                   </Badge>
                   <Switch
                     checked={maintenanceModeSetting?.setting_value === 'true'}
                     onCheckedChange={(checked) => updateSetting('maintenance_mode', checked.toString())}
                     disabled={saving}
                     className="data-[state=checked]:bg-destructive"
                   />
                 </div>
               </div>
            </div>

            {/* File Upload Settings */}
            <div className={cardClasses + " border-t-8 border-foreground"}>
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-foreground text-white shadow-lg"><Lock size={18} /></div>
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight">Dossier Boundary Protocols</h3>
               </div>
               
               <div className="space-y-8">
                  <div className="flex items-center justify-between bg-muted/20 p-8">
                    <div className="space-y-1 max-w-[70%]">
                      <Label className="text-sm font-headline font-black uppercase tracking-tighter">Retroactive Contributor Access</Label>
                      <p className="text-xs text-foreground/40 italic leading-relaxed">
                        Authorizes contributing scholars to refine and re-synchronize manuscript files post-initial submission.
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Badge className={`rounded-none font-headline font-bold text-[8px] uppercase tracking-widest px-3 py-1 ${authorReuploadEnabledSetting?.setting_value === 'true' ? 'bg-foreground text-white' : 'bg-muted text-foreground/30'}`}>
                        {authorReuploadEnabledSetting?.setting_value === 'true' ? 'Authorized' : 'Restricted'}
                      </Badge>
                      <Switch
                        checked={authorReuploadEnabledSetting?.setting_value === 'true'}
                        onCheckedChange={(checked) => updateSetting('author_reupload_enabled', checked.toString())}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <Separator className="bg-border/20" />

                  <div className="bg-muted/5 p-8 border border-border/10">
                    <Label className="font-headline font-black text-[10px] uppercase tracking-widest text-foreground/40 mb-6 block">Volumetric Limit (Megabytes)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={maxFileSizeSetting?.setting_value || '10'}
                        onChange={(e) => updateSetting('max_file_size_mb', e.target.value)}
                        className="w-32 bg-white border-border/60 font-headline font-black py-6 rounded-none text-center text-xl focus:border-primary transition-all"
                        disabled={saving}
                      />
                      <div className="flex-1">
                         <p className="text-[10px] font-body text-foreground/40 italic leading-relaxed">
                            Maximum architectural allowance for high-resolution manuscript and supplementary scholarly archives. Default: 10MB.
                         </p>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Infrastructure Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <div className={cardClasses + " bg-foreground text-white"}>
               <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={100} /></div>
               <h4 className="font-headline font-black text-[10px] uppercase tracking-[0.3em] text-white/40 mb-10 flex items-center gap-3">
                  <Activity size={14} className="text-secondary" /> System Pulse Audit
               </h4>
               
               <div className="space-y-8 relative z-10">
                  {settings.map((setting) => (
                    <div key={setting.id} className="pb-6 border-b border-white/10 last:border-0 group/item">
                       <div className="flex justify-between items-start mb-2">
                          <p className="font-headline font-bold text-[9px] uppercase tracking-widest text-white/80 group-hover/item:text-secondary transition-colors">{setting.setting_key.replace(/_/g, ' ')}</p>
                          <Badge variant="outline" className="border-white/20 text-white text-[8px] rounded-none px-2 py-0 h-4">{setting.setting_value}</Badge>
                       </div>
                       <p className="text-[10px] font-body text-white/30 italic line-clamp-2 leading-relaxed">{setting.description}</p>
                       <div className="mt-4 flex items-center justify-between">
                          <span className="text-[8px] font-headline text-white/10 uppercase tracking-widest">Protocol Synchronized</span>
                          <span className="text-[8px] text-white/20">{new Date(setting.updated_at).toLocaleDateString()}</span>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-12 pt-8 border-t border-white/10">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-white/5 text-secondary"><Info size={14} /></div>
                     <p className="text-[9px] font-body text-white/40 italic leading-relaxed">
                        Governance changes are reflected across all departmental nodes immediately upon registry synchronization.
                     </p>
                  </div>
               </div>
            </div>

            <div className="bg-secondary/5 p-8 border border-border/10 flex flex-col items-center justify-center text-center gap-6">
               <ShieldCheck size={32} className="text-primary/20" />
               <p className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40 leading-relaxed px-6">
                  Maintain Institutional Compliance in Architectural Management.
               </p>
            </div>
          </div>
        </div>
      </ContentSection>
    </div>
  );
};