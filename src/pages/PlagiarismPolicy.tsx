import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertTriangle, Shield, Search, BookOpen, FileText, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PlagiarismPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Plagiarism Policy</h1>
            <p className="text-lg text-muted-foreground">
              International Journal of Social Work and Development Studies (IJSDS)
            </p>
          </div>

          <Separator />

          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Our Commitment to Academic Integrity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The International Journal of Social Work and Development Studies (IJSDS) is committed to 
                upholding the highest standards of academic integrity and ethical publishing. We have a 
                zero-tolerance policy toward plagiarism in all its forms. All submitted manuscripts undergo 
                rigorous plagiarism detection before peer review.
              </p>
            </CardContent>
          </Card>

          {/* What is Plagiarism */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                What is Plagiarism?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Plagiarism is the practice of presenting someone else's work, ideas, or expressions as 
                your own without proper acknowledgment. This includes:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• Copying text, data, or ideas from published or unpublished sources without citation</li>
                <li>• Paraphrasing content from other sources without proper attribution</li>
                <li>• Using figures, tables, or images from other publications without permission and citation</li>
                <li>• Presenting collaborative work as solely your own</li>
                <li>• Submitting previously published work without disclosure (self-plagiarism)</li>
                <li>• Using AI-generated content without proper disclosure and attribution</li>
              </ul>
            </CardContent>
          </Card>

          {/* Types of Plagiarism */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Types of Plagiarism
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Direct Plagiarism</h4>
                  <p className="text-sm text-muted-foreground">
                    Word-for-word copying of another author's work without quotation marks or citation.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Self-Plagiarism</h4>
                  <p className="text-sm text-muted-foreground">
                    Republishing one's own previously published work or submitting the same manuscript 
                    to multiple journals simultaneously without disclosure.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Mosaic Plagiarism</h4>
                  <p className="text-sm text-muted-foreground">
                    Mixing copied phrases from various sources with your own words without proper citation.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Paraphrasing Plagiarism</h4>
                  <p className="text-sm text-muted-foreground">
                    Rephrasing someone else's ideas without giving appropriate credit.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Accidental Plagiarism</h4>
                  <p className="text-sm text-muted-foreground">
                    Unintentional failure to cite sources properly or misquoting sources. Note: Intent 
                    does not excuse plagiarism.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detection Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Plagiarism Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                IJSDS employs rigorous manual methods to detect plagiarism:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• Thorough manual review by editors and peer reviewers</li>
                <li>• Cross-referencing with published literature databases</li>
                <li>• Careful examination of citations and references</li>
                <li>• Comparison with existing research in the field</li>
              </ul>
            </CardContent>
          </Card>

          {/* Consequences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-destructive" />
                Consequences of Plagiarism
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If plagiarism is detected at any stage, IJSDS will take the following actions:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Before Publication:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• Immediate rejection of the manuscript</li>
                    <li>• Notification to all co-authors</li>
                    <li>• Ban from submitting to IJSDS for a minimum of 3 years</li>
                    <li>• Notification to the author's institution</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">After Publication:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• Immediate retraction of the published article</li>
                    <li>• Publication of a retraction notice</li>
                    <li>• Notification to indexing databases</li>
                    <li>• Permanent ban from publishing in IJSDS</li>
                    <li>• Report to COPE (Committee on Publication Ethics)</li>
                    <li>• Notification to the author's institution and funding bodies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Avoid Plagiarism */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                How to Avoid Plagiarism
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Authors can avoid plagiarism by following these best practices:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• Always cite sources properly using the journal's required citation style (APA 7th edition)</li>
                <li>• Use quotation marks for direct quotes and provide page numbers</li>
                <li>• Paraphrase properly by completely rewriting ideas in your own words, not just changing a few words</li>
                <li>• Keep detailed notes of sources during your research</li>
                <li>• Disclose any previous publications or related manuscripts</li>
                <li>• Obtain permission for reusing copyrighted materials</li>
                <li>• Clearly indicate when using AI assistance in writing</li>
              </ul>
            </CardContent>
          </Card>

          {/* Citation Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Proper Citation Guidelines</CardTitle>
              <CardDescription>
                All manuscripts must follow APA 7th edition citation style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• In-text citations must include author(s) and year of publication</li>
                <li>• Direct quotes must include page numbers</li>
                <li>• All in-text citations must have corresponding entries in the reference list</li>
                <li>• References must be complete and formatted correctly</li>
                <li>• Include DOI or URL for electronic sources when available</li>
              </ul>
            </CardContent>
          </Card>

          {/* Reporting Plagiarism */}
          <Card>
            <CardHeader>
              <CardTitle>Reporting Suspected Plagiarism</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                If you suspect plagiarism in any manuscript submitted to or published by IJSDS, 
                please report it confidentially to:
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Email: editor.ijsds@gmail.com</p>
                <p>Subject: Plagiarism Report</p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                All reports will be investigated thoroughly and handled with strict confidentiality.
              </p>
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <a href="https://publicationethics.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Committee on Publication Ethics (COPE)</a></li>
                <li>• <a href="/submission-guidelines" className="text-primary hover:underline">IJSDS Submission Guidelines</a></li>
                <li>• <a href="/copyright" className="text-primary hover:underline">Copyright Notice</a></li>
                <li>• <a href="/peer-review" className="text-primary hover:underline">Peer Review Process</a></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlagiarismPolicy;
