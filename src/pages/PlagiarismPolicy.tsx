import { Shield, AlertTriangle, BookOpen, FileText, Ban, Mail, ShieldCheck, Zap, Scale, Gavel, Search } from "lucide-react";
import { PageHeader, ContentSection } from "@/components/layout/PageElements";

export const PlagiarismPolicy = () => {
  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <PageHeader 
        title="Plagiarism" 
        subtitle="Policy" 
        accent="Academic Integrity"
        description="Our unwavering commitment to ethical publishing and a zero-tolerance approach to plagiarism and academic dishonesty in all submitted manuscripts."
      />

      {/* Introduction */}
      <ContentSection>
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32 relative group">
          <div className="absolute top-1/2 left-0 w-full h-px bg-border/20 -z-10 group-hover:bg-primary/20 transition-colors duration-1000"></div>
          
          <div className="w-full lg:w-2/5 relative">
            <div className="absolute inset-0 bg-primary/5 -translate-x-10 translate-y-10 -z-10 transition-transform group-hover:translate-x-0 group-hover:translate-y-0 duration-1000"></div>
            <div className="bg-white p-16 shadow-2xl border border-border/20 text-center relative z-10 flex flex-col items-center">
              <div className="p-8 bg-foreground text-white shadow-xl mb-10 rotate-3 transition-transform group-hover:-rotate-3"><Shield size={64} /></div>
              <div className="h-2 w-24 bg-secondary mb-8"></div>
              <p className="font-headline font-black text-xs uppercase tracking-[0.4em] text-foreground/30 mb-2">Our Commitment</p>
              <p className="font-headline font-black text-lg uppercase tracking-widest text-primary">Zero Tolerance</p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 -z-10 translate-x-8 -translate-y-8" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
          </div>

          <div className="w-full lg:w-3/5">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-0.5 w-16 bg-primary"></div>
               <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/40 italic">Our Mandate</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black font-headline uppercase tracking-tighter mb-10 leading-[0.85] text-foreground">
              Upholding the <br/><span className="text-primary italic">Strictest Standards</span>
            </h2>
            <p className="text-2xl md:text-3xl font-body italic text-foreground/40 leading-relaxed mb-10">
              The International Journal of Social Work and Development Studies (IJSDS) is committed to the highest standards of <span className="text-foreground font-headline font-black uppercase text-xl leading-relaxed tracking-tight">Academic Integrity.</span>
            </p>
            <p className="text-lg text-foreground/60 font-body leading-relaxed max-w-2xl">
              We use Crossref Similarity Check to screen every manuscript for plagiarism before publication. Our mission is to protect the authenticity and originality of all research we publish.
            </p>
          </div>
        </div>
      </ContentSection>

      {/* What counts as plagiarism */}
      <ContentSection dark title="What Counts as Plagiarism">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="bg-white p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 transition-transform group-hover:scale-125" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
            
            <div className="flex items-center gap-6 mb-12">
               <div className="w-14 h-14 bg-primary text-white flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12"><FileText size={24} /></div>
               <h3 className="text-3xl font-black font-headline uppercase tracking-tighter">Forms of Plagiarism</h3>
            </div>
            <ul className="space-y-6 font-body text-lg text-foreground/70 italic border-l-4 border-secondary/20 pl-8">
               <li className="flex gap-4 hover:text-foreground transition-colors">
                  <span className="font-headline font-black text-secondary/30 mt-1.5">•</span>
                  Copying text from another source word-for-word without a citation.
               </li>
               <li className="flex gap-4 hover:text-foreground transition-colors">
                  <span className="font-headline font-black text-secondary/30 mt-1.5">•</span>
                  Paraphrasing another author's work without giving them credit.
               </li>
               <li className="flex gap-4 hover:text-foreground transition-colors">
                  <span className="font-headline font-black text-secondary/30 mt-1.5">•</span>
                  Using figures, tables, or research designs without permission or attribution.
               </li>
               <li className="flex gap-4 hover:text-foreground transition-colors">
                  <span className="font-headline font-black text-secondary/30 mt-1.5">•</span>
                  Submitting your own previously published work as new (self-plagiarism).
               </li>
               <li className="flex gap-4 hover:text-foreground transition-colors">
                  <span className="font-headline font-black text-secondary/30 mt-1.5">•</span>
                  Presenting undisclosed AI-generated content as original research.
               </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             {[
               { icon: <AlertTriangle className="h-6 w-6" />, title: "Direct Copying", desc: "Reproducing another author's exact words without quotation marks or citation." },
               { icon: <Zap className="h-6 w-6" />, title: "Patchwork Writing", desc: "Piecing together text from multiple sources without proper attribution." },
               { icon: <BookOpen className="h-6 w-6" />, title: "Self-Plagiarism", desc: "Re-submitting your own previously published work as an original contribution." },
               { icon: <Scale className="h-6 w-6" />, title: "Improper Attribution", desc: "Deliberately omitting credit to original authors or sources." }
             ].map((t, idx) => (
               <div key={idx} className="bg-white/5 p-8 border border-white/10 hover:bg-white hover:shadow-2xl hover:text-foreground transition-all duration-700 group/card cursor-pointer">
                  <div className="text-secondary group-hover/card:text-primary transition-colors mb-6 flex justify-between items-start">
                     <div className="w-12 h-12 bg-white/10 flex items-center justify-center border border-white/10 group-hover/card:bg-foreground group-hover/card:text-white transition-all shadow-inner">{t.icon}</div>
                  </div>
                  <h4 className="font-headline font-black text-md uppercase tracking-tight mb-3 transition-colors">{t.title}</h4>
                  <p className="font-body text-white/40 group-hover/card:text-foreground/40 text-xs italic leading-relaxed">{t.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </ContentSection>

      {/* Consequences */}
      <ContentSection title="Consequences of Plagiarism">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-foreground text-white p-12 md:p-20 relative overflow-hidden group shadow-2xl border border-white/5">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -z-0 opacity-20 -translate-y-1/2 translate-x-1/2" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
             
             <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 border border-white/20 flex items-center justify-center mb-10 shadow-inner"><Ban className="h-8 w-8 text-secondary" /></div>
                <h3 className="text-4xl font-black font-headline uppercase tracking-tighter mb-10 leading-[0.85]">Before<br />Publication</h3>
                <ul className="space-y-6 font-headline text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">
                    <li className="flex items-center gap-4 group/li"><div className="w-3 h-3 bg-secondary shrink-0 group-hover/li:rotate-45 transition-transform"></div> Manuscript is immediately rejected</li>
                    <li className="flex items-center gap-4 group/li"><div className="w-3 h-3 bg-secondary shrink-0 group-hover/li:rotate-45 transition-transform"></div> Formal notice sent to the author's institution</li>
                    <li className="flex items-center gap-4 group/li"><div className="w-3 h-3 bg-secondary shrink-0 group-hover/li:rotate-45 transition-transform"></div> Author barred from submitting for 3 years</li>
                </ul>
             </div>
          </div>

          <div className="bg-white border-4 border-foreground p-12 md:p-20 relative overflow-hidden group shadow-2xl">
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 opacity-20 -z-0 translate-y-1/2 -translate-x-1/2 pointer-events-none" style={{ clipPath: 'circle(50% at 50% 50%)' }}></div>
             
             <div className="relative z-10">
                <div className="w-16 h-16 bg-foreground text-white flex items-center justify-center mb-10 shadow-xl"><Gavel className="h-8 w-8" /></div>
                <h3 className="text-4xl font-black font-headline uppercase tracking-tighter mb-10 leading-[0.85]">
                  After<br /><span className="text-primary italic">Publication</span>
                </h3>
                <ul className="space-y-6 font-headline text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">
                    <li className="flex items-center gap-4 group/li"><div className="w-3 h-3 bg-primary shrink-0 group-hover/li:rotate-90 transition-transform"></div> Article is immediately retracted</li>
                    <li className="flex items-center gap-4 group/li"><div className="w-3 h-3 bg-primary shrink-0 group-hover/li:rotate-90 transition-transform"></div> Author is permanently banned from the journal</li>
                    <li className="flex items-center gap-4 group/li"><div className="w-3 h-3 bg-primary shrink-0 group-hover/li:rotate-90 transition-transform"></div> COPE is formally notified</li>
                </ul>
             </div>
          </div>
        </div>
      </ContentSection>

      {/* Best Practices */}
      <ContentSection dark title="Best Practices for Authors">
        <div className="bg-white p-16 md:p-32 shadow-2xl relative overflow-hidden group border border-border/10">
          <div className="absolute top-0 right-0 w-[600px] h-full bg-secondary/5 opacity-[0.03] -z-0 translate-x-1/2 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 relative z-10">
             <div className="space-y-8 group/card">
                <div className="w-20 h-20 bg-primary/10 flex items-center justify-center border border-primary/10 group-hover/card:bg-primary group-hover/card:text-white transition-all shadow-inner"><Search className="h-8 w-8 text-primary group-hover/card:text-white transition-colors" /></div>
                <div>
                   <h4 className="font-headline font-black text-2xl uppercase tracking-tighter mb-4">Cite Everything</h4>
                   <p className="font-body text-foreground/40 italic text-lg leading-relaxed">Follow APA 7th Edition for all in-text citations and your reference list. When in doubt, cite the source.</p>
                </div>
             </div>
             <div className="space-y-8 group/card">
                <div className="w-20 h-20 bg-secondary/10 flex items-center justify-center border border-secondary/10 group-hover/card:bg-secondary group-hover/card:text-white transition-all shadow-inner"><BookOpen className="h-8 w-8 text-secondary group-hover/card:text-white transition-colors" /></div>
                <div>
                   <h4 className="font-headline font-black text-2xl uppercase tracking-tighter mb-4">Write in Your Own Words</h4>
                   <p className="font-body text-foreground/40 italic text-lg leading-relaxed">When using another author's ideas, fully rewrite them in your own words — not just a word swap — and always credit the original source.</p>
                </div>
             </div>
             <div className="space-y-8 group/card">
                <div className="w-20 h-20 bg-foreground/5 flex items-center justify-center border border-foreground/5 group-hover/card:bg-foreground group-hover/card:text-white transition-all shadow-inner"><Shield className="h-8 w-8 text-foreground group-hover/card:text-white transition-colors" /></div>
                <div>
                   <h4 className="font-headline font-black text-2xl uppercase tracking-tighter mb-4">Disclose Overlaps</h4>
                   <p className="font-body text-foreground/40 italic text-lg leading-relaxed">If your manuscript builds on your own previous work or uses AI assistance in any form, you must disclose this clearly in your submission.</p>
                </div>
             </div>
          </div>
        </div>
      </ContentSection>

      {/* Report CTA */}
      <ContentSection>
        <div className="max-w-5xl mx-auto border-t border-border/20 py-32 text-center">
            <ShieldCheck size={32} className="mx-auto text-secondary mb-10 animate-pulse" />
           <h3 className="text-4xl md:text-5xl font-black font-headline uppercase tracking-tighter mb-8 leading-none">Report Suspected Plagiarism</h3>
           <p className="text-2xl font-body text-foreground/30 italic mb-12 max-w-3xl mx-auto">All reports are handled in strict confidence by our editorial team and investigated thoroughly with appropriate action taken.</p>
           
           <div className="flex flex-col items-center gap-8">
              <a href="mailto:editor.ijsds@gmail.com" className="group relative inline-flex items-center gap-6 bg-foreground text-white px-16 py-8 font-headline font-black text-xs uppercase tracking-[0.4em] hover:bg-primary transition-all shadow-2xl overflow-hidden rounded-none">
                <span className="relative z-10 flex items-center gap-4"><Mail className="h-5 w-5" /> editor.ijsds@gmail.com</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-20"></div>
              </a>
           </div>
        </div>
      </ContentSection>
    </div>
  );
};

export default PlagiarismPolicy;
