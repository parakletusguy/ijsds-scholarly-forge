import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createEditorialDecision } from '@/lib/editorialService';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/apiClient';

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
      await createEditorialDecision({
        submission_id: submissionId,
        decision_type: type,
        decision_rationale: comments.trim(),
      });

      toast({
        title: 'Decision Recorded',
        description: `Submission has been ${type === 'accept' ? 'accepted' : 'rejected'} successfully.`,
      });

      setOpen(false);
      setComments('');
      setPriority('normal');
      onDecision();
    } catch (error: any) {
      console.error(`Error ${type}ing submission:`, error);
      toast({
        title: 'Error',
        description: error?.message || `Failed to ${type} submission. Please try again.`,
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