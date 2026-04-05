import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleFileDownload } from '@/lib/downloadUtils';

interface PaperDownloadProps {
  manuscriptFileUrl: string;
  title: string;
  className?: string;
}

export const PaperDownload = ({ manuscriptFileUrl, title, className }: PaperDownloadProps) => {
  const handleDownload = () => {
    handleFileDownload(manuscriptFileUrl, title);
  };

  if (!manuscriptFileUrl) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Paper
    </Button>
  );
};