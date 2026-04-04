import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getReview, updateReview } from '@/lib/reviewService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, ShieldCheck, BookOpen, GraduationCap, Info, CheckCircle2, AlertCircle, Send, Activity, User } from 'lucide-react';
import { ReviewerFileManager } from '@/components/reviewer/ReviewerFileManager';
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

interface ReviewData {
  id: string;
  submission_id: string;
  submitted_at: string | null;
  recommendation: string | null;
  comments_to_author: string | null;
  comments_to_editor: string | null;
  submission: {
    article: {
      id: string;
      title: string;
      abstract: string;
      subject_area: string;
      authors: any;
      manuscript_file_url: string | null;
      vetting_fee: boolean;
      processing_fee: boolean;
    };
  };
}

export const ReviewForm = () => {
  const { reviewId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [review, setReview] = useState<ReviewData | null>(null);
  const [recommendation, setRecommendation] = useState('');
  const [commentsToAuthor, setCommentsToAuthor] = useState('');
  const [commentsToEditor, setCommentsToEditor] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (user && reviewId) fetchReview();
  }, [user, loading, reviewId, navigate]);

  const fetchReview = async () => {
    try {
      const data = await getReview(reviewId!);
      setReview(data as any);
      setRecommendation(data.recommendation || '');
      setCommentsToAuthor(data.comments_to_author || '');
      setCommentsToEditor(data.comments_to_editor || '');
    } catch {
      toast({ title: 'Error', description: 'Failed to load review.', variant: 'destructive' });
      navigate('/reviewer-dashboard');
    } finally { setLoadingData(false); }
  };

  const saveReview = async (isSubmission = false) => {
    if (isSubmission) setSubmitting(true); else setSaving(true);
    try {
      await updateReview(reviewId!, {
        recommendation,
        comments_to_author: commentsToAuthor,
        comments_to_editor: commentsToEditor,
      });
      toast({
        title: isSubmission ? 'Review Submitted' : 'Draft Saved',
        description: isSubmission
          ? 'Your peer evaluation has been submitted successfully.'
          : 'Your progress has been saved.',
      });
      if (isSubmission) navigate('/reviewer-dashboard');
    } catch {
      toast({ title: 'Error', description: 'Failed to save review.', variant: 'destructive' });
    } finally { setSaving(false); setSubmitting(false); }
  };

  const handleSubmit = () => {
    if (!recommendation) {
      toast({ title: 'Validation Error', description: 'Please select a recommendation.', variant: 'destructive' });
      return;
    }
    if (!commentsToAuthor.trim()) {
      toast({ title: 'Validation Error', description: 'Comments to author are required.', variant: 'destructive' });
      return;
    }
    saveReview(true);
  };

  const cardClasses = "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group";
  const labelClasses = "font-headline font-black text-[10px] uppercase tracking-widest text-foreground/40 mb-4 block";
  const inputClasses = "bg-muted/10 border-border/60 rounded-none focus:border-primary transition-all font-body h-auto py-4";

  if (loading || loadingData) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!review) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/5 p-4 text-center">
       <div className="p-8 bg-white border border-border/40 shadow-xl max-w-md">
          <Info className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-headline font-black uppercase tracking-tight mb-4">Review Not Found</h2>
          <p className="font-body text-foreground/40 mb-8 italic">This review assignment could not be loaded.</p>
          <Button onClick={() => navigate(-1)} className="w-full bg-foreground text-white rounded-none py-6 font-headline font-black uppercase text-[10px] tracking-widest">Return to Dashboard</Button>
       </div>
    </div>
  );

  const isSubmitted = !!review.submitted_at;
  const art = review.submission.article;

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <PageHeader
        title={isSubmitted ? 'Review' : 'Peer'}
        subtitle={isSubmitted ? 'Archive' : 'Evaluation'}
        accent="Intellectual Audit"
        description="Provide rigorous scholarly evaluation for the manuscript. Your assessment facilitates the editorial selection of high-impact research."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate('/reviewer-dashboard')} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
           </Button>
           <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
              <ShieldCheck size={16} className="text-secondary" />
              <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Authorized Reviewer</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Article sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <div className={cardClasses + " border-t-8 border-foreground"}>
               <div className="relative z-10">
                  <span className={labelClasses}>Manuscript</span>
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight mb-6 leading-tight group-hover:text-primary transition-colors">{art.title}</h3>

                  {art.subject_area && (
                    <div className="inline-flex items-center gap-3 bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2 font-headline font-black uppercase text-[10px] tracking-widest mb-10">
                       <GraduationCap size={14} /> {art.subject_area}
                    </div>
                  )}

                  <div className="pt-8 border-t border-border/20 space-y-6">
                    <div>
                       <span className={labelClasses}>Authors</span>
                       <div className="space-y-4">
                          {art.authors && Array.isArray(art.authors) ? art.authors.map((a: any, i: number) => (
                             <div key={i} className="flex items-start gap-3">
                                <div className="p-1.5 bg-muted text-foreground/30"><User size={12} /></div>
                                <p className="font-body text-xs text-foreground/60 leading-tight">
                                  {a.name}
                                  <span className="block text-[10px] opacity-40 italic">{a.affiliation}</span>
                                </p>
                             </div>
                          )) : <p className="font-body text-[10px] opacity-40 italic">Anonymized for blind review.</p>}
                       </div>
                    </div>

                    <div>
                       <span className={labelClasses}>Payment Status</span>
                       <PaymentStatusBadge vettingFee={art.vetting_fee} processingFee={art.processing_fee} showLabels={false} />
                    </div>
                  </div>
               </div>
            </div>

            <div className="border-t-4 border-foreground pt-4">
               <ReviewerFileManager articleId={art.id} submissionId={review.submission_id} />
            </div>
          </div>

          {/* Assessment form */}
          <div className="lg:col-span-8 flex flex-col">
            <div className={cardClasses + " flex-1"}>
               <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border/20">
                  <div className="p-3 bg-primary text-white"><BookOpen className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-headline font-black uppercase tracking-tighter">Evaluation Form</h2>
               </div>

               <div className="space-y-12">
                  {/* Recommendation */}
                  <div className="bg-muted/5 p-8 border border-border/10">
                    <Label className="text-xs font-headline font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-foreground/40">
                      <CheckCircle2 size={12} className="text-primary" /> Recommendation *
                    </Label>
                    <RadioGroup
                      value={recommendation}
                      onValueChange={setRecommendation}
                      disabled={isSubmitted}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {[
                        { val: 'accept',          label: 'Accept',          icon: <CheckCircle2 size={14} /> },
                        { val: 'minor_revisions', label: 'Minor Revisions', icon: <Activity size={14} /> },
                        { val: 'major_revisions', label: 'Major Revisions', icon: <AlertCircle size={14} /> },
                        { val: 'reject',          label: 'Reject',          icon: <AlertCircle size={14} /> },
                      ].map((opt) => (
                        <div key={opt.val} className={`flex items-center space-x-4 p-6 border transition-all cursor-pointer ${recommendation === opt.val ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-border/20'}`}>
                          <RadioGroupItem value={opt.val} id={opt.val} className="border-foreground/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                          <Label htmlFor={opt.val} className="font-headline font-black uppercase text-[10px] tracking-widest flex items-center gap-2 cursor-pointer grow">
                            {opt.icon} {opt.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Comments to author */}
                  <div>
                    <Label htmlFor="comments-author" className="text-xs font-headline font-black uppercase tracking-widest mb-4 block text-foreground/40">
                      Comments to Author *
                    </Label>
                    <p className="font-body text-[11px] text-foreground/30 italic mb-4">This feedback will be shared with the author.</p>
                    <Textarea
                      id="comments-author"
                      placeholder="Provide detailed feedback for the author…"
                      value={commentsToAuthor}
                      onChange={(e) => setCommentsToAuthor(e.target.value)}
                      disabled={isSubmitted}
                      rows={12}
                      className={inputClasses}
                    />
                  </div>

                  {/* Confidential comments to editor */}
                  <div>
                    <Label htmlFor="comments-editor" className="text-xs font-headline font-black uppercase tracking-widest mb-4 block text-foreground/40">
                      Confidential Comments to Editor
                    </Label>
                    <p className="font-body text-[11px] text-foreground/30 italic mb-4">Strictly confidential — visible to editors only.</p>
                    <Textarea
                      id="comments-editor"
                      placeholder="Optional notes for the editorial team…"
                      value={commentsToEditor}
                      onChange={(e) => setCommentsToEditor(e.target.value)}
                      disabled={isSubmitted}
                      rows={6}
                      className={inputClasses}
                    />
                  </div>

                  {!isSubmitted ? (
                    <div className="flex flex-col md:flex-row gap-6 pt-8 border-t border-border/20">
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting || saving}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white py-10 rounded-none font-headline font-black uppercase text-xs tracking-[0.3em] shadow-xl group"
                      >
                        {submitting
                          ? 'Submitting…'
                          : <span className="flex items-center gap-4">Submit Review <Send size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /></span>
                        }
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => saveReview(false)}
                        disabled={submitting || saving}
                        className="py-10 px-12 rounded-none font-headline font-black uppercase text-[10px] tracking-widest border-border/40 hover:border-primary transition-all gap-3"
                      >
                        {saving ? 'Saving…' : <><Save size={14} /> Save Draft</>}
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-10 border-t border-border/20 bg-secondary/5 p-8 flex items-center justify-between">
                       <div>
                          <p className="font-headline font-black text-[10px] uppercase tracking-widest text-foreground/30 mb-2">Review Submitted</p>
                          <p className="font-body text-sm italic">
                            Submitted on {new Date(review.submitted_at!).toLocaleDateString()}
                            {recommendation && <span className="ml-4 font-headline font-bold not-italic uppercase text-[10px] tracking-wider">· {recommendation.replace('_', ' ')}</span>}
                          </p>
                       </div>
                       <div className="p-4 bg-white border border-border/10 text-primary shadow-sm"><CheckCircle2 size={24} /></div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </ContentSection>
    </div>
  );
};
