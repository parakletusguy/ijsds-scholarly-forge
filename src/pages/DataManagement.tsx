import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataExport } from '@/components/reporting/DataExport';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Shield, FileText, Activity, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DataManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate()

  const systemStats = {
    totalSubmissions: 245,
    totalReviews: 187,
    publishedArticles: 156,
    activeUsers: 89,
    storageUsed: '2.3 GB',
    backupStatus: 'Last backup: 2 hours ago',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
             <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Data Management</h1>
          <p className="text-muted-foreground">
            Export data, generate reports, and monitor system health
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.totalSubmissions}</p>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.publishedArticles}</p>
                  <p className="text-sm text-muted-foreground">Published Articles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.storageUsed}</p>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-amber-600" />
                <div className="flex flex-col">
                  <Badge variant="outline" className="w-fit mb-1">
                    Healthy
                  </Badge>
                  <p className="text-sm text-muted-foreground">System Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="export" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">Data Export</TabsTrigger>
            <TabsTrigger value="backup">Backup & Security</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="export">
            <DataExport />
          </TabsContent>

          <TabsContent value="backup">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Backup Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Last Backup</span>
                      <Badge variant="outline">2 hours ago</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Backup Frequency</span>
                      <Badge variant="outline">Daily</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Backup Size</span>
                      <Badge variant="outline">1.8 GB</Badge>
                    </div>
                    <Button className="w-full">
                      Create Manual Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Audit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Data Encryption</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Access Control</span>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Audit Logging</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>GDPR Compliance</span>
                      <Badge variant="default">Verified</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Database Optimization</h4>
                        <p className="text-sm text-muted-foreground">
                          Optimize database performance and clean up old data
                        </p>
                      </div>
                      <Button variant="outline">Run Now</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Cache Cleanup</h4>
                        <p className="text-sm text-muted-foreground">
                          Clear application cache and temporary files
                        </p>
                      </div>
                      <Button variant="outline">Run Now</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Storage Cleanup</h4>
                        <p className="text-sm text-muted-foreground">
                          Remove orphaned files and compress old data
                        </p>
                      </div>
                      <Button variant="outline">Run Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <div className="text-sm">
                      <span className="text-muted-foreground">2024-01-30 14:23:15</span>
                      {" "}- Database backup completed successfully
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">2024-01-30 12:15:08</span>
                      {" "}- User authentication session refreshed
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">2024-01-30 10:45:32</span>
                      {" "}- New submission processed (ID: sub_12345)
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">2024-01-30 09:12:44</span>
                      {" "}- Email notification sent successfully
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};