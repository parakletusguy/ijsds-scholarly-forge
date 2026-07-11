import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getSubmission } from '@/lib/submissionService';
import { getReviews } from '@/lib/reviewService';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, FileText, Info, User, Calendar, MessageSquare } from 'lucide-react';
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

const label = 'text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400';

const reviewState = (review: Review) => {
  if (review.submitted_at) return { label: 'Done', style: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={12} /> };
  if (review.invitation_status === 'pending') return { label: 'Awaiting reply', style: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={12} /> };
  if (review.invitation_status === 'declined') return { label: 'Declined', style: 'bg-red-50 text-red-700 border-red-200', icon: <AlertCircle size={12} /> };
  return { label: 'Invited', style: 'bg-blue-50 text-blue-700 border-blue-200', icon: <FileText size={12} /> };
};

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
      toast({ title: 'Access denied', description: 'You need editor access to view this page.', variant: 'destructive' });
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
      toast({ title: "Couldn't load reviews", description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally { setLoadingData(false); }
  };

  if (loading || !isEditor || loadingData) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!submission) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-6 text-center">
      <div className="bg-white border border-stone-200 p-10 max-w-md">
        <Info className="h-8 w-8 text-primary mx-auto mb-5" />
        <h2 className="font-headline text-2xl text-stone-900 mb-2">Submission not found</h2>
        <p className="text-sm text-stone-500 mb-8">We couldn't find this submission. It may have been removed.</p>
        <Button onClick={() => navigate('/editorial')} className="w-full bg-primary hover:bg-[#7a2d11] text-white rounded-none h-11 text-xs font-bold uppercase tracking-widest">
          Back to dashboard
        </Button>
      </div>
    </div>
  );

  const completed = reviews.filter(r => r.submitted_at).length;

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <PageHeader
        title="Reviews"
        subtitle="for this submission"
        accent="Editor"
        description="See who is reviewing this paper and what they recommended."
      />

      <ContentSection dark>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main: reviews list */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white border border-stone-200 py-20 text-center">
                <p className="text-sm text-stone-400">No reviewers assigned yet.</p>
              </div>
            ) : (
              reviews.map((review) => {
                const st = reviewState(review);
                return (
                  <div key={review.id} className="bg-white border border-stone-200 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-stone-100 flex items-center justify-center shrink-0">
                          <User size={16} className="text-stone-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-800 truncate">{review.reviewer?.full_name || 'Reviewer'}</p>
                          {review.reviewer?.email && (
                            <p className="text-xs text-stone-400 truncate">{review.reviewer.email}</p>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] shrink-0 ${st.style}`}>
                        {st.icon} {st.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-stone-100">
                      <div>
                        <p className={label}>Submitted</p>
                        <p className="text-sm text-stone-700 mt-1 flex items-center gap-1.5">
                          <Calendar size={13} className="text-stone-400" />
                          {review.submitted_at ? new Date(review.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className={label}>Deadline</p>
                        <p className="text-sm text-stone-700 mt-1 flex items-center gap-1.5">
                          <Clock size={13} className="text-stone-400" />
                          {review.deadline_date ? new Date(review.deadline_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}
                        </p>
                      </div>
                    </div>

                    {review.submitted_at && review.recommendation && (
                      <div className="mt-4">
                        <p className={label}>Recommendation</p>
                        <span className="inline-block mt-1.5 bg-stone-900 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                          {review.recommendation.replace('_', ' ')}
                        </span>
                      </div>
                    )}

                    {review.submitted_at && review.comments_to_editor && (
                      <div className="mt-4 pt-4 border-t border-stone-100">
                        <p className={`${label} flex items-center gap-1.5`}><MessageSquare size={12} /> Confidential note to editor</p>
                        <p className="text-sm text-stone-600 italic leading-relaxed mt-2">{review.comments_to_editor}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            <div className="pt-2">
              <Button onClick={() => navigate('/editorial')} variant="outline"
                className="rounded-none h-10 text-[10px] font-bold uppercase tracking-widest border-stone-200 hover:border-primary gap-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
              </Button>
            </div>
          </div>

          {/* Sidebar: submission summary */}
          <aside className="space-y-6">
            <div className="bg-white border border-stone-200 p-6">
              <p className={`${label} pb-4 mb-4 border-b border-stone-100`}>Manuscript</p>
              <h3 className="font-headline text-lg text-stone-900 leading-snug">{submission.article.title}</h3>
              {submission.article.abstract && (
                <p className="text-sm text-stone-500 leading-relaxed mt-4 line-clamp-6">{submission.article.abstract}</p>
              )}
            </div>

            <div className="bg-white border border-stone-200 p-6 flex items-center justify-between">
              <span className="text-sm text-stone-500">Reviews complete</span>
              <span className="font-headline text-2xl text-stone-900 tabular-nums">{completed}<span className="text-stone-300">/{reviews.length}</span></span>
            </div>
          </aside>
        </div>
      </ContentSection>
    </div>
  );
};
