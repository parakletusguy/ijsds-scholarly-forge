import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Cpu,
  FileCheck,
  Sparkles,
} from "lucide-react";
import type { AuthorAuditReport } from "@/types/ijsds2";

interface AuthorIntegrityReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: AuthorAuditReport | null;
  onProceedToGate2?: () => void;
  onUploadRevision?: () => void;
}

export const AuthorIntegrityReportModal: React.FC<AuthorIntegrityReportModalProps> = ({
  open,
  onOpenChange,
  report,
  onProceedToGate2,
  onUploadRevision,
}) => {
  if (!report) return null;

  const isPassed = report.decision === "AUDIT_PASSED_PENDING_APC";
  const isRevision = report.decision === "AUDIT_REVISION_REQUESTED";
  const isRejected = report.decision === "AUDIT_REJECTED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                Stage 2 Research Integrity & Citation Report
              </DialogTitle>
              <DialogDescription>
                Revision #{report.revisionNo} • Evaluated on{" "}
                {new Date(report.generatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </DialogDescription>
            </div>
            {isPassed && (
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-3 py-1">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Audit Cleared
              </Badge>
            )}
            {isRevision && (
              <Badge className="bg-amber-600 text-white hover:bg-amber-700 text-xs px-3 py-1">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Revision Required
              </Badge>
            )}
            {isRejected && (
              <Badge className="bg-destructive text-white text-xs px-3 py-1">
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Audit Rejected
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Summary Banner */}
        <div
          className={`p-4 rounded-lg border text-sm leading-relaxed ${
            isPassed
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
              : isRevision
              ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
              : "bg-destructive/10 border-destructive/30 text-destructive dark:text-red-300"
          }`}
        >
          <p className="font-medium">{report.summary}</p>
        </div>

        {/* Actionable Requirements (if any) */}
        {report.requiredActions.length > 0 && (
          <div className="space-y-2 p-4 bg-muted/40 rounded-lg border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileCheck className="h-4 w-4" /> Actionable Revision Items
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
              {report.requiredActions.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plagiarism Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" /> Plagiarism & Similarity
              </h4>
              <Badge variant="outline" className="font-mono text-xs">
                {(report.plagiarism.score * 100).toFixed(1)}% Overlap (Risk: {report.plagiarism.risk})
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Provider: {report.plagiarism.provider} (Bibliography excluded)
            </p>
            {report.plagiarism.matches.length > 0 ? (
              <div className="space-y-2 pt-1">
                {report.plagiarism.matches.map((m, idx) => (
                  <div key={idx} className="bg-muted/50 p-2.5 rounded text-xs border space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>{m.source_title}</span>
                      <span className="text-primary">{m.similarity_pct}%</span>
                    </div>
                    <p className="italic text-muted-foreground">{m.matched_snippet}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No substantial overlapping source passages detected.</p>
            )}
          </div>

          {/* AI-Authorship Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-primary" /> AI Authorship Risk Signal
              </h4>
              <Badge variant="outline" className="font-mono text-xs">
                Risk Band: {report.aiAuthorship.riskBand}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              {report.aiAuthorship.disclaimer}
            </p>
            {report.aiAuthorship.flaggedSegments.length > 0 ? (
              <div className="space-y-2 pt-1">
                {report.aiAuthorship.flaggedSegments.map((s, idx) => (
                  <div key={idx} className="bg-muted/50 p-2.5 rounded text-xs border space-y-1">
                    <div className="flex justify-between font-medium text-amber-700 dark:text-amber-400">
                      <span>Segment #{s.segment_index}: {s.label}</span>
                      <span>Confidence: {(s.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <p className="italic text-muted-foreground">{s.text_snippet}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No formulaic or repetitive machine cadence flagged.</p>
            )}
          </div>
        </div>

        {/* Citation Validation Ledger */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-primary" /> Citation Validation Ledger
            </h4>
            <span className="text-xs text-muted-foreground">
              {report.citationLedger.length} References Analyzed
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {report.citationLedger.map((c, idx) => (
              <div key={idx} className="bg-muted/30 p-2.5 rounded border text-xs space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">[{c.bibliographyIndex}] {c.normalizedTitle || "Reference"}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${
                      c.resolutionStatus === "VALIDATED"
                        ? "border-emerald-500 text-emerald-700 dark:text-emerald-300"
                        : c.resolutionStatus === "PARTIAL_MATCH"
                        ? "border-amber-500 text-amber-700 dark:text-amber-300"
                        : "border-destructive text-destructive"
                    }`}
                  >
                    {c.resolutionStatus}
                  </Badge>
                </div>
                <p className="text-muted-foreground line-clamp-1">{c.rawReference}</p>
                {c.resolvedDoi && (
                  <a
                    href={`https://doi.org/${c.resolvedDoi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    DOI: {c.resolvedDoi} <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
                {c.warnings.length > 0 && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">
                    ⚠️ {c.warnings.join(" • ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related Literature Recommendations */}
        {report.relatedRecommendations.length > 0 && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" /> Recommended Related Works (Citation Graph)
              </h4>
              <span className="text-[11px] text-muted-foreground">Author Suggestions Only</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.relatedRecommendations.map((rec, idx) => (
                <div key={idx} className="p-2.5 rounded border bg-card text-xs space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-medium text-foreground">{rec.title}</p>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {(rec.relevanceScore * 100).toFixed(0)}% Match
                    </Badge>
                  </div>
                  {rec.year && <p className="text-[11px] text-muted-foreground">Published: {rec.year}</p>}
                  {rec.reason && <p className="text-[11px] italic text-muted-foreground">{rec.reason}</p>}
                  {rec.doi && (
                    <a
                      href={`https://doi.org/${rec.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      View on Crossref <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close Report
          </Button>

          {isPassed && onProceedToGate2 && (
            <Button onClick={onProceedToGate2} className="bg-primary text-white font-semibold">
              Proceed to Gate 2 Payment (₦25,500 APC)
            </Button>
          )}

          {isRevision && onUploadRevision && (
            <Button onClick={onUploadRevision} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
              Re-upload Revised Manuscript (Free)
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
