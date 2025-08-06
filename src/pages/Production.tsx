import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CopyeditingTools } from '@/components/production/CopyeditingTools';
import { ProofreadingSystem } from '@/components/production/ProofreadingSystem';
import { TypesettingIntegration } from '@/components/production/TypesettingIntegration';
import { PDFGeneration } from '@/components/production/PDFGeneration';
import { IssueCompilation } from '@/components/production/IssueCompilation';
import { FileText, Edit3, Eye, Layout, Download, BookOpen } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  authors: any;
  status: string;
  publication_date: string;
  doi: string;
  manuscript_file_url: string;
  volume: number;
  issue: number;
  page_start: number;
  page_end: number;
  abstract: string;
}

export const Production = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (user) {
      fetchProductionArticles();
    }
  }, [user]);

  const fetchProductionArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .in('status', ['accepted', 'in_production', 'copyediting', 'proofreading', 'typesetting', 'ready_for_publication'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching production articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch production articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-yellow-100 text-yellow-800';
      case 'copyediting': return 'bg-orange-100 text-orange-800';
      case 'proofreading': return 'bg-purple-100 text-purple-800';
      case 'typesetting': return 'bg-indigo-100 text-indigo-800';
      case 'ready_for_publication': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Production Workflow</h1>
          <p className="text-muted-foreground">
            Manage copyediting, proofreading, typesetting, and final production of accepted articles
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Articles List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Production Articles ({articles.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {articles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No articles in production
                  </p>
                ) : (
                  articles.map((article) => (
                    <div
                      key={article.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedArticle?.id === article.id ? 'border-primary bg-muted/50' : 'border-border'
                      }`}
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{article.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {formatAuthors(article.authors)}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(article.status)} variant="secondary">
                            {article.status.replace('_', ' ')}
                          </Badge>
                          {article.doi && (
                            <span className="text-xs text-muted-foreground">
                              DOI: {article.doi}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Production Tools */}
          <div className="lg:col-span-2">
            {selectedArticle ? (
              <Tabs defaultValue="copyediting" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="copyediting" className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Copyedit
                  </TabsTrigger>
                  <TabsTrigger value="proofreading" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Proofread
                  </TabsTrigger>
                  <TabsTrigger value="typesetting" className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Typeset
                  </TabsTrigger>
                  <TabsTrigger value="pdf" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    PDF
                  </TabsTrigger>
                  <TabsTrigger value="issues" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Issues
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="copyediting">
                  <CopyeditingTools 
                    article={selectedArticle} 
                    onUpdate={fetchProductionArticles}
                  />
                </TabsContent>

                <TabsContent value="proofreading">
                  <ProofreadingSystem 
                    article={selectedArticle} 
                    onUpdate={fetchProductionArticles}
                  />
                </TabsContent>

                <TabsContent value="typesetting">
                  <TypesettingIntegration 
                    article={selectedArticle} 
                    onUpdate={fetchProductionArticles}
                  />
                </TabsContent>

                <TabsContent value="pdf">
                  <PDFGeneration 
                    article={selectedArticle} 
                    onUpdate={fetchProductionArticles}
                  />
                </TabsContent>

                <TabsContent value="issues">
                  <IssueCompilation 
                    article={selectedArticle} 
                    onUpdate={fetchProductionArticles}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select an Article</h3>
                    <p className="text-muted-foreground">
                      Choose an article from the list to begin production workflow
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};