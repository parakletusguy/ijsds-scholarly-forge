import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  authors: any;
  status: string;
  abstract: string;
  manuscript_file_url: string;
}

interface PDFGenerationProps {
  article: Article;
  onUpdate: () => void;
}

export const PDFGeneration = ({ article, onUpdate }: PDFGenerationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [pdfQuality, setPdfQuality] = useState({
    resolution: '300dpi',
    colorSpace: 'CMYK',
    compression: 'High',
    embedFonts: true
  });
  const [generatedFiles, setGeneratedFiles] = useState([
    { id: 1, name: 'final_article.pdf', type: 'Production PDF', size: '2.4 MB', status: 'ready' },
    { id: 2, name: 'web_version.pdf', type: 'Web PDF', size: '1.8 MB', status: 'ready' },
    { id: 3, name: 'print_version.pdf', type: 'Print PDF', size: '3.1 MB', status: 'generating' },
  ]);

  const generatePDF = async (type: string) => {
    setLoading(true);
    setGenerationProgress(0);

    try {
      // Simulate PDF generation progress
      for (let i = 0; i <= 100; i += 10) {
        setGenerationProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Update the file status
      setGeneratedFiles(prev =>
        prev.map(file =>
          file.type === type ? { ...file, status: 'ready' } : file
        )
      );

      toast({
        title: "PDF Generated",
        description: `${type} has been generated successfully`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setGenerationProgress(0);
    }
  };

  const downloadPDF = (fileName: string) => {
    // In a real implementation, this would download the actual file
    toast({
      title: "Download Started",
      description: `Downloading ${fileName}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'generating': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Article Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Generation Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{article.title}</h3>
            <div className="flex items-center gap-4">
              <Badge variant={article.status === 'ready_for_publication' ? 'default' : 'secondary'}>
                {article.status.replace('_', ' ')}
              </Badge>
              {article.manuscript_file_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={article.manuscript_file_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    Source File
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Quality Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            PDF Generation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Resolution</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={pdfQuality.resolution}
                onChange={(e) => setPdfQuality(prev => ({ ...prev, resolution: e.target.value }))}
              >
                <option value="150dpi">150 DPI (Web)</option>
                <option value="300dpi">300 DPI (Print)</option>
                <option value="600dpi">600 DPI (High Quality)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Color Space</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={pdfQuality.colorSpace}
                onChange={(e) => setPdfQuality(prev => ({ ...prev, colorSpace: e.target.value }))}
              >
                <option value="RGB">RGB (Web)</option>
                <option value="CMYK">CMYK (Print)</option>
                <option value="Grayscale">Grayscale</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Compression</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={pdfQuality.compression}
                onChange={(e) => setPdfQuality(prev => ({ ...prev, compression: e.target.value }))}
              >
                <option value="Low">Low (Large file)</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Small file)</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="embedFonts"
                checked={pdfQuality.embedFonts}
                onChange={(e) => setPdfQuality(prev => ({ ...prev, embedFonts: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="embedFonts" className="text-sm font-medium">
                Embed Fonts
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {loading && (
        <Card>
          <CardHeader>
            <CardTitle>Generating PDF...</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={generationProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Progress: {generationProgress}%
            </p>
          </CardContent>
        </Card>
      )}

      {/* Generated Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Generated PDF Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {generatedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(file.status)}
                  <div>
                    <h4 className="font-medium">{file.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{file.type}</span>
                      <span>•</span>
                      <span>{file.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(file.status)} variant="secondary">
                    {file.status}
                  </Badge>
                  {file.status === 'ready' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPDF(file.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generatePDF(file.type)}
                      disabled={loading}
                    >
                      Generate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex gap-3">
            <Button
              onClick={() => generatePDF('Production PDF')}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Generate All PDFs
            </Button>
            <Button
              variant="outline"
              onClick={() => generatePDF('Custom PDF')}
              disabled={loading}
            >
              Custom Generation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quality Check */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Assurance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Font Check
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Image Quality
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Link Validation
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Accessibility
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};