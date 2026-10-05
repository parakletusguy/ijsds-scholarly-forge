import { supabase } from "@/integrations/supabase/client";
import type { Manuscript } from "@/types/ijsds2";

export interface MonthlyBatchReleaseResult {
  executionDate: string;
  targetYear: number;
  targetMonth: number;
  publishedCount: number;
  rolledOverCount: number;
  publishedManuscriptIds: string[];
}

/**
 * Calculates current publication batch metadata based on the 28th-day release rule.
 * Cutoff: 23:59 WAT on the 27th.
 */
export function getBatchCycleStatus(now: Date = new Date()): {
  currentCycleMonth: number;
  currentCycleYear: number;
  isCutoffPassed: boolean;
  nextReleaseDate: Date;
  daysUntilRelease: number;
} {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate();

  // Publication date is always the 28th of the target month
  const releaseThisMonth = new Date(currentYear, currentMonth - 1, 28, 0, 0, 0);

  let targetYear = currentYear;
  let targetMonth = currentMonth;
  let nextReleaseDate = releaseThisMonth;

  // If past the 28th, next release is the 28th of next month
  if (currentDay > 28) {
    if (currentMonth === 12) {
      targetYear = currentYear + 1;
      targetMonth = 1;
    } else {
      targetMonth = currentMonth + 1;
    }
    nextReleaseDate = new Date(targetYear, targetMonth - 1, 28, 0, 0, 0);
  }

  // Cutoff is 23:59 WAT on the 27th
  const cutoffDate = new Date(targetYear, targetMonth - 1, 27, 23, 59, 59);
  const isCutoffPassed = now.getTime() > cutoffDate.getTime();

  const diffMs = nextReleaseDate.getTime() - now.getTime();
  const daysUntilRelease = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    currentCycleMonth: targetMonth,
    currentCycleYear: targetYear,
    isCutoffPassed,
    nextReleaseDate,
    daysUntilRelease,
  };
}

/**
 * Executes the 28th Monthly Publication Batch Engine (PRD Section 4.E).
 * Gathers all manuscripts in READY_FOR_RELEASE, assigns Volume/Issue, updates to PUBLISHED,
 * and leaves all in-progress manuscripts untouched so they roll over seamlessly.
 */
export async function executeMonthlyPublicationBatch(
  forcedYear?: number,
  forcedMonth?: number
): Promise<MonthlyBatchReleaseResult> {
  const now = new Date();
  const cycle = getBatchCycleStatus(now);
  const targetYear = forcedYear || cycle.currentCycleYear;
  const targetMonth = forcedMonth || cycle.currentCycleMonth;

  // Determine current volume: volume number corresponds to journal years (e.g. Vol 2 in 2026)
  // Assuming base year 2025 = Volume 1
  const volumeNumber = Math.max(1, targetYear - 2024);
  const issueNumber = targetMonth; // 1 to 12

  // 1. Fetch all manuscripts with state 'READY_FOR_RELEASE'
  const { data: readyPapers, error: fetchError } = await supabase
    .from("manuscripts" as any)
    .select("id, title, author_id, doi")
    .eq("current_state", "READY_FOR_RELEASE");

  if (fetchError) {
    console.error("Failed to query ready manuscripts:", fetchError);
    throw new Error(`Batch execution query failed: ${fetchError.message}`);
  }

  const papers = (readyPapers || []) as any[];
  const publishedManuscriptIds: string[] = [];

  // 2. Publish eligible manuscripts
  for (const paper of papers) {
    const publishedAt = now.toISOString();
    const finalDoi = paper.doi || `10.62154/ijsds.${targetYear}.${String(issueNumber).padStart(2, "0")}.${paper.id.slice(0, 4)}`;

    await supabase
      .from("manuscripts" as any)
      .update({
        current_state: "PUBLISHED",
        target_publication_year: targetYear,
        target_publication_month: targetMonth,
        doi: finalDoi,
        published_at: publishedAt,
      })
      .eq("id", paper.id);

    publishedManuscriptIds.push(paper.id);
  }

  // 3. Count in-progress manuscripts (under review / revisions) that automatically roll over
  const { count: inProgressCount } = await supabase
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

  return {
    executionDate: now.toISOString(),
    targetYear,
    targetMonth,
    publishedCount: publishedManuscriptIds.length,
    rolledOverCount: inProgressCount || 0,
    publishedManuscriptIds,
  };
}
