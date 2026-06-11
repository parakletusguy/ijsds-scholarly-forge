import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleFileDownload } from '@/lib/downloadUtils';

interface PaperDownloadProps {
  manuscriptFileUrl?: string;
  articleId?: string;
  title: string;
  className?: string;
}

export const PaperDownload = ({ manuscriptFileUrl, articleId, title, className }: PaperDownloadProps) => {
  const [loading, setLoading] = useState(false);

  if (!manuscriptFileUrl && !articleId) return null;

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLoading(true);
    await handleFileDownload(manuscriptFileUrl || '', title, articleId);
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      className={className}
      asChild
    >
      <a 
        href={manuscriptFileUrl || '#'} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        <Download className="h-4 w-4 mr-2" />
        {loading ? '...' : 'Download Paper'}
      </a>
    </Button>
  );
};
