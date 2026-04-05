import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
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
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
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
      toast({ title: "DOAJ Integration Active", description: "Successfully established link with DOAJ API." });
    } catch (error) {
      setIntegrationStatus(prev => ({ ...prev, doaj: { ...prev.doaj, status: 'error' } }));
      toast({ title: "DOAJ Synchrony Failed", description: "Protocol rejected. Please verify the API key.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const bulkSubmitToDoaj = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-submit-doaj', { body: { status: 'published' } });
      if (error) throw error;
      toast({ title: "Master Sync Initiated", description: `Successfully projected ${data?.count || 0} articles to the global DOAJ registry.` });
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

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>External Integrations | IJSDS</title>
        <meta name="description" content="Manage institutional synchronization with global scholarly registries including DOAJ and AJOL." />
      </Helmet>

      <div className="relative py-3">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-4 absolute top-1 left-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Command Hub
        </Button>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">External Integrations</h1>
          <p className="text-muted-foreground">
            Synchronize articles with international scholarly registries including DOAJ and AJOL APIs.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <Card>
            <CardHeader className="p-0 border-b">
              <TabsList className="w-full h-auto bg-transparent border-b-0 p-0 flex flex-wrap">
                {[
                  { val: "overview", label: "Registry Overview", icon: Activity },
                  { val: "doaj", label: "DOAJ Protocol", icon: Database },
                  { val: "ajol", label: "AJOL Dossier", icon: Globe },
                  { val: "monitoring", label: "Sync Health", icon: Monitor }
                ].map((tab, i) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.val}
                      value={tab.val} 
                      className={`flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-4 gap-2`}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </CardHeader>
            
            <CardContent className="pt-6 pb-6">
              <TabsContent value="overview" className="m-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* DOAJ Status Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                       <div className="flex items-center gap-3">
                          <Database className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">DOAJ API</CardTitle>
                       </div>
                       <div className="flex items-center gap-2">
                          {getStatusIcon(integrationStatus.doaj.status)}
                          <Badge variant="outline" className="capitalize">
                            {integrationStatus.doaj.status}
                          </Badge>
                       </div>
                    </CardHeader>
                    <CardContent>
                       <div className="grid grid-cols-2 gap-4 my-6">
                          <div>
                             <div className="text-sm font-medium text-muted-foreground mb-1">Articles Synced</div>
                             <div className="text-3xl font-bold">{integrationStatus.doaj.articlesSubmitted}</div>
                          </div>
                          <div>
                             <div className="text-sm font-medium text-muted-foreground mb-1">Last Synchronization</div>
                             <div className="text-sm">{integrationStatus.doaj.lastSync || 'Idle'}</div>
                          </div>
                       </div>
                       <Button 
                         onClick={bulkSubmitToDoaj}
                         disabled={!integrationStatus.doaj.enabled || loading}
                         className="w-full"
                       >
                         <Upload className="h-4 w-4 mr-2" /> Sync All Published
                       </Button>
                    </CardContent>
                  </Card>

                  {/* AJOL Status Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                       <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-secondary" />
                          <CardTitle className="text-lg">AJOL Exporter</CardTitle>
                       </div>
                       <div className="flex items-center gap-2">
                          {getStatusIcon(integrationStatus.ajol.status)}
                          <Badge variant="outline" className="capitalize">
                            {integrationStatus.ajol.status}
                          </Badge>
                       </div>
                    </CardHeader>
                    <CardContent>
                       <div className="grid grid-cols-2 gap-4 my-6">
                          <div>
                             <div className="text-sm font-medium text-muted-foreground mb-1">Exported Records</div>
                             <div className="text-3xl font-bold">{integrationStatus.ajol.articlesSubmitted}</div>
                          </div>
                          <div>
                             <div className="text-sm font-medium text-muted-foreground mb-1">Last Extraction</div>
                             <div className="text-sm">{integrationStatus.ajol.lastSubmission || 'Idle'}</div>
                          </div>
                       </div>
                       <Button 
                         onClick={exportForAjol}
                         disabled={loading}
                         variant="secondary"
                         className="w-full"
                       >
                         <Download className="h-4 w-4 mr-2" /> Download XML Dossier
                       </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div>
                   <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Quick Actions</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { icon: Upload, title: "Broadcast Issue", desc: "Sync latest volume" },
                        { icon: Monitor, title: "Archive Audit", desc: "Verify registry links" },
                        { icon: Settings, title: "Protocol Opts", desc: "Configure sync settings" }
                      ].map((action, i) => {
                        const Icon = action.icon;
                        return (
                          <Card key={i} className="cursor-pointer hover:bg-muted/50 transition-colors">
                             <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <Icon className="h-6 w-6 text-muted-foreground mb-3" />
                                <h4 className="font-semibold">{action.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                             </CardContent>
                          </Card>
                        )
                      })}
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="doaj" className="m-0 space-y-6">
                <Card>
                   <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                         <Settings className="h-5 w-5 text-primary" /> DOAJ Configuration
                      </CardTitle>
                      <CardDescription>
                         Manage API key and submission automation for the Directory of Open Access Journals.
                      </CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                         <div>
                            <div className="font-medium">Enable Automated Ingestion</div>
                            <div className="text-sm text-muted-foreground">Automatically broadcast metadata to DOAJ upon publication.</div>
                         </div>
                         <Switch
                           checked={integrationStatus.doaj.enabled}
                           onCheckedChange={(enabled) => setIntegrationStatus(prev => ({ ...prev, doaj: { ...prev.doaj, enabled } }))}
                         />
                      </div>

                      <div className="space-y-3">
                         <div className="font-medium text-sm">Institutional API Key</div>
                         <div className="flex gap-4">
                            <Input
                              type="password"
                              value={integrationStatus.doaj.apiKey}
                              onChange={(e) => setIntegrationStatus(prev => ({ ...prev, doaj: { ...prev.doaj, apiKey: e.target.value } }))}
                              placeholder="Enter API Key"
                              className="max-w-md"
                            />
                            <Button
                              onClick={testDOAJConnection}
                              disabled={!integrationStatus.doaj.apiKey || loading}
                              variant="outline"
                            >
                              Verify Connection
                            </Button>
                         </div>
                      </div>

                      <div className="border-t pt-6">
                         <div className="font-medium text-sm mb-4">Submission Options</div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['Auto-sync on master publication', 'Include high-fidelity PDF artifacts', 'Submit supplementary discourse', 'Notify editorial board on success'].map((opt, i) => (
                              <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors">
                                 <div className={`w-4 h-4 border rounded-sm flex justify-center items-center ${i < 2 ? 'bg-primary border-primary' : 'border-input'}`}>
                                    {i < 2 && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                                 </div>
                                 {opt}
                              </label>
                            ))}
                         </div>
                      </div>
                      
                      <div className="border-t pt-6">
                         <Button>Save Configuration</Button>
                      </div>
                   </CardContent>
                </Card>

                <Card>
                   <CardHeader>
                      <CardTitle className="text-base text-muted-foreground">Compliance Checklist</CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {[
                           { icon: CheckCircle, color: "text-green-500", title: "Open Access Mandate", desc: "Policy fulfills DOAJ requirements." },
                           { icon: CheckCircle, color: "text-green-500", title: "DOI Registry Access", desc: "Records contain digital object identifiers." },
                           { icon: AlertTriangle, color: "text-amber-500", title: "ISSN Synchronization", desc: "Print/Online ISSN records need update." },
                           { icon: XCircle, color: "text-destructive", title: "Review Documentation", desc: "Review policy needs public URL." }
                         ].map((item, i) => {
                           const Icon = item.icon;
                           return (
                             <div key={i} className="flex items-start gap-4">
                                <Icon className={`h-5 w-5 mt-0.5 ${item.color}`} />
                                <div>
                                   <div className="font-medium text-sm">{item.title}</div>
                                   <div className="text-sm text-muted-foreground">{item.desc}</div>
                                </div>
                             </div>
                           )
                         })}
                      </div>
                   </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ajol" className="m-0 space-y-6">
                 <Card>
                    <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-secondary" /> AJOL Dossier
                       </CardTitle>
                       <CardDescription>
                          Manage institutional metadata projection formatted for African Journals OnLine.
                       </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                          <div>
                             <div className="font-medium">Enable AJOL Sync Profile</div>
                             <div className="text-sm text-muted-foreground">Maintain AJOL credentials for tracking exports.</div>
                          </div>
                          <Switch
                            checked={integrationStatus.ajol.enabled}
                            onCheckedChange={(enabled) => setIntegrationStatus(prev => ({ ...prev, ajol: { ...prev.ajol, enabled } }))}
                          />
                       </div>

                       <div className="space-y-3">
                          <div className="font-medium text-sm">AJOL Identifier</div>
                          <Input
                            value={integrationStatus.ajol.username}
                            onChange={(e) => setIntegrationStatus(prev => ({ ...prev, ajol: { ...prev.ajol, username: e.target.value } }))}
                            placeholder="Enter AJOL username"
                            className="max-w-md"
                          />
                       </div>

                       <div className="space-y-3 border-t pt-6">
                          <div className="font-medium text-sm">Internal Sync Notes</div>
                          <Textarea
                            placeholder="Optional: Log reference details for this export cycle..."
                            className="min-h-[100px]"
                          />
                       </div>
                       
                       <div className="flex gap-4 pt-6 border-t">
                          <Button onClick={exportForAjol} disabled={loading}>
                            Compile Metadata (XML)
                          </Button>
                          <Button variant="outline">
                            Archive PDFs (ZIP)
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
              </TabsContent>

              <TabsContent value="monitoring" className="m-0 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                       <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                             <Monitor className="h-5 w-5 text-muted-foreground" /> Integration Health
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                             <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                <div className="font-medium text-sm">DOAJ API</div>
                             </div>
                             <div className="text-xs text-muted-foreground">Active</div>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                             <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                <div className="font-medium text-sm">AJOL Exporter</div>
                             </div>
                             <div className="text-xs text-muted-foreground">Manual Export</div>
                          </div>
                       </CardContent>
                    </Card>
                    
                    <Card>
                       <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                             <Clock className="h-5 w-5 text-muted-foreground" /> Recent Events
                          </CardTitle>
                       </CardHeader>
                       <CardContent>
                          <div className="py-12 text-center flex flex-col items-center justify-center text-muted-foreground">
                             <Layers className="h-8 w-8 mb-4 opacity-50" />
                             <div className="text-sm">Log completely clear.</div>
                          </div>
                       </CardContent>
                    </Card>
                 </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </main>
    </div>
  );
};