import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getSubmission } from '@/lib/submissionService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, FileText, Calendar, User, Download, ShieldCheck, ClipboardList, Info, GraduationCap, ChevronRight, Activity } from 'lucide-react';
import { SubmissionFileManager } from '@/components/submission/SubmissionFileManager';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

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
      toast({ title: 'Sync Error', description: 'Failed to access manuscript dossier.', variant: 'destructive' });
      navigate('/dashboard');
    } finally { setLoadingData(false); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'under_review': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'revision_requested': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'accepted': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
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
          <Info className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-headline font-black uppercase tracking-tight mb-4">Dossier Unavailable</h2>
          <p className="font-body text-foreground/40 mb-8 italic">The manuscript record you are attempting to access is no longer synchronizing with the central registry.</p>
          <Button onClick={() => navigate(-1)} className="w-full bg-foreground text-white rounded-none py-6 font-headline font-black uppercase text-[10px] tracking-widest">Return to Dashboard</Button>
       </div>
    </div>
  );

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <PageHeader 
        title="Manuscript" 
        subtitle="Dossier" 
        accent="Evaluator Intel"
        description="Comprehensive analysis of the submitted scholarly fabric. Review internal metadata, author profiles, and institutional affiliations."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate(-1)} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Exit Dossier
           </Button>
           
           <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
              <ShieldCheck size={16} className="text-secondary" />
              <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Verified Intelligence Stream</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article Content */}
          <div className="lg:col-span-8 space-y-12">
            <div className={cardClasses}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="p-3 bg-primary text-white"><FileText className="h-5 w-5" /></div>
                     <h2 className="text-2xl font-headline font-black uppercase tracking-tighter">Academic Fabric</h2>
                  </div>

                  <div className="mb-10">
                    <Badge variant="outline" className={`rounded-none font-headline font-bold uppercase text-[9px] tracking-widest px-4 py-2 border-2 ${getStatusStyle(submission.status)} mb-6`}>
                       {submission.status.replace('_', ' ')}
                    </Badge>
                    <h1 className="text-4xl font-headline font-black uppercase tracking-tight mb-8 leading-tight">{submission.article.title}</h1>
                    
                    {submission.article.subject_area && (
                      <div className="inline-flex items-center gap-3 bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2 font-headline font-black uppercase text-[10px] tracking-widest mb-10">
                         <GraduationCap size={14} /> {submission.article.subject_area}
                      </div>
                    )}
                  </div>

                  <div className="mb-12">
                    <span className={labelClasses}>Scholarly Abstract</span>
                    <p className="font-body text-foreground/70 leading-relaxed text-lg border-l-4 border-primary/20 pl-8 italic">
                      {submission.article.abstract}
                    </p>
                  </div>

                  <div className="mb-12">
                    <span className={labelClasses}>Projected Contributors</span>
                    {submission.article.authors && Array.isArray(submission.article.authors) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {submission.article.authors.map((author: any, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-6 bg-muted/20 border border-border/10 hover:border-primary/20 transition-all group">
                            <div className="p-2 bg-white text-primary rounded-none shadow-sm group-hover:bg-primary group-hover:text-white transition-colors"><User className="h-4 w-4" /></div>
                            <div>
                               <p className="font-headline font-black uppercase text-xs tracking-tight">{author.name}</p>
                               {author.affiliation && <p className="font-body text-[10px] text-foreground/40 italic mt-1">{author.affiliation}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-body text-foreground/30 italic">Metadata synchronization incomplete for author array.</p>
                    )}
                  </div>

                  {submission.article.manuscript_file_url && (
                    <div className="pt-10 border-t border-border/20 flex items-center justify-between">
                       <div>
                          <p className="font-headline font-black text-[10px] uppercase tracking-widest text-foreground/30 mb-2">Prime Document</p>
                          <p className="font-body text-sm font-bold">Manuscript_v1_Source.pdf</p>
                       </div>
                       <Button onClick={() => window.open(submission.article.manuscript_file_url!, '_blank')} className="bg-foreground text-white rounded-none font-headline font-black uppercase text-[10px] px-8 py-6 h-auto tracking-widest shadow-xl group">
                          Download Manuscript <Download size={14} className="ml-3 group-hover:translate-y-1 transition-transform" />
                       </Button>
                    </div>
                  )}
               </div>
            </div>

            {/* Assets & Verification */}
            <div className="border-t-4 border-foreground pt-4">
              <SubmissionFileManager
                submissionId={submissionId!}
                articleId={submission.article.id}
                isAuthor={user?.id === submission.submitter_id}
                vettingFee={submission.article.vetting_fee}
                processingFee={submission.article.processing_fee}
              />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-12">
            <div className={cardClasses + " border-t-8 border-foreground bg-foreground text-white"}>
               <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 -z-0" style={{ clipPath: 'circle(50% at 100% 100%)' }}></div>
               <div className="relative z-10">
                  <h4 className="font-headline font-black text-[10px] uppercase tracking-widest text-white/40 mb-8 pb-4 border-b border-white/10">Registry Signal</h4>
                  
                  <div className="space-y-8">
                     <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/10 text-secondary"><Calendar className="h-6 w-6" /></div>
                        <div>
                           <p className="font-headline font-black text-2xl uppercase tracking-tighter">{new Date(submission.submitted_at).toLocaleDateString()}</p>
                           <p className="font-body text-[10px] text-white/30 italic">Temporal Ingestion Date</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/10 text-primary"><User className="h-6 w-6" /></div>
                        <div>
                           <p className="font-headline font-black text-lg uppercase tracking-tight leading-tight">{submission.submitter.full_name}</p>
                           <p className="font-body text-[10px] text-white/40">{submission.submitter.email}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className={cardClasses}>
               <h4 className="font-headline font-black text-[10px] uppercase tracking-widest text-foreground/40 mb-8 pb-4 border-b border-border/20">Dossier Integrity</h4>
               <div className="space-y-6">
                  <div className="p-6 bg-muted/30 border border-border/10 flex flex-col gap-4">
                     <div className="flex items-center justify-between">
                        <span className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/40 flex items-center gap-2"><Activity size={12} /> Registry Status</span>
                     </div>
                     <Badge className={`w-full py-2 rounded-none font-headline font-black uppercase text-[10px] tracking-widest flex items-center justify-center border-2 ${getStatusStyle(submission.status)}`}>
                        {submission.status.replace('_', ' ')}
                     </Badge>
                  </div>

                  <div className="p-6 bg-muted/30 border border-border/10">
                     <span className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/40 flex items-center gap-2 mb-4"><ClipboardList size={12} /> Quick Actions</span>
                     <div className="space-y-3">
                        <Button variant="ghost" className="w-full justify-between font-headline font-black uppercase text-[9px] tracking-widest text-foreground/40 hover:text-primary p-0">View Communication Log <ChevronRight size={14} /></Button>
                        <Button variant="ghost" className="w-full justify-between font-headline font-black uppercase text-[9px] tracking-widest text-foreground/40 hover:text-primary p-0">Audit Review History <ChevronRight size={14} /></Button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </ContentSection>
    </div>
  );
};