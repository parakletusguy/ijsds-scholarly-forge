import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, FileText, Users, TrendingUp, Award, ArrowLeft, BarChart3, Activity, GraduationCap, ChevronRight, Send, ShieldCheck, Zap } from 'lucide-react';
import { PerformanceDashboard } from '@/components/analytics/PerformanceDashboard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

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

// Initiative Afrique Scholarly Palette
const COLORS = ['#1b4332', '#d97706', '#eab308', '#000000'];

export const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isEditor, setIsEditor] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    checkEditorStatus();
    fetchAnalytics();
  }, [user]);

  const checkEditorStatus = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_editor, is_admin')
      .eq('id', user?.id)
      .single();
    
    setIsEditor(profile?.is_editor || profile?.is_admin || false);
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [decisionsRes, reviewsRes, articlesRes] = await Promise.all([
        supabase.from('editorial_decisions').select('*, submissions(*)'),
        supabase.from('reviews').select('*, profiles(full_name)'),
        supabase.from('articles').select('*')
      ]);

      const editorialPerformance = processEditorialPerformance(decisionsRes.data || []);
      const reviewMetrics = processReviewMetrics(reviewsRes.data || []);
      const acceptanceRates = processAcceptanceRates(decisionsRes.data || []);
      const publicationStats = processPublicationStats(articlesRes.data || []);

      setAnalytics({ editorialPerformance, reviewMetrics, acceptanceRates, publicationStats });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processEditorialPerformance = (decisions: any[]) => {
    const totalDecisions = decisions.length;
    const thisMonth = decisions.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length;
    const decisionTimes = decisions.filter(d => d.submissions).map(d => {
      const dDate = new Date(d.created_at);
      const sDate = new Date(d.submissions.submitted_at);
      return Math.ceil((dDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24));
    });

    const avgDecisionTime = decisionTimes.length > 0 ? Math.round(decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length) : 0;
    const decisionsByType = [
      { type: 'Accepted', count: decisions.filter(d => d.decision_type === 'accept').length, color: COLORS[0] },
      { type: 'Rejected', count: decisions.filter(d => d.decision_type === 'reject').length, color: COLORS[1] },
      { type: 'Revision Required', count: decisions.filter(d => d.decision_type === 'revision_required').length, color: COLORS[2] },
      { type: 'Desk Reject', count: decisions.filter(d => d.decision_type === 'desk_reject').length, color: COLORS[3] }
    ].filter(item => item.count > 0);

    return { totalDecisions, avgDecisionTime, decisionsThisMonth: thisMonth, decisionsByType };
  };

  const processReviewMetrics = (reviews: any[]) => {
    const completedReviews = reviews.filter(r => r.submitted_at);
    const pendingReviews = reviews.filter(r => !r.submitted_at && r.invitation_status === 'accepted').length;
    const turnaroundTimes = completedReviews.map(r => Math.ceil((new Date(r.submitted_at).getTime() - new Date(r.invitation_sent_at).getTime()) / (1000 * 60 * 60 * 24)));
    const avgTurnaroundTime = turnaroundTimes.length > 0 ? Math.round(turnaroundTimes.reduce((a, b) => a + b, 0) / turnaroundTimes.length) : 0;
    const onTimeReviews = completedReviews.filter(r => !r.deadline_date || new Date(r.submitted_at) <= new Date(r.deadline_date));
    const onTimeCompletionRate = completedReviews.length > 0 ? Math.round((onTimeReviews.length / completedReviews.length) * 100) : 0;

    const reviewerStats = new Map();
    completedReviews.forEach(r => {
      const name = r.profiles?.full_name || 'Anonymous Peer';
      if (!reviewerStats.has(name)) reviewerStats.set(name, { completed: 0, totalTime: 0, onTime: 0 });
      const s = reviewerStats.get(name);
      s.completed++;
      const time = Math.ceil((new Date(r.submitted_at).getTime() - new Date(r.invitation_sent_at).getTime()) / (1000 * 60 * 60 * 24));
      s.totalTime += time;
      if (!r.deadline_date || new Date(r.submitted_at) <= new Date(r.deadline_date)) s.onTime++;
    });

    const reviewerPerformance = Array.from(reviewerStats.entries()).map(([reviewer, stats]) => ({
      reviewer,
      completed: stats.completed,
      avgTime: Math.round(stats.totalTime / stats.completed),
      onTimeRate: Math.round((stats.onTime / stats.completed) * 100)
    })).sort((a, b) => b.completed - a.completed).slice(0, 10);

    return { avgTurnaroundTime, onTimeCompletionRate, pendingReviews, reviewerPerformance };
  };

  const processAcceptanceRates = (decisions: any[]) => {
    const accepted = decisions.filter(d => d.decision_type === 'accept').length;
    const total = decisions.length;
    const overall = total > 0 ? Math.round((accepted / total) * 100) : 0;
    const thisYearRate = decisions.filter(d => new Date(d.created_at).getFullYear() === new Date().getFullYear()).length > 0 ? Math.round((decisions.filter(d => new Date(d.created_at).getFullYear() === new Date().getFullYear() && d.decision_type === 'accept').length / decisions.filter(d => new Date(d.created_at).getFullYear() === new Date().getFullYear()).length) * 100) : 0;

    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(); date.setMonth(date.getMonth() - i);
      const mDecisions = decisions.filter(d => { const dt = new Date(d.created_at); return dt.getMonth() === date.getMonth() && dt.getFullYear() === date.getFullYear(); });
      const mAcc = mDecisions.filter(d => d.decision_type === 'accept').length;
      const mRej = mDecisions.filter(d => ['reject', 'desk_reject'].includes(d.decision_type)).length;
      monthlyTrend.push({ month: date.toLocaleDateString('default', { month: 'short', year: '2-digit' }), accepted: mAcc, rejected: mRej, rate: mDecisions.length > 0 ? Math.round((mAcc / mDecisions.length) * 100) : 0 });
    }
    return { overall, thisYear: thisYearRate, monthlyTrend };
  };

  const processPublicationStats = (articles: any[]) => {
    const published = articles.filter(a => a.status === 'published').length;
    const inProgress = articles.filter(a => ['under_review', 'accepted', 'in_production'].includes(a.status)).length;
    const publicationTrend = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(); date.setMonth(date.getMonth() - i);
      publicationTrend.push({ month: date.toLocaleDateString('default', { month: 'short' }), published: articles.filter(a => a.publication_date && new Date(a.publication_date).getMonth() === date.getMonth() && new Date(a.publication_date).getFullYear() === date.getFullYear()).length });
    }
    const volumeStats = new Map();
    articles.filter(a => a.volume).forEach(a => {
      if (!volumeStats.has(a.volume)) volumeStats.set(a.volume, { articles: 0, pages: 0 });
      const s = volumeStats.get(a.volume); s.articles++;
      if (a.page_start && a.page_end) s.pages += (a.page_end - a.page_start + 1);
    });
    return { articlesPublished: published, articlesInProgress: inProgress, publicationTrend, volumeMetrics: Array.from(volumeStats.entries()).map(([volume, stats]) => ({ volume, articles: stats.articles, pages: stats.pages })).sort((a, b) => b.volume - a.volume) };
  };

  const cardClasses = "bg-white p-8 border border-border/40 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-primary/20 transition-all";
  const labelClasses = "font-headline font-black text-[9px] uppercase tracking-widest text-foreground/40 mb-2 block";
  const chartCardClasses = "bg-white p-10 border border-border/10 shadow-sm relative overflow-hidden";

  if (loading || !isEditor) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!analytics) return (
     <div className="min-h-screen flex items-center justify-center bg-secondary/5 font-headline font-black uppercase tracking-widest text-foreground/20">
        Sync Protocol Failed
     </div>
  );

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <PageHeader 
        title="Intelligence" 
        subtitle="Nexus" 
        accent="Metric Monitoring"
        description="Monitor the institutional efficacy and scholarly trajectory of the journal. Analyze peer-review velocity, acceptance throughput, and departmental publication trends."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate('/admin')} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Return to Command Hub
           </Button>
           
           <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
              <ShieldCheck size={16} className="text-secondary" />
              <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Authorized Intelligence Audit Stream</span>
           </div>
        </div>

        <Tabs defaultValue="editorial" className="space-y-12">
          <TabsList className="bg-white border border-border/20 p-2 rounded-none h-auto flex flex-wrap shadow-sm">
            {[
              { val: "editorial", label: "Editorial Census", icon: <FileText size={14} /> },
              { val: "reviews", label: "Assessment Velocity", icon: <Clock size={14} /> },
              { val: "acceptance", label: "Acceptance Throughput", icon: <TrendingUp size={14} /> },
              { val: "publication", label: "Scholarly Archives", icon: <GraduationCap size={14} /> },
              { val: "dashboard", label: "Performance Nexus", icon: <Zap size={14} /> }
            ].map(tab => (
              <TabsTrigger key={tab.val} value={tab.val} className="rounded-none py-6 px-10 data-[state=active]:bg-foreground data-[state=active]:text-white font-headline font-black uppercase text-[10px] tracking-widest transition-all gap-4 grow border-r border-border/10 last:border-0">
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="editorial" className="space-y-12 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className={cardClasses + " border-t-8 border-primary"}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-primary/5 text-primary"><FileText size={18} /></div>
                    <span className="font-headline font-black text-3xl text-foreground tracking-tighter">{analytics.editorialPerformance.totalDecisions}</span>
                  </div>
                  <p className={labelClasses}>Global Decisions Ledger</p>
                  <p className="font-headline font-bold text-[8px] uppercase tracking-widest text-secondary">{analytics.editorialPerformance.decisionsThisMonth} Cycle Intake</p>
               </div>
               <div className={cardClasses + " border-t-8 border-secondary"}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-secondary/5 text-secondary"><Clock size={18} /></div>
                    <span className="font-headline font-black text-3xl text-foreground tracking-tighter">{analytics.editorialPerformance.avgDecisionTime}d</span>
                  </div>
                  <p className={labelClasses}>Decision Latency Tier</p>
                  <p className="text-[10px] text-foreground/20 italic">Submission to Final Clause</p>
               </div>
               <div className={cardClasses + " border-t-8 border-foreground"}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-muted text-foreground/30"><TrendingUp size={18} /></div>
                    <span className="font-headline font-black text-3xl text-foreground tracking-tighter">{analytics.editorialPerformance.decisionsThisMonth}</span>
                  </div>
                  <p className={labelClasses}>Monthly Throughput</p>
                  <p className="text-[10px] text-foreground/20 italic">Validated Editorial Consensus</p>
               </div>
            </div>

            <div className={chartCardClasses}>
               <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-primary pl-4">Decision Distribution Protocol</h3>
               <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.editorialPerformance.decisionsByType}
                        cx="50%" cy="50%" innerRadius={100} outerRadius={140} paddingAngle={5}
                        dataKey="count" nameKey="type"
                      >
                        {analytics.editorialPerformance.decisionsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                  {analytics.editorialPerformance.decisionsByType.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="w-3 h-3" style={{ backgroundColor: item.color }}></div>
                       <div>
                          <p className="text-[9px] font-headline font-black uppercase tracking-widest text-foreground/30">{item.type}</p>
                          <p className="font-headline font-bold text-xs">{item.count} Dossiers</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-12 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className={cardClasses + " border-t-8 border-secondary"}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-secondary/5 text-secondary"><Clock size={18} /></div>
                    <span className="font-headline font-black text-3xl text-foreground tracking-tighter">{analytics.reviewMetrics.avgTurnaroundTime}d</span>
                  </div>
                  <p className={labelClasses}>Mean Assessment Velocity</p>
                  <p className="text-[10px] text-foreground/20 italic">Peer Engagement Latency</p>
               </div>
               <div className={cardClasses + " border-t-8 border-primary"}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-primary/5 text-primary"><Award size={18} /></div>
                    <span className="font-headline font-black text-3xl text-foreground tracking-tighter">{analytics.reviewMetrics.onTimeCompletionRate}%</span>
                  </div>
                  <p className={labelClasses}>Institutional Punctuality</p>
                  <p className="font-headline font-bold text-[8px] uppercase tracking-widest text-secondary">Compliance Baseline 70%</p>
               </div>
               <div className={cardClasses + " border-t-8 border-foreground"}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-muted text-foreground/30"><Users size={18} /></div>
                    <span className="font-headline font-black text-3xl text-foreground tracking-tighter">{analytics.reviewMetrics.pendingReviews}</span>
                  </div>
                  <p className={labelClasses}>Active Assessments</p>
                  <p className="text-[10px] text-foreground/20 italic">Dossiers in Peer-Discovery</p>
               </div>
            </div>

            <div className={chartCardClasses}>
               <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-secondary pl-4">Reviewer Peer Performance Ledger</h3>
               <div className="space-y-4">
                  {analytics.reviewMetrics.reviewerPerformance.map((reviewer, index) => (
                    <div key={index} className="flex items-center justify-between p-8 border border-border/10 hover:border-secondary/20 hover:bg-secondary/5 transition-all group">
                      <div>
                        <h4 className="font-headline font-black uppercase text-xs tracking-tight group-hover:text-secondary transition-colors">{reviewer.reviewer}</h4>
                        <p className="font-body text-[10px] text-foreground/40 italic">
                          {reviewer.completed} Peer Assessments Authenticated
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-headline font-black text-xs text-foreground">{reviewer.avgTime}d</p>
                          <p className="text-[8px] font-headline uppercase tracking-widest text-foreground/20">Duration</p>
                        </div>
                        <div className="text-right border-l border-border/10 pl-6">
                          <p className={`font-headline font-black text-xs ${reviewer.onTimeRate > 80 ? 'text-secondary' : 'text-foreground'}`}>{reviewer.onTimeRate}%</p>
                          <p className="text-[8px] font-headline uppercase tracking-widest text-foreground/20">Compliance</p>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="acceptance" className="space-y-12 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className={cardClasses + " border-t-8 border-foreground"}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-muted text-foreground/30"><TrendingUp size={18} /></div>
                    <span className="font-headline font-black text-4xl text-foreground tracking-tighter">{analytics.acceptanceRates.overall}%</span>
                  </div>
                  <p className={labelClasses}>Aggregate Acceptance Protocol</p>
                  <p className="text-[10px] text-foreground/20 italic">Institutional Throughput Baseline</p>
               </div>
               <div className={cardClasses + " border-t-8 border-secondary"}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-secondary/5 text-secondary"><Calendar size={18} /></div>
                    <span className="font-headline font-black text-4xl text-foreground tracking-tighter">{analytics.acceptanceRates.thisYear}%</span>
                  </div>
                  <p className={labelClasses}>Current Temporal Cycle Rate</p>
                  <p className="font-headline font-bold text-[8px] uppercase tracking-widest text-secondary">Annual Policy Adherence</p>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className={chartCardClasses}>
                  <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-primary pl-4">Acceptance Velocity Trend</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.acceptanceRates.monthlyTrend}>
                        <XAxis dataKey="month" stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                        <YAxis stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="rate" 
                          stroke={COLORS[0]} 
                          strokeWidth={4} dot={{ fill: COLORS[0], r: 4 }}
                          name="Throughput %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className={chartCardClasses}>
                  <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-secondary pl-4">Decision Volume Matrix</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.acceptanceRates.monthlyTrend}>
                        <XAxis dataKey="month" stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                        <YAxis stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="accepted" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Validated" />
                        <Bar dataKey="rejected" fill={COLORS[1]} radius={[4, 4, 0, 0]} name="Nullified" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="publication" className="space-y-12 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className={cardClasses + " border-t-8 border-primary"}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-primary/5 text-primary"><FileText size={18} /></div>
                    <span className="font-headline font-black text-4xl text-foreground tracking-tighter">{analytics.publicationStats.articlesPublished}</span>
                  </div>
                  <p className={labelClasses}>Archival Record Count</p>
                  <p className="text-[10px] text-foreground/20 italic">Scholarly Entries Finalized</p>
               </div>
               <div className={cardClasses + " border-t-8 border-secondary"}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-secondary/5 text-secondary"><Clock size={18} /></div>
                    <span className="font-headline font-black text-4xl text-foreground tracking-tighter">{analytics.publicationStats.articlesInProgress}</span>
                  </div>
                  <p className={labelClasses}>Production Pipeline Density</p>
                  <p className="font-headline font-bold text-[8px] uppercase tracking-widest text-secondary">In-Process Scholarly Streams</p>
               </div>
            </div>

            <div className={chartCardClasses}>
               <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-foreground pl-4">Scholarly Publication Trajectory</h3>
               <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.publicationStats.publicationTrend}>
                      <XAxis dataKey="month" stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <YAxis stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="published" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className={chartCardClasses}>
               <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-primary pl-4">Volume Structural Metrics</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {analytics.publicationStats.volumeMetrics.map((volume, index) => (
                   <div key={index} className="flex items-center justify-between p-8 border-l-2 border-primary/20 bg-muted/5 group hover:bg-white hover:shadow-lg transition-all">
                     <div>
                       <h4 className="font-headline font-black uppercase text-sm tracking-tight group-hover:text-primary transition-colors">Vol. {volume.volume}</h4>
                       <p className="font-body text-[10px] text-foreground/40 italic">
                         Registry Structure Finalized
                       </p>
                     </div>
                     <div className="text-right">
                       <p className="font-headline font-black text-xs text-foreground">{volume.articles} Entries</p>
                       <p className="text-[8px] font-headline uppercase tracking-widest text-foreground/20">{volume.pages} Scholarly Paginations</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="animate-fade-in-up">
            <PerformanceDashboard />
          </TabsContent>
        </Tabs>
      </ContentSection>
    </div>
  );
};