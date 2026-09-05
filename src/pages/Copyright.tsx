import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Copyright = () => {
  return (
    <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
      <Helmet>
        <title>Copyright & Licensing — IJSDS</title>
        <meta name="description" content="Authors retain full copyright of their work. All articles are published under the Creative Commons Attribution 4.0 license." />
      </Helmet>

      <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-4 inline-block">
            ← Home
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-3">Journal Policy</span>
          <h1 className="text-3xl font-headline font-light tracking-tight text-stone-900">
            Copyright & <span className="italic text-primary">Licensing</span>
          </h1>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl">
            Authors retain full copyright of their work. All articles are published under the Creative Commons Attribution 4.0 (CC BY 4.0) license.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-16">
        <div className="space-y-10 text-stone-700 leading-[1.85] text-[15px]">

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Copyright Policy
            </h2>
            <div className="bg-white border border-stone-200 p-6 mb-4">
              <p className="text-stone-800 leading-[1.85]">
                Authors publishing with the International Journal of Social Work and Development Studies
                (IJSDS) retain the copyright and full publishing rights without restrictions. Authors
                grant the journal right of first publication with the work simultaneously licensed under
                a{' '}
                <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline underline-offset-4 hover:text-primary/70 transition-colors">
                  Creative Commons Attribution 4.0 International License (CC BY 4.0)
                </a>.{' '}
                This license allows others to share and adapt the work with an acknowledgement of the
                work's authorship and initial publication in this journal.
              </p>
            </div>
            <p>
              IJSDS does not require authors to sign a copyright transfer agreement. Authors retain
              the right to archive, share, and reuse their own work in any context — including
              depositing it in institutional repositories, sharing on personal or academic profile
              pages, and including it in future publications.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Licensing Statement
            </h2>
            <div className="bg-white border border-stone-200 p-6 mb-4">
              <p className="text-stone-800 leading-[1.85]">
                All articles published in IJSDS are licensed under a{' '}
                <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline underline-offset-4 hover:text-primary/70 transition-colors">
                  Creative Commons Attribution 4.0 International License (CC BY 4.0)
                </a>.{' '}
                Under this license, users are free to copy, distribute, display, and perform the work,
                as well as make derivative works and commercial uses, provided the original author and
                source are credited.
              </p>
            </div>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Share:</strong> Copy and redistribute the material in any medium or format.</li>
              <li><strong>Adapt:</strong> Remix, transform, and build upon the material for any purpose, including commercially.</li>
              <li><strong>Condition:</strong> You must give appropriate credit, provide a link to the license, and indicate if changes were made.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              What Authors Retain
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Full copyright ownership:</strong> You keep complete copyright of your article. You do not transfer it to the journal.</li>
              <li><strong>Attribution:</strong> Anyone who reproduces or builds on your work must credit you as the original author.</li>
              <li><strong>Reuse rights:</strong> You are free to include your published article in future books, theses, or other publications — no further permission needed from IJSDS.</li>
              <li><strong>Self-archiving:</strong> You may deposit the final published version in institutional repositories, personal websites, or academic platforms such as ResearchGate or Academia.edu.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Author Responsibilities
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-stone-900">Originality</h3>
                <p>By submitting, you confirm that the manuscript is your own original work and does not infringe the copyright of any third party.</p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Proper Attribution</h3>
                <p>All figures, tables, data, and ideas taken from other sources must be properly cited in your reference list.</p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Copyright;
