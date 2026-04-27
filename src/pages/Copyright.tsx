import React from 'react';
import { Helmet } from 'react-helmet-async';

const Copyright = () => {
  return (
    <div className="min-h-screen bg-[#fcf9f8] font-body">
      <Helmet>
        <title>Copyright & Licensing — IJSDS</title>
        <meta name="description" content="A framework governing intellectual property, licensing, and author rights." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="mb-14 pb-10 border-b border-stone-200">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary block mb-4">
            Journal Policy
          </span>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
            Copyright & Licensing
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xl">
            A framework governing intellectual property, licensing, and author rights within the global multidisciplinary research commons.
          </p>
        </div>

        <div className="prose prose-stone max-w-none space-y-10 text-stone-700 leading-[1.85] text-[15px]">
          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Creative Commons Attribution 4.0
            </h2>
            <p>
              IJSDS operates under the Open Access Protocol. Authors retain full copyright while granting the journal a perpetual license for global dissemination under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">Creative Commons Attribution 4.0 (CC BY 4.0)</a> license.
            </p>
            <p>
              This framework empowers authors to maximize the reach of their multidisciplinary synthesis while maintaining absolute sovereignty over their intellectual property.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Scholarly Rights Ledger
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Copyright Retention:</strong> Authors maintain primary ownership of the submitted manuscript throughout the archival lifecycle. Authors are not required to transfer title.</li>
              <li><strong>Archival Attribution:</strong> Universal requirement for third parties to credit the original author and journal in all subsequent iterations.</li>
              <li><strong>Exploitation Liberty:</strong> Freedom to repurpose, translate, and synthesize the published work in future multidisciplinary monographs.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Author Responsibilities
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-stone-900">Originality Warranty</h3>
                <p>Authors must certify that the submission is an original intellectual synthesis and does not infringe upon external copyright archives.</p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Attribution Integrity</h3>
                <p>Every external data fragment, figure, or conceptual model must be correctly attributed within the multidisciplinary reference ledger.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Copyright;