import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getSubmissions, type Submission } from "@/lib/submissionService";
import { createEditorialDecision } from "@/lib/editorialService";
import { updateArticle } from "@/lib/articleService";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Users,
  Clock,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  Activity,
  Database,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PaperDownload } from "@/components/papers/PaperDownload";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { RejectSubmissionDialog } from "@/components/editor/RejectSubmissionDialog";
import { ApproveSubmissionDialog } from "@/components/editor/ApproveSubmissionDialog";
import { ReviewerInvitationDialog } from "@/components/editor/ReviewerInvitationDialog";
import { RevisionRequestDialog } from "@/components/editor/RevisionRequestDialog";
import { useNavigate } from "react-router-dom";
import { PageHeader, ContentSection } from "@/components/layout/PageElements";

export const Editorial = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isEditor = !!(profile?.is_editor || profile?.is_admin);

  useEffect(() => {
    if (!loading && !user) { navigate("/auth"); return; }
    if (!loading && user && !isEditor) {
      toast({ title: "Access Denied", description: "Institutional credentials required.", variant: "destructive" });
      navigate("/dashboard"); return;
    }
    if (user && isEditor) fetchSubmissions();
  }, [user, profile, loading, navigate]);

  const fetchSubmissions = async () => {
    try {
      const data = await getSubmissions();
      setSubmissions(data || []);
    } catch (error: any) {
      toast({ title: "Sync Error", description: error.message || "Failed to fetch editorial records.", variant: "destructive" });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const updateDOIVersion = async (submissionId: string, articleDoi: string) => {
    try {
      const data = await api.post<any>("/api/doi/generate", { submissionId, existingDoi: articleDoi });
      if (data.success) {
        toast({ title: "Registry Updated", description: `DOI synchronized: ${data.data?.doi}` });
        fetchSubmissions();
      } else throw new Error("Registry rejection");
    } catch (error: any) {
      toast({ title: "DOI Error", description: error.message || "Failed to update registry.", variant: "destructive" });
    }
  };

  const startReviewCycle = async (submission: Submission) => {
    try {
      setProcessingId(submission.id);
      await createEditorialDecision({ submission_id: submission.id, decision_type: "send_for_review" });
      await updateArticle(submission.article_id, { status: "under_review" });
      toast({ title: "Review Started", description: "Submission moved to Active Evaluation." });
      setActiveTab("review");
      fetchSubmissions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to start review cycle.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || !isEditor) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pendingSubmissions = submissions.filter(s => s.status === "submitted");
  const underReviewSubmissions = submissions.filter(s => s.status === "under_review");
  const revisionSubmissions = submissions.filter(s => s.status === "revision_requested");
  const completedSubmissions = submissions.filter(s => ["accepted", "rejected", "desk_rejected"].includes(s.status));

  // Collect unique subject areas — skip entries that look like article titles (>60 chars)
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach(s => {
      const area = (s.article as any)?.subject_area;
      if (area && area.length <= 60) set.add(area);
    });
    return Array.from(set).sort();
  }, [submissions]);

  const applyFilters = (list: Submission[]) => {
    return list.filter(s => {
      const art = (s.article as any) || {};
      const matchesSearch = !searchQuery ||
        art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.submitter?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = subjectFilter === "all" || art.subject_area === subjectFilter;
      return matchesSearch && matchesSubject;
    });
  };

  const FilterBar = ({ list }: { list: Submission[] }) => (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input
          placeholder="Search by title or author..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-sm rounded-none border-stone-200 focus-visible:ring-primary"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
            <X size={12} />
          </button>
        )}
      </div>
      <select
        value={subjectFilter}
        onChange={e => setSubjectFilter(e.target.value)}
        className="h-9 border border-stone-200 text-xs font-medium px-3 bg-white text-stone-600 focus:outline-none focus:border-primary"
      >
        <option value="all">All Subject Areas</option>
        {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      {(searchQuery || subjectFilter !== "all") && (
        <button onClick={() => { setSearchQuery(""); setSubjectFilter("all"); }}
          className="text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-70 px-2">
          Clear
        </button>
      )}
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 self-center shrink-0">
        {applyFilters(list).length} / {list.length}
      </span>
    </div>
  );

  const SubmissionRow = ({ submission, tab }: { submission: Submission; tab: string }) => {
    const art = (submission.article as any) || {};
    const isExpanded = expandedId === submission.id;
    const toggle = () => setExpandedId(isExpanded ? null : submission.id);

    const borderColor =
      tab === "pending" ? "border-l-primary" :
      tab === "review" ? "border-l-amber-400" :
      tab === "revision" ? "border-l-orange-400" :
      submission.status === "accepted" ? "border-l-green-500" : "border-l-stone-300";

    return (
      <div className={`bg-white border border-stone-100 border-l-4 ${borderColor} transition-all`}>
        {/* Compact header row */}
        <div
          className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-stone-50/60"
          onClick={toggle}
        >
          {/* Title takes as much space as possible */}
          <h3 className="flex-1 min-w-0 text-sm font-semibold text-stone-900 truncate leading-tight">
            {art.title || "Untitled"}
          </h3>

          {/* Right side: minimal, fixed-width metadata */}
          <div className="hidden sm:flex items-center gap-3 shrink-0 ml-2">
            <span className="text-[9px] text-stone-400 tabular-nums shrink-0">
              {new Date(submission.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
            <PaymentStatusBadge
              vettingFee={!!art.vetting_fee}
              processingFee={!!art.processing_fee}
              showLabels={false}
            />
          </div>
          {isExpanded ? <ChevronUp size={13} className="text-stone-300 shrink-0" /> : <ChevronDown size={13} className="text-stone-300 shrink-0" />}
        </div>

        {/* Expanded detail */}
        {isExpanded && (
          <div className="border-t border-stone-100 px-4 py-4 space-y-4 bg-stone-50/40">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Submitted By</p>
                <p className="font-medium text-stone-700">{submission.submitter?.full_name || "—"}</p>
                <p className="text-stone-400">{submission.submitter?.email || ""}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Subject Area</p>
                <p className="font-medium text-stone-700">{art.subject_area || "—"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Payment Status</p>
                <PaymentStatusBadge vettingFee={!!art.vetting_fee} processingFee={!!art.processing_fee} showLabels={true} />
              </div>
            </div>

            {art.abstract && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Abstract</p>
                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 italic">{art.abstract}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
              {tab === "pending" && (
                <>
                  <Button size="sm" disabled={processingId === submission.id}
                    onClick={() => startReviewCycle(submission)}
                    className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary text-white hover:bg-stone-900 rounded-none gap-1.5">
                    {processingId === submission.id ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    Start Review
                  </Button>
                  <ReviewerInvitationDialog submissionId={submission.id} submissionTitle={art.title} onInvite={fetchSubmissions} submission={submission} />
                  <PaperDownload manuscriptFileUrl={art.manuscript_file_url} title={art.title} />
                  <Button size="sm" variant="outline" onClick={() => navigate(`/submission/${submission.id}/details`)}
                    className="h-8 text-[10px] rounded-none border-stone-200 hover:border-primary">
                    View Dossier
                  </Button>
                  <div className="ml-auto">
                    <RejectSubmissionDialog submissionId={submission.id} articleId={submission.article_id} onReject={fetchSubmissions} />
                  </div>
                </>
              )}
              {tab === "review" && (
                <>
                  <ApproveSubmissionDialog submissionId={submission.id} onApprove={fetchSubmissions} articleId={submission.article_id} />
                  <RevisionRequestDialog submissionId={submission.id} submissionTitle={art.title || ""} authorEmail={art.corresponding_author_email || ""} authorName={submission.submitter?.full_name || ""} onRequest={fetchSubmissions} />
                  <RejectSubmissionDialog submissionId={submission.id} articleId={submission.article_id} onReject={fetchSubmissions} />
                  <Button size="sm" variant="outline" onClick={() => navigate(`/submission/${submission.id}/reviews`)}
                    className="h-8 text-[10px] rounded-none border-stone-200 hover:border-primary">
                    Audit Reviews
                  </Button>
                  {art.doi && (
                    <Button size="sm" variant="ghost" onClick={() => updateDOIVersion(submission.id, art.doi)}
                      className="h-8 text-[9px] rounded-none text-primary gap-1.5 hover:bg-primary/5 ml-auto">
                      <RefreshCw size={11} /> Regen DOI
                    </Button>
                  )}
                </>
              )}
              {tab === "revision" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/submission/${submission.id}/details`)}
                    className="h-8 text-[10px] rounded-none border-stone-200 hover:border-primary">
                    View Dossier
                  </Button>
                  <PaperDownload manuscriptFileUrl={art.manuscript_file_url} title={art.title} />
                </>
              )}
              {tab === "completed" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/submission/${submission.id}/details`)}
                    className="h-8 text-[10px] rounded-none border-stone-200 hover:border-primary">
                    Registry Details
                  </Button>
                  <PaperDownload manuscriptFileUrl={art.manuscript_file_url} title={art.title} />
                  {submission.status === "accepted" && art.doi && (
                    <Button size="sm" variant="ghost" onClick={() => updateDOIVersion(submission.id, art.doi)}
                      className="h-8 text-[9px] rounded-none text-primary gap-1.5 hover:bg-primary/5 ml-auto">
                      <RefreshCw size={11} /> Sync Registry
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="py-16 text-center text-stone-400 text-xs font-bold uppercase tracking-widest border border-dashed border-stone-200">
      {message}
    </div>
  );

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader
        title="Curation Hub"
        subtitle="Editorial Oversight"
        accent="Volume 2026 Management"
        description="Oversee peer evaluation, manage decision workflows, and curate the scholarly record."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <Button onClick={() => navigate(-1)} variant="outline"
            className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 h-10 border-primary/20 hover:border-primary">
            <ArrowLeft className="h-4 w-4" /> Exit Command Hub
          </Button>
          <div className="flex items-center gap-3 bg-white/50 px-4 py-2 border border-border/20">
            <ShieldAlert size={14} className="text-secondary" />
            <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">
              Authorized Editorial Access
            </span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-stone-100 border border-stone-100 mb-8">
          {[
            { label: "Total", val: submissions.length, icon: <Database size={14} />, accent: "text-primary" },
            { label: "Pending", val: pendingSubmissions.length, icon: <Clock size={14} />, accent: "text-stone-900" },
            { label: "In Review", val: underReviewSubmissions.length, icon: <Users size={14} />, accent: "text-amber-600" },
            { label: "Completed", val: completedSubmissions.length, icon: <CheckCircle2 size={14} />, accent: "text-green-600" },
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

        <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setExpandedId(null); }} className="space-y-6">
          <TabsList className="bg-white border border-border/20 p-1.5 rounded-none h-auto flex flex-wrap shadow-sm">
            {[
              { val: "pending", label: "Pending", count: pendingSubmissions.length },
              { val: "review", label: "In Review", count: underReviewSubmissions.length },
              { val: "revision", label: "Revision", count: revisionSubmissions.length },
              { val: "completed", label: "Completed", count: completedSubmissions.length },
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

          {[
            { val: "pending", list: pendingSubmissions, empty: "No pending submissions." },
            { val: "review", list: underReviewSubmissions, empty: "No manuscripts in active evaluation." },
            { val: "revision", list: revisionSubmissions, empty: "No manuscripts awaiting revision." },
            { val: "completed", list: completedSubmissions, empty: "No completed submissions yet." },
          ].map(({ val, list, empty }) => (
            <TabsContent key={val} value={val} className="space-y-0 mt-0">
              <FilterBar list={list} />
              {loadingSubmissions ? (
                <div className="py-12 text-center text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                  Synchronizing...
                </div>
              ) : applyFilters(list).length === 0 ? (
                <EmptyState message={searchQuery || subjectFilter !== "all" ? "No results match your filter." : empty} />
              ) : (
                <div className="space-y-1.5">
                  {applyFilters(list).map(submission => (
                    <SubmissionRow key={submission.id} submission={submission} tab={val} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </ContentSection>
    </div>
  );
};
