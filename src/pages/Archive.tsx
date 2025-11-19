import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

interface Author {
  name: string;
  affiliation?: string;
}

interface Article {
  id: string;
  title: string;
  abstract: string;
  authors: Author[];
  doi: string | null;
  volume: number | null;
  issue: number | null;
  page_start: number | null;
  page_end: number | null;
  publication_date: string | null;
  manuscript_file_url: string | null;
  keywords: string[] | null;
}

interface VolumeIssue {
  volume: number;
  issue: number;
  articles: Article[];
  year: string;
}

export default function Archive() {
  const [archiveData, setArchiveData] = useState<VolumeIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .not('volume', 'is', null)
        .not('issue', 'is', null)
        .order('volume', { ascending: false })
        .order('issue', { ascending: false })
        .order('publication_date', { ascending: false });

      if (error) throw error;

      // Group articles by volume and issue
      const grouped = (data as any[]).reduce((acc: Record<string, VolumeIssue>, article: any) => {
        const key = `${article.volume}-${article.issue}`;
        if (!acc[key]) {
          acc[key] = {
            volume: article.volume,
            issue: article.issue,
            articles: [],
            year: article.publication_date 
              ? new Date(article.publication_date).getFullYear().toString()
              : 'N/A'
          };
        }
        acc[key].articles.push({
          ...article,
          authors: article.authors as Author[]
        });
        return acc;
      }, {});

      const sortedArchive = (Object.values(grouped) as VolumeIssue[]).sort((a, b) => {
        if (a.volume !== b.volume) return b.volume - a.volume;
        return b.issue - a.issue;
      });

      setArchiveData(sortedArchive);
    } catch (error) {
      console.error('Error fetching archive:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAuthors = (authors: Author[]) => {
    return authors.map(a => a.name).join(', ');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BookOpen className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading archive...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Archive - IJSDS Journal</title>
        <meta name="description" content="Browse the complete archive of published articles in the International Journal On Social Work and Development Studies (IJSDS), organized by volume and issue." />
        <meta name="keywords" content="IJSDS archive, journal archive, social work publications, development studies articles, academic archive" />
      </Helmet>

      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Journal Archive</h1>
          <p className="text-xl text-muted-foreground">
            International Journal On Social Work and Development Studies (IJSDS)
          </p>
          <Separator className="mt-4" />
        </div>

        {archiveData.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No published articles found in the archive.</p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {archiveData.map((volumeIssue, index) => (
              <AccordionItem 
                key={`${volumeIssue.volume}-${volumeIssue.issue}`} 
                value={`${volumeIssue.volume}-${volumeIssue.issue}`}
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-6 hover:no-underline hover:bg-accent/50">
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold">
                        Volume {volumeIssue.volume}, Issue {volumeIssue.issue}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {volumeIssue.year} • {volumeIssue.articles.length} {volumeIssue.articles.length === 1 ? 'Article' : 'Articles'}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4 mt-4">
                    {volumeIssue.articles.map((article, articleIndex) => (
                      <Card key={article.id} className="border-l-4 border-l-primary">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                              <CardDescription className="text-sm">
                                {formatAuthors(article.authors)}
                              </CardDescription>
                            </div>
                            {article.doi && (
                              <Badge variant="secondary" className="shrink-0">
                                DOI: {article.doi}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {article.abstract}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {article.keywords?.map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {article.page_start && article.page_end && (
                              <span>Pages {article.page_start}-{article.page_end}</span>
                            )}
                            {article.publication_date && (
                              <span>
                                Published: {new Date(article.publication_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2 mt-4">
                            {article.manuscript_file_url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={article.manuscript_file_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </a>
                              </Button>
                            )}
                            {article.doi && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View DOI
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </>
  );
}
