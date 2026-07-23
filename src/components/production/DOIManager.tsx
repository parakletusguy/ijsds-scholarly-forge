import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, RefreshCw, FileCode, CheckCircle, AlertCircle, Clock, Loader2, Copy } from "lucide-react";
import type { Article } from "@/lib/articleService";
import {
  crossrefRegister,
  crossrefRedeposit,
  crossrefPreview,
  pollCrossRefJob,
  type CrossRefJobStatus,
  type CrossRefJobState,
} from "@/lib/crossrefService";

interface DOIManagerProps {
  article: Article;
  onUpdate: () => void;
}

const STATE_LABEL: Record<CrossRefJobState, string> = {
  waiting: "Queued",
  delayed: "Queued",
  active: "Depositing",
  completed: "Registered",
  failed: "Failed",
  unknown: "Unknown",
};

const StateIndicator = ({ state }: { state: CrossRefJobState }) => {
  if (state === "completed")
    return <CheckCircle size={14} className="text-emerald-600 shrink-0" />;
  if (state === "failed")
    return <AlertCircle size={14} className="text-red-500 shrink-0" />;
  if (state === "active")
    return <Loader2 size={14} className="animate-spin text-primary shrink-0" />;
  return <Clock size={14} className="text-stone-400 shrink-0" />;
};

export const DOIManager = ({ article, onUpdate }: DOIManagerProps) => {
  const { toast } = useToast();
  const [registering, setRegistering] = useState(false);
  const [redepositing, setRedepositing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewXml, setPreviewXml] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<CrossRefJobStatus | null>(null);
  const [stopPoll, setStopPoll] = useState<(() => void) | null>(null);

  useEffect(() => () => { stopPoll?.(); }, [stopPoll]);

  const startPolling = useCallback((jobId: string) => {
    stopPoll?.();
    const stop = pollCrossRefJob(jobId, (status) => {
      setJobStatus(status);
      if (status.state === "completed") {
        toast({ title: "DOI Registered", description: status.result?.doi ?? "CrossRef deposit complete." });
        onUpdate();
      } else if (status.state === "failed") {
        toast({ title: "DOI Registration Failed", description: status.failedReason ?? "CrossRef returned an error.", variant: "destructive" });
      }
    });
    setStopPoll(() => stop);
  }, [stopPoll, onUpdate, toast]);

  const handleRegister = async () => {
    setRegistering(true);
    setJobStatus(null);
    try {
      const res = await crossrefRegister(article.id);
      toast({ title: "DOI Registration Queued", description: "Depositing metadata to CrossRef — tracking progress below." });
      startPolling(res.jobId);
    } catch (err) {
      toast({ title: "Registration Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setRegistering(false);
    }
  };

  const handleRedeposit = async () => {
    setRedepositing(true);
    setJobStatus(null);
    try {
      const res = await crossrefRedeposit(article.id);
      toast({ title: "Redeposit Queued", description: "Updated metadata is being sent to CrossRef." });
      startPolling(res.jobId);
    } catch (err) {
      toast({ title: "Redeposit Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setRedepositing(false);
    }
  };

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      const res = await crossrefPreview(article.id);
      setPreviewXml(res.xml);
    } catch (err) {
      toast({ title: "Preview Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setPreviewing(false);
    }
  };

  const copyDoi = () => {
    if (article.doi) navigator.clipboard.writeText(article.doi);
    toast({ title: "Copied" });
  };

  const isPolling =
    jobStatus && (jobStatus.state === "waiting" || jobStatus.state === "delayed" || jobStatus.state === "active");

  const hasIssueAssignment = !!article.volume && !!article.issue;

  return (
    <div className="space-y-0 divide-y divide-stone-100">

      {/* DOI Status */}
      <div className="py-6 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Current DOI</p>
        {article.doi ? (
          <div className="flex items-center gap-3">
            <CheckCircle size={15} className="text-emerald-600 shrink-0" />
            <code className="text-sm text-stone-800 font-mono bg-stone-100 px-2 py-1 select-all">
              {article.doi}
            </code>
            <button onClick={copyDoi} className="text-stone-400 hover:text-primary transition-colors">
              <Copy size={13} />
            </button>
            <a
              href={`https://doi.org/${article.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-primary transition-colors"
            >
              <ExternalLink size={13} />
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <AlertCircle size={14} className="text-stone-300 shrink-0" />
            {hasIssueAssignment
              ? "Not yet assigned — use Register with CrossRef below."
              : "Not yet assigned — a DOI requires Volume and Issue first. Assign them in the Issues tab and click \"Approve for Processing\"; registration is triggered automatically at that point."}
          </div>
        )}
      </div>

      {/* Job status tracker */}
      {jobStatus && (
        <div className="py-5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Registration Status</p>
          <div className="flex items-center gap-2.5">
            <StateIndicator state={jobStatus.state} />
            <span className="text-sm font-bold text-stone-800">{STATE_LABEL[jobStatus.state]}</span>
            <span className="text-[10px] text-stone-400 font-mono ml-auto">{jobStatus.jobId}</span>
          </div>
          {jobStatus.state === "failed" && jobStatus.failedReason && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 border border-red-100">
              {jobStatus.failedReason}
            </p>
          )}
          {jobStatus.state === "completed" && jobStatus.result?.doi && (
            <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-2 border border-emerald-100">
              DOI: {jobStatus.result.doi}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="py-6 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Actions</p>

        <div className="flex flex-wrap gap-3">
          {/* Register (only if no DOI yet, and only once Volume/Issue exist) */}
          {!article.doi && (
            <button
              onClick={handleRegister}
              disabled={registering || !!isPolling || !hasIssueAssignment}
              title={!hasIssueAssignment ? "Assign Volume and Issue in the Issues tab first" : undefined}
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {registering || isPolling
                ? <Loader2 size={12} className="animate-spin" />
                : <RefreshCw size={12} />}
              Register with CrossRef
            </button>
          )}

          {/* Redeposit (only if DOI exists) */}
          {article.doi && (
            <button
              onClick={handleRedeposit}
              disabled={redepositing || !!isPolling}
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-40 active:scale-[0.98]"
            >
              {redepositing || isPolling
                ? <Loader2 size={12} className="animate-spin" />
                : <RefreshCw size={12} />}
              Redeposit Metadata
            </button>
          )}

          {/* Preview XML */}
          <button
            onClick={handlePreview}
            disabled={previewing}
            className="inline-flex items-center gap-2 border border-stone-200 text-stone-700 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors disabled:opacity-40 active:scale-[0.98]"
          >
            {previewing ? <Loader2 size={12} className="animate-spin" /> : <FileCode size={12} />}
            Preview XML
          </button>
        </div>

        <p className="text-[10px] text-stone-400 leading-relaxed">
          {article.doi
            ? "Use Redeposit to correct metadata (title, authors, volume) after the DOI is already assigned."
            : hasIssueAssignment
              ? "Registration is triggered automatically when processing is approved in the Issues tab. Use this only if that job did not run or needs to be re-triggered."
              : "Registration is disabled until Volume and Issue are assigned — a DOI cannot be minted without them."}
        </p>
      </div>

      {/* XML Preview panel */}
      {previewXml && (
        <div className="py-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">CrossRef XML Preview</p>
            <button
              onClick={() => setPreviewXml(null)}
              className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors"
            >
              Close
            </button>
          </div>
          <pre className="text-[11px] font-mono bg-stone-950 text-stone-300 p-4 overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap">
            {previewXml}
          </pre>
        </div>
      )}
    </div>
  );
};
