import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


const EditorialBoard = () => {
  const boardMembers = [
    { name: "Dr. Mina Margaret Ogbanga", role: "Editor-in-Chief", isChief: true },
    { name: "Professor Okon Godwin", role: "Editorial Board Member" },
    { name: "Professor Margaret Akpomi", role: "Editorial Board Member" },
    { name: "Professor Margaret Adamek", role: "Editorial Board Member" },
    { name: "Professor Shashikant Nishant Sharma", role: "Editorial Board Member" },
    { name: "Professor Godspower J. Irikana", role: "Editorial Board Member" },
    { name: "Professor Uzoma Okoye", role: "Editorial Board Member" },
    { name: "Professor Onyeama", role: "Editorial Board Member" },
    { name: "Professor Uranta Daniel", role: "Editorial Board Member" },
    { name: "Professor T. Adolphus", role: "Editorial Board Member" },
  ];
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-4 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Editorial Board
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

      {/* Editorial Board Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="text-lg text-muted-foreground text-center">
              Our distinguished editorial board comprises leading experts in social work and development studies from around the world.
            </p>
          </div>

          {/* Editor-in-Chief */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">Editor-in-Chief</h2>
            {boardMembers
              .filter(member => member.isChief)
              .map((member, index) => (
                <Card key={index} className="mb-4 border-primary/20 bg-primary/5">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <CardTitle className="text-sm"><a href="https://minaogbanga.com">www.minaogbanga.com </a></CardTitle>
                    <Badge variant="default" className="mx-auto">{member.role}</Badge>
                  </CardHeader>
                </Card>
              ))}
          </div>

          {/* Editorial Board Members */}
          <div>
            <h2 className="text-2xl font-semibold mb-8 text-center">Editorial Board Members</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boardMembers
                .filter(member => !member.isChief)
                .map((member, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <Badge variant="secondary" className="mx-auto">{member.role}</Badge>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  The editorial board ensures the highest standards of academic excellence and integrity in all published research.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditorialBoard;