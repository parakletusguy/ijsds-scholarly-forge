import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Users, 
  Target, 
  Brain, 
  Settings, 
  Star, 
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface MatchingCriteria {
  subjectAreaWeight: number;
  keywordSimilarity: number;
  reviewerWorkload: number;
  responseTimeHistory: number;
  conflictAvoidance: boolean;
  minimumExperience: number;
  maxReviewsPerReviewer: number;
}

interface ReviewerMatch {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  matchScore: number;
  currentWorkload: number;
  avgResponseTime: number;
  expertise: string[];
  status: 'available' | 'busy' | 'unavailable';
  conflictRisk: 'none' | 'low' | 'medium' | 'high';
}

interface AutomatedReviewerMatchingInterfaceProps {
  submissionId?: string;
  articleData?: {
    title: string;
    abstract: string;
    keywords: string[];
    subject_area: string;
  };
}

export const AutomatedReviewerMatchingInterface = ({ 
  submissionId, 
  articleData 
}: AutomatedReviewerMatchingInterfaceProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<ReviewerMatch[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [criteria, setCriteria] = useState<MatchingCriteria>({
    subjectAreaWeight: 40,
    keywordSimilarity: 30,
    reviewerWorkload: 15,
    responseTimeHistory: 15,
    conflictAvoidance: true,
    minimumExperience: 2,
    maxReviewsPerReviewer: 3
  });

  useEffect(() => {
    if (articleData) {
      findMatchingReviewers();
    }
  }, [articleData, criteria]);

  const findMatchingReviewers = async () => {
    if (!articleData) return;
    
    setLoading(true);
    try {
      // Fetch potential reviewers
      const { data: reviewers } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          affiliation,
          is_reviewer
        `)
        .eq('is_reviewer', true);

      if (!reviewers) return;

      // Simulate matching algorithm with scoring
      const scoredMatches: ReviewerMatch[] = reviewers.map(reviewer => {
        const matchScore = calculateMatchScore(reviewer, articleData, criteria);
        const currentWorkload = Math.floor(Math.random() * 5); // Mock data
        const avgResponseTime = Math.floor(Math.random() * 20) + 5; // Mock data
        const expertise = generateMockExpertise(); // Mock data
        const status = ['available', 'busy', 'unavailable'][Math.floor(Math.random() * 3)] as 'available' | 'busy' | 'unavailable';
        const conflictRisk = ['none', 'low', 'medium', 'high'][Math.floor(Math.random() * 4)] as 'none' | 'low' | 'medium' | 'high';

        return {
          id: reviewer.id,
          name: reviewer.full_name || 'Unknown',
          email: reviewer.email || '',
          affiliation: reviewer.affiliation || '',
          matchScore,
          currentWorkload,
          avgResponseTime,
          expertise,
          status,
          conflictRisk
        };
      });

      // Sort by match score and filter
      const filteredMatches = scoredMatches
        .filter(match => 
          match.status === 'available' && 
          match.currentWorkload < criteria.maxReviewsPerReviewer &&
          match.conflictRisk !== 'high'
        )
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 15);

      setMatches(filteredMatches);
    } catch (error) {
      console.error('Error finding matching reviewers:', error);
      toast({
        title: "Error",
        description: "Failed to find matching reviewers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (reviewer: any, article: any, criteria: MatchingCriteria): number => {
    // Simplified scoring algorithm
    let score = 0;
    
    // Subject area matching (mock calculation)
    const subjectScore = Math.random() * 100;
    score += (subjectScore * criteria.subjectAreaWeight) / 100;
    
    // Keyword similarity (mock calculation)
    const keywordScore = Math.random() * 100;
    score += (keywordScore * criteria.keywordSimilarity) / 100;
    
    // Workload consideration (mock calculation)
    const workloadScore = Math.random() * 100;
    score += (workloadScore * criteria.reviewerWorkload) / 100;
    
    // Response time history (mock calculation)
    const responseScore = Math.random() * 100;
    score += (responseScore * criteria.responseTimeHistory) / 100;
    
    return Math.round(score);
  };

  const generateMockExpertise = (): string[] => {
    const allExpertise = [
      'Machine Learning', 'Data Science', 'Artificial Intelligence', 
      'Computer Vision', 'Natural Language Processing', 'Robotics',
      'Software Engineering', 'Database Systems', 'Cloud Computing',
      'Cybersecurity', 'Human-Computer Interaction', 'Bioinformatics'
    ];
    const count = Math.floor(Math.random() * 4) + 1;
    return allExpertise.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  const handleReviewerSelection = (reviewerId: string) => {
    setSelectedReviewers(prev => 
      prev.includes(reviewerId)
        ? prev.filter(id => id !== reviewerId)
        : [...prev, reviewerId]
    );
  };

  const assignSelectedReviewers = async () => {
    if (!submissionId || selectedReviewers.length === 0) return;

    setLoading(true);
    try {
      // Create review assignments
      const assignments = selectedReviewers.map(reviewerId => ({
        submission_id: submissionId,
        reviewer_id: reviewerId,
        invitation_status: 'pending',
        review_round: 1,
        deadline_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
      }));

      const { error } = await supabase
        .from('reviews')
        .insert(assignments);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedReviewers.length} reviewers assigned successfully`,
      });

      setSelectedReviewers([]);
    } catch (error) {
      console.error('Error assigning reviewers:', error);
      toast({
        title: "Error",
        description: "Failed to assign reviewers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'busy': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'unavailable': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getConflictColor = (risk: string) => {
    switch (risk) {
      case 'none': return 'text-green-600';
      case 'low': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Matching Criteria Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Matching Criteria Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Subject Area Weight: {criteria.subjectAreaWeight}%</Label>
                <Slider
                  value={[criteria.subjectAreaWeight]}
                  onValueChange={([value]) => setCriteria(prev => ({ ...prev, subjectAreaWeight: value }))}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Keyword Similarity: {criteria.keywordSimilarity}%</Label>
                <Slider
                  value={[criteria.keywordSimilarity]}
                  onValueChange={([value]) => setCriteria(prev => ({ ...prev, keywordSimilarity: value }))}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Reviewer Workload: {criteria.reviewerWorkload}%</Label>
                <Slider
                  value={[criteria.reviewerWorkload]}
                  onValueChange={([value]) => setCriteria(prev => ({ ...prev, reviewerWorkload: value }))}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Response Time History: {criteria.responseTimeHistory}%</Label>
                <Slider
                  value={[criteria.responseTimeHistory]}
                  onValueChange={([value]) => setCriteria(prev => ({ ...prev, responseTimeHistory: value }))}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <Label>Conflict Avoidance</Label>
              <Switch
                checked={criteria.conflictAvoidance}
                onCheckedChange={(checked) => setCriteria(prev => ({ ...prev, conflictAvoidance: checked }))}
              />
            </div>
            
            <div>
              <Label>Min Experience (years)</Label>
              <Input
                type="number"
                value={criteria.minimumExperience}
                onChange={(e) => setCriteria(prev => ({ ...prev, minimumExperience: parseInt(e.target.value) || 0 }))}
                min="0"
                max="20"
              />
            </div>
            
            <div>
              <Label>Max Reviews per Reviewer</Label>
              <Input
                type="number"
                value={criteria.maxReviewsPerReviewer}
                onChange={(e) => setCriteria(prev => ({ ...prev, maxReviewsPerReviewer: parseInt(e.target.value) || 1 }))}
                min="1"
                max="10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matching Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Reviewer Matches
            {selectedReviewers.length > 0 && (
              <Badge variant="secondary">
                {selectedReviewers.length} selected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner text="Finding matching reviewers..." />
          ) : (
            <div className="space-y-4">
              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting the matching criteria or ensure article data is provided
                  </p>
                </div>
              ) : (
                matches.map((match) => (
                  <div
                    key={match.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReviewers.includes(match.id) 
                        ? 'border-primary bg-muted/50' 
                        : 'border-border hover:bg-muted/25'
                    }`}
                    onClick={() => handleReviewerSelection(match.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{match.name}</h4>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {match.matchScore}% match
                          </Badge>
                          {getStatusIcon(match.status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {match.affiliation}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {match.expertise.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Workload:</span>
                            <span className="ml-1 font-medium">{match.currentWorkload} reviews</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Response:</span>
                            <span className="ml-1 font-medium">{match.avgResponseTime} days</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Conflict Risk:</span>
                            <span className={`ml-1 font-medium ${getConflictColor(match.conflictRisk)}`}>
                              {match.conflictRisk}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {selectedReviewers.length > 0 && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={assignSelectedReviewers} disabled={loading}>
                    <Target className="h-4 w-4 mr-2" />
                    Assign {selectedReviewers.length} Reviewer(s)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedReviewers([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};