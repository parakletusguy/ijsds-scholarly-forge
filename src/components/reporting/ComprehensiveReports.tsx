import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Activity,
  ShieldCheck,
  Zap,
  GraduationCap,
  ChevronRight,
  Award,
  BookOpen,
  ArrowUpRight,
  Layers
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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

// Initiative Afrique Scholarly Palette
const COLORS = ['#1b4332', '#d97706', '#eab308', '#000000', '#422006', '#14532d'];

export const ComprehensiveReports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    setTimeout(() => {
      setReportData({
        submissions: {
          total: 245,
          byStatus: [
            { status: 'Draft', count: 12, color: '#94a3b8' },
            { status: 'Submitted', count: 45, color: '#d97706' },
            { status: 'Under Review', count: 67, color: '#1b4332' },
            { status: 'Accepted', count: 89, color: '#166534' },
            { status: 'Published', count: 78, color: '#c2410c' },
            { status: 'Rejected', count: 34, color: '#000000' }
          ],
          byMonth: [
            { month: 'Jan', count: 18 }, { month: 'Feb', count: 22 }, { month: 'Mar', count: 25 },
            { month: 'Apr', count: 19 }, { month: 'May', count: 31 }, { month: 'Jun', count: 28 },
            { month: 'Jul', count: 24 }, { month: 'Aug', count: 26 }, { month: 'Sep', count: 23 },
            { month: 'Oct', count: 29 }, { month: 'Nov', count: 20 }, { month: 'Dec', count: 15 }
          ],
          bySubjectArea: [
            { area: 'Social Work Practice', count: 45 }, { area: 'Community Development', count: 38 },
            { area: 'Social Policy', count: 32 }, { area: 'Mental Health', count: 28 },
            { area: 'Child Welfare', count: 24 }, { area: 'Others', count: 78 }
          ]
        },
        reviews: {
          totalReviews: 156,
          averageTurnaround: 28,
          reviewerPerformance: [
            { reviewer: 'Dr. Smith', completed: 12, average_days: 25 }, { reviewer: 'Prof. Johnson', completed: 10, average_days: 30 },
            { reviewer: 'Dr. Brown', completed: 8, average_days: 22 }, { reviewer: 'Dr. Davis', completed: 15, average_days: 35 },
            { reviewer: 'Prof. Wilson', completed: 9, average_days: 28 }
          ],
          reviewQuality: [
            { month: 'Jan', quality_score: 4.2 }, { month: 'Feb', quality_score: 4.3 }, { month: 'Mar', quality_score: 4.1 },
            { month: 'Apr', quality_score: 4.4 }, { month: 'May', quality_score: 4.5 }, { month: 'Jun', quality_score: 4.3 }
          ]
        },
        editorial: {
          decisions: [
            { decision: 'Accept', count: 89, percentage: 36.3 }, { decision: 'Minor Revision', count: 67, percentage: 27.3 },
            { decision: 'Major Revision', count: 45, percentage: 18.4 }, { decision: 'Reject', count: 44, percentage: 18.0 }
          ],
          decisionTimes: [
            { month: 'Jan', average_days: 45 }, { month: 'Feb', average_days: 42 }, { month: 'Mar', average_days: 38 },
            { month: 'Apr', average_days: 41 }, { month: 'May', average_days: 39 }, { month: 'Jun', average_days: 37 }
          ],
          editorWorkload: [
            { editor: 'Chief Editor', assigned: 45, completed: 42 }, { editor: 'Associate Editor 1', assigned: 32, completed: 30 },
            { editor: 'Associate Editor 2', assigned: 28, completed: 26 }, { editor: 'Section Editor 1', assigned: 25, completed: 24 },
            { editor: 'Section Editor 2', assigned: 22, completed: 21 }
          ]
        },
        publication: {
          publishedArticles: 78,
          citationMetrics: [
            { article: 'Social Impact in Urban Communities', citations: 45 }, { article: 'Mental Health Policy Analysis', citations: 38 },
            { article: 'Child Welfare System Reform', citations: 32 }, { article: 'Community Development Strategies', citations: 28 },
            { article: 'Social Work Practice Guidelines', citations: 24 }
          ],
          downloadStats: [
            { month: 'Jan', downloads: 1250 }, { month: 'Feb', downloads: 1380 }, { month: 'Mar', downloads: 1420 },
            { month: 'Apr', downloads: 1320 }, { month: 'May', downloads: 1580 }, { month: 'Jun', downloads: 1640 }
          ],
          impactMetrics: [
            { metric: 'h-index', value: 24, trend: 'up' }, { metric: 'Average Citations', value: 12.5, trend: 'up' },
            { metric: 'Download Rate', value: 89.2, trend: 'up' }, { metric: 'Acceptance Rate', value: 36.3, trend: 'down' }
          ]
        }
      });
      setLoading(false);
    }, 1000);
  };

  const exportReport = (format: string) => {
    console.log(`Exporting report as ${format}`);
  };

  const cardClasses = "bg-white p-8 border border-border/40 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-primary/20 transition-all";
  const labelClasses = "font-headline font-black text-[9px] uppercase tracking-widest text-foreground/40 mb-2 block";
  const chartCardClasses = "bg-white p-10 border border-border/10 shadow-sm relative overflow-hidden";

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-10 bg-muted/40 w-1/3 rounded-none" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-muted/20 rounded-none border border-border/10" />)}
        </div>
        <div className="h-[400px] bg-muted/10 rounded-none border border-border/5" />
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="space-y-12">
      {/* Institutional Governance Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 pb-12 border-b border-border/20">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-foreground text-white shadow-xl"><ShieldCheck size={24} /></div>
           <div>
              <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">Scholarly Audit Nexus</h2>
              <p className="font-body text-sm text-foreground/40 italic leading-relaxed">
                 Institutional performance auditing and multidisciplinary metric analysis.
              </p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48 rounded-none border-border/40 font-headline font-black uppercase text-[10px] tracking-widest py-6 h-auto shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest">
              <SelectItem value="overview" className="py-4">Governance Overview</SelectItem>
              <SelectItem value="submissions" className="py-4">Submission Registry</SelectItem>
              <SelectItem value="reviews" className="py-4">Assessment Metrics</SelectItem>
              <SelectItem value="editorial" className="py-4">Editorial Efficacy</SelectItem>
              <SelectItem value="publication" className="py-4">Archival Impact</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportReport('pdf')} className="rounded-none border-primary/20 font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 px-10 hover:border-primary transition-all">
            <Download className="h-4 w-4" /> Export Protocol (PDF)
          </Button>
        </div>
      </div>

      {/* High-Fidelity Metric Dossiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'SubmissionsRegistry', val: reportData.submissions.total, icon: <FileText size={18} />, color: 'primary', trend: '+12% institutional density' },
          { label: 'ValidatedAssessments', val: reportData.reviews.totalReviews, icon: <Users size={18} />, color: 'secondary', trend: `${reportData.reviews.averageTurnaround}d assessment latency` },
          { label: 'ArchivalExtractions', val: reportData.publication.publishedArticles, icon: <BookOpen size={18} />, color: 'foreground', trend: `${((reportData.publication.publishedArticles / reportData.submissions.total) * 100).toFixed(1)}% throughput density` },
          { label: 'ImpactProtocol', val: reportData.publication.impactMetrics.find(m => m.metric === 'h-index')?.value, icon: <Activity size={18} />, color: 'secondary', trend: 'Global scholarly reach tier' }
        ].map((m, i) => (
          <div key={i} className={cardClasses + ` border-t-8 border-${m.color}`}>
            <div className="flex items-center justify-between mb-4">
               <div className={`p-3 bg-${m.color}/5 text-${m.color}`}><div className="shadow-sm">{m.icon}</div></div>
               <span className="font-headline font-black text-3xl text-foreground tracking-tighter">{m.val}</span>
            </div>
            <p className={labelClasses}>{m.label}</p>
            <div className="flex items-center gap-2 text-[8px] font-headline font-bold uppercase tracking-widest text-foreground/20 italic group-hover:text-secondary transition-colors">
               <TrendingUp size={10} /> {m.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Intelligence Nexus Tabs */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-12">
        <TabsList className="bg-white border border-border/20 p-2 rounded-none h-auto flex flex-wrap shadow-sm">
          {[
            { val: "overview", label: "Governance Hub", icon: <Layers size={14} /> },
            { val: "submissions", label: "Intake Registry", icon: <FileText size={14} /> },
            { val: "reviews", label: "Peer Audits", icon: <Award size={14} /> },
            { val: "editorial", label: "Consensus Efficacy", icon: <ShieldCheck size={14} /> },
            { val: "publication", label: "Impact Trajectory", icon: <TrendingUp size={14} /> }
          ].map(tab => (
            <TabsTrigger key={tab.val} value={tab.val} className="rounded-none py-6 px-10 data-[state=active]:bg-foreground data-[state=active]:text-white font-headline font-black uppercase text-[10px] tracking-widest transition-all gap-4 grow border-r border-border/10 last:border-0 border-b md:border-b-0 h-16">
              {tab.icon} {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="submissions" className="space-y-12 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-foreground/80">
            <div className={chartCardClasses}>
               <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-primary pl-4">Submission Registry Density</h3>
               <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.submissions.byStatus}
                        cx="50%" cy="50%" innerRadius={100} outerRadius={140} paddingAngle={5}
                        dataKey="count" nameKey="status"
                      >
                        {reportData.submissions.byStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6">
                  {reportData.submissions.byStatus.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border border-border/5 hover:bg-muted/5 transition-all">
                       <div className="w-2 h-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                       <div>
                          <p className="text-[8px] font-headline font-black uppercase tracking-widest text-foreground/30">{item.status}</p>
                          <p className="font-headline font-bold text-xs">{item.count} Dossiers</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className={chartCardClasses}>
               <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-secondary pl-4">Monthly Temporal Trajectory</h3>
               <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.submissions.byMonth}>
                       <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1b4332" opacity={0.05} />
                      <XAxis dataKey="month" stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <YAxis stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke={COLORS[0]} strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-12 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className={chartCardClasses}>
               <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-secondary pl-4">Scholar Assessment Efficacy</h3>
               <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.reviews.reviewerPerformance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d97706" opacity={0.05} />
                      <XAxis dataKey="reviewer" stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <YAxis stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <Tooltip />
                      <Bar dataKey="completed" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className={chartCardClasses}>
               <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-primary pl-4">Peer Assessment Quality Trends</h3>
               <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.reviews.reviewQuality}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1b4332" opacity={0.05} />
                      <XAxis dataKey="month" stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <YAxis domain={[3.5, 5]} stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="quality_score" stroke={COLORS[0]} strokeWidth={6} dot={{ fill: COLORS[0], r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="editorial" className="space-y-12 animate-fade-in-up">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className={chartCardClasses}>
               <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-foreground pl-4">Consensus Distribution Matrix</h3>
               <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.editorial.decisions}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" opacity={0.05} />
                      <XAxis dataKey="decision" stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <YAxis stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <Tooltip />
                      <Bar dataKey="count" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className={chartCardClasses}>
               <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-secondary pl-4">Consensus Latency Temporal Audit</h3>
               <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.editorial.decisionTimes}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d97706" opacity={0.05} />
                      <XAxis dataKey="month" stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <YAxis stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="average_days" stroke={COLORS[1]} strokeWidth={6} dot={{ fill: COLORS[1], r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="publication" className="space-y-12 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className={chartCardClasses}>
               <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-primary pl-4">Archival Citation Impact Ledger</h3>
               <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.publication.citationMetrics} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#1b4332" opacity={0.05} />
                      <XAxis type="number" stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <YAxis type="category" dataKey="article" width={150} stroke="#e5e7eb" tick={{ fontSize: 8, fontFamily: 'Graphik' }} />
                      <Tooltip />
                      <Bar dataKey="citations" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className={chartCardClasses}>
               <h3 className="font-headline font-black uppercase text-xs tracking-widest text-foreground/40 mb-10 border-l-4 border-secondary pl-4">Global Archival Synchronization Velocity</h3>
               <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.publication.downloadStats}>
                      <defs>
                        <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d97706" opacity={0.05} />
                      <XAxis dataKey="month" stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <YAxis stroke="#e5e7eb" tick={{ fontSize: 10, fontFamily: 'Graphik' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="downloads" stroke={COLORS[1]} strokeWidth={4} fillOpacity={1} fill="url(#colorDownloads)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};