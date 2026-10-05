import { supabase } from "@/integrations/supabase/client";
import type { ReviewerProfile } from "@/types/ijsds2";

export interface ReviewerMatchCandidate {
  reviewerId: string;
  userId: string;
  fullName?: string;
  email?: string;
  similarityScore: number;
  expertiseKeywords: string[];
  activeLoad: number;
}

/**
 * Executes Stage 3 Reviewer Matching applying the COPE Conflict-of-Interest (COI) Firewall.
 * Strictly excludes any reviewer who referred the target manuscript.
 */
export async function matchReviewersForManuscript(
  manuscriptId: string,
  limit = 5
): Promise<ReviewerMatchCandidate[]> {
  // First attempt database RPC vector function
  const { data: rpcMatches, error: rpcError } = await supabase.rpc(
    "match_reviewers_for_manuscript" as any,
    {
      target_manuscript_id: manuscriptId,
      match_limit: limit,
    }
  );

  if (!rpcError && rpcMatches && (rpcMatches as any[]).length > 0) {
    const reviewerIds = (rpcMatches as any[]).map((m) => m.reviewer_id);

    const { data: profiles } = await supabase
      .from("reviewer_profiles" as any)
      .select("id, user_id, expertise_keywords, active_load")
      .in("id", reviewerIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    return (rpcMatches as any[]).map((match) => {
      const p = profileMap.get(match.reviewer_id);
      return {
        reviewerId: match.reviewer_id,
        userId: p?.user_id,
        similarityScore: Number(match.similarity_score.toFixed(4)),
        expertiseKeywords: p?.expertise_keywords || [],
        activeLoad: p?.active_load || 0,
      };
    });
  }

  // Fallback lexical / keyword matching with COPE COI firewall applied in application code
  const { data: manuscript } = await supabase
    .from("manuscripts" as any)
    .select("id, title, abstract, referred_by_reviewer_id")
    .eq("id", manuscriptId)
    .single();

  if (!manuscript) {
    return [];
  }

  const referringReviewerId = (manuscript as any).referred_by_reviewer_id;
  const manuscriptKeywords = (
    `${(manuscript as any).title} ${(manuscript as any).abstract}`
  ).toLowerCase();

  // Query eligible reviewers: available, active load < 3, and NOT referring reviewer
  let query = supabase
    .from("reviewer_profiles" as any)
    .select("id, user_id, expertise_keywords, active_load, is_available")
    .eq("is_available", true)
    .lt("active_load", 3);

  if (referringReviewerId) {
    query = query.neq("id", referringReviewerId);
  }

  const { data: reviewers, error } = await query;
  if (error || !reviewers) {
    return [];
  }

  // Score candidates
  const scored = (reviewers as any[]).map((rev) => {
    let matchHits = 0;
    const keywords: string[] = rev.expertise_keywords || [];
    keywords.forEach((kw) => {
      if (manuscriptKeywords.includes(kw.toLowerCase())) {
        matchHits++;
      }
    });

    const similarityScore = keywords.length > 0
      ? Number((0.60 + Math.min(matchHits * 0.1, 0.35)).toFixed(4))
      : 0.50;

    return {
      reviewerId: rev.id,
      userId: rev.user_id,
      similarityScore,
      expertiseKeywords: keywords,
      activeLoad: rev.active_load || 0,
    };
  });

  scored.sort((a, b) => b.similarityScore - a.similarityScore);
  return scored.slice(0, limit);
}

/**
 * Assigns a reviewer to a manuscript and increments the reviewer's active load.
 */
export async function assignReviewerToManuscript(manuscriptId: string, reviewerId: string) {
  // Update manuscript state to REVIEWER_MATCHED / IN_PEER_REVIEW
  await supabase
    .from("manuscripts" as any)
    .update({ current_state: "REVIEWER_MATCHED" })
    .eq("id", manuscriptId);

  // Increment reviewer active_load
  const { data: rev } = await supabase
    .from("reviewer_profiles" as any)
    .select("active_load")
    .eq("id", reviewerId)
    .single();

  if (rev) {
    await supabase
      .from("reviewer_profiles" as any)
      .update({ active_load: ((rev as any).active_load || 0) + 1 })
      .eq("id", reviewerId);
  }

  return { success: true };
}

/**
 * Generates a unique referral code for a new reviewer profile.
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "IJSDS-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
