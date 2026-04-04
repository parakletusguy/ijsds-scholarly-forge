import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';
import { createEditorialDecision } from '@/lib/editorialService';
import { updateArticle } from '@/lib/articleService';
import { useAuth } from '@/hooks/useAuth';

interface ApproveSubmissionDialogProps {
  submissionId: string;
  articleId: string;
  onApprove: () => void;
  disabled?: boolean;
}

export const ApproveSubmissionDialog = ({ submissionId, articleId, onApprove, disabled }: ApproveSubmissionDialogProps) => {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      // Creates editorial decision, updates submission status to 'accepted',
      // writes audit log, and sends decision email — all in one backend transaction.
      await createEditorialDecision({
        submission_id: submissionId,
        decision_type: 'accept',
        role: profile?.role || 'editor'
      });

      // Sync article status separately (editorial-decisions only updates submission status)
      await updateArticle(articleId, { 
        status: 'accepted',
        role: profile?.role || 'editor'
      });

      toast({
        title: 'Submission Approved',
        description: 'Manuscript accepted and author notified.',
      });

      setOpen(false);
      onApprove();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to approve submission.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" disabled={disabled}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve for Publication
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Submission</DialogTitle>
          <DialogDescription>
            This will accept the submission, update its status, record the editorial decision, and notify the author.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleApprove} disabled={loading}>
            {loading ? 'Approving…' : 'Approve for Publication'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
