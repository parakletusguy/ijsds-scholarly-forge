import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Check, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReviewerReferralCardProps {
  referralCode: string;
  walletBalanceNaira: number;
}

export const ReviewerReferralCard: React.FC<ReviewerReferralCardProps> = ({
  referralCode,
  walletBalanceNaira,
}) => {
  const [copied, setCopied] = useState(false);
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
                ₦{walletBalanceNaira.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs" disabled={walletBalanceNaira < 5000}>
            Request Payout
          </Button>
        </div>

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
