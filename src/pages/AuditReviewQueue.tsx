import { useEffect, useState } from 'react';
import { isEditorUser } from '@/lib/roleUtils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import { AuthorIntegrityReportModal } from '@/components/ijsds2/AuthorIntegrityReportModal';
import { getReviewQueue, getAuditReport, resolveAudit, requeueAudit, type ReviewQueueItem } from '@/lib/ijsds2/api';
import type { AuthorAuditReport } from '@/types/ijsds2';

const OUTCOMES = [
  { v: 'AUDIT_PASSED_PENDING_APC', label: 'Clear (author may pay Gate 2)' },
  { v: 'AUDIT_REVISION_REQUESTED', label: 'Request revision (free re-audit)' },
  { v: 'AUDIT_REJECTED', label: 'Reject (new submission + fee needed)' },
];

export const AuditReviewQueue = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const isStaff = isEditorUser(profile);
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [busy, setBusy] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState(OUTCOMES[1].v);
  const [reason, setReason] = useState('');
  const [report, setReport] = useState<AuthorAuditReport | null>(null);

  const load = async () => {
    setBusy(true);
    try { setItems(await getReviewQueue()); }
    catch (e: any) { toast({ title: "Couldn't load the queue", description: e?.message, variant: 'destructive' }); }
    finally { setBusy(false); }
  };

  useEffect(() => {
    if (loading) return;
    if (!user || !isStaff) { navigate('/dashboard'); return; }
    load();
  }, [user, profile, loading]);

  const viewReport = async (id: string) => {
    try { setReport(await getAuditReport(id)); }
    catch (e: any) { toast({ title: 'No report yet', description: e?.message, variant: 'destructive' }); }
  };

  const resolve = async (id: string) => {
    try {
      await resolveAudit(id, outcome, reason);
      toast({ title: 'Audit resolved', description: 'Your decision is recorded against your account.' });
      setOpenId(null); setReason('');
      load();
    } catch (e: any) { toast({ title: "Couldn't resolve", description: e?.message, variant: 'destructive' }); }
  };

  const requeue = async (id: string) => {
    try { await requeueAudit(id); toast({ title: 'Audit re-queued' }); load(); }
    catch (e: any) { toast({ title: "Couldn't re-queue", description: e?.message, variant: 'destructive' }); }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <PageHeader title="Audit" subtitle="Review Queue" accent="Stage 2" description="Integrity audits that could not be cleared automatically: a high plagiarism score, an AI-risk flag, or a provider failure. Nothing here has been cleared; your decision is recorded and auditable." />
      <ContentSection dark>
        <Button onClick={() => navigate(-1)} variant="outline" className="rounded-none h-10 text-[10px] font-bold uppercase tracking-widest mb-6 gap-2"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
        {busy ? <p className="text-sm text-stone-400">Loading…</p> : items.length === 0 ? (
          <div className="bg-white border border-stone-200 py-16 text-center text-sm text-stone-400">No audits waiting for review.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="bg-white border border-stone-200 p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-stone-900">{it.manuscript.title}</p>
                    <p className="text-[11px] text-stone-500">Revision #{it.revision_no} · queued {new Date(it.created_at).toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className={it.status === 'FAILED' ? 'border-destructive text-destructive' : ''}>{it.status.replace('_', ' ')}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {it.policy_rules_hit.map((r) => <Badge key={r} variant="secondary" className="text-[10px] font-mono">{r.replace('RULE_', '')}</Badge>)}
                </div>
                {it.last_error && <p className="text-[11px] font-mono text-amber-700 break-all">{it.last_error}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => viewReport(it.id)}><ShieldCheck className="h-3.5 w-3.5 mr-1" /> Evidence</Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/submission/${it.manuscript.submission_id}/details`)}>Manuscript</Button>
                  <Button size="sm" variant="outline" onClick={() => requeue(it.id)}>Re-run audit</Button>
                  <Button size="sm" onClick={() => setOpenId(openId === it.id ? null : it.id)}>Resolve…</Button>
                </div>
                {openId === it.id && (
                  <div className="border-t pt-3 space-y-2">
                    <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="w-full border border-stone-200 h-10 px-2 text-sm">
                      {OUTCOMES.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
                    </select>
                    <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for this decision (required, min 10 characters; stored with your name)" />
                    <Button size="sm" disabled={reason.trim().length < 10} onClick={() => resolve(it.id)}>Record decision</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <AuthorIntegrityReportModal open={!!report} onOpenChange={(o) => !o && setReport(null)} report={report} />
      </ContentSection>
    </div>
  );
};
