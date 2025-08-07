import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/hooks/use-toast';
import { History, User, Calendar } from 'lucide-react';

interface DecisionRecord {
  id: string;
  decision_type: string;
  created_at: string;
  decision_rationale: string;
  editor_id: string;
  editor_name?: string;
}

interface DecisionHistoryDisplayProps {
  submissionId: string;
}

export const DecisionHistoryDisplay = ({ submissionId }: DecisionHistoryDisplayProps) => {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecisionHistory();
  }, [submissionId]);

  const fetchDecisionHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('editorial_decisions')
        .select(`
          id,
          decision_type,
          created_at,
          decision_rationale,
          editor_id
        `)
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch editor names separately
      if (data && data.length > 0) {
        const editorIds = [...new Set(data.map(d => d.editor_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', editorIds);
        
        const profilesMap = new Map(profilesData?.map(p => [p.id, p.full_name]) || []);
        const decisionsWithNames = data.map(decision => ({
          ...decision,
          editor_name: profilesMap.get(decision.editor_id) || 'Unknown Editor'
        }));
        
        setDecisions(decisionsWithNames);
      } else {
        setDecisions([]);
      }
    } catch (error) {
      console.error('Error fetching decision history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load decision history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (decisionType: string) => {
    switch (decisionType) {
      case 'accept':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reject':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'revision_requested':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Decision History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Loading decision history..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Decision History
        </CardTitle>
        <CardDescription>
          Track of all editorial decisions made on this submission
        </CardDescription>
      </CardHeader>
      <CardContent>
        {decisions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No editorial decisions recorded yet
          </p>
        ) : (
          <div className="space-y-4">
            {decisions.map((decision, index) => (
              <div
                key={decision.id}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge className={getDecisionColor(decision.decision_type)}>
                    {decision.decision_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(decision.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Decided by: {decision.editor_name}</span>
                </div>
                
                {decision.decision_rationale && (
                  <div className="bg-muted/50 rounded p-3">
                    <p className="text-sm leading-relaxed">{decision.decision_rationale}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};