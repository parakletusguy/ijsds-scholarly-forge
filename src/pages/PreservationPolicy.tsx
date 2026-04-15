import { HardDrive, Globe, Lock, Layers, ShieldCheck, Archive, Activity } from "lucide-react";
import { PageHeader, ContentSection } from "@/components/layout/PageElements";

export const PreservationPolicy = () => {
  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <PageHeader 
        title="Digital" 
        subtitle="Preservation" 
        accent="Long-Term Access"
        description="Ensuring that every article published in IJSDS remains permanently available and accessible to readers around the world, now and for future generations."
      />

      {/* Introduction */}
      <ContentSection>
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32 relative group">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border/20 -z-0 group-hover:bg-primary/20 transition-colors duration-1000"></div>
          
          <div className="w-full lg:w-3/5">
            <div className="flex items-center gap-4 mb-10">
               <div className="h-1 w-20 bg-secondary"></div>
               <span className="font-headline font-black text-[11px] uppercase tracking-[0.5em] text-foreground/40 italic">Our Commitment</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black font-headline uppercase tracking-tighter mb-10 leading-[0.85] text-foreground">
              Protecting <br/><span className="text-primary italic">Scholarly Work</span>
            </h2>
            <p className="text-2xl md:text-3xl font-body italic text-foreground/40 leading-relaxed mb-12 max-w-4xl">
              IJSDS takes seriously its responsibility to keep published research available for the long term. Our preservation system ensures every article remains intact and accessible.
            </p>
            <p className="text-lg text-foreground/60 font-body leading-relaxed max-w-2xl border-l-4 border-primary pl-8 py-4 bg-primary/5">
              We use multiple backup systems and partner with international preservation services to protect against data loss in all scenarios.
            </p>
          </div>

          <div className="w-full lg:w-2/5 relative">
            <div className="absolute inset-0 bg-primary/5 rotate-3 -z-10 group-hover:rotate-0 transition-transform duration-1000"></div>
            <div className="bg-white p-16 shadow-2xl border border-border/20 text-center relative z-10 flex flex-col items-center overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 -z-0 rotate-45 translate-x-12 -translate-y-12"></div>
               <div className="w-24 h-24 bg-foreground text-white flex items-center justify-center mb-10 shadow-2xl relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-700"><Archive size={40} /></div>
               <div className="h-1.5 w-20 bg-secondary mb-10"></div>
               <p className="font-headline font-black text-xs uppercase tracking-[0.4em] text-foreground/30 mb-2">Preservation Status</p>
               <p className="font-headline font-black text-xl uppercase tracking-widest text-primary italic">Permanent Access</p>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Preservation methods */}
      <ContentSection dark title="How We Preserve Your Research">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {[
            { 
                icon: <Archive className="h-8 w-8" />, 
                title: "International Archives", 
                desc: "We work with CLOCKSS and Portico — trusted global archives — to ensure your published articles are safely stored and can always be recovered if our platform has issues.",
                accent: "primary"
            },
            { 
                icon: <Globe className="h-8 w-8" />, 
                title: "Permanent Links (DOIs)", 
                desc: "Every article receives a Digital Object Identifier (DOI) — a permanent web link that never breaks, ensuring your research can always be found and cited correctly.",
                accent: "secondary"
            },
            { 
                icon: <Lock className="h-8 w-8" />, 
                title: "Self-Archiving Welcome", 
                desc: "Authors are encouraged to upload their published articles to their institution's own repository. This creates an additional independent copy that further protects the work.",
                accent: "foreground"
            }
          ].map((item, idx) => (
            <div key={idx} className="group relative bg-white p-12 border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full overflow-hidden">
               <div className={`absolute top-0 right-0 w-20 h-20 bg-${item.accent}/5 group-hover:scale-125 transition-transform duration-1000`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
               
               <div className={`w-16 h-16 bg-${item.accent}/10 flex items-center justify-center text-${item.accent} mb-10 border border-${item.accent}/10 group-hover:bg-foreground group-hover:text-white transition-all shadow-inner`}>
                   {item.icon}
               </div>

               <div className="h-0.5 w-12 bg-border mb-8 transition-all group-hover:w-full group-hover:bg-secondary duration-700"></div>
               
               <h3 className="text-2xl font-black font-headline uppercase tracking-tighter mb-6 group-hover:text-primary transition-colors leading-tight">
                  {item.title}
               </h3>
               <p className="font-body text-foreground/40 italic text-md leading-relaxed mb-auto">
                  {item.desc}
               </p>
               
               <div className="mt-12 flex items-center gap-3 font-headline font-black text-[9px] uppercase tracking-widest text-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ShieldCheck size={12} className="text-secondary" /> Active
               </div>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* Technical details */}
      <ContentSection title="Technical Safeguards">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
           <div className="bg-foreground p-16 md:p-24 text-white relative overflow-hidden group shadow-2xl h-full flex flex-col justify-center border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] -translate-y-1/2 translate-x-1/2 rotate-12 pointer-events-none" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 opacity-20 pointer-events-none" style={{ clipPath: 'circle(50% at 0 100%)' }}></div>
              
              <div className="relative z-10">
                 <div className="w-16 h-16 bg-white/10 flex items-center justify-center mb-10 border border-white/10 shadow-inner group-hover:rotate-45 transition-transform duration-700"><HardDrive size={32} className="text-secondary" /></div>
                 <h3 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter mb-10 leading-[0.85]">Metadata <br/><span className="text-secondary italic">Storage</span></h3>
                 <p className="text-xl font-body italic text-white/40 mb-12 leading-relaxed">All article information — authors, abstracts, references — is stored in standard international formats to ensure it can be read and used far into the future.</p>
                 <div className="flex flex-col gap-6">
                    {['Automated Daily Backups', 'Storage in Multiple Locations', 'File Integrity Checks'].map((f, i) => (
                      <div key={i} className="flex items-center gap-6 font-headline font-black text-[10px] uppercase tracking-[0.4em] text-white/60">
                         <div className="w-2 h-2 bg-primary group-hover:rotate-45 transition-transform duration-500"></div> {f}
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-12 h-full flex flex-col justify-center">
              <div className="border border-border/20 p-12 bg-white relative overflow-hidden group hover:shadow-2xl transition-all duration-700 cursor-pointer h-1/2 flex flex-col justify-center">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 transition-transform group-hover:scale-150 duration-700" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                 <Layers className="h-10 w-10 text-primary mb-8 transition-transform group-hover:translate-x-2" />
                 <h4 className="text-3xl font-black font-headline uppercase tracking-tighter mb-4">Version History</h4>
                 <p className="font-body text-foreground/40 italic text-md leading-relaxed max-w-md">Every correction or update to a published article is recorded and archived, so the full history of a paper is always preserved.</p>
              </div>
              <div className="border border-border/20 p-12 bg-white relative overflow-hidden group hover:shadow-2xl transition-all duration-700 cursor-pointer h-1/2 flex flex-col justify-center">
                 <div className="absolute bottom-0 left-0 w-16 h-16 bg-secondary/5 transition-transform group-hover:scale-150 duration-700" style={{ clipPath: 'circle(50% at 0 100%)' }}></div>
                 <Activity className="h-10 w-10 text-secondary mb-8 transition-transform group-hover:-translate-x-2" />
                 <h4 className="text-3xl font-black font-headline uppercase tracking-tighter mb-4">High Availability</h4>
                 <p className="font-body text-foreground/40 italic text-md leading-relaxed max-w-md">We target 99.9% uptime for our journal website, so readers around the world can access published articles at any time.</p>
              </div>
           </div>
        </div>
      </ContentSection>

      {/* Footer */}
      <ContentSection>
        <div className="max-w-5xl mx-auto py-32 text-center border-t border-border/20 relative overflow-hidden group">
            <ShieldCheck size={32} className="mx-auto text-primary mb-12 animate-pulse" />
           <p className="font-headline text-3xl md:text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none max-w-4xl mx-auto mb-16 relative z-10">
             "Preserving <span className="text-secondary italic">African Scholarship</span> for the World."
           </p>
           
           <div className="flex flex-col items-center gap-12">
              <div className="flex flex-wrap justify-center gap-16 font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/20 italic">
                 <span>Long-Term Digital Preservation</span>
                 <span className="text-foreground/5 shrink-0 hidden sm:block">•</span>
                 <span>Permanent Open Access</span>
                 <span className="text-foreground/5 shrink-0 hidden sm:block">•</span>
                 <span>Global Reach</span>
              </div>
              <div className="h-px w-32 bg-border"></div>
           </div>
        </div>
      </ContentSection>
    </div>
  );
};

export default PreservationPolicy;