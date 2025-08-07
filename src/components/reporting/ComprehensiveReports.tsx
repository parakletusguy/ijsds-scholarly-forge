import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Clock, 
  Download, 
  Calendar as CalendarIcon,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface ReportData {
  submissions: {
    total: number;
    byStatus: { status: string; count: number; color: string }[];
    byMonth: { month: string; count: number }[];
    bySubjectArea: { area: string; count: number }[];
  };
  reviews: {
    totalReviews: number;
    averageTurnaround: number;
    reviewerPerformance: { reviewer: string; completed: number; average_days: number }[];
    reviewQuality: { month: string; quality_score: number }[];
  };
  editorial: {
    decisions: { decision: string; count: number; percentage: number }[];
    decisionTimes: { month: string; average_days: number }[];
    editorWorkload: { editor: string; assigned: number; completed: number }[];
  };
  publication: {
    publishedArticles: number;
    citationMetrics: { article: string; citations: number }[];
    downloadStats: { month: string; downloads: number }[];
    impactMetrics: { metric: string; value: number; trend: string }[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ComprehensiveReports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<{from: Date; to: Date}>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    // Simulate API call with mock data
    setTimeout(() => {
      setReportData({
        submissions: {
          total: 245,
          byStatus: [
            { status: 'Draft', count: 12, color: '#94a3b8' },
            { status: 'Submitted', count: 45, color: '#3b82f6' },
            { status: 'Under Review', count: 67, color: '#f59e0b' },
            { status: 'Accepted', count: 89, color: '#10b981' },
            { status: 'Published', count: 78, color: '#8b5cf6' },
            { status: 'Rejected', count: 34, color: '#ef4444' }
          ],
          byMonth: [
            { month: 'Jan', count: 18 },
            { month: 'Feb', count: 22 },
            { month: 'Mar', count: 25 },
            { month: 'Apr', count: 19 },
            { month: 'May', count: 31 },
            { month: 'Jun', count: 28 },
            { month: 'Jul', count: 24 },
            { month: 'Aug', count: 26 },
            { month: 'Sep', count: 23 },
            { month: 'Oct', count: 29 },
            { month: 'Nov', count: 20 },
            { month: 'Dec', count: 0 }
          ],
          bySubjectArea: [
            { area: 'Social Work Practice', count: 45 },
            { area: 'Community Development', count: 38 },
            { area: 'Social Policy', count: 32 },
            { area: 'Mental Health', count: 28 },
            { area: 'Child Welfare', count: 24 },
            { area: 'Others', count: 78 }
          ]
        },
        reviews: {
          totalReviews: 156,
          averageTurnaround: 28,
          reviewerPerformance: [
            { reviewer: 'Dr. Smith', completed: 12, average_days: 25 },
            { reviewer: 'Prof. Johnson', completed: 10, average_days: 30 },
            { reviewer: 'Dr. Brown', completed: 8, average_days: 22 },
            { reviewer: 'Dr. Davis', completed: 15, average_days: 35 },
            { reviewer: 'Prof. Wilson', completed: 9, average_days: 28 }
          ],
          reviewQuality: [
            { month: 'Jan', quality_score: 4.2 },
            { month: 'Feb', quality_score: 4.3 },
            { month: 'Mar', quality_score: 4.1 },
            { month: 'Apr', quality_score: 4.4 },
            { month: 'May', quality_score: 4.5 },
            { month: 'Jun', quality_score: 4.3 }
          ]
        },
        editorial: {
          decisions: [
            { decision: 'Accept', count: 89, percentage: 36.3 },
            { decision: 'Minor Revision', count: 67, percentage: 27.3 },
            { decision: 'Major Revision', count: 45, percentage: 18.4 },
            { decision: 'Reject', count: 44, percentage: 18.0 }
          ],
          decisionTimes: [
            { month: 'Jan', average_days: 45 },
            { month: 'Feb', average_days: 42 },
            { month: 'Mar', average_days: 38 },
            { month: 'Apr', average_days: 41 },
            { month: 'May', average_days: 39 },
            { month: 'Jun', average_days: 37 }
          ],
          editorWorkload: [
            { editor: 'Chief Editor', assigned: 45, completed: 42 },
            { editor: 'Associate Editor 1', assigned: 32, completed: 30 },
            { editor: 'Associate Editor 2', assigned: 28, completed: 26 },
            { editor: 'Section Editor 1', assigned: 25, completed: 24 },
            { editor: 'Section Editor 2', assigned: 22, completed: 21 }
          ]
        },
        publication: {
          publishedArticles: 78,
          citationMetrics: [
            { article: 'Social Impact in Urban Communities', citations: 45 },
            { article: 'Mental Health Policy Analysis', citations: 38 },
            { article: 'Child Welfare System Reform', citations: 32 },
            { article: 'Community Development Strategies', citations: 28 },
            { article: 'Social Work Practice Guidelines', citations: 24 }
          ],
          downloadStats: [
            { month: 'Jan', downloads: 1250 },
            { month: 'Feb', downloads: 1380 },
            { month: 'Mar', downloads: 1420 },
            { month: 'Apr', downloads: 1320 },
            { month: 'May', downloads: 1580 },
            { month: 'Jun', downloads: 1640 }
          ],
          impactMetrics: [
            { metric: 'h-index', value: 24, trend: 'up' },
            { metric: 'Average Citations', value: 12.5, trend: 'up' },
            { metric: 'Download Rate', value: 89.2, trend: 'up' },
            { metric: 'Acceptance Rate', value: 36.3, trend: 'down' }
          ]
        }
      });
      setLoading(false);
    }, 1000);
  };

  const exportReport = (format: string) => {
    // Implement export functionality
    console.log(`Exporting report as ${format}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Comprehensive Reports</h2>
          <p className="text-muted-foreground">
            Detailed analytics and insights for journal performance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="submissions">Submissions</SelectItem>
              <SelectItem value="reviews">Reviews</SelectItem>
              <SelectItem value="editorial">Editorial</SelectItem>
              <SelectItem value="publication">Publication</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{reportData.submissions.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{reportData.reviews.totalReviews}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <Clock className="h-3 w-3 inline mr-1" />
              {reportData.reviews.averageTurnaround} days avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published Articles</p>
                <p className="text-2xl font-bold">{reportData.publication.publishedArticles}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <Activity className="h-3 w-3 inline mr-1" />
              {((reportData.publication.publishedArticles / reportData.submissions.total) * 100).toFixed(1)}% acceptance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">h-index</p>
                <p className="text-2xl font-bold">
                  {reportData.publication.impactMetrics.find(m => m.metric === 'h-index')?.value}
                </p>
              </div>
              <PieChartIcon className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Journal impact factor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="editorial">Editorial</TabsTrigger>
          <TabsTrigger value="publication">Publication</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Submissions by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.submissions.byStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {reportData.submissions.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData.submissions.byMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      fill="#93c5fd" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reviewer Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.reviews.reviewerPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="reviewer" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Quality Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.reviews.reviewQuality}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[3.5, 5]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="quality_score" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="editorial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Editorial Decisions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.editorial.decisions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="decision" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Decision Turnaround Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.editorial.decisionTimes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="average_days" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="publication" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Citation Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.publication.citationMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="article" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="citations" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Download Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData.publication.downloadStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="downloads" 
                      stroke="#10b981" 
                      fill="#34d399" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};