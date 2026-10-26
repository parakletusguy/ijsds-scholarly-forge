import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Check, X, ExternalLink, Mail, User } from 'lucide-react';
import { decideReviewerApplication, type ReviewerApplication } from '@/lib/reviewerApplicationService';

/** Admin view of one reviewer application, with every submitted detail as a link to verify. */
export const ReviewerApplicationCard = ({ application: a, onDecided }: { application: ReviewerApplication; onDecided: () => void }) => {
  const { toast } = useToast();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const decide = async (approve: boolean) => {
    setBusy(true);
    try {
      await decideReviewerApplication(a.id, approve, approve ? undefined : reason);
      toast({ title: approve ? 'Approved' : 'Declined', description: `${a.full_name} has been emailed the decision.` });
      onDecided();
    } catch (e) {
      toast({ title: "Couldn't save the decision", description: e instanceof Error ? e.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const link = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline break-all">
      {label} <ExternalLink size={11} className="shrink-0" />
    </a>
  );

  return (
    <div className="bg-white border border-stone-200 p-5 space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 bg-stone-100 text-stone-500 flex items-center justify-center shrink-0"><User size={20} /></div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-stone-800">{a.full_name}</h3>
          <p className="text-xs text-stone-400">Applied {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-stone-500">Account email</dt><dd className="text-stone-800 break-all">{a.applicant?.email ?? '—'}</dd>
        <dt className="text-stone-500">Institutional email</dt>
        <dd><a href={`mailto:${a.institutional_email}`} className="inline-flex items-center gap-1 text-primary hover:underline break-all"><Mail size={12} />{a.institutional_email}</a></dd>
        <dt className="text-stone-500">ORCID iD</dt><dd>{link(`https://orcid.org/${a.orcid_id}`, a.orcid_id)}</dd>
        <dt className="text-stone-500">ResearchGate</dt><dd>{link(a.researchgate_url, a.researchgate_url)}</dd>
        <dt className="text-stone-500">Google Scholar</dt><dd>{link(a.google_scholar_url, 'Open profile')}</dd>
      </dl>
      {declining && (
        <div className="space-y-2">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional, included in the email to the applicant)" />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {!declining ? (
          <>
            <Button disabled={busy} onClick={() => decide(true)} className="bg-primary hover:bg-[#7a2d11] text-white rounded-none h-10 px-5 text-[10px] font-bold uppercase tracking-widest gap-1.5">
              <Check size={14} /> Approve
            </Button>
            <Button disabled={busy} variant="outline" onClick={() => setDeclining(true)} className="rounded-none h-10 px-5 text-[10px] font-bold uppercase tracking-widest border-stone-200 hover:border-primary hover:text-primary gap-1.5">
              <X size={14} /> Decline
            </Button>
          </>
        ) : (
          <>
            <Button disabled={busy} variant="outline" onClick={() => decide(false)} className="rounded-none h-10 px-5 text-[10px] font-bold uppercase tracking-widest border-red-200 text-red-700 hover:bg-red-50 gap-1.5">
              <X size={14} /> Confirm decline
            </Button>
            <Button disabled={busy} variant="ghost" onClick={() => setDeclining(false)} className="rounded-none h-10 px-5 text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
          </>
        )}
      </div>
    </div>
  );
};
