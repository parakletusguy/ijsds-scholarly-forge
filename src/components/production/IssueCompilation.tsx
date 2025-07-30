import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Save, FileText, Calendar, Plus, Trash2 } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  authors: any;
  status: string;
  abstract: string;
  manuscript_file_url: string;
  volume?: number;
  issue?: number;
  page_start?: number;
  page_end?: number;
}

interface IssueCompilationProps {
  article: Article;
  onUpdate: () => void;
}

interface IssueInfo {
  volume: number;
  issue: number;
  year: number;
  title: string;
  description: string;
  publishDate: string;
}

export const IssueCompilation = ({ article, onUpdate }: IssueCompilationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [issueInfo, setIssueInfo] = useState<IssueInfo>({
    volume: article.volume || 1,
    issue: article.issue || 1,
    year: new Date().getFullYear(),
    title: 'Special Issue on Advanced Research',
    description: '',
    publishDate: new Date().toISOString().split('T')[0]
  });
  const [issueArticles, setIssueArticles] = useState([
    { 
      id: article.id, 
      title: article.title, 
      authors: article.authors,
      pageStart: article.page_start || 1,
      pageEnd: article.page_end || 15,
      order: 1,
      status: 'included'
    }
  ]);

  const updateIssueInfo = (field: keyof IssueInfo, value: string | number) => {
    setIssueInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateArticlePages = (articleId: string, pageStart: number, pageEnd: number) => {
    setIssueArticles(prev =>
      prev.map(article =>
        article.id === articleId
          ? { ...article, pageStart, pageEnd }
          : article
      )
    );
  };

  const reorderArticles = (articleId: string, newOrder: number) => {
    setIssueArticles(prev =>
      prev.map(article =>
        article.id === articleId
          ? { ...article, order: newOrder }
          : article
      ).sort((a, b) => a.order - b.order)
    );
  };

  const saveIssue = async () => {
    setLoading(true);
    try {
      // Update article with issue information
      const { error } = await supabase
        .from('articles')
        .update({
          volume: issueInfo.volume,
          issue: issueInfo.issue,
          page_start: issueArticles.find(a => a.id === article.id)?.pageStart,
          page_end: issueArticles.find(a => a.id === article.id)?.pageEnd,
        })
        .eq('id', article.id);

      if (error) throw error;

      toast({
        title: "Issue Saved",
        description: "Issue compilation has been saved successfully",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error saving issue:', error);
      toast({
        title: "Error",
        description: "Failed to save issue compilation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTOC = () => {
    const toc = issueArticles
      .sort((a, b) => a.order - b.order)
      .map(article => 
        `${article.title} ... ${article.pageStart}-${article.pageEnd}`
      )
      .join('\n');

    navigator.clipboard.writeText(toc);
    toast({
      title: "Table of Contents Generated",
      description: "TOC has been copied to clipboard",
    });
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
      {/* Issue Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Issue Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Volume</label>
              <Input
                type="number"
                value={issueInfo.volume}
                onChange={(e) => updateIssueInfo('volume', parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Issue</label>
              <Input
                type="number"
                value={issueInfo.issue}
                onChange={(e) => updateIssueInfo('issue', parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Year</label>
              <Input
                type="number"
                value={issueInfo.year}
                onChange={(e) => updateIssueInfo('year', parseInt(e.target.value))}
                min="2000"
                max="2100"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Publish Date</label>
              <Input
                type="date"
                value={issueInfo.publishDate}
                onChange={(e) => updateIssueInfo('publishDate', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Issue Title</label>
            <Input
              value={issueInfo.title}
              onChange={(e) => updateIssueInfo('title', e.target.value)}
              placeholder="Enter issue title"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={issueInfo.description}
              onChange={(e) => updateIssueInfo('description', e.target.value)}
              placeholder="Enter issue description or special theme"
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Articles in Issue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Articles in This Issue ({issueArticles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issueArticles.map((issueArticle, index) => (
              <div
                key={issueArticle.id}
                className="p-4 rounded-lg border bg-muted/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Article {issueArticle.order}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {issueArticle.status}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{issueArticle.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatAuthors(issueArticle.authors)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Order</label>
                    <Input
                      type="number"
                      value={issueArticle.order}
                      onChange={(e) => reorderArticles(issueArticle.id, parseInt(e.target.value))}
                      min="1"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Start Page</label>
                    <Input
                      type="number"
                      value={issueArticle.pageStart}
                      onChange={(e) => updateArticlePages(
                        issueArticle.id, 
                        parseInt(e.target.value), 
                        issueArticle.pageEnd
                      )}
                      min="1"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">End Page</label>
                    <Input
                      type="number"
                      value={issueArticle.pageEnd}
                      onChange={(e) => updateArticlePages(
                        issueArticle.id, 
                        issueArticle.pageStart, 
                        parseInt(e.target.value)
                      )}
                      min={issueArticle.pageStart}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Article
            </Button>
            <Button onClick={generateTOC} variant="outline">
              Generate TOC
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Issue Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Issue Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">
                Volume {issueInfo.volume}, Issue {issueInfo.issue} ({issueInfo.year})
              </h2>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {issueInfo.title}
              </h3>
              {issueInfo.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {issueInfo.description}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Published: {new Date(issueInfo.publishDate).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-center mb-4">Table of Contents</h4>
              {issueArticles
                .sort((a, b) => a.order - b.order)
                .map((issueArticle) => (
                  <div key={issueArticle.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{issueArticle.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatAuthors(issueArticle.authors)}
                      </p>
                    </div>
                    <div className="text-sm font-medium ml-4">
                      {issueArticle.pageStart}-{issueArticle.pageEnd}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Issue Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              onClick={saveIssue}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Issue
            </Button>
            <Button variant="outline" disabled={loading}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Publication
            </Button>
            <Button variant="outline" disabled={loading}>
              <FileText className="h-4 w-4 mr-2" />
              Export Metadata
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};