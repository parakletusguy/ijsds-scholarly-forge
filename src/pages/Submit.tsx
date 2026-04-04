import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Plus, ShieldCheck, CloudUpload, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { createSubmission } from '@/lib/submissionService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/file-management/FileUpload';

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
  const [subjectArea, setSubjectArea] = useState('Sustainable Architecture');
  const [fundingInfo, setFundingInfo] = useState('');
  const [conflictsOfInterest, setConflictsOfInterest] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [manuscriptFileUrl, setManuscriptFileUrl] = useState('');
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Checks for ethics/disclosure
  const [ethicsAgree, setEthicsAgree] = useState(false);
  const [feesAgree, setFeesAgree] = useState(false);

  useEffect(() => {
    if (user) loadDraft();
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
        setSubjectArea(draft.subjectArea || 'Sustainable Architecture');
        setFundingInfo(draft.fundingInfo || '');
        setConflictsOfInterest(draft.conflictsOfInterest || '');
        setCoverLetter(draft.coverLetter || '');
        setManuscriptFileUrl(draft.manuscriptFileUrl || '');
        setDraftId(draft.draftId || null);
        setLastSaved(draft.lastSaved ? new Date(draft.lastSaved) : null);
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

  const addKeyword = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
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
    
    if (!ethicsAgree || !feesAgree) {
      toast({ title: 'Agreement Required', description: 'Please acknowledge the ethical guidelines and processing fees.', variant: 'destructive' });
      return;
    }

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
        file: manuscriptFile || undefined
      });
      clearDraft();
      toast({ title: 'Success', description: 'Manuscript submitted for evaluation.' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Submission failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const isStepComplete = (step: number) => {
    switch(step) {
      case 1: return title && abstract && keywords.length > 0;
      case 2: return !!manuscriptFile || !!manuscriptFileUrl;
      case 3: return authors.every(a => a.name && a.email && a.affiliation);
      case 4: return ethicsAgree && feesAgree;
      default: return false;
    }
  };

  if (!user) return null;

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
      <Helmet>
        <title>Manuscript Submission | The Curator IJSDS</title>
      </Helmet>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 lg:px-12 lg:py-16">
        
        {/* Header Section */}
        <div className="mb-16 border-l-4 border-primary pl-8 animate-fade-in">
          <span className="font-label uppercase tracking-[0.3em] text-[10px] text-secondary font-bold block mb-4">Submission Portal v4.2</span>
          <h2 className="font-headline text-5xl font-bold tracking-tight text-on-surface mb-2">Submit Manuscript</h2>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed italic opacity-80 font-headline text-lg">
            Contributing to the International Journal of Sovereign Design Systems. Ensure all files adhere to the Curator's editorial standards.
          </p>
          
          <div className="mt-8 flex items-center gap-6">
            {autoSaving && (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[9px] font-label uppercase tracking-widest text-on-surface/40 italic">Vaulting Meta-Data...</span>
              </div>
            )}
            {lastSaved && !autoSaving && (
              <span className="text-[9px] font-label uppercase tracking-widest text-secondary font-bold">Registry Secured: {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-24">
          {/* Form Content */}
          <div className="space-y-24">
            
            {/* Step 1: Article Details */}
            <div className="relative group section-fade-in">
              <div className="absolute -left-16 top-0 opacity-[0.05] font-headline text-8xl font-bold italic select-none hidden lg:block">01</div>
              <div className="space-y-8">
                <h3 className="font-headline text-3xl font-bold border-b border-outline-variant/30 pb-4 tracking-tight">Article Details</h3>
                <div className="space-y-12">
                  <div className="space-y-3">
                    <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Manuscript Title *</label>
                    <input 
                      className="w-full bg-surface-container-high border-b-2 border-transparent focus:border-primary px-4 py-6 text-2xl font-headline italic outline-none transition-all duration-300 placeholder:opacity-30" 
                      placeholder="Enter the full scholarly title of your work" 
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Abstract *</label>
                    <textarea 
                      className="w-full bg-surface-container-high border-b-2 border-transparent focus:border-primary px-6 py-6 leading-relaxed outline-none transition-all duration-300 font-body text-lg italic placeholder:opacity-30 min-h-[300px]" 
                      placeholder="A concise summary of the research (max 300 words)" 
                      rows={10}
                      value={abstract}
                      onChange={(e) => setAbstract(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-3">
                      <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Primary Topic</label>
                      <select 
                        className="w-full bg-surface-container-high border-0 border-b-2 border-transparent focus:border-primary px-6 py-4 outline-none font-headline text-xl italic"
                        value={subjectArea}
                        onChange={(e) => setSubjectArea(e.target.value)}
                      >
                        <option>Sustainable Architecture</option>
                        <option>Digital Heritage</option>
                        <option>Urban Ecology</option>
                        <option>Economic Sovereignty</option>
                        <option>Cultural Informatics</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Theoretical Keywords</label>
                      <div className="flex gap-4 mb-4">
                        <input 
                          className="w-full bg-surface-container-high border-b-2 border-transparent focus:border-primary px-6 py-4 outline-none font-body" 
                          placeholder="e.g. Resilience, Urbanism" 
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addKeyword(e)}
                        />
                        <button 
                          type="button" 
                          onClick={addKeyword}
                          className="bg-primary hover:bg-on-surface text-white h-14 px-8 flex items-center justify-center transition-all shadow-xl group/plus"
                        >
                          <Plus size={24} className="group-hover/plus:rotate-90 transition-transform" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4">
                        {keywords.map((kw, i) => (
                          <span key={i} className="bg-surface-container-highest text-primary font-label font-bold uppercase text-[9px] tracking-widest px-4 py-2 flex items-center gap-2 group/chip">
                            {kw}
                            <X size={12} className="cursor-pointer hover:text-black transition-colors" onClick={() => removeKeyword(i)} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: File Upload */}
            <div className="relative group section-fade-in">
              <div className="absolute -left-16 top-0 opacity-[0.05] font-headline text-8xl font-bold italic select-none hidden lg:block">02</div>
              <div className="space-y-8">
                <h3 className="font-headline text-3xl font-bold border-b border-outline-variant/30 pb-4 tracking-tight">Manuscript Files</h3>
                
                <div className="bg-surface-container-low p-1 border-2 border-dashed border-outline-variant/40 hover:border-primary transition-all duration-500 overflow-hidden group/uploader">
                   <div className="p-12 text-center relative">
                      <FileUpload
                        bucketName="journal-website-db1"
                        folder="manuscripts"
                        autoUpload={false}
                        onFileUploaded={(file) => {
                          if (file instanceof File) {
                            setManuscriptFile(file);
                            setManuscriptFileUrl(file.name);
                          } else {
                            setManuscriptFileUrl(file);
                          }
                        }}
                        acceptedTypes=".doc,.docx,.pdf"
                        maxSizeMB={25}
                      />
                   </div>
                </div>

                {manuscriptFileUrl && (
                  <div className="bg-surface-container-highest p-6 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-primary flex items-center justify-center text-white">
                        <FileText size={24} />
                      </div>
                      <div>
                      <p className="text-sm font-bold truncate max-w-xs">{manuscriptFile ? manuscriptFile.name : manuscriptFileUrl.split('/').pop()}</p>
                        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Payload Secured in Registry Hub</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setManuscriptFileUrl(''); setManuscriptFile(null); }}
                      className="material-symbols-outlined text-on-surface/30 cursor-pointer hover:text-error transition-colors"
                    >
                      close
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Author Info */}
            <div className="relative group section-fade-in">
              <div className="absolute -left-16 top-0 opacity-[0.05] font-headline text-8xl font-bold italic select-none hidden lg:block">03</div>
              <div className="space-y-8">
                <h3 className="font-headline text-3xl font-bold border-b border-outline-variant/30 pb-4 tracking-tight">Author Registry</h3>
                <div className="space-y-12">
                  {authors.map((author, index) => (
                    <div key={index} className="p-10 bg-surface-container-low border-l-4 border-primary relative">
                       <div className="flex items-center justify-between mb-10">
                          <div className="flex items-center gap-4">
                             <span className="text-4xl font-headline font-bold italic opacity-20">0{index+1}</span>
                             <span className="font-label uppercase tracking-widest text-[9px] font-bold text-on-surface-variant">Scholarly Identity Profile</span>
                          </div>
                          {authors.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeAuthor(index)}
                              className="text-[9px] font-label font-bold uppercase tracking-widest text-primary hover:text-red-500 transition-colors flex items-center gap-2"
                            >
                              <X size={12} /> Discard Identity
                            </button>
                          )}
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                         <div className="space-y-2">
                            <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Full Name *</label>
                            <input 
                              className="w-full bg-white/50 border-b-2 border-transparent focus:border-primary px-4 py-3 outline-none font-headline text-lg italic transition-all" 
                              type="text" 
                              value={author.name}
                              onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                              placeholder="Format: Surname Firstname"
                              required
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Email Address *</label>
                            <input 
                              className="w-full bg-white/50 border-b-2 border-transparent focus:border-primary px-4 py-3 outline-none font-headline text-lg italic transition-all" 
                              type="email" 
                              value={author.email}
                              onChange={(e) => updateAuthor(index, 'email', e.target.value)}
                              placeholder="Official .edu or institutional mail"
                              required
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Institutional Affiliation</label>
                            <input 
                              className="w-full bg-white/50 border-b-2 border-transparent focus:border-primary px-4 py-3 outline-none font-headline text-lg italic transition-all" 
                              type="text" 
                              value={author.affiliation}
                              onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)}
                              placeholder="University or Research Organization"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">ORCID Digital iD</label>
                            <input 
                              className="w-full bg-white/50 border-b-2 border-transparent focus:border-primary px-4 py-3 outline-none font-headline text-lg italic transition-all" 
                              type="text" 
                              value={author.orcid}
                              onChange={(e) => updateAuthor(index, 'orcid', e.target.value)}
                              placeholder="0000-0000-0000-0000"
                            />
                         </div>
                       </div>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={addAuthor} 
                    className="w-full py-10 border-2 border-dashed border-outline-variant/30 hover:border-secondary transition-all flex flex-col items-center gap-3 group/add bg-surface-container-lowest"
                  >
                     <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center text-secondary group-hover/add:bg-secondary group-hover/add:text-white transition-all">
                        <Plus size={20} />
                     </div>
                     <span className="font-label font-bold text-[10px] uppercase tracking-[0.4em] text-on-surface/30">Adjoin Contributor Profile</span>
                  </button>

                  <div className="bg-on-surface p-10 lg:p-14 relative overflow-hidden group/correspondence shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 opacity-10 group-hover/correspondence:bg-primary transition-all duration-1000" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                    <label className="block font-label text-[10px] uppercase tracking-widest text-white/50 font-bold mb-6">Corresponding Identity Hub *</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        className="w-full bg-white/10 border-b-2 border-white/20 text-white focus:border-primary px-6 py-6 text-2xl font-headline italic outline-none transition-all placeholder:text-white/10"
                        value={correspondingAuthorEmail}
                        onChange={(e) => setCorrespondingAuthorEmail(e.target.value)}
                        placeholder="Primary destination for registry protocols..."
                        required
                      />
                    </div>
                    <p className="mt-8 font-body italic text-white/30 text-xs leading-relaxed max-w-xl">
                      All official editorial decisions, assessment reports, and production protocols will be routed to this specific digital architecture.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Disclosures & Cover Letter */}
            <div className="relative group section-fade-in">
              <div className="absolute -left-16 top-0 opacity-[0.05] font-headline text-8xl font-bold italic select-none hidden lg:block">04</div>
              <div className="space-y-8">
                <h3 className="font-headline text-3xl font-bold border-b border-outline-variant/30 pb-4 tracking-tight">Technical Protocol Ledger</h3>
                <div className="space-y-12">
                  <div className="flex items-start space-x-6 p-10 bg-surface-container-low border-l-8 border-secondary">
                    <ShieldCheck size={32} className="text-secondary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-headline font-bold text-xl mb-2 italic">Institutional Ethical Guidelines</h4>
                      <p className="font-body text-sm text-on-surface-variant leading-relaxed italic opacity-70">
                        By submitting, you confirm this work is original and has not been published elsewhere. All data sources must be credited under the IJSDS sovereign integrity protocol.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="flex items-center space-x-4 cursor-pointer group/check">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-primary border-primary/20 rounded-none focus:ring-primary h-center" 
                        checked={ethicsAgree}
                        onChange={(e) => setEthicsAgree(e.target.checked)}
                      />
                      <span className="text-sm font-label font-bold uppercase tracking-widest text-on-surface/60 group-hover/check:text-primary transition-colors">I confirm no competing financial or personal interests.</span>
                    </label>
                    <label className="flex items-center space-x-4 cursor-pointer group/check">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-primary border-primary/20 rounded-none focus:ring-primary" 
                        checked={feesAgree}
                        onChange={(e) => setFeesAgree(e.target.checked)}
                      />
                      <span className="text-sm font-label font-bold uppercase tracking-widest text-on-surface/60 group-hover/check:text-primary transition-colors transition-all">I acknowledge the Open Access processing fees.</span>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Funding infrastructure & Grant identifiers</label>
                    <textarea 
                      className="w-full bg-surface-container-high border-b-2 border-transparent focus:border-primary px-6 py-6 font-body text-lg italic outline-none transition-all placeholder:opacity-30" 
                      placeholder="e.g. Tertiary Education Trust Fund (TETFund)..." 
                      rows={3}
                      value={fundingInfo}
                      onChange={(e) => setFundingInfo(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="space-y-4">
                    <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Editorial Cover Dossier *</label>
                    <textarea 
                      className="w-full bg-surface-container-high border-b-2 border-transparent focus:border-primary px-6 py-8 font-headline text-2xl italic outline-none transition-all placeholder:opacity-30 min-h-[250px]" 
                      placeholder="Justify the significance and sovereign impact..." 
                      rows={6}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Quote */}
            <div className="py-24 flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="w-16 h-px bg-primary mb-12 opacity-30"></div>
              <blockquote className="font-headline text-4xl italic font-light text-on-surface-variant/80 max-w-2xl leading-snug">
                "The scholarly word is the vessel of our collective future; treat its presentation with the reverence it deserves."
              </blockquote>
              <div className="w-16 h-px bg-primary mt-12 opacity-30"></div>
            </div>

            {/* Final Transmission Control */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-12 pt-24 border-t border-border/20">
               <div className="flex items-center gap-6">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                  <p className="font-label text-[10px] uppercase tracking-[0.5em] text-on-surface/20 italic">Ensuring Scientific Continuity</p>
               </div>

               <div className="flex flex-col sm:flex-row items-center gap-8 w-full sm:w-auto">
                  <button 
                    type="button" 
                    onClick={saveDraft}
                    disabled={autoSaving}
                    className="font-label font-bold text-[10px] uppercase tracking-[0.4em] text-on-surface/40 hover:text-primary transition-all order-2 sm:order-1"
                  >
                    {autoSaving ? 'Vaulting State...' : 'Vault Draft Registry'}
                  </button>
                  
                  <button 
                    onClick={handleSubmit}
                    disabled={loading} 
                    className="w-full sm:w-auto bg-primary text-white py-8 px-16 font-label font-bold text-[10px] uppercase tracking-[0.5em] shadow-xl hover:bg-on-surface transition-all group relative overflow-hidden order-1 sm:order-2"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-6">
                       {loading ? 'Transmitting Data...' : 'Finalize Submission'}
                       <ArrowRight size={16} className="group-hover:translate-x-3 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white translate-x-full group-hover:translate-x-0 transition-transform duration-700 opacity-10"></div>
                  </button>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Accent Elements */}
      <div className="fixed bottom-0 right-0 w-96 h-96 opacity-[0.03] pointer-events-none -mr-48 -mb-48 border-[40px] border-primary rotate-45"></div>
      <div className="fixed top-0 right-0 w-64 h-64 opacity-[0.02] pointer-events-none -mr-32 -mt-32 rounded-full border-[60px] border-secondary"></div>
    </div>
  );
};

export default Submit;