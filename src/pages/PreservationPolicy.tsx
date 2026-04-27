import React from 'react';
import { Helmet } from 'react-helmet-async';

export const PreservationPolicy = () => {
  return (
    <div className="min-h-screen bg-[#fcf9f8] font-body">
      <Helmet>
        <title>Digital Preservation — IJSDS</title>
        <meta name="description" content="Ensuring that every article published in IJSDS remains permanently available and accessible." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="mb-14 pb-10 border-b border-stone-200">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary block mb-4">
            Journal Policy
          </span>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
            Digital Preservation
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xl">
            Ensuring that every article published in IJSDS remains permanently available and accessible to readers around the world, now and for future generations.
          </p>
        </div>

        <div className="prose prose-stone max-w-none space-y-10 text-stone-700 leading-[1.85] text-[15px]">
          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Protecting Scholarly Work
            </h2>
            <p>
              IJSDS takes seriously its responsibility to keep published research available for the long term. Our preservation system ensures every article remains intact and accessible. We use multiple backup systems and partner with international preservation services to protect against data loss in all scenarios.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              How We Preserve Your Research
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-4">
              <li><strong>International Archives:</strong> We work with CLOCKSS and Portico — trusted global archives — to ensure your published articles are safely stored and can always be recovered if our platform has issues.</li>
              <li><strong>Permanent Links (DOIs):</strong> Every article receives a Digital Object Identifier (DOI) — a permanent web link that never breaks, ensuring your research can always be found and cited correctly.</li>
              <li><strong>Self-Archiving Welcome:</strong> Authors are encouraged to upload their published articles to their institution's own repository. This creates an additional independent copy that further protects the work.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Technical Safeguards
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-stone-900">Metadata Storage</h3>
                <p>All article information — authors, abstracts, references — is stored in standard international formats to ensure it can be read and used far into the future. We employ automated daily backups, storage in multiple locations, and continuous file integrity checks.</p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Version History</h3>
                <p>Every correction or update to a published article is recorded and archived, so the full history of a paper is always preserved.</p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">High Availability</h3>
                <p>We target 99.9% uptime for our journal website, so readers around the world can access published articles at any time.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PreservationPolicy;