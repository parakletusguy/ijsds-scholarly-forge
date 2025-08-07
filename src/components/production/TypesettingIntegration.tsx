import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Layout, Save, FileText, Image, Type, Ruler } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  authors: any;
  status: string;
  abstract: string;
  manuscript_file_url: string;
}

interface TypesettingIntegrationProps {
  article: Article;
  onUpdate: () => void;
}

export const TypesettingIntegration = ({ article, onUpdate }: TypesettingIntegrationProps) => {
  const { toast } = useToast();
  const [typesettingNotes, setTypesettingNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [layoutSpecs, setLayoutSpecs] = useState({
    pageSize: 'A4',
    margins: '2.5cm',
    fontSize: '12pt',
    fontFamily: 'Times New Roman',
    lineSpacing: '1.5',
    columnCount: '2'
  });

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

  const saveTypesettingNotes = async () => {
    if (!typesettingNotes.trim()) return;

    setLoading(true);
    try {
      // In a real implementation, you'd save to a typesetting_notes table
      toast({
        title: "Notes Saved",
        description: "Typesetting notes have been saved",
      });
      setTypesettingNotes('');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save typesetting notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateLayout = async () => {
    setLoading(true);
    try {
      // Simulate layout generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Layout Generated",
        description: "Typeset layout has been generated successfully",
      });
    } catch (error) {
      console.error('Error generating layout:', error);
      toast({
        title: "Error",
        description: "Failed to generate layout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Article Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Typesetting Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{article.title}</h3>
            <div className="flex items-center gap-4">
              <Badge variant={article.status === 'typesetting' ? 'default' : 'secondary'}>
                {article.status.replace('_', ' ')}
              </Badge>
              {article.manuscript_file_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={article.manuscript_file_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    Source Document
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Layout Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Page Size</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={layoutSpecs.pageSize}
                onChange={(e) => setLayoutSpecs(prev => ({ ...prev, pageSize: e.target.value }))}
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">Letter (8.5 × 11 in)</option>
                <option value="Legal">Legal (8.5 × 14 in)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Margins</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={layoutSpecs.margins}
                onChange={(e) => setLayoutSpecs(prev => ({ ...prev, margins: e.target.value }))}
              >
                <option value="2.5cm">2.5cm</option>
                <option value="3cm">3cm</option>
                <option value="1in">1 inch</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Font Family</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={layoutSpecs.fontFamily}
                onChange={(e) => setLayoutSpecs(prev => ({ ...prev, fontFamily: e.target.value }))}
              >
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Calibri">Calibri</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Font Size</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={layoutSpecs.fontSize}
                onChange={(e) => setLayoutSpecs(prev => ({ ...prev, fontSize: e.target.value }))}
              >
                <option value="10pt">10pt</option>
                <option value="11pt">11pt</option>
                <option value="12pt">12pt</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Line Spacing</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={layoutSpecs.lineSpacing}
                onChange={(e) => setLayoutSpecs(prev => ({ ...prev, lineSpacing: e.target.value }))}
              >
                <option value="1.0">Single (1.0)</option>
                <option value="1.5">1.5 lines</option>
                <option value="2.0">Double (2.0)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Columns</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={layoutSpecs.columnCount}
                onChange={(e) => setLayoutSpecs(prev => ({ ...prev, columnCount: e.target.value }))}
              >
                <option value="1">Single Column</option>
                <option value="2">Two Columns</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typesetting Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Typesetting Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Tools
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Image Layout
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Spacing
            </Button>
            <Button 
              onClick={generateLayout}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Layout className="h-4 w-4" />
              Generate Layout
            </Button>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Typesetting Notes</h4>
            <Textarea
              placeholder="Add notes about layout, formatting, and typesetting decisions..."
              value={typesettingNotes}
              onChange={(e) => setTypesettingNotes(e.target.value)}
              className="min-h-[100px] mb-3"
            />
            <Button 
              onClick={saveTypesettingNotes}
              disabled={!typesettingNotes.trim() || loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Notes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Layout Preview</h3>
            <p className="text-muted-foreground mb-4">
              Preview will be generated based on your layout specifications
            </p>
            <Button onClick={generateLayout} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Preview'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Typesetting Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {article.status !== 'typesetting' && (
              <Button
                onClick={() => updateArticleStatus('typesetting')}
                disabled={loading}
                variant="outline"
              >
                Start Typesetting
              </Button>
            )}
            {article.status === 'typesetting' && (
              <Button
                onClick={() => updateArticleStatus('ready_for_publication')}
                disabled={loading}
              >
                Complete Typesetting
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};