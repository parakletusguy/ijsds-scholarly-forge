import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Users, Target, Brain, Info, ShieldCheck, AlertCircle, Mail, GraduationCap, CheckCircle2, Circle } from 'lucide-react';
import { GATE_1_NAME, GATE_2_NAME, releaseProgress, stateLabel } from '@/lib/ijsds2/labels';
import { matchReviewers, assignReviewers, getManuscriptStatus } from '@/lib/ijsds2/api';
import type { ManuscriptState, ReviewerMatchCandidate } from '@/types/ijsds2';

const MAX_LOAD = 3;
const ASSIGNABLE: ManuscriptState[] = ['APC_PAID', 'REVIEWER_MATCHED', 'IN_PEER_REVIEW', 'AUTHOR_REVISION_REQUESTED'];

interface Props {
  submissionId: string;
  /** Called after reviewers were assigned so the parent can refresh. */
  onAssigned?: () => void;
}

type Method = 'vector' | 'keyword';

/**
 * Stage 3 reviewer matching. Everything shown here comes from the server: similarity, current
 * workload and expertise are real, and the COPE exclusions (referring reviewer, the author,
 * reviewers at the workload cap, already-invited, unavailable) are applied by the backend
 * both when listing and again when assigning.
 */
export const AutomatedReviewerMatchingInterface = ({ submissionId, onAssigned }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [matches, setMatches] = useState<ReviewerMatchCandidate[]>([]);
  const [method, setMethod] = useState<Method | null>(null);
  const [state, setState] = useState<ManuscriptState | null>(null);
  const [gatesEnforced, setGatesEnforced] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, s] = await Promise.all([
        matchReviewers(submissionId, 10),
        getManuscriptStatus(submissionId).catch(() => null),
      ]);
      setMatches(m.candidates);
      setMethod(m.method);
      setState(s?.current_state ?? null);
      setGatesEnforced(s?.payment_gates_enforced !== false);
      setSelected([]);
    } catch (e: any) {
      setError(e?.message ?? 'Could not load reviewer matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (submissionId) load();
  }, [submissionId]);

  const canAssign = !gatesEnforced || state === null || ASSIGNABLE.includes(state);

  const toggle = (userId: string) =>
    setSelected((prev) => (prev.includes(userId) ? prev.filter((x) => x !== userId) : [...prev, userId]));

  const assign = async () => {
    setAssigning(true);
    try {
      await assignReviewers(submissionId, selected);
      toast({ title: 'Reviewers assigned', description: `${selected.length} reviewer(s) invited by email.` });
      onAssigned?.();
      await load();
    } catch (e: any) {
      toast({ title: "Couldn't assign reviewers", description: e?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <p>
          Reviewers are ranked from their stated expertise against this paper. These are excluded automatically: the
          referring reviewer, the author, anyone already invited, anyone unavailable, and anyone with {MAX_LOAD} active
          reviews.
        </p>
      </div>

      {state && !canAssign && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 space-y-3">
          <p className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Reviewers can’t be assigned yet — you can preview the matches below.
          </p>
          <p>
            Current status: <strong>{stateLabel(state)}</strong>
          </p>
          {(() => {
            const p = releaseProgress(state);
            const steps = [
              { done: p.gate1Paid, text: GATE_1_NAME, note: 'paid by the author when submitting' },
              { done: p.auditCleared, text: 'Integrity audit cleared', note: p.rejected ? 'this paper was rejected at the audit' : 'runs automatically about 24 hours after Gate 1' },
              { done: p.gate2Paid, text: GATE_2_NAME, note: 'payable by the author only after the audit is cleared' },
            ];
            return (
              <ol className="space-y-1.5">
                {steps.map((st) => (
                  <li key={st.text} className="flex items-start gap-2">
                    {st.done ? <CheckCircle2 className="h-4 w-4 mt-px shrink-0 text-emerald-600" /> : <Circle className="h-4 w-4 mt-px shrink-0 text-amber-600" />}
                    <span>
                      <strong className={st.done ? 'text-emerald-800' : ''}>{st.text}</strong>
                      <span className="text-amber-800/80"> — {st.done ? 'done' : st.note}</span>
                    </span>
                  </li>
                ))}
              </ol>
            );
          })()}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <Brain className="h-5 w-5" />
            Suggested reviewers
            {method && (
              <Badge variant="outline" className="text-[10px] font-normal">
                {method === 'vector' ? 'Ranked by semantic similarity' : 'Ranked by keyword match'}
              </Badge>
            )}
            {selected.length > 0 && <Badge variant="secondary">{selected.length} selected</Badge>}
          </CardTitle>
          {method === 'keyword' && (
            <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              Match % is the share of a reviewer's listed expertise keywords that appear in the paper. Reviewers who have
              not listed any expertise cannot be ranked; invite them from the other tab if needed.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner text="Finding reviewers..." />
          ) : error ? (
            <div className="py-6 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={load}>Try again</Button>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-semibold mb-1">No eligible reviewers matched</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Either no reviewer's listed expertise matches this paper, or everyone who does is excluded or at capacity.
                Ask reviewers to add expertise keywords in their dashboard, or invite someone from the other tab.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((c) => {
                const isSelected = selected.includes(c.userId);
                const atCap = c.activeLoad >= MAX_LOAD;
                return (
                  <label
                    key={c.userId}
                    className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                      atCap ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={atCap || !canAssign}
                      onCheckedChange={() => toggle(c.userId)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-sm">{c.fullName ?? 'Unnamed reviewer'}</h4>
                        <Badge variant="outline" className="font-mono text-[11px]">
                          {(c.similarity * 100).toFixed(0)}% match
                        </Badge>
                        <Badge variant={c.activeLoad === 0 ? 'secondary' : 'outline'} className="text-[11px]">
                          {c.activeLoad}/{MAX_LOAD} active reviews
                        </Badge>
                      </div>
                      {(c.affiliation || c.email) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {c.affiliation && (
                            <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{c.affiliation}</span>
                          )}
                          {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                        </div>
                      )}
                      {c.expertiseKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {c.expertiseKeywords.map((k) => (
                            <Badge key={k} variant="secondary" className="text-[10px] font-normal">{k}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}

              {selected.length > 0 && (
                <div className="flex gap-3 pt-3 border-t">
                  <Button onClick={assign} disabled={assigning || !canAssign}>
                    <Target className="h-4 w-4 mr-2" />
                    {assigning ? 'Assigning…' : `Assign ${selected.length} reviewer${selected.length === 1 ? '' : 's'}`}
                  </Button>
                  <Button variant="outline" onClick={() => setSelected([])} disabled={assigning}>Clear selection</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
