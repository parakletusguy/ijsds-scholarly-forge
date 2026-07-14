import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export const PlagiarismPolicy = () => {
  return (
    <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
      <Helmet>
        <title>Plagiarism Policy — IJSDS</title>
        <meta name="description" content="Our zero-tolerance approach to plagiarism and academic dishonesty in all submitted manuscripts." />
      </Helmet>

      <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-4 inline-block">
            ← Home
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-3">Journal Policy</span>
          <h1 className="text-3xl font-headline font-light tracking-tight text-stone-900">
            Plagiarism <span className="italic text-primary">Policy</span>
          </h1>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl">
            A zero-tolerance approach to plagiarism and academic dishonesty. Every manuscript is screened before peer review.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-16">
        <div className="space-y-10 text-stone-700 leading-[1.85] text-[15px]">
          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Zero Tolerance
            </h2>
            <p>
              The International Journal of Social Work and Development Studies (IJSDS) is committed to the highest standards of Academic Integrity. We use Crossref Similarity Check to screen every manuscript for plagiarism before publication. Our mission is to protect the authenticity and originality of all research we publish.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              What Counts as Plagiarism
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Direct Copying:</strong> Reproducing another author's exact words without quotation marks or citation.</li>
              <li><strong>Patchwork Writing:</strong> Piecing together text from multiple sources without proper attribution.</li>
              <li><strong>Improper Attribution:</strong> Using figures, tables, or research designs without permission or attribution.</li>
              <li><strong>Self-Plagiarism:</strong> Re-submitting your own previously published work as an original contribution.</li>
              <li><strong>Undisclosed AI Content:</strong> Presenting undisclosed AI-generated content as original research.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Consequences of Plagiarism
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="font-bold text-stone-900 mb-2">Before Publication</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Manuscript is immediately rejected</li>
                  <li>Formal notice sent to the author's institution</li>
                  <li>Author barred from submitting for 3 years</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-stone-900 mb-2">After Publication</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Article is immediately retracted</li>
                  <li>Author is permanently banned from the journal</li>
                  <li>COPE is formally notified</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Best Practices for Authors
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Cite Everything:</strong> Follow APA 7th Edition for all in-text citations and your reference list. When in doubt, cite the source.</li>
              <li><strong>Write in Your Own Words:</strong> When using another author's ideas, fully rewrite them in your own words — not just a word swap — and always credit the original source.</li>
              <li><strong>Disclose Overlaps:</strong> If your manuscript builds on your own previous work or uses AI assistance in any form, you must disclose this clearly in your submission.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Report Suspected Plagiarism
            </h2>
            <p>
              All reports are handled in strict confidence by our editorial team and investigated thoroughly with appropriate action taken. To report suspected plagiarism, please contact <a href="mailto:editor@ijsds.org" className="text-primary underline underline-offset-4">editor@ijsds.org</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PlagiarismPolicy;
