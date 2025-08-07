import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, FileText, Users, TrendingUp, Award } from 'lucide-react';
import { PerformanceDashboard } from '@/components/analytics/PerformanceDashboard';

interface AnalyticsData {
  editorialPerformance: {
    totalDecisions: number;
    avgDecisionTime: number;
    decisionsThisMonth: number;
    decisionsByType: Array<{ type: string; count: number; color: string }>;
  };
  reviewMetrics: {
    avgTurnaroundTime: number;
    onTimeCompletionRate: number;
    pendingReviews: number;
    reviewerPerformance: Array<{ reviewer: string; completed: number; avgTime: number; onTimeRate: number }>;
  };
  acceptanceRates: {
    overall: number;
    thisYear: number;
    monthlyTrend: Array<{ month: string; accepted: number; rejected: number; rate: number }>;
  };
  publicationStats: {
    articlesPublished: number;
    articlesInProgress: number;
    publicationTrend: Array<{ month: string; published: number }>;
    volumeMetrics: Array<{ volume: number; articles: number; pages: number }>;
  };
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    checkEditorStatus();
    fetchAnalytics();
  }, [user]);

  const checkEditorStatus = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_editor')
      .eq('id', user?.id)
      .single();
    
    setIsEditor(profile?.is_editor || false);
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch editorial decisions
      const { data: decisions } = await supabase
        .from('editorial_decisions')
        .select(`
          *,
          submissions(*)
        `);

      // Fetch reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles(full_name)
        `);

      // Fetch articles
      const { data: articles } = await supabase
        .from('articles')
        .select('*');

      // Process editorial performance
      const editorialPerformance = processEditorialPerformance(decisions || []);
      
      // Process review metrics
      const reviewMetrics = processReviewMetrics(reviews || []);
      
      // Process acceptance rates
      const acceptanceRates = processAcceptanceRates(decisions || []);
      
      // Process publication stats
      const publicationStats = processPublicationStats(articles || []);

      setAnalytics({
        editorialPerformance,
        reviewMetrics,
        acceptanceRates,
        publicationStats
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processEditorialPerformance = (decisions: any[]) => {
    const totalDecisions = decisions.length;
    const thisMonth = decisions.filter(d => 
      new Date(d.created_at).getMonth() === new Date().getMonth()
    ).length;

    const decisionTimes = decisions
      .filter(d => d.submissions)
      .map(d => {
        const decision = new Date(d.created_at);
        const submission = new Date(d.submissions.submitted_at);
        return Math.ceil((decision.getTime() - submission.getTime()) / (1000 * 60 * 60 * 24));
      });

    const avgDecisionTime = decisionTimes.length > 0 
      ? Math.round(decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length)
      : 0;

    const decisionsByType = [
      { type: 'Accepted', count: decisions.filter(d => d.decision_type === 'accept').length, color: COLORS[0] },
      { type: 'Rejected', count: decisions.filter(d => d.decision_type === 'reject').length, color: COLORS[1] },
      { type: 'Revision Required', count: decisions.filter(d => d.decision_type === 'revision_required').length, color: COLORS[2] },
      { type: 'Desk Reject', count: decisions.filter(d => d.decision_type === 'desk_reject').length, color: COLORS[3] }
    ].filter(item => item.count > 0);

    return {
      totalDecisions,
      avgDecisionTime,
      decisionsThisMonth: thisMonth,
      decisionsByType
    };
  };

  const processReviewMetrics = (reviews: any[]) => {
    const completedReviews = reviews.filter(r => r.submitted_at);
    const pendingReviews = reviews.filter(r => !r.submitted_at && r.invitation_status === 'accepted').length;

    const turnaroundTimes = completedReviews.map(r => {
      const submitted = new Date(r.submitted_at);
      const invited = new Date(r.invitation_sent_at);
      return Math.ceil((submitted.getTime() - invited.getTime()) / (1000 * 60 * 60 * 24));
    });

    const avgTurnaroundTime = turnaroundTimes.length > 0
      ? Math.round(turnaroundTimes.reduce((a, b) => a + b, 0) / turnaroundTimes.length)
      : 0;

    const onTimeReviews = completedReviews.filter(r => {
      if (!r.deadline_date) return true;
      return new Date(r.submitted_at) <= new Date(r.deadline_date);
    });

    const onTimeCompletionRate = completedReviews.length > 0
      ? Math.round((onTimeReviews.length / completedReviews.length) * 100)
      : 0;

    // Group by reviewer
    const reviewerStats = new Map();
    completedReviews.forEach(r => {
      const reviewerName = r.profiles?.full_name || 'Unknown Reviewer';
      if (!reviewerStats.has(reviewerName)) {
        reviewerStats.set(reviewerName, { completed: 0, totalTime: 0, onTime: 0 });
      }
      const stats = reviewerStats.get(reviewerName);
      stats.completed++;
      
      const time = Math.ceil((new Date(r.submitted_at).getTime() - new Date(r.invitation_sent_at).getTime()) / (1000 * 60 * 60 * 24));
      stats.totalTime += time;
      
      if (!r.deadline_date || new Date(r.submitted_at) <= new Date(r.deadline_date)) {
        stats.onTime++;
      }
    });

    const reviewerPerformance = Array.from(reviewerStats.entries()).map(([reviewer, stats]) => ({
      reviewer,
      completed: stats.completed,
      avgTime: Math.round(stats.totalTime / stats.completed),
      onTimeRate: Math.round((stats.onTime / stats.completed) * 100)
    })).sort((a, b) => b.completed - a.completed).slice(0, 10);

    return {
      avgTurnaroundTime,
      onTimeCompletionRate,
      pendingReviews,
      reviewerPerformance
    };
  };

  const processAcceptanceRates = (decisions: any[]) => {
    const accepted = decisions.filter(d => d.decision_type === 'accept').length;
    const total = decisions.length;
    const overall = total > 0 ? Math.round((accepted / total) * 100) : 0;

    const thisYear = new Date().getFullYear();
    const thisYearDecisions = decisions.filter(d => 
      new Date(d.created_at).getFullYear() === thisYear
    );
    const thisYearAccepted = thisYearDecisions.filter(d => d.decision_type === 'accept').length;
    const thisYearRate = thisYearDecisions.length > 0 
      ? Math.round((thisYearAccepted / thisYearDecisions.length) * 100) 
      : 0;

    // Monthly trend for the last 12 months
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthDecisions = decisions.filter(d => {
        const decisionDate = new Date(d.created_at);
        return decisionDate.getMonth() === date.getMonth() && 
               decisionDate.getFullYear() === date.getFullYear();
      });
      
      const monthAccepted = monthDecisions.filter(d => d.decision_type === 'accept').length;
      const monthRejected = monthDecisions.filter(d => ['reject', 'desk_reject'].includes(d.decision_type)).length;
      const rate = monthDecisions.length > 0 ? Math.round((monthAccepted / monthDecisions.length) * 100) : 0;
      
      monthlyTrend.push({
        month: date.toLocaleDateString('default', { month: 'short', year: '2-digit' }),
        accepted: monthAccepted,
        rejected: monthRejected,
        rate
      });
    }

    return {
      overall,
      thisYear: thisYearRate,
      monthlyTrend
    };
  };

  const processPublicationStats = (articles: any[]) => {
    const published = articles.filter(a => a.status === 'published').length;
    const inProgress = articles.filter(a => ['under_review', 'accepted', 'in_production'].includes(a.status)).length;

    // Publication trend for the last 12 months
    const publicationTrend = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthPublished = articles.filter(a => {
        if (!a.publication_date) return false;
        const pubDate = new Date(a.publication_date);
        return pubDate.getMonth() === date.getMonth() && 
               pubDate.getFullYear() === date.getFullYear();
      }).length;
      
      publicationTrend.push({
        month: date.toLocaleDateString('default', { month: 'short' }),
        published: monthPublished
      });
    }

    // Volume metrics
    const volumeStats = new Map();
    articles.filter(a => a.volume).forEach(a => {
      if (!volumeStats.has(a.volume)) {
        volumeStats.set(a.volume, { articles: 0, pages: 0 });
      }
      const stats = volumeStats.get(a.volume);
      stats.articles++;
      if (a.page_start && a.page_end) {
        stats.pages += (a.page_end - a.page_start + 1);
      }
    });

    const volumeMetrics = Array.from(volumeStats.entries()).map(([volume, stats]) => ({
      volume,
      articles: stats.articles,
      pages: stats.pages
    })).sort((a, b) => b.volume - a.volume);

    return {
      articlesPublished: published,
      articlesInProgress: inProgress,
      publicationTrend,
      volumeMetrics
    };
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please sign in to view analytics.</p>
        </div>
      </div>
    );
  }

  if (!isEditor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Editor Access Required</h1>
          <p>You need editor privileges to view analytics and reports.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
          <p>Unable to load analytics data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
        <p className="text-muted-foreground">Comprehensive insights into journal performance and editorial metrics</p>
      </div>

      <Tabs defaultValue="editorial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="editorial">Editorial Performance</TabsTrigger>
          <TabsTrigger value="reviews">Review Metrics</TabsTrigger>
          <TabsTrigger value="acceptance">Acceptance Rates</TabsTrigger>
          <TabsTrigger value="publication">Publication Stats</TabsTrigger>
          <TabsTrigger value="dashboard">Performance Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="editorial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.editorialPerformance.totalDecisions}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.editorialPerformance.decisionsThisMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Decision Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.editorialPerformance.avgDecisionTime} days</div>
                <p className="text-xs text-muted-foreground">From submission to decision</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.editorialPerformance.decisionsThisMonth}</div>
                <p className="text-xs text-muted-foreground">Editorial decisions made</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Decision Distribution</CardTitle>
              <CardDescription>Breakdown of editorial decisions by type</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Count",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <PieChart>
                  <Pie
                    data={analytics.editorialPerformance.decisionsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.editorialPerformance.decisionsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.reviewMetrics.avgTurnaroundTime} days</div>
                <p className="text-xs text-muted-foreground">Average turnaround time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.reviewMetrics.onTimeCompletionRate}%</div>
                <p className="text-xs text-muted-foreground">Reviews completed on time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.reviewMetrics.pendingReviews}</div>
                <p className="text-xs text-muted-foreground">Currently pending</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reviewer Performance</CardTitle>
              <CardDescription>Top reviewers by completion rate and efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.reviewMetrics.reviewerPerformance.map((reviewer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{reviewer.reviewer}</h4>
                      <p className="text-sm text-muted-foreground">
                        {reviewer.completed} reviews completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{reviewer.avgTime} days avg</Badge>
                        <Badge variant="outline">{reviewer.onTimeRate}% on-time</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acceptance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Acceptance Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.acceptanceRates.overall}%</div>
                <p className="text-xs text-muted-foreground">All-time average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Year</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.acceptanceRates.thisYear}%</div>
                <p className="text-xs text-muted-foreground">Current year acceptance rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Acceptance Trend</CardTitle>
              <CardDescription>Acceptance rates over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  rate: {
                    label: "Acceptance Rate (%)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <LineChart data={analytics.acceptanceRates.monthlyTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Acceptance Rate (%)"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Decision Volume</CardTitle>
              <CardDescription>Accepted vs rejected submissions by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  accepted: {
                    label: "Accepted",
                    color: "hsl(var(--chart-1))",
                  },
                  rejected: {
                    label: "Rejected",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={analytics.acceptanceRates.monthlyTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="accepted" fill="hsl(var(--primary))" name="Accepted" />
                  <Bar dataKey="rejected" fill="hsl(var(--secondary))" name="Rejected" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publication" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Articles Published</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.publicationStats.articlesPublished}</div>
                <p className="text-xs text-muted-foreground">Total published articles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.publicationStats.articlesInProgress}</div>
                <p className="text-xs text-muted-foreground">Articles in pipeline</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Publication Trend</CardTitle>
              <CardDescription>Articles published over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  published: {
                    label: "Published Articles",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={analytics.publicationStats.publicationTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="published" fill="hsl(var(--primary))" name="Published Articles" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volume Metrics</CardTitle>
              <CardDescription>Articles and pages by volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.publicationStats.volumeMetrics.map((volume, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Volume {volume.volume}</h4>
                      <p className="text-sm text-muted-foreground">
                        {volume.articles} articles, {volume.pages} pages
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{volume.articles} articles</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard">
          <PerformanceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};