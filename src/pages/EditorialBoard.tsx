import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, ContentSection } from "@/components/layout/PageElements";
import { User, Mail, GraduationCap, MapPin, Search, Globe, Award, BookOpen, ShieldCheck } from "lucide-react";

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

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <PageHeader 
        title="Scholarly" 
        subtitle="Leadership" 
        accent="Excellence & Vision"
        description="Our distinguished editorial board comprises globally recognized experts in social work, development studies, and public policy, dedicated to the highest standards of academic integrity and African development."
      />

      {/* Editor-in-Chief Highlight — Premium Leadership Spotlight */}
      {chief && (
        <ContentSection>
          <div className="relative group">
            {/* Dramatic Background Motif */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 -z-10 translate-x-20 -translate-y-20 opacity-40" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 -z-10 -translate-x-10 translate-y-10 rounded-full blur-2xl"></div>
            
            <div className="bg-white border border-border/20 p-10 md:p-20 flex flex-col lg:flex-row gap-16 lg:items-center relative z-10 shadow-2xl overflow-hidden">
               {/* Afrocentric Corner Accent */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 transition-transform group-hover:scale-110" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
               
               <div className="w-full lg:w-[450px] shrink-0 relative order-2 lg:order-1">
                  <div className="absolute inset-0 border-[10px] border-secondary -translate-x-6 translate-y-6 opacity-20 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000"></div>
                  <div className="aspect-[4/5] bg-muted overflow-hidden border border-border/20 shadow-2xl relative">
                    <img src={chief.image} alt={chief.name} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 right-0 bg-foreground/90 backdrop-blur-md p-6 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-700">
                        <p className="font-headline font-black text-[10px] uppercase tracking-[0.3em] mb-1">Established 2025</p>
                        <p className="font-body text-xs italic text-white/50">"Leading the Charge for Scholarly Transformation in Africa."</p>
                    </div>
                  </div>
               </div>

               <div className="flex-grow order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-0.5 w-16 bg-primary"></div>
                     <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-secondary">Chief Leadership</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-7xl font-black font-headline text-foreground leading-[0.85] mb-8 uppercase tracking-tighter w-full lg:max-w-2xl">
                    {chief.name}
                  </h2>
                  
                  <div className="space-y-6 mb-12">
                     <p className="text-2xl md:text-3xl font-body italic text-foreground/40 leading-relaxed max-w-3xl">
                        {chief.Designation} — <span className="text-foreground/80 font-headline font-black uppercase text-xl leading-relaxed tracking-tight">{chief.Institution}</span>
                     </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/10">
                    <div className="group/link flex items-center gap-6 p-6 bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 hover:border-secondary/20 transition-all cursor-pointer">
                      <div className="w-14 h-14 bg-white shadow-xl flex items-center justify-center shrink-0 border border-secondary/5 group-hover/link:rotate-12 transition-transform">
                        <Mail className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/40 mb-1">Archival Correspondence</p>
                        <a href={`mailto:${chief.Contact}`} className="font-headline font-bold text-sm text-foreground hover:text-primary transition-colors tracking-tight leading-none">{chief.Contact}</a>
                      </div>
                    </div>
                    {chief.Website && (
                      <div className="group/link flex items-center gap-6 p-6 bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-all cursor-pointer">
                        <div className="w-14 h-14 bg-white shadow-xl flex items-center justify-center shrink-0 border border-primary/5 group-hover/link:-rotate-12 transition-transform">
                          <Globe className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/40 mb-1">Digital Presence</p>
                          <a href={`https://${chief.Website}`} target="_blank" rel="noopener noreferrer" className="font-headline font-bold text-sm text-foreground hover:text-secondary transition-colors tracking-tight leading-none">{chief.Website}</a>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </ContentSection>
      )}

      {/* Board Member Dossiers — High Fidelity Grid */}
      <ContentSection dark title="Scholarly Directorate">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {rest.map((member, idx) => (
            <div key={idx} className="group flex flex-col bg-white border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden h-full">
              {/* Card Geometric Accents */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 group-hover:scale-150 transition-transform duration-1000" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" style={{ clipPath: 'circle(50% at 0 100%)' }}></div>

              <div className="aspect-[4/5] relative overflow-hidden bg-muted m-6 mb-0 border border-border/5">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-700"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-700">
                    <div className="flex items-center gap-3 text-white">
                      <ShieldCheck className="h-4 w-4 text-secondary mb-1" />
                      <span className="font-headline font-black text-[10px] uppercase tracking-widest">Verified Directorate Member</span>
                    </div>
                </div>
              </div>
              
              <div className="p-10 flex flex-col h-full">
                <div className="mb-8">
                    <div className="h-1 w-12 bg-primary mb-6 transition-all group-hover:w-full duration-700"></div>
                    <p className="font-headline font-black text-[9px] uppercase tracking-[0.3em] text-foreground/30 mb-2">Directorate Ledger</p>
                    <h3 className="text-2xl font-black font-headline leading-tight uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors min-h-[3rem]">
                      {member.name}
                    </h3>
                    <p className="font-body text-foreground/40 text-sm italic leading-relaxed min-h-[3rem]">
                      {member.Designation}
                    </p>
                </div>

                <div className="mt-auto space-y-6 pt-8 border-t border-border/5">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-secondary/5 flex items-center justify-center shrink-0 border border-secondary/10 group-hover:bg-secondary group-hover:text-white transition-all"><Award size={14} /></div>
                        <p className="font-headline font-bold text-[11px] uppercase tracking-widest text-foreground/60 leading-tight">{member.Institution}</p>
                    </div>

                   <div className="space-y-4 max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-700 opacity-0 group-hover:opacity-100">
                      {member.Education && (
                        <div className="flex items-start gap-4">
                           <GraduationCap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                           <span className="text-[10px] font-headline font-black uppercase tracking-widest text-foreground/40">{member.Education}</span>
                        </div>
                      )}
                      {member.Expertise && (
                        <div className="flex items-start gap-4">
                           <Search className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                           <span className="text-[10px] font-headline font-black uppercase tracking-widest text-foreground/40">{member.Expertise}</span>
                        </div>
                      )}
                      {member.Location && (
                        <div className="flex items-start gap-4">
                           <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                           <span className="text-[10px] font-headline font-black uppercase tracking-widest text-foreground/40">{member.Location}</span>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* Institutional Integrity Note */}
      <ContentSection>
        <div className="max-w-6xl mx-auto py-24 text-center border-y border-border/20 relative overflow-hidden group">
          <div className="absolute top-1/2 left-0 w-full h-px bg-border -z-10 group-hover:bg-primary/20 transition-colors duration-1000"></div>
          <div className="bg-secondary/5 inline-block px-12 py-4 relative z-10 mb-8 border border-border/10">
             <BookOpen className="h-6 w-6 text-secondary mx-auto" />
          </div>
          <p className="font-headline text-3xl md:text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none max-w-4xl mx-auto relative z-10">
            "Ensuring Global Excellence Through <br/><span className="text-primary italic">Scholarly Integrity & Vision.</span>"
          </p>
          <div className="mt-12 flex justify-center gap-12 font-headline font-black text-[9px] uppercase tracking-[0.4em] text-foreground/20 italic">
             <span>Continental Reach</span>
             <span className="text-foreground/5 shrink-0">•</span>
             <span>Academic Rigor</span>
             <span className="text-foreground/5 shrink-0">•</span>
             <span>African Excellence</span>
          </div>
        </div>
      </ContentSection>
    </div>
  );
};

export default EditorialBoard;