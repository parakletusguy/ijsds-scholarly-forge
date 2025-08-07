
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FileEdit } from 'lucide-react';
import { sendEmailNotification, generateStatusChangeEmail } from '@/lib/emailService';

interface RevisionRequestDialogProps {
  submissionId: string;
  submissionTitle: string;
  authorEmail: string;
  authorName: string;
  onRequest: () => void;
}

export const RevisionRequestDialog = ({ submissionId, submissionTitle, authorEmail, authorName, onRequest }: RevisionRequestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [revisionType, setRevisionType] = useState<'minor' | 'major'>('minor');
  const [requestDetails, setRequestDetails] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestRevision = async () => {
    if (!requestDetails.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide revision details.',
        variant: 'destructive',
      });
      return;
    }

    if (!deadlineDate) {
      toast({
        title: 'Error',
        description: 'Please set a revision deadline.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update submission status
      const { error: submissionError } = await supabase
        .from('submissions')
        .update({ status: 'revision_requested' })
        .eq('id', submissionId);

      if (submissionError) throw submissionError;

      // Create revision request
      const { error: revisionError } = await supabase
        .from('revision_requests')
        .insert({
          submission_id: submissionId,
          requested_by: user.id,
          revision_type: revisionType,
          request_details: requestDetails,
          deadline_date: deadlineDate,
        });

      if (revisionError) throw revisionError;

      // Create editorial decision
      const { error: decisionError } = await supabase
        .from('editorial_decisions')
        .insert({
          submission_id: submissionId,
          editor_id: user.id,
          decision_type: 'revision_requested',
          decision_rationale: `${revisionType} revision requested`,
        });

      if (decisionError) throw decisionError;

      // Send email notification to author
      const emailContent = generateStatusChangeEmail(
        authorName,
        submissionTitle,
        'revision_requested',
        `A ${revisionType} revision has been requested for your submission. Please address the following points:\n\n${requestDetails}\n\nRevision deadline: ${new Date(deadlineDate).toLocaleDateString()}`
      );

      await sendEmailNotification({
        to: authorEmail,
        subject: `Revision Requested: ${submissionTitle}`,
        htmlContent: emailContent,
        type: 'revision_request',
        submissionId: submissionId,
      });

      toast({
        title: 'Revision Requested',
        description: 'The author has been notified of the revision request.',
      });

      setOpen(false);
      setRequestDetails('');
      setDeadlineDate('');
      onRequest();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: 'Error',
        description: 'Failed to request revision.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileEdit className="h-4 w-4 mr-2" />
          Request Revision
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Revision</DialogTitle>
          <DialogDescription>
            Request revisions from the author for: {submissionTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Revision Type</Label>
            <Select value={revisionType} onValueChange={(value: 'minor' | 'major') => setRevisionType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Minor Revision</SelectItem>
                <SelectItem value="major">Major Revision</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Revision Details *</Label>
            <Textarea
              id="details"
              placeholder="Please provide detailed revision requirements..."
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              className="min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Revision Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRequestRevision} disabled={loading}>
            {loading ? 'Sending...' : 'Send Revision Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
