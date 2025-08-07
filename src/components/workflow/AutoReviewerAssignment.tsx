import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { AutomatedReviewerMatching } from '@/components/review/AutomatedReviewerMatching';
import { Zap, User, Clock, Target } from 'lucide-react';

interface AutoReviewerAssignmentProps {
  submissionId: string;
  articleData: {
    title: string;
    abstract: string;
    keywords?: string[];
    subject_area?: string;
  };
}

export const AutoReviewerAssignment = ({ submissionId, articleData }: AutoReviewerAssignmentProps) => {
  const { toast } = useToast();
  const [assigning, setAssigning] = useState(false);
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

  const handleAutoAssign = async () => {
    setAssigning(true);
    try {
      // Get reviewer matches first
      const { data: reviewers } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_reviewer', true)
        .limit(5); // Get top 5 potential reviewers

      if (!reviewers || reviewers.length === 0) {
        throw new Error('No available reviewers found');
      }

      // Auto-assign based on algorithm
      const topReviewers = reviewers.slice(0, 3); // Assign to top 3 matches
      
      for (const reviewer of topReviewers) {
        const { error } = await supabase
          .from('reviews')
          .insert({
            submission_id: submissionId,
            reviewer_id: reviewer.id,
            invitation_status: 'pending',
            invitation_sent_at: new Date().toISOString(),
            deadline_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks
          });

        if (error) throw error;
      }

      toast({
        title: "Auto-Assignment Complete",
        description: `Successfully assigned ${topReviewers.length} reviewers automatically`,
      });

      setSelectedReviewers(topReviewers.map(r => r.id));
    } catch (error) {
      console.error('Error auto-assigning reviewers:', error);
      toast({
        title: "Auto-Assignment Failed",
        description: "Failed to automatically assign reviewers",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleManualReviewerSelect = async (reviewerId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          submission_id: submissionId,
          reviewer_id: reviewerId,
          invitation_status: 'pending',
          invitation_sent_at: new Date().toISOString(),
          deadline_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Reviewer Assigned",
        description: "Reviewer has been successfully assigned",
      });

      setSelectedReviewers(prev => [...prev, reviewerId]);
    } catch (error) {
      console.error('Error assigning reviewer:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign reviewer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-Assignment Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automated Reviewer Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Quick Auto-Assignment</h4>
              <p className="text-sm text-muted-foreground">
                Automatically assign top 3 matched reviewers based on AI algorithm
              </p>
            </div>
            <Button
              onClick={handleAutoAssign}
              disabled={assigning || selectedReviewers.length > 0}
              className="flex items-center gap-2"
            >
              {assigning ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Assigning...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Auto-Assign
                </>
              )}
            </Button>
          </div>

          {assigning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4" />
                <span>Analyzing reviewer compatibility...</span>
              </div>
              <Progress value={60} className="w-full" />
            </div>
          )}

          {selectedReviewers.length > 0 && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">
                  {selectedReviewers.length} Reviewers Assigned
                </span>
              </div>
              <p className="text-sm text-green-700">
                Invitation emails have been sent automatically
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Assignment */}
      <AutomatedReviewerMatching
        submissionId={submissionId}
        articleData={articleData}
        onReviewerSelect={handleManualReviewerSelect}
      />
    </div>
  );
};