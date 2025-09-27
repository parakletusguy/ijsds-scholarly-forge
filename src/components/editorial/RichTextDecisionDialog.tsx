import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';

interface RichTextDecisionDialogProps {
  submissionId: string;
  submissionTitle: string;
  authorEmail: string;
  authorName: string;
  onDecision: () => void;
  type: 'accept' | 'reject';
}

export const RichTextDecisionDialog = ({ 
  submissionId, 
  submissionTitle, 
  authorEmail, 
  authorName, 
  onDecision, 
  type 
}: RichTextDecisionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);

  const handleDecision = async () => {
    if (!comments.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide decision comments.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get submission to find article_id
      const { data: submission, error: fetchError } = await supabase
        .from('submissions')
        .select('article_id')
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;

      // Update submission status
      const newStatus = type === 'accept' ? 'accepted' : 'rejected';
      const { error: submissionError } = await supabase
        .from('submissions')
        .update({ 
          status: newStatus,
          ...(type === 'accept' && {
            approved_by_editor: true,
            approved_at: new Date().toISOString(),
            approved_by: user.id,
          })
        })
        .eq('id', submissionId);

      if (submissionError) throw submissionError;

      // Update article status
      if (submission?.article_id) {
        const { error: articleError } = await supabase
          .from('articles')
          .update({ status: newStatus })
          .eq('id', submission.article_id);

        if (articleError) throw articleError;
      }

      // Create editorial decision record
      const { error: decisionError } = await supabase
        .from('editorial_decisions')
        .insert({
          submission_id: submissionId,
          decision_type: type,
          decision_rationale: comments.trim(),
          editor_id: user.id,
        });

      if (decisionError) throw decisionError;

      toast({
        title: 'Decision Recorded',
        description: `Submission has been ${type === 'accept' ? 'accepted' : 'rejected'} successfully.`,
      });

      setOpen(false);
      setComments('');
      setPriority('normal');
      onDecision();
    } catch (error) {
      console.error(`Error ${type}ing submission:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${type} submission. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isAccept = type === 'accept';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={isAccept ? "default" : "destructive"} 
          size="sm"
        >
          {isAccept ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
          {isAccept ? 'Accept' : 'Reject'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isAccept ? 'Accept Submission' : 'Reject Submission'}
          </DialogTitle>
          <DialogDescription>
            Provide detailed feedback for: {submissionTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="priority">Decision Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="normal">Normal Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="comments">
              {isAccept ? 'Acceptance' : 'Rejection'} Comments *
            </Label>
            <Textarea
              id="comments"
              placeholder={
                isAccept 
                  ? "Explain why this submission is being accepted and any next steps..."
                  : "Explain the reasons for rejection and provide constructive feedback..."
              }
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-32"
            />
          </div>
          
          {isAccept && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> Accepting this submission will automatically trigger the publication workflow and attempt to generate a DOI.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant={isAccept ? "default" : "destructive"} 
            onClick={handleDecision} 
            disabled={loading}
          >
            {loading ? 
              (isAccept ? 'Accepting...' : 'Rejecting...') : 
              (isAccept ? 'Accept Submission' : 'Reject Submission')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};