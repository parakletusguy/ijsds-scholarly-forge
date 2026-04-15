import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import { 
  BookOpen, Link2, Users, Globe, FileDown, 
  ExternalLink, AlertTriangle, Mail, ShieldCheck, Layers, Search
} from 'lucide-react';

export const Indexing = () => {
  const orcidSteps = [
    { title: 'Connect Zenodo to ORCID', desc: 'Log into your Zenodo account, go to Settings, and link your ORCID profile. Once connected, your published articles will appear on your ORCID automatically.' },
    { title: 'Add DOI Manually', desc: 'You can also go to your ORCID profile and paste in the article\'s DOI link to make it show up in your list of publications.' }
  ];

  const researchGateSteps = [
    { title: 'Import via BibTeX File', desc: 'Download the BibTeX citation file from the article page on IJSDS and import it directly into ResearchGate to add the article to your profile.' },
    { title: 'Automatic Import via Zenodo', desc: 'Because IJSDS publishes on Zenodo, ResearchGate often picks up your article automatically through Zenodo\'s shared metadata.' }
  ];

  const academiaSteps = [
    { title: 'Follow IJSDS on Academia.edu', desc: 'Search for and follow the IJSDS page on Academia.edu to stay connected and help your published work get discovered by other researchers.' },
    { title: 'Share Your Article Directly', desc: 'Use the "Share" button on your article page to quickly add it to your Academia.edu profile with all the key details pre-filled.' }
  ];

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>Get Your Research Noticed — IJSDS</title>
        <meta name="description" content="Step-by-step guide for IJSDS authors on how to share and promote their published articles on major academic networks." />
      </Helmet>

      <PageHeader 
        title="Increase Your" 
        subtitle="Visibility" 
        accent="Reach More Readers"
        description="A simple guide to help you share your published article on academic networks so more researchers can find, read, and cite your work."
      />

      {/* Overview */}
      <ContentSection>
        <div className="bg-foreground text-white p-12 md:p-24 relative overflow-hidden group shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 w-[500px] h-full bg-white opacity-[0.02] -z-0 translate-x-1/2 pointer-events-none" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 opacity-20 -z-0 pointer-events-none" style={{ clipPath: 'circle(50% at 0 100%)' }}></div>
           
           <div className="max-w-5xl relative z-10 flex flex-col lg:flex-row gap-16 lg:items-center">
              <div className="shrink-0 group-hover:rotate-6 transition-transform duration-1000">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                   <Layers className="h-12 w-12 md:h-16 md:w-16 text-secondary" />
                </div>
              </div>
              <div className="space-y-6">
                 <h3 className="text-4xl md:text-7xl font-black font-headline uppercase tracking-tighter mb-8 leading-[0.85]">Where Your <br/><span className="text-secondary italic">Research Lives</span></h3>
                 <p className="text-xl md:text-2xl font-body italic text-white/50 leading-relaxed max-w-3xl">
                   Every article published in IJSDS is hosted on <span className="text-white">Zenodo</span> (operated by CERN), assigned a permanent DOI link, and automatically shared with major academic databases. Here's how to make sure your profile on each platform also reflects your work.
                 </p>
              </div>
           </div>
        </div>
      </ContentSection>

      {/* Platform-by-platform guides */}
      <ContentSection dark title="Connect Your Published Article">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-foreground">
          {/* ORCID */}
          <div className="bg-white p-12 border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden group flex flex-col h-full">
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 group-hover:scale-125 transition-transform duration-1000" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
             
             <div className="flex items-center gap-6 mb-12">
                <div className="w-14 h-14 bg-primary text-white flex items-center justify-center shadow-lg group-hover:bg-foreground transition-all"><Link2 size={24} /></div>
                <h3 className="text-3xl font-black font-headline uppercase tracking-tighter">ORCID</h3>
             </div>
             <div className="space-y-10 mb-auto">
                {orcidSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 relative group/step cursor-default">
                     <span className="font-headline font-black text-primary/10 text-5xl leading-none absolute -left-6 -top-2 group-hover/step:text-secondary/20 transition-colors">{idx + 1}</span>
                     <div className="relative z-10 pl-6 border-l-2 border-border/5">
                        <h4 className="font-headline font-black text-xs uppercase tracking-widest mb-2 text-foreground/40">{step.title}</h4>
                        <p className="font-body text-foreground/60 text-sm italic leading-relaxed">{step.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
             <div className="mt-12 pt-8 border-t border-border/10 flex justify-between items-center group/btn">
                <a href="https://orcid.org" target="_blank" className="inline-flex items-center gap-3 font-headline font-black text-[10px] uppercase tracking-[0.3em] text-primary hover:text-secondary transition-colors">
                  Visit ORCID <ExternalLink className="h-3 w-3 group-hover/btn:rotate-45 transition-transform" />
                </a>
                <ShieldCheck size={16} className="text-foreground/5" />
             </div>
          </div>

          {/* ResearchGate */}
          <div className="bg-white p-12 border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden group flex flex-col h-full">
             <div className="absolute top-0 left-0 w-24 h-24 bg-secondary/5 group-hover:scale-125 transition-transform duration-1000" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
             
             <div className="flex items-center gap-6 mb-12">
                <div className="w-14 h-14 bg-secondary text-white flex items-center justify-center shadow-lg group-hover:bg-foreground transition-all"><Users size={24} /></div>
                <h3 className="text-3xl font-black font-headline uppercase tracking-tighter">ResearchGate</h3>
             </div>
             <div className="space-y-10 mb-auto">
                {researchGateSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 relative group/step cursor-default">
                     <span className="font-headline font-black text-secondary/10 text-5xl leading-none absolute -left-6 -top-2 group-hover/step:text-primary/20 transition-colors">{idx + 1}</span>
                     <div className="relative z-10 pl-6 border-l-2 border-border/5">
                        <h4 className="font-headline font-black text-xs uppercase tracking-widest mb-2 text-foreground/40">{step.title}</h4>
                        <p className="font-body text-foreground/60 text-sm italic leading-relaxed">{step.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
             <div className="mt-12 pt-8 border-t border-border/10 flex justify-between items-center group/btn">
                <a href="https://researchgate.net" target="_blank" className="inline-flex items-center gap-3 font-headline font-black text-[10px] uppercase tracking-[0.3em] text-secondary hover:text-primary transition-colors">
                  Visit ResearchGate <ExternalLink className="h-3 w-3 group-hover/btn:rotate-45 transition-transform" />
                </a>
                <ShieldCheck size={16} className="text-foreground/5 rotate-180" />
             </div>
          </div>

          {/* Academia.edu */}
          <div className="bg-white p-12 border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden group flex flex-col h-full">
             <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 group-hover:scale-125 transition-transform duration-1000" style={{ clipPath: 'circle(50% at 100% 100%)' }}></div>
             
             <div className="flex items-center gap-6 mb-12">
                <div className="w-14 h-14 bg-primary text-white flex items-center justify-center shadow-lg group-hover:bg-foreground transition-all"><Globe size={24} /></div>
                <h3 className="text-3xl font-black font-headline uppercase tracking-tighter">Academia.edu</h3>
             </div>
             <div className="space-y-10 mb-auto">
                {academiaSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 relative group/step cursor-default">
                     <span className="font-headline font-black text-primary/10 text-5xl leading-none absolute -left-6 -top-2 group-hover/step:text-secondary/20 transition-colors">{idx + 1}</span>
                     <div className="relative z-10 pl-6 border-l-2 border-border/5">
                        <h4 className="font-headline font-black text-xs uppercase tracking-widest mb-2 text-foreground/40">{step.title}</h4>
                        <p className="font-body text-foreground/60 text-sm italic leading-relaxed">{step.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
             <div className="mt-12 pt-8 border-t border-border/10 flex justify-between items-center group/btn">
                <a href="https://academia.edu" target="_blank" className="inline-flex items-center gap-3 font-headline font-black text-[10px] uppercase tracking-[0.3em] text-primary hover:text-secondary transition-colors">
                  Visit Academia.edu <ExternalLink className="h-3 w-3 group-hover/btn:rotate-45 transition-transform" />
                </a>
                <ShieldCheck size={16} className="text-foreground/5 rotate-90" />
             </div>
          </div>

          {/* Zenodo */}
          <div className="bg-foreground p-12 border border-white/5 shadow-2xl relative overflow-hidden group flex flex-col h-full text-white">
             <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-[0.03] -z-0 translate-x-12 -translate-y-12" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
             
             <div className="flex items-center gap-6 mb-12 relative z-10">
                <div className="w-16 h-16 bg-secondary text-white flex items-center justify-center shadow-xl group-hover:rotate-12 transition-all"><BookOpen size={28} /></div>
                <h3 className="text-3xl font-black font-headline uppercase tracking-tighter">Zenodo</h3>
             </div>
             <p className="font-body text-white/40 italic leading-relaxed text-lg mb-10 relative z-10">
                Every IJSDS article is automatically published on <span className="text-white underline decoration-secondary underline-offset-8">Zenodo</span> — a free, trusted open repository run by CERN. This gives your work a permanent, citable record that can be found through Google Scholar and other academic search engines.
             </p>
             <div className="mt-auto pt-10 border-t border-white/10 flex justify-between items-center relative z-10">
                <a href="https://zenodo.org" target="_blank" className="inline-flex items-center gap-3 font-headline font-black text-[10px] uppercase tracking-[0.4em] text-secondary hover:text-white transition-all group/subbtn">
                  Visit Zenodo <ExternalLink className="h-3 w-3 group-hover/subbtn:translate-x-2 transition-transform" />
                </a>
                <div className="h-2 w-2 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_#d97706]"></div>
             </div>
          </div>
        </div>
      </ContentSection>

      {/* Citation format */}
      <ContentSection title="How to Cite an IJSDS Article">
        <div className="max-w-6xl mx-auto group">
          <div className="bg-white border border-border/20 p-12 md:p-24 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-20">
             <div className="absolute top-0 right-0 w-[400px] h-full bg-secondary/5 -z-0 translate-x-1/2 opacity-20 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
             
             <div className="shrink-0 relative z-10">
                <div className="w-24 h-24 bg-foreground text-white flex items-center justify-center shadow-2xl relative rotate-3 group-hover:rotate-0 transition-transform duration-1000">
                    <FileDown size={40} className="text-secondary" />
                </div>
             </div>
             
             <div className="relative z-10 flex-grow">
                <div className="flex items-center gap-4 mb-8">
                   <div className="h-0.5 w-12 bg-primary"></div>
                   <span className="font-headline font-black text-[9px] uppercase tracking-[0.5em] text-foreground/30">BibTeX Format</span>
                </div>
                <h3 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter mb-8 leading-[0.85]">Reference File — <br/><span className="text-primary italic">Ready to Use</span></h3>
                <p className="text-2xl font-body text-foreground/40 italic leading-relaxed mb-12 max-w-2xl">
                   Each article comes with a ready-made citation file you can import directly into reference managers like Zotero, Mendeley, or EndNote.
                </p>
                <div className="bg-foreground p-10 font-mono text-[11px] md:text-sm text-white/40 border-l-8 border-secondary shadow-xl overflow-x-auto relative">
                  <div className="absolute top-4 right-6 uppercase text-[9px] font-headline font-black tracking-widest text-white/10">BibTeX Format</div>
<pre className="whitespace-pre-wrap">{`@article{ijsds_2024_01,
  author    = {Author Name},
  title     = {Title of the Article},
  journal   = {International Journal of Social Work
               and Development Studies (IJSDS)},
  year      = {2024},
  doi       = {10.5281/zenodo.XXXXX},
  publisher = {Zenodo}
}`}</pre>
                </div>
             </div>
          </div>
        </div>
      </ContentSection>

      {/* Copyright notice */}
      <ContentSection dark>
        <div className="max-w-5xl mx-auto bg-primary/95 text-white p-12 md:p-20 relative overflow-hidden group shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -z-0 opacity-10 translate-x-1/2 -translate-y-1/2" style={{ clipPath: 'circle(50% at 50% 50%)' }}></div>
           
           <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
              <div className="p-8 bg-white/10 border border-white/10 group-hover:rotate-12 transition-transform shadow-inner"><AlertTriangle className="h-10 w-10 text-secondary" /></div>
              <div className="space-y-4">
                 <h4 className="font-headline font-black text-2xl uppercase tracking-tighter text-white mb-2">Important: Use the Final Published PDF</h4>
                 <p className="font-body text-white/50 text-xl italic leading-relaxed max-w-4xl">
                    When sharing your article on any academic platform, always use the final published version (PDF) — not an earlier draft. Sharing the DOI link is the best way to ensure readers always land on the correct, citable version.
                 </p>
              </div>
           </div>
        </div>
      </ContentSection>

      {/* Support footer */}
      <ContentSection>
        <div className="max-w-5xl mx-auto py-32 text-center border-t border-border/20 relative group">
            <Search size={32} className="mx-auto text-foreground/5 mb-12 group-hover:text-primary transition-colors" />
           <h3 className="text-4xl md:text-5xl font-black font-headline uppercase tracking-tighter mb-8 max-w-4xl mx-auto leading-none">Need Help Getting Started?</h3>
           <p className="text-2xl font-body text-foreground/40 italic mb-16 max-w-3xl mx-auto">Our editorial team is happy to help you connect your article to any of these platforms. Just send us an email.</p>
           
           <div className="flex flex-col items-center gap-12">
              <a href="mailto:editor.ijsds@gmail.com" className="group relative inline-flex items-center gap-6 bg-foreground text-white px-16 py-8 font-headline font-black text-xs uppercase tracking-[0.4em] hover:bg-primary transition-all shadow-2xl overflow-hidden rounded-none">
                <span className="relative z-10 flex items-center gap-4"><Mail className="h-5 w-5" /> Contact Editorial Team</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-20"></div>
              </a>
           </div>
        </div>
      </ContentSection>
    </div>
  );
};

export default Indexing;
