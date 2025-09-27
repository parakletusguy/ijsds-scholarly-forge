import { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  bucketName: string;
  folder?: string;
  onFileUploaded: (fileUrl: string, fileName: string) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const FileUpload = ({ 
  bucketName, 
  folder = '', 
  onFileUploaded, 
  acceptedTypes = '.pdf,.doc,.docx',
  maxSizeMB = 10,
  disabled = false
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    if (disabled) return;
    setUploading(true);
    
    try {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`);
      }

      // Generate unique filename
      // const fileExt = file.name.split('.').pop();
      const fileExt = file.name
      // const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      // const filePath = folder ? `${folder}/${fileName}` : fileName;
      const filePath = fileExt

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type // ✅ preserves correct MIME type
  });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      onFileUploaded(publicUrl, file.name);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded.`,
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = event.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <Card 
      className={`border-2 border-dashed transition-colors ${
        disabled 
          ? 'border-border opacity-50 cursor-not-allowed' 
          : dragActive 
            ? 'border-primary' 
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
              {disabled 
                ? 'File uploads disabled by administrator' 
                : uploading 
                  ? 'Uploading...' 
                  : 'Drop your file here or click to browse'
              }
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
            {disabled 
              ? 'Upload Disabled' 
              : uploading 
                ? 'Uploading...' 
                : 'Select File'
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};