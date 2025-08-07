import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Table, Calendar } from 'lucide-react';

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dataType: 'submissions' | 'reviews' | 'articles' | 'users';
  dateFrom: string;
  dateTo: string;
  includeMetadata: boolean;
  includeComments: boolean;
}

export const DataExport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    dataType: 'submissions',
    dateFrom: '',
    dateTo: '',
    includeMetadata: true,
    includeComments: false,
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await supabase.functions.invoke('export-data', {
        body: { options },
      });

      if (response.error) throw response.error;

      const { downloadUrl, filename } = response.data;
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const generateReport = async (reportType: 'editorial' | 'review-summary' | 'compliance') => {
    setExporting(true);
    try {
      const response = await supabase.functions.invoke('generate-report', {
        body: { reportType, dateFrom: options.dateFrom, dateTo: options.dateTo },
      });

      if (response.error) throw response.error;

      const { downloadUrl, filename } = response.data;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Report generated successfully",
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="format">Export Format</Label>
              <Select
                value={options.format}
                onValueChange={(value: 'csv' | 'excel' | 'pdf') =>
                  setOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dataType">Data Type</Label>
              <Select
                value={options.dataType}
                onValueChange={(value: 'submissions' | 'reviews' | 'articles' | 'users') =>
                  setOptions(prev => ({ ...prev, dataType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submissions">Submissions</SelectItem>
                  <SelectItem value="reviews">Reviews</SelectItem>
                  <SelectItem value="articles">Published Articles</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                type="date"
                value={options.dateFrom}
                onChange={(e) => setOptions(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                type="date"
                value={options.dateTo}
                onChange={(e) => setOptions(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={options.includeMetadata}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, includeMetadata: !!checked }))
                }
              />
              <Label htmlFor="metadata">Include metadata</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="comments"
                checked={options.includeComments}
                onCheckedChange={(checked) =>
                  setOptions(prev => ({ ...prev, includeComments: !!checked }))
                }
              />
              <Label htmlFor="comments">Include comments and notes</Label>
            </div>
          </div>

          <Button onClick={handleExport} disabled={exporting} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Automated Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => generateReport('editorial')}
              disabled={exporting}
              className="h-auto flex-col p-4"
            >
              <Table className="h-8 w-8 mb-2" />
              <span className="font-medium">Editorial Board Report</span>
              <span className="text-xs text-muted-foreground">
                Submission metrics and review status
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => generateReport('review-summary')}
              disabled={exporting}
              className="h-auto flex-col p-4"
            >
              <Calendar className="h-8 w-8 mb-2" />
              <span className="font-medium">Review Summary</span>
              <span className="text-xs text-muted-foreground">
                Reviewer performance and timelines
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => generateReport('compliance')}
              disabled={exporting}
              className="h-auto flex-col p-4"
            >
              <FileText className="h-8 w-8 mb-2" />
              <span className="font-medium">Compliance Report</span>
              <span className="text-xs text-muted-foreground">
                Audit trail and policy adherence
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};