import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, ContentSection } from "@/components/layout/PageElements";
import { ShieldCheck, Scale, Award, Info, FileText, Lock, Globe, Key, AlertTriangle, CheckCircle2 } from "lucide-react";

const Copyright = () => {
  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <PageHeader 
        title="Scholarly" 
        subtitle="Rights" 
        accent="Intellectual Contributions Registry"
        description="A high-fidelity framework governing intellectual property, licensing, and author rights within the global multidisciplinary research commons. Protecting the intellectual contributions to social work and development."
      />

      {/* Licensing Core — Premium Scholarly Highlight */}
      <ContentSection>
        <div className="flex flex-col lg:flex-row items-stretch gap-16 lg:gap-24 relative group">
          {/* Background Decorative Element */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border/20 -z-0 group-hover:bg-primary/20 transition-colors duration-1000"></div>
          
          <div className="w-full lg:w-3/5">
            <div className="bg-white border-4 border-foreground p-12 md:p-24 relative overflow-hidden shadow-2xl h-full flex flex-col justify-center">
              {/* Afrocentric Geometric Motif */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 -z-0 translate-x-12 -translate-y-12 rotate-12 transition-transform group-hover:rotate-45" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
              
              <div className="relative z-10">
                 <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-foreground text-white flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform duration-700">
                      <Scale size={32} className="text-secondary" />
                   </div>
                   <div className="space-y-1">
                      <p className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/30">Governance Standard</p>
                      <h2 className="text-3xl md:text-5xl font-black font-headline uppercase tracking-tighter leading-none">Creative Commons <br/><span className="text-primary italic">Attribution 4.0</span></h2>
                   </div>
                 </div>
                 
                 <p className="text-2xl md:text-3xl font-body italic text-foreground/40 leading-relaxed mb-12">
                   IJSDS operates under the <span className="text-foreground font-headline font-black uppercase text-xl tracking-tight">Open Access Protocol.</span> Authors retain full copyright while granting the journal a perpetual license for global dissemination.
                 </p>
                 
                 <div className="bg-secondary/5 p-8 border-l-8 border-secondary relative overflow-hidden">
                    <p className="font-body text-foreground/60 text-lg leading-relaxed relative z-10">
                       This framework empowers authors to maximize the reach of their multidisciplinary synthesis while maintaining absolute sovereignty over their intellectual property.
                    </p>
                    <Info className="absolute bottom-4 right-6 text-secondary/10 h-16 w-16" />
                 </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/5 flex flex-col gap-8">
             <div className="bg-foreground text-white p-12 relative overflow-hidden group/card shadow-2xl flex-grow flex flex-col justify-center border border-white/5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -z-0 opacity-20 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                <div className="relative z-10">
                   <Globe className="h-10 w-10 text-secondary mb-8 transition-transform group-hover/card:-translate-y-2" />
                   <h3 className="text-2xl font-black font-headline uppercase tracking-tighter mb-4">Universal Visibility</h3>
                   <p className="font-body text-white/40 italic leading-relaxed">Ensure your research is permanent, metadata-enhanced, and accessible across the global scholarly grid.</p>
                </div>
             </div>
             <div className="bg-white border border-border/20 p-12 relative overflow-hidden group/card shadow-xl flex-grow flex flex-col justify-center">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 -z-0 opacity-20 pointer-events-none" style={{ clipPath: 'circle(50% at 0 100%)' }}></div>
                <div className="relative z-10">
                   <Lock className="h-10 w-10 text-primary mb-8 transition-transform group-hover/card:translate-y-2" />
                   <h3 className="text-2xl font-black font-headline uppercase tracking-tighter mb-4">Author Control</h3>
                   <p className="font-body text-foreground/30 italic leading-relaxed">Authors are not required to transfer title; they remain the primary owners of their archival record.</p>
                </div>
             </div>
          </div>
        </div>
      </ContentSection>

      {/* Rights Ledger — Detailed Registry Grid */}
      <ContentSection dark title="Scholarly Rights Ledger">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {[
            { 
                icon: <ShieldCheck className="h-8 w-8" />, 
                title: "Copyright Retention", 
                desc: "Authors maintain primary ownership of the submitted manuscript throughout the archival lifecycle.",
                accent: "primary"
            },
            { 
                icon: <Award className="h-8 w-8" />, 
                title: "Archival Attribution", 
                desc: "Universal requirement for third parties to credit the original author and journal in all subsequent iterations.",
                accent: "secondary"
            },
            { 
                icon: <Key className="h-8 w-8" />, 
                title: "Exploitation Liberty", 
                desc: "Freedom to repurpose, translate, and synthesize the published work in future multidiciplinary monographs.",
                accent: "foreground"
            }
          ].map((item, idx) => (
            <div key={idx} className="group relative bg-white p-12 border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full overflow-hidden">
               {/* Abstract Motif */}
               <div className={`absolute top-0 right-0 w-20 h-20 bg-${item.accent}/5 group-hover:scale-150 transition-transform duration-1000`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
               
               <div className={`w-16 h-16 bg-${item.accent}/10 flex items-center justify-center text-${item.accent} mb-12 border border-${item.accent}/10 group-hover:bg-foreground group-hover:text-white transition-all shadow-inner`}>
                   {item.icon}
               </div>

               <div className="h-1 w-12 bg-border mb-10 transition-all group-hover:w-full group-hover:bg-primary duration-700"></div>
               
               <h3 className="text-2xl font-black font-headline uppercase tracking-tighter mb-6 group-hover:text-primary transition-colors leading-tight">
                  {item.title}
               </h3>
               <p className="font-body text-foreground/40 italic text-md leading-relaxed mb-auto">
                  {item.desc}
               </p>
               
               <div className="mt-12 flex items-center gap-3 font-headline font-black text-[9px] uppercase tracking-widest text-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 size={12} className="text-secondary" /> Registry Protocol {idx + 1}
               </div>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* Institutional Safeguards — High Fidelity Responsibilities */}
      <ContentSection title="Ethical Mandate">
        <div className="bg-foreground text-white p-16 md:p-32 shadow-2xl relative overflow-hidden group border border-white/5">
           {/* Complex Geometric Pattern */}
           <div className="absolute top-0 right-0 w-full h-full bg-white opacity-[0.01] -z-0 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
           
           <div className="max-w-4xl relative z-10">
              <div className="w-20 h-20 bg-secondary text-white flex items-center justify-center mb-16 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-1000">
                 <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-5xl md:text-8xl font-black font-headline uppercase tracking-tighter mb-16 leading-[0.85]">Author <br/><span className="text-secondary italic">Responsibilities</span></h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                 <div className="space-y-6">
                    <div className="flex items-center gap-4 text-primary">
                       <div className="h-0.5 w-12 bg-primary"></div>
                       <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-white/40 italic">Governance Area 01</span>
                    </div>
                    <h4 className="text-2xl font-black font-headline uppercase tracking-tight">Originality Warranty</h4>
                    <p className="font-body text-white/50 italic text-lg leading-relaxed">Authors must certify that the submission is an original intellectual synthesis and does not infringe upon external copyright archives.</p>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4 text-primary">
                       <div className="h-0.5 w-12 bg-primary"></div>
                       <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-white/40 italic">Governance Area 02</span>
                    </div>
                    <h4 className="text-2xl font-black font-headline uppercase tracking-tight">Attribution Integrity</h4>
                    <p className="font-body text-white/50 italic text-lg leading-relaxed">Every external data fragment, figure, or conceptual model must be correctly attributed within the multidisciplinary reference ledger.</p>
                 </div>
              </div>
           </div>
        </div>
      </ContentSection>

      {/* Support Ledger Footer */}
      <ContentSection>
        <div className="max-w-5xl mx-auto py-32 text-center border-y border-border/20 relative overflow-hidden group">
            <div className="absolute top-1/2 left-0 w-full h-px bg-border -z-10 group-hover:bg-primary/20 transition-colors duration-1000"></div>
            <div className="bg-secondary/5 inline-block px-12 py-4 relative z-10 mb-12 border border-border/10">
               <FileText className="h-6 w-6 text-secondary mx-auto" />
            </div>
            
            <p className="font-headline text-3xl md:text-6xl font-black text-foreground uppercase tracking-tighter italic leading-none max-w-5xl mx-auto relative z-10 mb-16">
              "Protecting the <span className="text-primary italic">Global Voice</span> of Social Work Scholarship."
            </p>
            
            <div className="flex flex-col items-center gap-8 relative z-10">
               <div className="flex items-center gap-12 font-headline font-black text-xs uppercase tracking-[0.6em] text-foreground/10 italic">
                  <span>Open Access Registry</span>
                  <span className="text-foreground/5 shrink-0">•</span>
                  <span>Intellectual Shield</span>
                  <span className="text-foreground/5 shrink-0">•</span>
                  <span>Continental Impact</span>
               </div>
            </div>
        </div>
      </ContentSection>
    </div>
  );
};

export default Copyright;