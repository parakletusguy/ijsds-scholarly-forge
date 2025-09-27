
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { XCircle } from 'lucide-react';
import { sendEmailNotification, generateStatusChangeEmail } from '@/lib/emailService';

interface DeskRejectDialogProps {
  submissionId: string;
  submissionTitle: string;
  authorEmail: string;
  authorName: string;
  onReject: () => void;
}

export const DeskRejectDialog = ({ submissionId, submissionTitle, authorEmail, authorName, onReject }: DeskRejectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeskReject = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for desk rejection.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Get submission to find article_id
      const { data: submission, error: fetchError } = await supabase
        .from('submissions')
        .select('article_id')
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;

      // Update submission status
      const { error: submissionError } = await supabase
        .from('submissions')
        .update({ status: 'desk_rejected' })
        .eq('id', submissionId);

      if (submissionError) throw submissionError;

      // Update article status
      if (submission?.article_id) {
        const { error: articleError } = await supabase
          .from('articles')
          .update({ status: 'rejected' })
          .eq('id', submission.article_id);

        if (articleError) throw articleError;
      }

      // Create editorial decision
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: decisionError } = await supabase
        .from('editorial_decisions')
        .insert({
          submission_id: submissionId,
          editor_id: user.id,
          decision_type: 'desk_rejection',
          decision_rationale: reason,
        });

      if (decisionError) throw decisionError;

      // Send email notification to author
      const emailContent = generateStatusChangeEmail(
        authorName,
        submissionTitle,
        'rejected',
        `Your submission has been desk rejected for the following reason:\n\n${reason}`
      );

      await sendEmailNotification({
        to: authorEmail,
        subject: `Submission Decision: ${submissionTitle}`,
        htmlContent: emailContent,
        type: 'desk_rejection',
        submissionId: submissionId,
      });

      toast({
        title: 'Submission Desk Rejected',
        description: 'The author has been notified of the decision.',
      });

      setOpen(false);
      setReason('');
      onReject();
    } catch (error) {
      console.error('Error desk rejecting submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to desk reject submission.',
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
          Desk Reject
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Desk Rejection</DialogTitle>
          <DialogDescription>
            This will immediately reject the submission without peer review. The author will be notified.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for Desk Rejection *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a clear reason for the desk rejection..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-32"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeskReject} disabled={loading}>
            {loading ? 'Processing...' : 'Desk Reject Submission'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
