import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { EditorialDecisionAnalytics } from './EditorialDecisionAnalytics';
import { ReviewTurnaroundVisualization } from './ReviewTurnaroundVisualization';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Clock, 
  Users, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  BookOpen,
  Activity,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
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

      const previousMonth = totalSubmissions - recentSubmissions;
      const monthlyGrowth = previousMonth > 0 
        ? Math.round(((recentSubmissions / previousMonth) - 1) * 100)
        : 0;

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
      case 'excellent': return <Zap className="h-6 w-6 text-secondary" />;
      case 'good': return <CheckCircle className="h-6 w-6 text-primary" />;
      case 'warning': return <AlertCircle className="h-6 w-6 text-amber-500" />;
      case 'critical': return <AlertCircle className="h-6 w-6 text-destructive" />;
      default: return <Activity className="h-6 w-6 text-foreground/40" />;
    }
  };

  const getHealthColorClass = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-secondary text-white';
      case 'good': return 'bg-primary text-white';
      case 'warning': return 'bg-amber-500 text-white';
      case 'critical': return 'bg-destructive text-white';
      default: return 'bg-muted text-foreground/40';
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><LoadingSpinner text="Synchronizing telemetry..." /></div>;
  }

  const cardClasses = "bg-white p-8 border border-border/40 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all";
  const labelClasses = "font-headline font-black text-[9px] uppercase tracking-widest text-foreground/40 mb-2 block";

  return (
    <div className="space-y-12 animate-fade-in">
      {/* System Overview Metric Dossiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Manuscript Intake', val: systemMetrics.totalSubmissions, icon: <FileText size={18} />, color: 'primary', trend: systemMetrics.monthlyGrowth, trendLabel: 'Growth' },
          { label: 'Active Assessments', val: systemMetrics.activeReviews, icon: <Clock size={18} />, color: 'secondary', trend: null, trendLabel: 'In Progress' },
          { label: 'Published Archives', val: systemMetrics.publishedArticles, icon: <BookOpen size={18} />, color: 'foreground', trend: null, trendLabel: 'Registry' },
          { label: 'Scholar Index', val: systemMetrics.registeredUsers, icon: <Users size={18} />, color: 'primary', trend: null, trendLabel: 'Identities' }
        ].map((metric, i) => (
          <div key={i} className={cardClasses + ` border-t-8 border-${metric.color}`}>
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 bg-${metric.color}/5 text-${metric.color}`}><div className="shadow-sm">{metric.icon}</div></div>
              <span className="font-headline font-black text-3xl tracking-tighter text-foreground">{metric.val}</span>
            </div>
            <p className={labelClasses}>{metric.label}</p>
            <div className="flex items-center gap-2">
               {metric.trend !== null ? (
                 <span className={`flex items-center gap-1 font-headline font-bold text-[8px] uppercase tracking-widest ${metric.trend >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                    {metric.trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {Math.abs(metric.trend)}% {metric.trendLabel}
                 </span>
               ) : (
                 <span className="font-headline font-bold text-[8px] uppercase tracking-widest text-foreground/20 italic">{metric.trendLabel} Status</span>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* System Health Dossier */}
      <div className={cardClasses + " border-l-8 border-foreground p-0 overflow-hidden"}>
         <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/20">
            <div className="p-10 md:w-2/3">
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-foreground text-white shadow-lg"><Activity size={18} /></div>
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight">Institutional Health Telemetry</h3>
               </div>
               <p className="font-body text-sm text-foreground/40 italic leading-relaxed mb-8 max-w-xl">
                  Advanced algorithmic oversight evaluating peer-review velocity, institutional response density, and submission trajectory density.
               </p>
               <div className="flex flex-wrap gap-12">
                  <div className="space-y-1">
                     <p className={labelClasses}>Latency Tier</p>
                     <p className="font-headline font-bold text-xs uppercase tracking-tighter text-foreground">Synchronous</p>
                  </div>
                  <div className="space-y-1">
                     <p className={labelClasses}>Node Resilience</p>
                     <p className="font-headline font-bold text-xs uppercase tracking-tighter text-foreground">Multi-Zonal</p>
                  </div>
                  <div className="space-y-1">
                     <p className={labelClasses}>Protocol Status</p>
                     <p className="font-headline font-bold text-xs uppercase tracking-tighter text-foreground">Active Hub</p>
                  </div>
               </div>
            </div>
            <div className="p-10 md:w-1/3 bg-muted/5 flex flex-col justify-center items-center text-center gap-6">
               <div className="p-6 bg-white border border-border/10 shadow-inner rounded-full transform hover:scale-110 transition-transform cursor-pointer">
                  {getHealthIcon(systemMetrics.systemHealth)}
               </div>
               <div className="space-y-2">
                  <Badge className={`rounded-none font-headline font-bold text-[10px] uppercase tracking-[0.2em] px-6 py-2 shadow-sm ${getHealthColorClass(systemMetrics.systemHealth)}`}>
                    {systemMetrics.systemHealth}
                  </Badge>
                  <p className="text-[8px] font-headline font-black uppercase tracking-widest text-foreground/20 mt-4">Global Integrity Tier</p>
               </div>
            </div>
         </div>
      </div>

      {/* Detailed Analytics Nexus */}
      <Tabs defaultValue="editorial" className="space-y-10">
        <TabsList className="bg-white border border-border/20 p-2 rounded-none h-auto flex flex-wrap shadow-sm">
           <TabsTrigger value="editorial" className="rounded-none py-6 px-10 data-[state=active]:bg-foreground data-[state=active]:text-white font-headline font-black uppercase text-[10px] tracking-widest transition-all gap-4 grow">
             <BarChart3 size={14} /> Editorial Decision Analytics
           </TabsTrigger>
           <TabsTrigger value="reviews" className="rounded-none py-6 px-10 data-[state=active]:bg-foreground data-[state=active]:text-white font-headline font-black uppercase text-[10px] tracking-widest transition-all gap-4 grow">
             <TrendingUp size={14} /> Review Turnaround Nexus
           </TabsTrigger>
        </TabsList>

        <TabsContent value="editorial" className="mt-0">
           <div className="animate-fade-in-up">
              <EditorialDecisionAnalytics />
           </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-0">
           <div className="animate-fade-in-up">
              <ReviewTurnaroundVisualization />
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};