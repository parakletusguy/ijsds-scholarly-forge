import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageHeader, ContentSection } from "@/components/layout/PageElements";
import { Eye, Users, Clock, CheckCircle, XCircle, RotateCcw, ShieldCheck, GraduationCap, Award, Search, Zap, Layers, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const PeerReview = () => {
  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>Peer Review Protocol — IJSDS</title>
        <meta name="description" content="Information on the rigorous double-blind peer review process at the International Journal of Social Work and Development Studies." />
      </Helmet>

      <PageHeader 
        title="Scholarly" 
        subtitle="Peer Review" 
        accent="Consensus & Validation Protocol"
        description="Our rigorous double-blind peer review framework ensures the absolute objectivity, scientific merit, and developmental impact of every published archival record."
      />

      {/* Objectivity Shield — High Fidelity Introduction */}
      <ContentSection>
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32 relative group">
          {/* Background Decorative Motif */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border/20 -z-0 group-hover:bg-primary/20 transition-colors duration-1000"></div>
          
          <div className="w-full lg:w-2/5 relative">
            <div className="absolute inset-0 bg-primary/5 -translate-x-10 translate-y-10 -z-10 transition-transform group-hover:translate-x-0 group-hover:translate-y-0 duration-1000"></div>
            <div className="bg-white p-16 shadow-2xl border border-border/20 text-center relative z-10 flex flex-col items-center">
              <div className="p-8 bg-foreground text-white shadow-xl mb-10 rotate-3 transition-transform group-hover:-rotate-3 group-hover:bg-primary"><Eye size={64} className="text-secondary" /></div>
              <div className="h-2 w-24 bg-primary mb-8"></div>
              <p className="font-headline font-black text-xs uppercase tracking-[0.4em] text-foreground/30 mb-2">Registry Shield</p>
              <p className="font-headline font-black text-lg uppercase tracking-widest text-primary italic">Double-Blind Integrity</p>
            </div>
            {/* Geometric Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 -z-10 translate-x-8 -translate-y-8" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
          </div>

          <div className="w-full lg:w-3/5">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-0.5 w-16 bg-primary"></div>
               <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/40 italic">Institutional Mandate</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black font-headline uppercase tracking-tighter mb-10 leading-[0.85] text-foreground">
              Absolute <br/><span className="text-primary italic">Objectivity & Fairness</span>
            </h2>
            <p className="text-2xl md:text-3xl font-body italic text-foreground/40 leading-relaxed mb-12">
              IJSDS adheres to a <span className="text-foreground font-headline font-black uppercase text-xl leading-relaxed tracking-tight">Double-Blind Protocol,</span> where both author and reviewer identities are fully shielded throughout the assessment lifecycle.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-12 border-t border-border/10">
               <div className="space-y-4 group/item">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-secondary group-hover/item:rotate-45 transition-transform"></div>
                     <h4 className="font-headline font-black text-xs uppercase tracking-widest text-foreground">Author Anonymity</h4>
                  </div>
                  <p className="font-body text-foreground/40 text-sm italic leading-relaxed">
                    Personal identifiers, institutional metadata, and self-citations are redacted to eliminate bias in the initial audit.
                  </p>
               </div>
               <div className="space-y-4 group/item">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-secondary group-hover/item:rotate-45 transition-transform"></div>
                     <h4 className="font-headline font-black text-xs uppercase tracking-widest text-foreground">Reviewer Secrecy</h4>
                  </div>
                  <p className="font-body text-foreground/40 text-sm italic leading-relaxed">
                    Identities are protected across our global network to ensure honest, critical, and independent evaluation of scholarly merit.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Assessment Trajectory — High Fidelity Timeline */}
      <ContentSection dark title="Consensus Trajectory">
        <div className="max-w-5xl mx-auto space-y-8">
           {[
             { step: "01", title: "Editorial Screen", time: "1-2 Weeks", desc: "Technical audit of scope, ethics, and archival formatting by our Directorate." },
             { step: "02", title: "Selection Protocol", time: "2-3 Weeks", desc: "Rigorous identification of 2-3 global subject experts with doctorate credentials." },
             { step: "03", title: "Scientific Evaluation", time: "6-8 Weeks", desc: "Thorough independent assessment of methodology, novelty, and developmental impact." },
             { step: "04", title: "Consensus Decision", time: "1-2 Weeks", desc: "Final synthesis of reviewer feedback and official Directorate validation." }
           ].map((item, idx) => (
             <div key={idx} className="bg-white p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 border-l-8 border-primary hover:shadow-2xl transition-all duration-700 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-full bg-secondary/5 -z-0 translate-x-12 opacity-20 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                
                <div className="flex items-center gap-10 relative z-10">
                   <span className="font-headline font-black text-7xl text-foreground/5 group-hover:text-primary/10 transition-colors pointer-events-none select-none">{item.step}</span>
                   <div className="space-y-2">
                      <h4 className="font-headline font-black text-2xl uppercase tracking-tighter group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="font-body text-foreground/40 italic text-md leading-relaxed max-w-xl">{item.desc}</p>
                   </div>
                </div>
                <div className="relative z-10 shrink-0">
                  <div className="bg-secondary text-white px-8 py-4 font-headline font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-3 shadow-xl group-hover:bg-foreground transition-all">
                     <Clock size={14} className="group-hover:rotate-12 transition-transform" /> {item.time}
                  </div>
                </div>
             </div>
           ))}
           <div className="bg-foreground p-12 text-center text-white relative overflow-hidden group shadow-2xl border border-white/5">
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <p className="font-headline font-black text-xl md:text-3xl uppercase tracking-tighter italic relative z-10">
                 Integrated Registry Timeline: <span className="text-secondary">10-15 Weeks</span> from submission.
              </p>
           </div>
        </div>
      </ContentSection>

      {/* Audit Nodes — High Fidelity Criteria Grid */}
      <ContentSection title="Evaluation Standards Grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           <div className="bg-white p-12 border border-border/10 relative group hover:shadow-2xl transition-all duration-1000 flex flex-col h-full overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 transition-transform group-hover:scale-150 duration-1000" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center text-primary mb-10 border border-primary/10 group-hover:bg-foreground group-hover:text-white transition-all shadow-inner"><ShieldCheck size={32} /></div>
              
              <h3 className="text-3xl font-black font-headline uppercase tracking-tighter mb-8 leading-none">Scientific <br/><span className="text-primary group-hover:text-foreground">Merit</span></h3>
              <ul className="space-y-6 font-body text-foreground/40 italic text-lg leading-relaxed mb-auto">
                 <li className="flex items-center gap-4 group/li"><CheckCircle size={16} className="text-secondary/40 group-hover/li:text-secondary" /> Methodological Rigor</li>
                 <li className="flex items-center gap-4 group/li"><CheckCircle size={16} className="text-secondary/40 group-hover/li:text-secondary" /> Conceptual Novelty</li>
                 <li className="flex items-center gap-4 group/li"><CheckCircle size={16} className="text-secondary/40 group-hover/li:text-secondary" /> Ethical Synergy</li>
              </ul>
           </div>

           <div className="bg-white p-12 border border-border/10 relative group hover:shadow-2xl transition-all duration-1000 flex flex-col h-full overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/5 transition-transform group-hover:scale-150 duration-1000" style={{ clipPath: 'circle(50% at 100% 0%)' }}></div>
              <div className="w-16 h-16 bg-secondary/10 flex items-center justify-center text-secondary mb-10 border border-secondary/10 group-hover:bg-foreground group-hover:text-white transition-all shadow-inner"><GraduationCap size={32} /></div>
              
              <h3 className="text-3xl font-black font-headline uppercase tracking-tighter mb-8 leading-none">Expertise <br/><span className="text-secondary group-hover:text-foreground">Curation</span></h3>
              <p className="font-body text-foreground/40 text-lg italic leading-relaxed mb-auto">
                All Registry Reviewers are vetted doctoral holders with significant archival contributions in the multidisciplinary sector.
              </p>
           </div>

           <div className="bg-white p-12 border border-border/10 relative group hover:shadow-2xl transition-all duration-1000 flex flex-col h-full overflow-hidden">
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 transition-transform group-hover:scale-150 duration-1000" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
              <div className="w-16 h-16 bg-foreground text-white flex items-center justify-center mb-10 border border-white/5 group-hover:bg-primary transition-all shadow-2xl"><Award size={32} /></div>
              
              <h3 className="text-3xl font-black font-headline uppercase tracking-tighter mb-8 leading-none">Quality <br/><span className="text-primary group-hover:text-foreground">Assurance</span></h3>
              <p className="font-body text-foreground/40 text-lg italic leading-relaxed mb-auto">
                Constant monitoring of feedback velocity and depth to maintain the highest scholarly impact of African research.
              </p>
           </div>
        </div>
      </ContentSection>

      {/* Decision Categories — Vibrant High Contrast Block */}
      <ContentSection dark title="Archival Decision Spectrum">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { icon: <CheckCircle className="text-green-500" />, title: "Accept", color: "green", desc: "The manuscript meets all scholarly standards and and is cleared for Registry publication." },
             { icon: <RotateCcw className="text-orange-500" />, title: "Minor", color: "orange", desc: "The archival record requires stylistic or minor conceptual adjustments; no re-assessment." },
             { icon: <Search className="text-blue-500" />, title: "Major", color: "blue", desc: "Significant revisions required; manuscript must undergo a full re-assessment protocol." },
             { icon: <XCircle className="text-red-500" />, title: "Reject", color: "red", desc: "Fails to meet the Registry's rigorous standards or falls outside current developmental scope." }
           ].map((d, idx) => (
             <div key={idx} className="group relative bg-white p-12 text-center flex flex-col items-center hover:bg-foreground hover:text-white transition-all duration-700 shadow-sm hover:shadow-2xl cursor-pointer">
                <div className={`absolute top-0 right-0 w-12 h-12 bg-${d.color}-500/5 group-hover:bg-white/5 transition-colors`} style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                <div className="mb-10 h-20 w-20 flex items-center justify-center bg-secondary/5 border border-secondary/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all shadow-inner group-hover:rotate-12">{d.icon}</div>
                <h4 className="font-headline font-black text-2xl uppercase tracking-widest mb-6 leading-none">{d.title}</h4>
                <p className="font-body text-[14px] italic text-foreground/40 group-hover:text-white/40 leading-relaxed h-20">{d.desc}</p>
                <div className="mt-8 h-1 w-0 bg-secondary group-hover:w-full transition-all duration-700"></div>
             </div>
           ))}
        </div>
      </ContentSection>

      {/* Institutional Safeguards Footer */}
      <ContentSection>
        <div className="max-w-5xl mx-auto py-32 text-center border-t border-border/20 relative overflow-hidden group">
            <Scale size={32} className="mx-auto text-primary mb-12 animate-pulse" />
           <p className="font-headline text-3xl md:text-6xl font-black text-foreground uppercase tracking-tighter italic leading-none max-w-5xl mx-auto mb-16 relative z-10">
             "Validating Excellence through <span className="text-secondary italic">Rigorous Consensus.</span>"
           </p>
           
           <div className="flex flex-col items-center gap-12">
              <div className="flex flex-wrap justify-center gap-16 font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/20 italic">
                 <span>Global Review Grid</span>
                 <span className="text-foreground/5 shrink-0 hidden sm:block">•</span>
                 <span>Archival Validation</span>
                 <span className="text-foreground/5 shrink-0 hidden sm:block">•</span>
                 <span>Scholarly Synergy</span>
              </div>
              <div className="h-px w-32 bg-border"></div>
           </div>
        </div>
      </ContentSection>
    </div>
  );
};

export default PeerReview;