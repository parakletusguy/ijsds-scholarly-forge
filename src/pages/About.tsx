import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Eye, Users, TrendingUp, Globe, Award, Network, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import logo from "/public/Logo_Black_Edited-removebg-preview.png"


export const About = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className=" from-primary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            {/* <BookOpen className="h-16 w-16 text-primary mr-4" /> */}
            <img src={logo} alt="IJSDS logo" className="w-56 text-primary mr-4" />

            <div className="text-left">
              <h1 className="text-5xl font-bold text-foreground mb-2">About IJSDS</h1>
              <p className="text-xl text-muted-foreground">International Journal of Social Work and Development Studies</p>
            </div>
          </div>
             {/* <Button 
                      variant="outline" 
                      onClick={() => navigate(-1)}
                      className="mb-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button> */}
          
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-muted-foreground mb-6">
              The International Journal On Social Work and Development Studies (IJSDS) is a peer-reviewed journal dedicated to advancing knowledge and practice in social work and development studies. Our aim is to provide a platform for researchers, practitioners, and policymakers to share their experiences, insights, and research findings.
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              "Empowering Communities through Research and Practice"
            </Badge>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Our vision is to become a leading international journal that showcases innovative and impactful research in social work and development studies, fostering a more equitable and just society.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Our mission is to publish high-quality, relevant, and rigorous research that contributes to the understanding and advancement of social work and development studies. We strive to provide a forum for critical discussion, debate, and reflection on the complex issues facing individuals, communities, and societies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="py-16 b">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Objectives</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Award className="h-10 w-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg">Promote Research Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Foster high-quality research in social work and development studies
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-10 w-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg">Disseminate Knowledge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Share research findings and insights with a global audience
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg">Inform Policy and Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Provide evidence-based research to inform policy and practice in social work and development studies
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Network className="h-10 w-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-lg">Encourage Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Facilitate collaboration among researchers, practitioners, and policymakers
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Expected Outcomes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Expected Outcomes and Outputs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>High-Impact Research</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Publish research that contributes to the advancement of social work and development studies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Increased Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Increase the visibility and reach of research in social work and development studies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Improved Policy and Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Inform policy and practice with evidence-based research
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Global Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Establish a global network of researchers, practitioners, and policymakers in social work and development studies
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};