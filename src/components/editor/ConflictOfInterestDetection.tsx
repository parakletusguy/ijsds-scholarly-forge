import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, XCircle, Users } from 'lucide-react';

interface ConflictCheck {
  reviewer_id: string;
  reviewer_name: string;
  reviewer_email: string;
  reviewer_affiliation?: string;
  conflicts: string[];
  risk_level: 'low' | 'medium' | 'high';
}

interface ConflictOfInterestDetectionProps {
  submissionId: string;
  articleData: {
    authors: any[];
    corresponding_author_email: string;
    title: string;
    keywords?: string[];
  };
}

export const ConflictOfInterestDetection = ({ 
  submissionId, 
  articleData 
}: ConflictOfInterestDetectionProps) => {
  const { toast } = useToast();
  const [conflicts, setConflicts] = useState<ConflictCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkConflictsOfInterest();
  }, [submissionId]);

  const checkConflictsOfInterest = async () => {
    setLoading(true);
    try {
      // Get all potential reviewers
      const { data: reviewers, error: reviewersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_reviewer', true);

      if (reviewersError) throw reviewersError;

      const conflictChecks: ConflictCheck[] = [];

      for (const reviewer of reviewers || []) {
        const conflicts: string[] = [];
        let riskLevel: 'low' | 'medium' | 'high' = 'low';

        // Check email domain conflicts
        const reviewerDomain = reviewer.email?.split('@')[1];
        const authorDomains = articleData.authors
          .map(author => author.email?.split('@')[1])
          .filter(Boolean);

        if (authorDomains.includes(reviewerDomain)) {
          conflicts.push('Same institutional email domain');
          riskLevel = 'high';
        }

        // Check direct author match
        const authorEmails = articleData.authors.map(author => author.email?.toLowerCase());
        if (authorEmails.includes(reviewer.email?.toLowerCase())) {
          conflicts.push('Reviewer is an author');
          riskLevel = 'high';
        }

        // Check affiliation conflicts
        if (reviewer.affiliation) {
          const reviewerAffiliationWords = reviewer.affiliation.toLowerCase().split(/\s+/);
          for (const author of articleData.authors) {
            if (author.affiliation) {
              const authorAffiliationWords = author.affiliation.toLowerCase().split(/\s+/);
              const commonWords = reviewerAffiliationWords.filter(word => 
                authorAffiliationWords.includes(word) && word.length > 3
              );
              if (commonWords.length >= 2) {
                conflicts.push(`Similar affiliation to ${author.name}`);
                if (riskLevel === 'low') riskLevel = 'medium';
              }
            }
          }
        }

        // Check previous reviews for same authors
        const { data: previousReviews } = await supabase
          .from('reviews')
          .select(`
            *,
            submission:submissions(
              article:articles(corresponding_author_email, authors)
            )
          `)
          .eq('reviewer_id', reviewer.id);

        if (previousReviews) {
          for (const review of previousReviews) {
            const submission = review.submission as any;
            if (submission?.article) {
              const prevAuthors = submission.article.authors || [];
              const hasCommonAuthor = prevAuthors.some((prevAuthor: any) =>
                articleData.authors.some(currentAuthor => 
                  currentAuthor.email === prevAuthor.email
                )
              );
              if (hasCommonAuthor) {
                conflicts.push('Previously reviewed work by same authors');
                if (riskLevel === 'low') riskLevel = 'medium';
              }
            }
          }
        }

        conflictChecks.push({
          reviewer_id: reviewer.id,
          reviewer_name: reviewer.full_name || 'Unknown',
          reviewer_email: reviewer.email || '',
          reviewer_affiliation: reviewer.affiliation,
          conflicts,
          risk_level: riskLevel,
        });
      }

      setConflicts(conflictChecks);
    } catch (error) {
      console.error('Error checking conflicts:', error);
      toast({
        title: "Error",
        description: "Failed to check conflicts of interest",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const highRiskReviewers = conflicts.filter(c => c.risk_level === 'high');
  const mediumRiskReviewers = conflicts.filter(c => c.risk_level === 'medium');
  const lowRiskReviewers = conflicts.filter(c => c.risk_level === 'low');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Conflict of Interest Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {highRiskReviewers.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {highRiskReviewers.length} reviewers have high-risk conflicts of interest and should not be assigned.
                </AlertDescription>
              </Alert>
            )}

            {mediumRiskReviewers.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {mediumRiskReviewers.length} reviewers have potential conflicts that should be carefully considered.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              {conflicts
                .sort((a, b) => {
                  const riskOrder = { high: 3, medium: 2, low: 1 };
                  return riskOrder[b.risk_level] - riskOrder[a.risk_level];
                })
                .map((conflict) => (
                  <div
                    key={conflict.reviewer_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getRiskIcon(conflict.risk_level)}
                        <span className="font-medium">{conflict.reviewer_name}</span>
                        <Badge variant={getRiskBadgeVariant(conflict.risk_level) as any}>
                          {conflict.risk_level} risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {conflict.reviewer_email}
                      </p>
                      {conflict.reviewer_affiliation && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {conflict.reviewer_affiliation}
                        </p>
                      )}
                      {conflict.conflicts.length > 0 ? (
                        <div className="space-y-1">
                          {conflict.conflicts.map((conflictDesc, index) => (
                            <p key={index} className="text-xs text-destructive">
                              • {conflictDesc}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-success">No conflicts detected</p>
                      )}
                    </div>
                    <Button
                      variant={conflict.risk_level === 'high' ? 'destructive' : 'outline'}
                      size="sm"
                      disabled={conflict.risk_level === 'high'}
                    >
                      {conflict.risk_level === 'high' ? 'Not Suitable' : 'Consider'}
                    </Button>
                  </div>
                ))}
            </div>

            <Button
              variant="outline"
              onClick={checkConflictsOfInterest}
              disabled={checking}
              className="w-full"
            >
              {checking ? 'Rechecking...' : 'Recheck Conflicts'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};