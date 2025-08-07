import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Star, Award, Target, TrendingUp } from 'lucide-react';

interface QualityMetrics {
  thoroughness: number; // 1-10
  clarity: number; // 1-10
  constructiveness: number; // 1-10
  timeliness: number; // 1-10
  overall_score: number; // Calculated average
}

interface ReviewQuality {
  review_id: string;
  reviewer_name: string;
  submission_title: string;
  metrics: QualityMetrics;
  review_date: string;
  word_count: number;
  recommendation: string;
}

interface ReviewQualityScoringProps {
  reviewId?: string;
  reviewerId?: string;
}

export const ReviewQualityScoring = ({ reviewId, reviewerId }: ReviewQualityScoringProps) => {
  const { toast } = useToast();
  const [qualityData, setQualityData] = useState<ReviewQuality[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMetrics, setEditingMetrics] = useState<QualityMetrics | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  useEffect(() => {
    fetchQualityData();
  }, [reviewId, reviewerId]);

  const fetchQualityData = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('reviews')
        .select(`
          id,
          comments_to_author,
          comments_to_editor,
          recommendation,
          submitted_at,
          profiles(full_name),
          submissions(articles(title))
        `)
        .not('submitted_at', 'is', null);

      if (reviewId) {
        query = query.eq('id', reviewId);
      } else if (reviewerId) {
        query = query.eq('reviewer_id', reviewerId);
      }

      const { data: reviews, error } = await query;
      if (error) throw error;

      // Calculate quality metrics for each review
      const reviewsWithQuality: ReviewQuality[] = reviews?.map(review => {
        const wordCount = (review.comments_to_author?.length || 0) + (review.comments_to_editor?.length || 0);
        
        // Simple quality scoring algorithm (in real implementation, this would be more sophisticated)
        const thoroughness = Math.min(10, Math.max(1, Math.floor(wordCount / 50))); // Based on word count
        const clarity = Math.floor(Math.random() * 3) + 7; // Placeholder - would use NLP analysis
        const constructiveness = Math.floor(Math.random() * 3) + 7; // Placeholder - would analyze tone
        const timeliness = review.submitted_at ? 
          (new Date(review.submitted_at).getTime() < Date.now() ? 10 : 8) : 5; // Placeholder
        
        const overall_score = (thoroughness + clarity + constructiveness + timeliness) / 4;

        return {
          review_id: review.id,
          reviewer_name: review.profiles?.full_name || 'Unknown',
          submission_title: review.submissions?.articles?.title || 'Unknown',
          metrics: {
            thoroughness,
            clarity,
            constructiveness,
            timeliness,
            overall_score
          },
          review_date: review.submitted_at,
          word_count: Math.floor(wordCount / 6), // Approximate word count
          recommendation: review.recommendation || 'pending'
        };
      }) || [];

      setQualityData(reviewsWithQuality);
    } catch (error) {
      console.error('Error fetching quality data:', error);
      toast({
        title: "Error",
        description: "Failed to load review quality data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQualityScore = async (reviewId: string, metrics: QualityMetrics) => {
    try {
      // In a real implementation, you'd save this to a review_quality_scores table
      toast({
        title: "Quality Score Updated",
        description: "Review quality metrics have been saved",
      });
      
      setEditingMetrics(null);
      setSelectedReviewId(null);
      fetchQualityData();
    } catch (error) {
      console.error('Error updating quality score:', error);
      toast({
        title: "Error",
        description: "Failed to update quality score",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return 'default';
    if (score >= 6) return 'secondary';
    return 'destructive';
  };

  const startEditing = (review: ReviewQuality) => {
    setEditingMetrics({ ...review.metrics });
    setSelectedReviewId(review.review_id);
  };

  const updateMetric = (metric: keyof QualityMetrics, value: number[]) => {
    if (!editingMetrics) return;
    
    const updated = { ...editingMetrics, [metric]: value[0] };
    updated.overall_score = (updated.thoroughness + updated.clarity + updated.constructiveness + updated.timeliness) / 4;
    setEditingMetrics(updated);
  };

  const calculateAverageScore = () => {
    if (qualityData.length === 0) return 0;
    return qualityData.reduce((sum, review) => sum + review.metrics.overall_score, 0) / qualityData.length;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading quality data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quality Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Review Quality Scoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {calculateAverageScore().toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {qualityData.filter(r => r.metrics.overall_score >= 8).length}
              </div>
              <div className="text-sm text-muted-foreground">High Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {qualityData.filter(r => r.metrics.overall_score >= 6 && r.metrics.overall_score < 8).length}
              </div>
              <div className="text-sm text-muted-foreground">Medium Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {qualityData.filter(r => r.metrics.overall_score < 6).length}
              </div>
              <div className="text-sm text-muted-foreground">Needs Improvement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Quality List */}
      <Card>
        <CardHeader>
          <CardTitle>Review Quality Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityData.map((review) => (
              <div key={review.review_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{review.reviewer_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {review.submission_title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={getScoreBadge(review.metrics.overall_score)}
                      className="flex items-center gap-1"
                    >
                      <Star className="h-3 w-3" />
                      {review.metrics.overall_score.toFixed(1)}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(review)}
                    >
                      Edit Score
                    </Button>
                  </div>
                </div>

                {selectedReviewId === review.review_id && editingMetrics ? (
                  <div className="space-y-4 border-t pt-4">
                    <h5 className="font-medium">Edit Quality Metrics</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Thoroughness: {editingMetrics.thoroughness}</label>
                        <Slider
                          value={[editingMetrics.thoroughness]}
                          onValueChange={(value) => updateMetric('thoroughness', value)}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Clarity: {editingMetrics.clarity}</label>
                        <Slider
                          value={[editingMetrics.clarity]}
                          onValueChange={(value) => updateMetric('clarity', value)}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Constructiveness: {editingMetrics.constructiveness}</label>
                        <Slider
                          value={[editingMetrics.constructiveness]}
                          onValueChange={(value) => updateMetric('constructiveness', value)}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Timeliness: {editingMetrics.timeliness}</label>
                        <Slider
                          value={[editingMetrics.timeliness]}
                          onValueChange={(value) => updateMetric('timeliness', value)}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm">
                        Overall Score: <span className="font-bold">{editingMetrics.overall_score.toFixed(1)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingMetrics(null);
                            setSelectedReviewId(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateQualityScore(review.review_id, editingMetrics)}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Thoroughness:</span>
                      <div className={`font-medium ${getScoreColor(review.metrics.thoroughness)}`}>
                        {review.metrics.thoroughness}/10
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Clarity:</span>
                      <div className={`font-medium ${getScoreColor(review.metrics.clarity)}`}>
                        {review.metrics.clarity}/10
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Constructiveness:</span>
                      <div className={`font-medium ${getScoreColor(review.metrics.constructiveness)}`}>
                        {review.metrics.constructiveness}/10
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timeliness:</span>
                      <div className={`font-medium ${getScoreColor(review.metrics.timeliness)}`}>
                        {review.metrics.timeliness}/10
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{review.word_count} words</span>
                  <span>Submitted: {new Date(review.review_date).toLocaleDateString()}</span>
                  <Badge variant="outline" className="text-xs">
                    {review.recommendation}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};