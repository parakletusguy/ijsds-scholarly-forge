import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  FileCheck,
} from "lucide-react";
import { getBatchStatus, executeMonthlyBatch } from "@/lib/ijsds2/api";
import type { BatchStatus, MonthlyBatchReleaseResult } from "@/types/ijsds2";
import { toast } from "@/hooks/use-toast";

interface MonthlyBatchReleaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Only admins may trigger a release (the server enforces this); editors can view the queue. */
  canExecute?: boolean;
}

export const MonthlyBatchReleaseModal: React.FC<MonthlyBatchReleaseModalProps> = ({
  open,
  onOpenChange,
  canExecute = false,
}) => {
  const [status, setStatus] = useState<BatchStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<MonthlyBatchReleaseResult | null>(null);

  useEffect(() => {
    if (open) {
      fetchBatchCounts();
      setResult(null);
    }
  }, [open]);

  const fetchBatchCounts = async () => {
    setLoading(true);
    try {
      setStatus(await getBatchStatus());
    } catch (err) {
      console.error("Error fetching batch status:", err);
      toast({ title: "Could not load the publication queue", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      // Runs on the server (admin-only, advisory-locked). Never computed in the browser.
      const res = await executeMonthlyBatch();
      setResult(res);
      toast({
        title: "Publication Batch Executed",
        description: `Published ${res.publishedCount} manuscripts for Issue #${res.targetMonth}. Rolled over ${res.rolledOverCount} in-progress manuscripts.${res.skipped.length ? ` ${res.skipped.length} skipped — see the report.` : ""}`,
      });
      fetchBatchCounts();
    } catch (err: any) {
      toast({
        title: "Batch Execution Error",
        description: err.message || "Failed to execute publication batch.",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const cycle = status;
  const readyCount = status?.readyCount ?? 0;
  const inProgressCount = status?.inProgressCount ?? 0;
  const targetMonthName = cycle ? monthNames[cycle.targetMonth - 1] : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              28th Monthly Batch Release Engine
            </DialogTitle>
            <Badge className="bg-primary text-white text-xs font-mono">
              28th Batch Cycle
            </Badge>
          </div>
          <DialogDescription>
            Target Issue: {targetMonthName} {cycle?.targetYear} Edition
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" text="Loading publication queue..." />
          </div>
        ) : result ? (
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200">
              <h4 className="font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Monthly Batch Successfully Published
              </h4>
              <p className="text-xs mt-1 leading-relaxed">
                Issue #{result.targetMonth} of {result.targetYear} was released. Papers keep the DOI minted at Stage 6; the batch never creates one.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-muted/30">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">
                  Published In This Batch
                </span>
                <p className="text-2xl font-bold font-mono text-primary mt-1">
                  {result.publishedCount} Manuscripts
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-muted/30">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">
                  Rolled Over To Next Batch
                </span>
                <p className="text-2xl font-bold font-mono text-foreground mt-1">
                  {result.rolledOverCount} Manuscripts
                </p>
              </div>
            </div>

            {result.skipped.length > 0 && (
              <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> {result.skipped.length} manuscript(s) were not published and stay in READY_FOR_RELEASE</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  {result.skipped.map((x) => (<li key={x.manuscriptId}>{x.manuscriptId.slice(0, 8)}… — {x.reason}</li>))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border rounded-lg p-3 bg-muted/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Days to 28th Release
                </span>
                <p className="text-xl font-bold font-mono text-primary mt-1">
                  {cycle?.daysUntilRelease ?? "—"} Days
                </p>
              </div>
              <div className="border rounded-lg p-3 bg-muted/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Cutoff Status (27th 23:59)
                </span>
                <p className="text-sm font-semibold mt-1">
                  {cycle?.isCutoffPassed ? (
                    <span className="text-amber-600 font-bold">Cutoff Passed</span>
                  ) : (
                    <span className="text-emerald-600 font-bold">Open for Batch</span>
                  )}
                </p>
              </div>
              <div className="border rounded-lg p-3 bg-muted/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Ready For Release
                </span>
                <p className="text-xl font-bold font-mono text-foreground mt-1">
                  {readyCount} Papers
                </p>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-primary" /> Operational Batch Protocol (v2.4.0-PROD)
              </h4>
              <ul className="text-xs space-y-1.5 text-muted-foreground leading-relaxed">
                <li>
                  • Only manuscripts in <strong className="text-foreground">READY_FOR_RELEASE</strong> (APC paid, peer-reviewed, copyedited, JATS formatted) are published.
                </li>
                <li>
                  • Currently <strong className="text-foreground">{inProgressCount} in-progress manuscripts</strong> (under review or revision) will seamlessly roll over to the next month's batch without losing state.
                </li>
                <li>
                  • Publishing marks each paper PUBLISHED, sets its volume/issue and publication date, emails the author and notifies search engines. Papers without a registered DOI are skipped, never given a placeholder one.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExecute}
                disabled={executing || readyCount === 0 || !canExecute}
                title={canExecute ? undefined : "Only an administrator can trigger the monthly release"}
                className="bg-primary text-white font-semibold gap-1.5"
              >
                {executing ? (
                  <>
                    <LoadingSpinner size="sm" /> Publishing Batch...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Trigger Batch Release ({readyCount})
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
