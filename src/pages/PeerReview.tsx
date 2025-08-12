import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Users, Clock, CheckCircle, XCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const PeerReview = () => {
  const navigate  = useNavigate()
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Peer Review Process</h1>
            <p className="text-xl text-muted-foreground">
              Our rigorous double-blind peer review ensures the highest quality publications
            </p>
          </div>
          <Button 
                      variant="outline" 
                      onClick={() => navigate(-1)}
                      className="mb-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <CardTitle>Double-Blind Review</CardTitle>
                </div>
                <CardDescription>
                  Ensuring objectivity and fairness in the review process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Author Anonymity</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Names and affiliations removed from manuscript</li>
                      <li>• Self-citations anonymized</li>
                      <li>• Identifying information redacted</li>
                      <li>• Funding acknowledgments temporarily removed</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Reviewer Anonymity</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Reviewer identities protected</li>
                      <li>• Anonymous feedback provided</li>
                      <li>• Conflict of interest screening</li>
                      <li>• Independent review assessments</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle>Review Timeline</CardTitle>
                </div>
                <CardDescription>
                  Expected timeframes for each stage of the review process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-semibold">Initial Editorial Assessment</h4>
                        <p className="text-sm text-muted-foreground">Scope, format, and quality check</p>
                      </div>
                      <Badge variant="secondary">1-2 weeks</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-semibold">Reviewer Assignment</h4>
                        <p className="text-sm text-muted-foreground">Finding and inviting expert reviewers</p>
                      </div>
                      <Badge variant="secondary">2-3 weeks</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-semibold">Peer Review</h4>
                        <p className="text-sm text-muted-foreground">Detailed review by 2-3 experts</p>
                      </div>
                      <Badge variant="secondary">6-8 weeks</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-semibold">Editorial Decision</h4>
                        <p className="text-sm text-muted-foreground">Final decision communication</p>
                      </div>
                      <Badge variant="secondary">1-2 weeks</Badge>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-center">
                      Total Timeline: <span className="text-primary">10-15 weeks</span> from submission to decision
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Reviewer Selection</CardTitle>
                </div>
                <CardDescription>
                  How we choose qualified experts for your manuscript
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Reviewer Criteria</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• PhD or equivalent in relevant field</li>
                    <li>• Recent publications in the subject area</li>
                    <li>• No conflicts of interest with authors</li>
                    <li>• Geographic and institutional diversity</li>
                    <li>• Experience in peer review process</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Review Assignment Process</h4>
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="text-sm">Keywords and subject area matching</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="text-sm">Conflict of interest screening</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="text-sm">Reviewer invitation and confirmation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Criteria</CardTitle>
                <CardDescription>
                  Standards used to evaluate submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Scientific Merit</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Originality and novelty</li>
                      <li>• Methodological rigor</li>
                      <li>• Statistical analysis quality</li>
                      <li>• Evidence-based conclusions</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Presentation Quality</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Clear writing and organization</li>
                      <li>• Appropriate length and scope</li>
                      <li>• Figure and table quality</li>
                      <li>• Reference completeness</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Decision Categories</CardTitle>
                <CardDescription>
                  Possible outcomes of the peer review process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-green-700">Accept</h4>
                      <p className="text-sm text-muted-foreground">
                        Manuscript meets publication standards with minimal or no revisions required
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <RotateCcw className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-orange-700">Minor Revisions</h4>
                      <p className="text-sm text-muted-foreground">
                        Small changes required; re-review may not be necessary
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <RotateCcw className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-blue-700">Major Revisions</h4>
                      <p className="text-sm text-muted-foreground">
                        Significant changes required; manuscript will undergo another round of review
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-red-700">Reject</h4>
                      <p className="text-sm text-muted-foreground">
                        Manuscript does not meet publication standards or falls outside journal scope
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Reviewers</CardTitle>
                <CardDescription>
                  Information for potential and current reviewers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Reviewer Responsibilities</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• Provide constructive, detailed feedback</li>
                    <li>• Complete reviews within agreed timeframe</li>
                    <li>• Maintain confidentiality of manuscripts</li>
                    <li>• Declare any conflicts of interest</li>
                    <li>• Suggest improvements for methodology and presentation</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Recognition</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• Annual reviewer recognition program</li>
                    <li>• Certificates of appreciation</li>
                    <li>• Access to journal archives</li>
                    <li>• Invitation to editorial board consideration</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};