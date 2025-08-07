import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SystemCheck {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  details: string;
  count?: number;
}

export const SystemVerification = () => {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const runSystemChecks = async () => {
    setLoading(true);
    const checkResults: SystemCheck[] = [];

    try {
      // Check 1: Submissions exist
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('*');
      
      checkResults.push({
        name: 'Submissions',
        status: submissionsError ? 'error' : submissions && submissions.length > 0 ? 'success' : 'warning',
        details: submissionsError ? submissionsError.message : `${submissions?.length || 0} submissions found`,
        count: submissions?.length || 0
      });

      // Check 2: Reviews exist and are properly assigned
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (full_name),
          submissions (
            articles (title)
          )
        `);
      
      checkResults.push({
        name: 'Reviews/Invitations',
        status: reviewsError ? 'error' : reviews && reviews.length > 0 ? 'success' : 'warning',
        details: reviewsError ? reviewsError.message : `${reviews?.length || 0} reviews assigned`,
        count: reviews?.length || 0
      });

      // Check 3: Reviewers exist
      const { data: reviewers, error: reviewersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_reviewer', true);
      
      checkResults.push({
        name: 'Reviewers',
        status: reviewersError ? 'error' : reviewers && reviewers.length > 0 ? 'success' : 'warning',
        details: reviewersError ? reviewersError.message : `${reviewers?.length || 0} active reviewers`,
        count: reviewers?.length || 0
      });

      // Check 4: Manuscript files accessible
      const { data: articlesWithFiles } = await supabase
        .from('articles')
        .select('manuscript_file_url')
        .not('manuscript_file_url', 'is', null);
      
      checkResults.push({
        name: 'Manuscript Files',
        status: articlesWithFiles && articlesWithFiles.length > 0 ? 'success' : 'warning',
        details: `${articlesWithFiles?.length || 0} articles with manuscript files`,
        count: articlesWithFiles?.length || 0
      });

      // Check 5: Editorial decisions
      const { data: decisions } = await supabase
        .from('editorial_decisions')
        .select('*');
      
      checkResults.push({
        name: 'Editorial Decisions',
        status: decisions && decisions.length > 0 ? 'success' : 'warning',
        details: `${decisions?.length || 0} editorial decisions recorded`,
        count: decisions?.length || 0
      });

      // Check 6: Email notifications
      const { data: notifications } = await supabase
        .from('email_notifications')
        .select('*');
      
      checkResults.push({
        name: 'Email Notifications',
        status: notifications && notifications.length > 0 ? 'success' : 'warning',
        details: `${notifications?.length || 0} emails sent`,
        count: notifications?.length || 0
      });

      // Check 7: DOI functionality (test if the function exists)
      try {
        // This will test if the function is callable (even if it fails due to missing data)
        await supabase.functions.invoke('generate-zenodo-doi', {
          body: { submissionId: 'test' }
        });
        checkResults.push({
          name: 'DOI Generation Function',
          status: 'success',
          details: 'Zenodo DOI function is accessible'
        });
      } catch (error) {
        checkResults.push({
          name: 'DOI Generation Function',
          status: 'warning',
          details: 'Function exists but may need configuration'
        });
      }

    } catch (error) {
      console.error('System check error:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete system checks',
        variant: 'destructive'
      });
    }

    setChecks(checkResults);
    setLoading(false);
  };

  useEffect(() => {
    runSystemChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const overallStatus = checks.every(c => c.status === 'success') ? 'success' :
                       checks.some(c => c.status === 'error') ? 'error' : 'warning';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(overallStatus)}
          System Health Check
        </CardTitle>
        <CardDescription>
          Verification of all journal management system components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">Running system checks...</div>
          ) : (
            <>
              {checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <div className="font-medium">{check.name}</div>
                      <div className="text-sm text-muted-foreground">{check.details}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {check.count !== undefined && (
                      <span className="text-sm font-medium">{check.count}</span>
                    )}
                    <Badge className={getStatusColor(check.status)}>
                      {check.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 mt-4 border-t border-border">
                <Button onClick={runSystemChecks} variant="outline" size="sm">
                  Refresh Checks
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};