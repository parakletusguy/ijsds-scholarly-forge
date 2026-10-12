import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Check, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getMyWithdrawals, requestWithdrawal, type Withdrawal } from "@/lib/ijsds2/api";

const MIN_PAYOUT = 1000;

interface ReviewerReferralCardProps {
  referralCode: string;
  walletBalanceNaira: number;
}

export const ReviewerReferralCard: React.FC<ReviewerReferralCardProps> = ({
  referralCode,
  walletBalanceNaira,
}) => {
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(walletBalanceNaira);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Withdrawal[]>([]);
  const [form, setForm] = useState({ amount: "", bank_name: "", account_number: "", account_name: "" });

  useEffect(() => setBalance(walletBalanceNaira), [walletBalanceNaira]);
  useEffect(() => { getMyWithdrawals().then(setHistory).catch(() => {}); }, []);

  const submitPayout = async () => {
    setBusy(true);
    try {
      const w = await requestWithdrawal({ ...form, amount: Number(form.amount) });
      setBalance((b) => b - w.amount_naira);
      setHistory((h) => [w, ...h]);
      setOpen(false);
      setForm({ amount: "", bank_name: "", account_number: "", account_name: "" });
      toast({ title: "Payout requested", description: "An administrator will transfer the amount and confirm here." });
    } catch (e: any) {
      toast({ title: "Couldn't request payout", description: e?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };
  const referralLink = `${window.location.origin}/submit?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Referral Link Copied",
      description: "Share this link with submitting researchers.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Reviewer Referral Incentive Program
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            ₦1,000 / Settled Paper
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
          <div className="flex items-center gap-2.5">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                Referral Wallet Balance
              </span>
              <p className="text-lg font-bold font-mono text-emerald-600">
                ₦{balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs" disabled={balance < MIN_PAYOUT} onClick={() => setOpen(true)}>
            Request Payout
          </Button>
        </div>

        {history.length > 0 && (
          <ul className="text-[11px] space-y-1">
            {history.slice(0, 4).map((w) => (
              <li key={w.id} className="flex justify-between text-muted-foreground">
                <span>₦{w.amount_naira.toLocaleString()} · {new Date(w.created_at).toLocaleDateString("en-GB")}</span>
                <span className={w.status === "PAID" ? "text-emerald-600 font-semibold" : w.status === "REJECTED" ? "text-destructive font-semibold" : ""}>
                  {w.status}{w.status === "REJECTED" && w.note ? ` — ${w.note}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request referral payout</DialogTitle>
              <DialogDescription>Minimum ₦{MIN_PAYOUT.toLocaleString()}. Payouts are transferred manually to your Nigerian bank account.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Amount (₦)" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              <Input placeholder="Bank name" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
              <Input placeholder="10-digit account number" inputMode="numeric" maxLength={10} value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, "") })} />
              <Input placeholder="Account name" value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} />
              <Button className="w-full" disabled={busy} onClick={submitPayout}>{busy ? "Submitting…" : "Submit request"}</Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Your Personal Referral Code</label>
          <div className="flex items-center gap-2">
            <div className="bg-muted px-3 py-1.5 rounded font-mono font-bold tracking-wider text-sm border flex-1 text-center">
              {referralCode}
            </div>
            <Button size="sm" onClick={handleCopy} className="gap-1.5 shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1 text-[11px] text-muted-foreground leading-relaxed">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            <strong className="text-foreground font-semibold">COPE Ethical Conflict Firewall:</strong> By journal policy, 
            you are automatically excluded from peer reviewing any manuscript submitted using your referral code.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
