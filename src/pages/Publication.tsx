import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getProcessedArticles, getPublishedArticles, updateArticleStatus } from '@/lib/publicationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

import { ArrowLeft, Calendar, FileText, Globe, Save, Upload, AlertTriangle, FileUp, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { BatchReleaseBanner } from '@/components/ijsds2/BatchReleaseBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditorFileManager } from '@/components/editor/EditorFileManager';
import { ArticleAuthorsEditor } from '@/components/production/ArticleAuthorsEditor';
import { DOIManager } from '@/components/production/DOIManager';
import { DOAJExportManager } from '@/components/production/DOAJExportManager';
import { downloadDoajXml } from '@/lib/doajService';


interface Article {
  id: string;
  title: string;
  abstract: string;
  authors: any;
  status: string;
  submission_date: string;
  corresponding_author_email: string;
  doi?: string;
  crossrefDoi?: string | null;
  volume?: number;
  issue?: number;
  page_start?: number;
  page_end?: number;
  publication_date?: string;
  submission_id?: string;
  manuscript_file_url?: string;
}

export const Publication = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const isAdminUser = !!profile?.is_admin;
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [processed, setProcessed] = useState<Article[] | null>([]);
  const [published, setPublished] = useState<Article[] | null>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bulkVolume, setBulkVolume] = useState('');
  const [bulkIssue, setBulkIssue] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    if (profile?.is_editor || profile?.is_admin) {
      setIsAdmin(true);
    } else if (profile) {
      toast({ title: "Access denied", description: "You need editor access to view this page.", variant: "destructive" });
      navigate('/dashboard');
    }
  }, [user, profile, authLoading]);

  useEffect(() => {
    if (isAdmin) {
      fetchAcceptedArticles();
    }
  }, [isAdmin]);

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

  const fetchAcceptedArticles = async () => {
    try {
      setLoading(true);
      const [processedData, publishedData] = await Promise.all([
        getProcessedArticles(),
        getPublishedArticles()
      ]);

      // The backend returns the article's latest submission — use it directly
      const withSubmissionId = (article: any): Article => ({
        ...article,
        submission_id: article.submission_id ?? article.submissions?.[0]?.id,
      });

      const enrichedProcessed = processedData.map(withSubmissionId);
      const enrichedPublished = publishedData.map(withSubmissionId);

      setProcessed(enrichedProcessed);
      setPublished(enrichedPublished);
      setArticles([...enrichedProcessed, ...enrichedPublished]);
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



  const generateDOI = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    const doi = `10.1234/journal.${new Date().getFullYear()}.${randomId}`;
  };


  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded-full animate-bounce" />
          <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-.3s]" />
          <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-.5s]" />
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
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
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Publication Management</h1>
          <p className="text-muted-foreground">
            Manage the final publication of accepted articles
          </p>
        </div>
        <div className="">

        <Card>
             <Tabs defaultValue='processed'>
             <CardHeader>
                <TabsList className='flex justify-evenly'>
                  <TabsTrigger className='flex-1' value="processed">Ready for Publication</TabsTrigger>
                  <TabsTrigger className='flex-1' value="published">Published</TabsTrigger>
            </TabsList>
             </CardHeader>
          <CardContent>
           

              <TabsContent value='processed' className='flex flex-col items-center'>
                {/* IJSDS 2.0: publication happens only in the monthly batch on the 28th */}
                <Card className="w-full mb-6 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Publication happens on the 28th</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <BatchReleaseBanner />
                    <p>
                      Articles are no longer published one by one. Once an article is approved for processing and its Crossref DOI is
                      registered, it joins the next monthly batch automatically and is released at 00:00 WAT on the 28th.
                      Papers still waiting for a DOI appear below with their volume and issue.
                    </p>
                    {isAdminUser && (
                      <Button variant="outline" onClick={() => navigate('/admin')}>
                        Open the batch release console
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Articles List */}
                <div className="space-y-4 w-full">
                  {processed.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No processed articles found
                    </p>
                  ) : (
                    processed.map((article) => (
                      <div
                        key={article.id}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium line-clamp-2">{article.title}</h3>
                          <div className="flex gap-2">
                            {article.volume && article.issue && (
                              <Badge variant="outline">
                                Vol {article.volume}, Issue {article.issue}
                              </Badge>
                            )}
                            <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                              {article.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Authors: {formatAuthors(article.authors)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {format(new Date(article.submission_date), 'MMM dd, yyyy')}
                        </p>
                        {article.crossrefDoi && (
                          <p className="text-xs text-green-700 font-medium mt-1">
                            CrossRef DOI: {article.crossrefDoi}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>


            <TabsContent value='published'>
              <div className="space-y-4">
                {published && published.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-stone-800">DOAJ Export & Indexing</p>
                      <p className="text-[11px] text-stone-500">Batch export all published articles into DOAJ Native XML for indexing deposit</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDoajXml(published as any)}
                      className="text-xs gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download All DOAJ XML ({published.length})
                    </Button>
                  </div>
                )}

                {published.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No published articles found
                  </p>
                ) : (
                  published.map((article) => (
                    <Card key={article.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium line-clamp-2">{article.title}</h3>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                            {article.status}
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <FileUp className="h-4 w-4 mr-2" />
                                Manage
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Manage Article</DialogTitle>
                                <DialogDescription>
                                  Update files, authors, DOI, or export metadata to DOAJ
                                </DialogDescription>
                              </DialogHeader>
                              <Tabs defaultValue={article.submission_id ? 'files' : 'authors'} className="w-full">
                                <TabsList className={`grid w-full ${article.submission_id ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                  {article.submission_id && <TabsTrigger value="files">Files</TabsTrigger>}
                                  <TabsTrigger value="authors">Authors</TabsTrigger>
                                  <TabsTrigger value="doi">
                                    DOI
                                    {!article.crossrefDoi && (
                                      <Badge variant="destructive" className="ml-2 h-5">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        No DOI
                                      </Badge>
                                    )}
                                  </TabsTrigger>
                                  <TabsTrigger value="doaj">DOAJ</TabsTrigger>
                                </TabsList>
                                {article.submission_id && (
                                  <TabsContent value="files">
                                    <EditorFileManager
                                      articleId={article.id}
                                      submissionId={article.submission_id}
                                    />
                                  </TabsContent>
                                )}
                                <TabsContent value="authors">
                                  <ArticleAuthorsEditor
                                    article={article as any}
                                    onUpdate={fetchAcceptedArticles}
                                  />
                                </TabsContent>
                                <TabsContent value="doi">
                                  <DOIManager
                                    article={article}
                                    onUpdate={fetchAcceptedArticles}
                                  />
                                </TabsContent>
                                <TabsContent value="doaj">
                                  <DOAJExportManager
                                    article={article as any}
                                    onUpdate={fetchAcceptedArticles}
                                  />
                                </TabsContent>
                              </Tabs>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Authors: {formatAuthors(article.authors)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {format(new Date(article.submission_date), 'MMM dd, yyyy')}
                      </p>
                      {article.publication_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Published: {format(new Date(article.publication_date), 'MMM dd, yyyy')}
                        </p>
                      )}
                      {article.crossrefDoi && (
                        <p className="text-xs text-green-700 font-medium mt-1">
                          CrossRef DOI: {article.crossrefDoi}
                        </p>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          
          </CardContent>
          </Tabs>
        </Card>
      
        </div>
      </main>
    </div>
  );
};