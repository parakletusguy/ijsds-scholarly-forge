import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, FileText, Save } from 'lucide-react';

interface Review {
  id: string;
  submission_id: string;
  submitted_at: string | null;
  recommendation: string | null;
  comments_to_author: string | null;
  comments_to_editor: string | null;
  submissions: {
    articles: {
      title: string;
      abstract: string;
      subject_area: string;
      authors: any;
      manuscript_file_url: string | null;
    };
  };
}

export const ReviewForm = () => {
  const { reviewId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [recommendation, setRecommendation] = useState('');
  const [commentsToAuthor, setCommentsToAuthor] = useState('');
  const [commentsToEditor, setCommentsToEditor] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user && reviewId) {
      fetchReview();
    }
  }, [user, loading, reviewId, navigate]);

  const fetchReview = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          submissions (
            articles (
              title,
              abstract,
              subject_area,
              authors,
              manuscript_file_url
            )
          )
        `)
        .eq('id', reviewId)
        .eq('reviewer_id', user?.id)
        .single();

      if (error) throw error;
      
      setReview(data);
      setRecommendation(data.recommendation || '');
      setCommentsToAuthor(data.comments_to_author || '');
      setCommentsToEditor(data.comments_to_editor || '');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch review details',
        variant: 'destructive',
      });
      navigate('/reviewer-dashboard');
    } finally {
      setLoadingData(false);
    }
  };

  const saveReview = async (isSubmission = false) => {
    if (isSubmission) {
      setSubmitting(true);
    } else {
      setSaving(true);
    }

    try {
      const updateData: any = {
        recommendation,
        comments_to_author: commentsToAuthor,
        comments_to_editor: commentsToEditor,
      };

      if (isSubmission) {
        updateData.submitted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: isSubmission ? 'Review submitted successfully' : 'Review saved as draft',
      });

      if (isSubmission) {
        navigate('/reviewer-dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save review',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (!recommendation) {
      toast({
        title: 'Required Field',
        description: 'Please select a recommendation',
        variant: 'destructive',
      });
      return;
    }

    if (!commentsToAuthor.trim()) {
      toast({
        title: 'Required Field',
        description: 'Please provide comments to the author',
        variant: 'destructive',
      });
      return;
    }

    saveReview(true);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading review details..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Review Not Found</h2>
            <Button onClick={() => navigate('/reviewer-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSubmitted = !!review.submitted_at;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/reviewer-dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isSubmitted ? 'Review Details' : 'Submit Review'}
          </h1>
          <p className="text-muted-foreground">
            {isSubmitted ? 'View your submitted review' : 'Provide your review for this submission'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Article Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{review.submissions.articles.title}</h3>
                  {review.submissions.articles.subject_area && (
                    <div className="mt-2">
                      <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {review.submissions.articles.subject_area}
                      </span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Authors</h4>
                  {review.submissions.articles.authors && Array.isArray(review.submissions.articles.authors) ? (
                    <div className="text-sm">
                      {review.submissions.articles.authors.map((author: any, index: number) => (
                        <div key={index}>
                          {author.name} {author.affiliation && `(${author.affiliation})`}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No author information available</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Abstract</h4>
                  <p className="text-sm">{review.submissions.articles.abstract}</p>
                </div>
                
                {review.submissions.articles.manuscript_file_url && (
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(review.submissions.articles.manuscript_file_url, '_blank')}
                    >
                      Download Manuscript
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Review Form</CardTitle>
                <CardDescription>
                  {isSubmitted 
                    ? 'Your submitted review' 
                    : 'Please provide your detailed review for this submission'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Recommendation *</Label>
                  <RadioGroup 
                    value={recommendation} 
                    onValueChange={setRecommendation}
                    disabled={isSubmitted}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="accept" id="accept" />
                      <Label htmlFor="accept">Accept</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="minor_revisions" id="minor_revisions" />
                      <Label htmlFor="minor_revisions">Minor Revisions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="major_revisions" id="major_revisions" />
                      <Label htmlFor="major_revisions">Major Revisions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reject" id="reject" />
                      <Label htmlFor="reject">Reject</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="comments-author" className="text-base font-medium">
                    Comments to Author *
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Provide detailed feedback that will be shared with the author
                  </p>
                  <Textarea
                    id="comments-author"
                    placeholder="Enter your detailed comments and suggestions for the author..."
                    value={commentsToAuthor}
                    onChange={(e) => setCommentsToAuthor(e.target.value)}
                    disabled={isSubmitted}
                    rows={8}
                  />
                </div>

                <div>
                  <Label htmlFor="comments-editor" className="text-base font-medium">
                    Confidential Comments to Editor
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Private comments that will only be visible to the editor
                  </p>
                  <Textarea
                    id="comments-editor"
                    placeholder="Enter any confidential comments for the editor..."
                    value={commentsToEditor}
                    onChange={(e) => setCommentsToEditor(e.target.value)}
                    disabled={isSubmitted}
                    rows={4}
                  />
                </div>

                {!isSubmitted && (
                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={handleSubmit}
                      disabled={submitting || saving}
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => saveReview(false)}
                      disabled={submitting || saving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Draft'}
                    </Button>
                  </div>
                )}

                {isSubmitted && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Review submitted on {new Date(review.submitted_at!).toLocaleDateString()}
                    </p>
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