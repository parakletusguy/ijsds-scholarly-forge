import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { getProfile, updateProfile } from '@/lib/profileService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Building, Link, Save, ArrowLeft, ShieldCheck, Award, GraduationCap, Mail, UserCheck, BookOpen, Globe, Database, Zap, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import { Badge } from '@/components/ui/badge';

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
  affiliation?: string;
  orcid_id?: string;
  is_editor: boolean;
  is_reviewer: boolean;
  request_reviewer: boolean;
  request_editor: boolean;
  is_admin: boolean;
}

export const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingE, setLoadingE] = useState(false);
  const [loadingR, setLoadingR] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bio: '',
    affiliation: '',
    orcidId: '',
    isEditor: false,
    isReviewer: false,
    request_reviewer: false,
    request_editor: false,
    isAdmin: false
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const data = await getProfile(user.id);
      setProfile(data);
      setFormData({
        fullName: data.full_name || '',
        email: data.email || '',
        bio: data.bio || '',
        affiliation: data.affiliation || '',
        orcidId: data.orcid_id || '',
        isEditor: data.is_editor || false,
        isReviewer: data.is_reviewer || false,
        request_reviewer: data.request_reviewer || false,
        request_editor: data.request_editor || false,
        isAdmin: data.is_admin || false
      });
    } catch (error) {
      toast({ title: "Sync Error", description: "Failed to load scholar identity.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        full_name: formData.fullName,
        affiliation: formData.affiliation,
        bio: formData.bio,
        orcid_id: formData.orcidId,
      });
      toast({ title: "Update Success", description: "Your scholarly profile has been synchronized." });
      fetchProfile();
    } catch (error) {
      toast({ title: "Update Error", description: "Failed to synchronize profile data.", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const validateORCID = (orcid: string) => {
    const orcidRegex = /^(\d{4}-\d{4}-\d{4}-\d{3}[\dX])$/;
    return orcidRegex.test(orcid) || orcid === '';
  };

  const request = async (type: string) => {
    try {
      if (type === 'editor') {
        setLoadingE(true);
        await updateProfile(user!.id, { request_editor: true, request_reviewer: true });
        try {
          const { notifyAdminsOfRoleRequest } = await import('@/lib/roleNotificationService');
          await notifyAdminsOfRoleRequest({
            requesterId: user!.id,
            requesterName: formData.fullName || profile?.full_name || '',
            requesterEmail: formData.email || profile?.email || '',
            role: 'editor'
          });
        } catch (e) { console.warn('Notification failed', e); }
        toast({ title: "Editorial Request", description: "Your application has been submitted for review." });
      }
      if (type === 'reviewer') {
        setLoadingR(true);
        await updateProfile(user!.id, { request_reviewer: true });
        try {
          const { notifyAdminsOfRoleRequest } = await import('@/lib/roleNotificationService');
          await notifyAdminsOfRoleRequest({
            requesterId: user!.id,
            requesterName: formData.fullName || profile?.full_name || '',
            requesterEmail: formData.email || profile?.email || '',
            role: 'reviewer'
          });
        } catch (e) { console.warn('Notification failed', e); }
        toast({ title: "Reviewer Request", description: "Your peer-review application is pending validation." });
      }
      fetchProfile();
    } catch (error) { toast({ title: "Error", description: "Could not submit request.", variant: "destructive" }); }
    finally { setLoadingE(false); setLoadingR(false); }
  };

  const inputClasses = "bg-white border-border/20 rounded-none focus:border-primary transition-all font-body h-14 text-lg lg:text-xl";
  const labelClasses = "font-headline font-black text-[11px] uppercase tracking-[0.4em] text-foreground/30 mb-3 block italic";
  const cardClasses = "bg-white p-12 md:p-16 border border-border/10 shadow-sm relative overflow-hidden group";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
       <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>Scholar Profile IJSDS — Dossier Registry</title>
        <meta name="description" content="Manage your scholarly identity and institutional affiliations within the IJSDS ecosystem." />
      </Helmet>

      <PageHeader 
        title="Scholar" 
        subtitle="Dossier" 
        accent="Identity Portal"
        description="Curate your scholarly presence within the IJSDS ecosystem. Manage your institutional affiliations, research interests, and multidisciplinary contributions."
      />

      <ContentSection>
        {/* Navigation Action Bar — High Fidelity */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 gap-10 relative">
           <div className="absolute top-1/2 left-0 w-full h-px bg-border/10 -z-0"></div>
           
           <button 
             onClick={() => navigate(-1)} 
             className="relative z-10 flex items-center gap-6 font-headline font-black text-xs uppercase tracking-[0.4em] text-foreground/40 hover:text-primary transition-colors bg-secondary/5 px-8 py-6 border border-border/10"
           >
              <ArrowLeft size={16} /> Return to Archive Base
           </button>
           
           <div className="relative z-10 flex items-center gap-6 bg-white p-6 shadow-2xl border-t-4 border-secondary">
              <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                 <ShieldCheck size={20} className="animate-pulse" />
              </div>
              <div className="flex flex-col">
                 <span className="font-headline font-black text-[9px] uppercase tracking-[0.4em] text-foreground/20">Security State</span>
                 <span className="font-headline font-black text-xs uppercase tracking-widest text-secondary">Verified Scholar Node</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Dossier Content (lg: 8 cols) */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Identity Core */}
            <div className={cardClasses}>
               {/* Decorative Abstract Corner */}
               <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 -z-0" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 -z-0" style={{ clipPath: 'circle(50% at 0 100%)' }}></div>
               
               <div className="relative z-10">
                  <div className="flex items-center gap-8 mb-16 border-b border-border/10 pb-10">
                     <div className="w-20 h-20 bg-primary flex items-center justify-center text-white border border-primary/10 shadow-[0_20px_40px_-10px_rgba(27,67,50,0.3)]">
                        <User size={40} />
                     </div>
                     <div className="flex flex-col">
                        <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/20 italic">Block 01</span>
                        <h2 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter">Scholarly Identity</h2>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                    <div>
                      <Label htmlFor="full-name" className={labelClasses}>Full Academic Designation *</Label>
                      <Input id="full-name" value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Surname Firstname" className={inputClasses} />
                    </div>
                    <div>
                      <Label htmlFor="email" className={labelClasses}>Primary Network Communication</Label>
                      <div className="relative">
                        <Input id="email" type="email" value={formData.email} disabled className={inputClasses + " bg-secondary/5 border-border/5 text-foreground/30 font-bold italic"} />
                        <Mail className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/10" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio" className={labelClasses}>Research Narrative / Intellectual Bio</Label>
                    <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))} placeholder="Articulate your multidisciplinary focus and contributions to the African commons..." rows={8} className={inputClasses + " h-auto py-8 lg:text-xl leading-relaxed italic text-foreground/80"} />
                  </div>
               </div>
            </div>

            {/* Institutional Framework */}
            <div className={cardClasses}>
               <div className="flex items-center gap-8 mb-16 border-b border-border/10 pb-10">
                  <div className="w-20 h-20 bg-secondary flex items-center justify-center text-white border border-secondary/10 shadow-[0_20px_40px_-10px_rgba(217,119,6,0.3)]">
                     <Building size={40} />
                  </div>
                  <div className="flex flex-col">
                     <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/20 italic">Block 02</span>
                     <h2 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter">Academic Fabric</h2>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 gap-12">
                  <div>
                    <Label htmlFor="affiliation" className={labelClasses}>Institutional Affiliation / Research Centre</Label>
                    <div className="relative">
                       <Input id="affiliation" value={formData.affiliation} onChange={(e) => setFormData(prev => ({ ...prev, affiliation: e.target.value }))} placeholder="e.g. University of Lagos / Centre for Social Development" className={inputClasses + " pl-16"} />
                       <MapPin size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="orcid" className={labelClasses}>ORCID Digital Registry Integration</Label>
                    <div className="flex flex-col md:flex-row gap-6">
                       <div className="flex-1 relative">
                          <Input id="orcid" value={formData.orcidId} onChange={(e) => setFormData(prev => ({ ...prev, orcidId: e.target.value }))} placeholder="0000-0000-0000-0000" className={inputClasses + (!validateORCID(formData.orcidId) ? ' border-primary' : '') + " pl-16"} />
                          <Globe size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20" />
                          {!validateORCID(formData.orcidId) && formData.orcidId && (
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-4 italic border-l-2 border-primary pl-4">Digital Identifier Format Protocol Violation</p>
                          )}
                       </div>
                       <button 
                         onClick={() => window.open('https://orcid.org/register', '_blank')}
                         className="h-14 px-10 border-2 border-dashed border-border/20 hover:border-secondary transition-all flex items-center justify-center gap-4 group/orcid font-headline font-black text-[10px] uppercase tracking-[0.3em] bg-secondary/5"
                       >
                          <Link size={18} className="group-hover/orcid:rotate-45 transition-transform" /> Register Node
                       </button>
                    </div>
                  </div>
               </div>
            </div>

            {/* Registry Commit */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-10 pt-10">
               <div className="flex items-center gap-6">
                  <Database size={24} className="text-secondary opacity-30" />
                  <p className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-foreground/20 italic">Synchronizing with Master Registry</p>
               </div>
               
               <button 
                 onClick={handleSave} 
                 disabled={saving || !validateORCID(formData.orcidId)} 
                 className="w-full sm:w-auto bg-primary text-white py-10 px-24 font-headline font-black text-sm uppercase tracking-[0.5em] shadow-[0_30px_60px_-15px_rgba(27,67,50,0.4)] hover:bg-foreground transition-all group relative overflow-hidden"
               >
                  <span className="relative z-10 flex items-center justify-center gap-6">
                     {saving ? 'Synchronizing Archive...' : 'Commit Profile'}
                     <Save size={20} className="group-hover:scale-125 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white translate-x-full group-hover:translate-x-0 transition-transform duration-700 opacity-10"></div>
               </button>
            </div>
          </div>

          {/* Sidebar Modules (lg: 4 cols) */}
          <div className="lg:col-span-4 space-y-16">
            
            {/* Status Artifact */}
            <div className="bg-foreground text-white p-12 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group/status border-t-[12px] border-secondary">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 opacity-0 group-hover/status:opacity-100 transition-opacity" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-12 border-b border-white/5 pb-6">
                     <div className="h-0.5 w-8 bg-secondary"></div>
                     <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-white/30 italic">Active Mandate</span>
                  </div>
                  <div className="flex flex-col gap-8">
                     <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center text-secondary shadow-inner scale-110">
                        <Award size={40} />
                     </div>
                     <div>
                        <h3 className="font-headline font-black text-4xl uppercase tracking-tighter mb-2 leading-none">
                           {formData.isAdmin ? "Chief Administrator" : formData.isEditor ? "Senior Editor" : formData.isReviewer ? "Registry Reviewer" : "Associate Scholar"}
                        </h3>
                        <p className="font-body text-xs text-white/20 italic tracking-widest uppercase">Verified IJSDS Contributor Node</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Access Elevation Ledger */}
            <div className={cardClasses}>
               <div className="flex items-center gap-4 mb-10 border-b border-border/10 pb-6">
                  <Zap size={20} className="text-primary animate-pulse" />
                  <h4 className="font-headline font-black text-[11px] uppercase tracking-[0.4em] text-foreground/40 italic">Registry Elevation</h4>
               </div>
               <p className="font-body text-lg italic text-foreground/40 mb-12 leading-relaxed border-l-4 border-secondary/20 pl-6">
                 Submit requests for editorial or evaluation mandates. All status changes are vetted by the supreme Board of Directors.
               </p>
               
               <div className="space-y-8">
                  {/* Evaluator Node */}
                  <div className="flex flex-col gap-6 p-8 bg-secondary/5 border border-border/10 group/node transition-all hover:border-secondary/30">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <GraduationCap size={20} className="text-secondary/40 group-hover/node:text-secondary h-6 w-6 transition-colors" />
                           <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-foreground/30">Peer Evaluator</span>
                        </div>
                        {profile?.is_reviewer && (
                          <div className="px-4 py-1.5 bg-secondary text-white font-headline font-black text-[8px] uppercase tracking-widest shadow-lg">Authorized</div>
                        )}
                     </div>
                     <button 
                       disabled={profile?.request_reviewer || profile?.is_reviewer || loadingR} 
                       onClick={() => request('reviewer')}
                       className="w-full py-6 font-headline font-black text-[10px] uppercase tracking-[0.4em] transition-all disabled:opacity-50 border-2 border-border/10 text-foreground/40 hover:bg-secondary hover:text-white hover:border-secondary hover:shadow-xl"
                     >
                        {loadingR ? 'Processing Grid...' : profile?.request_reviewer ? 'Application Pending' : profile?.is_reviewer ? 'Mandate Active' : 'Request Role'}
                     </button>
                  </div>

                  {/* Editorial Node */}
                  <div className="flex flex-col gap-6 p-8 bg-primary/5 border border-border/10 group/node2 transition-all hover:border-primary/30">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <Layers size={20} className="text-primary/40 group-hover/node2:text-primary h-6 w-6 transition-colors" />
                           <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-foreground/30">Editorial Desk</span>
                        </div>
                        {profile?.is_editor && (
                          <div className="px-4 py-1.5 bg-primary text-white font-headline font-black text-[8px] uppercase tracking-widest shadow-lg">Authorized</div>
                        )}
                     </div>
                     <button 
                       disabled={profile?.request_editor || profile?.is_editor || loadingE} 
                       onClick={() => request('editor')}
                       className="w-full py-6 font-headline font-black text-[10px] uppercase tracking-[0.4em] transition-all disabled:opacity-50 border-2 border-border/10 text-foreground/40 hover:bg-primary hover:text-white hover:border-primary hover:shadow-xl"
                     >
                        {loadingE ? 'Accessing Ledger...' : profile?.request_editor ? 'Application Pending' : profile?.is_editor ? 'Mandate Active' : 'Request Role'}
                     </button>
                  </div>
               </div>
               
               <p className="mt-12 text-[10px] font-body italic text-foreground/20 leading-relaxed text-center">
                  All institutional protocol requests are logged in the scientific record for auditing.
               </p>
            </div>

            {/* Quick Metrics (Mock) */}
            <div className={cardClasses + " bg-secondary text-white border-none py-10"}>
               <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                     <span className="font-headline font-black text-[9px] uppercase tracking-[0.5em] opacity-40 italic">Scholarly Impact</span>
                     <span className="font-headline font-black text-4xl uppercase tracking-tighter">0.00</span>
                  </div>
                  <Zap size={32} className="opacity-20 animate-pulse" />
               </div>
            </div>

          </div>
        </div>
      </ContentSection>
    </div>
  );
};

export default Profile;