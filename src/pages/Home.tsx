import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Globe, ArrowRight, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Article {
  id: string;
  title: string;
  abstract: string;
  keywords: string[] | null;
  authors: any;
  publication_date: string;
  volume: number | null;
  issue: number | null;
}

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  const fetchRecentArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('publication_date', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentArticles(data || []);
    } catch (error) {
      console.error('Error fetching recent articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAuthors = (authors: any) => {
    if (!authors || !Array.isArray(authors) || authors.length === 0) return 'Unknown Author';
    if (authors.length === 1) return authors[0].name;
    if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`;
    return `${authors[0].name} et al.`;
  };

  return (
    <div className="min-h-screen my-12">
      {/* Hero Section */}
      <section className="">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-16 w-16 text-primary mr-4" />
          <div className="text-left">
            <h1 className="text-5xl font-bold text-foreground mb-2">IJSDS</h1>
            <p className="text-xl text-muted-foreground">International Journal On Social Work and Development Studies</p>
          </div>
        </div>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          "Empowering Communities through Research and Practice" - A peer-reviewed journal dedicated to advancing knowledge and practice in social work and development studies.
        </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/articles')}>
              Browse Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate(user ? '/submit' : '/auth')}>
              {user ? 'Submit Article' : 'Submit Your Research'}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose IJSDS?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Expert Peer Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Rigorous peer review process by leading experts in social work and development studies
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Global Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Global platform for researchers, practitioners, and policymakers to share insights and research findings
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Impact & Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Evidence-based research that informs policy and practice in social work and development studies
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Articles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Recent Publications</h2>
            <Button variant="outline" onClick={() => navigate('/articles')}>
              View All Articles
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 animate-pulse rounded" />
                    <div className="h-4  animate-pulse rounded w-3/4" />
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
          ) : recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/article/${article.id}`)}>
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      {formatAuthors(article.authors)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {article.abstract}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.publication_date).toLocaleDateString()}
                      </div>
                      {article.volume && article.issue && (
                        <span>Vol. {article.volume}, Issue {article.issue}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No articles published yet</h3>
                <p className="text-muted-foreground">
                  Be among the first to contribute to our journal's inaugural issues.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Share Your Research?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join our community of researchers, practitioners, and policymakers to contribute to social work and development studies.
          </p>
          <div className="flex justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate(user ? '/submit' : '/auth')}>
              {user ? 'Submit Your Article' : 'Get Started'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};