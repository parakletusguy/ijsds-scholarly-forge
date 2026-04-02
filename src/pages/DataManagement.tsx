import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataExport } from '@/components/reporting/DataExport';
import { Database, Shield, FileText, Activity, ArrowLeft, ShieldCheck, Server, Zap, BarChart3, GraduationCap, ChevronRight, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

export const DataManagement = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = !!profile?.is_admin;

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!loading && user && !isAdmin) {
      toast({ title: 'Access Denied', description: 'Administrative credentials required.', variant: 'destructive' });
      navigate('/dashboard'); return;
    }
  }, [user, profile, loading, navigate]);

  const systemStats = {
    totalSubmissions: 245,
    totalReviews: 187,
    publishedArticles: 156,
    activeUsers: 89,
    storageUsed: '2.3 GB',
    backupStatus: 'Synchronized (2h ago)',
  };

  const cardClasses = "bg-white p-8 border border-border/40 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-primary/20 transition-all";
  const labelClasses = "font-headline font-black text-[9px] uppercase tracking-widest text-foreground/40 mb-2 block";

  if (loading || !isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <PageHeader 
        title="Intelligence" 
        subtitle="Nexus" 
        accent="Data Governance"
        description="Oversee the scholarly data lifecycle. Generate high-fidelity reports, audit system-wide health metrics, and synchronize institutional archival extractions."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate('/admin')} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Return to Command Hub
           </Button>
           
           <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
              <ShieldCheck size={16} className="text-secondary" />
              <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Authorized System Audit Stream</span>
           </div>
        </div>

        {/* Intelligence Metric Dossiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className={cardClasses + " border-t-8 border-primary"}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/5 text-primary"><FileText size={18} /></div>
              <span className="font-headline font-black text-3xl text-foreground tracking-tighter">{systemStats.totalSubmissions}</span>
            </div>
            <p className={labelClasses}>Manuscript Intake</p>
            <div className="flex items-center gap-2 text-[10px] text-foreground/20 italic">Registry Census Count</div>
          </div>

          <div className={cardClasses + " border-t-8 border-secondary"}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-secondary/5 text-secondary"><Activity size={18} /></div>
              <span className="font-headline font-black text-3xl text-foreground tracking-tighter">{systemStats.publishedArticles}</span>
            </div>
            <p className={labelClasses}>Archived Publications</p>
            <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-widest">Growth +12% Cycle</div>
          </div>

          <div className={cardClasses + " border-t-8 border-foreground"}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-muted text-foreground/30"><Database size={18} /></div>
              <span className="font-headline font-black text-3xl text-foreground tracking-tighter">{systemStats.storageUsed}</span>
            </div>
            <p className={labelClasses}>Volumetric Utilization</p>
            <div className="flex items-center gap-2 text-[10px] text-foreground/20 italic">Cloud Infrastructure Load</div>
          </div>

          <div className={cardClasses + " border-t-8 border-primary bg-foreground text-white"}>
            <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={40} /></div>
            <div className="flex items-center justify-between mb-4 pt-1">
              <div className="p-3 bg-white/5 text-secondary shadow-lg"><Shield size={18} /></div>
              <Badge className="bg-secondary text-white rounded-none border-none text-[8px] uppercase tracking-widest py-1 px-3">Optimal</Badge>
            </div>
            <p className="font-headline font-bold text-[9px] uppercase tracking-widest text-white/40 mb-2 block">Governance Status</p>
            <div className="flex items-center gap-2 text-[9px] text-white/30 italic">Protocol Finalized (2h ago)</div>
          </div>
        </div>

        <Tabs defaultValue="export" className="space-y-12">
          <TabsList className="bg-white border border-border/20 p-2 rounded-none h-auto flex flex-wrap shadow-sm">
            {[
              { val: "export", label: "Registry Archive Extraction", icon: <Download size={14} /> },
              { val: "diagnostics", label: "Infrastructure Diagnostics", icon: <BarChart3 size={14} /> },
              { val: "backups", label: "Institutional Backups", icon: <Server size={14} /> }
            ].map(tab => (
              <TabsTrigger key={tab.val} value={tab.val} className="rounded-none py-4 px-8 data-[state=active]:bg-foreground data-[state=active]:text-white font-headline font-black uppercase text-[10px] tracking-widest transition-all gap-4 grow border-r border-border/10 last:border-0 h-16">
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="export" className="mt-0">
             <div className="animate-fade-in-up">
                <DataExport />
             </div>
          </TabsContent>
          
          <TabsContent value="diagnostics" className="mt-0">
             <div className="bg-white border border-border/40 p-20 text-center animate-fade-in-up">
                <Activity size={48} className="mx-auto text-primary/20 mb-8" />
                <h3 className="font-headline font-black uppercase text-xl tracking-tight mb-4">Diagnostic Audit Stream</h3>
                <p className="font-body text-sm text-foreground/40 italic max-w-md mx-auto leading-relaxed">
                   Real-time infrastructure diagnostic telemetry is currently being synchronized with the primary node. Access will be granted upon completion of the system health check.
                </p>
             </div>
          </TabsContent>

          <TabsContent value="backups" className="mt-0">
             <div className="bg-white border border-border/40 p-20 text-center animate-fade-in-up">
                <Server size={48} className="mx-auto text-secondary/20 mb-8" />
                <h3 className="font-headline font-black uppercase text-xl tracking-tight mb-4">Institutional Archival Backups</h3>
                <p className="font-body text-sm text-foreground/40 italic max-w-md mx-auto leading-relaxed">
                   All manuscript registries and scholarly assets are currently replicated across triplet geographical nodes. Manual backup initialization is scheduled for the next governance maintenance window.
                </p>
             </div>
          </TabsContent>
        </Tabs>
      </ContentSection>
    </div>
  );
};