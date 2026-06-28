import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  X,
  Plus,
  ShieldCheck,
  ArrowRight,
  FileText,
  CheckCircle2,
  BookOpen,
  PenTool,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { createSubmission } from "@/lib/submissionService";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/file-management/FileUpload";
import Paystackbtn from "@/components/paystack/paystackFunction";

const VETTING_FEE_LOCAL = 1025400; // ₦10,254 net → grossed up
const PUBLICATION_FEE_LOCAL = 2599100; // ₦25,991 net → grossed up

// Global Tiers (Evaluated in NGN, grossed up to cover Paystack's 3.9% + ₦100 international fee)
const VETTING_FEE_GLOBAL = 1580000; // ₦15,800 (~$10.50 USD value)
const PUBLICATION_FEE_GLOBAL = 3660000; // ₦36,600 (~$25.50 USD value)

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

  // Track Selector State: "local" or "global"
  const [authorTrack, setAuthorTrack] = useState<"local" | "global">("local");
  const [vettingPaid, setVettingPaid] = useState(false);
  const [processingPaid, setProcessingPaid] = useState(false);
  const vettingRef = useRef<string | null>(null);
  const processingRef = useRef<string | null>(null);

  // Checks for ethics/disclosure
  const [ethicsAgree, setEthicsAgree] = useState(false);

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
    authorTrack,
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
        setAuthorTrack(draft.authorTrack || "local");
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
        authorTrack,
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
    const parts = keywordInput
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const unique = parts.filter((p) => !keywords.includes(p));
    if (unique.length > 0) setKeywords([...keywords, ...unique]);
    setKeywordInput("");
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

    if (!vettingPaid || !processingPaid) {
      toast({
        title: "Payment Required",
        description:
          "Please pay both the vetting fee and publication fee before submitting.",
        variant: "destructive",
      });
      document
        .getElementById("payment-section")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (!ethicsAgree) {
      toast({
        title: "Agreement Required",
        description: "Please acknowledge the ethical guidelines.",
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
      const result = await createSubmission({
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

      // Verify both Paystack payments against the live API → writes fee flags to article
      // NOTE: amount is intentionally omitted — the backend reads it directly
      // from Paystack's own verify endpoint to prevent client-side tampering.
      const articleId = result?.article?.id;
      if (articleId) {
        const verifyFee = (
          reference: string | null,
          type: string,
        ) => {
          if (!reference) return Promise.resolve();
          return api
            .post("/api/payment/verify-payment", {
              reference,
              articleId,
              type,
            })
            .catch((err) =>
              console.error(`[payment] ${type} verify failed:`, err),
            );
        };
        await Promise.all([
          verifyFee(vettingRef.current, "vetting"),
          verifyFee(processingRef.current, "processing"),
        ]);
      }

      clearDraft();
      toast({
        title: "Submission Complete",
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
        return ethicsAgree && vettingPaid && processingPaid;
      default:
        return false;
    }
  };

  const fieldClass =
    "w-full bg-stone-100 border-0 focus:ring-0 px-4 py-4 text-sm text-stone-900 placeholder:text-stone-400 focus:bg-stone-200 transition-colors outline-none";
  const labelClass =
    "text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400";

  const steps = [
    { n: "01", label: "Article", done: isStepComplete(1) },
    { n: "02", label: "Manuscript", done: isStepComplete(2) },
    { n: "03", label: "Authors", done: isStepComplete(3) },
    { n: "04", label: "Ethics", done: isStepComplete(4) },
    { n: "05", label: "Fees", done: vettingPaid && processingPaid },
    { n: "06", label: "Letter", done: coverLetter.trim().length > 50 },
  ];

  const abstractWords = abstract.trim()
    ? abstract.trim().split(/\s+/).length
    : 0;

  if (!user) return null;

  const calculatedFees = [
    {
      label: "Manuscript Vetting",
      amount: authorTrack === "local" ? "₦10,000" : "₦15,800 ($10.50 Est.)",
      desc: "Editorial screening and peer-review coordination",
      paid: vettingPaid,
      subunits: authorTrack === "local" ? VETTING_FEE_LOCAL : VETTING_FEE_GLOBAL,
      channels: authorTrack === "local" ? undefined : ["card"],
      feeType: "vetting",
      onPaid: (ref: string) => {
        vettingRef.current = ref;
        setVettingPaid(true);
        toast({ title: "Vetting Fee Paid" });
      },
    },
    {
      label: "Article Publication",
      amount: authorTrack === "local" ? "₦25,500" : "₦36,600 ($25.50 Est.)",
      desc: "Production, typesetting, and open-access hosting",
      paid: processingPaid,
      subunits: authorTrack === "local" ? PUBLICATION_FEE_LOCAL : PUBLICATION_FEE_GLOBAL,
      channels: authorTrack === "local" ? undefined : ["card"],
      feeType: "publication",
      onPaid: (ref: string) => {
        processingRef.current = ref;
        setProcessingPaid(true);
        toast({ title: "Publication Fee Paid" });
      },
    },
  ];

  return (
    <div className="bg-[#fdf9f5] text-[#1c1c19] font-body min-h-screen pb-32">
      <Helmet>
        <title>Submit Manuscript — IJSDS</title>
      </Helmet>

      {/* Payment banner */}
      {(!vettingPaid || !processingPaid) && (
        <div className="sticky top-0 z-40 bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-2 shrink-0">
              <AlertCircle size={13} className="text-amber-600 shrink-0" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-800">
                Payment required
              </span>
            </div>
            <p className="text-[11px] text-amber-700 flex-1">
              Both fees must be paid before submitting. Track:{" "}
              <strong className="uppercase">{authorTrack}</strong>
              {vettingPaid && " — Vetting paid."}
              {processingPaid && " — Publication paid."}
            </p>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("payment-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-[9px] font-bold uppercase tracking-widest text-amber-900 underline underline-offset-2 shrink-0"
            >
              Pay now →
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-10 pb-32">
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary mb-3">
              Manuscript Submission
            </p>
            <h2 className="font-headline text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
              Submit Your Research
            </h2>
          </div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
            {autoSaving && <span className="text-primary">Saving…</span>}
            {lastSaved && !autoSaving && (
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
        </header>

        {/* Step progress */}
        <div className="mb-12 overflow-x-auto -mx-6 px-6">
          <div className="flex gap-0 min-w-max">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${s.done ? "text-emerald-700 bg-emerald-50" : "text-stone-400 bg-stone-100"}`}
                >
                  {s.done ? (
                    <CheckCircle2
                      size={11}
                      className="text-emerald-500 shrink-0"
                    />
                  ) : (
                    <span className="opacity-50">{s.n}</span>
                  )}
                  <span>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px h-9 bg-stone-200 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* ── 01 Article Details ── */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
            <div className="md:col-span-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary mb-1">
                01
              </p>
              <h3 className="font-headline text-lg font-black text-stone-900">
                Article Details
              </h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Core metadata used for indexing and review.
              </p>
            </div>
            <div className="md:col-span-9 space-y-6">
              <div className="space-y-1.5">
                <label className={labelClass}>Manuscript Title *</label>
                <input
                  className={fieldClass + " font-headline text-lg italic"}
                  placeholder="Enter full scholarly title..."
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Abstract *</label>
                  <span
                    className={`text-[9px] font-bold tabular-nums ${abstractWords > 300 ? "text-red-500" : "text-stone-400"}`}
                  >
                    {abstractWords}/300 words
                  </span>
                </div>
                <textarea
                  className={fieldClass + " min-h-[160px] leading-relaxed"}
                  placeholder="Summarize research goals, methodology, and findings…"
                  rows={6}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className={labelClass}>Primary Topic</label>
                  <select
                    className={fieldClass}
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
                <div className="space-y-1.5">
                  <label className={labelClass}>Keywords</label>
                  <div className="flex gap-2">
                    <input
                      className={fieldClass + " flex-1"}
                      placeholder="Add keywords, separate with commas"
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addKeyword())
                      }
                    />
                    <button
                      type="button"
                      onClick={() => addKeyword()}
                      className="bg-primary hover:bg-[#8f3514] text-white px-4 transition-colors shrink-0"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-2.5 py-1"
                        >
                          {kw}
                          <button
                            type="button"
                            onClick={() => removeKeyword(i)}
                          >
                            <X size={9} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-stone-200" />

          {/* ── 02 Manuscript File ── */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
            <div className="md:col-span-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary mb-1">
                02
              </p>
              <h3 className="font-headline text-lg font-black text-stone-900">
                Manuscript File
              </h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                .doc, .docx, or .pdf — max 25 MB.
              </p>
            </div>
            <div className="md:col-span-9">
              <FileUpload
                bucketName="journal-website-db1"
                folder="manuscripts"
                autoUpload={false}
                onFileUploaded={(file) => {
                  if (file instanceof File) {
                    setManuscriptFile(file);
                    setManuscriptFileUrl(file.name);
                  } else setManuscriptFileUrl(file);
                }}
                acceptedTypes=".doc,.docx,.pdf"
                maxSizeMB={25}
              />
              {manuscriptFileUrl && (
                <div className="mt-3 bg-stone-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-bold truncate max-w-[200px] sm:max-w-sm">
                        {manuscriptFile
                          ? manuscriptFile.name
                          : manuscriptFileUrl.split("/").pop()}
                      </p>
                      <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">
                        Ready to submit
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setManuscriptFileUrl("");
                      setManuscriptFile(null);
                    }}
                    className="text-stone-400 hover:text-red-500 transition-colors ml-4"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="h-px bg-stone-200" />

          {/* ── 03 Authors ── */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
            <div className="md:col-span-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary mb-1">
                03
              </p>
              <h3 className="font-headline text-lg font-black text-stone-900">
                Authors
              </h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                All contributors and their affiliations.
              </p>
            </div>
            <div className="md:col-span-9 space-y-8">
              {authors.map((author, index) => (
                <div
                  key={index}
                  className="space-y-4 pt-6 border-t border-stone-100 first:border-0 first:pt-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">
                      Author {index + 1}
                    </span>
                    {authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAuthor(index)}
                        className="text-[9px] font-bold uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Full Name *</label>
                      <input
                        className={fieldClass}
                        type="text"
                        value={author.name}
                        onChange={(e) =>
                          updateAuthor(index, "name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Email *</label>
                      <input
                        className={fieldClass}
                        type="email"
                        value={author.email}
                        onChange={(e) =>
                          updateAuthor(index, "email", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        Institutional Affiliation
                      </label>
                      <input
                        className={fieldClass}
                        type="text"
                        value={author.affiliation}
                        onChange={(e) =>
                          updateAuthor(index, "affiliation", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>ORCID iD</label>
                      <input
                        className={fieldClass}
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
                type="button"
                onClick={addAuthor}
                className="w-full py-4 border border-dashed border-stone-300 text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={13} /> Add Another Author
              </button>
            </div>
          </section>

          <div className="h-px bg-stone-200" />

          {/* ── 04 Corresponding Author & Ethics ── */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
            <div className="md:col-span-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary mb-1">
                04
              </p>
              <h3 className="font-headline text-lg font-black text-stone-900">
                Ethics & Contact
              </h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Disclosures and correspondence details.
              </p>
            </div>
            <div className="md:col-span-9 space-y-6">
              <div className="space-y-1.5">
                <label className={labelClass}>
                  Corresponding Author Email *
                </label>
                <div className="flex items-center gap-3 bg-stone-100 px-4">
                  <ShieldCheck size={14} className="text-primary shrink-0" />
                  <input
                    className="flex-1 bg-transparent border-0 focus:ring-0 py-4 text-sm text-stone-900 placeholder:text-stone-400 outline-none"
                    placeholder="Primary editorial contact email"
                    type="email"
                    value={correspondingAuthorEmail}
                    onChange={(e) =>
                      setCorrespondingAuthorEmail(e.target.value)
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Funding & Ethics Statement</label>
                <textarea
                  className={fieldClass}
                  placeholder="Declare any funding sources or ethics committee approvals…"
                  rows={3}
                  value={fundingInfo}
                  onChange={(e) => setFundingInfo(e.target.value)}
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  className="w-4 h-4 mt-0.5 border border-stone-300 text-primary focus:ring-primary/20 rounded-none transition-all shrink-0"
                  type="checkbox"
                  checked={ethicsAgree}
                  onChange={(e) => setEthicsAgree(e.target.checked)}
                />
                <span className="text-sm text-stone-500 group-hover:text-stone-800 transition-colors leading-relaxed">
                  I confirm there are no competing financial or personal
                  interests that could influence this work.
                </span>
              </label>
            </div>
          </section>

          <div className="h-px bg-stone-200" />

          {/* ── 05 Publication Fees ── */}
          <section
            id="payment-section"
            className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10"
          >
            <div className="md:col-span-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary mb-1">
                05
              </p>
              <h3 className="font-headline text-lg font-black text-stone-900">
                Publication Fees
              </h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Processed securely via Paystack. Select appropriate billing criteria below.
              </p>

              <div className="mt-5 space-y-2">
                <label className={labelClass}>Author Region</label>
                <div className="flex bg-stone-100 p-1 rounded border border-stone-200 max-w-[220px]">
                  <button
                    type="button"
                    disabled={vettingPaid || processingPaid}
                    onClick={() => setAuthorTrack("local")}
                    className={`flex-1 text-center py-2 text-[9px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${authorTrack === "local" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
                  >
                    🇳🇬 Local Account
                  </button>
                  <button
                    type="button"
                    disabled={vettingPaid || processingPaid}
                    onClick={() => setAuthorTrack("global")}
                    className={`flex-1 text-center py-2 text-[9px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${authorTrack === "global" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
                  >
                    🌐 Global Card
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <p className={labelClass}>Total due</p>
                <p className="font-headline text-2xl font-black text-stone-900 mt-1">
                  {authorTrack === "local" ? "₦35,500" : "₦52,400"}
                </p>
              </div>
            </div>

            <div className="md:col-span-9 space-y-3">
              {calculatedFees.map((fee) => (
                <div
                  key={fee.feeType}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 transition-colors ${fee.paid ? "bg-emerald-50" : "bg-stone-100"}`}
                >
                  <div className="flex-1 min-w-0 flex items-start gap-3">
                    {fee.paid ? (
                      <CheckCircle2
                        size={15}
                        className="text-emerald-500 mt-0.5 shrink-0"
                      />
                    ) : (
                      <div className="w-3.5 h-3.5 mt-0.5 rounded-full border-2 border-stone-300 shrink-0" />
                    )}
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">
                        {fee.label}
                      </p>
                      <p className="font-headline text-lg font-black text-stone-900">
                        {fee.amount}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {fee.desc}
                      </p>
                    </div>
                  </div>
                  {fee.paid ? (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-2 shrink-0">
                      <CheckCircle2 size={11} /> Paid
                    </span>
                  ) : (
                    <Paystackbtn
                      info={{
                        email: user!.email,
                        amount: fee.subunits,
                        channels: fee.channels,
                        metadata: {
                          custom_fields: [
                            {
                              display_name: "Fee Type",
                              variable_name: "fee_type",
                              value: fee.feeType,
                            },
                            {
                              display_name: "Submitter",
                              variable_name: "submitter_id",
                              value: user!.id,
                            },
                            {
                              display_name: "Billing Track",
                              variable_name: "billing_track",
                              value: authorTrack,
                            },
                          ],
                        },
                        onSuccess: (res) => fee.onPaid(res.reference),
                        onClose: () => {},
                      }}
                    />
                  )}
                </div>
              ))}
              {vettingPaid && processingPaid && (
                <div className="flex items-center gap-2.5 px-5 py-3 bg-emerald-50">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-600 shrink-0"
                  />
                  <p className="text-sm font-bold text-emerald-800">
                    All fees paid — submission is unlocked.
                  </p>
                </div>
              )}
            </div>
          </section>

          <div className="h-px bg-stone-200" />

          {/* ── 06 Cover Letter ── */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
            <div className="md:col-span-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary mb-1">
                06
              </p>
              <h3 className="font-headline text-lg font-black text-stone-900">
                Cover Letter
              </h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Contextualize your research for the editorial board.
              </p>
            </div>
            <div className="md:col-span-9 space-y-1.5">
              <label className={labelClass}>Letter to the Editor *</label>
              <textarea
                className={fieldClass + " min-h-[220px] leading-relaxed italic"}
                placeholder="Describe the significance of your research, why it is suited to IJSDS, and any relevant context the editors should know…"
                rows={9}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                required
              />
            </div>
          </section>
        </form>
      </div>

      {/* Sticky footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#fdf9f5]/95 backdrop-blur-sm border-t border-stone-200 flex items-center justify-between px-4 sm:px-8 z-50 h-20">
        <div className="hidden sm:flex items-center gap-3">
          <BookOpen size={14} className="text-stone-300" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
            {autoSaving
              ? "Saving…"
              : lastSaved
                ? `Saved ${lastSaved.toLocaleTimeString()}`
                : "IJSDS Submission Portal"}
          </span>
        </div>
        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={saveDraft}
            disabled={autoSaving}
            className="text-[9px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !vettingPaid || !processingPaid}
            title={
              !vettingPaid || !processingPaid
                ? "Pay both fees to unlock"
                : undefined
            }
            className="bg-primary hover:bg-[#8f3514] text-white px-8 py-4 font-bold uppercase tracking-[0.2em] text-xs transition-colors flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting…" : "Submit Article"}
            {!loading && <ArrowRight size={15} />}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Submit;
