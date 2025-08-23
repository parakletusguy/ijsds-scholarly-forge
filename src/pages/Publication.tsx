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
import { ArrowLeft, Calendar, FileText, Globe, Save, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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
  const [processed, setProcessed] = useState<Article[] | null>([])
  const [published, setPublished] = useState<Article[] | null>([])

  const [publicationData, setPublicationData] = useState({
    doi: '',
    volume: '',
    issue: '',
    pageStart: '',
    pageEnd: '',
    publicationDate: '',
  });
  const navigate = useNavigate()

  useEffect(() => {
    fetchAcceptedArticles();
  }, []);

  const fetchAcceptedArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .in('status', ['processed', 'published'])
        .order('submission_date', { ascending: false });

      if (error) throw error;
      const proccessedArray = []
      const publishedArray = []
      data.forEach((item,index) => {
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

    <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

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
              <div className="space-y-4 w-[100%] mb-7">
                {processed.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No processed articles found
                  </p>
                ) : (
                  processed.map((article) => (
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
              <Button className='m-auto w-full'>
                <Upload className='max-w-sm' />
                  publish all processed article
              </Button>
            </TabsContent>


            <TabsContent value='published'>
              <div className="space-y-4">
                {published.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No published articles found
                  </p>
                ) : (
                  published.map((article) => (
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
            </TabsContent>
          
          </CardContent>
          </Tabs>
        </Card>
      
        </div>
      </main>
      <Footer />
    </div>
  );
};