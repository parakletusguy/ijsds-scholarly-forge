import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Globe, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Indexing = () => {
  return (
    <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
      <Helmet>
        <title>Indexing & Visibility — IJSDS</title>
        <meta name="description" content="Discover how IJSDS ensures global visibility for your research through NJOL and Zenodo." />
      </Helmet>

      {/* Minimalist Header */}
      <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-headline font-light tracking-tight text-stone-900">
            Indexing & <span className="italic text-primary">Visibility</span>
          </h1>
          <p className="mt-4 text-stone-500 text-sm leading-relaxed max-w-xl">
            We ensure your research reaches the global scholarly community through strategic partnerships with established hosting and indexing platforms.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-16 space-y-20">
        
        {/* core repositories */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* NJOL */}
          <div className="space-y-8 group">
            <div className="bg-white p-8 border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
              <img 
                src="/assets/indexing/njol_logo.png" 
                alt="NJOL Logo" 
                className="w-full max-w-[280px] h-auto object-contain mb-6"
              />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Globe size={14} className="text-indigo-900" />
                </div>
                <h2 className="text-lg font-bold tracking-tight uppercase text-stone-800">NJOL Hosting</h2>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed mb-8">
                The <span className="font-semibold text-stone-700">Nigerian Journals Online</span> platform hosts our journal locally, providing professional infrastructure for Nigerian academic works and ensuring automatic indexing in Google Scholar for maximum regional and global reach.
              </p>
              <a 
                href="https://www.nigerianjournalsonline.com" 
                target="_blank" 
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-900 hover:opacity-70 transition-opacity"
              >
                Visit Platform <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Zenodo */}
          <div className="space-y-8 group">
            <div className="bg-stone-900 p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/5">
              <img 
                src="/assets/indexing/zenodo_logo.png" 
                alt="Zenodo Logo" 
                className="w-full max-w-[200px] h-auto object-contain mb-8 brightness-200"
              />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <BookOpen size={14} className="text-white" />
                </div>
                <h2 className="text-lg font-bold tracking-tight uppercase text-white">Zenodo Repository</h2>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed mb-8">
                Every IJSDS article is cross-published on <span className="font-semibold text-white">Zenodo</span>, a CERN-backed repository. This provides a permanent, citable record assigned a unique DOI (<span className="text-primary font-mono text-xs">10.5281/zenodo</span>) for long-term preservation.
              </p>
              <a 
                href="https://zenodo.org" 
                target="_blank" 
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
              >
                CERN Repository <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </section>

        {/* Visibility Tools */}
        <section className="pt-16 border-t border-stone-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Bibliographic Data</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Standardized metadata is exported in BitTeX and RIS formats to all major citation managers including Zotero, Mendeley, and EndNote.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Digital Identity</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                We advocate for persistent author identity. Every submission is linked to the author's ORCID iD to ensure accurate citation tracking over time.
              </p>
            </div>
          </div>
        </section>

        {/* Editorial Support */}
        <section className="bg-white border border-stone-100 p-10 md:p-12 text-center space-y-6">
          <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">Inquiries</p>
          <h2 className="text-xl font-headline italic tracking-tight text-stone-800">
            "We are committed to the global distribution of knowledge."
          </h2>
          <div className="pt-4 flex flex-col items-center">
            <a 
              href="mailto:editor.ijsds@gmail.com" 
              className="text-[10px] font-black uppercase tracking-[0.3em] bg-stone-900 text-white px-8 py-4 hover:bg-primary transition-all"
            >
              Contact Editorial Office
            </a>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Indexing;
