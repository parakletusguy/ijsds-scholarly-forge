import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/file-management/FileUpload';
import { FileVersionHistory } from '@/components/file-management/FileVersionHistory';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Clock, FileText, Upload } from 'lucide-react';

interface RevisionRequest {
  id: string;
  revision_type: string;
  request_details: string;
  deadline_date: string;
  created_at: string;
}

export const RevisionSubmissionPortal = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [revisionRequest, setRevisionRequest] = useState<RevisionRequest | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (submissionId) {
      fetchRevisionRequest();
    }
  }, [submissionId]);

  const fetchRevisionRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('revision_requests')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setRevisionRequest(data);
    } catch (error) {
      console.error('Error fetching revision request:', error);
      toast({
        title: "Error",
        description: "Failed to load revision request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploaded = async (fileUrl: string, fileName: string, fileSize: number) => {
    try {
      // Create new file version
      await supabase
        .from('file_versions')
        .insert({
          article_id: submissionId,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileName.split('.').pop() || 'unknown',
          file_size: fileSize,
          uploaded_by: user?.id,
          version_number: await getNextVersionNumber(),
          file_description: 'Revision submission'
        });

      toast({
        title: "Success",
        description: "Revised manuscript uploaded successfully",
      });
    } catch (error) {
      console.error('Error saving file version:', error);
      toast({
        title: "Error",
        description: "Failed to save file version",
        variant: "destructive",
      });
    }
  };

  const getNextVersionNumber = async () => {
    const { data } = await supabase
      .from('file_versions')
      .select('version_number')
      .eq('article_id', submissionId)
      .order('version_number', { ascending: false })
      .limit(1);

    return data && data.length > 0 ? data[0].version_number + 1 : 1;
  };

  const handleSubmitRevision = async () => {
    if (!responseNotes.trim()) {
      toast({
        title: "Error",
        description: "Please provide response notes",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Update submission status
      await supabase
        .from('submissions')
        .update({ 
          status: 'under_review',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      // Create editorial decision record
      await supabase
        .from('editorial_decisions')
        .insert({
          submission_id: submissionId,
          editor_id: user?.id,
          decision_type: 'revision_submitted',
          decision_rationale: responseNotes
        });

      toast({
        title: "Success",
        description: "Revision submitted successfully",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting revision:', error);
      toast({
        title: "Error",
        description: "Failed to submit revision",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!revisionRequest) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>No revision request found for this submission.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Revision Submission Portal</h1>
        <Badge variant={revisionRequest.revision_type === 'major' ? 'destructive' : 'secondary'}>
          {revisionRequest.revision_type.toUpperCase()} REVISION
        </Badge>
      </div>

      {/* Revision Request Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Revision Request Details
          </CardTitle>
          <CardDescription>
            Requested on {new Date(revisionRequest.created_at).toLocaleDateString()}
            {revisionRequest.deadline_date && (
              <span className="ml-2">
                • Deadline: {new Date(revisionRequest.deadline_date).toLocaleDateString()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>{revisionRequest.request_details}</p>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Revised Manuscript
          </CardTitle>
          <CardDescription>
            Upload your revised manuscript file. Previous versions will be preserved for comparison.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            bucketName="journal-website-db1"
            folder={`submissions/${submissionId}/revisions`}
            onFileUploaded={handleFileUploaded}
            acceptedTypes={['.pdf', '.doc', '.docx']}
            maxSizeMB={50}
          />
        </CardContent>
      </Card>

      {/* File Version History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>
            View and compare different versions of your manuscript
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileVersionHistory articleId={submissionId!} />
        </CardContent>
      </Card>

      {/* Response Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Response to Reviewers</CardTitle>
          <CardDescription>
            Provide a detailed response addressing the reviewers' comments and the changes made
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="response-notes">Response Notes</Label>
            <Textarea
              id="response-notes"
              placeholder="Describe the changes you've made in response to the reviewers' comments..."
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmitRevision}
          disabled={submitting}
          size="lg"
        >
          {submitting ? 'Submitting...' : 'Submit Revision'}
        </Button>
      </div>
    </div>
  );
};