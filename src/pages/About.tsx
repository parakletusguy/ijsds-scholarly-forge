import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Target, Eye, TrendingUp, Globe, Award, Network, BookOpen, ShieldCheck, Zap, Layers, MapPin, Search, Users } from 'lucide-react';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import logo from "../../public/Logo Symbol.png"

export const About = () => {
  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>About IJSDS — International Journal of Social Work and Development Studies</title>
        <meta name="description" content="Discover the mission, vision, and strategic objectives of the International Journal of Social Work and Development Studies." />
      </Helmet>

      <PageHeader 
        title="About IJSDS" 
        subtitle="International Journal of Social Work and Development Studies" 
        accent="Empowering Communities through Research and Practice"
        description="The International Journal of Social Work and Development Studies (IJSDS) is a peer-reviewed journal dedicated to advancing knowledge and practice in social work and development studies. Our aim is to provide a platform for researchers, practitioners, and policymakers to share their experiences, insights, and research findings."
      />

      {/* Strategic Pillars — Mission & Vision High-Fidelity Blocks */}
      <ContentSection dark title="Foundational Pillars">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="bg-white p-12 md:p-20 relative overflow-hidden group shadow-2xl flex flex-col h-full border border-border/10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 transition-transform group-hover:scale-125 duration-1000" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
            
            <div className="relative z-10">
               <div className="w-20 h-20 bg-primary/10 flex items-center justify-center text-primary mb-12 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  <Eye size={40} className="group-hover:rotate-12 transition-transform" />
               </div>
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-px w-20 bg-primary"></div>
                  <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/30 italic">Long-Term Trajectory</span>
               </div>
               <h3 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter mb-10 leading-none">Our <br/><span className="text-primary italic">Vision</span></h3>
               <p className="font-body text-xl md:text-2xl text-foreground/60 leading-relaxed italic border-l-8 border-secondary/20 pl-8 py-4">
                 Our vision is to become a leading international journal that showcases innovative and impactful research in social work and development studies, fostering a more equitable and just society.
               </p>
            </div>
          </div>

          <div className="bg-foreground text-white p-12 md:p-20 relative overflow-hidden group shadow-2xl flex flex-col h-full border border-white/5">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 opacity-20 -translate-x-1/2 translate-y-1/2 pointer-events-none" style={{ clipPath: 'circle(50% at 50% 50%)' }}></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 opacity-20 pointer-events-none" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
            
            <div className="relative z-10">
               <div className="w-20 h-20 bg-secondary/20 flex items-center justify-center text-secondary mb-12 border border-secondary/20 group-hover:bg-secondary group-hover:text-white transition-all shadow-inner">
                  <Target size={40} className="group-hover:-rotate-12 transition-transform" />
               </div>
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-px w-20 bg-secondary"></div>
                  <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-white/30 italic">Strategic Mandate</span>
               </div>
               <h3 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter mb-10 leading-none">Our <br/><span className="text-secondary italic">Mission</span></h3>
               <p className="font-body text-xl md:text-2xl text-white/70 leading-relaxed italic border-l-8 border-primary/20 pl-8 py-4">
                 Our mission is to publish high-quality, relevant, and rigorous research that contributes to the understanding and advancement of social work and development studies. We strive to provide a forum for critical discussion, debate, and reflection on the complex issues facing individuals, communities, and societies.
               </p>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Objectives Section */}
      <ContentSection title="Objectives">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { 
               icon: <Award className="h-10 w-10" />, 
               title: "Promote Research Excellence", 
               desc: "Foster high-quality research in social work and development studies.",
               accent: "primary"
            },
            { 
               icon: <Globe className="h-10 w-10" />, 
               title: "Disseminate Knowledge", 
               desc: "Share research findings and insights with a global audience.",
               accent: "secondary"
            },
            { 
               icon: <TrendingUp className="h-10 w-10" />, 
               title: "Inform Policy and Practice", 
               desc: "Provide evidence-based research to inform policy and practice in social work and development studies.",
               accent: "primary"
            },
            { 
               icon: <Network className="h-10 w-10" />, 
               title: "Encourage Collaboration", 
               desc: "Facilitate collaboration among researchers, practitioners, and policymakers.",
               accent: "secondary"
            }
          ].map((item, idx) => (
            <div key={idx} className="group flex flex-col bg-white border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden h-full">
              <div className={`absolute top-0 right-0 w-16 h-16 bg-${item.accent}/5 group-hover:scale-150 transition-transform duration-1000`} style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
              <div className="p-12 flex flex-col h-full">
                <div className={`w-16 h-16 bg-${item.accent}/10 flex items-center justify-center text-${item.accent} mb-12 border border-${item.accent}/10 group-hover:bg-foreground group-hover:text-white transition-all shadow-inner`}>
                   {item.icon}
                </div>
                <div className="flex items-center gap-4 mb-6">
                   <div className="h-px w-12 bg-primary group-hover:w-full transition-all duration-700"></div>
                   <span className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/30">Vector 0{idx+1}</span>
                </div>
                <h4 className="text-2xl font-black font-headline uppercase tracking-tighter mb-4 leading-tight group-hover:text-primary transition-colors">{item.title}</h4>
                <p className="font-body text-foreground/70 italic text-md leading-relaxed mb-auto bg-secondary/5 p-6 border-l-2 border-secondary/10 group-hover:text-foreground/90 group-hover:bg-transparent transition-all">
                   {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* Expected Outcomes Section */}
      <ContentSection dark title="Expected Outcomes & Outputs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-border/10">
              <div className="flex items-start gap-6">
                 <div className="h-12 w-12 shrink-0 bg-primary/10 flex items-center justify-center rounded-sm text-primary">
                   <BookOpen className="h-6 w-6" />
                 </div>
                 <div>
                   <h4 className="text-xl font-headline font-black uppercase tracking-tighter mb-2">High-Impact Research</h4>
                   <p className="font-body text-foreground/60 italic leading-relaxed">
                     Publish research that contributes to the advancement of social work and development studies.
                   </p>
                 </div>
              </div>
            </div>

            <div className="p-8 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-border/10">
              <div className="flex items-start gap-6">
                 <div className="h-12 w-12 shrink-0 bg-secondary/10 flex items-center justify-center rounded-sm text-secondary">
                   <Eye className="h-6 w-6" />
                 </div>
                 <div>
                   <h4 className="text-xl font-headline font-black uppercase tracking-tighter mb-2">Increased Visibility</h4>
                   <p className="font-body text-foreground/60 italic leading-relaxed">
                     Increase the visibility and reach of research in social work and development studies.
                   </p>
                 </div>
              </div>
            </div>

            <div className="p-8 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-border/10">
              <div className="flex items-start gap-6">
                 <div className="h-12 w-12 shrink-0 bg-primary/10 flex items-center justify-center rounded-sm text-primary">
                   <TrendingUp className="h-6 w-6" />
                 </div>
                 <div>
                   <h4 className="text-xl font-headline font-black uppercase tracking-tighter mb-2">Improved Policy and Practice</h4>
                   <p className="font-body text-foreground/60 italic leading-relaxed">
                     Inform policy and practice with evidence-based research.
                   </p>
                 </div>
              </div>
            </div>

            <div className="p-8 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-border/10">
              <div className="flex items-start gap-6">
                 <div className="h-12 w-12 shrink-0 bg-secondary/10 flex items-center justify-center rounded-sm text-secondary">
                   <Users className="h-6 w-6" />
                 </div>
                 <div>
                   <h4 className="text-xl font-headline font-black uppercase tracking-tighter mb-2">Global Network</h4>
                   <p className="font-body text-foreground/60 italic leading-relaxed">
                     Establish a global network of researchers, practitioners, and policymakers in social work and development studies.
                   </p>
                 </div>
              </div>
            </div>
        </div>
      </ContentSection>
    </div>
  );
};