import React from 'react';
import { Helmet } from 'react-helmet-async';

export const PlagiarismPolicy = () => {
  return (
    <div className="min-h-screen bg-[#fcf9f8] font-body">
      <Helmet>
        <title>Plagiarism Policy — IJSDS</title>
        <meta name="description" content="Our unwavering commitment to ethical publishing and a zero-tolerance approach to plagiarism and academic dishonesty." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="mb-14 pb-10 border-b border-stone-200">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary block mb-4">
            Journal Policy
          </span>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
            Plagiarism Policy
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xl">
            Our unwavering commitment to ethical publishing and a zero-tolerance approach to plagiarism and academic dishonesty in all submitted manuscripts.
          </p>
        </div>

        <div className="prose prose-stone max-w-none space-y-10 text-stone-700 leading-[1.85] text-[15px]">
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
              All reports are handled in strict confidence by our editorial team and investigated thoroughly with appropriate action taken. To report suspected plagiarism, please contact <a href="mailto:editor.ijsds@gmail.com" className="text-primary underline underline-offset-4">editor.ijsds@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PlagiarismPolicy;
