import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getSubmission } from '@/lib/submissionService';
import { getProfiles } from '@/lib/profileService';
import { createReview } from '@/lib/reviewService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Users, Mail, BookOpen, ArrowLeft, ShieldCheck, GraduationCap, ChevronRight, UserCheck, Search, Activity } from 'lucide-react';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

interface Reviewer {
  id: string;
  full_name: string;
  email: string;
  affiliation?: string | null;
  bio?: string | null;
}

interface Submission {
  id: string;
  article: {
    title: string;
    abstract: string;
    subject_area: string;
  };
}

export const ReviewAssignment = () => {
  const { submissionId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (user && submissionId) fetchData();
  }, [user, loading, submissionId, navigate]);

  const fetchData = async () => {
    try {
      const [submissionData, reviewersData] = await Promise.all([
        getSubmission(submissionId!),
        getProfiles({ is_reviewer: true }),
      ]);
      setSubmission(submissionData as unknown as Submission);
      setReviewers(reviewersData);
    } catch (error: any) {
      toast({ title: "Couldn't load page", description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally { setLoadingData(false); }
  };

  const handleReviewerSelection = (reviewerId: string, checked: boolean) => {
    if (checked) { setSelectedReviewers(prev => [...prev, reviewerId]); }
    else { setSelectedReviewers(prev => prev.filter(id => id !== reviewerId)); }
  };

  const assignReviewers = async () => {
    if (selectedReviewers.length === 0) {
      toast({ title: 'Select a reviewer', description: 'Please select at least one reviewer.' });
      return;
    }

    setAssigning(true);
    try {
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 21);
      const deadlineDate = defaultDeadline.toISOString().split('T')[0];

      await Promise.all(
        selectedReviewers.map(reviewerId =>
          createReview({ submission_id: submissionId!, reviewer_id: reviewerId, deadline_date: deadlineDate })
        )
      );

      toast({ title: 'Reviewers assigned', description: `${selectedReviewers.length} reviewer(s) assigned.` });
      navigate('/editorial');
    } catch (error: any) {
      toast({ title: "Couldn't assign reviewers", description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally { setAssigning(false); }
  };

  const label = "text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400";

  if (loading || loadingData) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!submission) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-6 text-center">
      <div className="bg-white border border-stone-200 p-10 max-w-md">
        <BookOpen className="h-8 w-8 text-primary mx-auto mb-5" />
        <h2 className="font-headline text-2xl text-stone-900 mb-2">Submission not found</h2>
        <p className="text-sm text-stone-500 mb-8">We couldn't find this submission. It may have been removed.</p>
        <Button onClick={() => navigate('/editorial')} className="w-full bg-primary hover:bg-[#7a2d11] text-white rounded-none h-11 text-xs font-bold uppercase tracking-widest">Back to dashboard</Button>
      </div>
    </div>
  );

  const filtered = reviewers.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.full_name?.toLowerCase().includes(q) || r.affiliation?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <PageHeader
        title="Assign"
        subtitle="Reviewers"
        accent="Editor"
        description="Choose one or more reviewers for this submission."
      />

      <ContentSection dark>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Reviewer selection */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviewers by name or affiliation..."
                className="w-full bg-white border border-stone-200 rounded-none h-11 pl-10 pr-4 text-sm focus:border-primary outline-none transition-colors"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border border-stone-200 py-16 text-center">
                <p className="text-sm text-stone-400">{reviewers.length === 0 ? 'No reviewers available.' : 'No reviewers match your search.'}</p>
              </div>
            ) : (
              filtered.map((reviewer) => {
                const selected = selectedReviewers.includes(reviewer.id);
                return (
                  <label
                    key={reviewer.id}
                    htmlFor={`rev-${reviewer.id}`}
                    className={`flex items-start gap-4 p-5 bg-white border cursor-pointer transition-colors ${selected ? 'border-primary bg-primary/5' : 'border-stone-200 hover:border-stone-300'}`}
                  >
                    <Checkbox
                      id={`rev-${reviewer.id}`}
                      checked={selected}
                      onCheckedChange={(checked) => handleReviewerSelection(reviewer.id, checked as boolean)}
                      className="mt-0.5 rounded-none border-stone-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800">{reviewer.full_name}</p>
                      <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                        <Mail size={11} className="shrink-0" /> {reviewer.email}
                      </p>
                      {reviewer.affiliation && (
                        <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-1">
                          <GraduationCap size={12} className="shrink-0 text-stone-400" /> {reviewer.affiliation}
                        </p>
                      )}
                      {reviewer.bio && (
                        <p className="text-xs text-stone-500 leading-relaxed mt-2 line-clamp-2">{reviewer.bio}</p>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {/* Submission summary + action */}
          <aside className="space-y-6">
            <div className="bg-white border border-stone-200 p-6">
              <p className={`${label} pb-4 mb-4 border-b border-stone-100`}>Manuscript</p>
              <h3 className="font-headline text-lg text-stone-900 leading-snug">{submission.article.title}</h3>
              {submission.article.subject_area && (
                <p className="mt-3 text-xs font-medium uppercase tracking-widest text-primary">{submission.article.subject_area}</p>
              )}
              {submission.article.abstract && (
                <p className="text-sm text-stone-500 leading-relaxed mt-4 line-clamp-5">{submission.article.abstract}</p>
              )}
            </div>

            <div className="bg-white border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-stone-500">Reviewers selected</span>
                <span className="font-headline text-2xl text-stone-900 tabular-nums">{selectedReviewers.length}</span>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={assignReviewers}
                  disabled={selectedReviewers.length === 0 || assigning}
                  className="w-full bg-primary hover:bg-[#7a2d11] text-white h-11 rounded-none text-xs font-bold uppercase tracking-widest disabled:opacity-40"
                >
                  {assigning ? 'Assigning...' : `Assign ${selectedReviewers.length || ''} reviewer${selectedReviewers.length === 1 ? '' : 's'}`.trim()}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/editorial')}
                  className="w-full h-11 rounded-none text-[10px] font-bold uppercase tracking-widest border-stone-200 hover:border-primary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </ContentSection>
    </div>
  );
};