import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/file-management/FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Download, Upload, FileText, Calendar } from 'lucide-react';

interface FileVersion {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  version_number: number;
  file_description: string;
  uploaded_by: string;
  created_at: string;
  is_supplementary: boolean;
}

interface ReviewerFileManagerProps {
  articleId: string;
  submissionId: string;
}

export const ReviewerFileManager = ({ articleId, submissionId }: ReviewerFileManagerProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileDescription, setFileDescription] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [articleId]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('file_versions')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (fileUrl: string) => {
    if (!user) return;

    setUploading(true);
    try {
      const fileName = fileUrl.split('/').pop() || 'review-file';
      const maxVersion = Math.max(...files.map(f => f.version_number), 0);

      const { error } = await supabase
        .from('file_versions')
        .insert({
          article_id: articleId,
          file_name: fileName,
          file_url: fileUrl,
          file_type: 'review',
          file_description: fileDescription || 'Reviewer uploaded file',
          version_number: maxVersion + 1,
          uploaded_by: user.id,
          is_supplementary: true
        });

      if (error) throw error;

      // Send notification to authors and editors
      await notifyFileAction('upload', fileName);

      await fetchFiles();
      setFileDescription('');

      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const notifyFileAction = async (action: 'upload' | 'download', fileName: string) => {
    try {
      // Get submission details for notifications
      const { data: submission } = await supabase
        .from('submissions')
        .select(`
          submitter_id,
          articles (
            title,
            corresponding_author_email
          )
        `)
        .eq('id', submissionId)
        .single();

      if (!submission) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      const reviewerName = profile?.full_name || 'Reviewer';
      const articleTitle = submission.articles?.title || 'Article';

      // Notify author
      await supabase.functions.invoke('notification-service', {
        body: {
          userId: submission.submitter_id,
          title: `File ${action === 'upload' ? 'Uploaded' : 'Downloaded'} by Reviewer`,
          message: `${reviewerName} has ${action === 'upload' ? 'uploaded' : 'downloaded'} a file (${fileName}) for your article "${articleTitle}".`,
          type: 'info',
          emailNotification: true,
          emailTemplate: 'review_assigned',
          emailData: {
            reviewerName,
            title: articleTitle,
            action: action,
            fileName
          }
        }
      });

      // Notify editors
      const { data: editors } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('is_editor', true);

      if (editors) {
        for (const editor of editors) {
          await supabase.functions.invoke('notification-service', {
            body: {
              userId: editor.id,
              title: `Reviewer File Activity`,
              message: `${reviewerName} has ${action === 'upload' ? 'uploaded' : 'downloaded'} a file (${fileName}) for article "${articleTitle}".`,
              type: 'info',
              emailNotification: true,
              emailTemplate: 'review_assigned',
              emailData: {
                reviewerName,
                title: articleTitle,
                action: action,
                fileName
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error sending file action notification:', error);
    }
  };

  const handleDownload = async (file: FileVersion) => {
    try {
      window.open(file.file_url, '_blank');
      await notifyFileAction('download', file.file_name);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div>Loading files...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          File Management
        </CardTitle>
        <CardDescription>
          Download manuscript files and upload review documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Review Files
          </h4>
          
          <div>
            <Label htmlFor="file-description">File Description (Optional)</Label>
            <Input
              id="file-description"
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              placeholder="Describe the purpose of this file"
            />
          </div>

          <FileUpload
            bucketName="journal-website-db1"
            folder={`reviews/${submissionId}`}
            onFileUploaded={handleFileUpload}
            acceptedTypes=".pdf,.doc,.docx,.txt"
            maxSizeMB={10}
          />
        </div>

        {/* Files List */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Download className="h-4 w-4" />
            Available Files
          </h4>
          
          {files.length === 0 ? (
            <p className="text-muted-foreground text-sm">No files available</p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{file.file_name}</h5>
                      <Badge variant="secondary" className="text-xs">
                        v{file.version_number}
                      </Badge>
                      {file.is_supplementary && (
                        <Badge variant="outline" className="text-xs">
                          Review File
                        </Badge>
                      )}
                    </div>
                    {file.file_description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {file.file_description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.file_size || 0)}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};