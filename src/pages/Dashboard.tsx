import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSubmissions, Submission } from '@/lib/submissionService';
import { useAuth } from '@/hooks/useAuth';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

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
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
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
        <p className="text-primary font-label text-xs uppercase tracking-[0.3em] mb-4">Registry Dashboard</p>
        <h3 className="text-4xl md:text-5xl font-headline text-on-surface max-w-2xl leading-tight">
          Curation of Institutional Knowledge & Sovereign Protocols.
        </h3>
      </header>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
        <div className="md:col-span-8 bg-surface-container-low p-10 flex flex-col justify-between group hover:bg-surface-container transition-colors duration-500">
          <div>
            <div className="flex justify-between items-start mb-12">
              <h4 className="font-headline text-2xl uppercase tracking-tighter">Active Manuscripts</h4>
              <span className="text-[10px] font-label uppercase tracking-[0.2em] text-primary bg-primary/5 px-3 py-1">In Review: {inReviewSubmissions}</span>
            </div>
            <div className="flex items-end gap-4">
              <span className="text-7xl md:text-8xl font-headline leading-none tabular-nums">
                {activeSubmissions.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-label text-on-surface/40 mb-3 uppercase tracking-[0.2em]">Total Submissions</span>
            </div>
          </div>
          <div className="mt-12 h-[1px] bg-outline-variant/20 relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${(inReviewSubmissions / (activeSubmissions || 1)) * 100}%` }}></div>
          </div>
        </div>
        
        <div className="md:col-span-4 bg-primary p-10 flex flex-col justify-between text-on-primary group hover:bg-primary-container transition-colors duration-500">
          <div className="flex justify-between items-start">
            <h4 className="font-headline text-2xl uppercase tracking-tighter opacity-90">Sovereign Registry</h4>
            <span className="material-symbols-outlined opacity-50">verified</span>
          </div>
          <div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-6xl md:text-7xl font-headline leading-none tabular-nums">
                {acceptedSubmissions.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-widest mb-2 opacity-70">Accepted</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Validated Scholarly Record</p>
          </div>
        </div>
      </div>

      {/* Asymmetric Content Sections */}
      <div className="asymmetric-grid">
        {/* Manuscript Management List */}
        <section>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/10">
            <h4 className="font-headline text-xl italic">Recent Manuscripts</h4>
            <button 
              onClick={() => navigate('/articles')}
              className="text-[10px] uppercase tracking-widest text-on-surface/40 hover:text-primary transition-colors"
            >
              View Archive →
            </button>
          </div>
          
          <div className="space-y-6">
            {submissions.length === 0 ? (
              <div className="bg-surface-container-lowest p-12 text-center border border-dashed border-outline-variant/30">
                <p className="text-sm text-on-surface/40 uppercase tracking-widest mb-6">No records found in sovereign registry</p>
                <button 
                  onClick={() => navigate('/submit')}
                  className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                >
                  Initiate First Submission
                </button>
              </div>
            ) : (
              submissions.slice(0, 5).map((submission) => {
                const art = (submission.article as any) || {};
                return (
                  <div 
                    key={submission.id}
                    className="bg-surface-container-lowest p-8 group hover:bg-surface-container transition-all duration-300 border border-transparent hover:border-outline-variant/10 cursor-pointer"
                    onClick={() => navigate(`/submission/${submission.id}/details`)}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className={`text-[10px] font-label uppercase tracking-widest px-3 py-1 ${
                        submission.status === 'accepted' ? 'bg-green-100/50 text-green-800' : 
                        submission.status === 'rejected' ? 'bg-red-100/50 text-red-800' :
                        'bg-secondary-container/20 text-secondary'
                      }`}>
                        {formatStatus(submission.status)}
                      </span>
                      <span className="text-[10px] font-label text-on-surface/30 uppercase tracking-widest">SDS-{submission.id.slice(0, 8)}</span>
                    </div>
                    <h5 className="font-headline text-xl mb-4 group-hover:text-primary transition-colors leading-snug">
                      {art.title}
                    </h5>
                    <div className="flex items-center gap-6 text-[10px] font-label uppercase tracking-[0.2em] text-on-surface/50">
                      <span className="truncate max-w-[150px]">Author: {art.authors?.[0]?.name || 'Institutional Scholar'}</span>
                      <span className="w-1 h-1 bg-outline-variant/30 rounded-full"></span>
                      <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Registry Continuity & Efficiency */}
        <section className="hidden md:block">
          <div className="bg-surface-container-high p-10 h-full border-t border-primary/10">
            <h4 className="font-headline text-xl mb-8 uppercase tracking-tighter">Registry Protocol</h4>
            <p className="text-sm leading-relaxed text-on-surface/70 mb-12 font-body italic">
              Efficiency and continuity are the pillars of the IJSDS curation cycle. Each registry entry undergoes a triple-layer validation against sovereign design principles.
            </p>
            
            <div className="space-y-12 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-outline-variant/30"></div>
              
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-4 h-4 bg-primary border-4 border-surface-container-high"></div>
                <h6 className="text-[10px] font-label font-bold uppercase tracking-[0.2em] mb-1">Phase 01: Ingestion</h6>
                <p className="text-[10px] text-on-surface/50 leading-relaxed">Initial alignment check with West African intellectual heritage.</p>
              </div>
              
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-4 h-4 bg-outline-variant border-4 border-surface-container-high"></div>
                <h6 className="text-[10px] font-label font-bold uppercase tracking-[0.2em] mb-1">Phase 02: Peer Evaluation</h6>
                <p className="text-[10px] text-on-surface/50 leading-relaxed">Double-blind review by the Sovereign Scholarly Committee.</p>
              </div>
              
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-4 h-4 bg-outline-variant border-4 border-surface-container-high"></div>
                <h6 className="text-[10px] font-label font-bold uppercase tracking-[0.2em] mb-1">Phase 03: Registry Finalization</h6>
                <p className="text-[10px] text-on-surface/50 leading-relaxed">Archival timestamping and institutional registry entry.</p>
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

      {/* Pull Quote Section */}
      <section className="mt-32 mb-16 text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="w-12 h-[1px] bg-primary mx-auto mb-10 opacity-30"></div>
        <blockquote className="text-2xl md:text-3xl font-headline italic text-on-surface/80 max-w-3xl mx-auto leading-snug">
          "Design is not merely utility; it is the physical manifestation of institutional memory and sovereign dignity."
        </blockquote>
        <div className="w-12 h-[1px] bg-primary mx-auto mt-10 opacity-30"></div>
      </section>

      {/* Bottom Institutional Credits */}
      <footer className="mt-32 pt-12 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-label uppercase tracking-[0.3em] text-on-surface/30">
        <span>© 2024 International Journal of Sovereign Design Systems</span>
        <div className="flex gap-10">
          <Link to="/about" className="hover:text-primary transition-colors">Registry Ethics</Link>
          <Link to="/about" className="hover:text-primary transition-colors">Continuity Protocol</Link>
          <Link to="/archive" className="hover:text-primary transition-colors">Archive Access</Link>
        </div>
      </footer>
    </div>
  );
};