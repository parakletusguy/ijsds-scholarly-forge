/**
 * S_page = (Σ w_i · F_i) × G_gate
 *
 * G_gate is applied as a hard multiplier (0 or 1) — a failing gate always
 * produces S_page = 0, no matter how the factors score. Unmeasured factors
 * (F_cwv, F_authority — see factors/unmeasured.ts) are excluded from the sum
 * and the remaining weights renormalized, so a missing data source doesn't
 * silently drag the score down or up.
 */
import type { FactorId, FactorVector, GateResult, PageAudit, PageType } from "./types";
import { WEIGHT_PROFILES } from "./weights";

export function computeScore(
  gate: GateResult,
  factors: FactorVector,
  pageType: PageType,
): { score: number; breakdown: PageAudit["breakdown"] } {
  const profile = WEIGHT_PROFILES[pageType];
  const measuredIds = (Object.keys(factors) as FactorId[]).filter(
    (id) => id !== "aicrawl" && !factors[id].unmeasured,
  );
  const weightSum = measuredIds.reduce((sum, id) => sum + profile.weights[id], 0);

  const breakdown: PageAudit["breakdown"] = measuredIds.map((id) => {
    const normalizedWeight = weightSum > 0 ? profile.weights[id] / weightSum : 0;
    return {
      factor: id,
      weight: normalizedWeight,
      score: factors[id].score,
      contribution: normalizedWeight * factors[id].score,
    };
  });

  const weightedSum = breakdown.reduce((sum, b) => sum + b.contribution, 0);
  const score = gate.pass ? weightedSum : 0;

  return { score, breakdown };
}
