import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getSubmissions, type Submission } from "@/lib/submissionService";
import { createEditorialDecision } from "@/lib/editorialService";
import { updateArticle } from "@/lib/articleService";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { PaperDownload } from "@/components/papers/PaperDownload";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { RejectSubmissionDialog } from "@/components/editor/RejectSubmissionDialog";
import { ApproveSubmissionDialog } from "@/components/editor/ApproveSubmissionDialog";
import { ReviewerInvitationDialog } from "@/components/editor/ReviewerInvitationDialog";
import { RevisionRequestDialog } from "@/components/editor/RevisionRequestDialog";
import { useNavigate } from "react-router-dom";
import { PageHeader, ContentSection } from "@/components/layout/PageElements";

// Using Submission type from submissionService

export const Editorial = () => {
  const { user, profile, loading } = useAuth();
  console.log(profile);
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const isEditor = !!(profile?.is_editor || profile?.is_admin);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (!loading && user && !isEditor) {
      toast({
        title: "Access Denied",
        description: "Institutional credentials required.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }
    if (user && isEditor) fetchSubmissions();
  }, [user, profile, loading, navigate]);

  const fetchSubmissions = async () => {
    try {
      const data = await getSubmissions();
      setSubmissions(data || []);
    } catch (error: any) {
      console.error("Editorial Sync Error:", error);
      toast({
        title: "Sync Error",
        description: error.message || "Failed to fetch editorial records.",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const updateDOIVersion = async (submissionId: string, articleDoi: string) => {
    try {
      toast({
        title: "DOI Synchronization",
        description: "Transmitting new version metadata...",
      });
      const data = await api.post<any>("/api/doi/generate", {
        submissionId,
        existingDoi: articleDoi,
      });
      if (data.success) {
        toast({
          title: "Registry Updated",
          description: `DOI synchronized: ${data.data?.doi}`,
        });
        fetchSubmissions();
      } else {
        throw new Error("Registry rejection");
      }
    } catch (error: any) {
      toast({
        title: "DOI Error",
        description: error.message || "Failed to update registry.",
        variant: "destructive",
      });
    }
  };

  const startReviewCycle = async (submission: Submission) => {
    try {
      setProcessingId(submission.id);
      // Creates editorial decision → sets submission status to 'under_review',
      // writes audit log, and sends a status-change email to the author.
      await createEditorialDecision({
        submission_id: submission.id,
        decision_type: "send_for_review",
      });
      // Sync the article status too
      await updateArticle(submission.article_id, {
        status: "under_review",
      });

      toast({
        title: "Review Started",
        description: "Submission moved to Active Evaluation.",
      });
      setActiveTab("review");
      fetchSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start review cycle.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || !isEditor)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const pendingSubmissions = submissions.filter(
    (s) => s.status === "submitted",
  );
  const underReviewSubmissions = submissions.filter(
    (s) => s.status === "under_review",
  );
  const revisionSubmissions = submissions.filter(
    (s) => s.status === "revision_requested",
  );
  const completedSubmissions = submissions.filter((s) =>
    ["accepted", "rejected", "desk_rejected"].includes(s.status),
  );

  const cardClasses =
    "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group";

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader
        title="Curation Hub"
        subtitle="Editorial Oversight"
        accent="Volume 2026 Management"
        description="Monitoring the evolution of scholarly thought. Oversee peer evaluation, manage decision workflows, and curate the scholarly record for the International Journal of Social Work and Development Studies."
      />

      {/* Control Navigation */}
      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Exit Command Hub
          </Button>

          <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
            <ShieldAlert size={16} className="text-secondary" />
            <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">
              Authorized Editorial Access
            </span>
          </div>
        </div>

        {/* Global Statistics */}
        {/* Global Statistics (HTML Bento Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-stone-200/50 mb-12 border border-stone-200/50">
          {[
            {
              label: "Total Submissions",
              val: submissions.length,
              accent: "text-primary",
              icon: <Database size={18} />,
            },
            {
              label: "Pending Review",
              val: pendingSubmissions.length,
              accent: "text-stone-900",
              icon: <Clock size={18} />,
            },
            {
              label: "Under Review",
              val: underReviewSubmissions.length,
              accent: "text-stone-300",
              icon: <Users size={18} />,
            },
            {
              label: "Completed",
              val: completedSubmissions.length,
              accent: "text-stone-300",
              icon: <CheckCircle2 size={18} />,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-8 flex flex-col justify-between h-44 group hover:bg-stone-50 transition-colors"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
                {stat.label}
              </span>
              <div className="flex items-baseline gap-3">
                <span
                  className={`font-headline text-6xl font-bold tracking-tighter ${stat.accent}`}
                >
                  {stat.val}
                </span>
                {i < 2 && (
                  <span className="text-primary/40 group-hover:translate-x-1 transition-transform">
                    {stat.icon}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-12"
        >
          <TabsList className="bg-white border border-border/20 p-2 rounded-none h-auto flex flex-wrap shadow-sm">
            {[
              {
                val: "pending",
                label: "Pending Queue",
                count: pendingSubmissions.length,
              },
              {
                val: "review",
                label: "Active Evaluation",
                count: underReviewSubmissions.length,
              },
              {
                val: "revision",
                label: "Awaiting Revision",
                count: revisionSubmissions.length,
              },
              {
                val: "completed",
                label: "Work History",
                count: completedSubmissions.length,
              },
            ].map((tab) => (
              <TabsTrigger
                key={tab.val}
                value={tab.val}
                className="rounded-none py-4 px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-medium text-xs uppercase tracking-wider transition-all gap-3 border-r border-stone-100 last:border-0 grow"
              >
                {tab.label}{" "}
                <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-none rounded-none text-[8px] font-bold px-2">
                  {tab.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="pending" className="space-y-8 mt-0">
            {loadingSubmissions ? (
              <div className="py-24 text-center text-foreground/30 font-headline font-black uppercase text-[10px] tracking-widest">
                Synchronizing Registry...
              </div>
            ) : pendingSubmissions.length === 0 ? (
              <div
                className={
                  cardClasses + " py-24 text-center opacity-40 italic font-body"
                }
              >
                Queue is currently empty. All data synchronized.
              </div>
            ) : (
              pendingSubmissions.map((submission) => {
                const art = (submission.article as any) || {};
                return (
                  <div
                    key={submission.id}
                    className="bg-white p-8 border-l-4 border-primary shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                            Initial Submission
                          </span>
                          <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest font-body">
                            Ref: {submission.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>

                        <h3 className="text-3xl font-headline font-bold text-stone-900 mb-3 leading-tight">
                          {art.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-stone-500 text-xs font-medium">
                          <span className="flex items-center gap-1.5">
                            <Users size={14} className="text-primary/40" />{" "}
                            Submitted by{" "}
                            <strong className="text-stone-900">
                              {submission.submitter?.full_name}
                            </strong>
                          </span>
                          <span className="text-stone-200">•</span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-primary/40" />{" "}
                            {new Date(
                              submission.submitted_at,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          Financial Clearance
                        </span>
                        <PaymentStatusBadge
                          vettingFee={!!submission.vetting_fee}
                          processingFee={!!submission.processing_fee}
                          showLabels={true}
                        />
                      </div>
                    </div>

                    <div className="bg-stone-50 p-6 mb-8 border border-stone-100 italic font-body text-sm text-stone-600 leading-relaxed line-clamp-2">
                      "
                      {art.abstract ||
                        "No abstract provided for preliminary review."}
                      "
                    </div>

                    <div className="flex flex-wrap gap-4 items-center border-t border-stone-100 pt-8">
                      <Button
                        size="sm"
                        disabled={processingId === submission.id}
                        onClick={() => startReviewCycle(submission)}
                        className="bg-primary text-white rounded-none font-headline font-bold uppercase text-[10px] px-8 h-12 hover:bg-stone-900 transition-all gap-2"
                      >
                        {processingId === submission.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Start Review Cycle
                      </Button>
                      <ReviewerInvitationDialog
                        submissionId={submission.id}
                        submissionTitle={art.title}
                        onInvite={fetchSubmissions}
                        submission={submission}
                      />
                      <PaperDownload
                        manuscriptFileUrl={art.manuscript_file_url}
                        title={art.title}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/submission/${submission.id}/details`)
                        }
                        className="rounded-none font-headline font-bold uppercase text-[10px] px-6 h-12 border-stone-200 hover:border-primary transition-all"
                      >
                        Detailed Dossier
                      </Button>

                      <div className="ml-auto">
                        <RejectSubmissionDialog
                          submissionId={submission.id}
                          articleId={submission.article_id}
                          onReject={fetchSubmissions}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-8 mt-0">
            {underReviewSubmissions.length === 0 ? (
              <div
                className={
                  cardClasses + " py-24 text-center opacity-40 italic font-body"
                }
              >
                No manuscripts currently in active evaluation orbit.
              </div>
            ) : (
              underReviewSubmissions.map((submission) => {
                const art = (submission.article as any) || {};
                return (
                  <div
                    key={submission.id}
                    className="bg-white p-8 border-l-4 border-amber-400 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-amber-500/10 text-amber-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 align-middle">
                            <Clock size={12} /> Review in Progress
                          </span>
                          <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest font-body">
                            Ref: {submission.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>

                        <h3 className="text-3xl font-headline font-bold text-stone-900 mb-3 leading-tight">
                          {art.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-stone-500 text-xs font-medium">
                          <span className="flex items-center gap-1.5 font-bold text-stone-900">
                            {submission.submitter?.full_name}
                          </span>
                          <span className="text-stone-200">•</span>
                          <span className="flex items-center gap-1.5 opacity-60 italic font-body">
                            Verified on{" "}
                            {new Date(
                              submission.submitted_at,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          Financial Clearance
                        </span>
                        <PaymentStatusBadge
                          vettingFee={!!submission.vetting_fee}
                          processingFee={!!submission.processing_fee}
                          showLabels={true}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center border-t border-stone-100 pt-8">
                      <ApproveSubmissionDialog
                        submissionId={submission.id}
                        onApprove={fetchSubmissions}
                        articleId={submission.article_id}
                      />
                      <RevisionRequestDialog
                        submissionId={submission.id}
                        submissionTitle={art.title || ""}
                        authorEmail={art.corresponding_author_email || ""}
                        authorName={submission.submitter?.full_name || ""}
                        onRequest={fetchSubmissions}
                      />
                      <RejectSubmissionDialog
                        submissionId={submission.id}
                        articleId={submission.article_id}
                        onReject={fetchSubmissions}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/submission/${submission.id}/reviews`)
                        }
                        className="rounded-none font-headline font-bold uppercase text-[10px] px-6 h-12 border-stone-200 hover:border-primary transition-all"
                      >
                        Audit Reviews
                      </Button>

                      {art.doi && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateDOIVersion(submission.id, art.doi)
                          }
                          className="rounded-none font-headline font-bold uppercase text-[9px] tracking-widest text-primary gap-2 hover:bg-primary/5 ml-auto"
                        >
                          <RefreshCw size={12} /> Regenerate DOI
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
          <TabsContent value="revision" className="space-y-8 mt-0">
            {revisionSubmissions.length === 0 ? (
              <div
                className={
                  cardClasses + " py-24 text-center opacity-40 italic font-body"
                }
              >
                No manuscripts currently awaiting author revisions.
              </div>
            ) : (
              revisionSubmissions.map((submission) => {
                const art = (submission.article as any) || {};
                return (
                  <div
                    key={submission.id}
                    className="bg-white p-8 border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-orange-500/10 text-orange-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 align-middle">
                            <Activity size={12} /> Awaiting Revision
                          </span>
                          <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest font-body">
                            Ref: {submission.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>

                        <h3 className="text-3xl font-headline font-bold text-stone-900 mb-3 leading-tight">
                          {art.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-stone-500 text-xs font-medium">
                          <span className="flex items-center gap-1.5">
                            <Users size={14} className="text-primary/40" />{" "}
                            {submission.submitter?.full_name}
                          </span>
                          <span className="text-stone-200">•</span>
                          <span className="flex items-center gap-1.5 italic font-body opacity-60">
                            Submitted on{" "}
                            {new Date(
                              submission.submitted_at,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          Financial Clearance
                        </span>
                        <PaymentStatusBadge
                          vettingFee={!!submission.vetting_fee}
                          processingFee={!!submission.processing_fee}
                          showLabels={true}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center border-t border-stone-100 pt-8">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/submission/${submission.id}/details`)
                        }
                        className="rounded-none font-headline font-bold uppercase text-[10px] px-6 h-12 border-stone-200 hover:border-primary transition-all"
                      >
                        Audit Dossier
                      </Button>
                      <PaperDownload
                        manuscriptFileUrl={art.manuscript_file_url}
                        title={art.title}
                      />
                      <div className="ml-auto opacity-40 text-[9px] font-bold uppercase tracking-[0.2em]">
                        Monitoring Revision Progress
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-8 mt-0">
            {completedSubmissions.length === 0 ? (
              <div
                className={
                  cardClasses + " py-24 text-center opacity-40 italic font-body"
                }
              >
                Work History is currently empty.
              </div>
            ) : (
              completedSubmissions.map((submission) => {
                const art = (submission.article as any) || {};
                const isAccepted = submission.status === "accepted";
                return (
                  <div
                    key={submission.id}
                    className={`bg-white p-8 border-l-4 ${isAccepted ? "border-green-500" : "border-stone-400"} shadow-sm opacity-80 hover:opacity-100 transition-all`}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 align-middle ${isAccepted ? "bg-green-50 text-green-600" : "bg-stone-100 text-stone-500"}`}
                          >
                            {isAccepted ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <ShieldAlert size={12} />
                            )}
                            {submission.status.replace("_", " ")}
                          </span>
                          <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest font-body">
                            Ref: {submission.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>

                        <h3 className="text-3xl font-headline font-bold text-stone-900 mb-3 leading-tight">
                          {art.title}
                        </h3>
                        <p className="font-body text-stone-500 text-sm mb-4">
                          Author:{" "}
                          <strong>{submission.submitter?.full_name}</strong> •
                          Completed on{" "}
                          {new Date(
                            submission.submitted_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {art.doi && (
                          <Badge
                            variant="outline"
                            className="rounded-none border-stone-200 text-[9px] font-bold tracking-widest uppercase py-1"
                          >
                            {art.doi}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center border-t border-stone-100 pt-8">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/submission/${submission.id}/details`)
                        }
                        className="rounded-none font-headline font-bold uppercase text-[10px] px-6 h-12 border-stone-200 hover:border-primary transition-all"
                      >
                        Registry Details
                      </Button>
                      <PaperDownload
                        manuscriptFileUrl={art.manuscript_file_url}
                        title={art.title}
                      />
                      {isAccepted && art.doi && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateDOIVersion(submission.id, art.doi)
                          }
                          className="rounded-none font-headline font-bold uppercase text-[9px] tracking-widest text-primary gap-2 hover:bg-primary/5 ml-auto"
                        >
                          <RefreshCw size={12} /> Sync Registry
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </ContentSection>
    </div>
  );
};
