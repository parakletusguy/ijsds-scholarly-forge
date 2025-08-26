import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Users, Mail, BookOpen, ArrowLeft } from 'lucide-react';

interface Reviewer {
  id: string;
  full_name: string;
  email: string;
  affiliation: string;
  bio: string;
}

interface Submission {
  id: string;
  articles: {
    title: string;
    abstract: string;
    subject_area: string;
  };
}

export const ReviewAssignment = () => {
  const { submissionId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user && submissionId) {
      fetchData();
    }
  }, [user, loading, submissionId, navigate]);

  const fetchData = async () => {
    try {
      // Fetch submission details
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .select(`
          id,
          articles (
            title,
            abstract,
            subject_area
          )
        `)
        .eq('id', submissionId)
        .single();

      if (submissionError) throw submissionError;
      setSubmission(submissionData);

      // Fetch available reviewers
      const { data: reviewersData, error: reviewersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, affiliation, bio')
        .eq('is_reviewer', true);

      if (reviewersError) throw reviewersError;
      setReviewers(reviewersData || []);
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

  const handleReviewerSelection = (reviewerId: string, checked: boolean) => {
    if (checked) {
      setSelectedReviewers(prev => [...prev, reviewerId]);
    } else {
      setSelectedReviewers(prev => prev.filter(id => id !== reviewerId));
    }
  };

  const assignReviewers = async () => {
    if (selectedReviewers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one reviewer',
        variant: 'destructive',
      });
      return;
    }

    setAssigning(true);
    try {
      // Create review records for each selected reviewer
      const reviewInserts = selectedReviewers.map(reviewerId => ({
        submission_id: submissionId,
        reviewer_id: reviewerId,
      }));

      const { error } = await supabase
        .from('reviews')
        .insert(reviewInserts);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Assigned ${selectedReviewers.length} reviewer(s) to this submission`,
      });

      navigate('/editorial');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to assign reviewers',
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </main>
      </div>
    );
  }

  if (!submission) {
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
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Assign Reviewers</h1>
          <p className="text-muted-foreground">Select reviewers for this submission</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Submission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{submission.articles.title}</h3>
                  {submission.articles.subject_area && (
                    <Badge variant="secondary" className="mt-2">
                      {submission.articles.subject_area}
                    </Badge>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Abstract</h4>
                  <p className="text-sm">{submission.articles.abstract}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Available Reviewers ({reviewers.length})
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedReviewers.length}
                  </div>
                </div>
                <CardDescription>
                  Select reviewers to assign to this submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviewers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviewers available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewers.map((reviewer) => (
                      <div 
                        key={reviewer.id} 
                        className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={selectedReviewers.includes(reviewer.id)}
                          onCheckedChange={(checked) => 
                            handleReviewerSelection(reviewer.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{reviewer.full_name}</h4>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{reviewer.email}</span>
                          </div>
                          {reviewer.affiliation && (
                            <p className="text-sm text-muted-foreground mb-2">{reviewer.affiliation}</p>
                          )}
                          {reviewer.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{reviewer.bio}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {reviewers.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex gap-4">
                      <Button 
                        onClick={assignReviewers} 
                        disabled={selectedReviewers.length === 0 || assigning}
                        className="flex-1"
                      >
                        {assigning ? 'Assigning...' : `Assign ${selectedReviewers.length} Reviewer(s)`}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/editorial')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};