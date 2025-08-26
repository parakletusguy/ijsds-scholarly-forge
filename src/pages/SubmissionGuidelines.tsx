import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, FileText, Users, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";


export const SubmissionGuidelines = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col">
            <div className="relative py-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="mb-4 absolute top-1 left-3"
                    >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Submission Guidelines</h1>
            <p className="text-xl text-muted-foreground">
              Guidelines for authors submitting to the International Journal for Social Work and Development Studies
            </p>
          </div>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Article Types</CardTitle>
                </div>
                <CardDescription>
                  We accept the following types of submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Original Research Articles</h4>
                      <p className="text-sm text-muted-foreground">6,000-8,000 words including references</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Review Articles</h4>
                      <p className="text-sm text-muted-foreground">4,000-6,000 words including references</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Case Studies</h4>
                      <p className="text-sm text-muted-foreground">3,000-4,000 words including references</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Short Communications</h4>
                      <p className="text-sm text-muted-foreground">1,500-2,500 words including references</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manuscript Preparation</CardTitle>
                <CardDescription>
                  Format requirements for submission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">General Format</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Double-spaced throughout</li>
                      <li>• 12-point Times New Roman font</li>
                      <li>• 1-inch margins on all sides</li>
                      <li>• Page numbers in the top right corner</li>
                      <li>• Line numbers for review purposes</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Manuscript Structure</h4>
                    <ol className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>1. Title Page (with author information)</li>
                      <li>2. Abstract (250-300 words)</li>
                      <li>3. Keywords (5-7 keywords)</li>
                      <li>4. Main Text (Introduction, Methods, Results, Discussion)</li>
                      <li>5. Conclusion</li>
                      <li>6. References (APA 7th edition style)</li>
                      <li>7. Tables and Figures (if applicable)</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Author Guidelines</CardTitle>
                </div>
                <CardDescription>
                  Requirements for authorship and contributions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">Authorship Criteria</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      All authors must meet the following criteria:
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Substantial contribution to conception and design, or analysis and interpretation</li>
                      <li>• Drafting the article or revising it critically for important content</li>
                      <li>• Final approval of the version to be published</li>
                      <li>• Agreement to be accountable for all aspects of the work</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Required Information</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Full name and institutional affiliation</li>
                      <li>• Email address for correspondence</li>
                      <li>• ORCID ID (strongly recommended)</li>
                      <li>• Conflict of interest statement</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle>Submission Process</CardTitle>
                </div>
                <CardDescription>
                  Step-by-step submission workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Create Account</h4>
                      <p className="text-sm text-muted-foreground">Register on our submission platform</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Prepare Manuscript</h4>
                      <p className="text-sm text-muted-foreground">Format according to guidelines</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Submit Online</h4>
                      <p className="text-sm text-muted-foreground">Upload files and complete submission form</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">Editorial Review</h4>
                      <p className="text-sm text-muted-foreground">Initial assessment by editorial team</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold">Peer Review</h4>
                      <p className="text-sm text-muted-foreground">Double-blind review by experts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      6
                    </div>
                    <div>
                      <h4 className="font-semibold">Decision & Publication</h4>
                      <p className="text-sm text-muted-foreground">Final decision and production process</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ethical Considerations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• All research involving human participants must have ethical approval</li>
                  <li>• Informed consent must be obtained from participants</li>
                  <li>• Plagiarism and self-plagiarism are strictly prohibited</li>
                  <li>• Data fabrication or falsification will result in rejection</li>
                  <li>• Conflicts of interest must be declared</li>
                  <li>• Previous publication elsewhere must be disclosed</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};