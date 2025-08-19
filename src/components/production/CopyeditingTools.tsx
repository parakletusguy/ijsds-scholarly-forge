import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit3, Save, FileText, Clock, User, CheckCircle } from 'lucide-react';
import { TextEditor } from '../editor/joditEditor';

interface Article {
  id: string;
  title: string;
  authors: any;
  status: string;
  abstract: string;
  manuscript_file_url: string;
}

interface CopyeditingToolsProps {
  article: Article;
  onUpdate: () => void;
}

export const CopyeditingTools = ({ article, onUpdate }: CopyeditingToolsProps) => {
  const { toast } = useToast();
  const [editingNotes, setEditingNotes] = useState('');
  const [html, sethtml] = useState('');
  const [editor, setEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    { id: 1, type: 'grammar', text: 'Consider revising sentence structure in paragraph 3', status: 'pending' },
    { id: 2, type: 'style', text: 'Standardize citation format throughout', status: 'pending' },
    { id: 3, type: 'formatting', text: 'Update figure captions to match journal style', status: 'completed' },
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
        description: `Article status changed to ${newStatus.replace('_', ' ')}`,
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

  const saveCopyeditingNotes = async () => {
    if (!editingNotes.trim()) return;

    setLoading(true);
    try {
      // In a real implementation, you'd save to a copyediting_notes table
      toast({
        title: "Notes Saved",
        description: "Copyediting notes have been saved",
      });
      setEditingNotes('');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save copyediting notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestionStatus = (suggestionId: number) => {
    setSuggestions(prev =>
      prev.map(suggestion =>
        suggestion.id === suggestionId
          ? { ...suggestion, status: suggestion.status === 'pending' ? 'completed' : 'pending' }
          : suggestion
      )
    );
  };

  const viewArticle = async (url) => {
    const getHtml = await fetch('ttps://ijsdsbackend-agewf0h8g5hfawax.switzerlandnorth-01.azurewebsites.net/supabase/getFile', {
      method: 'POST',
      headers: {"Content-Type" : "application/json"},
      body:JSON.stringify({
        url:url
      })
    })
    console.log("oo")
    const htmlValue = await getHtml.json()
    sethtml(htmlValue.data)
    setEditor(true)
  }

  return (
    <div className="space-y-6">
      {/* Article Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Article Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{article.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{article.abstract}</p>
            <div className="flex items-center gap-4">
              <Badge variant={article.status === 'copyediting' ? 'default' : 'secondary'}>
                {article.status.replace('_', ' ')}
              </Badge>
              {article.manuscript_file_url && (
                <Button variant="outline" className='cursor-pointer' size="sm" asChild onClick={() => viewArticle(article.manuscript_file_url)}>
                   <p className='flex'> <FileText className="h-4 w-4 mr-2" />
                    View Manuscript</p>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copyediting Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Copyediting Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Grammar Check
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Style Guide
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Fact Check
            </Button>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Copyediting Notes</h4>
            <Textarea
              placeholder="Add copyediting notes and suggestions..."
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              className="min-h-[100px] mb-3"
            />
            <Button 
              onClick={saveCopyeditingNotes}
              disabled={!editingNotes.trim() || loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Notes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editing Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Editing Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-3 rounded-lg border ${
                  suggestion.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                      <Badge 
                        variant={suggestion.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {suggestion.status}
                      </Badge>
                    </div>
                    <p className="text-sm">{suggestion.text}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSuggestionStatus(suggestion.id)}
                    className="ml-2"
                  >
                    {suggestion.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Status Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {article.status !== 'copyediting' && (
              <Button
                onClick={() => updateArticleStatus('copyediting')}
                disabled={loading}
                variant="outline"
              >
                Start Copyediting
              </Button>
            )}
            {article.status === 'copyediting' && (
              <Button
                onClick={() => updateArticleStatus('proofreading')}
                disabled={loading}
              >
                Complete Copyediting
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      { editor && <TextEditor html={html} editor={editor} setEditor={setEditor}/>}
    </div>
  );
};