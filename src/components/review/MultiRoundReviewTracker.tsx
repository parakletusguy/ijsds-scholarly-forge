import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Clock, User, Star, AlertCircle } from 'lucide-react';

interface Review {
  id: string;
  reviewer_id: string;
  submission_id: string;
  review_round: number;
  recommendation: string;
  comments_to_author: string;
  comments_to_editor: string;
  submitted_at: string;
  deadline_date: string;
  invitation_status: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface ReviewRound {
  round: number;
  reviews: Review[];
  status: 'active' | 'completed' | 'pending';
  completion_rate: number;
}

interface MultiRoundReviewTrackerProps {
  submissionId: string;
}

export const MultiRoundReviewTracker = ({ submissionId }: MultiRoundReviewTrackerProps) => {
  const { toast } = useToast();
  const [reviewRounds, setReviewRounds] = useState<ReviewRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState(1);

  useEffect(() => {
    fetchReviewRounds();
  }, [submissionId]);

  const fetchReviewRounds = async () => {
    try {
      setLoading(true);
      
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .eq('submission_id', submissionId)
        .order('review_round', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group reviews by round
      const roundsMap = new Map<number, Review[]>();
      reviews?.forEach(review => {
        const round = review.review_round || 1;
        if (!roundsMap.has(round)) {
          roundsMap.set(round, []);
        }
        roundsMap.get(round)?.push(review);
      });

      // Convert to ReviewRound objects
      const rounds: ReviewRound[] = Array.from(roundsMap.entries()).map(([round, roundReviews]) => {
        const completedReviews = roundReviews.filter(r => r.submitted_at);
        const completion_rate = roundReviews.length > 0 ? (completedReviews.length / roundReviews.length) * 100 : 0;
        
        const status: 'active' | 'completed' | 'pending' = 
          completion_rate === 100 ? 'completed' :
          completion_rate > 0 ? 'active' :
          'pending';

        return {
          round,
          reviews: roundReviews,
          status,
          completion_rate
        };
      });

      setReviewRounds(rounds);
      setCurrentRound(rounds.length > 0 ? Math.max(...rounds.map(r => r.round)) : 1);
    } catch (error) {
      console.error('Error fetching review rounds:', error);
      toast({
        title: "Error",
        description: "Failed to load review rounds",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startNewRound = async () => {
    try {
      const newRound = currentRound + 1;
      
      // Create new review entries for the new round
      // This would typically copy reviewers from previous round or assign new ones
      const { data: previousRoundReviews } = await supabase
        .from('reviews')
        .select('reviewer_id')
        .eq('submission_id', submissionId)
        .eq('review_round', currentRound);

      if (previousRoundReviews) {
        for (const review of previousRoundReviews) {
          await supabase
            .from('reviews')
            .insert({
              submission_id: submissionId,
              reviewer_id: review.reviewer_id,
              review_round: newRound,
              invitation_status: 'pending',
              invitation_sent_at: new Date().toISOString(),
              deadline_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            });
        }
      }

      toast({
        title: "New Round Started",
        description: `Review round ${newRound} has been initiated`,
      });

      fetchReviewRounds();
    } catch (error) {
      console.error('Error starting new round:', error);
      toast({
        title: "Error",
        description: "Failed to start new review round",
        variant: "destructive",
      });
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation?.toLowerCase()) {
      case 'accept': return 'bg-green-100 text-green-800';
      case 'reject': return 'bg-red-100 text-red-800';
      case 'minor_revision': return 'bg-yellow-100 text-yellow-800';
      case 'major_revision': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOverallProgress = () => {
    if (reviewRounds.length === 0) return 0;
    const totalCompletion = reviewRounds.reduce((sum, round) => sum + round.completion_rate, 0);
    return totalCompletion / reviewRounds.length;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading review rounds...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Multi-Round Review Tracker
            </span>
            <Badge variant="outline">
              Round {currentRound} of {reviewRounds.length || 1}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(calculateOverallProgress())}% Complete
                </span>
              </div>
              <Progress value={calculateOverallProgress()} />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{reviewRounds.length}</div>
                <div className="text-sm text-muted-foreground">Total Rounds</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {reviewRounds.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {reviewRounds.filter(r => r.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Round Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Review Rounds
            <Button onClick={startNewRound} size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Start New Round
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={`round-${currentRound}`} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {reviewRounds.slice(-4).map(round => (
                <TabsTrigger 
                  key={round.round} 
                  value={`round-${round.round}`}
                  onClick={() => setCurrentRound(round.round)}
                >
                  Round {round.round}
                </TabsTrigger>
              ))}
            </TabsList>

            {reviewRounds.map(round => (
              <TabsContent key={round.round} value={`round-${round.round}`} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Round {round.round}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      round.status === 'completed' ? 'default' :
                      round.status === 'active' ? 'secondary' :
                      'outline'
                    }>
                      {round.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(round.completion_rate)}% complete
                    </span>
                  </div>
                </div>

                <Progress value={round.completion_rate} />

                <div className="space-y-3">
                  {round.reviews.map(review => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            {review.profiles?.full_name || 'Unknown Reviewer'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {review.submitted_at ? (
                            <Badge variant="default">Completed</Badge>
                          ) : (
                            <Badge variant="outline">
                              {review.invitation_status}
                            </Badge>
                          )}
                          {review.recommendation && (
                            <Badge className={getRecommendationColor(review.recommendation)} variant="secondary">
                              {review.recommendation.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {review.submitted_at ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Submitted: {new Date(review.submitted_at).toLocaleDateString()}
                          </div>
                          {review.comments_to_author && (
                            <div>
                              <span className="font-medium">Comments to Author:</span>
                              <p className="text-muted-foreground mt-1">
                                {review.comments_to_author.substring(0, 150)}...
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          Deadline: {new Date(review.deadline_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};