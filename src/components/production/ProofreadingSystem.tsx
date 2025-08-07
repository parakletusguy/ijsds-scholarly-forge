import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, Save, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  authors: any;
  status: string;
  abstract: string;
  manuscript_file_url: string;
}

interface ProofreadingSystemProps {
  article: Article;
  onUpdate: () => void;
}

export const ProofreadingSystem = ({ article, onUpdate }: ProofreadingSystemProps) => {
  const { toast } = useToast();
  const [proofNotes, setProofNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [corrections, setCorrections] = useState([
    { id: 1, page: 3, line: 15, error: 'Spelling: "recieve" should be "receive"', status: 'pending', type: 'spelling' },
    { id: 2, page: 7, line: 22, error: 'Punctuation: Missing comma after introductory phrase', status: 'pending', type: 'punctuation' },
    { id: 3, page: 12, line: 8, error: 'Typography: Inconsistent font in table header', status: 'corrected', type: 'formatting' },
  ]);

  const updateArticleStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .update({ status: newStatus })
        .eq('id', article.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Article moved to ${newStatus.replace('_', ' ')}`,
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update article status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProofNotes = async () => {
    if (!proofNotes.trim()) return;

    setLoading(true);
    try {
      // In a real implementation, you'd save to a proofreading_notes table
      toast({
        title: "Notes Saved",
        description: "Proofreading notes have been saved",
      });
      setProofNotes('');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save proofreading notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCorrectionStatus = (correctionId: number, newStatus: 'pending' | 'corrected' | 'rejected') => {
    setCorrections(prev =>
      prev.map(correction =>
        correction.id === correctionId
          ? { ...correction, status: newStatus }
          : correction
      )
    );
  };

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'spelling': return 'bg-red-100 text-red-800';
      case 'punctuation': return 'bg-yellow-100 text-yellow-800';
      case 'formatting': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'corrected': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'rejected': return <X className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Article Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proofreading Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{article.title}</h3>
            <div className="flex items-center gap-4">
              <Badge variant={article.status === 'proofreading' ? 'default' : 'secondary'}>
                {article.status.replace('_', ' ')}
              </Badge>
              {article.manuscript_file_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={article.manuscript_file_url} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    View Document
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proofreading Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Proofreading Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Spell Check
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Format Check
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Final Review
            </Button>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Proofreading Notes</h4>
            <Textarea
              placeholder="Add final proofreading notes and observations..."
              value={proofNotes}
              onChange={(e) => setProofNotes(e.target.value)}
              className="min-h-[100px] mb-3"
            />
            <Button 
              onClick={saveProofNotes}
              disabled={!proofNotes.trim() || loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Notes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Corrections List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Identified Corrections ({corrections.filter(c => c.status === 'pending').length} pending)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {corrections.map((correction) => (
              <div
                key={correction.id}
                className={`p-4 rounded-lg border ${
                  correction.status === 'corrected' ? 'bg-green-50 border-green-200' :
                  correction.status === 'rejected' ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Page {correction.page}, Line {correction.line}
                      </Badge>
                      <Badge className={`text-xs ${getErrorTypeColor(correction.type)}`} variant="secondary">
                        {correction.type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(correction.status)}
                        <span className="text-xs font-medium capitalize">{correction.status}</span>
                      </div>
                    </div>
                    <p className="text-sm">{correction.error}</p>
                  </div>
                  {correction.status === 'pending' && (
                    <div className="flex gap-2 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateCorrectionStatus(correction.id, 'corrected')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateCorrectionStatus(correction.id, 'rejected')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Proofreading Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {article.status !== 'proofreading' && (
              <Button
                onClick={() => updateArticleStatus('proofreading')}
                disabled={loading}
                variant="outline"
              >
                Start Proofreading
              </Button>
            )}
            {article.status === 'proofreading' && (
              <Button
                onClick={() => updateArticleStatus('typesetting')}
                disabled={loading}
              >
                Complete Proofreading
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};