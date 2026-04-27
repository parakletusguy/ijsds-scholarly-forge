import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export const SubmissionGuidelines = () => {
  return (
    <div className="min-h-screen bg-[#fcf9f8] font-body">
      <Helmet>
        <title>Submission Guidelines — IJSDS</title>
        <meta name="description" content="Technical instructions for preparing and submitting multidisciplinary research manuscripts to IJSDS." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="mb-14 pb-10 border-b border-stone-200">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary block mb-4">
            Author Instructions
          </span>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
            Submission Guidelines
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xl">
            A framework for preparing and submitting your scholarly work. Adherence to these protocols ensures a streamlined editorial audit and peer-review trajectory.
          </p>
        </div>

        <div className="prose prose-stone max-w-none space-y-10 text-stone-700 leading-[1.85] text-[15px]">
          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Manuscript Typology
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Original Research (6,000-8,000 words):</strong> Empirical studies with significant developmental impact across African sectors.</li>
              <li><strong>Review Articles (4,000-6,000 words):</strong> In-depth synthesis of historical and contemporary scholarly literature.</li>
              <li><strong>Case Studies (3,000-4,000 words):</strong> Rigorous analysis of specific social interventions or policy implementations.</li>
              <li><strong>Short Communications (1,500-2,500 words):</strong> Preliminary findings or methodological innovations requiring urgent dissemination.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Formatting Protocol
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Double-spaced throughout (12-point standard font like Times New Roman).</li>
              <li>Universal 1-inch margins on all orientations.</li>
              <li>Continuous sequential line numbering for audit.</li>
              <li>High-fidelity vector graphics (TIFF/EPS) at 300+ DPI.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Structural Hierarchy
            </h2>
            <ol className="list-decimal pl-5 mt-4 space-y-2">
              <li><strong>Title Page:</strong> Author metadata & institutional affiliations.</li>
              <li><strong>Abstract:</strong> Technical summary (250-300 words).</li>
              <li><strong>Keywords:</strong> 5-7 multidisciplinary discovery tags.</li>
              <li><strong>Core Body:</strong> Introduction, Method, Results, Discussion.</li>
              <li><strong>Reference Ledger:</strong> Rigorous APA 7th Edition adherence.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Ethical Requirements
            </h2>
            <p>
              All submissions must undergo rigorous Institutional Review Board (IRB) approval (where applicable) and adhere to the strict IJSDS anti-plagiarism ledger. Requirements include:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Informed Consent Documentation Required</li>
              <li>Conflict of Interest Ledger Declaration</li>
              <li>Crossref Similarity Audit Compliance</li>
              <li>Human/Animal Protocol Verification</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Submission Trajectory
            </h2>
            <ol className="list-decimal pl-5 mt-4 space-y-2">
              <li><strong>Archive Registration:</strong> Establish your scholarly presence on the IJSDS secure portal.</li>
              <li><strong>Technical Alignment:</strong> Verify manuscript adherence to the Archival Prep Ledger.</li>
              <li><strong>Registry Upload:</strong> Submit all technical files and multidisciplinary metadata.</li>
              <li><strong>Editorial Audit:</strong> Initial quality assessment and scope verification by the Directorate.</li>
              <li><strong>Peer Evaluation:</strong> Double-blind consensus review by international subject experts.</li>
              <li><strong>Final Validation:</strong> Directorate consensus: Acceptance, Revision, or Registry Rejection.</li>
            </ol>
          </section>

          <section>
            <div className="mt-8 p-6 bg-white border border-stone-200 rounded-sm">
              <h3 className="font-bold text-stone-900 mb-2">Ready to Submit?</h3>
              <p className="text-sm mb-4">Ensure your manuscript is fully prepared according to the guidelines before initiating submission.</p>
              <div className="flex gap-4">
                <Link to="/submit" className="bg-primary text-white px-6 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
                  Initiate Manuscript
                </Link>
                <Link to="/auth" className="bg-stone-100 text-stone-700 px-6 py-2 text-sm font-medium hover:bg-stone-200 transition-colors">
                  Login
                </Link>
              </div>
            </div>
            <p className="text-sm text-stone-500 mt-6">
              Encountering submission impediments? Contact our technical directorate at <a href="mailto:editor.ijsds@gmail.com" className="text-primary underline">editor.ijsds@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SubmissionGuidelines;