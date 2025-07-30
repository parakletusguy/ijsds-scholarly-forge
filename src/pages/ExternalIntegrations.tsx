import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  Info
} from 'lucide-react';

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

  const [submissionHistory, setSubmissionHistory] = useState([]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const testDOAJConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-doaj-connection', {
        body: { apiKey: integrationStatus.doaj.apiKey }
      });

      if (error) throw error;

      setIntegrationStatus(prev => ({
        ...prev,
        doaj: { ...prev.doaj, status: 'connected' }
      }));

      toast({
        title: "DOAJ Connection Successful",
        description: "Successfully connected to DOAJ API",
      });
    } catch (error) {
      console.error('DOAJ connection error:', error);
      setIntegrationStatus(prev => ({
        ...prev,
        doaj: { ...prev.doaj, status: 'error' }
      }));
      toast({
        title: "DOAJ Connection Failed",
        description: "Failed to connect to DOAJ API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const bulkSubmitToDoaj = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-submit-doaj', {
        body: { status: 'published' }
      });

      if (error) throw error;

      toast({
        title: "Bulk Submission Started",
        description: `Submitted ${data.count} articles to DOAJ`,
      });
    } catch (error) {
      console.error('Bulk submission error:', error);
      toast({
        title: "Bulk Submission Failed",
        description: "Failed to submit articles to DOAJ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportForAjol = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-ajol-metadata', {
        body: { format: 'xml' }
      });

      if (error) throw error;

      // Create and download file
      const blob = new Blob([data.content], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ajol-export-${new Date().toISOString().split('T')[0]}.xml`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "AJOL Export Complete",
        description: "Metadata exported for AJOL submission",
      });
    } catch (error) {
      console.error('AJOL export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export metadata for AJOL",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">External Integrations</h1>
          <p className="text-muted-foreground">
            Manage integrations with DOAJ, AJOL, and other journal directories
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="doaj">DOAJ Integration</TabsTrigger>
            <TabsTrigger value="ajol">AJOL Integration</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Integration Status Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    DOAJ Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integrationStatus.doaj.status)}
                      <Badge variant={integrationStatus.doaj.status === 'connected' ? 'default' : 'secondary'}>
                        {integrationStatus.doaj.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Articles Submitted</span>
                    <span className="text-sm">{integrationStatus.doaj.articlesSubmitted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Sync</span>
                    <span className="text-sm text-muted-foreground">
                      {integrationStatus.doaj.lastSync || 'Never'}
                    </span>
                  </div>
                  <Button 
                    onClick={bulkSubmitToDoaj}
                    disabled={!integrationStatus.doaj.enabled || loading}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Submit to DOAJ
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    AJOL Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integrationStatus.ajol.status)}
                      <Badge variant={integrationStatus.ajol.status === 'connected' ? 'default' : 'secondary'}>
                        {integrationStatus.ajol.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Articles Submitted</span>
                    <span className="text-sm">{integrationStatus.ajol.articlesSubmitted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Submission</span>
                    <span className="text-sm text-muted-foreground">
                      {integrationStatus.ajol.lastSubmission || 'Never'}
                    </span>
                  </div>
                  <Button 
                    onClick={exportForAjol}
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export for AJOL
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Upload className="h-6 w-6 mb-2" />
                    Submit Recent Articles
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Monitor className="h-6 w-6 mb-2" />
                    Check Status
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Settings className="h-6 w-6 mb-2" />
                    Configure Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doaj" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>DOAJ Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Enable DOAJ Integration</h3>
                    <p className="text-xs text-muted-foreground">
                      Automatically submit articles to Directory of Open Access Journals
                    </p>
                  </div>
                  <Switch
                    checked={integrationStatus.doaj.enabled}
                    onCheckedChange={(enabled) => 
                      setIntegrationStatus(prev => ({
                        ...prev,
                        doaj: { ...prev.doaj, enabled }
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">DOAJ API Key</label>
                    <Input
                      type="password"
                      value={integrationStatus.doaj.apiKey}
                      onChange={(e) => 
                        setIntegrationStatus(prev => ({
                          ...prev,
                          doaj: { ...prev.doaj, apiKey: e.target.value }
                        }))
                      }
                      placeholder="Enter your DOAJ API key"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={testDOAJConnection}
                      disabled={!integrationStatus.doaj.apiKey || loading}
                      variant="outline"
                    >
                      Test Connection
                    </Button>
                    <Button disabled={loading}>
                      Save Configuration
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Submission Options</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Auto-submit on publication</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Include full text PDF</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Submit supplementary materials</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DOAJ Compliance Check</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Open Access License Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">DOI Required for Each Article</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">ISSN Registration Needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Peer Review Policy Documentation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ajol" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AJOL Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Enable AJOL Integration</h3>
                    <p className="text-xs text-muted-foreground">
                      Submit to African Journals OnLine directory
                    </p>
                  </div>
                  <Switch
                    checked={integrationStatus.ajol.enabled}
                    onCheckedChange={(enabled) => 
                      setIntegrationStatus(prev => ({
                        ...prev,
                        ajol: { ...prev.ajol, enabled }
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">AJOL Username</label>
                    <Input
                      value={integrationStatus.ajol.username}
                      onChange={(e) => 
                        setIntegrationStatus(prev => ({
                          ...prev,
                          ajol: { ...prev.ajol, username: e.target.value }
                        }))
                      }
                      placeholder="Enter your AJOL username"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Submission Notes</label>
                    <Textarea
                      placeholder="Add any notes for AJOL submission"
                      className="min-h-[80px]"
                    />
                  </div>

                  <Button disabled={loading}>
                    Save Configuration
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Export Options</h3>
                  <div className="space-y-2">
                    <Button onClick={exportForAjol} variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Metadata (XML)
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Full Articles (ZIP)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AJOL Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">African Research Focus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Peer Review Process</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Editorial Board Information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Regular Publication Schedule</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Integration Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">DOAJ Status</h4>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Connected</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Last check: 2 minutes ago</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">AJOL Status</h4>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Manual Process</span>
                    </div>
                    <p className="text-xs text-muted-foreground">No automated connection</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center text-muted-foreground py-8">
                    No recent submissions to display
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};