import { useEffect, useState } from 'react';
import { isAdminUser } from '@/lib/roleUtils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import { getAllWithdrawals, processWithdrawal, type Withdrawal } from '@/lib/ijsds2/api';

export const ReferralPayouts = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Withdrawal[]>([]);
  const [filter, setFilter] = useState('REQUESTED');

  const load = () => getAllWithdrawals(filter || undefined).then(setRows).catch((e) => toast({ title: "Couldn't load payouts", description: e?.message, variant: 'destructive' }));

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdminUser(profile)) { navigate('/dashboard'); return; }
    load();
  }, [user, profile, loading, filter]);

  const act = async (id: string, outcome: 'PAID' | 'REJECTED') => {
    let note: string | undefined;
    if (outcome === 'REJECTED') {
      note = window.prompt('Reason for rejecting (shown to the reviewer):') ?? undefined;
      if (!note?.trim()) return;
    } else if (!window.confirm('Confirm you have already transferred this amount to the account shown.')) return;
    try { await processWithdrawal(id, outcome, note); load(); }
    catch (e: any) { toast({ title: "Couldn't update", description: e?.message, variant: 'destructive' }); }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <PageHeader title="Referral" subtitle="Payouts" accent="Administration" description="Reviewer referral wallet withdrawals. Transfer the money first, then mark the request paid. Rejecting refunds the wallet." />
      <ContentSection dark>
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => navigate(-1)} variant="outline" className="rounded-none h-10 text-[10px] font-bold uppercase tracking-widest gap-2"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-stone-200 h-10 px-2 text-sm bg-white">
            <option value="REQUESTED">Awaiting payment</option><option value="PAID">Paid</option><option value="REJECTED">Rejected</option><option value="">All</option>
          </select>
        </div>
        {rows.length === 0 ? <div className="bg-white border border-stone-200 py-16 text-center text-sm text-stone-400">Nothing here.</div> : (
          <div className="space-y-3">
            {rows.map((w) => (
              <div key={w.id} className="bg-white border border-stone-200 p-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <p className="font-semibold">₦{w.amount_naira.toLocaleString()} — {w.reviewer?.full_name ?? w.reviewer?.email}</p>
                  <p className="text-xs text-stone-500">{w.bank_name} · {w.account_number} · {w.account_name}</p>
                  <p className="text-[11px] text-stone-400">{new Date(w.created_at).toLocaleString()}{w.note ? ` · ${w.note}` : ''}</p>
                </div>
                {w.status === 'REQUESTED' ? (
                  <div className="flex gap-2"><Button size="sm" onClick={() => act(w.id, 'PAID')}>Mark paid</Button><Button size="sm" variant="outline" onClick={() => act(w.id, 'REJECTED')}>Reject</Button></div>
                ) : <Badge variant="outline">{w.status}</Badge>}
              </div>
            ))}
          </div>
        )}
      </ContentSection>
    </div>
  );
};
