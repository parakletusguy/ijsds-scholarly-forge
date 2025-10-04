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
import { ArrowLeft, Calendar, FileText, Globe, Save, Upload, AlertTriangle, FileUp } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditorFileManager } from '@/components/editor/EditorFileManager';


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
  submission_id?: string;
}

export const Publication = () => {
  const { user } = useAuth();
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
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchAcceptedArticles();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (!profile?.is_admin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    }
  };

  const fetchAcceptedArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .in('status', ['processed', 'published'])
        .order('submission_date', { ascending: false });

      if (error) throw error;

      // Fetch submission IDs for each article
      const articlesWithSubmissions = await Promise.all(
        (data || []).map(async (article) => {
          const { data: submission } = await supabase
            .from('submissions')
            .select('id')
            .eq('article_id', article.id)
            .single();
          
          return {
            ...article,
            submission_id: submission?.id
          };
        })
      );

      const proccessedArray = []
      const publishedArray = []
      articlesWithSubmissions.forEach((item,index) => {
        if(item.status == 'processed'){
          proccessedArray.push(item);
        }
        else if(item.status == 'published'){
          publishedArray.push(item)
        }
      }
    )

      setProcessed(proccessedArray)
      setPublished(publishedArray)
      setArticles(articlesWithSubmissions || []);
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

  const handleBulkPublish = async () => {
    if (!bulkVolume || !bulkIssue) {
      toast({
        title: "Error",
        description: "Please enter both volume and issue numbers",
        variant: "destructive",
      });
      return;
    }

    const matchingArticles = processed.filter(
      article => 
        article.volume?.toString() === bulkVolume && 
        article.issue?.toString() === bulkIssue
    );

    if (matchingArticles.length === 0) {
      toast({
        title: "No Articles Found",
        description: `No processed articles found for Volume ${bulkVolume}, Issue ${bulkIssue}`,
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        status: 'published',
        publication_date: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('volume', parseInt(bulkVolume))
        .eq('issue', parseInt(bulkIssue))
        .eq('status', 'processed');

      if (error) throw error;

      // Create notifications for all published article authors
      try {
        const { notifyUserArticlePublished } = await import('@/lib/emailService');
        
        for (const article of matchingArticles) {
          // Get the user ID and profile from the corresponding author email
          const { data: authorProfile } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('email', article.corresponding_author_email)
            .single();

          if (authorProfile) {
            await notifyUserArticlePublished(
              authorProfile.id,
              authorProfile.full_name || 'Author',
              article.title
            );
          }
        }
      } catch (notificationError) {
        console.error('Error sending publication notifications:', notificationError);
        // Don't fail publication if notifications fail
      }

      toast({
        title: "Success",
        description: `Published ${matchingArticles.length} articles from Volume ${bulkVolume}, Issue ${bulkIssue}`,
      });

      fetchAcceptedArticles();
      setBulkVolume('');
      setBulkIssue('');
    } catch (error) {
      console.error('Error bulk publishing articles:', error);
      toast({
        title: "Error",
        description: "Failed to publish articles",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !isAdmin) {
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
                  <TabsTrigger className='w-[50%]' value="processed">ready for publication </TabsTrigger>
                  <TabsTrigger className='w-[50%]' value="published">published</TabsTrigger>
            </TabsList>
             </CardHeader>
          <CardContent>
           

              <TabsContent value='processed' className='flex flex-col items-center'>
                {/* Bulk Publishing Controls */}
                <Card className="w-full mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Bulk Publish by Volume & Issue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor="volume">Volume Number</Label>
                        <Input
                          id="volume"
                          type="number"
                          placeholder="e.g., 15"
                          value={bulkVolume}
                          onChange={(e) => setBulkVolume(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="issue">Issue Number</Label>
                        <Input
                          id="issue"
                          type="number"
                          placeholder="e.g., 3"
                          value={bulkIssue}
                          onChange={(e) => setBulkIssue(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleBulkPublish}
                        disabled={updating || !bulkVolume || !bulkIssue}
                        className="px-6"
                      >
                        {updating ? (
                          <>Publishing...</>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Publish Issue
                          </>
                        )}
                      </Button>
                    </div>
                    {bulkVolume && bulkIssue && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {processed.filter(
                          article => 
                            article.volume?.toString() === bulkVolume && 
                            article.issue?.toString() === bulkIssue
                        ).length} articles will be published for Volume {bulkVolume}, Issue {bulkIssue}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Articles List */}
                <div className="space-y-4 w-[100%]">
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
              </TabsContent>


            <TabsContent value='published'>
              <div className="space-y-4">
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
                          {article.submission_id && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileUp className="h-4 w-4 mr-2" />
                                  Manage Files
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Manage Article Files</DialogTitle>
                                  <DialogDescription>
                                    Upload new versions or view file history for this published article
                                  </DialogDescription>
                                </DialogHeader>
                                <EditorFileManager 
                                  articleId={article.id}
                                  submissionId={article.submission_id}
                                />
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
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
                      {article.publication_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Published: {format(new Date(article.publication_date), 'MMM dd, yyyy')}
                        </p>
                      )}
                      {article.doi && (
                        <p className="text-xs text-muted-foreground mt-1">
                          DOI: {article.doi}
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