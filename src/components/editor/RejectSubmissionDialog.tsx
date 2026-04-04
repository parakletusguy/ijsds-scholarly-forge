import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { XCircle } from 'lucide-react';
import { updateArticle } from '@/lib/articleService';
import { createEditorialDecision, createRejectionMessage } from '@/lib/editorialService';
import { useAuth } from '@/hooks/useAuth';

interface RejectSubmissionDialogProps {
  submissionId: string;
  articleId: string;
  onReject: () => void;
}

export const RejectSubmissionDialog = ({ submissionId, articleId, onReject }: RejectSubmissionDialogProps) => {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [suggestedCorrections, setSuggestedCorrections] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!message.trim()) {
      toast({ title: 'Error', description: 'Please provide a rejection message.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Creates editorial decision, sets submission status to 'rejected',
      // writes audit log, and sends decision email to author.
      await createEditorialDecision({
        submission_id: submissionId,
        decision_type: 'reject',
        decision_rationale: message.trim(),
        role: profile?.role || 'editor'
      });

      // Sync article status
      await updateArticle(articleId, { 
        status: 'rejected',
        role: profile?.role || 'editor'
      });

      // Store detailed rejection feedback for author reference
      await createRejectionMessage({
        submission_id: submissionId,
        message: message.trim(),
        suggested_corrections: suggestedCorrections.trim() || undefined,
        role: profile?.role || 'editor'
      });

      toast({
        title: 'Submission Rejected',
        description: 'The submission has been rejected and the author notified.',
      });

      setOpen(false);
      setMessage('');
      setSuggestedCorrections('');
      onReject();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to reject submission.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <XCircle className="h-4 w-4 mr-2" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reject Submission</DialogTitle>
          <DialogDescription>
            Provide feedback explaining the rejection. The author will be notified with this message.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="message">Rejection Message *</Label>
            <Textarea
              id="message"
              placeholder="Explain the reasons for rejecting this submission…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-32"
            />
          </div>
          <div>
            <Label htmlFor="corrections">Suggested Corrections (Optional)</Label>
            <Textarea
              id="corrections"
              placeholder="Provide specific suggestions for improving the manuscript…"
              value={suggestedCorrections}
              onChange={(e) => setSuggestedCorrections(e.target.value)}
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleReject} disabled={loading}>
            {loading ? 'Rejecting…' : 'Reject Submission'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
