import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedSearch, SearchFilters } from '@/components/search/EnhancedSearch';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Calendar, User, FileText, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { PaperDownload } from '@/components/papers/PaperDownload';

interface Article {
  id: string;
  title: string;
  abstract: string;
  keywords: string[] | null;
  authors: any;
  publication_date: string | null;
  doi: string | null;
  status: string;
  volume: number | null;
  issue: number | null;
  subject_area: string | null;
  manuscript_file_url: string | null
}

export const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('publication_date', { ascending: false });

      if (error) throw error;
      const articlesData = data || [];
      setArticles(articlesData);
      setFilteredArticles(articlesData);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    setSearching(true);
    try {
      let query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'published');

      // Apply filters
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,abstract.ilike.%${filters.query}%`);
      }

      if (filters.subjectArea && filters.subjectArea.length > 0) {
        query = query.in('subject_area', filters.subjectArea);
      }

      if (filters.status && filters.status.length > 0 && !filters.status.includes('published')) {
        query = query.in('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('publication_date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('publication_date', filters.dateTo);
      }

      const { data, error } = await query.order('publication_date', { ascending: false });

      if (error) throw error;

      let results = data || [];

      // Filter by author if specified (client-side filtering for JSON field)
      if (filters.author) {
        results = results.filter(article => {
          if (Array.isArray(article.authors)) {
            return article.authors.some((author: any) => 
              author.name?.toLowerCase().includes(filters.author.toLowerCase())
            );
          }
          return false;
        });
      }

      setFilteredArticles(results);
    } catch (error) {
      console.error('Error searching articles:', error);
    } finally {
      setSearching(false);
    }
  };

  const formatAuthors = (authors: any) => {
    if (!authors || !Array.isArray(authors) || authors.length === 0) return 'Unknown Author';
    if (authors.length === 1) return authors[0].name;
    if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`;
    return `${authors[0].name} et al.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8">
             <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="space-y-6">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-12 bg-muted animate-pulse rounded" />
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Published Articles</h1>
            <p className="text-muted-foreground">
              Browse our collection of peer-reviewed articles in social and development sciences
            </p>
          </div>

          <EnhancedSearch 
            onSearch={(filters, sort, fuzzy) => handleSearch(filters)} 
            results={filteredArticles as any[]}
            loading={searching}
            totalResults={filteredArticles.length}
          />

          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground">
                  {searching ? 'Searching...' : articles.length === 0 
                    ? "No articles have been published yet." 
                    : "No articles found matching your criteria."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl leading-tight">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {formatAuthors(article.authors)}
                      </div>
                      {article.publication_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(article.publication_date).toLocaleDateString()}
                        </div>
                      )}
                      {article.volume && article.issue && (
                        <span>Vol. {article.volume}, Issue {article.issue}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {article.abstract}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      {article.subject_area && (
                        <Badge variant="outline">
                          {article.subject_area}
                        </Badge>
                      )}
                    </div>
                    
                    {article.keywords && Array.isArray(article.keywords) && article.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.keywords.slice(0, 5).map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {article.keywords.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{article.keywords.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {article.doi && (
                          <span>DOI: {article.doi}</span>
                        )}
                      </div>
                      {/* <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/article/${article.id}`)}
                      >
                        Read Article
                      </Button> */}
                        <PaperDownload 
                                manuscriptFileUrl={article.manuscript_file_url}
                              title={article.title}
                              />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};