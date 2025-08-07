import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

interface WorkflowState {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'active' | 'pending' | 'skipped';
  duration?: string;
  dependencies?: string[];
}

interface WorkflowStateMachineProps {
  submissionId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const WORKFLOW_STATES: WorkflowState[] = [
  { id: 'submitted', name: 'Submitted', description: 'Initial submission received', status: 'completed' },
  { id: 'editorial_review', name: 'Editorial Review', description: 'Editor initial assessment', status: 'active' },
  { id: 'reviewer_assignment', name: 'Reviewer Assignment', description: 'Assign qualified reviewers', status: 'pending', dependencies: ['editorial_review'] },
  { id: 'peer_review', name: 'Peer Review', description: 'Reviewers evaluate manuscript', status: 'pending', dependencies: ['reviewer_assignment'] },
  { id: 'editorial_decision', name: 'Editorial Decision', description: 'Editor makes final decision', status: 'pending', dependencies: ['peer_review'] },
  { id: 'revision_request', name: 'Revision Request', description: 'Author revisions if needed', status: 'pending', dependencies: ['editorial_decision'] },
  { id: 'acceptance', name: 'Acceptance', description: 'Manuscript accepted for publication', status: 'pending', dependencies: ['editorial_decision'] },
  { id: 'copyediting', name: 'Copyediting', description: 'Professional copyediting', status: 'pending', dependencies: ['acceptance'] },
  { id: 'proofreading', name: 'Proofreading', description: 'Final proofreading', status: 'pending', dependencies: ['copyediting'] },
  { id: 'typesetting', name: 'Typesetting', description: 'Format for publication', status: 'pending', dependencies: ['proofreading'] },
  { id: 'published', name: 'Published', description: 'Article published', status: 'pending', dependencies: ['typesetting'] },
];

export const WorkflowStateMachine = ({ submissionId, currentStatus, onStatusChange }: WorkflowStateMachineProps) => {
  const { toast } = useToast();
  const [workflowStates, setWorkflowStates] = useState<WorkflowState[]>(WORKFLOW_STATES);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [processingTransition, setProcessingTransition] = useState(false);

  useEffect(() => {
    updateWorkflowStates();
  }, [currentStatus]);

  const updateWorkflowStates = () => {
    const statusIndex = WORKFLOW_STATES.findIndex(state => state.id === currentStatus);
    
    const updatedStates = WORKFLOW_STATES.map((state, index) => ({
      ...state,
      status: index < statusIndex ? 'completed' as const :
              index === statusIndex ? 'active' as const :
              'pending' as const
    }));

    setWorkflowStates(updatedStates);
  };

  const canTransitionTo = (targetState: WorkflowState): boolean => {
    if (!targetState.dependencies) return true;
    
    return targetState.dependencies.every(dep => {
      const depState = workflowStates.find(s => s.id === dep);
      return depState?.status === 'completed';
    });
  };

  const transitionToState = async (targetStateId: string) => {
    setProcessingTransition(true);
    try {
      // Update submission status
      const { error: submissionError } = await supabase
        .from('submissions')
        .update({ status: targetStateId })
        .eq('id', submissionId);

      if (submissionError) throw submissionError;

      // Update article status if needed
      const { data: submission } = await supabase
        .from('submissions')
        .select('article_id')
        .eq('id', submissionId)
        .single();

      if (submission?.article_id) {
        const { error: articleError } = await supabase
          .from('articles')
          .update({ status: targetStateId })
          .eq('id', submission.article_id);

        if (articleError) throw articleError;
      }

      // Log workflow transition
      await supabase
        .from('editorial_decisions')
        .insert({
          submission_id: submissionId,
          editor_id: (await supabase.auth.getUser()).data.user?.id,
          decision_type: 'workflow_transition',
          decision_rationale: `Automated transition to ${targetStateId}`,
        });

      toast({
        title: "Workflow Updated",
        description: `Successfully transitioned to ${targetStateId.replace('_', ' ')}`,
      });

      onStatusChange(targetStateId);
    } catch (error) {
      console.error('Error transitioning workflow:', error);
      toast({
        title: "Transition Failed",
        description: "Failed to update workflow state",
        variant: "destructive",
      });
    } finally {
      setProcessingTransition(false);
    }
  };

  const getNextPossibleStates = (): WorkflowState[] => {
    const currentIndex = workflowStates.findIndex(state => state.status === 'active');
    if (currentIndex === -1) return [];

    return workflowStates
      .slice(currentIndex + 1)
      .filter(state => canTransitionTo(state))
      .slice(0, 3); // Show next 3 possible states
  };

  const calculateProgress = (): number => {
    const completedStates = workflowStates.filter(state => state.status === 'completed').length;
    return (completedStates / workflowStates.length) * 100;
  };

  const getStateIcon = (state: WorkflowState) => {
    switch (state.status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'active': return <Play className="h-4 w-4 text-blue-600" />;
      default: return <Pause className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStateColor = (state: WorkflowState) => {
    switch (state.status) {
      case 'completed': return 'bg-green-100 border-green-300 text-green-800';
      case 'active': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Workflow Progress</span>
            <Badge variant="outline">
              {Math.round(calculateProgress())}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={calculateProgress()} className="mb-4" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {workflowStates.filter(s => s.status === 'completed').length} of {workflowStates.length} stages completed
            </span>
            <span>
              Current: {workflowStates.find(s => s.status === 'active')?.name || 'Unknown'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Workflow States */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflowStates.map((state, index) => (
              <div key={state.id}>
                <div className={`p-3 rounded-lg border ${getStateColor(state)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStateIcon(state)}
                      <div>
                        <h4 className="font-medium">{state.name}</h4>
                        <p className="text-sm opacity-75">{state.description}</p>
                      </div>
                    </div>
                    {state.status === 'active' && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                </div>
                {index < workflowStates.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Transitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getNextPossibleStates().map(state => (
              <div key={state.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Advance to {state.name}</h4>
                  <p className="text-sm text-muted-foreground">{state.description}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => transitionToState(state.id)}
                  disabled={processingTransition || !canTransitionTo(state)}
                >
                  {processingTransition ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  ) : (
                    'Advance'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};