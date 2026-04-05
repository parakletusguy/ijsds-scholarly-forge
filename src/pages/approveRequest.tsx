import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getProfiles, updateProfile } from '@/lib/profileService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from '@/components/admins/approveRequest';
import { ShieldCheck, ArrowLeft, Users, ShieldAlert, Award } from 'lucide-react';

export const ManageRequests = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(true);
  const IsAdmin = !!profile?.is_admin;
  const [editorRequests, seteditorRequests] = useState<any[]>([]);
  const [reviewerRequests, setreviewerRequests] = useState<any[]>([]);
  const [adminRequests, setadminRequests] = useState<any[]>([]);

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
      const edi: any[] = [];
      const rev: any[] = [];
      const adm: any[] = [];
      data.forEach((p: any) => {
        if (p.request_admin) adm.push(p);
        else if (p.request_editor) edi.push(p);
        else if (p.request_reviewer) rev.push(p);
      });
      seteditorRequests(edi);
      setreviewerRequests(rev);
      setadminRequests(adm);
    } catch (error) { 
      toast({ title: 'Sync Error', description: 'Failed to access recruitment registry.', variant: 'destructive' }); 
    } finally { 
      setLoadingData(false); 
    }
  };

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
  };

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
  };
  
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
  };

  if (loading || !IsAdmin || loadingData) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex items-center gap-2">
        <div className="w-4 h-4 bg-primary rounded-full animate-bounce" />
        <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-.3s]" />
        <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-.5s]" />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative py-3">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-4 absolute top-1 left-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Command Hub
        </Button>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Institutional Registry</h1>
          <p className="text-muted-foreground">
            Manage recruitment requests for editorial and peer evaluation panels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviewer Invitations Pending</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviewerRequests.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Editorial Board Applications</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{editorRequests.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <Tabs defaultValue="reviewers" className="w-full">
            <CardHeader className="p-0 border-b">
              <TabsList className="w-full h-auto bg-transparent rounded-none border-b-0 p-0 flex">
                <TabsTrigger 
                  value="reviewers" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-4"
                >
                  Peer Evaluation Panel
                  <Badge variant="secondary" className="ml-2">{reviewerRequests.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="editors" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-4"
                >
                  Editorial Governance
                  <Badge variant="secondary" className="ml-2">{editorRequests.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="admins" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-4"
                >
                  Administrative Control
                  <Badge variant="secondary" className="ml-2">{adminRequests.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="pt-6">
              <TabsContent value="reviewers" className="space-y-4 m-0">
                {reviewerRequests.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">Registry is currently clear.</div>
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

              <TabsContent value="editors" className="space-y-4 m-0">
                {editorRequests.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">Editorial applications registry clear.</div>
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

              <TabsContent value="admins" className="space-y-4 m-0">
                {adminRequests.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No administrative applications pending.</div>
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
            </CardContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};
