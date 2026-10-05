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
import {
  getBatchCycleStatus,
  executeMonthlyPublicationBatch,
  type MonthlyBatchReleaseResult,
} from "@/lib/ijsds2/monthlyBatchEngine";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MonthlyBatchReleaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MonthlyBatchReleaseModal: React.FC<MonthlyBatchReleaseModalProps> = ({
  open,
  onOpenChange,
}) => {
  const cycle = getBatchCycleStatus();
  const [readyCount, setReadyCount] = useState<number>(0);
  const [inProgressCount, setInProgressCount] = useState<number>(0);
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
      const { count: ready } = await supabase
        .from("manuscripts" as any)
        .select("id", { count: "exact", head: true })
        .eq("current_state", "READY_FOR_RELEASE");

      const { count: progress } = await supabase
        .from("manuscripts" as any)
        .select("id", { count: "exact", head: true })
        .in("current_state", [
          "IN_AUDIT",
          "AUDIT_REVISION_REQUESTED",
          "AUDIT_PASSED_PENDING_APC",
          "APC_PAID",
          "REVIEWER_MATCHED",
          "IN_PEER_REVIEW",
          "AUTHOR_REVISION_REQUESTED",
          "ACCEPTED",
          "IN_PRODUCTION",
        ]);

      setReadyCount(ready || 0);
      setInProgressCount(progress || 0);
    } catch (err) {
      console.error("Error fetching batch counts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const res = await executeMonthlyPublicationBatch();
      setResult(res);
      toast({
        title: "Publication Batch Executed",
        description: `Published ${res.publishedCount} manuscripts for Issue #${res.targetMonth}. Rolled over ${res.rolledOverCount} in-progress manuscripts.`,
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
  const targetMonthName = monthNames[cycle.currentCycleMonth - 1];

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
            Target Issue: {targetMonthName} {cycle.currentCycleYear} Edition
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
                Volume #{Math.max(1, result.targetYear - 2024)}, Issue #{result.targetMonth} has been minted. 
                DOIs and JATS XML metadata are prepared for Crossref/DOAJ broadcast.
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
                  {cycle.daysUntilRelease} Days
                </p>
              </div>
              <div className="border rounded-lg p-3 bg-muted/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Cutoff Status (27th 23:59)
                </span>
                <p className="text-sm font-semibold mt-1">
                  {cycle.isCutoffPassed ? (
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
                  • Publishing assigns Volume and Issue numbers, assigns DOIs, and prepares indexer broadcasts.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExecute}
                disabled={executing || readyCount === 0}
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
