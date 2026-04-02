import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, FileText, Users, Clock, Info, ShieldCheck, Zap, Layers, PencilLine, Send, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { PageHeader, ContentSection } from "@/components/layout/PageElements";

export const SubmissionGuidelines = () => {
  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>Author Submission Guidelines — IJSDS</title>
        <meta name="description" content="Technical instructions for preparing and submitting multidisciplinary research manuscripts to IJSDS." />
      </Helmet>

      <PageHeader 
        title="Author" 
        subtitle="Protocols" 
        accent="Technical Precision Ledger"
        description="A high-fidelity framework for preparing and submitting your scholarly synthesis. Adherence to these protocols ensures a streamlined editorial audit and peer-review trajectory."
      />

      {/* Article Type Matrix — Premium High-Fidelity Grid */}
      <ContentSection title="Manuscript Typology">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { title: "Original Research", words: "6,000-8,000", desc: "Empirical studies with significant developmental impact across African sectors.", icon: <Layers size={20} /> },
            { title: "Review Articles", words: "4,000-6,000", desc: "In-depth synthesis of historical and contemporary scholarly literature.", icon: <BookOpen size={20} /> },
            { title: "Case Studies", words: "3,000-4,000", desc: "Rigorous analysis of specific social interventions or policy implementations.", icon: <ShieldCheck size={20} /> },
            { title: "Short Communications", words: "1,500-2,500", desc: "Preliminary findings or methodological innovations requiring urgent dissemination.", icon: <Zap size={20} /> }
          ].map((type, idx) => (
            <div key={idx} className="group flex flex-col bg-white border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden h-full">
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 transition-transform duration-1000 group-hover:scale-150" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
              
              <div className="p-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">{type.icon}</div>
                   <span className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/30">Typology 0{idx+1}</span>
                </div>
                
                <h4 className="text-2xl font-black font-headline uppercase tracking-tighter mb-4 leading-tight min-h-[3rem] group-hover:text-primary transition-colors">{type.title}</h4>
                
                <div className="flex items-center gap-3 mb-8 bg-secondary/5 px-4 py-2 self-start border border-secondary/10">
                   <Clock size={12} className="text-secondary" />
                   <span className="font-headline font-black text-[10px] uppercase tracking-widest text-secondary">{type.words} Words</span>
                </div>
                
                <p className="font-body text-foreground/40 italic text-md leading-relaxed mb-auto">
                   {type.desc}
                </p>
                
                <div className="mt-12 h-1 w-12 bg-border group-hover:w-full group-hover:bg-primary transition-all duration-700"></div>
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* Preparation Dossier — Structured High-Fidelity Interface */}
      <ContentSection dark title="Archival Preparation Ledger">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div className="bg-white p-12 md:p-16 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 group-hover:scale-125 transition-transform duration-1000" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
              
              <div className="flex items-center gap-6 mb-12">
                <div className="w-14 h-14 bg-primary text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all"><FileText size={24} /></div>
                <h3 className="text-3xl font-black font-headline uppercase tracking-tighter">Formatting Protocol</h3>
              </div>
              
              <ul className="space-y-8 font-body text-lg text-foreground/60 italic">
                <li className="flex items-start gap-6 group/li cursor-default">
                  <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 mt-1 transition-transform group-hover/li:scale-125" /> 
                  <span>Double-spaced throughout (12-point <span className="text-foreground font-headline font-black uppercase text-xs tracking-widest not-italic">Newsreader/Epilogue</span>).</span>
                </li>
                <li className="flex items-start gap-6 group/li cursor-default">
                  <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 mt-1 transition-transform group-hover/li:scale-125" /> 
                  <span>Universal 1-inch margins on all orientations.</span>
                </li>
                <li className="flex items-start gap-6 group/li cursor-default">
                  <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 mt-1 transition-transform group-hover/li:scale-125" /> 
                  <span>Continuous sequential line numbering for audit.</span>
                </li>
                <li className="flex items-start gap-6 group/li cursor-default">
                  <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 mt-1 transition-transform group-hover/li:scale-125" /> 
                  <span>High-fidelity vector graphics (TIFF/EPS) at 300+ DPI.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-12 md:p-16 shadow-2xl relative overflow-hidden group border-t-8 border-secondary">
               <div className="flex items-center gap-6 mb-12">
                  <div className="w-14 h-14 bg-secondary text-white flex items-center justify-center shadow-lg group-hover:-rotate-12 transition-all"><Info size={24} /></div>
                  <h3 className="text-3xl font-black font-headline uppercase tracking-tighter">Structural Hierarchy</h3>
               </div>
               
               <ol className="space-y-6">
                 {[
                   { label: "Title Page", desc: "Author metadata & institutional affiliations." },
                   { label: "Abstract", desc: "Technical summary (250-300 words)." },
                   { label: "Keywords", desc: "5-7 multidisciplinary discovery tags." },
                   { label: "Core Body", desc: "Introduction, Method, Results, Discussion." },
                   { label: "Reference Ledger", desc: "Rigorous APA 7th Edition adherence." }
                 ].map((s, i) => (
                   <li key={i} className="flex gap-8 group/item">
                      <span className="font-headline font-black text-secondary text-2xl leading-none transition-transform group-hover/item:translate-x-2">0{i+1}</span>
                      <div>
                         <h4 className="font-headline font-bold text-xs uppercase tracking-widest mb-1 text-foreground">{s.label}</h4>
                         <p className="font-body text-foreground/40 text-sm italic">{s.desc}</p>
                      </div>
                   </li>
                 ))}
               </ol>
            </div>
          </div>

          <div className="bg-foreground text-white p-16 md:p-24 relative overflow-hidden group shadow-2xl flex flex-col justify-center border border-white/5 h-full">
             {/* Dramatic Aesthetic Pattern */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] -translate-y-1/2 translate-x-1/2 rotate-12 pointer-events-none" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 opacity-20 pointer-events-none" style={{ clipPath: 'circle(50% at 0 100%)' }}></div>
             
             <div className="relative z-10">
                <div className="w-20 h-20 bg-white/10 border border-white/20 flex items-center justify-center mb-12 shadow-inner group-hover:rotate-45 transition-transform duration-700">
                   <ShieldCheck size={40} className="text-secondary" />
                </div>
                
                <h3 className="text-5xl md:text-8xl font-black font-headline uppercase tracking-tighter mb-12 leading-[0.85]">Ethical <br/><span className="text-primary italic">Shield</span></h3>
                
                <p className="text-xl md:text-2xl font-body italic text-white/50 mb-16 leading-relaxed">
                  All submissions must undergo rigorous <span className="text-white">Institutional Review Board (IRB)</span> approval and adhere to the strict IJSDS anti-plagiarism ledger.
                </p>
                
                <div className="space-y-8">
                   {[
                     "Informed Consent Documentation Required",
                     "Conflict of Interest Ledger Declaration",
                     "Crossref Similarity Audit Compliance",
                     "Human/Animal Protocol Verification"
                   ].map((f, i) => (
                     <div key={i} className="flex items-center gap-6 font-headline font-black text-[10px] uppercase tracking-[0.4em] text-white/40 group-hover:text-white/80 transition-colors">
                        <div className="w-3 h-3 bg-primary group-hover:rotate-45 transition-transform duration-500"></div> {f}
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </ContentSection>

      {/* Submission Workflow — Dramatic Timeline */}
      <ContentSection title="Submission Trajectory">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
          {[
            { step: "01", title: "Archive Registration", desc: "Establish your scholarly presence on the IJSDS secure portal." },
            { step: "02", title: "Technical Alignment", desc: "Verify manuscript adherence to the Archival Prep Ledger." },
            { step: "03", title: "Registry Upload", desc: "Submit all technical files and multidisciplinary metadata." },
            { step: "04", title: "Editorial Audit", desc: "Initial quality assessment and scope verification by the Directorate." },
            { step: "05", title: "Peer Evaluation", desc: "Double-blind consensus review by international subject experts." },
            { step: "06", title: "Final Validation", desc: "Directorate consensus: Acceptance, Revision, or Registry Rejection." }
          ].map((item, idx) => (
            <div key={idx} className="relative group flex flex-col h-full">
              <span className="absolute -top-16 -left-10 text-[180px] font-black text-foreground/5 group-hover:text-primary/[0.03] transition-colors font-headline pointer-events-none select-none">{item.step}</span>
              <div className="relative z-10 pt-10 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                   <div className="h-px w-12 bg-primary group-hover:w-full transition-all duration-700"></div>
                   <PencilLine size={16} className="text-secondary shrink-0" />
                </div>
                <h4 className="text-3xl font-black font-headline uppercase tracking-tighter text-foreground mb-6 leading-none group-hover:text-primary transition-colors">{item.title}</h4>
                <p className="font-body text-lg text-foreground/40 italic leading-relaxed mb-auto bg-white/50 p-6 border-l-2 border-border/5 group-hover:bg-white group-hover:shadow-xl group-hover:text-foreground/70 transition-all duration-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* CTA Footer — Premium Action Module */}
      <ContentSection>
        <div className="bg-primary p-16 md:p-32 text-center relative overflow-hidden group shadow-2xl">
           {/* Abstract Geographic Pattern */}
           <div className="absolute top-0 left-0 w-full h-full bg-white opacity-[0.02] -z-0 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
           <div className="absolute bottom-0 right-0 w-full h-full bg-secondary opacity-5 -z-0 pointer-events-none" style={{ clipPath: 'circle(50% at 100% 100%)' }}></div>
           
           <div className="relative z-10 max-w-4xl mx-auto">
              <Send size={48} className="mx-auto text-white/20 mb-12 group-hover:scale-125 group-hover:text-secondary transition-all duration-1000" />
              <h3 className="text-5xl md:text-8xl font-black font-headline text-white uppercase tracking-tighter mb-16 leading-[0.85]">Ready to Initiate <br/><span className="italic text-secondary">Your Submission?</span></h3>
              
              <div className="flex justify-center gap-8 flex-wrap">
                 <button 
                   className="group/btn relative bg-white text-foreground px-16 py-8 font-headline font-black text-xs uppercase tracking-[0.4em] hover:bg-secondary hover:text-white transition-all shadow-2xl overflow-hidden rounded-none"
                   onClick={() => window.location.href = '/submit'}
                 >
                   <span className="relative z-10">Initiate Manuscript</span>
                   <div className="absolute inset-0 bg-foreground translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 opacity-10"></div>
                 </button>
                 
                 <button 
                   className="relative border-2 border-white/20 text-white px-16 py-8 font-headline font-black text-xs uppercase tracking-[0.4em] hover:bg-white/10 transition-colors rounded-none"
                   onClick={() => window.location.href = '/auth'}
                 >
                   Registry Login
                 </button>
              </div>
              
              <div className="mt-20 flex justify-center gap-12 font-headline font-black text-[9px] uppercase tracking-[0.6em] text-white/20 italic">
                 <span>Continental Archive</span>
                 <span className="text-white/5 shrink-0">•</span>
                 <span>Academic Synergy</span>
                 <span className="text-white/5 shrink-0">•</span>
                 <span>Global Discovery</span>
              </div>
           </div>
        </div>
      </ContentSection>

      {/* Support Ledger Section */}
      <ContentSection>
        <div className="max-w-4xl mx-auto bg-white border border-border/10 p-12 flex flex-col md:flex-row items-center gap-12 group cursor-pointer hover:shadow-2xl transition-all duration-700">
           <div className="p-8 bg-secondary/5 border border-secondary/10 group-hover:rotate-12 transition-transform"><AlertCircle className="h-10 w-10 text-secondary" /></div>
           <div>
              <h4 className="font-headline font-black text-2xl uppercase tracking-tighter mb-2">Technical Directorate Support</h4>
              <p className="font-body text-foreground/40 text-lg italic leading-relaxed">Encountering submission impediments? Our technical directorate provides 24/7 assistance for manuscript archival through <span className="text-primary hover:underline">editor.ijsds@gmail.com</span></p>
           </div>
        </div>
      </ContentSection>
    </div>
  );
};

export default SubmissionGuidelines;