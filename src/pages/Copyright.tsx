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
              Creative Commons Attribution 4.0
            </h2>
            <p>
              IJSDS is fully open access. Authors retain full copyright while granting the journal the right to publish and distribute the work under the{' '}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4 hover:text-primary/70 transition-colors">
                Creative Commons Attribution 4.0 (CC BY 4.0)
              </a>{' '}
              license. This means anyone can read, share, and build on the work — as long as they credit the original authors.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              What Authors Retain
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Copyright ownership:</strong> You keep full copyright of your article. You do not need to transfer it to the journal.</li>
              <li><strong>Attribution:</strong> Anyone who reproduces or builds on your work must credit you as the original author.</li>
              <li><strong>Reuse rights:</strong> You are free to include your published article in future books, theses, or other publications — no further permission needed from IJSDS.</li>
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
