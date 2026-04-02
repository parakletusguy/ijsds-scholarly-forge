import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MessageSquare, MessageCircle, Clock, Send, MapPin, Globe, ShieldCheck, Zap, Headphones } from 'lucide-react';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

export const Contact = () => {
  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>Contact IJSDS — Global Correspondence</title>
        <meta name="description" content="Reach out to the IJSDS editorial directorate for inquiries, technical support, and scholarly collaborations." />
      </Helmet>

      <PageHeader 
        title="Scholarly" 
        subtitle="Correspondence" 
        accent="Global Inquiry Registry"
        description="Connect with the IJSDS editorial directorate for high-fidelity inquiries regarding manuscript submissions, technical support, or strategic scholarly collaborations."
      />

      {/* Communication Nodes — High Fidelity Connectivity Grid */}
      <ContentSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Editorial Enquiry */}
          <div className="group relative bg-white p-12 border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full overflow-hidden text-center items-center">
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 group-hover:scale-150 transition-transform duration-1000" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
             
             <div className="w-16 h-16 bg-primary/10 flex items-center justify-center text-primary mb-10 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                <Mail size={28} />
             </div>
             
             <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-primary"></div>
                <span className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/30">Registry Node</span>
                <div className="h-px w-8 bg-primary"></div>
             </div>

             <h3 className="text-2xl font-black font-headline uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">Editorial Hub</h3>
             <p className="font-body text-foreground/40 italic text-sm mb-8 leading-relaxed max-w-[200px]">For archival submissions and general scholarly inquiries.</p>
             
             <a href="mailto:editor.ijsds@gmail.com" className="mt-auto font-headline font-black text-xs uppercase tracking-[0.3em] text-secondary hover:text-primary transition-colors">
                editor.ijsds@gmail.com
             </a>
          </div>

          {/* Institutional Contact */}
          <div className="group relative bg-white p-12 border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full overflow-hidden text-center items-center">
             <div className="absolute top-0 left-0 w-24 h-24 bg-secondary/5 group-hover:scale-150 transition-transform duration-1000" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
             
             <div className="w-16 h-16 bg-secondary/10 flex items-center justify-center text-secondary mb-10 border border-secondary/10 group-hover:bg-secondary group-hover:text-white transition-all shadow-inner">
                <Phone size={28} />
             </div>

             <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-secondary"></div>
                <span className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/30">Direct Link</span>
                <div className="h-px w-8 bg-secondary"></div>
             </div>

             <h3 className="text-2xl font-black font-headline uppercase tracking-tighter mb-4 group-hover:text-secondary transition-colors">Digital Line</h3>
             <p className="font-body text-foreground/40 italic text-sm mb-8 leading-relaxed max-w-[200px]">Direct access to our editorial directorate (RSU).</p>
             
             <a href="tel:+2348080224405" className="mt-auto font-headline font-black text-xs uppercase tracking-[0.3em] text-primary hover:text-secondary transition-colors">
                +234 808 022 4405
             </a>
          </div>

          {/* Technical Support */}
          <div className="group relative bg-white p-12 border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col h-full overflow-hidden text-center items-center">
             <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 group-hover:scale-150 transition-transform duration-1000" style={{ clipPath: 'circle(50% at 100% 100%)' }}></div>
             
             <div className="w-16 h-16 bg-primary/10 flex items-center justify-center text-primary mb-10 border border-primary/10 group-hover:bg-foreground group-hover:text-white transition-all shadow-inner">
                <Headphones size={28} />
             </div>

             <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-primary"></div>
                <span className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/30">Systems Support</span>
                <div className="h-px w-8 bg-primary"></div>
             </div>

             <h3 className="text-2xl font-black font-headline uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">Technical Desk</h3>
             <p className="font-body text-foreground/40 italic text-sm mb-8 leading-relaxed max-w-[200px]">Support for registry access and submission bottlenecks.</p>
             
             <a href="mailto:editor.ijsds@gmail.com?subject=Technical Support" className="mt-auto font-headline font-black text-xs uppercase tracking-[0.3em] text-secondary hover:text-primary transition-colors">
                Dispatch Ticket
             </a>
          </div>

          {/* WhatsApp Direct */}
          <div className="group relative bg-foreground p-12 border border-white/5 shadow-2xl transition-all duration-700 flex flex-col h-full overflow-hidden text-center items-center text-white">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 group-hover:scale-150 transition-transform duration-1000" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
             
             <div className="w-16 h-16 bg-secondary flex items-center justify-center text-white mb-10 shadow-2xl group-hover:rotate-12 transition-all">
                <MessageCircle size={28} />
             </div>

             <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-secondary"></div>
                <span className="font-headline font-black text-[9px] uppercase tracking-widest text-white/30">Rapid Dispatch</span>
                <div className="h-px w-8 bg-secondary"></div>
             </div>

             <h3 className="text-2xl font-black font-headline uppercase tracking-tighter mb-4 text-white">Registry Chat</h3>
             <p className="font-body text-white/40 italic text-sm mb-8 leading-relaxed max-w-[200px]">Urgent editorial queries via the rapid correspondence channel.</p>
             
             <a href="https://wa.me/2348080224405" target="_blank" rel="noopener noreferrer" className="mt-auto font-headline font-black text-xs uppercase tracking-[0.3em] text-secondary hover:text-white transition-all">
                Connect Instantly
             </a>
          </div>
        </div>
      </ContentSection>

      {/* Response Policy & Location — High Fidelity Dual Grid */}
      <ContentSection dark title="Directorate Protocol">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
           <div className="bg-white p-12 md:p-20 relative overflow-hidden group shadow-2xl flex flex-col justify-center border border-border/10">
              {/* Complex Motif */}
              <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 -translate-x-1/2 -translate-y-1/2 rotate-12 pointer-events-none" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
              
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="h-px w-16 bg-primary"></div>
                    <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-foreground/30 italic">Response Protocol</span>
                 </div>
                 <h3 className="text-4xl md:text-7xl font-black font-headline uppercase tracking-tighter mb-12 leading-[0.85] text-foreground">
                    Efficiency <br/><span className="text-primary italic">& Continuity</span>
                 </h3>
                 <p className="text-2xl font-body italic text-foreground/40 leading-relaxed mb-12 border-l-8 border-secondary/20 pl-8 overflow-hidden">
                    "We value scholarly time. Expect professional responses within <span className="text-foreground font-headline font-black tracking-tight">24–48 Business Hours.</span>"
                 </p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="bg-secondary/5 p-8 border border-secondary/10 hover:bg-secondary/10 transition-colors cursor-default">
                       <Clock className="h-8 w-8 text-secondary mb-4" />
                       <p className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/40 mb-1">Standard Window</p>
                       <p className="font-body font-bold text-lg text-foreground">48 Hour Ceiling</p>
                    </div>
                    <div className="bg-primary/5 p-8 border border-primary/10 hover:bg-primary/10 transition-colors cursor-default">
                       <Send className="h-8 w-8 text-primary mb-4" />
                       <p className="font-headline font-black text-[9px] uppercase tracking-widest text-foreground/40 mb-1">Priority Status</p>
                       <p className="font-body font-bold text-lg text-foreground italic">Registered Fellows</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-foreground text-white p-12 md:p-20 relative overflow-hidden group shadow-2xl flex flex-col justify-center border border-white/5">
              {/* Institutional Residence Highlight */}
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-[0.03] translate-x-1/2 translate-y-1/2 pointer-events-none" style={{ clipPath: 'circle(50% at 50% 50%)' }}></div>
              
              <div className="relative z-10">
                 <div className="w-16 h-16 bg-white/10 flex items-center justify-center text-secondary mb-12 border border-white/10 shadow-inner group-hover:rotate-12 transition-transform">
                    <MapPin size={32} />
                 </div>
                 <h3 className="text-4xl md:text-7xl font-black font-headline uppercase tracking-tighter mb-12 leading-[0.85]">Institutional <br/><span className="text-secondary italic">Residence</span></h3>
                 
                 <div className="space-y-10">
                    <div className="flex gap-8">
                       <div className="shrink-0 h-10 w-px bg-primary"></div>
                       <div>
                          <p className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-white/30 mb-3">Principal Address</p>
                          <p className="font-body text-2xl md:text-3xl text-white/60 italic leading-snug">
                             Rivers State University, <br/>
                             Nkpolu-Oroworukwo, Port Harcourt, <br/>
                             Rivers State, Nigeria.
                          </p>
                       </div>
                    </div>
                    
                    <div className="flex gap-8">
                       <div className="shrink-0 h-10 w-px bg-secondary"></div>
                       <div>
                          <p className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-white/30 mb-3">Global Connectivity</p>
                          <p className="font-body text-xl text-white/40 italic">Serving the Pan-African scholarly community and the global research grid.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </ContentSection>

      {/* Continuity Seal Footer */}
      <ContentSection>
        <div className="max-w-5xl mx-auto py-32 text-center border-t border-border/20 relative group">
            <Globe size={32} className="mx-auto text-foreground/5 mb-12 group-hover:text-primary transition-colors" />
           <h3 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter mb-8 max-w-4xl mx-auto leading-none">Global Scholarly Connectivity</h3>
           <p className="text-2xl font-body text-foreground/40 italic mb-16 max-w-3xl mx-auto">IJSDS — Connecting multidisciplinary knowledge across continental borders.</p>
           
           <div className="flex flex-col items-center gap-12">
              <div className="flex flex-wrap justify-center gap-12 font-headline font-black text-[10px] uppercase tracking-[0.6em] text-foreground/10 italic">
                 <span>Correspondence Protocol</span>
                 <span className="text-foreground/5 shrink-0 hidden sm:block">•</span>
                 <span>Global Hub</span>
                 <span className="text-foreground/5 shrink-0 hidden sm:block">•</span>
                 <span>Continental Synergy</span>
              </div>
           </div>
        </div>
      </ContentSection>
    </div>
  );
};

export default Contact;
