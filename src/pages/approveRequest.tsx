import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [IsAdmin, setIsAdmin] = useState(false);
  const [editorRequests, seteditorRequests] = useState([])
  const [reviewerRequests, setreviewerRequests] = useState([])

  const navigationElements = [

  ]

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      checkAdminStatus()
      fetchRequests()
      return;
    }

    if (user) {

    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (!profile?.is_admin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have Admin privileges.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }
    
    setIsAdmin(true);
  }

  const fetchRequests = async () => {
    try {
        const {data,error} = await supabase
        .from('profiles')
        .select('*')
        .eq('request_editor',true)
        .gt('request_reviewer', true)

        if(error) throw error
        const edi = []
        const rev = []
        data.forEach((requests) => {
            if(requests.request_editor){
                edi.push(requests)
            }else if(requests.request_reviewer){
                rev.push(requests)
            }
        })
        seteditorRequests(edi)
        setreviewerRequests(rev)
    } catch (error) {
        if(error){
            //toast
        }
    }
  }

  const handleApproveEditor = async (id,type) :Promise<void> => {
        try {
            if(type == 'approve'){
                const {data,error} = await supabase
                .from('profiles')
                .update({is_editor:true})
                .eq('id',id)

                if(error) throw error
            }else{
                toast({
                title: 'Request Denied',
                description: `you've rejected the request`
                });
            }

            toast({
                title: 'Request Approved',
                description: `you've accepted the request, user is now an editor`
                });
        } catch (error) {
             if(error){
                console.error(error)
                toast({
                    title: 'Request Error',
                    description: 'An error occured',
                    variant: 'destructive',
                });
            }
        }
  }

    const handleApproveReviewer = async (id,type) : Promise<void> => {
        try {
            if(type == 'approve'){
                const {data,error} = await supabase
                .from('profiles')
                .update({is_reviewer:true})
                .eq('id',id)

                if(error) throw error
            }else{
                toast({
                title: 'Request Denied',
                description: `you've rejected the request`
                });
            }

            toast({
                title: 'Request Approved',
                description: `you've accepted the request, user is now a reviewer`
                });
        } catch (error) {
            if(error){
                console.error(error)
                toast({
                    title: 'Request Error',
                    description: 'An error occured',
                    variant: 'destructive',
                });
            }
        }
  }


    return (<div className="p-8">
        <Header/>
      <h1 className="text-3xl font-bold mb-6">Access Requests</h1>

      <Tabs defaultValue="reviewers" className="w-full min-h-[300px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviewers">Reviewer Requests</TabsTrigger>
          <TabsTrigger value="editors">Editor Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="reviewers" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <Footer/>
    </div>)
  }
