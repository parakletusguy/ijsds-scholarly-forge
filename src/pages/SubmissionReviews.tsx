import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface Review {
  id: string;
  reviewer_id: string;
  invitation_status: string;
  submitted_at: string | null;
  recommendation: string | null;
  comments_to_author: string | null;
  comments_to_editor: string | null;
  deadline_date: string | null;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Submission {
  id: string;
  articles: {
    title: string;
    abstract: string;
  };
}

export const SubmissionReviews = () => {
  const { submissionId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user && submissionId) {
      checkEditorStatus();
      fetchData();
    }
  }, [user, loading, submissionId, navigate]);

  const checkEditorStatus = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_editor')
      .eq('id', user.id)
      .single();
    
    if (!profile?.is_editor) {
      toast({
        title: 'Access Denied',
        description: 'You do not have editor privileges.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }
    
    setIsEditor(true);
  };

  const fetchData = async () => {
    try {
      // Fetch submission details
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .select(`
          id,
          articles (
            title,
            abstract
          )
        `)
        .eq('id', submissionId)
        .single();

      if (submissionError) throw submissionError;
      setSubmission(submissionData);

      // Fetch reviews for this submission
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          reviewer_id,
          invitation_status,
          submitted_at,
          recommendation,
          comments_to_author,
          comments_to_editor,
          deadline_date,
          profiles (
            full_name,
            email
          )
        `)
        .eq('submission_id', submissionId);

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const getReviewStatus = (review: Review) => {
    if (review.submitted_at) {
      return { status: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' };
    }
    if (review.invitation_status === 'pending') {
      return { status: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (review.invitation_status === 'declined') {
      return { status: 'declined', label: 'Declined', color: 'bg-red-100 text-red-800' };
    }
    return { status: 'invited', label: 'Invited', color: 'bg-blue-100 text-blue-800' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'declined': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading || !isEditor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading submission details...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
            <Button onClick={() => navigate('/editorial')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editorial Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/editorial')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Editorial Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Review Status</h1>
          <p className="text-muted-foreground">
            {submission.articles.title}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{submission.articles.title}</h3>
                  <p className="text-sm text-muted-foreground">{submission.articles.abstract}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({reviews.length})</CardTitle>
                <CardDescription>
                  Current status of all reviews for this submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews assigned yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => {
                      const reviewStatus = getReviewStatus(review);
                      return (
                        <div key={review.id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{review.profiles.full_name}</h4>
                              <p className="text-sm text-muted-foreground">{review.profiles.email}</p>
                            </div>
                            <Badge className={reviewStatus.color}>
                              {getStatusIcon(reviewStatus.status)}
                              <span className="ml-1">{reviewStatus.label}</span>
                            </Badge>
                          </div>
                          
                          {review.deadline_date && (
                            <p className="text-sm text-muted-foreground mb-2">
                              Deadline: {new Date(review.deadline_date).toLocaleDateString()}
                            </p>
                          )}
                          
                          {review.submitted_at && (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Submitted: {new Date(review.submitted_at).toLocaleDateString()}
                              </p>
                              {review.recommendation && (
                                <p className="text-sm">
                                  <span className="font-medium">Recommendation:</span> {review.recommendation}
                                </p>
                              )}
                              {review.comments_to_editor && (
                                <div>
                                  <p className="text-sm font-medium">Confidential Comments:</p>
                                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded mt-1">
                                    {review.comments_to_editor}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};