import React, { useMemo } from "react";
import { getBatchCycleStatus } from "@/lib/ijsds2/monthlyBatchEngine";
import { Calendar, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const BatchReleaseBanner: React.FC<{ className?: string }> = ({ className = "" }) => {
  const cycle = useMemo(() => getBatchCycleStatus(), []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const targetMonthName = monthNames[cycle.currentCycleMonth - 1];

  return (
    <div
      className={`border rounded-xl p-4 bg-gradient-to-r from-card to-muted/40 shadow-sm relative overflow-hidden ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              28-Day Monthly Batch Publication Cycle
            </span>
            <Badge variant="outline" className="text-[10px]">
              Strict Monthly Release
            </Badge>
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Target Issue: {targetMonthName} {cycle.currentCycleYear} Edition (28th Release)
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            Papers completing peer review, production, and APC clearance before{" "}
            <span className="font-semibold text-foreground">23:59 WAT on the 27th</span> are released on the 28th.
            In-progress manuscripts automatically roll over without losing stage.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-background/80 p-3 rounded-lg border">
          <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
          <div>
            <div className="text-xl font-bold font-mono text-foreground leading-none">
              {cycle.daysUntilRelease} {cycle.daysUntilRelease === 1 ? "Day" : "Days"}
            </div>
            <span className="text-[10px] text-muted-foreground">Until Next Batch Release</span>
          </div>
        </div>
      </div>
    </div>
  );
};
