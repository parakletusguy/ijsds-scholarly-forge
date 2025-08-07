import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Shield, 
  Database, 
  Cloud, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Download,
  RefreshCw,
  HardDrive,
  Calendar
} from 'lucide-react';

interface BackupStatus {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  startTime: string;
  endTime?: string;
  size: number;
  location: string;
  progress: number;
  errorMessage?: string;
}

interface StorageMetrics {
  totalBackups: number;
  totalSize: number;
  availableSpace: number;
  lastBackupDate: string;
  retentionPolicy: number; // days
  compressionRatio: number;
}

export const BackupStatusMonitoring = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState<BackupStatus[]>([]);
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics>({
    totalBackups: 0,
    totalSize: 0,
    availableSpace: 0,
    lastBackupDate: '',
    retentionPolicy: 30,
    compressionRatio: 0
  });
  const [triggeringBackup, setTriggeringBackup] = useState(false);

  useEffect(() => {
    fetchBackupStatus();
    // Set up polling for real-time updates
    const interval = setInterval(fetchBackupStatus, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBackupStatus = async () => {
    try {
      if (loading) setLoading(true);

      // Generate mock backup data (in real implementation, this would come from your backup system)
      const mockBackups: BackupStatus[] = [
        {
          id: '1',
          type: 'full',
          status: 'completed',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          size: 1024 * 1024 * 1024 * 2.5, // 2.5 GB
          location: 'AWS S3 us-east-1',
          progress: 100
        },
        {
          id: '2',
          type: 'incremental',
          status: 'running',
          startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          size: 1024 * 1024 * 256, // 256 MB
          location: 'AWS S3 us-east-1',
          progress: 65
        },
        {
          id: '3',
          type: 'full',
          status: 'completed',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          size: 1024 * 1024 * 1024 * 2.3, // 2.3 GB
          location: 'AWS S3 us-east-1',
          progress: 100
        },
        {
          id: '4',
          type: 'incremental',
          status: 'failed',
          startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 47.5 * 60 * 60 * 1000).toISOString(),
          size: 1024 * 1024 * 180, // 180 MB
          location: 'AWS S3 us-east-1',
          progress: 45,
          errorMessage: 'Network timeout during transfer'
        }
      ];

      const metrics: StorageMetrics = {
        totalBackups: mockBackups.length,
        totalSize: mockBackups.reduce((sum, backup) => sum + backup.size, 0),
        availableSpace: 1024 * 1024 * 1024 * 100, // 100 GB
        lastBackupDate: mockBackups[0]?.endTime || mockBackups[0]?.startTime || '',
        retentionPolicy: 30,
        compressionRatio: 0.35
      };

      setBackups(mockBackups);
      setStorageMetrics(metrics);
    } catch (error) {
      console.error('Error fetching backup status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch backup status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerManualBackup = async () => {
    setTriggeringBackup(true);
    try {
      // In real implementation, this would trigger your backup system
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Backup Initiated",
        description: "Manual backup has been started successfully",
      });
      
      // Refresh backup status
      await fetchBackupStatus();
    } catch (error) {
      console.error('Error triggering backup:', error);
      toast({
        title: "Error",
        description: "Failed to initiate backup",
        variant: "destructive",
      });
    } finally {
      setTriggeringBackup(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (startTime: string, endTime?: string): string => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60); // minutes
    
    if (duration < 60) return `${duration}m`;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      case 'scheduled': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading backup status..." />;
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageMetrics.totalBackups}</div>
            <p className="text-xs text-muted-foreground">Active backups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(storageMetrics.totalSize)}</div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(storageMetrics.availableSpace)} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storageMetrics.lastBackupDate 
                ? new Date(storageMetrics.lastBackupDate).toLocaleDateString()
                : 'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">Most recent backup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compression</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(storageMetrics.compressionRatio * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Space savings</p>
          </CardContent>
        </Card>
      </div>

      {/* Backup Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Backup Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              onClick={triggerManualBackup} 
              disabled={triggeringBackup}
              className="flex items-center gap-2"
            >
              {triggeringBackup ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {triggeringBackup ? 'Starting Backup...' : 'Start Manual Backup'}
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Latest
            </Button>
            
            <Button variant="outline" onClick={fetchBackupStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Backup Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backups.map((backup) => (
              <div key={backup.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(backup.status)}
                    <div>
                      <h4 className="font-medium capitalize">
                        {backup.type} Backup
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(backup.startTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusBadgeVariant(backup.status)}>
                      {backup.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formatBytes(backup.size)}
                    </span>
                  </div>
                </div>

                {backup.status === 'running' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{backup.progress}%</span>
                    </div>
                    <Progress value={backup.progress} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <div className="font-medium">{backup.location}</div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="font-medium">
                      {formatDuration(backup.startTime, backup.endTime)}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <div className="font-medium capitalize">{backup.type}</div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="font-medium capitalize">{backup.status}</div>
                  </div>
                </div>

                {backup.errorMessage && (
                  <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{backup.errorMessage}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};