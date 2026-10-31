import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getReview, updateReview, uploadReviewFile, removeReviewFile } from '@/lib/reviewService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, ShieldCheck, BookOpen, GraduationCap, Info, CheckCircle2, AlertCircle, Send, Activity, User, Paperclip, X, Loader2 } from 'lucide-react';
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
  review_file_url?: string | null;
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
  const [reviewFileUrl, setReviewFileUrl] = useState<string | null>(null);
  const [fileBusy, setFileBusy] = useState(false);
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
      setReviewFileUrl(data.review_file_url || null);
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
        submit: isSubmission,
      });
      toast({
        title: isSubmission ? 'Review Submitted' : 'Draft Saved',
        description: isSubmission
          ? 'Your review has been submitted.'
          : 'Your progress has been saved.',
      });
      if (isSubmission) navigate('/reviewer-dashboard');
    } catch {
      toast({ title: 'Error', description: 'Failed to save review.', variant: 'destructive' });
    } finally { setSaving(false); setSubmitting(false); }
  };

  const attachFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload a file under 10 MB.', variant: 'destructive' });
      return;
    }
    setFileBusy(true);
    try {
      const res = await uploadReviewFile(reviewId!, file);
      setReviewFileUrl(res.review_file_url);
      toast({ title: 'Document attached', description: file.name });
    } catch (err) {
      toast({ title: "Couldn't upload the document", description: (err as Error).message, variant: 'destructive' });
    } finally { setFileBusy(false); }
  };

  const detachFile = async () => {
    setFileBusy(true);
    try {
      await removeReviewFile(reviewId!);
      setReviewFileUrl(null);
    } catch (err) {
      toast({ title: "Couldn't remove the document", description: (err as Error).message, variant: 'destructive' });
    } finally { setFileBusy(false); }
  };

  const handleSubmit = () => {
    if (!recommendation) {
      toast({ title: 'Recommendation required', description: 'Please choose a recommendation before submitting.', variant: 'destructive' });
      return;
    }
    if (!commentsToAuthor.trim()) {
      toast({ title: 'Feedback required', description: 'Please add your comments to the author before submitting.', variant: 'destructive' });
      return;
    }
    saveReview(true);
  };

  const label = "text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400";
  const inputClasses = "bg-stone-50 border border-stone-200 rounded-none focus:border-primary focus-visible:ring-0 transition-colors font-body h-auto py-3";

  if (loading || loadingData) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!review) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-6 text-center">
      <div className="bg-white border border-stone-200 p-10 max-w-md">
        <Info className="h-8 w-8 text-primary mx-auto mb-5" />
        <h2 className="font-headline text-2xl text-stone-900 mb-2">Review not found</h2>
        <p className="text-sm text-stone-500 mb-8">We couldn't load this review. It may have been removed.</p>
        <Button onClick={() => navigate(-1)} className="w-full bg-primary hover:bg-[#7a2d11] text-white rounded-none h-11 text-xs font-bold uppercase tracking-widest">Back to dashboard</Button>
      </div>
    </div>
  );

  const isSubmitted = !!review.submitted_at;
  const art = review.submission.article;
  const options = [
    { val: 'accept',          label: 'Accept',          icon: <CheckCircle2 size={14} /> },
    { val: 'minor_revisions', label: 'Minor revisions', icon: <Activity size={14} /> },
    { val: 'major_revisions', label: 'Major revisions', icon: <AlertCircle size={14} /> },
    { val: 'reject',          label: 'Reject',          icon: <AlertCircle size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <PageHeader
        title={isSubmitted ? 'Your' : 'Write Your'}
        subtitle="Review"
        accent="Peer Review"
        description="Read the manuscript, then share your recommendation and feedback with the editors."
      />

      <ContentSection dark>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Review form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-stone-200 p-6 md:p-8">
              <h2 className="font-headline text-xl text-stone-900 mb-6 pb-4 border-b border-stone-100">Your Review</h2>

              {/* Recommendation */}
              <div className="mb-8">
                <Label className={`${label} flex items-center gap-1.5 mb-4`}>Recommendation *</Label>
                <RadioGroup
                  value={recommendation}
                  onValueChange={setRecommendation}
                  disabled={isSubmitted}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {options.map((opt) => (
                    <label
                      key={opt.val}
                      htmlFor={opt.val}
                      className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${recommendation === opt.val ? 'bg-primary/5 border-primary' : 'bg-white border-stone-200 hover:border-stone-300'} ${isSubmitted ? 'cursor-default opacity-70' : ''}`}
                    >
                      <RadioGroupItem value={opt.val} id={opt.val} className="border-stone-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                      <span className="text-sm font-medium text-stone-800 flex items-center gap-2">{opt.icon} {opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Comments to author */}
              <div className="mb-8">
                <Label htmlFor="comments-author" className={`${label} block mb-1.5`}>Comments to author *</Label>
                <p className="text-xs text-stone-400 mb-3">Shared with the author.</p>
                <Textarea
                  id="comments-author"
                  placeholder="Provide detailed feedback for the author…"
                  value={commentsToAuthor}
                  onChange={(e) => setCommentsToAuthor(e.target.value)}
                  disabled={isSubmitted}
                  rows={10}
                  className={inputClasses}
                />
              </div>

              {/* Confidential comments to editor */}
              <div>
                <Label htmlFor="comments-editor" className={`${label} block mb-1.5`}>Confidential note to editor</Label>
                <p className="text-xs text-stone-400 mb-3">Visible to editors only, not the author.</p>
                <Textarea
                  id="comments-editor"
                  placeholder="Optional notes for the editors…"
                  value={commentsToEditor}
                  onChange={(e) => setCommentsToEditor(e.target.value)}
                  disabled={isSubmitted}
                  rows={5}
                  className={inputClasses}
                />
              </div>

              {/* Reviewer's document */}
              <div className="mt-8">
                <p className={`${label} mb-1.5`}>Review document</p>
                <p className="text-xs text-stone-400 mb-3">
                  Optional: an annotated manuscript or a full report (PDF or Word, up to 10 MB). Seen by editors only. Please remove your name from the file.
                </p>
                {reviewFileUrl ? (
                  <div className="flex items-center gap-3">
                    <a href={reviewFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-2">
                      <Paperclip size={14} /> View attached document
                    </a>
                    {!isSubmitted && (
                      <button type="button" onClick={detachFile} disabled={fileBusy} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-red-700 disabled:opacity-50">
                        <X size={12} /> Remove
                      </button>
                    )}
                  </div>
                ) : isSubmitted ? (
                  <p className="text-sm text-stone-500">No document attached.</p>
                ) : (
                  <label className={`inline-flex items-center gap-2 border border-stone-200 px-4 h-11 text-[10px] font-bold uppercase tracking-widest text-stone-700 hover:border-primary cursor-pointer ${fileBusy ? 'opacity-50 pointer-events-none' : ''}`}>
                    {fileBusy ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
                    {fileBusy ? 'Uploading…' : 'Attach document'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      disabled={fileBusy}
                      onChange={(e) => { attachFile(e.target.files?.[0]); e.target.value = ''; }}
                    />
                  </label>
                )}
              </div>

              {!isSubmitted ? (
                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-stone-100">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || saving}
                    className="flex-1 bg-primary hover:bg-[#7a2d11] text-white h-12 rounded-none text-xs font-bold uppercase tracking-widest gap-2"
                  >
                    {submitting ? 'Submitting…' : <>Submit Review <Send size={14} /></>}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => saveReview(false)}
                    disabled={submitting || saving}
                    className="h-12 px-8 rounded-none text-[10px] font-bold uppercase tracking-widest border-stone-200 hover:border-primary gap-2"
                  >
                    {saving ? 'Saving…' : <><Save size={14} /> Save draft</>}
                  </Button>
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between bg-emerald-50 -mx-6 md:-mx-8 -mb-6 md:-mb-8 px-6 md:px-8 py-5">
                  <div>
                    <p className={label}>Review submitted</p>
                    <p className="text-sm text-stone-700 mt-1">
                      {new Date(review.submitted_at!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {recommendation && <span className="ml-2 font-semibold">· {recommendation.replace('_', ' ')}</span>}
                    </p>
                  </div>
                  <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                </div>
              )}
            </div>
          </div>

          {/* Manuscript sidebar */}
          <aside className="space-y-6">
            <div className="bg-white border border-stone-200 p-6">
              <p className={`${label} pb-4 mb-4 border-b border-stone-100`}>Manuscript</p>
              <h3 className="font-headline text-lg text-stone-900 leading-snug">{art.title}</h3>
              {art.subject_area && (
                <p className="mt-3 text-xs font-medium uppercase tracking-widest text-primary">{art.subject_area}</p>
              )}

              <div className="mt-5 pt-5 border-t border-stone-100">
                <p className={`${label} mb-3`}>Authors</p>
                {art.authors && Array.isArray(art.authors) && art.authors.length > 0 ? (
                  <ul className="space-y-2.5">
                    {art.authors.map((a: any, i: number) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <User size={13} className="text-stone-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-stone-700 leading-tight">{a.name}</p>
                          {a.affiliation && <p className="text-xs text-stone-400">{a.affiliation}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-stone-400 italic">Hidden for blind review.</p>
                )}
              </div>

              <div className="mt-5 pt-5 border-t border-stone-100">
                <p className={`${label} mb-3`}>Payment status</p>
                <PaymentStatusBadge vettingFee={art.vetting_fee} processingFee={art.processing_fee} showLabels={false} />
              </div>
            </div>

            <ReviewerFileManager articleId={art.id} submissionId={review.submission_id} />
          </aside>
        </div>
      </ContentSection>
    </div>
  );
};
