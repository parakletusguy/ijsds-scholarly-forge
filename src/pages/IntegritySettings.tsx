import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import { getIntegrityConfig, saveIntegrityConfig, type IntegrityConfig } from '@/lib/ijsds2/api';

type History = Array<{ id: string; created_at: string; reason: string | null }>;

const Num = ({ label, value, onChange, step = 0.01 }: { label: string; value: number; onChange: (n: number) => void; step?: number }) => (
  <label className="block text-xs">
    <span className="text-stone-500">{label}</span>
    <Input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 rounded-none" />
  </label>
);

export const IntegritySettings = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = !!profile?.is_admin;
  const [cfg, setCfg] = useState<IntegrityConfig | null>(null);
  const [history, setHistory] = useState<History>([]);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const r = await getIntegrityConfig();
    const { id: _id, ...rest } = r.active;
    setCfg(rest as IntegrityConfig);
    setHistory(r.history);
  };

  useEffect(() => {
    if (loading) return;
    if (!user || !(isAdmin || profile?.is_editor)) { navigate('/dashboard'); return; }
    load().catch((e) => toast({ title: "Couldn't load settings", description: e?.message, variant: 'destructive' }));
  }, [user, profile, loading]);

  const save = async () => {
    if (!cfg) return;
    setSaving(true);
    try {
      await saveIntegrityConfig(cfg, reason);
      toast({ title: 'Thresholds saved', description: 'New audits use this revision; past audits keep the one they ran under.' });
      setReason('');
      await load();
    } catch (e: any) { toast({ title: "Couldn't save", description: e?.message, variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  if (!cfg) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  const set = <K extends keyof IntegrityConfig>(k: K, v: IntegrityConfig[K]) => setCfg({ ...cfg, [k]: v });

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <PageHeader title="Integrity" subtitle="Thresholds" accent="Stage 2" description="Score thresholds are editorial configuration with a change history. AI-risk can only ever trigger clarification or human review, never rejection." />
      <ContentSection dark>
        <Button onClick={() => navigate(-1)} variant="outline" className="rounded-none h-10 text-[10px] font-bold uppercase tracking-widest mb-6 gap-2"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
        <fieldset disabled={!isAdmin} className="bg-white border border-stone-200 p-6 space-y-6">
          {!isAdmin && <p className="text-xs text-amber-700">Read-only: only administrators can change thresholds.</p>}
          <section className="space-y-2"><h3 className="font-semibold text-sm">Similarity (0–1)</h3>
            <div className="grid grid-cols-3 gap-3">
              <Num label="Moderate → revision" value={cfg.plagiarism.moderate} onChange={(n) => set('plagiarism', { ...cfg.plagiarism, moderate: n })} />
              <Num label="High" value={cfg.plagiarism.high} onChange={(n) => set('plagiarism', { ...cfg.plagiarism, high: n })} />
              <Num label="Critical → editor confirms" value={cfg.plagiarism.critical} onChange={(n) => set('plagiarism', { ...cfg.plagiarism, critical: n })} />
            </div></section>
          <section className="space-y-2"><h3 className="font-semibold text-sm">AI-authorship risk (0–1)</h3>
            <div className="grid grid-cols-2 gap-3">
              <Num label="Medium band" value={cfg.ai.medium} onChange={(n) => set('ai', { ...cfg.ai, medium: n })} />
              <Num label="High → ask for AI-use disclosure" value={cfg.ai.high} onChange={(n) => set('ai', { ...cfg.ai, high: n })} />
            </div></section>
          <section className="space-y-2"><h3 className="font-semibold text-sm">Citations & structure</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Num label="Max unresolved ratio" value={cfg.citations.max_unresolved_ratio} onChange={(n) => set('citations', { ...cfg.citations, max_unresolved_ratio: n })} />
              <Num label="Max uncited references" step={1} value={cfg.citations.max_uncited_references} onChange={(n) => set('citations', { ...cfg.citations, max_uncited_references: n })} />
              <Num label="Min relevance" value={cfg.citations.min_relevance} onChange={(n) => set('citations', { ...cfg.citations, min_relevance: n })} />
              <Num label="Min word count" step={50} value={cfg.structure.min_word_count} onChange={(n) => set('structure', { min_word_count: n })} />
            </div></section>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <Num label="Related-paper list size" step={1} value={cfg.related_list_size} onChange={(n) => set('related_list_size', n)} />
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={cfg.auto_reject_structural} onChange={(e) => set('auto_reject_structural', e.target.checked)} /> Auto-reject structural failures</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={cfg.expose_raw_ai_score} onChange={(e) => set('expose_raw_ai_score', e.target.checked)} /> Show raw AI score to authors</label>
          </section>
          <div className="flex gap-3">
            <Input placeholder="Reason for change (kept in history)" value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-none" />
            <Button onClick={save} disabled={saving || !reason.trim()}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </fieldset>
        <div className="mt-8 bg-white border border-stone-200 p-6">
          <h3 className="font-semibold text-sm mb-3">Change history</h3>
          <ul className="text-xs space-y-1.5 text-stone-600">
            {history.map((h) => <li key={h.id}>{new Date(h.created_at).toLocaleString()} — {h.reason ?? '—'}</li>)}
          </ul>
        </div>
      </ContentSection>
    </div>
  );
};
