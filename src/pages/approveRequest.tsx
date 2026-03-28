import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getProfiles, updateProfile } from '@/lib/profileService';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from '@/components/admins/approveRequest';

export const ManageRequests = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const IsAdmin = !!profile?.is_admin;
  const [editorRequests, seteditorRequests] = useState([])
  const [reviewerRequests, setreviewerRequests] = useState([])

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (!loading && user && !IsAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have Admin privileges.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }
    if (user && IsAdmin) {
      fetchRequests();
    }
  }, [user, profile, loading, navigate]);

  const fetchRequests = async () => {
    try {
      const data = await getProfiles();
      const edi = []
      const rev = []
      data.forEach((p: any) => {
        if (p.request_editor) edi.push(p)
        else if (p.request_reviewer) rev.push(p)
      })
      seteditorRequests(edi)
      setreviewerRequests(rev)
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  const handleApproveEditor = async (id, type) :Promise<void> => {
    try {
      const target = editorRequests.find((p:any) => p.id === id);
      if (type == 'approve') {
        await updateProfile(id, { is_editor: true, request_editor: false });
        try {
          const { notifyRequesterOfRoleDecision } = await import('@/lib/roleNotificationService');
          await notifyRequesterOfRoleDecision({ userId: id, email: target?.email || '', name: target?.full_name || '', role: 'editor', decision: 'accepted' });
        } catch (e) { console.warn('Failed to notify editor approval:', e); }
        toast({ title: 'Request Approved', description: `you've accepted the request, user is now an editor` });
      } else {
        await updateProfile(id, { request_editor: false });
        try {
          const { notifyRequesterOfRoleDecision } = await import('@/lib/roleNotificationService');
          await notifyRequesterOfRoleDecision({ userId: id, email: target?.email || '', name: target?.full_name || '', role: 'editor', decision: 'rejected' });
        } catch (e) { console.warn('Failed to notify editor rejection:', e); }
        toast({ title: 'Request Denied', description: `you've rejected the request` });
      }
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast({ title: 'Request Error', description: 'An error occured', variant: 'destructive' });
    }
  }

  const handleApproveReviewer = async (id, type) : Promise<void> => {
    try {
      const target = reviewerRequests.find((p:any) => p.id === id);
      if (type == 'approve') {
        await updateProfile(id, { is_reviewer: true, request_reviewer: false });
        try {
          const { notifyRequesterOfRoleDecision } = await import('@/lib/roleNotificationService');
          await notifyRequesterOfRoleDecision({ userId: id, email: target?.email || '', name: target?.full_name || '', role: 'reviewer', decision: 'accepted' });
        } catch (e) { console.warn('Failed to notify reviewer approval:', e); }
        toast({ title: 'Request Approved', description: `you've accepted the request, user is now a reviewer` });
      } else {
        await updateProfile(id, { request_reviewer: false });
        try {
          const { notifyRequesterOfRoleDecision } = await import('@/lib/roleNotificationService');
          await notifyRequesterOfRoleDecision({ userId: id, email: target?.email || '', name: target?.full_name || '', role: 'reviewer', decision: 'rejected' });
        } catch (e) { console.warn('Failed to notify reviewer rejection:', e); }
        toast({ title: 'Request Denied', description: `you've rejected the request` });
      }
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast({ title: 'Request Error', description: 'An error occured', variant: 'destructive' });
    }
  }


    return (<div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Access Requests</h1>

      <Tabs defaultValue="reviewers" className="w-full min-h-[300px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviewers">Reviewer Requests</TabsTrigger>
          <TabsTrigger value="editors">Editor Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="reviewers" className="mt-6">
          <div className="">
            {reviewerRequests.map(profile => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onApprove={() => handleApproveReviewer(profile.id,'approve')}
                onReject={() => handleApproveReviewer(profile.id,'reject')}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="editors" className="mt-6">
          <div className="">
            {editorRequests.map(profile => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                 onApprove={() => handleApproveEditor(profile.id,'approve')}
                onReject={() => handleApproveEditor(profile.id,'reject')}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>)
  }
