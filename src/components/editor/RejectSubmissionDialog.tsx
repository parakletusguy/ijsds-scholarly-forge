import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { XCircle } from 'lucide-react';
import { updateSubmission, getSubmission } from '@/lib/submissionService';
import { updateArticle } from '@/lib/articleService';
import { createRejectionMessage } from '@/lib/editorialService';

interface RejectSubmissionDialogProps {
  submissionId: string;
  onReject: () => void;
}

export const RejectSubmissionDialog = ({ submissionId, onReject }: RejectSubmissionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [suggestedCorrections, setSuggestedCorrections] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection message.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const submission = await getSubmission(submissionId);

      await updateSubmission(submissionId, { status: 'rejected' });

      if (submission?.article_id) {
        await updateArticle(submission.article_id, { status: 'rejected' });
      }

      await createRejectionMessage({
        submission_id: submissionId,
        message: message.trim(),
        suggested_corrections: suggestedCorrections.trim() || undefined,
      });

      toast({
        title: 'Submission Rejected',
        description: 'The submission has been rejected and the author has been notified.',
      });

      setOpen(false);
      setMessage('');
      setSuggestedCorrections('');
      onReject();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject submission. Please try again.',
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
            Provide feedback to the author explaining the reasons for rejection and any suggested improvements.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="message">Rejection Message *</Label>
            <Textarea
              id="message"
              placeholder="Explain the reasons for rejecting this submission..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-32"
            />
          </div>
          
          <div>
            <Label htmlFor="corrections">Suggested Corrections (Optional)</Label>
            <Textarea
              id="corrections"
              placeholder="Provide specific suggestions for improving the manuscript..."
              value={suggestedCorrections}
              onChange={(e) => setSuggestedCorrections(e.target.value)}
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleReject} disabled={loading}>
            {loading ? 'Rejecting...' : 'Reject Submission'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};