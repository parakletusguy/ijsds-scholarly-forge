import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { submitReviewerApplication, isValidOrcid, type ReviewerApplicationInput } from '@/lib/reviewerApplicationService';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults: { full_name?: string | null; orcid_id?: string | null };
  onSubmitted: () => void;
}

const FREE_MAIL = /@(gmail|googlemail|yahoo|ymail|hotmail|outlook|live|msn|icloud|me|aol|proton|protonmail|gmx|mail|zoho|yandex)\.[a-z.]+$/i;

const validate = (f: ReviewerApplicationInput) => {
  const e: Partial<Record<keyof ReviewerApplicationInput, string>> = {};
  if (f.full_name.trim().length < 3) e.full_name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.institutional_email.trim())) e.institutional_email = 'Enter a valid email address.';
  else if (FREE_MAIL.test(f.institutional_email.trim())) e.institutional_email = 'Use your institutional email, not a personal Gmail/Yahoo/Outlook address.';
  if (!isValidOrcid(f.orcid_id)) e.orcid_id = 'Enter a valid ORCID iD, e.g. 0000-0002-1825-0097.';
  if (!/^https?:\/\/([a-z0-9-]+\.)*researchgate\.net\//i.test(f.researchgate_url.trim())) e.researchgate_url = 'Enter your ResearchGate profile link (https://www.researchgate.net/profile/…).';
  if (!/^https?:\/\/scholar\.google\.[a-z.]+\//i.test(f.google_scholar_url.trim())) e.google_scholar_url = 'Enter your Google Scholar profile link (https://scholar.google.com/citations?user=…).';
  return e;
};

const FIELDS: { key: keyof ReviewerApplicationInput; label: string; placeholder: string; type?: string; hint?: string }[] = [
  { key: 'full_name', label: 'Full name', placeholder: 'e.g. Dr. Ada Obi' },
  { key: 'institutional_email', label: 'Institutional email', placeholder: 'name@university.edu.ng', type: 'email', hint: 'Your university or institute address.' },
  { key: 'orcid_id', label: 'ORCID iD', placeholder: '0000-0000-0000-0000' },
  { key: 'researchgate_url', label: 'ResearchGate profile URL', placeholder: 'https://www.researchgate.net/profile/…', type: 'url' },
  { key: 'google_scholar_url', label: 'Google Scholar profile URL', placeholder: 'https://scholar.google.com/citations?user=…', type: 'url' },
];

export const ReviewerApplicationDialog = ({ open, onOpenChange, defaults, onSubmitted }: Props) => {
  const { toast } = useToast();
  const [form, setForm] = useState<ReviewerApplicationInput>({ full_name: '', institutional_email: '', orcid_id: '', researchgate_url: '', google_scholar_url: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ReviewerApplicationInput, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm((f) => ({ ...f, full_name: f.full_name || defaults.full_name || '', orcid_id: f.orcid_id || defaults.orcid_id || '' }));
  }, [open]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    try {
      await submitReviewerApplication(form);
      toast({ title: 'Application received', description: "It's now under review. We've emailed you a confirmation." });
      onOpenChange(false);
      onSubmitted();
    } catch (err) {
      toast({ title: "Couldn't submit application", description: err instanceof Error ? err.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to become a reviewer</DialogTitle>
          <DialogDescription>
            The editorial office verifies these details before approving reviewers. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`ra-${f.key}`}>{f.label}</Label>
              <Input
                id={`ra-${f.key}`}
                type={f.type ?? 'text'}
                value={form[f.key]}
                placeholder={f.placeholder}
                aria-invalid={!!errors[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="rounded-none"
              />
              {errors[f.key] ? (
                <p className="text-xs text-destructive">{errors[f.key]}</p>
              ) : f.hint ? (
                <p className="text-xs text-muted-foreground">{f.hint}</p>
              ) : null}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className="rounded-none" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" className="rounded-none" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit application'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
