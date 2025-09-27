import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { XCircle } from 'lucide-react';

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
      // Get submission to find article_id
      const { data: submission, error: fetchError } = await supabase
        .from('submissions')
        .select('article_id')
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;

      // Update submission status to rejected
      const { error: submissionError } = await supabase
        .from('submissions')
        .update({ status: 'rejected' })
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

      // Create rejection message
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: messageError } = await supabase
        .from('rejection_messages')
        .insert({
          submission_id: submissionId,
          message: message.trim(),
          suggested_corrections: suggestedCorrections.trim() || null,
          created_by: user.id,
        });

      if (messageError) throw messageError;

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