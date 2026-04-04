import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { FileEdit } from 'lucide-react';
import { createRevisionRequest, createEditorialDecision } from '@/lib/editorialService';
import { useAuth } from '@/hooks/useAuth';

interface RevisionRequestDialogProps {
  submissionId: string;
  submissionTitle: string;
  authorEmail: string;
  authorName: string;
  onRequest: () => void;
}

export const RevisionRequestDialog = ({
  submissionId,
  submissionTitle,
  onRequest,
}: RevisionRequestDialogProps) => {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [revisionType, setRevisionType] = useState<'minor' | 'major'>('minor');
  const [requestDetails, setRequestDetails] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestRevision = async () => {
    if (!requestDetails.trim()) {
      toast({ title: 'Error', description: 'Please provide revision details.', variant: 'destructive' });
      return;
    }
    if (!deadlineDate) {
      toast({ title: 'Error', description: 'Please set a revision deadline.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // 1. Create revision request record → backend sets status to 'revision_requested' + audit log
      await createRevisionRequest({
        submission_id: submissionId,
        revision_type: revisionType,
        request_details: requestDetails,
        deadline_date: deadlineDate,
        role: profile?.role || 'editor'
      });

      // 2. Create editorial decision → backend sets status (idempotent) + audit log + sends decision email to author
      await createEditorialDecision({
        submission_id: submissionId,
        decision_type: revisionType === 'minor' ? 'minor_revision' : 'major_revision',
        decision_rationale: requestDetails,
        role: profile?.role || 'editor'
      });

      toast({
        title: 'Revision Requested',
        description: 'Revision details saved and author notified by email.',
      });

      setOpen(false);
      setRequestDetails('');
      setDeadlineDate('');
      onRequest();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to request revision.',
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
            Request revisions from the author for: <strong>{submissionTitle}</strong>
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
              placeholder="Provide detailed revision requirements for the author…"
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
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleRequestRevision} disabled={loading}>
            {loading ? 'Sending…' : 'Send Revision Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
