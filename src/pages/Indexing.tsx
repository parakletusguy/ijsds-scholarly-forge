import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Globe, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Indexing = () => {
  return (
    <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
      <Helmet>
        <title>Indexing & Visibility — IJSDS</title>
        <meta name="description" content="Discover how IJSDS ensures global visibility through NJOL, CrossRef, and Google Scholar indexing." />
      </Helmet>

      {/* Minimalist Header */}
      <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
        <div className="max-w-5xl mx-auto">
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

      <main className="max-w-5xl mx-auto px-8 py-16 space-y-20">

        {/* core repositories */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* NJOL */}
          <div className="bg-white p-8 border border-stone-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <img
              src="/assets/indexing/njol_logo.png"
              alt="NJOL Logo"
              className="w-full max-w-[200px] h-16 object-contain mb-6"
            />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <Globe size={14} className="text-indigo-900" />
              </div>
              <h2 className="text-sm font-bold tracking-tight uppercase text-stone-800">NJOL Hosting</h2>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-6 flex-1">
              The <span className="font-semibold text-stone-700">Nigerian Journals Online</span> platform hosts our journal locally, providing professional infrastructure for Nigerian academic works and ensuring indexing in Google Scholar for regional and global reach.
            </p>
            <a
              href="https://www.nigerianjournalsonline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-900 hover:opacity-70 transition-opacity mt-auto"
            >
              Visit Platform <ExternalLink size={10} />
            </a>
          </div>

          {/* Crossref */}
          <div className="bg-white p-8 border border-stone-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <img
              src="https://res.cloudinary.com/drh4ma3hj/image/upload/v1778758989/Crossref-Logo_krmzqx.jpg"
              alt="Crossref Logo"
              className="w-full max-w-[180px] h-16 object-contain mb-6"
            />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                <ExternalLink size={14} className="text-primary" />
              </div>
              <h2 className="text-sm font-bold tracking-tight uppercase text-stone-800">Crossref DOI Registry</h2>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-6 flex-1">
              IJSDS is a <span className="font-semibold text-stone-700">Crossref</span> member, the official DOI registration agency for scholarly publishing. Every article receives a Crossref-registered DOI, enabling citation tracking, reference linking, and discovery across 24,000+ member publishers in 166 countries.
            </p>
            <a
              href="https://www.crossref.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity mt-auto"
            >
              Crossref.org <ExternalLink size={10} />
            </a>
          </div>

          {/* Google Scholar */}
          <div className="bg-white p-8 border border-stone-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <img
              src="https://res.cloudinary.com/drh4ma3hj/image/upload/v1778759110/google-scholar4372_knlsib.jpg"
              alt="Google Scholar Logo"
              className="w-full max-w-[200px] h-16 object-contain mb-6"
            />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <BookOpen size={14} className="text-blue-600" />
              </div>
              <h2 className="text-sm font-bold tracking-tight uppercase text-stone-800">Google Scholar</h2>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-6 flex-1">
              All IJSDS articles are indexed in <span className="font-semibold text-stone-700">Google Scholar</span>, the world's most widely used academic search engine. This ensures every published article is freely discoverable by researchers, students, and institutions globally — and automatically tracked for citations and author metrics.
            </p>
            <a
              href="https://scholar.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:opacity-70 transition-opacity mt-auto"
            >
              Google Scholar <ExternalLink size={10} />
            </a>
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
