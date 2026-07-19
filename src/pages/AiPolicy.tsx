import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export const AiPolicy = () => {
  return (
    <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
      <Helmet>
        <title>AI Use & Disclosure Policy — IJSDS</title>
        <meta
          name="description"
          content="How, when, and with what disclosure AI tools may be used in the review and editing of IJSDS submissions — and the choice authors are given at submission."
        />
      </Helmet>

      <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-4 inline-block">
            ← Home
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-3">Journal Policy</span>
          <h1 className="text-3xl font-headline font-light tracking-tight text-stone-900">
            AI Use &amp; <span className="italic text-primary">Disclosure Policy</span>
          </h1>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl">
            How, when, and with what disclosure AI tools may be used in the review and editing of IJSDS submissions — and the choice you are given at submission.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-16">
        <div className="space-y-10 text-stone-700 leading-[1.85] text-[15px]">
          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              1. Purpose
            </h2>
            <p>
              Securing AI-assisted editorial tools against data leakage is a technical problem. Obtaining an author's genuine permission to have their unpublished work processed by an AI tool at all is a separate, consent-based problem — and infrastructure alone does not solve it. This policy is IJSDS's answer to that gap: real disclosure, real consent, and a bounded, honestly stated scope for what AI tools are actually used for.
            </p>
            <p className="mt-3">
              This policy governs the use of AI tools by IJSDS editorial staff and reviewers. It does not govern authors' own use of AI in preparing their manuscripts, which is addressed by the AI-disclosure requirement in our Submission Guidelines.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              2. What AI tools do — and never do — at IJSDS
            </h2>
            <p>AI assistance is confined to bounded, non-substantive tasks:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Formatting compliance:</strong> checking manuscripts against our style guidelines — word limits, structure, reference formatting, and blind-review preparation.</li>
              <li><strong>Citation verification:</strong> confirming that a manuscript's own cited sources are real, accurately described, and correctly attributed (restricted as described in Section 4).</li>
              <li><strong>Language and grammar review:</strong> identifying grammar, clarity, and consistency issues for author or editor attention.</li>
              <li><strong>Plagiarism-adjacent screening support:</strong> flagging potential unmarked overlap for human confirmation — never a final determination.</li>
            </ul>
            <p className="mt-5 font-semibold text-stone-900">AI is never used to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>assess scholarly merit, originality, or significance;</li>
              <li>recommend that a manuscript be accepted, rejected, or revised;</li>
              <li>generate reviewer comments that substantively evaluate the work.</li>
            </ul>
            <p className="mt-4">
              No AI tool used by IJSDS makes, drafts, or substantively influences a decision to accept, reject, or request revision of a manuscript.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              3. Infrastructure commitment
            </h2>
            <p>Where authorized, manuscript content is processed only through commercial-tier AI infrastructure, never consumer tools:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>AI is accessed only under commercial terms of service — never a free or personal consumer account.</li>
              <li>Manuscript content is never used to train AI models. This is a contractual default, not a setting that could be silently reversed.</li>
              <li>Data retention is minimized to what the editorial workflow requires and no longer.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              4. The de-anonymization safeguard
            </h2>
            <p>
              Citation verification requires searching external sources. To protect double-blind review, citation-verification searches are restricted to information already present in the manuscript's own reference list — confirming that a cited source exists, is accurately described, and supports the claim attributed to it.
            </p>
            <p className="mt-3">
              Searches are never seeded with the manuscript's own original findings, results, direct quotations, or distinctive unpublished phrasing. Where verifying a claim would require searching content that did not originate in a cited source, the claim is flagged for human reviewer attention instead of searched.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              5. Human accountability
            </h2>
            <p>
              No AI tool is an accountable party in the IJSDS review process. Every substantive judgment is made by a named, accountable human editor or reviewer. AI-assisted formatting and citation-verification output is always reviewed by editorial staff before any action is taken; it is never applied automatically or treated as a final determination.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              6. Your consent and choice
            </h2>
            <p>
              At submission, before uploading files, you are asked to make a clear choice about AI-assisted formatting and citation-verification support for your manuscript. Both options proceed to submission, and neither choice needs to be justified.
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>If you consent,</strong> the bounded tasks in Section 2 may be performed with AI assistance under the safeguards above.</li>
              <li><strong>If you prefer manual checks,</strong> those same tasks are performed manually by editorial staff instead. This may extend the formatting and citation-verification stage of review, but does not disadvantage your manuscript's substantive consideration in any way — that consideration is always human, regardless of your choice.</li>
            </ul>
            <p className="mt-3">
              Your selection is recorded with your submission for editorial reference. It is not published and is not shared with reviewers.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              7. Reviewer and editor disclosure
            </h2>
            <p>Any peer reviewer who wishes to use an AI tool for their own review preparation must:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>never input any portion of the manuscript, or content derived from it, into an AI tool;</li>
              <li>use AI only to polish the language of review comments they have already substantively written — not to generate the assessment itself;</li>
              <li>disclose this use to the handling editor, including which tool was used and for what purpose, before the review is finalized.</li>
            </ul>
            <p className="mt-3">
              Undisclosed or out-of-scope AI use by a reviewer is treated as a review-integrity concern requiring editorial follow-up.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              8. Policy review
            </h2>
            <p>
              This is an actively evolving area of publishing ethics. IJSDS reviews this policy at minimum every six months, and immediately upon any material change to the commercial data-handling terms of the AI infrastructure it relies on. Questions may be directed to{' '}
              <a href="mailto:editor@ijsds.org" className="text-primary underline underline-offset-4">editor@ijsds.org</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AiPolicy;
