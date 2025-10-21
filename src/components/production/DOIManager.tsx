import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link, RefreshCw, Save, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  authors: any;
  status: string;
  doi: string;
  abstract: string;
  manuscript_file_url: string;
}

interface DOIManagerProps {
  article: Article;
  onUpdate: () => void;
}

export const DOIManager = ({ article, onUpdate }: DOIManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [manualDOI, setManualDOI] = useState(article.doi || '');
  const [showManualInput, setShowManualInput] = useState(false);

  const generateDOI = async () => {
    setLoading(true);
    try {
      // First, find the submission ID for this article
      const { data: submissions, error: submissionError } = await supabase
        .from('submissions')
        .select('id')
        .eq('article_id', article.id)
        .limit(1);

      if (submissionError || !submissions?.length) {
        throw new Error('Could not find submission for this article');
      }

      const submissionId = submissions[0].id;

      // Call the edge function to generate DOI
      const { data, error } = await supabase.functions.invoke('generate-zenodo-doi', {
        body: { 
          submissionId,
          existingDoi: article.doi || null
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: data.is_new_version ? "New Version Published" : "DOI Generated Successfully",
          description: data.is_new_version 
            ? `Concept DOI: ${data.doi} (always points to latest version)`
            : `DOI: ${data.doi}`,
        });
        onUpdate();
        setShowManualInput(false);
      } else {
        throw new Error(data.error || 'Failed to generate DOI');
      }
    } catch (error) {
      console.error('Error generating DOI:', error);
      toast({
        title: "DOI Generation Failed",
        description: (error as Error).message || 'Failed to generate DOI. You can enter it manually.',
        variant: "destructive",
      });
      setShowManualInput(true);
    } finally {
      setLoading(false);
    }
  };

  const saveManualDOI = async () => {
    if (!manualDOI.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid DOI",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .update({ doi: manualDOI.trim() })
        .eq('id', article.id);

      if (error) throw error;

      toast({
        title: "DOI Saved",
        description: "Manual DOI has been saved successfully",
      });
      
      onUpdate();
      setShowManualInput(false);
    } catch (error) {
      console.error('Error saving manual DOI:', error);
      toast({
        title: "Error",
        description: "Failed to save DOI",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateDOI = (doi: string) => {
    const doiPattern = /^10\.\d{4,}\/[^\s]+$/;
    return doiPattern.test(doi);
  };

  const formatAuthors = (authors: any) => {
    if (!authors) return 'Unknown Author';
    if (typeof authors === 'string') return authors;
    if (Array.isArray(authors)) {
      return authors.map(author => 
        typeof author === 'string' ? author : `${author.firstName} ${author.lastName}`
      ).join(', ');
    }
    return 'Unknown Author';
  };

  return (
    <div className="space-y-6">
      {/* Article Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            DOI Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{article.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              By: {formatAuthors(article.authors)}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Status: {article.status}
              </Badge>
              {article.doi ? (
                <Badge className="text-xs bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  DOI Assigned
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  No DOI
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current DOI Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current DOI Status</CardTitle>
        </CardHeader>
        <CardContent>
          {article.doi ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">DOI Assigned</span>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">DOI:</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-white px-2 py-1 rounded border">
                    {article.doi}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(article.doi)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://doi.org/${article.doi}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="font-medium">No DOI Assigned</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This article does not have a DOI yet. You can generate one automatically or enter it manually.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DOI Actions */}
      <Card>
        <CardHeader>
          <CardTitle>DOI Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-generate DOI */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium">Automatic DOI Generation</h4>
                <p className="text-sm text-muted-foreground">
                  {article.doi 
                    ? 'Update article and create new Zenodo version (DOI remains the same - concept DOI)'
                    : 'Generate a concept DOI using Zenodo (remains constant across versions)'
                  }
                </p>
                {article.doi && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Your concept DOI will automatically point to the latest version on Zenodo.
                  </p>
                )}
              </div>
              <Button
                onClick={generateDOI}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Processing...' : (article.doi ? 'Update & Create New Version' : 'Generate DOI')}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Manual DOI Entry */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Manual DOI Entry</h4>
                <p className="text-sm text-muted-foreground">
                  Enter a DOI manually if automatic generation fails
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowManualInput(!showManualInput)}
                disabled={loading}
              >
                {showManualInput ? 'Cancel' : 'Enter Manually'}
              </Button>
            </div>

            {showManualInput && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                <div>
                  <label className="text-sm font-medium mb-2 block">DOI</label>
                  <Input
                    placeholder="10.1234/example.doi"
                    value={manualDOI}
                    onChange={(e) => setManualDOI(e.target.value)}
                    className={!validateDOI(manualDOI) && manualDOI ? 'border-red-300' : ''}
                  />
                  {manualDOI && !validateDOI(manualDOI) && (
                    <p className="text-xs text-red-600 mt-1">
                      Please enter a valid DOI format (e.g., 10.1234/example.doi)
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={saveManualDOI}
                    disabled={loading || !validateDOI(manualDOI)}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save DOI
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowManualInput(false);
                      setManualDOI(article.doi || '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};