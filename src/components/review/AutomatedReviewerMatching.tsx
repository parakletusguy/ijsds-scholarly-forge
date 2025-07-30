import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Target, Brain, User, Star } from 'lucide-react';

interface ReviewerMatch {
  reviewer_id: string;
  reviewer_name: string;
  reviewer_email: string;
  reviewer_affiliation?: string;
  reviewer_bio?: string;
  match_score: number;
  match_reasons: string[];
  expertise_areas: string[];
  review_history: {
    total_reviews: number;
    avg_rating: number;
    on_time_percentage: number;
  };
}

interface AutomatedReviewerMatchingProps {
  submissionId: string;
  articleData: {
    title: string;
    abstract: string;
    keywords?: string[];
    subject_area?: string;
  };
  onReviewerSelect?: (reviewerId: string) => void;
}

export const AutomatedReviewerMatching = ({ 
  submissionId, 
  articleData,
  onReviewerSelect 
}: AutomatedReviewerMatchingProps) => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<ReviewerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    findReviewerMatches();
  }, [submissionId]);

  const findReviewerMatches = async () => {
    setLoading(true);
    setAnalyzing(true);
    
    try {
      // Get all potential reviewers
      const { data: reviewers, error: reviewersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_reviewer', true);

      if (reviewersError) throw reviewersError;

      const reviewerMatches: ReviewerMatch[] = [];

      for (const reviewer of reviewers || []) {
        let matchScore = 0;
        const matchReasons: string[] = [];
        const expertiseAreas: string[] = [];

        // Extract keywords from article
        const articleKeywords = [
          ...(articleData.keywords || []),
          ...(articleData.title?.toLowerCase().split(/\s+/) || []),
          ...(articleData.abstract?.toLowerCase().split(/\s+/) || []),
        ].filter(word => word.length > 3);

        // Check bio for expertise matching
        if (reviewer.bio) {
          const bioWords = reviewer.bio.toLowerCase().split(/\s+/);
          const commonKeywords = articleKeywords.filter(keyword => 
            bioWords.some(bioWord => bioWord.includes(keyword.toLowerCase()))
          );
          
          if (commonKeywords.length > 0) {
            matchScore += commonKeywords.length * 10;
            matchReasons.push(`Bio mentions ${commonKeywords.length} relevant keywords`);
            expertiseAreas.push(...commonKeywords.slice(0, 3));
          }
        }

        // Check subject area matching
        if (articleData.subject_area && reviewer.affiliation) {
          const subjectWords = articleData.subject_area.toLowerCase().split(/\s+/);
          const affiliationWords = reviewer.affiliation.toLowerCase().split(/\s+/);
          const subjectMatch = subjectWords.some(word => 
            affiliationWords.some(affWord => affWord.includes(word))
          );
          
          if (subjectMatch) {
            matchScore += 20;
            matchReasons.push('Subject area aligns with affiliation');
          }
        }

        // Check previous review history
        const { data: previousReviews } = await supabase
          .from('reviews')
          .select('*')
          .eq('reviewer_id', reviewer.id);

        const reviewHistory = {
          total_reviews: previousReviews?.length || 0,
          avg_rating: 4.2, // Placeholder - would need actual rating system
          on_time_percentage: 85, // Placeholder - would calculate from deadlines
        };

        // Bonus for experienced reviewers
        if (reviewHistory.total_reviews > 5) {
          matchScore += 15;
          matchReasons.push('Experienced reviewer');
        }

        // Bonus for high-quality reviews
        if (reviewHistory.avg_rating > 4.0) {
          matchScore += 10;
          matchReasons.push('High-quality review history');
        }

        // Check for similar previous reviews
        if (previousReviews) {
          for (const review of previousReviews) {
            // This would need more complex similarity checking
            // For now, just a basic check
            if (review.comments_to_author?.toLowerCase().includes(articleData.subject_area?.toLowerCase() || '')) {
              matchScore += 5;
              matchReasons.push('Has reviewed similar topics');
              break;
            }
          }
        }

        // Penalty for being too busy (if they have many active reviews)
        const { data: activeReviews } = await supabase
          .from('reviews')
          .select('*')
          .eq('reviewer_id', reviewer.id)
          .is('submitted_at', null);

        if ((activeReviews?.length || 0) > 3) {
          matchScore -= 20;
          matchReasons.push('Currently has many active reviews');
        }

        // Normalize score to percentage
        const normalizedScore = Math.min(Math.max(matchScore, 0), 100);

        reviewerMatches.push({
          reviewer_id: reviewer.id,
          reviewer_name: reviewer.full_name || 'Unknown',
          reviewer_email: reviewer.email || '',
          reviewer_affiliation: reviewer.affiliation,
          reviewer_bio: reviewer.bio,
          match_score: normalizedScore,
          match_reasons: matchReasons,
          expertise_areas: expertiseAreas,
          review_history: reviewHistory,
        });
      }

      // Sort by match score
      reviewerMatches.sort((a, b) => b.match_score - a.match_score);
      setMatches(reviewerMatches);

    } catch (error) {
      console.error('Error finding reviewer matches:', error);
      toast({
        title: "Error",
        description: "Failed to find reviewer matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return 'default';
    if (score >= 50) return 'secondary';
    return 'outline';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 animate-pulse" />
              <span>Analyzing reviewer compatibility...</span>
            </div>
            <Progress value={analyzing ? 60 : 100} className="w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Automated Reviewer Matching
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Found {matches.length} potential reviewers
            </span>
            <Button variant="outline" size="sm" onClick={findReviewerMatches}>
              Refresh Matches
            </Button>
          </div>

          <div className="space-y-4">
            {matches.slice(0, 10).map((match) => (
              <div
                key={match.reviewer_id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{match.reviewer_name}</span>
                    </div>
                    <Badge variant={getScoreBadge(match.match_score) as any}>
                      {match.match_score}% match
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onReviewerSelect?.(match.reviewer_id)}
                    disabled={match.match_score < 30}
                  >
                    Select
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {match.reviewer_email}
                  </p>
                  {match.reviewer_affiliation && (
                    <p className="text-sm text-muted-foreground">
                      {match.reviewer_affiliation}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{match.review_history.total_reviews} reviews</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{match.review_history.on_time_percentage}% on-time</span>
                  </div>
                </div>

                {match.expertise_areas.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {match.expertise_areas.map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                )}

                {match.match_reasons.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Match reasons:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {match.match_reasons.map((reason, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Progress
                  value={match.match_score}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};