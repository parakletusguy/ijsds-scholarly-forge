import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { releaseArticleNow } from "@/lib/ijsds2/api";

interface ReleaseNowDialogProps {
  articleId: string;
  title: string;
  onReleased: () => void;
}

/** Publishes a single article outside the monthly batch. The reason goes into the audit trail. */
export const ReleaseNowDialog = ({ articleId, title, onReleased }: ReleaseNowDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await releaseArticleNow(articleId, reason.trim());
      toast({ title: "Published", description: "The article is live. Authors are being notified." });
      setOpen(false);
      setReason("");
      onReleased();
    } catch (err) {
      toast({ title: "Could not publish", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Send className="h-3.5 w-3.5" /> Publish now
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish outside the monthly release?</DialogTitle>
          <DialogDescription>
            "{title}" will be published immediately instead of on the 28th. Its volume, issue and DOI stay as registered.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={`release-reason-${articleId}`}>Reason (kept in the audit trail)</Label>
          <Textarea
            id={`release-reason-${articleId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Cleared production a day after the October release"
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy || reason.trim().length < 5}>
            {busy ? "Publishing…" : "Publish now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
