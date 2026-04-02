import { Helmet } from 'react-helmet-async';
import { PageHeader, ContentSection } from "@/components/layout/PageElements";
import { Globe, Scale, DollarSign, MapPin, Mail, ExternalLink, ShieldCheck, Zap, BookOpen, Layers, Award, Target } from "lucide-react";

export default function OpenAccessPage() {
  const cardClasses = "bg-white p-12 md:p-16 border border-border/10 shadow-sm relative overflow-hidden group";

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body relative overflow-hidden">
      <Helmet>
        <title>Open Access Policy — IJSDS Mandate</title>
        <meta name="description" content="Official institutional mandate for free, unrestricted access to scholarly research for the advancement of social work and development." />
      </Helmet>

      {/* Atmospheric Background Accents */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-primary/5 rounded-full -mr-24 -mt-24 blur-[100px] opacity-30"></div>

      <PageHeader 
        title="Open" 
        subtitle="Access" 
        accent="Democratizing Knowledge"
        description="Our institutional mandate for free, unrestricted access to scholarly research. We believe in the immediate dissemination of intellectual assets for global social advancement."
      />

      {/* Phase-A: The Mandate */}
      <ContentSection>
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="w-full lg:w-1/3 relative group">
             {/* Decorative Motif */}
             <div className="absolute -inset-4 bg-primary/5 -z-10 rotate-3 group-hover:rotate-0 transition-transform duration-700"></div>
             
             <div className="bg-white p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-border/10 text-center relative z-10 flex flex-col items-center">
                <div className="w-32 h-32 bg-primary/5 flex items-center justify-center text-primary mb-10 border border-primary/10 shadow-inner group-hover:scale-110 transition-transform">
                   <Globe className="h-16 w-16 animate-pulse" />
                </div>
                <div className="h-1.5 w-24 bg-secondary mb-8"></div>
                <p className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/40 italic">Universal Distribution</p>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-secondary/5" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>
             </div>
          </div>

          <div className="w-full lg:w-2/3">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-0.5 bg-primary"></div>
                <span className="font-headline font-black text-[11px] uppercase tracking-[0.5em] text-secondary italic">Scholarly Ethos</span>
             </div>
             <h2 className="text-4xl md:text-7xl font-black font-headline uppercase tracking-tighter mb-10 leading-[0.9] text-foreground">
               Knowledge Without <br/><span className="text-secondary italic">Boundaries</span>
             </h2>
             <div className="relative mb-12">
                <p className="text-3xl md:text-4xl font-body italic text-foreground/70 leading-relaxed border-l-8 border-primary/20 pl-10 relative z-10">
                  "All articles are freely available online to anyone, anywhere, immediately upon publication."
                </p>
             </div>
             <p className="text-xl text-foreground/50 font-body leading-[1.8] max-w-3xl">
               The International Journal of Social Work and Development Studies (IJSDS) operates under the **Creative Commons Attribution 4.0 International License (CC BY 4.0)**. This definitive protocol allows the global community to download, distribute, and build upon published work, ensuring that institutional knowledge drives real-world development.
             </p>
          </div>
        </div>
      </ContentSection>

      {/* Phase-B: Institutional Protocols (Licensing) */}
      <ContentSection dark title="Institutional Protocols">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className={cardClasses}>
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
             <div className="flex items-center gap-6 mb-10 pb-6 border-b border-border/10">
                <Scale className="h-10 w-10 text-primary" />
                <h3 className="text-2xl font-black font-headline uppercase tracking-tight">Licensing Ledger</h3>
             </div>
             <p className="font-body text-foreground/60 text-xl italic leading-relaxed">
               Articles are disseminated under **CC BY 4.0** terms, permitting continuous reading, printing, and linking for any lawful investigative purpose without technical restriction.
             </p>
          </div>

          <div className={cardClasses}>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5" style={{ clipPath: 'circle(50% at 0 100%)' }}></div>
             <div className="flex items-center gap-6 mb-10 pb-6 border-b border-border/10">
                <ShieldCheck className="h-10 w-10 text-secondary" />
                <h3 className="text-2xl font-black font-headline uppercase tracking-tight">Copyright Sovereignty</h3>
             </div>
             <p className="font-body text-foreground/60 text-xl italic leading-relaxed">
               Authors retain full intellectual copyright. By publishing within IJSDS, investigators grant the journal the **canonical right of first publication** while maintaining ownership.
             </p>
          </div>
        </div>
      </ContentSection>

      {/* Phase-C: Operational Infrastructure (Author Charges) */}
      <ContentSection title="Operational Infrastructure">
        <div className="bg-foreground text-white p-16 md:p-28 relative overflow-hidden group shadow-2xl border-t-[20px] border-primary">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-[0.03] -z-0" style={{ clipPath: 'polygon(70% 0, 100% 0, 100% 40%)' }}></div>
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 -z-0 opacity-50" style={{ clipPath: 'circle(50% at 0 100%)' }}></div>
           
           <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
              <div>
                 <div className="flex items-center gap-6 mb-10">
                    <Zap className="h-6 w-6 text-secondary animate-pulse" />
                    <span className="font-headline font-black text-xs uppercase tracking-[0.6em] text-white/30 italic">Technical Maintenance Fees</span>
                 </div>
                 <h3 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter mb-10 leading-none text-white">
                    Processing <br/><span className="text-secondary italic">Economics</span>
                 </h3>
                 <p className="text-2xl font-body italic text-white/40 leading-relaxed mb-12">
                   IJSDS does not levy submission or page fees. Required charges strictly cover editorial peer-review workflows and digital production infrastructure.
                 </p>
                 <div className="flex flex-wrap gap-8">
                    <div className="bg-white/5 border border-white/10 px-10 py-8 backdrop-blur-md group-hover:border-secondary transition-all">
                       <p className="font-headline font-black text-4xl mb-2">₦20,500</p>
                       <p className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-secondary italic">APC Ledger</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-10 py-8 backdrop-blur-md group-hover:border-primary transition-all">
                       <p className="font-headline font-black text-4xl mb-2">₦5,125</p>
                       <p className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-primary italic">Vetting Node</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-12 md:p-16 text-foreground relative z-10 shadow-2xl border-l-[16px] border-secondary">
                 <div className="flex items-center gap-4 mb-8">
                    <Award size={20} className="text-secondary" />
                    <h4 className="font-headline font-black text-xl uppercase tracking-tighter">Scholarly Equity Waivers</h4>
                 </div>
                 <p className="font-body text-xl text-foreground/50 italic leading-relaxed mb-10 border-l-4 border-border/10 pl-8">
                   Institutional waivers are available for investigators from low-income domains or those facing verified financial constraints. Intellectual excellence should never be restricted by resource access.
                 </p>
                 <button className="w-full bg-foreground text-white py-6 font-headline font-black text-[10px] uppercase tracking-[0.5em] hover:bg-primary transition-all shadow-xl group/waiver">
                    Request Registry Exemption <ArrowRight size={14} className="inline ml-4 group-hover/waiver:translate-x-2 transition-transform" />
                 </button>
              </div>
           </div>
           
           <div className="mt-24 text-center opacity-10 font-headline font-black text-[9px] uppercase tracking-[0.8em]">
              Financial Protocol v.04 — APC SYNCHRONIZATION
           </div>
        </div>
      </ContentSection>

      {/* Phase-D: Institutional Presence (Publisher Info) */}
      <ContentSection dark title="Institutional Presence">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-12">
           <div className="space-y-8 group/info">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center group-hover/info:bg-primary group-hover/info:text-white transition-all border border-primary/5 shadow-inner">
                 <MapPin className="h-8 w-8" />
              </div>
              <div className="space-y-4">
                 <h4 className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-primary italic">Command Center</h4>
                 <p className="font-body text-xl italic text-foreground/40 leading-relaxed max-w-[250px]">
                   Dept. of Social Work, Faculty of Social Sciences, Rivers State University, Emohua.
                 </p>
              </div>
           </div>
           
           <div className="space-y-8 group/info">
              <div className="w-16 h-16 bg-secondary/10 flex items-center justify-center group-hover/info:bg-secondary group-hover/info:text-white transition-all border border-secondary/5 shadow-inner">
                 <Mail className="h-8 w-8" />
              </div>
              <div className="space-y-4">
                 <h4 className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-secondary italic">Correspondence Ledger</h4>
                 <p className="font-body text-xl italic text-foreground/40 leading-relaxed">
                   Mina Ogbanga, PhD <br/>
                   <a href="mailto:editor.ijsds@gmail.com" className="font-headline font-black text-foreground hover:text-secondary transition-colors underline decoration-secondary/30">editor.ijsds@gmail.com</a>
                 </p>
              </div>
           </div>

           <div className="space-y-8 group/info">
              <div className="w-16 h-16 bg-foreground/5 flex items-center justify-center group-hover/info:bg-foreground group-hover/info:text-white transition-all border border-border/10 shadow-inner">
                 <Globe className="h-8 w-8" />
              </div>
              <div className="space-y-4">
                 <h4 className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/20 italic">Digital Node</h4>
                 <p className="font-body text-xl italic text-foreground/40 leading-relaxed">
                   Global Registry <br/>
                   <a href="http://www.ijsds.org" className="font-headline font-black text-foreground flex items-center gap-4 hover:text-primary transition-colors underline decoration-primary/30">
                      www.ijsds.org <ExternalLink className="h-4 w-4 opacity-30" />
                   </a>
                 </p>
              </div>
           </div>
        </div>
      </ContentSection>
      
      <div className="container mx-auto px-4 mt-24 text-center opacity-10 font-headline font-black text-[9px] uppercase tracking-[0.8em]">
         Institutional Policy Registry — Permanent Record v.04
      </div>
    </div>
  );
}
