import React from 'react';
import { Helmet } from 'react-helmet-async';

export const Contact = () => {
  return (
    <div className="min-h-screen font-body selection:bg-primary-container selection:text-on-primary-container relative">
      <Helmet>
        <title>Global Inquiry Registry | IJSDS</title>
        <meta name="description" content="Connect with the IJSDS editorial directorate for high-fidelity inquiries regarding manuscript submissions, technical support, or strategic scholarly collaborations." />
      </Helmet>

      <main className="relative overflow-hidden">
        {/* Subtle Background Texture */}
        <div className="absolute inset-0 kente-pattern pointer-events-none"></div>

        {/* Hero Section */}
        <section className="relative px-8 pt-24 pb-16 max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-on-surface leading-[0.9] tracking-tighter mb-8">
              Global Inquiry <br/><span className="italic text-primary">Registry</span>
            </h1>
            <p className="max-w-xl font-body text-lg md:text-xl text-on-surface-variant leading-relaxed">
              Connect with the IJSDS editorial directorate for high-fidelity inquiries regarding manuscript submissions, technical support, or strategic scholarly collaborations.
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="border-l-4 border-primary pl-6 py-2">
              <span className="block text-xs uppercase tracking-[0.2em] font-bold text-primary mb-2">Current Status</span>
              <span className="font-headline text-2xl italic text-on-surface">Registry Active</span>
            </div>
          </div>
        </section>

        {/* Registry Nodes (Bento Grid) */}
        <section className="px-8 py-12 max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Editorial Hub */}
            <div className="md:col-span-7 bg-surface-container-low p-12 flex flex-col justify-between min-h-[400px] group">
              <div>
                <div className="flex justify-between items-start mb-12">
                  <span className="material-symbols-outlined text-primary text-4xl">auto_stories</span>
                  <span className="text-xs font-bold tracking-widest uppercase opacity-40">Node 01</span>
                </div>
                <h3 className="font-headline text-4xl mb-4">Editorial Hub</h3>
                <p className="font-body text-on-surface-variant max-w-md text-lg">
                  For archival submissions and general scholarly inquiries. The nexus for peer review coordination and manuscript management.
                </p>
                <p className="mt-6 font-mono text-primary select-all cursor-pointer">editor.ijsds@gmail.com</p>
              </div>
              <div className="mt-12">
                <a href="mailto:editor.ijsds@gmail.com" className="inline-flex items-center gap-3 text-primary font-bold uppercase tracking-widest group-hover:gap-6 transition-all">
                  Direct Link <span className="material-symbols-outlined">arrow_right_alt</span>
                </a>
              </div>
            </div>

            {/* Digital Line */}
            <div className="md:col-span-5 bg-primary p-12 text-on-primary flex flex-col justify-between min-h-[400px]">
              <div>
                <div className="flex justify-between items-start mb-12">
                  <span className="material-symbols-outlined text-4xl">settings_phone</span>
                  <span className="text-xs font-bold tracking-widest uppercase opacity-40">Node 02</span>
                </div>
                <h3 className="font-headline text-4xl mb-4 text-on-primary">Digital Line</h3>
                <p className="font-body opacity-80 text-lg">
                  Direct access to our editorial directorate (RSU) for real-time institutional coordination.
                </p>
                <p className="mt-6 font-mono text-2xl font-light">+234 808 022 4405</p>
              </div>
              <div className="mt-12 bg-white/10 p-6 backdrop-blur-sm">
                <span className="block text-xs uppercase tracking-widest mb-1 opacity-60">Operational Hours</span>
                <span className="text-sm">08:00 — 17:00 WAT (Mon-Fri)</span>
              </div>
            </div>

            {/* Technical Desk */}
            <div className="md:col-span-4 bg-surface-container-highest p-12 min-h-[350px] flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-primary mb-8 text-3xl">terminal</span>
                <h3 className="font-headline text-3xl mb-4">Technical Desk</h3>
                <p className="text-on-surface-variant">Support for registry access and submission bottlenecks.</p>
              </div>
              <button className="w-full bg-on-surface text-surface-container-lowest py-4 font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">
                Dispatch Ticket
              </button>
            </div>

            {/* Rapid Dispatch */}
            <div className="md:col-span-8 bg-surface-container text-on-surface p-12 min-h-[350px] relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold tracking-widest uppercase text-on-surface-variant">Rapid Correspondence Channel</span>
                </div>
                <h3 className="font-headline text-4xl lg:text-5xl mb-6">Registry Chat</h3>
                <p className="max-w-md text-on-surface-variant text-lg">
                  Urgent editorial queries handled via our encrypted scholar-to-directorate live link.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-8">
                <a 
                  href="https://wa.me/2348080224405" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary text-on-primary px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-primary-container transition-colors"
                >
                  Connect Instantly
                </a>
                <div className="hidden lg:block">
                  <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest border-b border-primary/20 pb-1 mr-2">AVG WAIT TIME</span>
                  <span className="block font-headline italic text-on-surface text-xl">Less than 5 minutes</span>
                </div>
              </div>
              {/* Abstract Background Decorative Element */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 border-t-[40px] border-l-[40px] border-primary/5 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Response Protocol */}
        <section className="bg-surface-container-low mt-24 py-32 px-8">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="w-full h-[600px] bg-surface-container-highest flex items-center justify-center overflow-hidden relative border border-outline-variant/10 shadow-inner">
                <div className="absolute inset-0 kente-pattern opacity-10"></div>
                <div className="w-40 h-40 border-8 border-primary/5 rounded-full"></div>
              </div>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <span className="text-xs uppercase font-bold tracking-[0.4em] text-primary mb-8 block">Response Protocol</span>
              <h2 className="font-headline text-4xl md:text-6xl mb-12">Efficiency &amp; <span className="italic text-primary">Continuity</span></h2>
              <div className="mb-16">
                <div className="w-20 h-px bg-primary mb-8"></div>
                <p className="font-headline text-2xl md:text-3xl text-on-surface italic leading-relaxed">
                  "We value scholarly time. Expect professional responses within 24–48 Business Hours."
                </p>
                <div className="w-20 h-px bg-primary mt-8 ml-auto"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 pt-12">
                <div>
                  <span className="block font-headline text-4xl text-primary mb-2">24h</span>
                  <span className="text-xs uppercase tracking-widest font-bold opacity-60">Standard Window</span>
                </div>
                <div>
                  <span className="block font-headline text-4xl text-primary mb-2">48h</span>
                  <span className="text-xs uppercase tracking-widest font-bold opacity-60">Ceiling</span>
                </div>
                <div>
                  <span className="block font-headline text-4xl text-primary mb-2">Priority</span>
                  <span className="text-xs uppercase tracking-widest font-bold opacity-60">Registered Fellows</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Institutional Residence & Map */}
        <section className="px-8 py-32 max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <h2 className="font-headline text-4xl mb-8">Institutional <span className="italic">Residence</span></h2>
              <p className="font-body text-on-surface-variant text-lg mb-12">
                Principal Address — Rivers State University, Nkpolu-Oroworukwo, Port Harcourt, Rivers State, Nigeria.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <div>
                    <span className="block font-bold text-sm uppercase tracking-widest text-on-surface">Global Reach</span>
                    <span className="text-on-surface-variant">Serving the Pan-African scholarly community and the global research grid.</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary">public</span>
                  <div>
                    <span className="block font-bold text-sm uppercase tracking-widest text-on-surface">Timezone</span>
                    <span className="text-on-surface-variant">UTC +1 (West Africa Time)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 bg-surface-container h-[500px] relative overflow-hidden flex items-center justify-center border border-outline-variant/10">
              <div className="absolute inset-0 scholar-bg-pattern opacity-10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary p-12 shadow-2xl skew-x-12 opacity-90">
                  <span className="material-symbols-outlined text-on-primary text-6xl">apartment</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
