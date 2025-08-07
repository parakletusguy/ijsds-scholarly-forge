import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Clock, FileCheck, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface DecisionData {
  month: string;
  accepted: number;
  rejected: number;
  revisions: number;
  deskReject: number;
}

interface PerformanceMetrics {
  avgDecisionTime: number;
  decisionsThisMonth: number;
  acceptanceRate: number;
  pendingDecisions: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--muted))'];

export const EditorialDecisionAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [decisionTrends, setDecisionTrends] = useState<DecisionData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    avgDecisionTime: 0,
    decisionsThisMonth: 0,
    acceptanceRate: 0,
    pendingDecisions: 0
  });

  useEffect(() => {
    fetchDecisionAnalytics();
  }, []);

  const fetchDecisionAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch editorial decisions with related data
      const { data: decisions } = await supabase
        .from('editorial_decisions')
        .select(`
          *,
          submissions(submitted_at, status)
        `);

      // Fetch pending submissions
      const { data: pendingSubmissions } = await supabase
        .from('submissions')
        .select('id')
        .eq('status', 'under_review');

      if (decisions) {
        processDecisionData(decisions);
        calculateMetrics(decisions, pendingSubmissions?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching decision analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processDecisionData = (decisions: any[]) => {
    const monthlyData = new Map();
    
    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
      monthlyData.set(monthKey, {
        month: monthKey,
        accepted: 0,
        rejected: 0,
        revisions: 0,
        deskReject: 0
      });
    }

    // Process decisions
    decisions.forEach(decision => {
      const decisionDate = new Date(decision.created_at);
      const monthKey = decisionDate.toLocaleDateString('default', { month: 'short', year: '2-digit' });
      
      if (monthlyData.has(monthKey)) {
        const monthData = monthlyData.get(monthKey);
        switch (decision.decision_type) {
          case 'accept':
            monthData.accepted++;
            break;
          case 'reject':
            monthData.rejected++;
            break;
          case 'revision_required':
            monthData.revisions++;
            break;
          case 'desk_reject':
            monthData.deskReject++;
            break;
        }
      }
    });

    setDecisionTrends(Array.from(monthlyData.values()));
  };

  const calculateMetrics = (decisions: any[], pendingCount: number) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonth = decisions.filter(d => {
      const decisionDate = new Date(d.created_at);
      return decisionDate.getMonth() === currentMonth && 
             decisionDate.getFullYear() === currentYear;
    });

    const decisionTimes = decisions
      .filter(d => d.submissions?.submitted_at)
      .map(d => {
        const decisionDate = new Date(d.created_at);
        const submissionDate = new Date(d.submissions.submitted_at);
        return Math.ceil((decisionDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    const avgDecisionTime = decisionTimes.length > 0
      ? Math.round(decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length)
      : 0;

    const acceptedCount = decisions.filter(d => d.decision_type === 'accept').length;
    const acceptanceRate = decisions.length > 0 
      ? Math.round((acceptedCount / decisions.length) * 100)
      : 0;

    setMetrics({
      avgDecisionTime,
      decisionsThisMonth: thisMonth.length,
      acceptanceRate,
      pendingDecisions: pendingCount
    });
  };

  const pieData = [
    { name: 'Accepted', value: decisionTrends.reduce((sum, data) => sum + data.accepted, 0), color: COLORS[0] },
    { name: 'Rejected', value: decisionTrends.reduce((sum, data) => sum + data.rejected, 0), color: COLORS[1] },
    { name: 'Revisions', value: decisionTrends.reduce((sum, data) => sum + data.revisions, 0), color: COLORS[2] },
    { name: 'Desk Reject', value: decisionTrends.reduce((sum, data) => sum + data.deskReject, 0), color: COLORS[3] }
  ].filter(item => item.value > 0);

  if (loading) {
    return <LoadingSpinner text="Loading editorial analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Decision Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgDecisionTime} days</div>
            <p className="text-xs text-muted-foreground">From submission to decision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.decisionsThisMonth}</div>
            <p className="text-xs text-muted-foreground">Decisions made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.acceptanceRate}%</div>
            <p className="text-xs text-muted-foreground">Overall acceptance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingDecisions}</div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>
      </div>

      {/* Decision Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Editorial Decision Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              accepted: { label: "Accepted", color: COLORS[0] },
              rejected: { label: "Rejected", color: COLORS[1] },
              revisions: { label: "Revisions", color: COLORS[2] },
              deskReject: { label: "Desk Reject", color: COLORS[3] }
            }}
            className="h-[400px]"
          >
            <BarChart data={decisionTrends}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="accepted" stackId="decisions" fill={COLORS[0]} />
              <Bar dataKey="rejected" stackId="decisions" fill={COLORS[1]} />
              <Bar dataKey="revisions" stackId="decisions" fill={COLORS[2]} />
              <Bar dataKey="deskReject" stackId="decisions" fill={COLORS[3]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Decision Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Decision Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: { label: "Count", color: "hsl(var(--chart-1))" }
            }}
            className="h-[300px]"
          >
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};