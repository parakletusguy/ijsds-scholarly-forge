import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin, ExternalLink, ShieldCheck, Zap, Layers, Award, Target, BookOpen, Clock } from "lucide-react";

export const Footer = () => {
  const today = new Date();
  
  const footerSectionClasses = "space-y-10 group/section";
  const headerClasses = "font-headline text-primary font-black uppercase tracking-[0.5em] text-[10px] mb-10 pb-4 border-b border-white/5 inline-block italic";
  const linkClasses = "font-body text-stone-500 text-lg hover:text-white transition-all hover:translate-x-3 flex items-center gap-4 group/link";

  return (
    <footer className="bg-[#0c0c0c] text-white mt-32 pt-32 pb-16 relative overflow-hidden font-headline border-t-[20px] border-secondary">
      {/* Visual Depth Accents — Institutional Grandeur */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/5 rounded-full -mr-32 -mt-32 blur-[150px] opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 opacity-30 -z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
      <div className="absolute top-[40%] left-[5%] w-32 h-32 text-white opacity-[0.02] pointer-events-none">
         <Globe size={180} />
      </div>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
          
          {/* Section: Institutional Core */}
          <div className={footerSectionClasses}>
            <div className="flex flex-col gap-4">
              <span className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase group cursor-pointer transition-colors hover:text-primary">
                IJSDS
              </span>
              <div className="flex items-center gap-6">
                 <div className="h-0.5 w-10 bg-secondary"></div>
                 <span className="font-headline font-black text-[9px] uppercase tracking-[0.4em] text-white/30 italic">Initiative Afrique Master Registry</span>
              </div>
            </div>
            <p className="font-body text-stone-500 text-xl italic leading-relaxed max-w-xs border-l-2 border-primary/20 pl-6">
              "Advancing African-centered scholarship and developmental practice through technical precision and intellectual vanguardism."
            </p>
            <div className="flex gap-4">
              <a href="mailto:editor.ijsds@gmail.com" className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-all shadow-xl group/soc">
                <Mail className="h-6 w-6 text-white/40 group-hover/soc:text-white group-hover/soc:rotate-12 transition-all" />
              </a>
              <a href="#" className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary transition-all shadow-xl group/soc">
                <Globe className="h-6 w-6 text-white/40 group-hover/soc:text-white group-hover/soc:scale-110 transition-all" />
              </a>
            </div>
          </div>

          {/* Section: Author Protocols */}
          <div className={footerSectionClasses}>
            <h4 className={headerClasses}>Investigator Protocols</h4>
            <ul className="space-y-6">
              {[
                { name: 'Technical Guidelines', path: '/submission-guidelines' },
                { name: 'Peer Review Integrity', path: '/peer-review' },
                { name: 'Plagiarism Audit', path: '/plagiarism-policy' },
                { name: 'Copyright Sovereignty', path: '/copyright' },
              ].map((link) => (
                <li key={link.path}>
                   <Link to={link.path} className={linkClasses}>
                      <ArrowRight size={14} className="text-primary/40 opacity-0 group-hover/link:opacity-100 transition-all" />
                      {link.name}
                   </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Academic Ledger */}
          <div className={footerSectionClasses}>
            <h4 className={headerClasses}>Academic Ledger</h4>
            <ul className="space-y-6">
              {[
                { name: 'Institutional Identity', path: '/about' },
                { name: 'Editorial Council', path: '/editorial-board' },
                { name: 'The Global Archive', path: '/articles' },
                { name: 'Technical Support', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                   <Link to={link.path} className={linkClasses}>
                      <Layers size={14} className="text-secondary/40 opacity-0 group-hover/link:opacity-100 transition-all" />
                      {link.name}
                   </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Global Correspondence */}
          <div className={footerSectionClasses}>
            <h4 className={headerClasses}>Registry Correspondence</h4>
            <div className="space-y-10">
              <div className="group/item">
                 <p className="text-white/20 font-black text-[9px] uppercase tracking-[0.6em] mb-4 italic">Corporate Node</p>
                 <div className="flex gap-4">
                    <MapPin className="h-5 w-5 text-secondary shrink-0" />
                    <p className="font-body text-stone-500 text-sm leading-relaxed italic">
                       Dept. of Social Work, Faculty of Social Sciences, Rivers State University, Emohua.
                    </p>
                 </div>
              </div>
              
              <div className="group/item">
                 <p className="text-white/20 font-black text-[9px] uppercase tracking-[0.6em] mb-4 italic">Technical Identifiers</p>
                 <div className="flex gap-4 items-center">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0 transition-transform group-hover/item:rotate-12" />
                    <p className="font-body text-stone-500 text-sm italic">
                       ISSN: 3115-6940 (Print) <br/>
                       ISSN: 3115-6932 (Online)
                    </p>
                 </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                 <Link to="/contact" className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-white hover:text-primary transition-all flex items-center gap-4 group/desk">
                    Access Support Desk <Target size={14} className="group-hover/desk:scale-110 transition-transform" />
                 </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer Navigation Pillar */}
        <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-10">
             <div className="flex items-center gap-4">
                <Clock size={16} className="text-stone-700" />
                <p className="font-headline text-stone-600 text-[9px] uppercase tracking-[0.5em] italic">Last Registry Sync: {today.toLocaleDateString()}</p>
             </div>
             <p className="font-headline text-stone-500 text-[10px] uppercase tracking-[0.2em] hidden md:block">
                © {today.getFullYear()} IJSDS. Permanent Institutional Record.
             </p>
          </div>
          
          <div className="flex items-center gap-6 opacity-20 hover:opacity-100 transition-opacity">
             <Award size={24} className="text-white" />
             <ShieldCheck size={24} className="text-white" />
             <Globe size={24} className="text-white" />
          </div>
        </div>
      </div>
      
      {/* Background Microtexture Motif */}
      <div className="absolute bottom-0 right-0 w-full h-1 text-center font-headline font-black text-[8px] uppercase tracking-[2em] text-white opacity-5 mb-4 select-none">
         SCHOLARLY FORGE ARCHIVE V.04
      </div>
    </footer>
  );
};
import { ArrowRight } from 'lucide-react';