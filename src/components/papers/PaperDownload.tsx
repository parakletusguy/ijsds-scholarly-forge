import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaperDownloadProps {
  manuscriptFileUrl: string;
  title: string;
  className?: string;
}

export const PaperDownload = ({ manuscriptFileUrl, title, className }: PaperDownloadProps) => {
  const handleDownload = () => {
    if (manuscriptFileUrl) {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      // link.href = `https://csihixcdxcldarcnclvq.supabase.co/storage/v1/object/public/journal-website-db1/${manuscriptFileUrl}`;
      link.href = `${manuscriptFileUrl}`;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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