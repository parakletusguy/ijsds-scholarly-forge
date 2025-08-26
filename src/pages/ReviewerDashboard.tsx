import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { FileText, Clock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { PaperDownload } from '@/components/papers/PaperDownload';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: string;
  submission_id: string;
  submitted_at: string | null;
  recommendation: string | null;
  comments_to_author: string | null;
  comments_to_editor: string | null;
  submissions: {
    id: string;
    submitted_at: string;
    articles: {
      title: string;
      abstract: string;
      subject_area: string;
      corresponding_author_email: string;
      manuscript_file_url: string;
    };
  };
}

export const ReviewerDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isReviewer, setIsReviewer] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkReviewerStatus();
      fetchReviews();
    }
  }, [user, loading, navigate]);

  const checkReviewerStatus = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_reviewer')
      .eq('id', user.id)
      .single();
    
    if (!profile?.is_reviewer) {
      toast({
        title: 'Access Denied',
        description: 'You do not have reviewer privileges.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }
    
    setIsReviewer(true);
  };

  const fetchReviews = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          submissions (
            id,
            submitted_at,
            articles (
              title,
              abstract,
              subject_area,
              corresponding_author_email,
              manuscript_file_url
            )
          )
        `)
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch reviews',
        variant: 'destructive',
      });
    } finally {
      setLoadingReviews(false);
    }
  };

  const getReviewStatus = (review: Review) => {
    if (review.submitted_at) {
      return { status: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' };
    }
    return { status: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getReviewIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading || !isReviewer) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </main>
      </div>
    );
  }

  const pendingReviews = reviews.filter(r => !r.submitted_at);
  const completedReviews = reviews.filter(r => r.submitted_at);

  return (
    <div className="min-h-screen flex flex-col">
                      <div className="relative py-3">
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Reviewer Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned reviews</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingReviews.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedReviews.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingReviews.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedReviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loadingReviews ? (
              <div className="text-center py-8">Loading reviews...</div>
            ) : pendingReviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending reviews assigned
              </div>
            ) : (
              pendingReviews.map((review) => {
                const reviewStatus = getReviewStatus(review);
                return (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{review.submissions.articles.title}</CardTitle>
                          <CardDescription>
                            Assigned for review • Submitted {new Date(review.submissions.submitted_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={reviewStatus.color}>
                            {getReviewIcon(reviewStatus.status)}
                            <span className="ml-1">{reviewStatus.label}</span>
                          </Badge>
                          {review.submissions.articles.subject_area && (
                            <Badge variant="outline">
                              {review.submissions.articles.subject_area}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {review.submissions.articles.abstract}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <PaperDownload 
                          manuscriptFileUrl={review.submissions.articles.manuscript_file_url}
                          title={review.submissions.articles.title}
                        />
                        <Button 
                          onClick={() => navigate(`/review/${review.id}`)}
                        >
                          Start Review
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/submission/${review.submission_id}/details`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedReviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed reviews
              </div>
            ) : (
              completedReviews.map((review) => {
                const reviewStatus = getReviewStatus(review);
                return (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{review.submissions.articles.title}</CardTitle>
                          <CardDescription>
                            Review completed {review.submitted_at ? new Date(review.submitted_at).toLocaleDateString() : ''}
                            {review.recommendation && (
                              <span className="ml-2">
                                • Recommendation: <span className="font-medium">{review.recommendation}</span>
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={reviewStatus.color}>
                            {getReviewIcon(reviewStatus.status)}
                            <span className="ml-1">{reviewStatus.label}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/review/${review.id}`)}
                        >
                          View Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};