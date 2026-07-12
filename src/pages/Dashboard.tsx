import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSubmissions, Submission } from '@/lib/submissionService';
import { deleteArticle } from '@/lib/articleService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSubmissions();
  }, [user, navigate]);

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      const data = await getSubmissions({ submitter_id: user.id });
      // Apply strict client-side filtering as a secondary measure to ensure 
      // the dashboard only shows the user's own submissions.
      const personalSubmissions = (data || []).filter(s => s.submitter_id === user.id);
      setSubmissions(personalSubmissions);
      console.log(`[Dashboard] Scoped to user ${user.id}. Total: ${data?.length}, Scoped: ${personalSubmissions.length}`);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteArticle(articleId);
      toast({ title: "Article Deleted", description: "Your submission has been removed." });
      fetchSubmissions();
    } catch (err: any) {
      toast({
        title: "Deletion Failed",
        description: err?.message ?? "Could not delete the article.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentColor = (bool:Boolean) => {
    switch(bool){
      case true:
        return 'bg-green-100 text-green-800'
      case false:
        return 'bg-red-100 text-red-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!user) {
    return null;
  }


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 space-y-6">
        <div className="h-8 bg-stone-100 animate-pulse rounded w-1/3" />
        <div className="h-48 bg-stone-100 animate-pulse rounded" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-stone-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  const activeSubmissions = submissions.length;
  const inReviewSubmissions = submissions.filter(s => s.status === 'under_review').length;
  const acceptedSubmissions = submissions.filter(s => s.status === 'accepted').length;

  return (
    <div className="max-w-[1400px] mx-auto px-8 md:px-12 py-16 animate-fade-in-up">
      {/* Welcome Header */}
      <header className="mb-16">
        <p className="text-primary font-label text-xs uppercase tracking-[0.3em] mb-4">Account Dashboard</p>
        <h3 className="text-4xl md:text-5xl font-headline text-stone-900 max-w-2xl leading-tight">
          Manage your research and submissions.
        </h3>
      </header>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
        <div className="md:col-span-8 bg-stone-50 p-6 sm:p-10 flex flex-col justify-between group hover:bg-stone-100 transition-colors duration-500">
          <div>
            <div className="flex justify-between items-start mb-12">
              <h4 className="font-headline font-black text-xs uppercase tracking-widest text-primary mb-4">Submission Status</h4>
              <span className="text-[10px] font-label uppercase tracking-[0.2em] text-primary bg-primary/5 px-3 py-1">In Review: {inReviewSubmissions}</span>
            </div>
            <div className="flex items-end gap-4">
              <span className="text-5xl sm:text-7xl md:text-8xl font-headline leading-none tabular-nums">
                {activeSubmissions.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-label text-stone-400 mb-3 uppercase tracking-[0.2em]">Total Submissions</span>
            </div>
          </div>
          <div className="mt-12 h-[1px] bg-stone-100 relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${(inReviewSubmissions / (activeSubmissions || 1)) * 100}%` }}></div>
          </div>
        </div>
        
        <div className="md:col-span-4 bg-primary p-6 sm:p-10 flex flex-col justify-between text-white group hover:bg-primary/10 transition-colors duration-500">
          <div className="flex justify-between items-start">
            <h4 className="font-headline text-2xl uppercase tracking-tighter opacity-90">Accepted Articles</h4>
            <span className="material-symbols-outlined opacity-50">verified</span>
          </div>
          <div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl sm:text-6xl md:text-7xl font-headline leading-none tabular-nums">
                {acceptedSubmissions.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-widest mb-2 opacity-70">Accepted</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Verified Research</p>
          </div>
        </div>
      </div>

      {/* Asymmetric Content Sections */}
      <div className="asymmetric-grid">
        {/* Manuscript Management List */}
        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-stone-100 gap-4">
            <h4 className="font-headline text-xl text-stone-900">Recent Manuscripts</h4>
            <div className="flex flex-wrap items-center gap-1.5">
               {['all', 'submitted', 'under_review', 'accepted', 'rejected'].map(stat => {
                 const count = stat === 'all'
                   ? submissions.length
                   : submissions.filter(s => s.status === stat).length;
                 const active = statusFilter === stat;
                 return (
                   <button
                     key={stat}
                     onClick={() => setStatusFilter(stat)}
                     aria-pressed={active}
                     className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border transition-colors whitespace-nowrap ${
                       active
                         ? 'bg-primary text-white border-primary'
                         : 'bg-white text-stone-500 border-stone-200 hover:border-primary hover:text-primary'
                     }`}
                   >
                     {stat === 'all' ? 'All' : formatStatus(stat)}
                     <span className={active ? 'ml-1.5 opacity-70' : 'ml-1.5 text-stone-400'}>{count}</span>
                   </button>
                 );
               })}
            </div>
          </div>
          
          <div className="space-y-6">
            {submissions.filter(s => statusFilter === 'all' || s.status === statusFilter).length === 0 ? (
              <div className="bg-white p-12 text-center border border-dashed border-stone-200">
                <p className="text-sm text-stone-400 uppercase tracking-widest mb-6">No {statusFilter !== 'all' ? formatStatus(statusFilter).toLowerCase() : ''} submissions found</p>
                <button 
                  onClick={() => navigate('/submit')}
                  className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                >
                  Start First Submission
                </button>
              </div>
            ) : (
              submissions.filter(s => statusFilter === 'all' || s.status === statusFilter).slice(0, 5).map((submission) => {
                const art = (submission.article as any) || {};
                const borderColor =
                  submission.status === 'accepted' ? 'border-l-green-500' :
                  submission.status === 'rejected' ? 'border-l-red-500' :
                  submission.status === 'under_review' ? 'border-l-blue-500' :
                  submission.status === 'revision_requested' ? 'border-l-orange-400' :
                  'border-l-primary';
                return (
                  <div
                    key={submission.id}
                    className={`bg-white p-8 group hover:bg-stone-100 transition-all duration-300 border border-stone-100 border-l-4 ${borderColor} cursor-pointer`}
                    onClick={() => navigate(`/submission/${submission.id}/details`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-label uppercase tracking-widest px-3 py-1 ${
                        submission.status === 'accepted' ? 'bg-green-100/50 text-green-800' :
                        submission.status === 'rejected' ? 'bg-red-100/50 text-red-800' :
                        submission.status === 'under_review' ? 'bg-blue-100/50 text-blue-800' :
                        submission.status === 'revision_requested' ? 'bg-orange-100/50 text-orange-800' :
                        'bg-stone-100/20 text-secondary'
                      }`}>
                        {formatStatus(submission.status)}
                      </span>
                      <span className="text-[10px] font-label text-stone-300 uppercase tracking-widest">SDS-{submission.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <p className="font-headline text-xl font-semibold text-stone-900 leading-snug mb-4 line-clamp-2">
                      {art.title || 'Untitled Manuscript'}
                    </p>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-6 text-[10px] font-label uppercase tracking-[0.2em] text-stone-400">
                        <span className="truncate max-w-[150px]">Author: {art.authors?.[0]?.name || 'Scholar'}</span>
                        <span className="w-1 h-1 bg-stone-200 rounded-full"></span>
                        <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                      </div>
                      {submission.status === 'submitted' && art.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 text-stone-300 hover:text-red-500 transition-colors shrink-0"
                              title="Delete submission"
                            >
                              <Trash2 size={14} />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this submission?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove the article and all associated data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => handleDelete(art.id, e)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Permanently
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Registry Continuity & Efficiency */}
        <section className="hidden md:block">
          <div className="bg-stone-100 p-10 h-full border-t border-primary/10">
            <h4 className="font-headline text-xl mb-8 uppercase tracking-tighter">How It Works</h4>
            <p className="text-stone-500 max-w-md mx-auto italic font-body text-lg">
              Every submission goes through the same clear, three-step process.
            </p>
            
            <div className="space-y-12 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-stone-200"></div>
              
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-4 h-4 bg-primary border-4 border-stone-100"></div>
                <h6 className="text-[10px] font-label font-bold uppercase tracking-[0.2em] mb-1">Step 1: Submit</h6>
                <p className="text-[10px] text-stone-400 leading-relaxed">
                  Upload your manuscript and submit it for editorial screening.
                </p>
              </div>
              
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-4 h-4 bg-stone-300 border-4 border-stone-100"></div>
                <h6 className="text-[10px] font-label font-bold uppercase tracking-[0.2em] mb-1">Step 2: Peer Review</h6>
                <p className="text-[10px] text-stone-400 leading-relaxed">Double-blind review by our expert reviewers.</p>
              </div>
              
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-4 h-4 bg-stone-300 border-4 border-stone-100"></div>
                <h6 className="text-[10px] font-label font-bold uppercase tracking-[0.2em] mb-1">Step 3: Publication</h6>
                <p className="text-[10px] text-stone-400 leading-relaxed">Your article is published, permanently archived, and citable.</p>
              </div>
            </div>

            {/* Afrocentric Separator Accent */}
            <div className="mt-16 flex gap-1 transform scale-75 origin-left">
              <div className="h-8 w-8 bg-primary"></div>
              <div className="h-8 w-8 border border-primary/30"></div>
              <div className="h-8 w-8 bg-primary"></div>
              <div className="h-8 w-8 border border-primary/30"></div>
            </div>
          </div>
        </section>
      </div>



      {/* Bottom Institutional Credits */}
      <footer className="mt-32 pt-12 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-label uppercase tracking-[0.3em] text-stone-300">
        <span>© 2024 International Journal of Social Work and Development Studies</span>
        <div className="flex gap-10">
          <Link to="/about" className="hover:text-primary transition-colors">Ethics</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          <Link to="/archive" className="hover:text-primary transition-colors">Archive</Link>
        </div>
      </footer>
    </div>
  );
};