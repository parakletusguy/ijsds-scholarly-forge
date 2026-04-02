import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Target, Eye, TrendingUp, Globe, Award, Network, BookOpen, ShieldCheck, Zap, Layers, MapPin, Search } from 'lucide-react';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import logo from "../../public/Logo Symbol.png"

export const About = () => {
  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>About IJSDS — Institutional Identity</title>
        <meta name="description" content="Discover the mission, vision, and strategic objectives of the International Journal of Social Work and Development Studies." />
      </Helmet>

      <PageHeader 
        title="Institutional" 
        subtitle="Identity" 
        accent="Scholarly Foundation & Vision"
        description="The International Journal of Social Work and Development Studies (IJSDS) is a premier peer-reviewed platform dedicated to advancing discourse and practice across the African continent and globally."
      />

      {/* Identity Artifact — Premium Branding Section */}
      <ContentSection>
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32 relative group">
          {/* Background Decorative Motif */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border/20 -z-0 group-hover:bg-primary/20 transition-colors duration-1000"></div>
          
          <div className="w-full lg:w-2/5 relative">
            <div className="absolute inset-0 bg-primary/5 -translate-x-10 translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-1000 -z-10"></div>
            <div className="bg-white p-16 md:p-24 shadow-2xl border border-border/20 text-center relative z-10 overflow-hidden group/logo">
               {/* Abstract Corner Accent */}
               <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 transition-transform group-hover/logo:scale-110" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
               <img src={logo} alt="IJSDS Official Seal" className="w-48 md:w-64 mx-auto -rotate-3 transition-all duration-1000 group-hover/logo:rotate-0 group-hover/logo:scale-110 relative z-10" />
            </div>
            {/* Semantic Label */}
            <div className="mt-8 flex items-center gap-4 justify-center">
               <div className="h-px w-12 bg-primary"></div>
               <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/30">Official Registry Seal</span>
               <div className="h-px w-12 bg-primary"></div>
            </div>
          </div>

          <div className="w-full lg:w-3/5">
            <div className="bg-foreground text-white p-10 md:p-16 relative overflow-hidden shadow-2xl mb-12 border border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-10 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                <p className="text-2xl md:text-4xl font-headline font-black uppercase tracking-tighter italic leading-tight text-white mb-6">
                   "Empowerment through <span className="text-secondary">Transformative Knowledge</span>"
                </p>
                <div className="h-1 w-24 bg-primary mb-6"></div>
                <p className="text-xl font-body text-white/50 italic leading-relaxed">
                   Bridging the gap between theory and transformative social practice within the African developmental landscape.
                </p>
            </div>
            
            <p className="text-xl md:text-2xl font-body text-foreground/60 leading-relaxed max-w-2xl border-l-4 border-secondary/20 pl-8 italic">
               We provide a robust forum for researchers, practitioners, and policymakers to exchange transformative insights and evidence-based solutions to collective challenges.
            </p>
          </div>
        </div>
      </ContentSection>

      {/* Strategic Pillars — Mission & Vision High-Fidelity Blocks */}
      <ContentSection dark title="Foundational Pillars">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="bg-white p-12 md:p-20 relative overflow-hidden group shadow-2xl flex flex-col h-full border border-border/10">
            {/* Dramatic Shape Accent */}
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
               <p className="font-body text-2xl md:text-3xl text-foreground/40 leading-relaxed italic border-l-8 border-secondary/20 pl-8 py-4">
                 "To become the leading international journal documenting innovative and impactful research that fosters a more equitable, just, and self-reliant society across Africa and the global south."
               </p>
            </div>
          </div>

          <div className="bg-foreground text-white p-12 md:p-20 relative overflow-hidden group shadow-2xl flex flex-col h-full border border-white/5">
            {/* Dramatic Shape Accent */}
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
               <p className="font-body text-2xl md:text-3xl text-white/40 leading-relaxed italic border-l-8 border-primary/20 pl-8 py-4">
                 "To publish rigorous research contributing to the advancement of social work and development studies, providing a critical forum for debate and reflection on the multifaceted issues facing our societies."
               </p>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Strategic Impact Ledger — Dynamic Objective Grid */}
      <ContentSection title="Strategic Impact Matrix">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { 
               icon: <Award className="h-10 w-10" />, 
               title: "Promote Excellence", 
               desc: "Fostering the highest standards of multidisciplinary research quality and ethical scholarship across continental archives.",
               accent: "primary"
            },
            { 
               icon: <Globe className="h-10 w-10" />, 
               title: "Global Impact", 
               desc: "Disseminating transformative findings to a diverse global academic audience through optimized digital discovery nodes.",
               accent: "secondary"
            },
            { 
               icon: <TrendingUp className="h-10 w-10" />, 
               title: "Inform Policy", 
               desc: "Empowering continental decision-makers with evidence-based developmental strategies and rigorous scholarly data.",
               accent: "primary"
            },
            { 
               icon: <Network className="h-10 w-10" />, 
               title: "Dynamic Synergy", 
               desc: "Building a vibrant professional network across disciplines, sectors, and international institutional borders.",
               accent: "secondary"
            }
          ].map((item, idx) => (
            <div key={idx} className="group flex flex-col bg-white border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden h-full">
              {/* Abstract Motif in Card */}
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
                <p className="font-body text-foreground/40 italic text-md leading-relaxed mb-auto bg-secondary/5 p-6 border-l-2 border-secondary/10 group-hover:text-foreground/70 group-hover:bg-transparent transition-all">
                   {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* Continuity Note — High Fidelity Seal */}
      <ContentSection>
        <div className="max-w-5xl mx-auto py-32 text-center border-y border-border/20 relative overflow-hidden group">
            <div className="absolute top-1/2 left-0 w-full h-px bg-border -z-10 group-hover:bg-primary/20 transition-colors duration-1000"></div>
            <div className="bg-secondary/5 inline-block px-12 py-6 relative z-10 mb-12 border border-border/10 animate-bounce">
               <ShieldCheck className="h-8 w-8 text-secondary mx-auto" />
            </div>
            
            <p className="font-headline text-3xl md:text-7xl font-black text-foreground uppercase tracking-tighter italic leading-none max-w-5xl mx-auto relative z-10 mb-16">
              "Ensuring the <span className="text-primary italic">Intellectual Continuity</span> of the African Commons."
            </p>
            
            <div className="flex flex-col items-center gap-12 relative z-10">
               <div className="flex flex-wrap justify-center gap-12 font-headline font-black text-xs uppercase tracking-[0.6em] text-foreground/10 italic">
                  <span>Scholarly Rigor</span>
                  <span className="text-foreground/5 shrink-0 hidden sm:block">•</span>
                  <span>Institutional Integrity</span>
                  <span className="text-foreground/5 shrink-0 hidden sm:block">•</span>
                  <span>Continental Impact</span>
               </div>
            </div>
        </div>
      </ContentSection>
    </div>
  );
};