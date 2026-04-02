import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database,
  Upload,
  Download,
  Monitor,
  AlertTriangle,
  Info,
  ArrowLeft,
  Globe,
  Zap,
  ShieldCheck,
  Network,
  Activity,
  Layers,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import { Helmet } from 'react-helmet-async';

interface IntegrationStatus {
  doaj: {
    enabled: boolean;
    apiKey: string;
    lastSync: string;
    status: 'connected' | 'error' | 'pending';
    articlesSubmitted: number;
  };
  ajol: {
    enabled: boolean;
    username: string;
    lastSubmission: string;
    status: 'connected' | 'error' | 'pending';
    articlesSubmitted: number;
  };
}

export const ExternalIntegrations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    doaj: {
      enabled: false,
      apiKey: '',
      lastSync: '',
      status: 'pending',
      articlesSubmitted: 0
    },
    ajol: {
      enabled: false,
      username: '',
      lastSubmission: '',
      status: 'pending',
      articlesSubmitted: 0
    }
  });

  const navigate = useNavigate()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-secondary" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-primary" />;
      default: return <Info className="h-4 w-4 text-foreground/20" />;
    }
  };

  const testDOAJConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-doaj-connection', {
        body: { apiKey: integrationStatus.doaj.apiKey }
      });
      if (error) throw error;
      setIntegrationStatus(prev => ({ ...prev, doaj: { ...prev.doaj, status: 'connected' } }));
      toast({ title: "DOAJ Integration Active", description: "Successfully established institutional link with DOAJ API." });
    } catch (error) {
      setIntegrationStatus(prev => ({ ...prev, doaj: { ...prev.doaj, status: 'error' } }));
      toast({ title: "DOAJ Synchrony Failed", description: "Protocol rejected. Please verify the institutional API key.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const bulkSubmitToDoaj = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-submit-doaj', { body: { status: 'published' } });
      if (error) throw error;
      toast({ title: "Master Sync Initiated", description: `Successfully projected ${data.count} articles to the global DOAJ registry.` });
    } catch (error) {
      toast({ title: "Sync Protocol Error", description: "Failed to broadcast manuscript metadata.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const exportForAjol = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-ajol-metadata', { body: { format: 'xml' } });
      if (error) throw error;
      const blob = new Blob([data.content], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ajol-export-${new Date().toISOString().split('T')[0]}.xml`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "AJOL Export Complete", description: "Institutional metadata dossier generated for manual submission." });
    } catch (error) {
      toast({ title: "Export Routine Failed", description: "Failed to compile metadata for AJOL projection.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const cardClasses = "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group";
  const labelClasses = "font-headline font-black text-[10px] uppercase tracking-widest text-foreground/40 mb-4 block";

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <Helmet>
        <title>Institutional Connectivity — External Integrations | IJSDS</title>
        <meta name="description" content="Manage institutional synchronization with global scholarly registries including DOAJ and AJOL." />
      </Helmet>

      <PageHeader 
        title="Institutional" 
        subtitle="Connectivity" 
        accent="Global Sync"
        description="Oversee the synchronization of IJSDS articles with international scholarly registries. Manage API protocols and metadata projection for DOAJ and AJOL."
      />

      <ContentSection>
        {/* Governance Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-border/10 -z-0"></div>
          
          <button 
            onClick={() => navigate(-1)} 
            className="relative z-10 flex items-center gap-6 font-headline font-black text-xs uppercase tracking-[0.4em] text-foreground/40 hover:text-primary transition-colors bg-secondary/5 px-8 py-6 border border-border/10"
          >
             <ArrowLeft size={16} /> Return to Dashboard
          </button>
          
          <div className="relative z-10 flex items-center gap-6 p-6 bg-white border border-border/10 shadow-xl">
             <ShieldCheck size={16} className="text-secondary" />
             <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-foreground/30 italic">Connectivity Protocol v.04</span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-16">
          <TabsList className="bg-white border border-border/20 p-2 rounded-none h-auto flex flex-wrap shadow-sm">
             {[
               { val: "overview", label: "Registry Overview", icon: Activity },
               { val: "doaj", label: "DOAJ Protocol", icon: Database },
               { val: "ajol", label: "AJOL Dossier", icon: Globe },
               { val: "monitoring", label: "Sync Health", icon: Monitor }
             ].map(tab => (
               <TabsTrigger key={tab.val} value={tab.val} className="rounded-none py-6 px-10 data-[state=active]:bg-foreground data-[state=active]:text-white font-headline font-black uppercase text-[10px] tracking-widest transition-all gap-4 grow border-r border-border/10 last:border-0 h-20">
                 <tab.icon size={16} className="opacity-40" /> {tab.label}
               </TabsTrigger>
             ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {/* DOAJ Status Card */}
               <div className={cardClasses}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -z-0" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/10">
                        <div className="flex items-center gap-6">
                           <div className="p-4 bg-primary text-white"><Database className="h-6 w-6" /></div>
                           <h2 className="text-2xl font-headline font-black uppercase tracking-tighter">DOAJ Protocol</h2>
                        </div>
                        <div className="flex items-center gap-4">
                           {getStatusIcon(integrationStatus.doaj.status)}
                           <Badge variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest px-4 font-bold border-2 bg-secondary/5">
                             {integrationStatus.doaj.status}
                           </Badge>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-10 mb-12">
                        <div>
                           <span className={labelClasses}>Entries Synchronized</span>
                           <p className="font-headline font-black text-4xl text-foreground tracking-tighter">{integrationStatus.doaj.articlesSubmitted}</p>
                        </div>
                        <div>
                           <span className={labelClasses}>Temporal Sync Node</span>
                           <p className="font-body text-sm italic text-foreground/40">{integrationStatus.doaj.lastSync || 'Registry Idle'}</p>
                        </div>
                     </div>
                     
                     <Button 
                       onClick={bulkSubmitToDoaj}
                       disabled={!integrationStatus.doaj.enabled || loading}
                       className="w-full bg-foreground text-white py-8 rounded-none font-headline font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-primary transition-all group"
                     >
                        <Upload className="h-4 w-4 mr-4 group-hover:-translate-y-1 transition-transform" /> Execute Master Sync
                     </Button>
                  </div>
               </div>

               {/* AJOL Status Card */}
               <div className={cardClasses}>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 opacity-40 -z-0" style={{ clipPath: 'circle(50% at 0 100%)' }}></div>
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/10">
                        <div className="flex items-center gap-6">
                           <div className="p-4 bg-secondary text-white"><Globe className="h-6 w-6" /></div>
                           <h2 className="text-2xl font-headline font-black uppercase tracking-tighter">AJOL Dossier</h2>
                        </div>
                        <div className="flex items-center gap-4">
                           {getStatusIcon(integrationStatus.ajol.status)}
                           <Badge variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest px-4 font-bold border-2 bg-primary/5">
                             {integrationStatus.ajol.status}
                           </Badge>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-10 mb-12">
                        <div>
                           <span className={labelClasses}>Exported Records</span>
                           <p className="font-headline font-black text-4xl text-foreground tracking-tighter">{integrationStatus.ajol.articlesSubmitted}</p>
                        </div>
                        <div>
                           <span className={labelClasses}>Last Extraction</span>
                           <p className="font-body text-sm italic text-foreground/40">{integrationStatus.ajol.lastSubmission || 'Registry Idle'}</p>
                        </div>
                     </div>
                     
                     <Button 
                       onClick={exportForAjol}
                       disabled={loading}
                       className="w-full border-2 border-foreground text-foreground bg-transparent py-8 rounded-none font-headline font-black uppercase text-xs tracking-[0.2em] hover:bg-foreground hover:text-white transition-all group"
                     >
                        <Download className="h-4 w-4 mr-4 group-hover:translate-y-1 transition-transform" /> Project Metadata XML
                     </Button>
                  </div>
               </div>
            </div>

            {/* Strategic Quick Actions */}
            <div className={cardClasses}>
               <h4 className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/20 mb-10 italic">Global Sync Quick Actions</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { icon: <Upload size={24} />, title: "Broadcast Issue", desc: "Sync all articles from the most recent volume." },
                    { icon: <Monitor size={24} />, title: "Archive Audit", desc: "Verify status of all external registry links." },
                    { icon: <Settings size={24} />, title: "Protocol Opts", desc: "Configure global automated sync frequency." }
                  ].map((action, i) => (
                    <button key={i} className="flex flex-col items-center text-center p-12 bg-secondary/5 border border-border/10 hover:border-primary/40 transition-all group">
                       <div className="mb-6 text-foreground/20 group-hover:text-primary transition-colors">{action.icon}</div>
                       <h5 className="font-headline font-black uppercase text-sm tracking-tight mb-4">{action.title}</h5>
                       <p className="font-body text-[10px] text-foreground/40 italic leading-relaxed">{action.desc}</p>
                    </button>
                  ))}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="doaj" className="space-y-12">
            <div className={cardClasses}>
               <div className="flex items-center gap-6 mb-12">
                  <Settings className="text-primary h-8 w-8" />
                  <h3 className="text-3xl font-headline font-black uppercase tracking-tighter">DOAJ Protocol Configuration</h3>
               </div>
               
               <div className="space-y-12 max-w-4xl">
                  <div className="flex items-center justify-between p-8 bg-secondary/5 border border-border/10">
                     <div className="max-w-xl">
                        <h4 className="font-headline font-black text-xs uppercase tracking-widest mb-2">Enable Automated Ingestion</h4>
                        <p className="font-body text-sm italic text-foreground/40">Automatically broadcast article metadata to the Directory of Open Access Journals upon institutional publication.</p>
                     </div>
                     <Switch
                       checked={integrationStatus.doaj.enabled}
                       onCheckedChange={(enabled) => setIntegrationStatus(prev => ({ ...prev, doaj: { ...prev.doaj, enabled } }))}
                       className="data-[state=checked]:bg-primary"
                     />
                  </div>

                  <div className="space-y-6">
                     <span className={labelClasses}>Institutional API Key Protocol</span>
                     <div className="flex gap-4">
                        <Input
                          type="password"
                          value={integrationStatus.doaj.apiKey}
                          onChange={(e) => setIntegrationStatus(prev => ({ ...prev, doaj: { ...prev.doaj, apiKey: e.target.value } }))}
                          placeholder="Project institutional DOAJ credentials..."
                          className="h-16 rounded-none border-border/20 font-headline font-bold text-xs uppercase tracking-widest focus-visible:ring-primary/20"
                        />
                        <Button
                          onClick={testDOAJConnection}
                          disabled={!integrationStatus.doaj.apiKey || loading}
                          variant="outline"
                          className="h-16 px-10 rounded-none font-headline font-black uppercase text-[10px] tracking-widest border-primary/20 hover:border-primary transition-all"
                        >
                          Verify Node
                        </Button>
                     </div>
                  </div>

                  <div className="pt-10 border-t border-border/10">
                     <span className={labelClasses}>Broadcast Routine Options</span>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {['Auto-sync on master publication', 'Include high-fidelity PDF artifacts', 'Submit supplementary discourse', 'Notify editorial board on success'].map((opt, i) => (
                          <label key={i} className="flex items-center gap-4 cursor-pointer group">
                             <div className="w-6 h-6 border-2 border-border/20 flex items-center justify-center group-hover:border-primary transition-all">
                                {i < 2 && <CheckCircle size={14} className="text-primary" />}
                             </div>
                             <span className="font-headline font-black text-[10px] uppercase tracking-[0.2em] text-foreground/40 group-hover:text-foreground transition-all">{opt}</span>
                          </label>
                        ))}
                     </div>
                  </div>
                  
                  <Button className="bg-foreground text-white py-8 px-12 rounded-none font-headline font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-secondary transition-all">
                     Save Protocol Configuration
                  </Button>
               </div>
            </div>

            {/* Compliance Ledger */}
            <div className={cardClasses + " border-l-8 border-secondary"}>
               <h4 className="font-headline font-black text-[11px] uppercase tracking-[0.5em] text-secondary mb-10 italic">Institutional Compliance Registry</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {[
                    { icon: <CheckCircle className="text-secondary" />, title: "Open Access Mandate", desc: "Institutional policy fulfills DOAJ dissemination requirements." },
                    { icon: <CheckCircle className="text-secondary" />, title: "DOI Registry Access", desc: "All manuscripts projecting unique digital object identifiers." },
                    { icon: <AlertTriangle className="text-primary" />, title: "ISSN Synchronization", desc: "Print/Online ISSN records require master registry update." },
                    { icon: <XCircle className="text-red-500" />, title: "Peer Review Documentation", desc: "Institutional review policy requires public protocol page." }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-6">
                       <div className="mt-1">{item.icon}</div>
                       <div>
                          <h5 className="font-headline font-black uppercase text-sm tracking-tight mb-2">{item.title}</h5>
                          <p className="font-body text-xs text-foreground/30 italic leading-relaxed">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="ajol" className="space-y-12">
             <div className={cardClasses}>
                <div className="flex items-center gap-6 mb-12">
                   <Globe className="text-secondary h-8 w-8" />
                   <h3 className="text-3xl font-headline font-black uppercase tracking-tighter">AJOL Dossier Management</h3>
                </div>
                
                <div className="space-y-12 max-w-4xl">
                   <div className="flex items-center justify-between p-8 bg-secondary/5 border border-border/10">
                      <div className="max-w-xl">
                         <h4 className="font-headline font-black text-xs uppercase tracking-widest mb-2">AJOL Sync Handlers</h4>
                         <p className="font-body text-sm italic text-foreground/40">Manage institutional projection to the African Journals OnLine directory.</p>
                      </div>
                      <Switch
                        checked={integrationStatus.ajol.enabled}
                        onCheckedChange={(enabled) => setIntegrationStatus(prev => ({ ...prev, ajol: { ...prev.ajol, enabled } }))}
                        className="data-[state=checked]:bg-secondary"
                      />
                   </div>

                   <div className="space-y-6">
                      <span className={labelClasses}>AJOL Identity Protocol</span>
                      <Input
                        value={integrationStatus.ajol.username}
                        onChange={(e) => setIntegrationStatus(prev => ({ ...prev, ajol: { ...prev.ajol, username: e.target.value } }))}
                        placeholder="Project institutional AJOL username..."
                        className="h-16 rounded-none border-border/20 font-headline font-bold text-xs uppercase tracking-widest focus-visible:ring-secondary/20"
                      />
                   </div>

                   <div className="space-y-6">
                      <span className={labelClasses}>Internal Submission Memo</span>
                      <Textarea
                        placeholder="Log institutional metadata for this AJOL sync routine..."
                        className="min-h-[160px] rounded-none border-border/20 font-body text-lg italic bg-secondary/5 focus-visible:ring-secondary/20 transition-all"
                      />
                   </div>
                   
                   <div className="flex flex-col md:flex-row gap-6 pt-10 border-t border-border/10">
                      <Button onClick={exportForAjol} className="flex-1 bg-secondary text-white py-8 rounded-none font-headline font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-foreground transition-all">
                        Compile Metadata Dossier (XML)
                      </Button>
                      <Button variant="outline" className="flex-1 py-8 rounded-none font-headline font-black uppercase text-[10px] tracking-[0.4em] border-border/20 hover:border-secondary transition-all">
                        Archive All Manuscripts (ZIP)
                      </Button>
                   </div>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className={cardClasses}>
                   <h3 className="text-2xl font-headline font-black uppercase tracking-tighter mb-10 flex items-center gap-6 pb-6 border-b border-border/10">
                      <Monitor className="text-primary h-6 w-6" /> Integration Health
                   </h3>
                   <div className="space-y-10">
                      <div className="flex items-center justify-between p-6 bg-secondary/5 border border-border/10">
                         <div className="flex items-center gap-6">
                            <div className="h-3 w-3 bg-secondary rounded-full animate-pulse shadow-[0_0_15px_rgba(27,67,50,0.5)]"></div>
                            <span className="font-headline font-black text-xs uppercase tracking-widest">DOAJ Protocol</span>
                         </div>
                         <span className="font-headline text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">Global Link Active</span>
                      </div>
                      <div className="flex items-center justify-between p-6 bg-secondary/5 border border-border/10">
                         <div className="flex items-center gap-6">
                            <div className="h-3 w-3 bg-primary rounded-full opacity-60"></div>
                            <span className="font-headline font-black text-xs uppercase tracking-widest">AJOL Node</span>
                         </div>
                         <span className="font-headline text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">Manual Mode</span>
                      </div>
                   </div>
                </div>
                
                <div className={cardClasses}>
                   <h3 className="text-2xl font-headline font-black uppercase tracking-tighter mb-10 flex items-center gap-6 pb-6 border-b border-border/10">
                      <Clock className="text-secondary h-6 w-6" /> Recent Sync Events
                   </h3>
                   <div className="py-16 text-center">
                      <Layers className="mx-auto h-12 w-12 text-foreground/10 mb-8" />
                      <p className="font-body text-foreground/30 italic text-lg">Registry synchronization archive empty.</p>
                   </div>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </ContentSection>

      <div className="container mx-auto px-4 mt-24 text-center opacity-10 font-headline font-black text-[9px] uppercase tracking-[0.8em]">
         Institutional Connectivity Registry — Permanent Record v.04
      </div>
    </div>
  );
};