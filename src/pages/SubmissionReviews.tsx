import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getSubmission } from '@/lib/submissionService';
import { getReviews } from '@/lib/reviewService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, FileText, Clock, CheckCircle2, AlertCircle, ShieldCheck, BookOpen, GraduationCap, Info, User, Calendar, MessageSquare, ClipboardList, Activity } from 'lucide-react';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

interface Review {
  id: string;
  reviewer_id: string;
  invitation_status: string;
  submitted_at: string | null;
  recommendation: string | null;
  comments_to_author: string | null;
  comments_to_editor: string | null;
  deadline_date: string | null;
  reviewer?: {
    full_name: string;
    email: string;
  };
}

interface Submission {
  id: string;
  article: {
    title: string;
    abstract: string;
  };
}

export const SubmissionReviews = () => {
  const { submissionId } = useParams();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const isEditor = !!(profile?.is_editor || profile?.is_admin);

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!loading && user && !isEditor) {
      toast({ title: 'Access Denied', description: 'Institutional credentials required.', variant: 'destructive' });
      navigate('/dashboard'); return;
    }
    if (user && isEditor && submissionId) fetchData();
  }, [user, profile, loading, submissionId, navigate]);

  const fetchData = async () => {
    try {
      const [submissionData, reviewsData] = await Promise.all([
        getSubmission(submissionId!),
        getReviews({ submission_id: submissionId }),
      ]);
      setSubmission(submissionData as unknown as Submission);
      setReviews(reviewsData as unknown as Review[]);
    } catch (error: any) {
      toast({ title: 'Sync Error', description: 'Failed to access review registries.', variant: 'destructive' });
    } finally { setLoadingData(false); }
  };

  const getReviewStatus = (review: Review) => {
    if (review.submitted_at) return { status: 'completed', label: 'Finalized', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
    if (review.invitation_status === 'pending') return { status: 'pending', label: 'Awaiting', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    if (review.invitation_status === 'declined') return { status: 'declined', label: 'Declined', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
    return { status: 'invited', label: 'Invited', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'declined': return <AlertCircle size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const cardClasses = "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group";
  const labelClasses = "font-headline font-black text-[10px] uppercase tracking-widest text-foreground/40 mb-4 block";

  if (loading || !isEditor || loadingData) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!submission) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/5 p-4 text-center">
       <div className="p-8 bg-white border border-border/40 shadow-xl max-w-md">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-headline font-black uppercase tracking-tight mb-4">Registry Lost</h2>
          <p className="font-body text-foreground/40 mb-8 italic">The manuscript record you are attempting to audit is no longer synchronizing.</p>
          <Button onClick={() => navigate('/editorial')} className="w-full bg-foreground text-white rounded-none py-6 font-headline font-black uppercase text-[10px] tracking-widest">Return to Command Hub</Button>
       </div>
    </div>
  );

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <PageHeader 
        title="Review" 
        subtitle="Audit" 
        accent="Protocol Tracking"
        description="Monitor the evaluation heartbeat of the journal. Audit reviewer responsiveness, temporal deadlines, and expert recommendations for active manuscripts."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate(-1)} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Return to Command
           </Button>
           
           <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
              <ShieldCheck size={16} className="text-secondary" />
              <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Authorized Intelligence Access</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Submission summary sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <div className={cardClasses + " border-t-8 border-foreground"}>
               <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
               <div className="relative z-10">
                  <span className={labelClasses}>Active Manuscript</span>
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight mb-6 leading-tight group-hover:text-primary transition-colors">{submission.article.title}</h3>
                  <div className="pt-8 border-t border-border/20">
                    <span className={labelClasses}>Core Abstract</span>
                    <p className="font-body text-foreground/40 text-sm leading-relaxed italic line-clamp-6">{submission.article.abstract}</p>
                  </div>
               </div>
            </div>

            <div className={cardClasses + " bg-foreground text-white"}>
               <h4 className="font-headline font-black text-[10px] uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2"><Activity size={12} /> Audit Statistics</h4>
               <div className="flex items-center justify-between">
                  <span className="font-body text-sm italic text-white/60">Assigned Evaluators</span>
                  <span className="font-headline font-black text-3xl text-secondary">{reviews.length}</span>
               </div>
            </div>
          </div>

          {/* Reviews Audit Table */}
          <div className="lg:col-span-8 flex flex-col">
            <div className={cardClasses + " flex-1"}>
               <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border/20">
                  <div className="p-3 bg-primary text-white"><ClipboardList className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-headline font-black uppercase tracking-tighter">Evaluation Registry</h2>
               </div>

               {reviews.length === 0 ? (
                  <div className="py-24 text-center opacity-40 italic font-body">No evaluations currently synchronized with this manuscript dossier.</div>
               ) : (
                  <div className="space-y-8">
                    {reviews.map((review) => {
                      const status = getReviewStatus(review);
                      return (
                        <div key={review.id} className="border border-border/10 p-8 hover:border-primary/20 transition-all bg-muted/5 group">
                           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                              <div className="flex items-center gap-4">
                                 <div className="p-3 bg-white text-foreground/30 group-hover:text-primary transition-colors"><User size={16} /></div>
                                 <div>
                                    <h4 className="font-headline font-black uppercase text-sm tracking-tight">{review.reviewer?.full_name || "Anonymized Evaluator"}</h4>
                                    <p className="font-body text-[10px] text-foreground/40 italic">{review.reviewer?.email || "confidential@registry.ijsds.org"}</p>
                                 </div>
                              </div>
                              <Badge variant="outline" className={`rounded-none font-headline font-bold uppercase text-[9px] tracking-widest px-4 py-2 border-2 ${status.color} flex items-center gap-2`}>
                                 {getStatusIcon(status.status)} {status.label}
                              </Badge>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/10">
                              <div className="space-y-4">
                                 <div className="flex items-center gap-3 text-foreground/30 font-headline font-black uppercase text-[9px] tracking-widest">
                                    <Calendar size={12} /> Temporal Markers
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-xs font-body italic text-foreground/60">Finalized: <span className="font-bold text-foreground not-italic">{review.submitted_at ? new Date(review.submitted_at).toLocaleDateString() : 'Awaiting'}</span></p>
                                    <p className="text-xs font-body italic text-foreground/60">Deadline: <span className="font-bold text-foreground not-italic">{review.deadline_date ? new Date(review.deadline_date).toLocaleDateString() : 'N/A'}</span></p>
                                 </div>
                              </div>
                              
                              {review.submitted_at && (
                                <div className="space-y-4">
                                   <div className="flex items-center gap-3 text-foreground/30 font-headline font-black uppercase text-[9px] tracking-widest">
                                      <GraduationCap size={12} /> Expert Verdict
                                   </div>
                                   <Badge className="bg-foreground text-white rounded-none font-headline font-bold text-[10px] py-1 px-3 uppercase tracking-widest">{review.recommendation}</Badge>
                                </div>
                              )}
                           </div>

                           {review.submitted_at && review.comments_to_editor && (
                              <div className="mt-8 pt-8 border-t border-border/10 bg-secondary/5 p-6 relative">
                                 <div className="absolute top-0 right-0 p-4 opacity-10"><MessageSquare size={32} /></div>
                                 <span className="font-headline font-black text-[9px] uppercase tracking-widest text-secondary flex items-center gap-2 mb-4">Confidential Editorial Directive</span>
                                 <p className="font-body text-xs text-foreground/70 italic leading-relaxed">{review.comments_to_editor}</p>
                              </div>
                           )}
                        </div>
                      );
                    })}
                  </div>
               )}

               <div className="mt-12 pt-8 border-t border-border/20 flex justify-end">
                  <Button onClick={() => navigate('/editorial')} className="bg-foreground text-white rounded-none font-headline font-black uppercase text-[10px] px-12 py-6 h-auto tracking-widest shadow-xl hover:bg-primary transition-all">Synchronize Command Dashboard</Button>
               </div>
            </div>
          </div>
        </div>
      </ContentSection>
    </div>
  );
};