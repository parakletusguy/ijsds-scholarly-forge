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
import { DOIManager } from '@/components/production/DOIManager';
import { FileText, Edit3, Eye, Layout, Download, BookOpen, ArrowLeft, Link, Users } from 'lucide-react';
import { ArticleAuthorsEditor } from '@/components/production/ArticleAuthorsEditor';
import { AutomatedReviewerMatchingInterface } from '@/components/workflow/AutomatedReviewerMatchingInterface';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getProductionArticles } from '@/lib/productionService';
import type { Article } from '@/lib/articleService';



export const Production = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const isEditor = !!(profile?.is_editor || profile?.is_admin);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/auth'); return; }
    if (!authLoading && user && !isEditor) {
      toast({ title: 'Access denied', description: 'You need editor access to view this page.', variant: 'destructive' });
      navigate('/dashboard'); return;
    }
    if (user && isEditor) fetchProductionArticles();
  }, [user, profile, authLoading]);

  const fetchProductionArticles = async () => {
    try {
      setLoading(true);
      const data = await getProductionArticles();
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
      case 'processed': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAuthors = (authors: any) => {
    if (!authors) return 'Unknown Author';
    if (typeof authors === 'string') return authors;
    if (Array.isArray(authors)) {
      return authors.map(author => {
        if (typeof author === 'string') return author;
        if (author.name) return author.name;
        const name = `${author.firstName || ''} ${author.lastName || ''}`.trim();
        return name || 'Unknown Author';
      }).join(', ');
    }
    return 'Unknown Author';
  };

  if (authLoading || loading || !isEditor) {
    return (
      <div className="min-h-screen ">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
              < div className="relative py-3">
                      <Button 
                      variant="outline" 
                      onClick={() => navigate(-1)}
                      className="mb-4 absolute top-1 left-3"
                        >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      </div>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Production Workflow</h1>
          <p className="text-muted-foreground">
            Manage copyediting, proofreading, typesetting, and final production of accepted articles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                          {article.crossrefDoi && (
                            <span className="text-xs text-green-700 font-medium">
                              CrossRef DOI: {article.crossrefDoi}
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
              <Tabs defaultValue="editing" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 h-auto">
                  <TabsTrigger value="editing" className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                    <Edit3 className="h-4 w-4 shrink-0" />
                    <span>Edit</span>
                  </TabsTrigger>
                  <TabsTrigger value="authors" className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>Authors</span>
                  </TabsTrigger>
                  <TabsTrigger value="doi" className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                    <Link className="h-4 w-4 shrink-0" />
                    <span>DOI</span>
                  </TabsTrigger>
                  <TabsTrigger value="issues" className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span>Issues</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="editing">
                  <CopyeditingTools
                    article={selectedArticle}
                    onUpdate={fetchProductionArticles}
                  />
                </TabsContent>

                <TabsContent value="authors">
                  <ArticleAuthorsEditor
                    article={selectedArticle}
                    onUpdate={fetchProductionArticles}
                  />
                </TabsContent>

                <TabsContent value="doi">
                  <DOIManager 
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

                {/* <TabsContent value="workflow">
                  <AutomatedReviewerMatchingInterface 
                    articleData={{
                      title: selectedArticle.title,
                      abstract: selectedArticle.abstract,
                      keywords: [],
                      subject_area: ''
                    }}
                  />
                </TabsContent> */}
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
    </div>
  );
};