import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditorialDecisionAnalytics } from './EditorialDecisionAnalytics';
import { ReviewTurnaroundVisualization } from './ReviewTurnaroundVisualization';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Clock, 
  Users, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  BookOpen
} from 'lucide-react';

interface SystemMetrics {
  totalSubmissions: number;
  activeReviews: number;
  publishedArticles: number;
  registeredUsers: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  monthlyGrowth: number;
}

export const PerformanceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalSubmissions: 0,
    activeReviews: 0,
    publishedArticles: 0,
    registeredUsers: 0,
    systemHealth: 'good',
    monthlyGrowth: 0
  });

  useEffect(() => {
    fetchSystemMetrics();
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      setLoading(true);

      // Fetch various metrics in parallel
      const [
        submissionsRes,
        reviewsRes,
        articlesRes,
        usersRes,
        recentSubmissionsRes
      ] = await Promise.all([
        supabase.from('submissions').select('id, submitted_at'),
        supabase.from('reviews').select('id').eq('invitation_status', 'accepted').is('submitted_at', null),
        supabase.from('articles').select('id').eq('status', 'published'),
        supabase.from('profiles').select('id'),
        supabase.from('submissions').select('id, submitted_at').gte('submitted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const totalSubmissions = submissionsRes.data?.length || 0;
      const activeReviews = reviewsRes.data?.length || 0;
      const publishedArticles = articlesRes.data?.length || 0;
      const registeredUsers = usersRes.data?.length || 0;
      const recentSubmissions = recentSubmissionsRes.data?.length || 0;

      // Calculate monthly growth (simplified)
      const previousMonth = totalSubmissions - recentSubmissions;
      const monthlyGrowth = previousMonth > 0 
        ? Math.round(((recentSubmissions / previousMonth) - 1) * 100)
        : 0;

      // Determine system health based on various factors
      let systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
      if (activeReviews > 50) systemHealth = 'warning';
      if (activeReviews > 100) systemHealth = 'critical';
      if (activeReviews < 10 && monthlyGrowth > 10) systemHealth = 'excellent';

      setSystemMetrics({
        totalSubmissions,
        activeReviews,
        publishedArticles,
        registeredUsers,
        systemHealth,
        monthlyGrowth
      });
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'warning': return 'outline';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading performance dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              {systemMetrics.monthlyGrowth > 0 ? '+' : ''}{systemMetrics.monthlyGrowth}% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeReviews}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.publishedArticles}</div>
            <p className="text-xs text-muted-foreground">Total published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.registeredUsers}</div>
            <p className="text-xs text-muted-foreground">Authors, reviewers, editors</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getHealthIcon(systemMetrics.systemHealth)}
              <div>
                <h3 className="font-medium">Overall System Status</h3>
                <p className="text-sm text-muted-foreground">
                  Based on review load, response times, and growth metrics
                </p>
              </div>
            </div>
            <Badge variant={getHealthBadgeVariant(systemMetrics.systemHealth)}>
              {systemMetrics.systemHealth}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="editorial" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editorial">Editorial Analytics</TabsTrigger>
          <TabsTrigger value="reviews">Review Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="editorial">
          <EditorialDecisionAnalytics />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewTurnaroundVisualization />
        </TabsContent>
      </Tabs>
    </div>
  );
};