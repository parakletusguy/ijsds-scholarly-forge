import { PageHeader, ContentSection } from "@/components/layout/PageElements";
import { Mail, Globe, GraduationCap, MapPin, Sparkles, Building2 } from "lucide-react";

import mina from "../images/editors/Mina.jpeg"
import ariel from "../images/editors/Ariel.jpeg"
import ukamaka from "../images/editors/Ukamaka.jpeg"
import adesope from "../images/editors/Adesope.jpeg"
import khadija from "../images/editors/Khadija.jpeg"
import adolphus from "../images/editors/Adolphus.jpeg"
import irikana from "../images/editors/irkana.jpeg"
import sharma from "../images/editors/Sharma.jpeg"
import daniel from "../images/editors/daniel.jpeg"

const EditorialBoard = () => {
  const boardMembers = [
    {
      name: "Professor Mina Magaret Ogbanga",
      role: "Editor-in-Chief",
      isChief: true,
      Designation: "Professor of Social Work",
      Institution: "Department of Social Work, River State University",
      Contact: "mina.ogbanga@ust.edu.ng",
      Website: "www.minaogbanga.com",
      image: mina
    },
    {
      name: "Professor Roberto Ariel Abeldaño Zuñiga",
      role: "Editorial Board Member",
      isChief: false,
      Designation: "Full Professor & University Lecturer",
      Institution: "University of Sierra Sur (Mexico) & University of Helsinki (Finland)",
      Education: "Ph.D. in Demography",
      Expertise: "Demography & Public Health",
      ResearchInterests: "Environment; disasters, mental health and vulnerable populations.",
      image: ariel
    },
    {
      name: "Professor Ukamaka M. Oruche",
      role: "Editorial Board Member",
      isChief: false,
      Designation: "Gordon Keller Professor of Nursing; Senior Associate Dean of Research",
      Institution: "USF Health College of Nursing",
      Education: "PhD, RN, PMHCNS-BC, FAAN",
      Location: "Tampa, FL | 33612",
      image: ukamaka
    },
    {
      name: "Professor Olufemi Martins Adesope",
      role: "Editorial Board Member",
      isChief: false,
      Designation: "Professor of Agricultural Extension and ICT",
      Institution: "University of Port Harcourt, Nigeria",
      Expertise: "Data Analyst, ICT integration, Rural Sociology.",
      image: adesope
    },
    {
      name: "Dr. Khadija Khaja",
      role: "Editorial Board Member",
      isChief: false,
      Designation: "Associate Professor",
      Institution: "School of Social Work, Indiana University, Indianapolis",
      Education: "MSW, PhD",
      Expertise: "Social Work",
      image: khadija
    },
    {
      name: "Professor T. Adolphus",
      role: "Editorial Board Member",
      isChief: false,
      Designation: "Professor",
      Institution: "Rivers State University",
      Expertise: "Science Education",
      image: adolphus
    },
    {
      name: "Professor Daniel Uranta",
      role: "Editorial Board Member",
      isChief: false,
      Designation: "Professor of Social Work and Community Development",
      Institution: "University of Port-Harcourt, Rivers State",
      Expertise: "Social Work and Community Development",
      image: daniel
    },
    {
      name: "Professor Godspower Jackson Irikana",
      role: "Editorial Board Member",
      isChief: false,
      Designation: "Professor",
      Institution: "Ignatius Ajuru University of Education (IAUE)",
      Education: "Ph.D. in Sociology of Development",
      Expertise: "Sociology of Development; External Examiner/Assessor",
      image: irikana
    },
    {
      name: "Shashikant Nishant Sharma",
      role: "Editorial Board Member",
      isChief: false,
      Designation: "Research Head",
      Institution: "Maulana Azad National Institute of Technology (Bhopal) & Track2Training",
      Expertise: "Architecture and Planning Research",
      image: sharma
    }
  ];

  const chief = boardMembers.find(m => m.isChief);
  const rest = boardMembers.filter(m => !m.isChief);
  const label = "text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400";

  return (
    <div className="min-h-screen bg-stone-50 font-body pb-24">
      <PageHeader
        title="Editorial"
        subtitle="Board"
        accent="Our Team"
        description="Our editorial board brings together experts in social work, development studies, and public policy."
      />

      {/* Editor-in-Chief */}
      {chief && (
        <ContentSection>
          <div className="bg-white border border-stone-200 flex flex-col lg:flex-row overflow-hidden">
            <div className="w-full lg:w-[380px] shrink-0 aspect-[4/5] lg:aspect-auto bg-stone-100">
              <img src={chief.image} alt={chief.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <p className={label}>Editor-in-Chief</p>
              <h2 className="font-headline text-3xl md:text-4xl text-stone-900 leading-tight mt-2 mb-4">{chief.name}</h2>
              <p className="text-stone-600 leading-relaxed">
                {chief.Designation}
                <span className="block text-stone-400 text-sm mt-1">{chief.Institution}</span>
              </p>

              <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row gap-6">
                {chief.Contact && (
                  <a href={`mailto:${chief.Contact}`} className="flex items-center gap-2.5 text-sm text-stone-600 hover:text-primary transition-colors">
                    <Mail size={15} className="text-stone-400" /> {chief.Contact}
                  </a>
                )}
                {chief.Website && (
                  <a href={`https://${chief.Website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-stone-600 hover:text-primary transition-colors">
                    <Globe size={15} className="text-stone-400" /> {chief.Website}
                  </a>
                )}
              </div>
            </div>
          </div>
        </ContentSection>
      )}

      {/* Board Members */}
      <ContentSection dark title="Board Members">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((member, idx) => (
            <div key={idx} className="bg-white border border-stone-200 flex flex-col">
              <div className="aspect-[4/5] bg-stone-100 overflow-hidden">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-headline text-lg text-stone-900 leading-snug">{member.name}</h3>
                <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">{member.Designation}</p>

                <div className="mt-5 pt-5 border-t border-stone-100 space-y-2.5 text-sm">
                  <p className="flex items-start gap-2.5 text-stone-600">
                    <Building2 size={14} className="text-stone-400 mt-0.5 shrink-0" /> {member.Institution}
                  </p>
                  {member.Education && (
                    <p className="flex items-start gap-2.5 text-stone-500">
                      <GraduationCap size={14} className="text-stone-400 mt-0.5 shrink-0" /> {member.Education}
                    </p>
                  )}
                  {member.Expertise && (
                    <p className="flex items-start gap-2.5 text-stone-500">
                      <Sparkles size={14} className="text-stone-400 mt-0.5 shrink-0" /> {member.Expertise}
                    </p>
                  )}
                  {member.Location && (
                    <p className="flex items-start gap-2.5 text-stone-500">
                      <MapPin size={14} className="text-stone-400 mt-0.5 shrink-0" /> {member.Location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ContentSection>
    </div>
  );
};

export default EditorialBoard;
