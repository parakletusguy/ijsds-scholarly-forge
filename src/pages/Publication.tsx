import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Calendar, FileText, Globe, Save } from 'lucide-react';
import { format } from 'date-fns';

interface Article {
  id: string;
  title: string;
  abstract: string;
  authors: any;
  status: string;
  submission_date: string;
  corresponding_author_email: string;
  doi?: string;
  volume?: number;
  issue?: number;
  page_start?: number;
  page_end?: number;
  publication_date?: string;
}

export const Publication = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [publicationData, setPublicationData] = useState({
    doi: '',
    volume: '',
    issue: '',
    pageStart: '',
    pageEnd: '',
    publicationDate: '',
  });

  useEffect(() => {
    fetchAcceptedArticles();
  }, []);

  const fetchAcceptedArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .in('status', ['accepted', 'published'])
        .order('submission_date', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
    setPublicationData({
      doi: article.doi || '',
      volume: article.volume?.toString() || '',
      issue: article.issue?.toString() || '',
      pageStart: article.page_start?.toString() || '',
      pageEnd: article.page_end?.toString() || '',
      publicationDate: article.publication_date || '',
    });
  };

  const generateDOI = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    const doi = `10.1234/journal.${new Date().getFullYear()}.${randomId}`;
    setPublicationData(prev => ({ ...prev, doi }));
  };

  const handlePublish = async () => {
    if (!selectedArticle) return;

    setUpdating(true);
    try {
      const updateData: any = {
        status: 'published',
        publication_date: publicationData.publicationDate || new Date().toISOString(),
      };

      if (publicationData.doi) updateData.doi = publicationData.doi;
      if (publicationData.volume) updateData.volume = parseInt(publicationData.volume);
      if (publicationData.issue) updateData.issue = parseInt(publicationData.issue);
      if (publicationData.pageStart) updateData.page_start = parseInt(publicationData.pageStart);
      if (publicationData.pageEnd) updateData.page_end = parseInt(publicationData.pageEnd);

      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', selectedArticle.id);

      if (error) throw error;

      // Create notification for author
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedArticle.corresponding_author_email, // This should be user_id in real implementation
          title: 'Article Published',
          message: `Your article "${selectedArticle.title}" has been published!`,
          type: 'success'
        });

      toast({
        title: "Success",
        description: "Article published successfully",
      });

      fetchAcceptedArticles();
      setSelectedArticle(null);
    } catch (error) {
      console.error('Error publishing article:', error);
      toast({
        title: "Error",
        description: "Failed to publish article",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div>Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Publication Management</h1>
          <p className="text-muted-foreground">
            Manage the final publication of accepted articles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Articles List */}
          <Card>
            <CardHeader>
              <CardTitle>Accepted Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {articles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No accepted articles found
                  </p>
                ) : (
                  articles.map((article) => (
                    <div
                      key={article.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedArticle?.id === article.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleArticleSelect(article)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium line-clamp-2">{article.title}</h3>
                        <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                          {article.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Authors: {Array.isArray(article.authors) 
                          ? article.authors.map((a: any) => a.name).join(', ')
                          : 'Unknown'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {format(new Date(article.submission_date), 'MMM dd, yyyy')}
                      </p>
                      {article.doi && (
                        <p className="text-xs text-muted-foreground mt-1">
                          DOI: {article.doi}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Publication Details */}
          <Card>
            <CardHeader>
              <CardTitle>Publication Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedArticle ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">{selectedArticle.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedArticle.abstract.substring(0, 200)}...
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="doi">DOI</Label>
                      <div className="flex gap-2">
                        <Input
                          id="doi"
                          value={publicationData.doi}
                          onChange={(e) => setPublicationData(prev => ({ ...prev, doi: e.target.value }))}
                          placeholder="10.1234/journal.2024.123456"
                        />
                        <Button variant="outline" onClick={generateDOI}>
                          <Globe className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="volume">Volume</Label>
                        <Input
                          id="volume"
                          type="number"
                          value={publicationData.volume}
                          onChange={(e) => setPublicationData(prev => ({ ...prev, volume: e.target.value }))}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="issue">Issue</Label>
                        <Input
                          id="issue"
                          type="number"
                          value={publicationData.issue}
                          onChange={(e) => setPublicationData(prev => ({ ...prev, issue: e.target.value }))}
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="page-start">Start Page</Label>
                        <Input
                          id="page-start"
                          type="number"
                          value={publicationData.pageStart}
                          onChange={(e) => setPublicationData(prev => ({ ...prev, pageStart: e.target.value }))}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="page-end">End Page</Label>
                        <Input
                          id="page-end"
                          type="number"
                          value={publicationData.pageEnd}
                          onChange={(e) => setPublicationData(prev => ({ ...prev, pageEnd: e.target.value }))}
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="publication-date">Publication Date</Label>
                      <Input
                        id="publication-date"
                        type="date"
                        value={publicationData.publicationDate}
                        onChange={(e) => setPublicationData(prev => ({ ...prev, publicationDate: e.target.value }))}
                      />
                    </div>

                    <Button 
                      onClick={handlePublish} 
                      disabled={updating || !publicationData.doi}
                      className="w-full"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {updating ? 'Publishing...' : 'Publish Article'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select an article to configure publication details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};