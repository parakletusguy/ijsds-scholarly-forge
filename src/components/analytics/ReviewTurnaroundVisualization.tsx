import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, AreaChart, Area, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Target, TrendingDown, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';

interface TurnaroundData {
  month: string;
  avgTurnaround: number;
  onTimeRate: number;
  totalReviews: number;
}

interface ReviewerMetrics {
  reviewer: string;
  avgTurnaround: number;
  onTimeRate: number;
  totalReviews: number;
  status: 'excellent' | 'good' | 'needs_improvement';
}

const COLORS = {
  turnaround: 'hsl(var(--primary))',
  onTime: 'hsl(var(--chart-2))',
  late: 'hsl(var(--destructive))'
};

export const ReviewTurnaroundVisualization = () => {
  const [loading, setLoading] = useState(true);
  const [turnaroundTrends, setTurnaroundTrends] = useState<TurnaroundData[]>([]);
  const [reviewerMetrics, setReviewerMetrics] = useState<ReviewerMetrics[]>([]);
  const [overallMetrics, setOverallMetrics] = useState({
    avgTurnaround: 0,
    onTimeRate: 0,
    totalPending: 0,
    overdueReviews: 0
  });

  useEffect(() => {
    fetchTurnaroundData();
  }, []);

  const fetchTurnaroundData = async () => {
    try {
      setLoading(true);

      // Fetch completed reviews with reviewer info
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles(full_name)
        `)
        .not('submitted_at', 'is', null);

      // Fetch pending reviews
      const { data: pendingReviews } = await supabase
        .from('reviews')
        .select('id, deadline_date')
        .is('submitted_at', null)
        .eq('invitation_status', 'accepted');

      if (reviews) {
        processTurnaroundTrends(reviews);
        processReviewerMetrics(reviews);
        calculateOverallMetrics(reviews, pendingReviews || []);
      }
    } catch (error) {
      console.error('Error fetching turnaround data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTurnaroundTrends = (reviews: any[]) => {
    const monthlyData = new Map();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
      monthlyData.set(monthKey, {
        month: monthKey,
        totalTurnaround: 0,
        onTimeCount: 0,
        totalCount: 0
      });
    }

    // Process reviews
    reviews.forEach(review => {
      if (!review.submitted_at || !review.invitation_sent_at) return;

      const submittedDate = new Date(review.submitted_at);
      const monthKey = submittedDate.toLocaleDateString('default', { month: 'short', year: '2-digit' });

      if (monthlyData.has(monthKey)) {
        const monthData = monthlyData.get(monthKey);
        const turnaroundTime = Math.ceil(
          (submittedDate.getTime() - new Date(review.invitation_sent_at).getTime()) / 
          (1000 * 60 * 60 * 24)
        );

        monthData.totalTurnaround += turnaroundTime;
        monthData.totalCount++;

        // Check if on time
        if (!review.deadline_date || submittedDate <= new Date(review.deadline_date)) {
          monthData.onTimeCount++;
        }
      }
    });

    // Calculate averages and rates
    const trends = Array.from(monthlyData.values()).map(data => ({
      month: data.month,
      avgTurnaround: data.totalCount > 0 ? Math.round(data.totalTurnaround / data.totalCount) : 0,
      onTimeRate: data.totalCount > 0 ? Math.round((data.onTimeCount / data.totalCount) * 100) : 0,
      totalReviews: data.totalCount
    }));

    setTurnaroundTrends(trends);
  };

  const processReviewerMetrics = (reviews: any[]) => {
    const reviewerStats = new Map();

    reviews.forEach(review => {
      if (!review.submitted_at || !review.invitation_sent_at) return;

      const reviewerName = review.profiles?.full_name || 'Unknown Reviewer';
      if (!reviewerStats.has(reviewerName)) {
        reviewerStats.set(reviewerName, {
          totalTurnaround: 0,
          onTimeCount: 0,
          totalCount: 0
        });
      }

      const stats = reviewerStats.get(reviewerName);
      const turnaroundTime = Math.ceil(
        (new Date(review.submitted_at).getTime() - new Date(review.invitation_sent_at).getTime()) / 
        (1000 * 60 * 60 * 24)
      );

      stats.totalTurnaround += turnaroundTime;
      stats.totalCount++;

      if (!review.deadline_date || new Date(review.submitted_at) <= new Date(review.deadline_date)) {
        stats.onTimeCount++;
      }
    });

    const metrics = Array.from(reviewerStats.entries())
      .map(([reviewer, stats]) => {
        const avgTurnaround = Math.round(stats.totalTurnaround / stats.totalCount);
        const onTimeRate = Math.round((stats.onTimeCount / stats.totalCount) * 100);
        
        let status: 'excellent' | 'good' | 'needs_improvement' = 'good';
        if (avgTurnaround <= 14 && onTimeRate >= 90) status = 'excellent';
        else if (avgTurnaround > 30 || onTimeRate < 70) status = 'needs_improvement';

        return {
          reviewer,
          avgTurnaround,
          onTimeRate,
          totalReviews: stats.totalCount,
          status
        };
      })
      .sort((a, b) => b.totalReviews - a.totalReviews)
      .slice(0, 10);

    setReviewerMetrics(metrics);
  };

  const calculateOverallMetrics = (reviews: any[], pendingReviews: any[]) => {
    const completedReviews = reviews.filter(r => r.submitted_at && r.invitation_sent_at);
    
    const totalTurnaround = completedReviews.reduce((sum, review) => {
      return sum + Math.ceil(
        (new Date(review.submitted_at).getTime() - new Date(review.invitation_sent_at).getTime()) / 
        (1000 * 60 * 60 * 24)
      );
    }, 0);

    const avgTurnaround = completedReviews.length > 0 
      ? Math.round(totalTurnaround / completedReviews.length) 
      : 0;

    const onTimeReviews = completedReviews.filter(r => 
      !r.deadline_date || new Date(r.submitted_at) <= new Date(r.deadline_date)
    );
    const onTimeRate = completedReviews.length > 0 
      ? Math.round((onTimeReviews.length / completedReviews.length) * 100) 
      : 0;

    const now = new Date();
    const overdueReviews = pendingReviews.filter(r => 
      r.deadline_date && new Date(r.deadline_date) < now
    ).length;

    setOverallMetrics({
      avgTurnaround,
      onTimeRate,
      totalPending: pendingReviews.length,
      overdueReviews
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'needs_improvement': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading review turnaround data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Turnaround</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgTurnaround} days</div>
            <p className="text-xs text-muted-foreground">Invitation to completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.onTimeRate}%</div>
            <p className="text-xs text-muted-foreground">Met deadline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalPending}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overallMetrics.overdueReviews}</div>
            <p className="text-xs text-muted-foreground">Past deadline</p>
          </CardContent>
        </Card>
      </div>

      {/* Turnaround Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Review Turnaround Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              avgTurnaround: { label: "Avg Turnaround (days)", color: COLORS.turnaround },
              onTimeRate: { label: "On-Time Rate (%)", color: COLORS.onTime }
            }}
            className="h-[400px]"
          >
            <LineChart data={turnaroundTrends}>
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="avgTurnaround" 
                stroke={COLORS.turnaround} 
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="onTimeRate" 
                stroke={COLORS.onTime} 
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Reviewer Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Reviewer Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviewerMetrics.map((metric, index) => (
              <div key={metric.reviewer} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-muted-foreground">#{index + 1}</div>
                  <div>
                    <h4 className="font-medium">{metric.reviewer}</h4>
                    <p className="text-sm text-muted-foreground">
                      {metric.totalReviews} reviews completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{metric.avgTurnaround} days</div>
                    <div className="text-xs text-muted-foreground">avg turnaround</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{metric.onTimeRate}%</div>
                    <div className="text-xs text-muted-foreground">on-time rate</div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(metric.status)}>
                    {metric.status.replace('_', ' ')}
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