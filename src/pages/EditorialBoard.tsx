import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import mina from "../images/editors/Mina.jpeg"
import ariel from "../images/editors/Ariel.jpeg"
import ukamaka from "../images/editors/Ukamaka.jpeg"
import adesope from "../images/editors/Adesope.jpeg"
import khadija from "../images/editors/Khadija.jpeg"
import adolphus from "../images/editors/Adolphus.jpeg"
// import uranta from "../images/editors/"
import irikana from "../images/editors/irkana.jpeg"
import sharma from "../images/editors/Sharma.jpeg"

const EditorialBoard = () => {
  const boardMembers = [
  { 
    name: "Dr. Mina Ogbanga", 
    role: "Editor-in-Chief", 
    isChief: true,
    Designation: "Editor-in-Chief, IJSDS & Associate Professor of Social Work",
    Institution: "Department of Social Work, River State University",
    Contact: "mina.ogbanga@ust.edu.ng",
    Education: "",
    Expertise: "",
    ResearchInterests: "",
    Location: "",
    image:mina
  },
  { 
    name: "Professor Roberto Ariel Abeldaño Zuñiga", 
    role: "Editorial Board Member", 
    isChief: false,
    Designation: "Full Professor & University Lecturer",
    Institution: "University of Sierra Sur, Mexico & University of Helsinki, Finland",
    Contact: "",
    Education: "Ph.D. in Demography (National University of Córdoba, Argentina)",
    Expertise: "Demography",
    ResearchInterests: "Public health and environment; disasters, mental health and vulnerable populations; public health in disaster situations.",
    Location: "",
    image:ariel
  },
  { 
    name: "Professor Ukamaka M. Oruche", 
    role: "Editorial Board Member", 
    isChief: false,
    Designation: "Gordon Keller Professor of Nursing; Senior Associate Dean of Research and Director of the PhD Program",
    Institution: "USF Health College of Nursing",
    Contact: "orucheu@usf.edu | O: 813-396-2524",
    Education: "PhD, RN, PMHCNS-BC, FAAN",
    Expertise: "Nursing Research, PMHCNS-BC, FAAN",
    ResearchInterests: "",
    Location: "12901 Bruce B. Downs Blvd., MDC 22 | Tampa, FL | 33612",
    image:ukamaka
  },
  { 
    name: "Professor Olufemi Martins Adesope", 
    role: "Editorial Board Member", 
    isChief: false,
    Designation: "Professor of Agricultural Extension and ICT in Agriculture",
    Institution: "Department of Agricultural Extension and Development Studies, University of Port Harcourt, Nigeria",
    Contact: "",
    Education: "",
    Expertise: "Data Analyst (Quantitative & Qualitative), ICT integration, Agricultural Extension, Rural Sociology, Research Methods.",
    ResearchInterests: "",
    Location: "",
    image:adesope
  },
  { 
    name: "Dr. Khadija Khaja", 
    role: "Editorial Board Member", 
    isChief: false,
    Designation: "Associate Professor",
    Institution: "School of Social Work, Indiana University, Indianapolis",
    Contact: "kkhaja@iu.edu | 317-278-8609",
    Education: "MSW, PhD",
    Expertise: "Social Work",
    ResearchInterests: "",
    Location: "",
    image:khadija
  },
  { 
    name: "Professor T. Adolphus", 
    role: "Editorial Board Member", 
    isChief: false,
    Designation: "Professor",
    Institution: "Department of Science Education, Faculty of Education, Rivers State University",
    Contact: "",
    Education: "",
    Expertise: "Science Education",
    ResearchInterests: "",
    Location: "",
    image:adolphus
  },
  { 
    name: "Professor Daniel Uranta", 
    role: "Editorial Board Member", 
    isChief: false,
    Designation: "Professor of Social Work and Community Development",
    Institution: "University of Port-Harcourt, Rivers State",
    Contact: "",
    Education: "",
    Expertise: "Social Work and Community Development",
    ResearchInterests: "",
    Location: "",
    image:""
  },
  { 
    name: "Professor Godspower Jackson Irikana", 
    role: "Editorial Board Member", 
    isChief: false,
    Designation: "Professor",
    Institution: "Ignatius Ajuru University of Education (IAUE)",
    Contact: "",
    Education: "Ph.D. in Sociology of Development (2007); M.Sc. in Sociology of Development (2002); B.A. in Political Science and Education (1988)",
    Expertise: "Sociology of Development; External Examiner/Assessor; NUC/NCCE accreditation team member; Consultant (RSSDA, CASS, OSIWA, INEC).",
    ResearchInterests: "",
    Location: "",
    image:irikana
  },
  { 
    name: "Shashikant Nishant Sharma", 
    role: "Editorial Board Member", 
    isChief: false,
    Designation: "Research Head",
    Institution: "Department of Architecture and Planning, Maulana Azad National Institute of Technology (Bhopal, India) & Track2Training (New Delhi, India)",
    Contact: "urp2025@gmail.com",
    Education: "",
    Expertise: "Research",
    ResearchInterests: "",
    Location: "",
    image:sharma
  }
];
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
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
      <section className="py-16 px-4 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Editorial Board
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            International Journal of Social Work and Development Studies
          </p>
        </div>
     
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
                  <CardHeader className="text-center flex flex-col items-center">
                    <div className="w-[200px] rounded-lg overflow-hidden p-[6px] bg-gray-400 shadow-gray-600 shadow-lg">
                      {member.image && <img src={member.image} alt="Editor Image" className="w-[100%]" />}
                    </div>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <CardTitle className="text-sm"><a href="https://minaogbanga.com">www.minaogbanga.com </a></CardTitle>
                    <Badge variant="default" className="mx-auto">{member.role}</Badge>
                  <CardContent className="gap-3">
{member.Designation && <p className="text-[12px] py-1" >Designation: <span className="font-bold">{member.Designation}</span> </p>
}
{member.Institution && <p className="text-[12px] py-1" >Institution: <span className="font-bold">{member.Institution}</span> </p>
}
{member.Contact && <p className="text-[12px] py-1" >Contact: <span className="font-bold">{member.Contact}</span> </p>
}
{member.Education && <p className="text-[12px] py-1" >Education: <span className="font-bold">{member.Education}</span> </p>
}
{member.Expertise && <p className="text-[12px] py-1" >Expertise: <span className="font-bold">{member.Expertise}</span> </p>
}
{member.ResearchInterests && <p className="text-[12px] py-1" >Research Interests: <span className="font-bold">{member.ResearchInterests}</span> </p>
}
{member.Location && <p className="text-[12px] py-1" >Location: <span className="font-bold">{member.Location}</span> </p>
}
                    </CardContent>
                  </CardHeader>
                </Card>
              ))}
          </div>

          {/* Editorial Board Members */}
          <div>
            <h2 className="text-2xl font-semibold mb-8 text-center">Editorial Board Members</h2>
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
              {boardMembers
                .filter(member => !member.isChief)
                .map((member, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-col items-center">
                      <div className="w-[250px] rounded-lg overflow-hidden p-[5px] bg-gray-400 shadow-gray-600 flex flex-row items-center justify-center max-h-[250px]  ">
                      {member.image && <img src={member.image} alt="Editor Image" className="w-[100%]" />}
                    </div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <Badge variant="secondary" className="mx-auto">{member.role}</Badge>
                    </CardHeader>
                    <CardContent className="gap-3">
{member.Designation && <p className="text-[12px] py-1" >Designation: <span className="font-bold">{member.Designation}</span> </p>
}
{member.Institution && <p className="text-[12px] py-1" >Institution: <span className="font-bold">{member.Institution}</span> </p>
}
{member.Contact && <p className="text-[12px] py-1" >Contact: <span className="font-bold">{member.Contact}</span> </p>
}
{member.Education && <p className="text-[12px] py-1" >Education: <span className="font-bold">{member.Education}</span> </p>
}
{member.Expertise && <p className="text-[12px] py-1" >Expertise: <span className="font-bold">{member.Expertise}</span> </p>
}
{member.ResearchInterests && <p className="text-[12px] py-1" >Research Interests: <span className="font-bold">{member.ResearchInterests}</span> </p>
}
{member.Location && <p className="text-[12px] py-1" >Location: <span className="font-bold">{member.Location}</span> </p>
}
                    </CardContent>
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