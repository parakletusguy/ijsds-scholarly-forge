import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getReviews } from '@/lib/reviewService';
import { getSubmission } from '@/lib/submissionService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { FileText, Clock, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, ChevronRight, Activity, ClipboardCheck } from 'lucide-react';
import { PaperDownload } from '@/components/papers/PaperDownload';
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

interface ReviewWithSubmission {
  id: string;
  submission_id: string;
  submitted_at: string | null;
  recommendation: string | null;
  invitation_status: string;
  deadline_date: string | null;
  submission: {
    id: string;
    submitted_at: string;
    article: {
      title: string;
      abstract: string;
      subject_area: string;
      corresponding_author_email: string;
      manuscript_file_url: string;
      vetting_fee: boolean;
      processing_fee: boolean;
    };
  };
}

export const ReviewerDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewWithSubmission[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const isReviewer = !!profile?.is_reviewer;

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!loading && user && !isReviewer) {
      toast({ title: 'Access Denied', description: 'Reviewer credentials required.', variant: 'destructive' });
      navigate('/dashboard'); return;
    }
    if (user && isReviewer) fetchReviews();
  }, [user, profile, loading, navigate]);

  const fetchReviews = async () => {
    try {
      const reviewList = await getReviews();
      const withSubmissions = await Promise.all(
        reviewList.map(async (review) => {
          const submission = await getSubmission(review.submission_id);
          return { ...review, submission } as unknown as ReviewWithSubmission;
        })
      );
      setReviews(withSubmissions);
    } catch (error: any) {
      toast({ title: 'Sync Error', description: 'Failed to fetch review assignments.', variant: 'destructive' });
    } finally { setLoadingReviews(false); }
  };

  const getReviewStatus = (review: ReviewWithSubmission) => {
    if (review.submitted_at) return { status: 'completed', label: 'Evaluation Finalized', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
    return { status: 'pending', label: 'Awaiting Assessment', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
  };

  const getReviewIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={14} />;
      case 'pending': return <Clock size={14} />;
      default: return <FileText size={14} />;
    }
  };

  if (loading || !isReviewer) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pendingReviews = reviews.filter(r => !r.submitted_at);
  const completedReviews = reviews.filter(r => r.submitted_at);
  const cardClasses = "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group";

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader 
        title="Evaluator" 
        subtitle="Command" 
        accent="Peer Review Hub"
        description="Contribute to the intellectual integrity of global social development research. Manage your assigned manuscripts and provide expert evaluation."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate(-1)} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Return to Command
           </Button>
           
           <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
              <ShieldCheck size={16} className="text-secondary" />
              <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Credentialed Evaluator Profile</span>
           </div>
        </div>

        {/* Evaluation Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
           {[
             { label: "Total Assigned", val: reviews.length, icon: <ClipboardCheck size={18} />, accent: "border-stone-400" },
             { label: "Pending Assessment", val: pendingReviews.length, icon: <Activity size={18} />, accent: "border-primary" },
             { label: "Completed", val: completedReviews.length, icon: <CheckCircle2 size={18} />, accent: "border-green-500" },
           ].map((stat, i) => (
             <div key={i} className={`bg-white border border-stone-100 border-l-4 ${stat.accent} p-6 shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                   <div className="text-stone-400">{stat.icon}</div>
                   <span className="font-headline text-3xl font-bold text-stone-900">{stat.val}</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400">{stat.label}</p>
             </div>
           ))}
        </div>

        <Tabs defaultValue="pending" className="space-y-12">
          <TabsList className="bg-white border border-border/20 p-2 rounded-none h-auto flex flex-wrap shadow-sm">
            {[
              { val: "pending", label: "Pending Assessment", count: pendingReviews.length },
              { val: "completed", label: "Archival Assessments", count: completedReviews.length }
            ].map(tab => (
              <TabsTrigger key={tab.val} value={tab.val} className="rounded-none py-4 px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-medium text-xs uppercase tracking-wider transition-all gap-4 grow border-r border-stone-100 last:border-0">
                {tab.label} <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-none rounded-none text-[8px] font-bold px-2">{tab.count}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="pending" className="space-y-8 mt-0">
            {loadingReviews ? (
               <div className="py-24 text-center text-foreground/30 font-headline font-black uppercase text-[10px] tracking-widest">Synchronizing Assignments...</div>
            ) : pendingReviews.length === 0 ? (
              <div className={cardClasses + " py-24 text-center opacity-40 italic font-body"}>Inventory clear. All evaluations synchronized.</div>
            ) : (
              pendingReviews.map((review) => {
                const status = getReviewStatus(review);
                return (
                  <div key={review.id} className={cardClasses + " flex flex-col md:flex-row gap-10 hover:border-primary/20 transition-all shadow-md hover:shadow-2xl"}>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                         <Badge variant="outline" className={`rounded-none font-headline font-bold uppercase text-[9px] tracking-widest px-3 py-1 flex items-center gap-2 ${status.color}`}>
                            {getReviewIcon(status.status)} {status.label}
                         </Badge>
                         <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/20">Ref: {review.id.slice(0, 8)}</span>
                      </div>
                      
                      <h3 className="text-2xl font-headline font-black uppercase tracking-tight mb-4 group-hover:text-primary transition-colors leading-tight">{review.submission.article.title}</h3>
                      <p className="font-body text-foreground/40 text-sm italic mb-8 border-l-2 border-primary/20 pl-6 line-clamp-2">Assigned for evaluation • Submitted on {new Date(review.submission.submitted_at).toLocaleDateString()}</p>
                      
                      <div className="flex flex-wrap gap-4 items-center border-t border-border/20 pt-8">
                         <PaperDownload manuscriptFileUrl={review.submission.article.manuscript_file_url} title={review.submission.article.title} />
                         <Button onClick={() => navigate(`/review/${review.id}`)} className="bg-foreground text-white rounded-none font-headline font-black uppercase text-[10px] px-8 h-12 hover:bg-primary transition-all group">
                            Initiate Assessment <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                         </Button>
                         <Button variant="outline" onClick={() => navigate(`/reviewerSubmission/${review.submission_id}/details`)} className="rounded-none font-headline font-black uppercase text-[10px] px-8 h-12 border-border/40 hover:border-primary transition-all">Audit Dossier</Button>
                      </div>
                    </div>

                    <div className="w-full md:w-64 shrink-0 flex flex-col justify-center border-l border-border/40 md:pl-10 space-y-6">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <p className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/30">Academic Domain</p>
                             <Badge variant="outline" className="rounded-none font-headline font-bold text-[8px] border-border/60">{review.submission.article.subject_area || "General"}</Badge>
                          </div>
                          <PaymentStatusBadge vettingFee={review.submission.article.vetting_fee} processingFee={review.submission.article.processing_fee} />
                       </div>
                       <Button variant="ghost" className="w-full justify-between font-headline font-black uppercase text-[9px] tracking-widest text-foreground/40 hover:text-primary p-0">Detailed Protocol <ChevronRight size={14} /></Button>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-8 mt-0">
            {completedReviews.length === 0 ? (
              <div className={cardClasses + " py-24 text-center opacity-40 italic font-body"}>Archival assessments clear.</div>
            ) : (
              completedReviews.map((review) => {
                const status = getReviewStatus(review);
                return (
                  <div key={review.id} className={cardClasses + " border-t-8 border-secondary opacity-80"}>
                    <div className="flex flex-col md:flex-row gap-10">
                       <div className="flex-1">
                          <div className="flex items-center gap-4 mb-6">
                             <Badge variant="outline" className={`rounded-none font-headline font-bold uppercase text-[9px] tracking-widest px-3 py-1 flex items-center gap-2 ${status.color}`}>
                                {getReviewIcon(status.status)} {status.label}
                             </Badge>
                             <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/20">Ref: {review.id.slice(0, 8)}</span>
                          </div>
                          
                          <h3 className="text-2xl font-headline font-black uppercase tracking-tight mb-4 leading-tight">{review.submission.article.title}</h3>
                          <p className="font-body text-foreground/40 text-sm italic mb-8">
                             Finalized: {review.submitted_at ? new Date(review.submitted_at).toLocaleDateString() : 'N/A'} 
                             {review.recommendation && <span className="ml-4 text-foreground font-bold not-italic font-headline">Verdict: {review.recommendation}</span>}
                          </p>
                          
                          <Button variant="outline" onClick={() => navigate(`/review/${review.id}`)} className="rounded-none font-headline font-black uppercase text-[10px] px-8 h-12 border-border/40 hover:border-primary transition-all">Audit Verdict</Button>
                       </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </ContentSection>
    </div>
  );
};