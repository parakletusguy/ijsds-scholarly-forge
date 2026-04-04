import { useState, type ChangeEvent, type DragEvent } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { uploadFile, resolveFileUrl } from '@/lib/fileService';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  bucketName: string; // kept for API compat — not used with custom backend
  folder?: string;
  onFileUploaded: (file: string | File, fileName: string) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  articleId?: string;
  autoUpload?: boolean;
}

export const FileUpload = ({
  onFileUploaded,
  acceptedTypes = '.pdf,.doc,.docx',
  maxSizeMB = 10,
  disabled = false,
  articleId = '',
  autoUpload = true,
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (disabled) return;
    setUploading(true);

    try {
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`);
      }

      if (autoUpload) {
        const version = await uploadFile(file, articleId);
        const publicUrl = resolveFileUrl(version.file_url);
        onFileUploaded(publicUrl, file.name);
        toast({ title: 'File uploaded successfully', description: `${file.name} has been uploaded.` });
      } else {
        onFileUploaded(file, file.name);
        toast({ title: 'File recognized', description: `${file.name} is ready for submission.` });
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: DragEvent<HTMLElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = (e: DragEvent<HTMLElement>) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragOut = (e: DragEvent<HTMLElement>) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        disabled ? 'border-border opacity-50 cursor-not-allowed'
          : dragActive ? 'border-primary'
          : 'border-border'
      }`}
      onDragEnter={disabled ? undefined : handleDragIn}
      onDragLeave={disabled ? undefined : handleDragOut}
      onDragOver={disabled ? undefined : handleDrag}
      onDrop={disabled ? undefined : handleDrop}
    >
      <CardContent className="p-6">
        <div className="text-center">
          <Upload className={`h-12 w-12 mx-auto mb-4 ${disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
          <Label htmlFor="file-upload" className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
            <span className="text-lg font-medium">
              {disabled ? 'File uploads disabled by administrator'
                : uploading ? 'Uploading...'
                : 'Drop your file here or click to browse'}
            </span>
            {!disabled && (
              <p className="text-sm text-muted-foreground mt-2">
                Supported formats: {acceptedTypes} (max {maxSizeMB}MB)
              </p>
            )}
          </Label>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            disabled={uploading || disabled}
          />
          <Button
            variant="outline"
            className="mt-4"
            disabled={uploading || disabled}
            onClick={() => !disabled && document.getElementById('file-upload')?.click()}
          >
            <FileText className="h-4 w-4 mr-2" />
            {disabled ? 'Upload Disabled' : uploading ? 'Uploading...' : 'Select File'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
