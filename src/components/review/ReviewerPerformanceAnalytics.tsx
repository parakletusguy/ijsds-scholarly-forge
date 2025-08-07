import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Award, Clock, Target, TrendingUp, User, Star } from 'lucide-react';

interface ReviewerPerformance {
  reviewer_id: string;
  reviewer_name: string;
  email: string;
  affiliation: string;
  total_reviews: number;
  completed_reviews: number;
  avg_turnaround_days: number;
  on_time_percentage: number;
  avg_quality_score: number;
  last_review_date: string;
  expertise_areas: string[];
  availability_status: 'available' | 'busy' | 'unavailable';
}

interface PerformanceTrend {
  month: string;
  reviews_completed: number;
  avg_turnaround: number;
  quality_score: number;
}

export const ReviewerPerformanceAnalytics = () => {
  const [reviewers, setReviewers] = useState<ReviewerPerformance[]>([]);
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviewer, setSelectedReviewer] = useState<string | null>(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);

      // Fetch all reviewers and their performance data
      const { data: reviewerProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_reviewer', true);

      if (profilesError) throw profilesError;

      // Fetch all reviews for performance calculation
      const { data: allReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles(full_name, email, affiliation)
        `);

      if (reviewsError) throw reviewsError;

      // Calculate performance metrics for each reviewer
      const performanceData: ReviewerPerformance[] = reviewerProfiles?.map(reviewer => {
        const reviewerReviews = allReviews?.filter(r => r.reviewer_id === reviewer.id) || [];
        const completedReviews = reviewerReviews.filter(r => r.submitted_at);
        
        // Calculate average turnaround time
        const turnaroundTimes = completedReviews
          .filter(r => r.invitation_sent_at && r.submitted_at)
          .map(r => {
            const invited = new Date(r.invitation_sent_at);
            const submitted = new Date(r.submitted_at);
            return Math.ceil((submitted.getTime() - invited.getTime()) / (1000 * 60 * 60 * 24));
          });

        const avgTurnaround = turnaroundTimes.length > 0
          ? turnaroundTimes.reduce((a, b) => a + b, 0) / turnaroundTimes.length
          : 0;

        // Calculate on-time percentage
        const onTimeReviews = completedReviews.filter(r => {
          if (!r.deadline_date || !r.submitted_at) return false;
          return new Date(r.submitted_at) <= new Date(r.deadline_date);
        });

        const onTimePercentage = completedReviews.length > 0
          ? (onTimeReviews.length / completedReviews.length) * 100
          : 0;

        // Mock quality score (in real implementation, this would come from quality scoring system)
        const avgQualityScore = 7 + Math.random() * 2.5; // Random score between 7-9.5

        // Determine availability based on current active reviews
        const activeReviews = reviewerReviews.filter(r => !r.submitted_at && r.invitation_status === 'accepted').length;
        const availabilityStatus: 'available' | 'busy' | 'unavailable' = 
          activeReviews === 0 ? 'available' :
          activeReviews <= 2 ? 'busy' :
          'unavailable';

        return {
          reviewer_id: reviewer.id,
          reviewer_name: reviewer.full_name || 'Unknown',
          email: reviewer.email || '',
          affiliation: reviewer.affiliation || 'Unknown',
          total_reviews: reviewerReviews.length,
          completed_reviews: completedReviews.length,
          avg_turnaround_days: Math.round(avgTurnaround),
          on_time_percentage: Math.round(onTimePercentage),
          avg_quality_score: Math.round(avgQualityScore * 10) / 10,
          last_review_date: completedReviews.length > 0 
            ? completedReviews[completedReviews.length - 1].submitted_at
            : '',
          expertise_areas: reviewer.bio ? reviewer.bio.split(',').slice(0, 3) : [],
          availability_status: availabilityStatus
        };
      }) || [];

      // Sort by overall performance (combination of factors)
      performanceData.sort((a, b) => {
        const scoreA = (a.completed_reviews * 0.3) + (a.on_time_percentage * 0.3) + (a.avg_quality_score * 0.4);
        const scoreB = (b.completed_reviews * 0.3) + (b.on_time_percentage * 0.3) + (b.avg_quality_score * 0.4);
        return scoreB - scoreA;
      });

      setReviewers(performanceData);

      // Generate performance trends (mock data for now)
      const trendData: PerformanceTrend[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        trendData.push({
          month: date.toLocaleDateString('default', { month: 'short' }),
          reviews_completed: Math.floor(Math.random() * 20) + 10,
          avg_turnaround: Math.floor(Math.random() * 10) + 12,
          quality_score: 7 + Math.random() * 2
        });
      }
      setTrends(trendData);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceRating = (reviewer: ReviewerPerformance) => {
    const score = (reviewer.completed_reviews * 0.3) + 
                  (reviewer.on_time_percentage * 0.3) + 
                  (reviewer.avg_quality_score * 0.4);
    
    if (score >= 8) return { rating: 'Excellent', color: 'text-green-600' };
    if (score >= 6) return { rating: 'Good', color: 'text-blue-600' };
    if (score >= 4) return { rating: 'Average', color: 'text-yellow-600' };
    return { rating: 'Needs Improvement', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading performance data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Reviewer Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{reviewers.length}</div>
              <div className="text-sm text-muted-foreground">Active Reviewers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(reviewers.reduce((sum, r) => sum + r.avg_turnaround_days, 0) / reviewers.length || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Turnaround (days)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(reviewers.reduce((sum, r) => sum + r.on_time_percentage, 0) / reviewers.length || 0)}%
              </div>
              <div className="text-sm text-muted-foreground">On-Time Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {(reviewers.reduce((sum, r) => sum + r.avg_quality_score, 0) / reviewers.length || 0).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Quality Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Details */}
      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leaderboard">Performance Leaderboard</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Reviewers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewers.slice(0, 10).map((reviewer, index) => {
                  const rating = getPerformanceRating(reviewer);
                  return (
                    <div key={reviewer.reviewer_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{reviewer.reviewer_name}</h4>
                            <p className="text-sm text-muted-foreground">{reviewer.affiliation}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={rating.color}>
                            {rating.rating}
                          </Badge>
                          <Badge className={getAvailabilityColor(reviewer.availability_status)} variant="secondary">
                            {reviewer.availability_status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Reviews:</span>
                          <div className="font-medium">{reviewer.completed_reviews}/{reviewer.total_reviews}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Turnaround:</span>
                          <div className="font-medium">{reviewer.avg_turnaround_days} days</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">On-Time Rate:</span>
                          <div className="font-medium">{reviewer.on_time_percentage}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quality Score:</span>
                          <div className="font-medium flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {reviewer.avg_quality_score}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Overall Performance</span>
                          <span>
                            {Math.round((reviewer.completed_reviews * 0.3) + (reviewer.on_time_percentage * 0.3) + (reviewer.avg_quality_score * 0.4))}%
                          </span>
                        </div>
                        <Progress 
                          value={(reviewer.completed_reviews * 0.3) + (reviewer.on_time_percentage * 0.3) + (reviewer.avg_quality_score * 0.4)} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Completion Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    reviews: {
                      label: "Reviews Completed",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <BarChart data={trends}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="reviews_completed" fill="var(--color-reviews)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    quality: {
                      label: "Quality Score",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <LineChart data={trends}>
                    <XAxis dataKey="month" />
                    <YAxis domain={[6, 10]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="quality_score" 
                      stroke="var(--color-quality)" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['available', 'busy', 'unavailable'].map(status => {
              const statusReviewers = reviewers.filter(r => r.availability_status === status);
              return (
                <Card key={status}>
                  <CardHeader>
                    <CardTitle className="capitalize">{status} Reviewers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-4">{statusReviewers.length}</div>
                    <div className="space-y-2">
                      {statusReviewers.slice(0, 5).map(reviewer => (
                        <div key={reviewer.reviewer_id} className="flex items-center justify-between text-sm">
                          <span>{reviewer.reviewer_name}</span>
                          <Badge className={getAvailabilityColor(status)} variant="secondary">
                            {reviewer.total_reviews - reviewer.completed_reviews} active
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};