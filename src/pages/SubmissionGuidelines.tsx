import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export const SubmissionGuidelines = () => {
  return (
    <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
      <Helmet>
        <title>Submission Guidelines — IJSDS</title>
        <meta name="description" content="How to prepare and submit your manuscript to IJSDS — formatting, structure, and what to expect." />
      </Helmet>

      <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-4 inline-block">
            ← Home
          </Link>
          <h1 className="text-3xl font-headline font-light tracking-tight text-stone-900">
            Submission <span className="italic text-primary">Guidelines</span>
          </h1>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl">
            Everything you need to prepare and submit your manuscript. Follow these instructions to ensure your work moves smoothly through editorial review.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-16 space-y-12">

        {/* Article types */}
        <section className="space-y-5">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Article Types</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { type: 'Original Research', length: '6,000–8,000 words', desc: 'Empirical studies with findings relevant to social work or development.' },
              { type: 'Review Article', length: '4,000–6,000 words', desc: 'A synthesis of existing research on a clearly defined topic.' },
              { type: 'Case Study', length: '3,000–4,000 words', desc: 'In-depth analysis of a specific intervention, programme, or policy.' },
              { type: 'Short Communication', length: '1,500–2,500 words', desc: 'Preliminary findings or methodological notes that warrant early publication.' },
            ].map(({ type, length, desc }) => (
              <div key={type} className="bg-white border border-stone-100 p-5 space-y-1">
                <p className="text-sm font-bold text-stone-900">{type}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{length}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Formatting */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Formatting</h2>
          <div className="bg-white border border-stone-100 p-6 space-y-3 text-sm text-stone-600 leading-relaxed">
            <p>Format your manuscript in Microsoft Word using a standard font (e.g. Times New Roman, 12pt), double-spaced with 1-inch margins on all sides.</p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
              <li>Include continuous line numbering throughout the document.</li>
              <li>Tables and figures should be embedded in the text at the appropriate place.</li>
              <li>All figures should be supplied at 300 DPI or higher (TIFF or EPS preferred).</li>
              <li>References must follow <strong className="text-stone-800">APA 7th Edition</strong>.</li>
            </ul>
          </div>
        </section>

        {/* Structure */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Manuscript Structure</h2>
          <div className="space-y-2">
            {[
              { n: '01', label: 'Title Page', desc: 'Author names, affiliations, and contact details — kept separate from the main file for blind review.' },
              { n: '02', label: 'Abstract', desc: '250–300 words summarising the purpose, method, key findings, and conclusion.' },
              { n: '03', label: 'Keywords', desc: '5–7 keywords that describe your topic and aid discovery.' },
              { n: '04', label: 'Main Body', desc: 'Introduction, Method, Results, Discussion — clearly labelled sections.' },
              { n: '05', label: 'References', desc: 'Complete reference list formatted in APA 7th Edition.' },
            ].map(({ n, label, desc }) => (
              <div key={n} className="flex gap-5 bg-white border border-stone-100 p-5">
                <span className="text-2xl font-headline text-stone-200 shrink-0 leading-none">{n}</span>
                <div>
                  <p className="text-sm font-bold text-stone-900 mb-0.5">{label}</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Blind review prep */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Preparing for Blind Review</h2>
          <div className="bg-white border border-stone-100 p-6 text-sm text-stone-600 leading-relaxed space-y-3">
            <p>IJSDS uses double-blind peer review — reviewers do not know who the authors are. Before submitting, remove all identifying information from your main manuscript file:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Delete your name, institution, and contact details from the document and file properties.</li>
              <li>Anonymise any self-citations (e.g. replace "as shown in our previous study [Smith, 2023]" with "as shown in [Author, Year]").</li>
              <li>Remove acknowledgements and funding statements from the main file — include them on the title page only.</li>
            </ul>
          </div>
        </section>

        {/* Ethics */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Ethical Requirements</h2>
          <div className="bg-white border border-stone-100 p-6 text-sm text-stone-600 leading-relaxed space-y-3">
            <p>All submissions must meet the following requirements:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Research involving human participants must have ethics board approval. State this clearly in the method section.</li>
              <li>Authors must declare any conflicts of interest.</li>
              <li>All manuscripts are screened for plagiarism before review.</li>
              <li>Use of AI writing tools must be disclosed in the manuscript.</li>
            </ul>
          </div>
        </section>

        {/* How to submit */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">How to Submit</h2>
          <div className="space-y-2">
            {[
              { n: '1', t: 'Create an account', d: 'Register on the IJSDS portal to access the submission system.' },
              { n: '2', t: 'Prepare your files', d: 'Title page (with author details) + anonymised manuscript + any supplementary files.' },
              { n: '3', t: 'Upload and submit', d: 'Complete the submission form, upload your files, and confirm submission.' },
              { n: '4', t: 'Track your progress', d: 'Log in to your dashboard at any time to follow your submission through review.' },
            ].map(({ n, t, d }) => (
              <div key={n} className="flex gap-4 items-start p-4 bg-white border border-stone-100">
                <span className="w-6 h-6 bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0">{n}</span>
                <div>
                  <p className="text-sm font-bold text-stone-900">{t}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white border border-stone-100 p-8 space-y-4">
          <h3 className="text-sm font-bold text-stone-900">Ready to submit?</h3>
          <p className="text-sm text-stone-500">Make sure your manuscript is formatted correctly before you begin. Once submitted, your work will be checked against our scope and ethical guidelines before being sent for peer review.</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link to="/submit" className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors active:scale-[0.98]">
              Submit Manuscript
            </Link>
            <Link to="/auth" className="inline-flex items-center gap-2 border border-stone-200 text-stone-700 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors active:scale-[0.98]">
              Sign In
            </Link>
          </div>
          <p className="text-xs text-stone-400 pt-1">
            Questions? Email <a href="mailto:editor.ijsds@gmail.com" className="text-primary hover:underline">editor.ijsds@gmail.com</a>
          </p>
        </section>

      </main>
    </div>
  );
};

export default SubmissionGuidelines;
