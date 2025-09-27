import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/file-management/FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, Calendar, RefreshCw, Lock } from 'lucide-react';

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

interface AuthorFileManagerProps {
  articleId: string;
  submissionId: string;
}

export const AuthorFileManager = ({ articleId, submissionId }: AuthorFileManagerProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileDescription, setFileDescription] = useState('');
  const [reuploadEnabled, setReuploadEnabled] = useState(true);

  useEffect(() => {
    fetchFiles();
    checkReuploadPermission();
  }, [articleId]);

  const checkReuploadPermission = async () => {
    try {
      const { data: setting, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'author_reupload_enabled')
        .single();

      if (error) throw error;
      setReuploadEnabled(setting?.setting_value === 'true');
    } catch (error) {
      console.error('Error checking reupload permission:', error);
      // Default to disabled if there's an error
      setReuploadEnabled(false);
    }
  };

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

  const handleFileUpdate = async (fileUrl: string) => {
    if (!user) return;

    setUploading(true);
    try {
      const fileName = fileUrl.split('/').pop() || 'manuscript-update';
      const maxVersion = Math.max(...files.map(f => f.version_number), 0);

      const { error } = await supabase
        .from('file_versions')
        .insert({
          article_id: articleId,
          file_name: fileName,
          file_url: fileUrl,
          file_type: 'manuscript',
          file_description: fileDescription || 'Updated manuscript',
          version_number: maxVersion + 1,
          uploaded_by: user.id,
          is_supplementary: false
        });

      if (error) throw error;

      // Update article's manuscript file URL to latest version
      await supabase
        .from('articles')
        .update({ manuscript_file_url: fileUrl })
        .eq('id', articleId);

      // Send notifications to reviewers and editors
      await notifyFileUpdate(fileName);

      await fetchFiles();
      setFileDescription('');

      toast({
        title: 'Success',
        description: 'File updated successfully. All reviewers and editors have been notified.',
      });
    } catch (error) {
      console.error('Error updating file:', error);
      toast({
        title: 'Error',
        description: 'Failed to update file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const notifyFileUpdate = async (fileName: string) => {
    try {
      // Get submission details
      const { data: submission } = await supabase
        .from('submissions')
        .select(`
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

      const authorName = profile?.full_name || 'Author';
      const articleTitle = submission.articles?.title || 'Article';

      // Get all reviewers for this submission
      const { data: reviews } = await supabase
        .from('reviews')
        .select('reviewer_id')
        .eq('submission_id', submissionId);

      // Notify reviewers
      if (reviews) {
        for (const review of reviews) {
          await supabase.functions.invoke('notification-service', {
            body: {
              userId: review.reviewer_id,
              title: 'File Updated by Author',
              message: `${authorName} has uploaded a new version of the manuscript (${fileName}) for article "${articleTitle}".`,
              type: 'info',
              emailNotification: true,
              emailTemplate: 'review_assigned',
              emailData: {
                authorName,
                title: articleTitle,
                fileName
              }
            }
          });
        }
      }

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
              title: 'Author File Update',
              message: `${authorName} has uploaded a new version of the manuscript (${fileName}) for article "${articleTitle}".`,
              type: 'info',
              emailNotification: true,
              emailTemplate: 'review_assigned',
              emailData: {
                authorName,
                title: articleTitle,
                fileName
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error sending file update notification:', error);
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
          Manuscript Files
        </CardTitle>
        <CardDescription>
          Upload new versions of your manuscript. All reviewers and editors will be notified.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Update Manuscript
            {!reuploadEnabled && <Lock className="h-4 w-4 text-muted-foreground" />}
          </h4>
          
          {!reuploadEnabled && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                File reuploads have been disabled by the administrator. Contact the editorial team if you need to update your manuscript.
              </AlertDescription>
            </Alert>
          )}
          
          <div>
            <Label htmlFor="file-description">Update Description</Label>
            <Input
              id="file-description"
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              placeholder="Describe the changes made in this version"
              disabled={!reuploadEnabled}
            />
          </div>

          <FileUpload
            bucketName="journal-website-db1"
            folder={`manuscripts/${submissionId}`}
            onFileUploaded={handleFileUpdate}
            acceptedTypes=".pdf,.doc,.docx"
            maxSizeMB={10}
            disabled={!reuploadEnabled}
          />
        </div>

        {/* Files History */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Upload className="h-4 w-4" />
            File History
          </h4>
          
          {files.length === 0 ? (
            <p className="text-muted-foreground text-sm">No files uploaded yet</p>
          ) : (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{file.file_name}</h5>
                      <Badge variant="secondary" className="text-xs">
                        v{file.version_number}
                      </Badge>
                      {index === 0 && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {file.is_supplementary && (
                        <Badge variant="outline" className="text-xs">
                          Supplementary
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
                    onClick={() => window.open(file.file_url, '_blank')}
                  >
                    View
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