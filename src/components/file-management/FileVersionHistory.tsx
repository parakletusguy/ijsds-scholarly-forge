import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PaperDownload } from '@/components/papers/PaperDownload';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Calendar } from 'lucide-react';

interface FileVersion {
  id: string;
  file_url: string;
  file_name: string;
  version_number: number;
  created_at: string;
  file_size?: number;
  file_description?: string;
}

interface FileVersionHistoryProps {
  articleId: string;
}

export const FileVersionHistory = ({ articleId }: FileVersionHistoryProps) => {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, [articleId]);

  const fetchVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('file_versions')
        .select('*')
        .eq('article_id', articleId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading versions...</div>;

  return (
    <div className="space-y-4">
      {versions.map((version) => (
        <Card key={version.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{version.file_name}</span>
                    <Badge variant="outline">v{version.version_number}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(version.created_at).toLocaleDateString()}
                    {version.file_size && (
                      <span>• {(version.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    )}
                  </div>
                  {version.file_description && (
                    <p className="text-sm text-muted-foreground mt-1">{version.file_description}</p>
                  )}
                </div>
              </div>
              <PaperDownload
                manuscriptFileUrl={version.file_url}
                title={`${version.file_name}_v${version.version_number}`}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      {versions.length === 0 && (
        <p className="text-center text-muted-foreground">No file versions found</p>
      )}
    </div>
  );
};