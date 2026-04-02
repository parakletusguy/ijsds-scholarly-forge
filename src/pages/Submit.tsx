import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, ArrowLeft, ArrowRight, FileText, Users, Info, ShieldCheck, CloudUpload, Zap, Layers, MapPin, Database } from 'lucide-react';
import { createSubmission } from '@/lib/submissionService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/file-management/FileUpload';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

interface Author {
  name: string;
  email: string;
  affiliation: string;
  orcid?: string;
}

export const Submit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [authors, setAuthors] = useState<Author[]>([
    { name: '', email: user?.email || '', affiliation: '', orcid: '' }
  ]);
  const [correspondingAuthorEmail, setCorrespondingAuthorEmail] = useState(user?.email || '');
  const [subjectArea, setSubjectArea] = useState('');
  const [fundingInfo, setFundingInfo] = useState('');
  const [conflictsOfInterest, setConflictsOfInterest] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [manuscriptFileUrl, setManuscriptFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [submissionEnabled, setSubmissionEnabled] = useState(true)
  const [checkingSubmissionStatus, setCheckingSubmissionStatus] = useState(true)

  useEffect(() => {
    if (user) loadDraft();
    setSubmissionEnabled(true);
    setCheckingSubmissionStatus(false);
  }, [user]);

  useEffect(() => {
    if (user && (title || abstract || keywords.length > 0)) {
      const timeoutId = setTimeout(() => saveDraft(), 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [title, abstract, keywords, authors, correspondingAuthorEmail, subjectArea, fundingInfo, conflictsOfInterest, coverLetter, manuscriptFileUrl, user]);

  const loadDraft = async () => {
    try {
      const savedData = localStorage.getItem(`article_draft_${user?.id}`);
      if (savedData) {
        const draft = JSON.parse(savedData);
        setTitle(draft.title || '');
        setAbstract(draft.abstract || '');
        setKeywords(draft.keywords || []);
        setAuthors(draft.authors || [{ name: '', email: user?.email || '', affiliation: '', orcid: '' }]);
        setCorrespondingAuthorEmail(draft.correspondingAuthorEmail || user?.email || '');
        setSubjectArea(draft.subjectArea || '');
        setFundingInfo(draft.fundingInfo || '');
        setConflictsOfInterest(draft.conflictsOfInterest || '');
        setCoverLetter(draft.coverLetter || '');
        setManuscriptFileUrl(draft.manuscriptFileUrl || '');
        setDraftId(draft.draftId || null);
        setLastSaved(new Date(draft.lastSaved));
      }
    } catch (error) { console.error('Error loading draft:', error); }
  };

  const saveDraft = async () => {
    if (!user || autoSaving) return;
    setAutoSaving(true);
    try {
      const draftData = {
        title, abstract, keywords, authors, correspondingAuthorEmail, subjectArea,
        fundingInfo, conflictsOfInterest, coverLetter, manuscriptFileUrl, draftId,
        lastSaved: new Date().toISOString(), userId: user.id
      };
      localStorage.setItem(`article_draft_${user.id}`, JSON.stringify(draftData));
      setLastSaved(new Date());
    } catch (error) { console.error('Error saving draft:', error); } finally { setAutoSaving(false); }
  };

  const clearDraft = () => {
    localStorage.removeItem(`article_draft_${user?.id}`);
    setDraftId(null);
    setLastSaved(null);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => setKeywords(keywords.filter((_, i) => i !== index));
  const addAuthor = () => setAuthors([...authors, { name: '', email: '', affiliation: '', orcid: '' }]);
  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    setAuthors(authors.map((author, i) => i === index ? { ...author, [field]: value } : author));
  };
  const removeAuthor = (index: number) => { if (authors.length > 1) setAuthors(authors.filter((_, i) => i !== index)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: 'Auth Required', variant: 'destructive' }); return; }
    if (!title.trim() || !abstract.trim() || !manuscriptFileUrl) {
      toast({ title: 'Validation Failed', description: 'Title, Abstract, and Manuscript are required.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await saveDraft();
      await createSubmission({
        title: title.trim(), abstract: abstract.trim(), keywords, authors,
        corresponding_author_email: correspondingAuthorEmail, subject_area: subjectArea,
        cover_letter: coverLetter, reviewer_suggestions: '', submission_type: 'new',
        funding_info: fundingInfo || null, conflicts_of_interest: conflictsOfInterest || null,
      });
      clearDraft();
      toast({ title: 'Success', description: 'Manuscript submitted for evaluation.' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Submission failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const inputClasses = "bg-white border-border/40 rounded-none focus:border-primary transition-all font-body h-14 text-lg";
  const labelClasses = "font-headline font-black text-xs uppercase tracking-[0.3em] text-foreground/40 mb-4 block italic";
  const cardClasses = "bg-white p-12 md:p-16 border border-border/10 shadow-sm relative overflow-hidden group";

  if (!user) return null;

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>Submit Manuscript IJSDS — Submission Registry</title>
        <meta name="description" content="Submit your multidisciplinary research manuscript to the IJSDS editorial office for peer-review." />
      </Helmet>

      <PageHeader 
        title="Manuscript" 
        subtitle="Registry" 
        accent="Technical Protocol Portal"
        description="Initiate the formal peer-review process and contribute to the global discourse on social development. Your intellectual property is protected through our double-blind protocols."
      />

      <ContentSection>
        {/* Portal Controls — High Fidelity Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 gap-12 relative">
           <div className="absolute top-1/2 left-0 w-full h-px bg-border/20 -z-0"></div>
           
           <button 
             onClick={() => navigate('/dashboard')} 
             className="relative z-10 flex items-center gap-4 font-headline font-black text-xs uppercase tracking-[0.4em] text-foreground/40 hover:text-primary transition-colors bg-secondary/5 px-8 py-6 border border-border/10"
           >
              <ArrowLeft size={16} /> Exit to Archive Hub
           </button>
           
           <div className="relative z-10 flex items-center gap-6 bg-white p-6 shadow-2xl border-t-4 border-secondary">
              {autoSaving ? (
                <div className="flex items-center gap-4">
                   <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                   <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/40 italic">Vaulting Meta-Data...</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-4">
                   <ShieldCheck className="h-6 w-6 text-secondary animate-pulse" />
                   <div className="flex flex-col">
                      <span className="font-headline font-black text-[9px] uppercase tracking-[0.4em] text-foreground/30">Registry State</span>
                      <span className="font-headline font-black text-xs uppercase tracking-widest text-secondary">Secured: {lastSaved.toLocaleTimeString()}</span>
                   </div>
                </div>
              ) : null}
           </div>
        </div>

        {checkingSubmissionStatus ? (
          <div className="py-48 text-center">
             <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
             <p className="font-headline font-black uppercase text-xs tracking-[0.5em] text-foreground/20 italic">Authorizing Submission Grid...</p>
          </div>
        ) : !submissionEnabled ? (
          <div className="bg-foreground text-white p-24 text-center relative overflow-hidden group shadow-2xl border border-white/5">
             <div className="absolute inset-0 bg-white opacity-5 -z-0" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
             <div className="relative z-10 max-w-2xl mx-auto">
                <ShieldCheck className="h-16 w-16 text-secondary mx-auto mb-10" />
                <h2 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter text-white mb-8 leading-none">Registry <br/><span className="text-secondary italic">Restricted</span></h2>
                <p className="font-body text-xl md:text-2xl italic text-white/30 mb-16 leading-relaxed border-l-4 border-primary/40 pl-8">
                  The submission window is currently under internal editorial audit. Please check the master calendar for upcoming cycles.
                </p>
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="bg-white text-foreground px-16 py-8 font-headline font-black text-xs uppercase tracking-[0.4em] hover:bg-secondary hover:text-white transition-all shadow-2xl"
                >
                  Return to Dashboard
                </button>
             </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-24">
            
            {/* Phase 1: Conceptual Matrix */}
            <div className="space-y-12">
               <div className="flex items-center gap-8 border-b border-primary/20 pb-8">
                  <div className="w-16 h-16 bg-primary flex items-center justify-center text-white border border-primary/10 shadow-xl">
                     <FileText size={32} />
                  </div>
                  <div className="flex flex-col">
                     <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-foreground/30 italic">Phase 01</span>
                     <h2 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter">Conceptual Matrix</h2>
                  </div>
               </div>
               
               <div className={cardClasses}>
                  {/* Decorative Motif */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -z-0" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                  
                  <div className="grid gap-12 relative z-10">
                    <div>
                      <Label htmlFor="title" className={labelClasses}>Article Architectural Title *</Label>
                      <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Full academic designation..." className={inputClasses} />
                    </div>

                    <div>
                      <Label htmlFor="abstract" className={labelClasses}>Scholarly Abstract * (250-300 Words)</Label>
                      <Textarea id="abstract" value={abstract} onChange={(e) => setAbstract(e.target.value)} required rows={10} className={inputClasses + " h-auto py-8 lg:text-xl leading-relaxed italic text-foreground/70"} placeholder="Summarize your methodology, findings, and developmental impact..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div>
                        <Label className={labelClasses}>Theoretical Keywords</Label>
                        <div className="flex gap-4 mb-6">
                          <Input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} placeholder="Core concepts" className={inputClasses} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())} />
                          <button type="button" onClick={addKeyword} className="bg-primary hover:bg-secondary text-white h-14 px-8 flex items-center justify-center transition-all shadow-xl group/plus">
                             <Plus size={24} className="group-hover/plus:rotate-90 transition-transform" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {keywords.map((kw, i) => (
                            <Badge key={i} className="bg-secondary/10 text-secondary border border-secondary/20 rounded-none font-headline font-black uppercase text-[10px] tracking-widest px-6 py-3 flex items-center gap-3">
                              {kw} <X size={14} className="cursor-pointer hover:text-primary transition-colors" onClick={() => removeKeyword(i)} />
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subjectArea" className={labelClasses}>Multidisciplinary Domain</Label>
                        <Input id="subjectArea" value={subjectArea} onChange={(e) => setSubjectArea(e.target.value)} placeholder="e.g., Development Economics..." className={inputClasses} />
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Phase 2: Assets & Payload */}
            <div className="space-y-12">
               <div className="flex items-center gap-8 border-b border-secondary/20 pb-8">
                  <div className="w-16 h-16 bg-secondary flex items-center justify-center text-white border border-secondary/10 shadow-xl">
                     <CloudUpload size={32} />
                  </div>
                  <div className="flex flex-col">
                     <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-foreground/30 italic">Phase 02</span>
                     <h2 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter">Digital Assets Ledger</h2>
                  </div>
               </div>
               
               <div className={cardClasses}>
                  <div className="p-12 md:p-20 border-4 border-dashed border-border/20 hover:border-primary/40 transition-all bg-secondary/5 text-center group/uploader relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 -z-0 opacity-0 group-hover/uploader:opacity-100 transition-opacity" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                     <FileUpload
                        bucketName="journal-website-db1"
                        folder="manuscripts"
                        onFileUploaded={(url) => setManuscriptFileUrl(url)}
                        acceptedTypes=".doc,.docx"
                        maxSizeMB={25}
                      />
                  </div>
                  {manuscriptFileUrl && (
                    <div className="mt-12 p-8 bg-secondary/10 border-l-8 border-secondary flex items-center gap-8 animate-fade-in">
                       <div className="w-12 h-12 bg-secondary flex items-center justify-center text-white shadow-xl">
                          <ShieldCheck size={24} />
                       </div>
                       <div className="flex flex-col">
                          <span className="font-headline font-black text-xs uppercase tracking-[0.4em] text-secondary">Payload Secured</span>
                          <p className="font-body italic text-foreground/40 text-sm mt-1">Institutional manuscript file has been successfully vaulted in the registry.</p>
                       </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Phase 3: Author Registry Integration */}
            <div className="space-y-12">
               <div className="flex items-center gap-8 border-b border-foreground/20 pb-8">
                  <div className="w-16 h-16 bg-foreground flex items-center justify-center text-white border border-white/10 shadow-xl">
                     <Users size={32} />
                  </div>
                  <div className="flex flex-col">
                     <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-foreground/30 italic">Phase 03</span>
                     <h2 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter">Contributor Registry</h2>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 gap-12">
                 {authors.map((author, index) => (
                   <div key={index} className={cardClasses}>
                     <div className="flex items-center justify-between mb-12 border-b border-border/10 pb-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center text-secondary font-headline font-black">0{index + 1}</div>
                           <span className="font-headline font-black text-xs uppercase tracking-[0.4em] text-foreground/40 italic">Collaborator Profile</span>
                        </div>
                        {authors.length > 1 && (
                           <button type="button" onClick={() => removeAuthor(index)} className="group/del flex items-center gap-3 font-headline font-black text-[10px] uppercase tracking-widest text-primary hover:text-red-600 transition-all">
                              <X size={14} className="group-hover/del:rotate-90 transition-transform" /> Discard Profile
                           </button>
                        )}
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                          <Label className={labelClasses}>Full Scholarly Name *</Label>
                          <Input value={author.name} onChange={(e) => updateAuthor(index, 'name', e.target.value)} required placeholder="Format: Surname Firstname" className={inputClasses} />
                        </div>
                        <div>
                          <Label className={labelClasses}>Institutional Email *</Label>
                          <Input type="email" value={author.email} onChange={(e) => updateAuthor(index, 'email', e.target.value)} required placeholder="Official .edu or institutional mail" className={inputClasses} />
                        </div>
                        <div>
                          <Label className={labelClasses}>Academic Affiliation</Label>
                          <Input value={author.affiliation} onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)} placeholder="University / Centre / Institution" className={inputClasses} />
                        </div>
                        <div>
                          <Label className={labelClasses}>ORCID Digital iD</Label>
                          <div className="relative">
                             <Input value={author.orcid} onChange={(e) => updateAuthor(index, 'orcid', e.target.value)} placeholder="0000-0000-0000-0000" className={inputClasses + " pl-12"} />
                             <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" />
                          </div>
                        </div>
                     </div>
                   </div>
                 ))}
                 
                 <button 
                   type="button" 
                   onClick={addAuthor} 
                   className="w-full py-12 border-2 border-dashed border-border/20 hover:border-secondary/40 transition-all flex flex-col items-center gap-4 group/add bg-white/50"
                 >
                    <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center text-secondary group-hover/add:bg-secondary group-hover/add:text-white transition-all shadow-inner">
                       <Plus size={24} className="group-hover/add:rotate-90 transition-transform" />
                    </div>
                    <span className="font-headline font-black text-[11px] uppercase tracking-[0.5em] text-foreground/30">Registry Integration</span>
                 </button>

                 <div className="bg-foreground text-white p-12 md:p-16 shadow-2xl relative overflow-hidden group/correspondence">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 opacity-0 group-hover/correspondence:opacity-100 transition-opacity" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                    <Label htmlFor="correspondingEmail" className={labelClasses + " text-white/50"}>Corresponding Identity *</Label>
                    <div className="relative">
                       <Input id="correspondingEmail" type="email" value={correspondingAuthorEmail} onChange={(e) => setCorrespondingAuthorEmail(e.target.value)} required className={inputClasses + " bg-white/5 border-white/10 text-white focus:border-secondary h-16 text-2xl"} />
                       <ShieldCheck className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary opacity-40" />
                    </div>
                    <p className="mt-8 font-body italic text-white/20 text-sm leading-relaxed max-w-xl">
                      All official editorial decisions, assessment reports, and production protocols will be routed to this specific digital architecture.
                    </p>
                 </div>
               </div>
            </div>

            {/* Phase 4: Scholarly Declarations */}
            <div className="space-y-12">
               <div className="flex items-center gap-8 border-b border-primary/20 pb-8">
                  <div className="w-16 h-16 bg-primary flex items-center justify-center text-white border border-primary/10 shadow-xl">
                     <Info size={32} />
                  </div>
                  <div className="flex flex-col">
                     <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-foreground/30 italic">Phase 04</span>
                     <h2 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter">Technical Protocol Ledger</h2>
                  </div>
               </div>
               
               <div className={cardClasses}>
                  <div className="grid gap-16 relative z-10">
                    <div>
                      <Label htmlFor="funding" className={labelClasses}>Funding Infrastructure</Label>
                      <Textarea id="funding" value={fundingInfo} onChange={(e) => setFundingInfo(e.target.value)} rows={4} className={inputClasses + " h-auto py-6 italic text-foreground/70"} placeholder="Grant identifiers, institutional sponsoring bodies, or developmental foundations..." />
                    </div>
                    <div>
                      <Label htmlFor="conflicts" className={labelClasses}>Internal Conflicts Registry</Label>
                      <Textarea id="conflicts" value={conflictsOfInterest} onChange={(e) => setConflictsOfInterest(e.target.value)} rows={4} className={inputClasses + " h-auto py-6 italic text-foreground/70"} placeholder="State 'None' if professional interests are neutral..." />
                    </div>
                    <div>
                      <Label htmlFor="coverLetter" className={labelClasses}>Editorial Cover Dossier</Label>
                      <Textarea id="coverLetter" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={8} className={inputClasses + " h-auto py-8 text-xl leading-relaxed italic text-foreground/80"} placeholder="Specifically justify the significance, novelty, and multicisciplinary impact of this research for the African commons..." />
                    </div>
                  </div>
               </div>
            </div>

            {/* Final Transmission Control */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-12 pt-24 border-t border-border/20">
               <div className="flex items-center gap-6">
                  <Zap size={24} className="text-secondary animate-pulse" />
                  <p className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/20 italic">Ensuring Scientific Continuity</p>
               </div>

               <div className="flex flex-col sm:flex-row items-center gap-8 w-full lg:w-auto">
                  <button 
                    type="button" 
                    onClick={() => navigate('/dashboard')} 
                    className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary hover:text-foreground transition-all order-2 sm:order-1"
                  >
                    Discard Record Draft
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full sm:w-auto bg-primary text-white py-10 px-24 font-headline font-black text-sm uppercase tracking-[0.5em] shadow-[0_30px_60px_-10px_rgba(27,67,50,0.4)] hover:bg-foreground transition-all group relative overflow-hidden order-1 sm:order-2"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-6">
                       {loading ? 'Transmitting Data Registry...' : 'Finalize Transmission'}
                       <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white translate-x-full group-hover:translate-x-0 transition-transform duration-700 opacity-10"></div>
                  </button>
               </div>
            </div>
          </form>
        )}
      </ContentSection>
    </div>
  );
};

export default Submit;