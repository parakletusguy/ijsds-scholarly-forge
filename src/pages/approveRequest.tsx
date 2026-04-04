import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getProfiles, updateProfile } from '@/lib/profileService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from '@/components/admins/approveRequest';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import { ShieldCheck, ArrowLeft, Users, ShieldAlert, Award, Activity } from 'lucide-react';

export const ManageRequests = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(true);
  const IsAdmin = !!profile?.is_admin;
  const [editorRequests, seteditorRequests] = useState<any[]>([])
  const [reviewerRequests, setreviewerRequests] = useState<any[]>([])
  const [adminRequests, setadminRequests] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!loading && user && !IsAdmin) {
      toast({ title: 'Access Denied', description: 'Administrative credentials required.', variant: 'destructive' });
      navigate('/dashboard'); return;
    }
    if (user && IsAdmin) fetchRequests();
  }, [user, profile, loading, navigate]);

  const fetchRequests = async () => {
    try {
      const data = await getProfiles();
      const edi: any[] = []
      const rev: any[] = []
      const adm: any[] = []
      data.forEach((p: any) => {
        if (p.request_admin) adm.push(p)
        else if (p.request_editor) edi.push(p)
        else if (p.request_reviewer) rev.push(p)
      })
      seteditorRequests(edi)
      setreviewerRequests(rev)
      setadminRequests(adm)
    } catch (error) { toast({ title: 'Sync Error', description: 'Failed to access recruitment registry.', variant: 'destructive' }); }
    finally { setLoadingData(false); }
  }

  const handleApproveEditor = async (id: any, type: string) :Promise<void> => {
    try {
      const target = editorRequests.find((p:any) => p.id === id);
      if (type == 'approve') {
        await updateProfile(id, { is_editor: true, request_editor: false });
        try {
          const { notifyRequesterOfRoleDecision } = await import('@/lib/roleNotificationService');
          await notifyRequesterOfRoleDecision({ userId: id, email: target?.email || '', name: target?.full_name || '', role: 'editor', decision: 'accepted' });
        } catch (e) { console.warn('Notification failed', e); }
        toast({ title: 'Authorization Success', description: `User ${target?.full_name} has been synchronized as an Editorial Board member.` });
      } else {
        await updateProfile(id, { request_editor: false });
        try {
          const { notifyRequesterOfRoleDecision } = await import('@/lib/roleNotificationService');
          await notifyRequesterOfRoleDecision({ userId: id, email: target?.email || '', name: target?.full_name || '', role: 'editor', decision: 'rejected' });
        } catch (e) { console.warn('Notification failed', e); }
        toast({ title: 'Authorization Refused', description: `Editorial request for ${target?.full_name} has been declined.` });
      }
      fetchRequests();
    } catch (error) { toast({ title: 'Command Refused', description: 'Failed to finalize decision registry.', variant: 'destructive' }); }
  }

  const handleApproveReviewer = async (id: any, type: string) : Promise<void> => {
    try {
      const target = reviewerRequests.find((p:any) => p.id === id);
      if (type == 'approve') {
        await updateProfile(id, { is_reviewer: true, request_reviewer: false });
        try {
          const { notifyRequesterOfRoleDecision } = await import('@/lib/roleNotificationService');
          await notifyRequesterOfRoleDecision({ userId: id, email: target?.email || '', name: target?.full_name || '', role: 'reviewer', decision: 'accepted' });
        } catch (e) { console.warn('Notification failed', e); }
        toast({ title: 'Authorization Success', description: `User ${target?.full_name} has been synchronized as a Peer Reviewer.` });
      } else {
        await updateProfile(id, { request_reviewer: false });
        try {
          const { notifyRequesterOfRoleDecision } = await import('@/lib/roleNotificationService');
          await notifyRequesterOfRoleDecision({ userId: id, email: target?.email || '', name: target?.full_name || '', role: 'reviewer', decision: 'rejected' });
        } catch (e) { console.warn('Notification failed', e); }
        toast({ title: 'Authorization Refused', description: `Peer-review request for ${target?.full_name} has been declined.` });
      }
      fetchRequests();
    } catch (error) { toast({ title: 'Command Refused', description: 'Failed to finalize decision registry.', variant: 'destructive' }); }
  }
  
  const handleApproveAdmin = async (id: any, type: string) : Promise<void> => {
    try {
      const target = adminRequests.find((p:any) => p.id === id);
      if (type == 'approve') {
        await updateProfile(id, { is_admin: true, request_admin: false, role: 'admin' });
        try {
          const { notifyRequesterOfRoleDecision } = await import('@/lib/roleNotificationService');
          await notifyRequesterOfRoleDecision({ userId: id, email: target?.email || '', name: target?.full_name || '', role: 'admin', decision: 'accepted' });
        } catch (e) { console.warn('Notification failed', e); }
        toast({ title: 'Authorization Success', description: `User ${target?.full_name} has been synchronized as a System Administrator.` });
      } else {
        await updateProfile(id, { request_admin: false });
        try {
          const { notifyRequesterOfRoleDecision } = await import('@/lib/roleNotificationService');
          await notifyRequesterOfRoleDecision({ userId: id, email: target?.email || '', name: target?.full_name || '', role: 'admin', decision: 'rejected' });
        } catch (e) { console.warn('Notification failed', e); }
        toast({ title: 'Authorization Refused', description: `Administrative request for ${target?.full_name} has been declined.` });
      }
      fetchRequests();
    } catch (error) { toast({ title: 'Command Refused', description: 'Failed to finalize decision registry.', variant: 'destructive' }); }
  }

  if (loading || !IsAdmin || loadingData) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const cardClasses = "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group";

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <PageHeader 
        title="Role" 
        subtitle="Protocol" 
        accent="Access Management"
        description="Oversee the authorization of scholarly identities. Redefine institutional access and manage recruitment requests for editorial and peer evaluation panels."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate(-1)} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Return to Command
           </Button>
           
           <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
              <ShieldCheck size={16} className="text-secondary" />
              <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Authorized Governance Control</span>
           </div>
        </div>

        {/* Governance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
           <div className={`bg-white p-10 border-t-8 border-primary shadow-xl relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-muted/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
              <div className="flex items-center justify-between mb-4">
                 <div className="p-3 bg-muted rounded-none text-foreground/40"><Users size={24} /></div>
                 <span className="font-headline font-black text-4xl text-foreground tracking-tighter">{reviewerRequests.length}</span>
              </div>
              <p className="font-headline font-bold text-xs uppercase tracking-widest text-foreground/40">Reviewer Invitations Pending</p>
           </div>
           <div className={`bg-white p-10 border-t-8 border-secondary shadow-xl relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-muted/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
              <div className="flex items-center justify-between mb-4">
                 <div className="p-3 bg-muted rounded-none text-foreground/40"><Award size={24} /></div>
                 <span className="font-headline font-black text-4xl text-foreground tracking-tighter">{editorRequests.length}</span>
              </div>
              <p className="font-headline font-bold text-xs uppercase tracking-widest text-foreground/40">Editorial Board Applications</p>
           </div>
        </div>

        <Tabs defaultValue="reviewers" className="space-y-12">
          <TabsList className="bg-white border border-border/20 p-2 rounded-none h-auto flex flex-wrap shadow-sm">
            {[
              { val: "reviewers", label: "Peer Evaluation Panel", count: reviewerRequests.length },
              { val: "editors", label: "Editorial Governance", count: editorRequests.length },
              { val: "admins", label: "Administrative Control", count: adminRequests.length }
            ].map(tab => (
              <TabsTrigger key={tab.val} value={tab.val} className="rounded-none py-4 px-8 data-[state=active]:bg-foreground data-[state=active]:text-white font-headline font-black uppercase text-[10px] tracking-widest transition-all gap-4 grow border-r border-border/10 last:border-0 h-16">
                {tab.label} <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-none rounded-none text-[8px] font-bold px-2">{tab.count}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="reviewers" className="space-y-4 mt-0">
            {reviewerRequests.length === 0 ? (
               <div className={cardClasses + " py-24 text-center opacity-40 italic font-body"}>Registry is currently clear. All evaluations synchronized.</div>
            ) : (
               reviewerRequests.map(profile => (
                 <ProfileCard
                   key={profile.id}
                   profile={profile}
                   onApprove={() => handleApproveReviewer(profile.id,'approve')}
                   onReject={() => handleApproveReviewer(profile.id,'reject')}
                 />
               ))
            )}
          </TabsContent>

          <TabsContent value="editors" className="space-y-4 mt-0">
            {editorRequests.length === 0 ? (
               <div className={cardClasses + " py-24 text-center opacity-40 italic font-body"}>Editorial applications registry clear.</div>
            ) : (
               editorRequests.map(profile => (
                 <ProfileCard
                   key={profile.id}
                   profile={profile}
                   onApprove={() => handleApproveEditor(profile.id,'approve')}
                   onReject={() => handleApproveEditor(profile.id,'reject')}
                 />
               ))
            )}
          </TabsContent>
          <TabsContent value="admins" className="space-y-4 mt-0">
            {adminRequests.length === 0 ? (
               <div className={cardClasses + " py-24 text-center opacity-40 italic font-body"}>No administrative applications pending.</div>
            ) : (
               adminRequests.map(profile => (
                 <ProfileCard
                   key={profile.id}
                   profile={profile}
                   onApprove={() => handleApproveAdmin(profile.id,'approve')}
                   onReject={() => handleApproveAdmin(profile.id,'reject')}
                 />
               ))
            )}
          </TabsContent>
        </Tabs>
      </ContentSection>
    </div>
  )
}
