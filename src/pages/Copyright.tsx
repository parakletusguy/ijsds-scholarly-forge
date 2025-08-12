import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";



const Copyright = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-4 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Copyright Notice
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            International Journal of Social Work and Development Studies
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
      </section>

      {/* Copyright Notice Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Creative Commons Attribution License 4.0</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                The International Journal of Social Work and Development Studies operates under a Creative Commons Attribution License 4.0. This license allows authors to retain copyright of their work while granting the journal the right to publish and distribute the article.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-muted-foreground">
                      <li><strong className="text-foreground">Copyright Retention:</strong> Authors retain the copyright of their published articles.</li>
                      <li><strong className="text-foreground">License:</strong> The Creative Commons Attribution License 4.0 permits third parties to use, share, and build upon the article, provided they give appropriate credit to the original authors and the journal.</li>
                      <li><strong className="text-foreground">Permissions:</strong> Authors grant the journal a license to publish, distribute, and reproduce the article in various formats.</li>
                      <li><strong className="text-foreground">Attribution:</strong> Users of the article must provide proper attribution to the original authors and the journal.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-muted-foreground">
                      <li><strong className="text-foreground">Increased Visibility:</strong> Open access allows for broader dissemination and increased visibility of research.</li>
                      <li><strong className="text-foreground">Flexibility:</strong> The Creative Commons license enables authors to share their work widely while maintaining control over its use.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li><strong className="text-foreground">Authors:</strong> Ensure that their work does not infringe on the copyright of others and provide proper attribution when using third-party materials.</li>
                    <li><strong className="text-foreground">Journal:</strong> Ensure that all articles are properly attributed and that the Creative Commons license is clearly stated.</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="mt-8 p-6 bg-muted rounded-lg">
                <p className="text-center text-muted-foreground">
                  By adopting this copyright notice, the International Journal of Social Work and Development Studies promotes open access to knowledge while protecting the rights of authors and contributors.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Copyright;