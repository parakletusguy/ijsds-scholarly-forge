import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, Search, BookOpen, FileText, Ban, Info, Mail, ShieldCheck, Zap, Scale, Gavel } from "lucide-react";
import { PageHeader, ContentSection } from "@/components/layout/PageElements";

export const PlagiarismPolicy = () => {
  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <PageHeader 
        title="Scholarly" 
        subtitle="Ethics" 
        accent="Academic Integrity Audit"
        description="Our unwavering commitment to ethical publishing and a zero-tolerance approach to scholarly misconduct. IJSDS implements rigorous archival verification to ensure the authenticity of the African scholarly record."
      />

      {/* Institutional Integrity Audit — High Fidelity Introduction */}
      <ContentSection>
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32 relative group">
          {/* Aesthetic Motif */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-border/20 -z-10 group-hover:bg-primary/20 transition-colors duration-1000"></div>
          
          <div className="w-full lg:w-2/5 relative">
            <div className="absolute inset-0 bg-primary/5 -translate-x-10 translate-y-10 -z-10 transition-transform group-hover:translate-x-0 group-hover:translate-y-0 duration-1000"></div>
            <div className="bg-white p-16 shadow-2xl border border-border/20 text-center relative z-10 flex flex-col items-center">
              <div className="p-8 bg-foreground text-white shadow-xl mb-10 rotate-3 transition-transform group-hover:-rotate-3"><Shield size={64} /></div>
              <div className="h-2 w-24 bg-secondary mb-8"></div>
              <p className="font-headline font-black text-xs uppercase tracking-[0.4em] text-foreground/30 mb-2">Governance Protocol</p>
              <p className="font-headline font-black text-lg uppercase tracking-widest text-primary">Zero Tolerance</p>
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
              Upholding the <br/><span className="text-primary italic">Strictest Standards</span>
            </h2>
            <p className="text-2xl md:text-3xl font-body italic text-foreground/40 leading-relaxed mb-10">
              The International Journal of Social Work and Development Studies (IJSDS) is committed to the highest standards of <span className="text-foreground font-headline font-black uppercase text-xl leading-relaxed tracking-tight">Academic Integrity.</span>
            </p>
            <p className="text-lg text-foreground/60 font-body leading-relaxed max-w-2xl">
              We leverage state-of-the-art plagiarism detection protocols (including Crossref Similarity Check) for every manuscript. Our mission is to protect the scholarly authenticity of multidisciplinary research in social work and development.
            </p>
          </div>
        </div>
      </ContentSection>

      {/* Misconduct Definition Matrix — Dark/High-Fidelity Cards */}
      <ContentSection dark title="Defining Scholarly Misconduct">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="bg-white p-12 shadow-2xl relative overflow-hidden group">
            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 transition-transform group-hover:scale-125" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
            
            <div className="flex items-center gap-6 mb-12">
               <div className="w-14 h-14 bg-primary text-white flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12"><FileText size={24} /></div>
               <h3 className="text-3xl font-black font-headline uppercase tracking-tighter">Plagiarism Parameters</h3>
            </div>
            <ul className="space-y-6 font-body text-lg text-foreground/70 italic border-l-4 border-secondary/20 pl-8">
               <li className="flex gap-4 group/li transition-colors hover:text-foreground">
                  <span className="font-headline font-black text-secondary/30 mt-1.5">•</span>
                  Direct transcription of text/data without formal citation.
               </li>
               <li className="flex gap-4 group/li transition-colors hover:text-foreground">
                  <span className="font-headline font-black text-secondary/30 mt-1.5">•</span>
                  Substantial paraphrasing lacking institutional attribution.
               </li>
               <li className="flex gap-4 group/li transition-colors hover:text-foreground">
                  <span className="font-headline font-black text-secondary/30 mt-1.5">•</span>
                  Unlicensed extraction of figures, tables, or structural logic.
               </li>
               <li className="flex gap-4 group/li transition-colors hover:text-foreground">
                  <span className="font-headline font-black text-secondary/30 mt-1.5">•</span>
                  Self-plagiarism (Double-dipping archival submissions).
               </li>
               <li className="flex gap-4 group/li transition-colors hover:text-foreground">
                  <span className="font-headline font-black text-secondary/30 mt-1.5">•</span>
                  Undisclosed reliance on systemic AI-generated content.
               </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             {[
               { icon: <AlertTriangle className="h-6 w-6" />, title: "Direct Breach", desc: "Verbatim reproduction of external archives." },
               { icon: <Zap className="h-6 w-6" />, title: "Mosaic Infringement", desc: "Structural synthesis of uncredited fragments." },
               { icon: <BookOpen className="h-6 w-6" />, title: "Archival Redundancy", desc: "Recycling previously validated work." },
               { icon: <Scale className="h-6 w-6" />, title: "Ethics Failure", desc: "Intentional lack of multidisciplinary attribution." }
             ].map((t, idx) => (
               <div key={idx} className="bg-white/5 p-8 border border-white/10 hover:bg-white hover:shadow-2xl hover:text-foreground transition-all duration-700 group/card cursor-pointer">
                  <div className="text-secondary group-hover/card:text-primary transition-colors mb-6 flex justify-between items-start">
                     <div className="w-12 h-12 bg-white/10 flex items-center justify-center border border-white/10 group-hover/card:bg-foreground group-hover/card:text-white transition-all shadow-inner">{t.icon}</div>
                     <span className="font-headline font-black text-[10px] text-white/5 opacity-0 group-hover/card:opacity-20 transition-opacity uppercase tracking-widest">Protocol {idx+1}</span>
                  </div>
                  <h4 className="font-headline font-black text-md uppercase tracking-tight mb-3 transition-colors">{t.title}</h4>
                  <p className="font-body text-white/40 group-hover/card:text-foreground/40 text-xs italic leading-relaxed">{t.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </ContentSection>

      {/* Enforcement & Consequences — Block Motif Treatment */}
      <ContentSection title="Enforcement Protocol">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-foreground text-white p-12 md:p-20 relative overflow-hidden group shadow-2xl border border-white/5">
             {/* Background Shape */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -z-0 opacity-20 -translate-y-1/2 translate-x-1/2" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
             
             <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 border border-white/20 flex items-center justify-center mb-10 shadow-inner"><Ban className="h-8 w-8 text-secondary" /></div>
                <h3 className="text-4xl font-black font-headline uppercase tracking-tighter mb-10 leading-[0.85]">Pre-Publication <br/>Registry Reject</h3>
                <ul className="space-y-6 font-headline text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">
                    <li className="flex items-center gap-4 group/li transition-all"><div className="w-3 h-3 bg-secondary shrink-0 group-hover/li:rotate-45 transition-transform"></div> Immediate Submission Termination</li>
                    <li className="flex items-center gap-4 group/li transition-all"><div className="w-3 h-3 bg-secondary shrink-0 group-hover/li:rotate-45 transition-transform"></div> Formal Institutional Governance Report</li>
                    <li className="flex items-center gap-4 group/li transition-all"><div className="w-3 h-3 bg-secondary shrink-0 group-hover/li:rotate-45 transition-transform"></div> 3-Year Blacklist from Global Registry</li>
                </ul>
             </div>
          </div>

          <div className="bg-white border-4 border-foreground p-12 md:p-20 relative overflow-hidden group shadow-2xl">
             {/* Dramatic Semi-Circle Accent */}
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 opacity-20 -z-0 translate-y-1/2 -translate-x-1/2 pointer-events-none" style={{ clipPath: 'circle(50% at 50% 50%)' }}></div>
             
             <div className="relative z-10">
                <div className="w-16 h-16 bg-foreground text-white flex items-center justify-center mb-10 shadow-xl"><Gavel className="h-8 w-8" /></div>
                <h3 className="text-4xl font-black font-headline uppercase tracking-tighter mb-10 leading-[0.85]">Post-Publication <br/><span className="text-primary italic">Purge & Retract</span></h3>
                <ul className="space-y-6 font-headline text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">
                    <li className="flex items-center gap-4 group/li transition-all"><div className="w-3 h-3 bg-primary shrink-0 group-hover/li:rotate-90 transition-transform"></div> Immediate Archival Retraction</li>
                    <li className="flex items-center gap-4 group/li transition-all"><div className="w-3 h-3 bg-primary shrink-0 group-hover/li:rotate-90 transition-transform"></div> Permanent Ban from Global Registry</li>
                    <li className="flex items-center gap-4 group/li transition-all"><div className="w-3 h-3 bg-primary shrink-0 group-hover/li:rotate-90 transition-transform"></div> COPE Registry Formal Notification</li>
                </ul>
             </div>
          </div>
        </div>
      </ContentSection>

      {/* Institutional Safeguards — High Fidelity Best Practices */}
      <ContentSection dark title="Scholarly Safeguards">
        <div className="bg-white p-16 md:p-32 shadow-2xl relative overflow-hidden group border border-border/10">
          {/* Aesthetic Geometric Motif */}
          <div className="absolute top-0 right-0 w-[600px] h-full bg-secondary/5 opacity-[0.03] -z-0 translate-x-1/2 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 relative z-10">
             <div className="space-y-8 group/card">
                <div className="w-20 h-20 bg-primary/10 flex items-center justify-center border border-primary/10 group-hover/card:bg-primary group-hover/card:text-white transition-all shadow-inner"><Search className="h-8 w-8 text-primary group-hover/card:text-white transition-colors" /></div>
                <div>
                   <h4 className="font-headline font-black text-2xl uppercase tracking-tighter mb-4">Rigorous Citation</h4>
                   <p className="font-body text-foreground/40 italic text-lg leading-relaxed">Adherence to the latest APA 7th Edition hierarchy for every in-text citation and multidisciplinary reference ledger entry.</p>
                </div>
             </div>
             <div className="space-y-8 group/card">
                <div className="w-20 h-20 bg-secondary/10 flex items-center justify-center border border-secondary/10 group-hover/card:bg-secondary group-hover/card:text-white transition-all shadow-inner"><BookOpen className="h-8 w-8 text-secondary group-hover/card:text-white transition-colors" /></div>
                <div>
                   <h4 className="font-headline font-black text-2xl uppercase tracking-tighter mb-4">Integrity Synthesis</h4>
                   <p className="font-body text-foreground/40 italic text-lg leading-relaxed">Synthesize external ideas through thorough intellectual interpretation rather than superficial linguistic modification.</p>
                </div>
             </div>
             <div className="space-y-8 group/card">
                <div className="w-20 h-20 bg-foreground/5 flex items-center justify-center border border-foreground/5 group-hover/card:bg-foreground group-hover/card:text-white transition-all shadow-inner"><Info className="h-8 w-8 text-foreground group-hover/card:text-white transition-colors" /></div>
                <div>
                   <h4 className="font-headline font-black text-2xl uppercase tracking-tighter mb-4">Pre-emptive Audit</h4>
                   <p className="font-body text-foreground/40 italic text-lg leading-relaxed">Authors are mandated to disclose potential archival overlaps and any reliance on generative intelligence frameworks.</p>
                </div>
             </div>
          </div>
        </div>
      </ContentSection>

      {/* Reporting Ledger Footer */}
      <ContentSection>
        <div className="max-w-5xl mx-auto border-t border-border/20 py-32 text-center">
            <ShieldCheck size={32} className="mx-auto text-secondary mb-10 animate-pulse" />
           <h3 className="text-4xl md:text-5xl font-black font-headline uppercase tracking-tighter mb-8 leading-none">Execute Plagiarism Audit</h3>
           <p className="text-2xl font-body text-foreground/30 italic mb-12 max-w-3xl mx-auto">All reports are handled within the strict confidentiality of our ethical governance board and investigated with scholarly rigor.</p>
           
           <div className="flex flex-col items-center gap-8">
              <a href="mailto:editor.ijsds@gmail.com" className="group relative inline-flex items-center gap-6 bg-foreground text-white px-16 py-8 font-headline font-black text-xs uppercase tracking-[0.4em] hover:bg-primary transition-all shadow-2xl overflow-hidden rounded-none">
                <span className="relative z-10 flex items-center gap-4"><Mail className="h-5 w-5" /> editor.ijsds@gmail.com</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-20"></div>
              </a>
              
              <div className="flex items-center gap-12 font-headline font-black text-xs uppercase tracking-[0.6em] text-foreground/10 italic">
                 <span>Global Ethics Shield</span>
                 <span className="text-foreground/5 shrink-0">•</span>
                 <span>Global Archival Integrity</span>
              </div>
           </div>
        </div>
      </ContentSection>
    </div>
  );
};

export default PlagiarismPolicy;
