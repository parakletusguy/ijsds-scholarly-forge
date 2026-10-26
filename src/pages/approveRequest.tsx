import { useState, useEffect } from 'react';
import { isAdminUser } from '@/lib/roleUtils';
import { useAuth } from '@/hooks/useAuth';
import { getProfiles, updateProfile } from '@/lib/profileService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from '@/components/admins/approveRequest';
import { ReviewerApplicationCard } from '@/components/admins/ReviewerApplicationCard';
import { getReviewerApplications, type ReviewerApplication } from '@/lib/reviewerApplicationService';
import { ShieldCheck, ArrowLeft, Users, ShieldAlert, Award } from 'lucide-react';

export const ManageRequests = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(true);
  const IsAdmin = isAdminUser(profile);
  const [editorRequests, seteditorRequests] = useState<any[]>([]);
  const [reviewerRequests, setreviewerRequests] = useState<any[]>([]);
  const [applications, setApplications] = useState<ReviewerApplication[]>([]);
  const [adminRequests, setadminRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!loading && user && !IsAdmin) {
      toast({ title: 'Access denied', description: 'You need admin access to view this page.', variant: 'destructive' });
      navigate('/dashboard'); return;
    }
    if (user && IsAdmin) fetchRequests();
  }, [user, profile, loading, navigate]);

  const fetchRequests = async () => {
    try {
      const [data, apps] = await Promise.all([getProfiles(), getReviewerApplications('PENDING').catch(() => [] as ReviewerApplication[])]);
      setApplications(apps);
      const withApplication = new Set(apps.map((a) => a.applicant?.id));
      const edi: any[] = [];
      const rev: any[] = [];
      const adm: any[] = [];
      data.forEach((p: any) => {
        if (p.request_admin) adm.push(p);
        else if (p.request_editor) edi.push(p);
        // Older one-click requests (no application on file) still appear, below the applications.
        else if (p.request_reviewer && !withApplication.has(p.id)) rev.push(p);
      });
      seteditorRequests(edi);
      setreviewerRequests(rev);
      setadminRequests(adm);
    } catch (error) { 
      toast({ title: "Couldn't load requests", description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally { 
      setLoadingData(false); 
    }
  };

  const handleApproveEditor = async (id: any, type: string) :Promise<void> => {
    try {
      const target = editorRequests.find((p:any) => p.id === id);
      if (type == 'approve') {
        await updateProfile(id, { is_editor: true, request_editor: false });
        // The requester is notified (in-app + email) by the backend.
        toast({ title: 'Approved', description: `${target?.full_name} is now an editor.` });
      } else {
        await updateProfile(id, { request_editor: false });
        // The requester is notified (in-app + email) by the backend.
        toast({ title: 'Declined', description: `Editor request for ${target?.full_name} has been declined.` });
      }
      fetchRequests();
    } catch (error) { toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' }); }
  };

  const handleApproveReviewer = async (id: any, type: string) : Promise<void> => {
    try {
      const target = reviewerRequests.find((p:any) => p.id === id);
      if (type == 'approve') {
        await updateProfile(id, { is_reviewer: true, request_reviewer: false });
        // The requester is notified (in-app + email) by the backend.
        toast({ title: 'Approved', description: `${target?.full_name} is now a reviewer.` });
      } else {
        await updateProfile(id, { request_reviewer: false });
        // The requester is notified (in-app + email) by the backend.
        toast({ title: 'Declined', description: `Reviewer request for ${target?.full_name} has been declined.` });
      }
      fetchRequests();
    } catch (error) { toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' }); }
  };
  
  const handleApproveAdmin = async (id: any, type: string) : Promise<void> => {
    try {
      const target = adminRequests.find((p:any) => p.id === id);
      if (type == 'approve') {
        await updateProfile(id, { is_admin: true, request_admin: false, assign_role: 'admin' });
        // The requester is notified (in-app + email) by the backend.
        toast({ title: 'Approved', description: `${target?.full_name} is now an admin.` });
      } else {
        await updateProfile(id, { request_admin: false });
        // The requester is notified (in-app + email) by the backend.
        toast({ title: 'Declined', description: `Admin request for ${target?.full_name} has been declined.` });
      }
      fetchRequests();
    } catch (error) { toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' }); }
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
          Back
        </Button>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Requests</h1>
          <p className="text-muted-foreground">
            Approve or decline requests for reviewer, editor, and admin roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviewer Invitations Pending</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviewerRequests.length + applications.length}</div>
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
                  Reviewer requests
                  <Badge variant="secondary" className="ml-2">{reviewerRequests.length + applications.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="editors" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-4"
                >
                  Editor requests
                  <Badge variant="secondary" className="ml-2">{editorRequests.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="admins" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-4"
                >
                  Admin requests
                  <Badge variant="secondary" className="ml-2">{adminRequests.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="pt-6">
              <TabsContent value="reviewers" className="space-y-4 m-0">
                {applications.map((app) => (
                  <ReviewerApplicationCard key={app.id} application={app} onDecided={fetchRequests} />
                ))}
                {reviewerRequests.length > 0 && applications.length > 0 && (
                  <p className="text-xs text-muted-foreground pt-2">Older requests made before the application form (no details on file):</p>
                )}
                {reviewerRequests.length === 0 && applications.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No reviewer requests.</div>
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
                  <div className="py-12 text-center text-muted-foreground">No editor requests.</div>
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
