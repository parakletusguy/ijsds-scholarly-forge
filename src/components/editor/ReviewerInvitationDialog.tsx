
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserPlus, AlertCircle } from 'lucide-react';
import { sendEmailNotification, generateReviewInvitationEmail } from '@/lib/emailService';
import { ReviewStatusIndicator } from '@/components/review/ReviewStatusIndicator';

interface ReviewerInvitationDialogProps {
  submissionId: string;
  submissionTitle: string;
  onInvite: () => void;
}

interface Reviewer {
  id: string;
  full_name: string;
  email: string;
  affiliation: string;
}

export const ReviewerInvitationDialog = ({ submissionId, submissionTitle, onInvite }: ReviewerInvitationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingReviewers, setLoadingReviewers] = useState(false);

  useEffect(() => {
    if (open) {
      fetchReviewers();
      // Set default deadline to 3 weeks from now
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 21);
      setDeadlineDate(defaultDeadline.toISOString().split('T')[0]);
    }
  }, [open]);

  const fetchReviewers = async () => {
    setLoadingReviewers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, affiliation')
        .eq('is_reviewer', true);

      if (error) throw error;
      setReviewers(data || []);
    } catch (error) {
      console.error('Error fetching reviewers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch reviewers list.',
        variant: 'destructive',
      });
    } finally {
      setLoadingReviewers(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedReviewerId || !deadlineDate) {
      toast({
        title: 'Error',
        description: 'Please select a reviewer and set a deadline.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const selectedReviewer = reviewers.find(r => r.id === selectedReviewerId);
      if (!selectedReviewer) throw new Error('Reviewer not found');

      // Create review record
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          submission_id: submissionId,
          reviewer_id: selectedReviewerId,
          deadline_date: deadlineDate,
          invitation_status: 'pending',
          invitation_sent_at: new Date().toISOString(),
        });

      if (reviewError) throw reviewError;

      // Send email invitation
      const emailContent = generateReviewInvitationEmail(
        selectedReviewer.full_name,
        submissionTitle,
        new Date(deadlineDate).toLocaleDateString()
      );

      await sendEmailNotification({
        to: selectedReviewer.email,
        subject: `Review Invitation: ${submissionTitle}`,
        htmlContent: emailContent,
        type: 'review_invitation',
        userId: selectedReviewerId,
        submissionId: submissionId,
      });

      toast({
        title: 'Invitation Sent',
        description: `Review invitation sent to ${selectedReviewer.full_name}`,
      });

      setOpen(false);
      setSelectedReviewerId('');
      setCustomMessage('');
      onInvite();
    } catch (error) {
      console.error('Error sending review invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send review invitation.',
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
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Reviewer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite Reviewer</DialogTitle>
          <DialogDescription>
            Send a review invitation for: {submissionTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reviewer">Select Reviewer</Label>
            {loadingReviewers ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading reviewers...</span>
              </div>
            ) : reviewers.length === 0 ? (
              <div className="flex items-center gap-2 p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">No reviewers available. Please add reviewers to the system first.</span>
              </div>
            ) : (
              <Select value={selectedReviewerId} onValueChange={setSelectedReviewerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a reviewer..." />
                </SelectTrigger>
                <SelectContent>
                  {reviewers.map((reviewer) => (
                    <SelectItem key={reviewer.id} value={reviewer.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{reviewer.full_name}</span>
                        <span className="text-xs text-muted-foreground">{reviewer.affiliation}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Review Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Any additional instructions for the reviewer..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={loading}>
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
