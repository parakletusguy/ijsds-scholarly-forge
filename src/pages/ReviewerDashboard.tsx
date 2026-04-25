import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getReviews } from '@/lib/reviewService';
import { getSubmission } from '@/lib/submissionService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
  FileText, Clock, CheckCircle2, ArrowLeft, ArrowRight,
  ShieldCheck, Activity, ClipboardCheck, Search, X,
  ChevronDown, ChevronUp, AlertTriangle,
} from 'lucide-react';
import { PaperDownload } from '@/components/papers/PaperDownload';
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

const DeadlineBadge = ({ deadline }: { deadline: string | null }) => {
  if (!deadline) return null;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return (
    <span className="text-[9px] font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 flex items-center gap-1">
      <AlertTriangle size={10} /> Overdue
    </span>
  );
  if (days <= 7) return (
    <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 px-2 py-0.5">
      {days}d left
    </span>
  );
  if (days <= 14) return (
    <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 border border-orange-100 px-2 py-0.5">
      {days}d left
    </span>
  );
  return (
    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 bg-stone-50 border border-stone-100 px-2 py-0.5">
      Due {new Date(deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
    </span>
  );
};

export const ReviewerDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewWithSubmission[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
    } catch {
      toast({ title: 'Sync Error', description: 'Failed to fetch review assignments.', variant: 'destructive' });
    } finally {
      setLoadingReviews(false); }
  };

  if (loading || !isReviewer) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pendingReviews = reviews.filter(r => !r.submitted_at);
  const completedReviews = reviews.filter(r => r.submitted_at);

  const filter = (list: ReviewWithSubmission[]) =>
    !searchQuery ? list : list.filter(r =>
      r.submission?.article?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const ReviewRow = ({ review, completed = false }: { review: ReviewWithSubmission; completed?: boolean }) => {
    const art = review.submission?.article || {} as any;
    const isExpanded = expandedId === review.id;
    const toggle = () => setExpandedId(isExpanded ? null : review.id);

    return (
      <div className={`bg-white border border-stone-100 border-l-4 ${completed ? 'border-l-green-400 opacity-75 hover:opacity-100' : 'border-l-primary'} transition-all`}>
        {/* Compact header */}
        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50/60" onClick={toggle}>
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 shrink-0">
              {review.id.slice(0, 8).toUpperCase()}
            </span>
            <h3 className="text-sm font-semibold text-stone-900 truncate leading-tight">
              {art.title || 'Untitled'}
            </h3>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {art.subject_area && (
              <span className="text-[9px] text-stone-400 bg-stone-50 border border-stone-100 px-2 py-0.5 max-w-[110px] truncate">
                {art.subject_area}
              </span>
            )}
            {completed ? (
              <span className="text-[9px] font-bold uppercase tracking-widest text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 flex items-center gap-1">
                <CheckCircle2 size={10} />
                {review.recommendation || 'Finalized'}
              </span>
            ) : (
              <DeadlineBadge deadline={review.deadline_date} />
            )}
          </div>
          {isExpanded ? <ChevronUp size={14} className="text-stone-400 shrink-0" /> : <ChevronDown size={14} className="text-stone-400 shrink-0" />}
        </div>

        {/* Expanded detail */}
        {isExpanded && (
          <div className="border-t border-stone-100 px-4 py-4 space-y-3 bg-stone-50/40">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Subject Area</p>
                <p className="font-medium text-stone-700">{art.subject_area || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Assigned</p>
                <p className="font-medium text-stone-700">
                  {new Date(review.submission?.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Deadline</p>
                <p className="font-medium text-stone-700">
                  {review.deadline_date
                    ? new Date(review.deadline_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Not set'}
                </p>
              </div>
            </div>

            {art.abstract && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Abstract</p>
                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 italic">{art.abstract}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
              <PaperDownload manuscriptFileUrl={art.manuscript_file_url} title={art.title} />
              {!completed ? (
                <>
                  <Button onClick={() => navigate(`/review/${review.id}`)}
                    className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary text-white hover:bg-stone-900 rounded-none gap-1.5">
                    Begin Evaluation <ArrowRight size={12} />
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/reviewerSubmission/${review.submission_id}/details`)}
                    className="h-8 text-[10px] rounded-none border-stone-200 hover:border-primary">
                    View Dossier
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => navigate(`/review/${review.id}`)}
                  className="h-8 text-[10px] rounded-none border-stone-200 hover:border-primary">
                  View Submission
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const FilterBar = ({ count, total }: { count: number; total: number }) => (
    <div className="flex gap-3 mb-5">
      <div className="relative flex-1">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input placeholder="Search by title..." value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-sm rounded-none border-stone-200 focus-visible:ring-primary" />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
            <X size={12} />
          </button>
        )}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 self-center shrink-0">
        {count} / {total}
      </span>
    </div>
  );

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader
        title="Evaluator"
        subtitle="Command"
        accent="Peer Review Hub"
        description="Manage your assigned manuscripts and provide expert scholarly evaluation."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <Button onClick={() => navigate(-1)} variant="outline"
            className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 h-10 border-primary/20 hover:border-primary">
            <ArrowLeft className="h-4 w-4" /> Return to Command
          </Button>
          <div className="flex items-center gap-3 bg-white/50 px-4 py-2 border border-border/20">
            <ShieldCheck size={14} className="text-secondary" />
            <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">
              Credentialed Evaluator
            </span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-px bg-stone-100 border border-stone-100 mb-8">
          {[
            { label: 'Total Assigned', val: reviews.length, icon: <ClipboardCheck size={14} />, accent: 'text-stone-600' },
            { label: 'Pending', val: pendingReviews.length, icon: <Activity size={14} />, accent: 'text-primary' },
            { label: 'Completed', val: completedReviews.length, icon: <CheckCircle2 size={14} />, accent: 'text-green-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">{stat.label}</p>
                <p className={`text-2xl font-headline font-bold ${stat.accent}`}>{stat.val}</p>
              </div>
              <span className={`${stat.accent} opacity-40`}>{stat.icon}</span>
            </div>
          ))}
        </div>

        <Tabs defaultValue="pending" className="space-y-6" onValueChange={() => setExpandedId(null)}>
          <TabsList className="bg-white border border-border/20 p-1.5 rounded-none h-auto flex shadow-sm">
            {[
              { val: 'pending', label: 'Pending Assessment', count: pendingReviews.length },
              { val: 'completed', label: 'Archival', count: completedReviews.length },
            ].map(tab => (
              <TabsTrigger key={tab.val} value={tab.val}
                className="rounded-none py-2.5 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-medium text-xs uppercase tracking-wider transition-all gap-2 grow">
                {tab.label}
                <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border-none rounded-none text-[8px] font-bold px-1.5 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  {tab.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="pending" className="mt-0 space-y-0">
            <FilterBar count={filter(pendingReviews).length} total={pendingReviews.length} />
            {loadingReviews ? (
              <div className="py-12 text-center text-stone-400 text-[10px] font-bold uppercase tracking-widest">Synchronizing assignments...</div>
            ) : filter(pendingReviews).length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-xs font-bold uppercase tracking-widest border border-dashed border-stone-200">
                {searchQuery ? 'No results match your search.' : 'No pending reviews. All clear.'}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filter(pendingReviews).map(r => <ReviewRow key={r.id} review={r} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0 space-y-0">
            <FilterBar count={filter(completedReviews).length} total={completedReviews.length} />
            {filter(completedReviews).length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-xs font-bold uppercase tracking-widest border border-dashed border-stone-200">
                {searchQuery ? 'No results match your search.' : 'No completed reviews yet.'}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filter(completedReviews).map(r => <ReviewRow key={r.id} review={r} completed />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ContentSection>
    </div>
  );
};
