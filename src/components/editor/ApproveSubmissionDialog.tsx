import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

interface ApproveSubmissionDialogProps {
  submissionId: string;
  onApprove: () => void;
  disabled?: boolean;
}

export const ApproveSubmissionDialog = ({ submissionId, onApprove, disabled }: ApproveSubmissionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update submission with approval
      const { error } = await supabase
        .from('submissions')
        .update({
          status: 'accepted',
          approved_by_editor: true,
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: 'Submission Approved',
        description: 'The submission has been approved for publication.',
      });

      setOpen(false);
      onApprove();
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve submission. Please try again.',
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
            Are you sure you want to approve this submission for publication? This action will mark the submission as accepted and ready for publication.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={loading}>
            {loading ? 'Approving...' : 'Approve for Publication'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};