import type { ManuscriptState } from '@/types/ijsds2';

// Plain-language names for the two fees and for every manuscript state, so staff never see
// raw codes like "draft pending fee1". Keep in sync with STATE_LABELS in the backend
// (ijsds2.constants.js), which uses the same wording in error messages.
export const GATE_1_NAME = 'Gate 1 — evaluation (vetting) fee';
export const GATE_2_NAME = 'Gate 2 — publication fee (APC)';

export const STATE_LABELS: Record<ManuscriptState, string> = {
  DRAFT_PENDING_FEE1: 'Awaiting the Gate 1 evaluation (vetting) fee',
  SUBMITTED: 'Submitted — integrity audit being scheduled',
  IN_AUDIT: 'Integrity audit in progress',
  AUDIT_REJECTED: 'Rejected at the integrity audit',
  AUDIT_REVISION_REQUESTED: 'Revision requested after the integrity audit',
  AUDIT_PASSED_PENDING_APC: 'Audit cleared — awaiting the Gate 2 publication fee (APC)',
  APC_PAID: 'Gate 2 publication fee paid — ready for reviewers',
  REVIEWER_MATCHED: 'Reviewers assigned',
  IN_PEER_REVIEW: 'In peer review',
  AUTHOR_REVISION_REQUESTED: 'Waiting for the author’s revision',
  ACCEPTED: 'Accepted',
  IN_PRODUCTION: 'In production',
  READY_FOR_RELEASE: 'Ready for the monthly release (28th)',
  PUBLISHED: 'Published',
};

export const stateLabel = (s: ManuscriptState | string | null | undefined): string =>
  (s && (STATE_LABELS as Record<string, string>)[s]) || String(s ?? '').replace(/_/g, ' ').toLowerCase();

const ORDER: ManuscriptState[] = [
  'DRAFT_PENDING_FEE1', 'SUBMITTED', 'IN_AUDIT', 'AUDIT_REVISION_REQUESTED', 'AUDIT_PASSED_PENDING_APC',
  'APC_PAID', 'REVIEWER_MATCHED', 'IN_PEER_REVIEW', 'AUTHOR_REVISION_REQUESTED', 'ACCEPTED',
  'IN_PRODUCTION', 'READY_FOR_RELEASE', 'PUBLISHED',
];
const at = (s: ManuscriptState) => ORDER.indexOf(s);

export interface ReleaseProgress {
  gate1Paid: boolean;
  auditCleared: boolean;
  gate2Paid: boolean;
  rejected: boolean;
}

/** What has been completed on the way to "reviewers can be assigned". */
export const releaseProgress = (s: ManuscriptState): ReleaseProgress => {
  if (s === 'AUDIT_REJECTED') return { gate1Paid: true, auditCleared: false, gate2Paid: false, rejected: true };
  const i = at(s);
  return {
    gate1Paid: i > at('DRAFT_PENDING_FEE1'),
    auditCleared: i >= at('AUDIT_PASSED_PENDING_APC'),
    gate2Paid: i >= at('APC_PAID'),
    rejected: false,
  };
};
