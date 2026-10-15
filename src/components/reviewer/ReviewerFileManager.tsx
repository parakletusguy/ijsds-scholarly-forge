import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getArticleFiles, type FileVersion } from '@/lib/fileService';
import { Download, FileText, Calendar } from 'lucide-react';

interface ReviewerFileManagerProps {
  articleId: string;
  submissionId: string;
}

/**
 * Read-only list of the manuscript's files for the assigned reviewer, from the backend.
 * (The previous version used the retired Supabase database, failed on every review page, and
 * its upload/download notifications told the author the reviewer's name, breaking blind review.
 * Reviewers send their written review and recommendation through the review form.)
 */
export const ReviewerFileManager = ({ articleId }: ReviewerFileManagerProps) => {
  const [files, setFiles] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getArticleFiles(articleId)
      .then((f) => active && setFiles((f || []).filter((x) => !x.is_archived)))
      .catch((e) => active && setError(e?.message ?? 'Could not load files'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [articleId]);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Manuscript Files
        </CardTitle>
        <CardDescription>Download the current manuscript and any supplementary files.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading files…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files available.</p>
        ) : (
          files.map((file) => (
            <div key={file.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="font-medium text-sm truncate">{file.file_name}</h5>
                  <Badge variant="secondary" className="text-xs">v{file.version_number}</Badge>
                  {file.is_supplementary && <Badge variant="outline" className="text-xs">Supplementary</Badge>}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  {formatFileSize(file.file_size) && <span>{formatFileSize(file.file_size)}</span>}
                  {file.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(file.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.open(file.file_url, '_blank', 'noopener')}>
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
