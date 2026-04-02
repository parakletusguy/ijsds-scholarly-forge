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
      toast({ title: 'Sync Error', description: 'Failed to access assignment registries.', variant: 'destructive' });
    } finally { setLoadingData(false); }
  };

  const handleReviewerSelection = (reviewerId: string, checked: boolean) => {
    if (checked) { setSelectedReviewers(prev => [...prev, reviewerId]); }
    else { setSelectedReviewers(prev => prev.filter(id => id !== reviewerId)); }
  };

  const assignReviewers = async () => {
    if (selectedReviewers.length === 0) {
      toast({ title: 'Validation Warning', description: 'At least one evaluator must be selected.' });
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

      toast({ title: 'Assignment Success', description: `${selectedReviewers.length} evaluators assigned to the workflow.` });
      navigate('/editorial');
    } catch (error: any) {
      toast({ title: 'Command Refused', description: 'Failed to finalize evaluator assignments.', variant: 'destructive' });
    } finally { setAssigning(false); }
  };

  const cardClasses = "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group";
  const labelClasses = "font-headline font-black text-[10px] uppercase tracking-widest text-foreground/40 mb-4 block";

  if (loading || loadingData) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!submission) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/5 p-4 text-center">
       <div className="p-8 bg-white border border-border/40 shadow-xl max-w-md">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-headline font-black uppercase tracking-tight mb-4">Submission Lost</h2>
          <p className="font-body text-foreground/40 mb-8 italic">The manuscript record you are attempting to assign is no longer synchronizing.</p>
          <Button onClick={() => navigate('/editorial')} className="w-full bg-foreground text-white rounded-none py-6 font-headline font-black uppercase text-[10px] tracking-widest">Return to Command Hub</Button>
       </div>
    </div>
  );

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <PageHeader 
        title="Evaluator" 
        subtitle="Selection" 
        accent="Resource Allocation"
        description="Strategically assign peer evaluators to the manuscript dossier. Ensure domain expertise and institutional diversity within the review panel."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate('/editorial')} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Return to Command
           </Button>
           
           <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
              <UserCheck size={16} className="text-secondary" />
              <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Authorized Assignment Authorization</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Submission Dossier Summary */}
          <div className="lg:col-span-4 space-y-12">
            <div className={cardClasses + " border-t-8 border-foreground"}>
               <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
               <div className="relative z-10">
                  <span className={labelClasses}>Active Manuscript</span>
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight mb-6 leading-tight group-hover:text-primary transition-colors">{submission.article.title}</h3>
                  
                  {submission.article.subject_area && (
                    <div className="inline-flex items-center gap-3 bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2 font-headline font-black uppercase text-[10px] tracking-widest mb-10">
                       <GraduationCap size={14} /> {submission.article.subject_area}
                    </div>
                  )}

                  <div className="pt-8 border-t border-border/20">
                    <span className={labelClasses}>Core Abstract</span>
                    <p className="font-body text-foreground/50 text-sm leading-relaxed italic line-clamp-6">{submission.article.abstract}</p>
                  </div>
               </div>
            </div>

            <div className={cardClasses + " bg-foreground text-white"}>
               <h4 className="font-headline font-black text-[10px] uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2"><Activity size={12} /> Resource Status</h4>
               <div className="flex items-center justify-between">
                  <span className="font-body text-sm italic text-white/60">Selected Evaluators</span>
                  <span className="font-headline font-black text-3xl text-secondary">{selectedReviewers.length}</span>
               </div>
            </div>
          </div>

          {/* Evaluator Selection Area */}
          <div className="lg:col-span-8 flex flex-col">
            <div className={cardClasses + " flex-1"}>
               <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/20">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-primary text-white"><Users className="h-5 w-5" /></div>
                     <h2 className="text-2xl font-headline font-black uppercase tracking-tighter">Evaluator Registry</h2>
                  </div>
                  <div className="relative hidden md:block">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                     <input type="text" placeholder="Search Registries..." className="bg-muted/30 border border-border/10 rounded-none h-12 pl-12 pr-4 font-headline uppercase text-[10px] tracking-widest w-64 focus:border-primary outline-none transition-all" />
                  </div>
               </div>

               {reviewers.length === 0 ? (
                  <div className="py-24 text-center opacity-40 italic font-body">No qualified evaluators synchronized with this domain.</div>
               ) : (
                  <div className="space-y-6">
                    {reviewers.map((reviewer) => (
                      <div key={reviewer.id} className={`flex items-start gap-6 p-8 border hover:border-primary/20 transition-all group ${selectedReviewers.includes(reviewer.id) ? 'bg-primary/5 border-primary/20' : 'bg-muted/10 border-border/10'}`}>
                         <Checkbox
                           checked={selectedReviewers.includes(reviewer.id)}
                           onCheckedChange={(checked) => handleReviewerSelection(reviewer.id, checked as boolean)}
                           className="h-6 w-6 rounded-none border-foreground/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                         />
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h4 className="font-headline font-black uppercase text-sm tracking-tight group-hover:text-primary transition-colors">{reviewer.full_name}</h4>
                              <div className="flex items-center gap-2 text-foreground/30 font-body text-[11px] italic">
                                 <Mail size={12} /> {reviewer.email}
                              </div>
                           </div>
                           
                           {reviewer.affiliation && (
                             <p className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40 mb-3 flex items-center gap-2"><GraduationCap size={10} /> {reviewer.affiliation}</p>
                           )}
                           
                           {reviewer.bio && (
                             <p className="font-body text-xs text-foreground/40 line-clamp-2 italic leading-relaxed border-l-2 border-border/20 pl-4">{reviewer.bio}</p>
                           )}
                         </div>
                         <Button variant="ghost" className="hidden md:flex font-headline font-black uppercase text-[9px] tracking-widest text-foreground/20 hover:text-primary gap-2 p-0">Detailed Dossier <ChevronRight size={12} /></Button>
                      </div>
                    ))}
                  </div>
               )}

               {reviewers.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-border/20 flex flex-col md:flex-row gap-6">
                     <Button 
                       onClick={assignReviewers} 
                       disabled={selectedReviewers.length === 0 || assigning}
                       className="flex-1 bg-primary hover:bg-secondary text-white py-8 rounded-none font-headline font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all"
                     >
                        {assigning ? 'Synchronizing Assignments...' : `Authorize ${selectedReviewers.length} Evaluator(s)`}
                     </Button>
                     <Button 
                       variant="outline" 
                       onClick={() => navigate('/editorial')}
                       className="py-8 px-12 rounded-none font-headline font-black uppercase text-[10px] tracking-widest border-border/40 hover:border-primary transition-all"
                     >
                        Abort Assignment
                     </Button>
                  </div>
               )}
            </div>
          </div>
        </div>
      </ContentSection>
    </div>
  );
};