import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { FileText, Users, Clock, CheckCircle2, ArrowLeft, FileUp, RefreshCw } from 'lucide-react';
import { PaperDownload } from '@/components/papers/PaperDownload';
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge';
import { RejectSubmissionDialog } from '@/components/editor/RejectSubmissionDialog';
import { ApproveSubmissionDialog } from '@/components/editor/ApproveSubmissionDialog';
import { ReviewerInvitationDialog } from '@/components/editor/ReviewerInvitationDialog';
import { DeskRejectDialog } from '@/components/editor/DeskRejectDialog';
import { RevisionRequestDialog } from '@/components/editor/RevisionRequestDialog';
import { SystemVerification } from '@/components/testing/SystemVerification';
import { EditorFileManager } from '@/components/editor/EditorFileManager';
import { useNavigate } from 'react-router-dom';

interface Submission {
  id: string;
  submitted_at: string;
  status: string;
  article_id: string;
  submitter_id: string;
  cover_letter: string;
  articles: {
    title: string;
    abstract: string;
    corresponding_author_email: string;
    authors: any;
    manuscript_file_url: string;
    vetting_fee: boolean;
    Processing_fee: boolean;
    doi: string | null;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

export const Editorial = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkEditorStatus();
      fetchSubmissions();
    }
  }, [user, loading, navigate]);

  const checkEditorStatus = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_editor')
      .eq('id', user.id)
      .single();
    
    if (!profile?.is_editor) {
      toast({
        title: 'Access Denied',
        description: 'You do not have editor privileges.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }
    
    setIsEditor(true);
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          articles (
            title,
            abstract,
            corresponding_author_email,
            authors,
            manuscript_file_url,
            vetting_fee,
            Processing_fee,
            doi
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch submissions',
        variant: 'destructive',
      });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const updateDOIVersion = async (submissionId: string, articleDoi: string) => {
    try {
      toast({
        title: 'Updating DOI',
        description: 'Creating new version on Zenodo...',
      });

      const { data, error } = await supabase.functions.invoke('generate-zenodo-doi', {
        body: { submissionId, existingDoi: articleDoi }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success',
          description: `DOI updated to new version: ${data.doi}`,
        });
        fetchSubmissions();
      } else {
        throw new Error(data.error || 'Failed to update DOI');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update DOI version',
        variant: 'destructive',
      });
    }
  };

  const updateSubmissionStatus = async (submissionId: string, newStatus: string) => {
    try {
      // Get submission to find article_id
      const { data: submission, error: fetchError } = await supabase
        .from('submissions')
        .select('article_id')
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;

      // Update submission status
      const { error } = await supabase
        .from('submissions')
        .update({ status: newStatus })
        .eq('id', submissionId);

      if (error) throw error;

      // Update article status
      if (submission?.article_id) {
        const { error: articleError } = await supabase
          .from('articles')
          .update({ status: newStatus })
          .eq('id', submission.article_id);

        if (articleError) throw articleError;
      }

      toast({
        title: 'Success',
        description: 'Submission status updated',
      });
      
      fetchSubmissions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update submission status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'desk_rejected': return 'bg-red-100 text-red-800';
      case 'revision_requested': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FileText className="h-4 w-4" />;
      case 'under_review': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected': return <CheckCircle2 className="h-4 w-4" />;
      case 'desk_rejected': return <CheckCircle2 className="h-4 w-4" />;
      case 'revision_requested': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading || !isEditor) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </main>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'submitted');
  const underReviewSubmissions = submissions.filter(s => s.status === 'under_review');
  const revisionSubmissions = submissions.filter(s => s.status === 'revision_requested');
  const completedSubmissions = submissions.filter(s => ['accepted', 'rejected', 'desk_rejected'].includes(s.status));

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Editorial Dashboard</h1>
          <p className="text-muted-foreground">Manage journal submissions and reviews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSubmissions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{underReviewSubmissions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedSubmissions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* System Health Check - shown to editors */}
        <div className="mb-8">
          <SystemVerification />
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingSubmissions.length})</TabsTrigger>
            <TabsTrigger value="review">Under Review ({underReviewSubmissions.length})</TabsTrigger>
            <TabsTrigger value="revision">Revisions ({revisionSubmissions.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedSubmissions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loadingSubmissions ? (
              <div className="text-center py-8">Loading submissions...</div>
            ) : pendingSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No pending submissions</div>
            ) : (
              pendingSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{submission.articles.title}</CardTitle>
                        <CardDescription>
                          Submitted by {submission.profiles.full_name} • {new Date(submission.submitted_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1">{submission.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {submission.articles.abstract}
                    </p>
                    <div className="mb-4">
                      <PaymentStatusBadge 
                        vettingFee={submission.articles.vetting_fee}
                        processingFee={submission.articles.Processing_fee}
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <PaperDownload 
                        manuscriptFileUrl={submission.articles.manuscript_file_url}
                        title={submission.articles.title}
                      />
                      <Button 
                        size="sm" 
                        onClick={() => updateSubmissionStatus(submission.id, 'under_review')}
                      >
                        Start Review
                      </Button>
                      <ReviewerInvitationDialog
                        submissionId={submission.id}
                        submissionTitle={submission.articles.title}
                        onInvite={fetchSubmissions}
                        submission={submission}
                      />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileUp className="h-4 w-4 mr-2" />
                            Manage Files
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Manage Files - {submission.articles.title}</DialogTitle>
                          </DialogHeader>
                          <EditorFileManager
                            submissionId={submission.id}
                            articleId={submission.article_id}
                          />
                        </DialogContent>
                      </Dialog>
                      {submission.articles.doi && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateDOIVersion(submission.id, submission.articles.doi!)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Update DOI
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            {underReviewSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No submissions under review</div>
            ) : (
              underReviewSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{submission.articles.title}</CardTitle>
                        <CardDescription>
                          Submitted by {submission.profiles.full_name} • {new Date(submission.submitted_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1">{submission.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {submission.articles.abstract}
                    </p>
                    <div className="mb-4">
                      <PaymentStatusBadge 
                        vettingFee={submission.articles.vetting_fee}
                        processingFee={submission.articles.Processing_fee}
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <PaperDownload 
                        manuscriptFileUrl={submission.articles.manuscript_file_url}
                        title={submission.articles.title}
                      />
                      <ApproveSubmissionDialog 
                        submissionId={submission.id}
                        onApprove={fetchSubmissions}
                        articleId={submission.article_id}
                      />
                      <RevisionRequestDialog
                        submissionId={submission.id}
                        submissionTitle={submission.articles.title}
                        authorEmail={submission.articles.corresponding_author_email}
                        authorName={submission.profiles.full_name}
                        onRequest={fetchSubmissions}
                      />
                      <RejectSubmissionDialog 
                        submissionId={submission.id}
                        onReject={fetchSubmissions}
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/submission/${submission.id}/reviews`)}
                      >
                        View Reviews
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileUp className="h-4 w-4 mr-2" />
                            Manage Files
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Manage Files - {submission.articles.title}</DialogTitle>
                          </DialogHeader>
                          <EditorFileManager
                            submissionId={submission.id}
                            articleId={submission.article_id}
                          />
                        </DialogContent>
                      </Dialog>
                      {submission.articles.doi && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateDOIVersion(submission.id, submission.articles.doi!)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Update DOI
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="revision" className="space-y-4">
            {revisionSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No submissions awaiting revision</div>
            ) : (
              revisionSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{submission.articles.title}</CardTitle>
                        <CardDescription>
                          Submitted by {submission.profiles.full_name} • Revision requested
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1">{submission.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/submission/${submission.id}/revision`)}
                      >
                        View Revision Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No completed submissions</div>
            ) : (
              completedSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{submission.articles.title}</CardTitle>
                        <CardDescription>
                          Submitted by {submission.profiles.full_name} • {new Date(submission.submitted_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1">{submission.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
