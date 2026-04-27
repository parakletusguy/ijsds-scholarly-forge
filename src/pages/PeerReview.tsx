import React from 'react';
import { Helmet } from 'react-helmet-async';

export const PeerReview = () => {
  return (
    <div className="min-h-screen bg-[#fcf9f8] font-body">
      <Helmet>
        <title>Peer Review Process — IJSDS</title>
        <meta name="description" content="Information on the rigorous double-blind peer review process at the International Journal of Social Work and Development Studies." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
        {/* Page Header */}
        <div className="mb-14 pb-10 border-b border-stone-200">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary block mb-4">
            Journal Policy
          </span>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
            Peer Review Process
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xl">
            Our rigorous double-blind peer review framework ensures the objectivity, scientific merit, and developmental impact of every published article.
          </p>
        </div>

        {/* Body Content */}
        <div className="prose prose-stone max-w-none space-y-10 text-stone-700 leading-[1.85] text-[15px]">
          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Double-Blind Protocol
            </h2>
            <p>
              IJSDS adheres to a strict double-blind peer review process. This means that both the reviewer and author identities are concealed from each other throughout the review process. 
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Author Anonymity:</strong> Personal identifiers, institutional affiliations, and explicit self-citations are removed from the manuscript before review to eliminate bias.</li>
              <li><strong>Reviewer Anonymity:</strong> Reviewer identities are protected to ensure honest, critical, and independent evaluation of the scholarly work.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              The Review Process
            </h2>
            <p>
              Every submitted manuscript goes through a structured evaluation trajectory:
            </p>
            <div className="space-y-6 mt-6">
              <div>
                <h3 className="font-semibold text-stone-900">1. Editorial Screening</h3>
                <p className="mt-1">All submissions first undergo a technical check by the editorial team to ensure they fit the journal's scope, meet ethical standards, and follow our formatting guidelines.</p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">2. Reviewer Selection</h3>
                <p className="mt-1">For manuscripts passing the initial screen, the editors identify and invite 2-3 independent subject experts to evaluate the work.</p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">3. Scientific Evaluation</h3>
                <p className="mt-1">Reviewers assess the manuscript for its methodological rigor, conceptual novelty, and relevance to social work and development studies.</p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">4. Final Decision</h3>
                <p className="mt-1">The Editor-in-Chief synthesizes the reviewers' feedback and makes the final decision on the manuscript.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Evaluation Standards
            </h2>
            <p>
              Reviewers evaluate submissions based on several key criteria:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Scientific Merit:</strong> Methodological soundness, data reliability, and rigorous analysis.</li>
              <li><strong>Novelty and Impact:</strong> Originality of the research and its potential contribution to theory, practice, or policy.</li>
              <li><strong>Clarity and Presentation:</strong> Logical flow, clear writing, and adherence to academic formatting.</li>
              <li><strong>Ethical Integrity:</strong> Appropriate ethical approvals and responsible research practices.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Decision Outcomes
            </h2>
            <p>
              Following the review process, authors will receive one of the following decisions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-white border border-stone-200 rounded-sm">
                <h4 className="font-bold text-stone-900 mb-2">Accept</h4>
                <p className="text-sm">The manuscript meets all scholarly standards and is accepted for publication without further changes.</p>
              </div>
              <div className="p-4 bg-white border border-stone-200 rounded-sm">
                <h4 className="font-bold text-stone-900 mb-2">Minor Revisions</h4>
                <p className="text-sm">The article requires slight stylistic or conceptual adjustments before it can be accepted.</p>
              </div>
              <div className="p-4 bg-white border border-stone-200 rounded-sm">
                <h4 className="font-bold text-stone-900 mb-2">Major Revisions</h4>
                <p className="text-sm">Significant revisions are required. The revised manuscript will likely undergo a second round of review.</p>
              </div>
              <div className="p-4 bg-white border border-stone-200 rounded-sm">
                <h4 className="font-bold text-stone-900 mb-2">Reject</h4>
                <p className="text-sm">The manuscript does not meet the journal's standards or falls outside its developmental scope.</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PeerReview;