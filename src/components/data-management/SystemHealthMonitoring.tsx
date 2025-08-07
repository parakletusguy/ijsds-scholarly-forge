import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Zap
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
  icon: any;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  responseTime: number;
  lastCheck: string;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  metrics: SystemMetric[];
  services: ServiceStatus[];
  lastUpdated: string;
}

export const SystemHealthMonitoring = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'healthy',
    metrics: [],
    services: [],
    lastUpdated: ''
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSystemHealth();
    // Set up polling for real-time updates
    const interval = setInterval(fetchSystemHealth, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      if (loading) setLoading(true);
      if (!loading) setRefreshing(true);

      // Generate mock system health data (in real implementation, this would come from monitoring APIs)
      const metrics: SystemMetric[] = [
        {
          name: 'CPU Usage',
          value: Math.random() * 30 + 40, // 40-70%
          unit: '%',
          status: 'healthy',
          threshold: 80,
          icon: Cpu
        },
        {
          name: 'Memory Usage',
          value: Math.random() * 25 + 50, // 50-75%
          unit: '%',
          status: 'healthy',
          threshold: 85,
          icon: MemoryStick
        },
        {
          name: 'Disk Usage',
          value: Math.random() * 20 + 60, // 60-80%
          unit: '%',
          status: 'warning',
          threshold: 90,
          icon: HardDrive
        },
        {
          name: 'Database Connections',
          value: Math.random() * 50 + 100, // 100-150
          unit: 'connections',
          status: 'healthy',
          threshold: 200,
          icon: Database
        },
        {
          name: 'API Response Time',
          value: Math.random() * 200 + 150, // 150-350ms
          unit: 'ms',
          status: 'healthy',
          threshold: 1000,
          icon: Zap
        },
        {
          name: 'Active Sessions',
          value: Math.random() * 100 + 50, // 50-150
          unit: 'sessions',
          status: 'healthy',
          threshold: 500,
          icon: Activity
        }
      ];

      // Update status based on thresholds
      metrics.forEach(metric => {
        const utilizationPercent = (metric.value / metric.threshold) * 100;
        if (utilizationPercent >= 90) metric.status = 'critical';
        else if (utilizationPercent >= 70) metric.status = 'warning';
        else metric.status = 'healthy';
      });

      const services: ServiceStatus[] = [
        {
          name: 'Web Application',
          status: 'online',
          uptime: 99.9,
          responseTime: Math.random() * 100 + 50,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'Database Server',
          status: 'online',
          uptime: 99.8,
          responseTime: Math.random() * 50 + 25,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'File Storage',
          status: 'online',
          uptime: 99.7,
          responseTime: Math.random() * 200 + 100,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'Email Service',
          status: Math.random() > 0.1 ? 'online' : 'degraded',
          uptime: 99.5,
          responseTime: Math.random() * 500 + 200,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'Search Index',
          status: 'online',
          uptime: 99.6,
          responseTime: Math.random() * 150 + 75,
          lastCheck: new Date().toISOString()
        }
      ];

      // Determine overall health
      const criticalCount = metrics.filter(m => m.status === 'critical').length;
      const warningCount = metrics.filter(m => m.status === 'warning').length;
      const offlineServices = services.filter(s => s.status === 'offline').length;
      const degradedServices = services.filter(s => s.status === 'degraded').length;

      let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (criticalCount > 0 || offlineServices > 0) overall = 'critical';
      else if (warningCount > 1 || degradedServices > 0) overall = 'warning';

      setSystemHealth({
        overall,
        metrics,
        services,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system health data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
      case 'offline':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'default';
      case 'warning':
      case 'degraded':
        return 'secondary';
      case 'critical':
      case 'offline':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading system health data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Overview
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchSystemHealth}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(systemHealth.overall)}
              <div>
                <h3 className="font-medium capitalize">System Status: {systemHealth.overall}</h3>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(systemHealth.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge variant={getStatusBadgeVariant(systemHealth.overall)} className="capitalize">
              {systemHealth.overall}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemHealth.metrics.map((metric) => {
              const IconComponent = metric.icon;
              const utilizationPercent = (metric.value / metric.threshold) * 100;
              
              return (
                <div key={metric.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{metric.name}</span>
                    </div>
                    {getStatusIcon(metric.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: {metric.value.toFixed(1)} {metric.unit}</span>
                      <span className={getStatusColor(metric.status)}>
                        {utilizationPercent.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={utilizationPercent} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      Threshold: {metric.threshold} {metric.unit}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Service Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemHealth.services.map((service) => (
              <div key={service.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Last checked: {new Date(service.lastCheck).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{service.uptime}%</div>
                      <div className="text-xs text-muted-foreground">uptime</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{service.responseTime.toFixed(0)}ms</div>
                      <div className="text-xs text-muted-foreground">response</div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(service.status)} className="capitalize">
                      {service.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Run Health Check
            </Button>
            <Button variant="outline">
              <Wifi className="h-4 w-4 mr-2" />
              Test Connectivity
            </Button>
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              View Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};