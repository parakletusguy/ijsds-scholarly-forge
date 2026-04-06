import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  X,
  Plus,
  ShieldCheck,
  CloudUpload,
  ArrowRight,
  FileText,
  CheckCircle2,
  BookOpen,
  PenTool,
} from "lucide-react";
import { createSubmission } from "@/lib/submissionService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/file-management/FileUpload";

interface Author {
  name: string;
  email: string;
  affiliation: string;
  orcid?: string;
}

export const Submit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [authors, setAuthors] = useState<Author[]>([
    { name: "", email: user?.email || "", affiliation: "", orcid: "" },
  ]);
  const [correspondingAuthorEmail, setCorrespondingAuthorEmail] = useState(
    user?.email || "",
  );
  const [subjectArea, setSubjectArea] = useState("Sustainable Architecture");
  const [fundingInfo, setFundingInfo] = useState("");
  const [conflictsOfInterest, setConflictsOfInterest] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [manuscriptFileUrl, setManuscriptFileUrl] = useState("");
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
  }, [
    title,
    abstract,
    keywords,
    authors,
    correspondingAuthorEmail,
    subjectArea,
    fundingInfo,
    conflictsOfInterest,
    coverLetter,
    manuscriptFileUrl,
    user,
  ]);

  const loadDraft = async () => {
    try {
      const savedData = localStorage.getItem(`article_draft_${user?.id}`);
      if (savedData) {
        const draft = JSON.parse(savedData);
        setTitle(draft.title || "");
        setAbstract(draft.abstract || "");
        setKeywords(draft.keywords || []);
        setAuthors(
          draft.authors || [
            { name: "", email: user?.email || "", affiliation: "", orcid: "" },
          ],
        );
        setCorrespondingAuthorEmail(
          draft.correspondingAuthorEmail || user?.email || "",
        );
        setSubjectArea(draft.subjectArea || "Sustainable Architecture");
        setFundingInfo(draft.fundingInfo || "");
        setConflictsOfInterest(draft.conflictsOfInterest || "");
        setCoverLetter(draft.coverLetter || "");
        setManuscriptFileUrl(draft.manuscriptFileUrl || "");
        setDraftId(draft.draftId || null);
        setLastSaved(draft.lastSaved ? new Date(draft.lastSaved) : null);
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
  };

  const saveDraft = async () => {
    if (!user || autoSaving) return;
    setAutoSaving(true);
    try {
      const draftData = {
        title,
        abstract,
        keywords,
        authors,
        correspondingAuthorEmail,
        subjectArea,
        fundingInfo,
        conflictsOfInterest,
        coverLetter,
        manuscriptFileUrl,
        draftId,
        lastSaved: new Date().toISOString(),
        userId: user.id,
      };
      localStorage.setItem(
        `article_draft_${user.id}`,
        JSON.stringify(draftData),
      );
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setAutoSaving(false);
    }
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
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) =>
    setKeywords(keywords.filter((_, i) => i !== index));
  const addAuthor = () =>
    setAuthors([
      ...authors,
      { name: "", email: "", affiliation: "", orcid: "" },
    ]);
  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    setAuthors(
      authors.map((author, i) =>
        i === index ? { ...author, [field]: value } : author,
      ),
    );
  };
  const removeAuthor = (index: number) => {
    if (authors.length > 1) setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Auth Required", variant: "destructive" });
      return;
    }

    if (!ethicsAgree || !feesAgree) {
      toast({
        title: "Agreement Required",
        description:
          "Please acknowledge the ethical guidelines and processing fees.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !abstract.trim() || !manuscriptFileUrl) {
      toast({
        title: "Validation Failed",
        description: "Title, Abstract, and Manuscript are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await saveDraft();
      await createSubmission({
        title: title.trim(),
        abstract: abstract.trim(),
        keywords,
        authors,
        corresponding_author_email: correspondingAuthorEmail,
        subject_area: subjectArea,
        cover_letter: coverLetter,
        reviewer_suggestions: "",
        submission_type: "new",
        funding_info: fundingInfo || null,
        conflicts_of_interest: conflictsOfInterest || null,
        file: manuscriptFile || undefined,
      });
      clearDraft();
      toast({
        title: "Success",
        description: "Manuscript submitted for evaluation.",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return title && abstract && keywords.length > 0;
      case 2:
        return !!manuscriptFile || !!manuscriptFileUrl;
      case 3:
        return authors.every((a) => a.name && a.email && a.affiliation);
      case 4:
        return ethicsAgree && feesAgree;
      default:
        return false;
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#fdf9f5] text-[#1c1c19] font-body min-h-screen pb-32">
      <Helmet>
        <title>Heritage & Horizon | IJSDS Article Submission Portal</title>
      </Helmet>

      {/* Content Area */}
      <div className="pt-12 pb-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto w-full">
        <header className="mb-16">
          <span className="text-[10px] font-bold text-primary-container tracking-[0.2em] uppercase">
            V4.2 Registry Protocol
          </span>
          <h2 className="font-headline text-5xl font-bold text-on-surface mt-4 mb-2 tracking-tight">
            Article Submission Portal
          </h2>
          <div className="w-24 h-1 bg-primary mb-8"></div>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed italic">
            Submit your manuscript to the International Journal of Social Work
            and Development Studies. Ensure all metadata aligns with our
            editorial standards for advancing social work discourse.
          </p>

          <div className="mt-8 flex items-center gap-6">
            {autoSaving && (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-label uppercase tracking-widest text-on-surface/40 italic">
                  Vaulting Meta-Data...
                </span>
              </div>
            )}
            {lastSaved && !autoSaving && (
              <span className="text-[10px] font-label uppercase tracking-widest text-secondary font-bold">
                Registry Secured: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-24">
          {/* Section 1: Article Details */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <h3 className="font-headline text-2xl font-bold text-on-surface">
                Article Details
              </h3>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                Fundamental bibliometric data for indexing and taxonomy.
              </p>
            </div>
            <div className="md:col-span-8 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                  Manuscript Title *
                </label>
                <input
                  className="w-full bg-surface-container-high border-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-4 font-headline text-xl italic placeholder:text-stone-400 transition-all"
                  placeholder="Enter full scholarly title..."
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                  Abstract *
                </label>
                <textarea
                  className="w-full bg-surface-container-high border-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-4 text-sm leading-relaxed min-h-[200px]"
                  placeholder="Maximum 300 words summarizing research goals, methodology, and findings..."
                  rows={6}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Primary Topic
                  </label>
                  <select
                    className="w-full bg-surface-container-high border-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-4 text-sm"
                    value={subjectArea}
                    onChange={(e) => setSubjectArea(e.target.value)}
                  >
                    <option>Sustainable Architecture</option>
                    <option>Digital Heritage</option>
                    <option>Urban Ecology</option>
                    <option>Social Development</option>
                    <option>Community Welfare</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Theoretical Keywords
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-surface-container-high border-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-4 text-sm"
                      placeholder="e.g. Urbanism"
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addKeyword())
                      }
                    />
                    <Button
                      type="button"
                      onClick={() => addKeyword()}
                      className="bg-primary hover:bg-[#8f3514] text-white px-4 h-auto"
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="bg-surface-container-highest text-primary font-bold text-[9px] uppercase tracking-widest px-3 py-1 flex items-center gap-2"
                      >
                        {kw}
                        <X
                          size={10}
                          className="cursor-pointer hover:text-black"
                          onClick={() => removeKeyword(i)}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Manuscript Files */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 bg-surface-container-low p-8 md:p-12">
            <div className="md:col-span-4">
              <h3 className="font-headline text-2xl font-bold text-on-surface">
                Manuscript Files
              </h3>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                Deposit the primary textual artifact and supporting datasets.
              </p>
            </div>
            <div className="md:col-span-8">
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
              {manuscriptFileUrl && (
                <div className="mt-4 bg-white p-4 flex items-center justify-between border-l-4 border-primary shadow-sm">
                  <div className="flex items-center space-x-4">
                    <FileText size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-bold truncate max-w-[200px] md:max-w-md">
                        {manuscriptFile
                          ? manuscriptFile.name
                          : manuscriptFileUrl.split("/").pop()}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                        Payload Secured
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setManuscriptFileUrl("");
                      setManuscriptFile(null);
                    }}
                    className="text-stone-300 hover:text-error transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Author Registry */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <h3 className="font-headline text-2xl font-bold text-on-surface">
                Author Registry
              </h3>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                Formal identification of the primary intellectual architect.
              </p>
            </div>
            <div className="md:col-span-8 space-y-12">
              {authors.map((author, index) => (
                <div
                  key={index}
                  className="space-y-6 relative border-t border-outline-variant/20 pt-8 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-xl font-bold italic opacity-30">
                      0{index + 1}
                    </span>
                    {authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAuthor(index)}
                        className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-error transition-colors"
                      >
                        Discard Profile
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                        Full Name *
                      </label>
                      <input
                        className="w-full bg-surface-container-high border-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-4 text-sm"
                        type="text"
                        value={author.name}
                        onChange={(e) =>
                          updateAuthor(index, "name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                        Email Address *
                      </label>
                      <input
                        className="w-full bg-surface-container-high border-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-4 text-sm"
                        type="email"
                        value={author.email}
                        onChange={(e) =>
                          updateAuthor(index, "email", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                        Institutional Affiliation
                      </label>
                      <input
                        className="w-full bg-surface-container-high border-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-4 text-sm"
                        type="text"
                        value={author.affiliation}
                        onChange={(e) =>
                          updateAuthor(index, "affiliation", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                        ORCID Digital iD
                      </label>
                      <input
                        className="w-full bg-surface-container-high border-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-4 text-sm"
                        placeholder="0000-0000-0000-0000"
                        type="text"
                        value={author.orcid}
                        onChange={(e) =>
                          updateAuthor(index, "orcid", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="w-full py-6 border-2 border-dashed border-outline-variant/30 text-[#af4c2a] font-bold text-xs uppercase tracking-[0.2em] hover:bg-surface-container-low transition-all flex items-center justify-center space-x-2"
                type="button"
                onClick={addAuthor}
              >
                <Plus size={16} />
                <span>Adjoin Contributor Profile</span>
              </button>
            </div>
          </section>

          {/* Section 4: Corresponding Identity Hub */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 border-l-4 border-primary pl-8">
            <div className="md:col-span-4">
              <h3 className="font-headline text-2xl font-bold text-on-surface">
                Corresponding Identity Hub
              </h3>
            </div>
            <div className="md:col-span-8 space-y-4">
              <input
                className="w-full bg-surface-container-lowest border-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-6 font-headline text-xl italic"
                placeholder="Identify the primary contact email..."
                type="email"
                value={correspondingAuthorEmail}
                onChange={(e) => setCorrespondingAuthorEmail(e.target.value)}
                required
              />
              <div className="flex items-start space-x-3 bg-primary-container/10 p-4">
                <ShieldCheck className="text-primary mt-1" size={18} />
                <p className="text-xs italic text-on-surface-variant leading-relaxed">
                  All official editorial decisions, assessment reports, and
                  production protocols will be routed to this specific digital
                  architecture.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Technical Protocol Ledger */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <h3 className="font-headline text-2xl font-bold text-on-surface">
                Technical Protocol Ledger
              </h3>
            </div>
            <div className="md:col-span-8 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                  Funding infrastructure & Grant identifiers
                </label>
                <textarea
                  className="w-full bg-surface-container-high border-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-4 text-sm"
                  placeholder="Specify ethics committee approval or exemption..."
                  rows={3}
                  value={fundingInfo}
                  onChange={(e) => setFundingInfo(e.target.value)}
                ></textarea>
              </div>
              <div className="space-y-4 pt-4">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    className="w-5 h-5 border-2 border-outline text-primary focus:ring-primary-container rounded-none transition-all"
                    type="checkbox"
                    checked={ethicsAgree}
                    onChange={(e) => setEthicsAgree(e.target.checked)}
                  />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                    I confirm no competing financial or personal interests
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    className="w-5 h-5 border-2 border-outline text-primary focus:ring-primary-container rounded-none transition-all"
                    type="checkbox"
                    checked={feesAgree}
                    onChange={(e) => setFeesAgree(e.target.checked)}
                  />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                    I acknowledge the Open Access processing fees
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* Section 6: Editorial Cover Dossier */}
          <section className="pb-12 border-t border-[#ddc0b8]/20 pt-24 text-center">
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="space-y-4">
                <h3 className="font-headline text-3xl font-bold text-on-surface">
                  Editorial Cover Dossier
                </h3>
                <div className="flex justify-center items-center space-x-4 opacity-30">
                  <div className="h-[1px] w-12 bg-primary"></div>
                  <PenTool className="text-primary" size={20} />
                  <div className="h-[1px] w-12 bg-primary"></div>
                </div>
              </div>

              {/* Pull Quote Pattern */}
              <div className="py-4">
                <div className="flex items-center justify-between opacity-30 px-12 md:px-20">
                  <div className="h-[1px] w-1/5 bg-primary"></div>
                  <div className="h-[1px] w-1/5 bg-primary"></div>
                </div>
                <blockquote className="font-headline text-xl italic text-on-surface leading-relaxed my-6 px-12">
                  "The scholarly word is the vessel of our collective future;
                  treat its presentation with the reverence it deserves."
                </blockquote>
                <div className="flex items-center justify-between opacity-30 px-12 md:px-20">
                  <div className="h-[1px] w-1/5 bg-primary"></div>
                  <div className="h-[1px] w-1/5 bg-primary"></div>
                </div>
              </div>

              <div className="space-y-2 text-left mt-8">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                  Letter to the Editor *
                </label>
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary focus:ring-0 px-6 py-6 text-sm italic leading-relaxed shadow-sm min-h-[250px]"
                  placeholder="Contextualize your research for the editorial board..."
                  rows={8}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
          </section>
        </form>
      </div>

      {/* Sticky Footer for Actions */}
      <footer className="fixed bottom-0 left-0 right-0 md:left-72 bg-[#fdf9f5]/95 backdrop-blur-sm border-t border-[#ddc0b8]/20 h-24 flex items-center justify-between px-6 md:px-12 z-50 transition-all duration-300">
        <div className="hidden sm:flex items-center space-x-4">
          <BookOpen size={16} className="text-stone-400" />
          <p className="text-[10px] text-stone-500 uppercase tracking-widest">
            {autoSaving
              ? "Vaulting State..."
              : lastSaved
                ? `Saved ${lastSaved.toLocaleTimeString()}`
                : "Ready for registry"}
          </p>
        </div>
        <div className="flex items-center space-x-4 md:space-x-8 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={saveDraft}
            disabled={autoSaving}
            className="text-on-surface/60 font-bold uppercase tracking-wider text-[10px] hover:text-primary transition-colors py-2 px-4"
          >
            Vault Draft Registry
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#af4c2a] text-white px-6 md:px-10 py-4 font-bold uppercase tracking-wider text-xs md:text-sm hover:bg-[#8f3514] transition-all flex items-center space-x-3 shadow-lg disabled:opacity-50"
          >
            <span>{loading ? "Transmitting..." : "Finalize Submission"}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Submit;
