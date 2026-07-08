import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getSubmission } from '@/lib/submissionService';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Download, Calendar, User, FileText, Info, Mail, MessageSquare, History } from 'lucide-react';
import { SubmissionFileManager } from '@/components/submission/SubmissionFileManager';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import { handleFileDownload } from '@/lib/downloadUtils';

interface SubmissionDetails {
  id: string;
  status: string;
  submitted_at: string;
  submitter_id: string;
  article_id: string;
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
  submitter: {
    full_name: string;
    email: string;
  };
}

const statusStyle = (status: string): string =>
  ({
    submitted: 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    under_review: 'bg-blue-50 text-blue-700 border-blue-200',
    revision_requested: 'bg-orange-50 text-orange-700 border-orange-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  }[status] ?? 'bg-stone-100 text-stone-600 border-stone-200');

const label = 'text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400';

export const ReviewerDetail = () => {
  const { submissionId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (user && submissionId) fetchSubmissionDetails();
  }, [user, loading, submissionId, navigate]);

  const fetchSubmissionDetails = async () => {
    try {
      const data = await getSubmission(submissionId!);
      setSubmission(data as unknown as SubmissionDetails);
    } catch (error: any) {
      toast({ title: "Couldn't load submission", description: 'Something went wrong. Please try again.', variant: 'destructive' });
      navigate('/dashboard');
    } finally { setLoadingData(false); }
  };

  if (loading || loadingData) return (
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
        <Button onClick={() => navigate(-1)} className="w-full bg-primary hover:bg-[#7a2d11] text-white rounded-none h-11 text-xs font-bold uppercase tracking-widest">
          Back to dashboard
        </Button>
      </div>
    </div>
  );

  const art = submission.article;
  const authors = Array.isArray(art.authors) ? art.authors : [];

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <PageHeader
        title="Submission"
        subtitle="Details"
        accent="Peer Review"
        description="Everything about this submission — the paper, its authors, and their affiliations."
      />

      <ContentSection dark>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            <article className="bg-white border border-stone-200">
              <div className="p-6 md:p-10">
                <span className={`inline-block border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${statusStyle(submission.status)}`}>
                  {submission.status.replace('_', ' ')}
                </span>

                <h1 className="font-headline text-3xl md:text-4xl text-stone-900 leading-[1.15] tracking-tight mt-5">
                  {art.title}
                </h1>

                {art.subject_area && (
                  <p className="mt-4 text-xs font-medium uppercase tracking-widest text-primary">
                    {art.subject_area}
                  </p>
                )}

                {art.abstract && (
                  <div className="mt-8 pt-8 border-t border-stone-100">
                    <p className={label}>Abstract</p>
                    <p className="mt-3 font-headline text-lg text-stone-700 leading-relaxed max-w-[68ch]">
                      {art.abstract}
                    </p>
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-stone-100">
                  <p className={label}>Authors</p>
                  {authors.length > 0 ? (
                    <ul className="mt-4 divide-y divide-stone-100">
                      {authors.map((a: any, i: number) => (
                        <li key={i} className="flex items-baseline gap-4 py-3 first:pt-0 last:pb-0">
                          <span className="font-headline text-xs text-stone-300 tabular-nums w-5 shrink-0">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-stone-800">{a.name || 'Unnamed author'}</p>
                            {a.affiliation && (
                              <p className="text-xs text-stone-500 mt-0.5">{a.affiliation}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-stone-400 italic">No authors listed.</p>
                  )}
                </div>
              </div>

              {art.manuscript_file_url && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 md:px-10 py-6 bg-stone-50 border-t border-stone-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-white border border-stone-200 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className={label}>Manuscript</p>
                      <p className="text-sm font-semibold text-stone-800 truncate">Submitted document</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleFileDownload(art.manuscript_file_url!, art.title)}
                    className="bg-stone-900 hover:bg-primary text-white rounded-none h-10 px-6 text-[10px] font-bold uppercase tracking-widest gap-2 shrink-0"
                  >
                    Download <Download size={13} />
                  </Button>
                </div>
              )}
            </article>

            <SubmissionFileManager
              submissionId={submissionId!}
              articleId={art.id}
              isAuthor={user?.id === submission.submitter_id}
              vettingFee={art.vetting_fee}
              processingFee={art.processing_fee}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white border border-stone-200 p-6">
              <p className={`${label} pb-4 mb-4 border-b border-stone-100`}>Submission info</p>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Calendar size={15} className="text-stone-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      {new Date(submission.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Submitted on</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User size={15} className="text-stone-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{submission.submitter.full_name}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1 truncate">
                      <Mail size={11} className="shrink-0" /> {submission.submitter.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-6">
              <p className={`${label} pb-4 mb-4 border-b border-stone-100`}>Status</p>
              <span className={`block text-center border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] ${statusStyle(submission.status)}`}>
                {submission.status.replace('_', ' ')}
              </span>
              <div className="mt-5 space-y-1">
                <button className="w-full flex items-center gap-2.5 py-2.5 text-xs font-medium text-stone-500 hover:text-primary transition-colors">
                  <MessageSquare size={14} /> View messages
                </button>
                <button className="w-full flex items-center gap-2.5 py-2.5 text-xs font-medium text-stone-500 hover:text-primary transition-colors">
                  <History size={14} /> Review history
                </button>
              </div>
            </div>
          </aside>
        </div>
      </ContentSection>
    </div>
  );
};
