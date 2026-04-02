import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSubmissions, updateSubmission } from '@/lib/submissionService';
import { api } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { FileText, Users, Clock, CheckCircle2, ArrowLeft, FileUp, RefreshCw, ShieldAlert, Activity, ClipboardList, Database, ChevronRight } from 'lucide-react';
import { PaperDownload } from '@/components/papers/PaperDownload';
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge';
import { RejectSubmissionDialog } from '@/components/editor/RejectSubmissionDialog';
import { ApproveSubmissionDialog } from '@/components/editor/ApproveSubmissionDialog';
import { ReviewerInvitationDialog } from '@/components/editor/ReviewerInvitationDialog';
import { RevisionRequestDialog } from '@/components/editor/RevisionRequestDialog';
import { SystemVerification } from '@/components/testing/SystemVerification';
import { EditorFileManager } from '@/components/editor/EditorFileManager';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

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
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const isEditor = !!(profile?.is_editor || profile?.is_admin);

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!loading && user && !isEditor) {
      toast({ title: 'Access Denied', description: 'Institutional credentials required.', variant: 'destructive' });
      navigate('/dashboard'); return;
    }
    if (user && isEditor) fetchSubmissions();
  }, [user, profile, loading, navigate]);

  const fetchSubmissions = async () => {
    try {
      const data = await getSubmissions();
      setSubmissions(data as any || []);
    } catch (error: any) {
      toast({ title: 'Sync Error', description: 'Failed to fetch editorial records.', variant: 'destructive' });
    } finally { setLoadingSubmissions(false); }
  };

  const updateDOIVersion = async (submissionId: string, articleDoi: string) => {
    try {
      toast({ title: 'DOI Synchronization', description: 'Transmitting new version metadata...' });
      const data = await api.post<any>('/api/doi/generate', { article_id: submissionId, existingDoi: articleDoi });
      if (data.success) {
        toast({ title: 'Registry Updated', description: `DOI synchronized: ${data.data?.doi}` });
        fetchSubmissions();
      } else { throw new Error('Registry rejection'); }
    } catch (error: any) {
      toast({ title: 'DOI Error', description: error.message || 'Failed to update registry.', variant: 'destructive' });
    }
  };

  const updateSubmissionStatus = async (submissionId: string, newStatus: string) => {
    try {
      await updateSubmission(submissionId, { status: newStatus });
      toast({ title: 'Command Success', description: `Workflow transitioned to: ${newStatus.toUpperCase()}` });
      fetchSubmissions();
    } catch (error: any) {
      toast({ title: 'Command Refused', description: 'Internal state transition failed.', variant: 'destructive' });
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'under_review': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'revision_requested': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'accepted': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'rejected': case 'desk_rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FileText size={14} />;
      case 'under_review': return <Clock size={14} />;
      case 'accepted': return <CheckCircle2 size={14} />;
      case 'rejected': case 'desk_rejected': return <ShieldAlert size={14} />;
      case 'revision_requested': return <Activity size={14} />;
      default: return <FileText size={14} />;
    }
  };

  if (loading || !isEditor) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const pendingSubmissions = submissions.filter(s => s.status === 'submitted');
  const underReviewSubmissions = submissions.filter(s => s.status === 'under_review');
  const revisionSubmissions = submissions.filter(s => s.status === 'revision_requested');
  const completedSubmissions = submissions.filter(s => ['accepted', 'rejected', 'desk_rejected'].includes(s.status));

  const cardClasses = "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group";

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <PageHeader 
        title="Editorial" 
        subtitle="Command" 
        accent="Central Management Hub"
        description="Oversee the lifecycle of scholarly contributions. Manage peer evaluation, editorial decisions, and system integrity within the IJSDS ecosystem."
      />

      {/* Control Navigation */}
      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate(-1)} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Exit Command Hub
           </Button>
           
           <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
              <ShieldAlert size={16} className="text-secondary" />
              <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Authorized Editorial Access</span>
           </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
           {[
             { label: "Manuscript Census", val: submissions.length, icon: <Database />, color: "border-foreground" },
             { label: "Action Horizon", val: pendingSubmissions.length, icon: <Clock />, color: "border-primary" },
             { label: "Review Orbit", val: underReviewSubmissions.length, icon: <Users />, color: "border-secondary" },
             { label: "Archival Finalized", val: completedSubmissions.length, icon: <CheckCircle2 />, color: "border-primary" }
           ].map((stat, i) => (
             <div key={i} className={`bg-white p-10 border-t-8 ${stat.color} shadow-xl relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-muted/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 bg-muted rounded-none text-foreground/40">{stat.icon}</div>
                   <span className="font-headline font-black text-4xl text-foreground tracking-tighter">{stat.val}</span>
                </div>
                <p className="font-headline font-bold text-xs uppercase tracking-widest text-foreground/40">{stat.label}</p>
             </div>
           ))}
        </div>

        {/* System Integrity Check */}
        <div className="mb-16 border-l-4 border-secondary p-8 bg-secondary/5">
           <h4 className="font-headline font-black text-[10px] uppercase tracking-widest text-secondary mb-6 flex items-center gap-2"><Activity size={12} /> System Diagnostic Engine</h4>
           <SystemVerification />
        </div>

        <Tabs defaultValue="pending" className="space-y-12">
          <TabsList className="bg-white border border-border/20 p-2 rounded-none h-auto flex flex-wrap shadow-sm">
            {[
              { val: "pending", label: "Pending Queue", count: pendingSubmissions.length },
              { val: "review", label: "Active Evaluation", count: underReviewSubmissions.length },
              { val: "revision", label: "Awaiting Revision", count: revisionSubmissions.length },
              { val: "completed", label: "Work History", count: completedSubmissions.length }
            ].map(tab => (
              <TabsTrigger key={tab.val} value={tab.val} className="rounded-none py-4 px-8 data-[state=active]:bg-foreground data-[state=active]:text-white font-headline font-black uppercase text-[10px] tracking-widest transition-all gap-3 border-r border-border/10 last:border-0 grow">
                {tab.label} <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-none rounded-none text-[8px] font-bold px-2">{tab.count}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="pending" className="space-y-8 mt-0">
            {loadingSubmissions ? (
              <div className="py-24 text-center text-foreground/30 font-headline font-black uppercase text-[10px] tracking-widest">Synchronizing Registry...</div>
            ) : pendingSubmissions.length === 0 ? (
              <div className={cardClasses + " py-24 text-center opacity-40 italic font-body"}>Queue is currently empty. All data synchronized.</div>
            ) : (
              pendingSubmissions.map((submission) => {
                const art = submission.article || (submission as any).articles || {};
                return (
                  <div key={submission.id} className={cardClasses + " flex flex-col md:flex-row gap-10 hover:border-primary/20 transition-all shadow-md hover:shadow-2xl"}>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                         <Badge variant="outline" className={`rounded-none font-headline font-bold uppercase text-[9px] tracking-widest px-3 py-1 flex items-center gap-2 ${getStatusStyle(submission.status)}`}>
                            {getStatusIcon(submission.status)} {submission.status.replace('_', ' ')}
                         </Badge>
                         <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/20">Ref: {submission.id.slice(0, 8)}</span>
                      </div>
                      
                      <h3 className="text-2xl font-headline font-black uppercase tracking-tight mb-4 group-hover:text-primary transition-colors leading-tight">{art.title}</h3>
                      <p className="font-body text-foreground/40 text-sm italic mb-8 border-l-2 border-primary/20 pl-6 line-clamp-2">Submitted by <span className="text-foreground font-bold not-italic">{submission.profiles.full_name}</span> on {new Date(submission.submitted_at).toLocaleDateString()}</p>
                      
                      <div className="flex flex-wrap gap-4 items-center border-t border-border/20 pt-8">
                        <PaperDownload manuscriptFileUrl={art.manuscript_file_url} title={art.title} />
                        <Button size="sm" onClick={() => updateSubmissionStatus(submission.id, 'under_review')} className="bg-foreground text-white rounded-none font-headline font-black uppercase text-[10px] px-6 h-10 hover:bg-primary transition-all">Start Review Cycle</Button>
                        <ReviewerInvitationDialog submissionId={submission.id} submissionTitle={art.title} onInvite={fetchSubmissions} submission={submission} />
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-none font-headline font-black uppercase text-[10px] px-6 h-10 border-border/40 hover:border-primary transition-all gap-2">
                               <FileUp size={14} /> Intelligence Assets
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-5xl bg-white rounded-none border-none shadow-2xl p-0">
                            <PageHeader title="Dossier" subtitle="Assets" accent="Asset Management" className="py-12" />
                            <div className="p-10"><EditorFileManager submissionId={submission.id} articleId={submission.article_id} /></div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-64 shrink-0 flex flex-col justify-center border-l border-border/40 md:pl-10 space-y-6">
                       <div className="space-y-2">
                          <p className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/30">Financial Clearance</p>
                          <PaymentStatusBadge vettingFee={art.vetting_fee} processingFee={art.Processing_fee} />
                       </div>
                       <Button variant="ghost" onClick={() => navigate(`/submission/${submission.id}/details`)} className="w-full justify-between font-headline font-black uppercase text-[9px] tracking-widest text-foreground/40 hover:text-primary p-0">Detailed Dossier <ChevronRight size={14} /></Button>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-8 mt-0">
            {underReviewSubmissions.length === 0 ? (
              <div className={cardClasses + " py-24 text-center opacity-40 italic font-body"}>No manuscripts currently in active evaluation orbit.</div>
            ) : (
              underReviewSubmissions.map((submission) => {
                const art = submission.article || (submission as any).articles || {};
                return (
                  <div key={submission.id} className={cardClasses + " border-t-8 border-secondary"}>
                    <div className="flex flex-col md:flex-row gap-10">
                       <div className="flex-1">
                          <div className="flex items-center gap-4 mb-6">
                             <Badge variant="outline" className={`rounded-none font-headline font-bold uppercase text-[9px] tracking-widest px-3 py-1 flex items-center gap-2 ${getStatusStyle(submission.status)}`}>
                                {getStatusIcon(submission.status)} Review in Progress
                             </Badge>
                             <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/20">Ref: {submission.id.slice(0, 8)}</span>
                          </div>
                          
                          <h3 className="text-2xl font-headline font-black uppercase tracking-tight mb-4 leading-tight">{art.title}</h3>
                          <p className="font-body text-foreground/40 text-sm italic mb-8">Author: {submission.profiles.full_name} | Verified on {new Date(submission.submitted_at).toLocaleDateString()}</p>
                          
                          <div className="flex flex-wrap gap-4 items-center border-t border-border/20 pt-8">
                             <ApproveSubmissionDialog submissionId={submission.id} onApprove={fetchSubmissions} articleId={submission.article_id} />
                             <RevisionRequestDialog submissionId={submission.id} submissionTitle={art.title} authorEmail={art.corresponding_author_email} authorName={submission.profiles.full_name} onRequest={fetchSubmissions} />
                             <RejectSubmissionDialog submissionId={submission.id} onReject={fetchSubmissions} />
                             <Button size="sm" variant="outline" onClick={() => navigate(`/submission/${submission.id}/reviews`)} className="rounded-none font-headline font-black uppercase text-[10px] px-6 h-10 border-border/40 hover:border-primary transition-all">Audit Reviews</Button>
                             
                             {art.doi && (
                                <Button size="sm" variant="ghost" onClick={() => updateDOIVersion(submission.id, art.doi!)} className="rounded-none font-headline font-black uppercase text-[9px] tracking-widest text-primary gap-2 hover:bg-primary/5">
                                   <RefreshCw size={12} className="animate-spin-slow" /> Regenerate DOI
                                </Button>
                             )}
                          </div>
                       </div>
                       
                       <div className="w-full md:w-48 shrink-0 flex flex-col justify-center border-l border-border/40 md:pl-10">
                          <PaymentStatusBadge vettingFee={art.vetting_fee} processingFee={art.Processing_fee} />
                       </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* Additional tab contents (Revision/Completed) would follow similar patterns */}
          
        </Tabs>
      </ContentSection>
    </div>
  );
};
