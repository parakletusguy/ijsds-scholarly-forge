import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/file-management/FileUpload';
import { api } from '@/lib/apiClient';
import { updateArticle } from '@/lib/articleService';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, Calendar, RefreshCw, Shield, Download } from 'lucide-react';
import { handleFileDownload } from '@/lib/downloadUtils';

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

interface EditorFileManagerProps {
  articleId: string;
  submissionId: string;
}

export const EditorFileManager = ({ articleId, submissionId }: EditorFileManagerProps) => {
  const [files, setFiles] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileDescription, setFileDescription] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [articleId]);

  const fetchFiles = async () => {
    try {
      const res = await api.get<{ success: true; data: FileVersion[] }>(`/api/files/${articleId}`);
      setFiles(res.data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpdate = async (fileUrl: string | File) => {
    if (fileUrl instanceof File) return;

    setUploading(true);
    try {
      await updateArticle(articleId, { manuscript_file_url: fileUrl });
      await fetchFiles();
      setFileDescription('');
      toast({
        title: 'Manuscript Updated',
        description: 'New version uploaded successfully. Author and reviewers have been notified.',
      });
    } catch (error: any) {
      console.error('Error updating file:', error);
      toast({
        title: 'Error',
        description: 'Failed to update manuscript record.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) return <div className="text-sm text-muted-foreground p-4">Loading files...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Editor File Management
        </CardTitle>
        <CardDescription>
          Upload new versions of the manuscript on behalf of the author. All reviewers and the author will be notified.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Upload New Version
          </h4>

          <div>
            <Label htmlFor="editor-file-description">Update Description</Label>
            <Input
              id="editor-file-description"
              value={fileDescription}
              onChange={e => setFileDescription(e.target.value)}
              placeholder="Describe the changes made in this version"
              disabled={uploading}
            />
          </div>

          <FileUpload
            bucketName="journal-website-db1"
            folder={`manuscripts/${submissionId}`}
            onFileUploaded={handleFileUpdate}
            acceptedTypes=".pdf,.doc,.docx"
            maxSizeMB={10}
            disabled={uploading}
            articleId={articleId}
          />
        </div>

        {/* File History */}
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-medium text-sm truncate">{file.file_name}</h5>
                      <Badge variant="secondary" className="text-xs shrink-0">v{file.version_number}</Badge>
                      {index === 0 && <Badge variant="default" className="text-xs shrink-0">Current</Badge>}
                      {file.is_supplementary && <Badge variant="outline" className="text-xs shrink-0">Supplementary</Badge>}
                    </div>
                    {file.file_description && (
                      <p className="text-xs text-muted-foreground mt-1">{file.file_description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => window.open(file.file_url, '_blank')}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleFileDownload(file.file_url, file.file_name)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
