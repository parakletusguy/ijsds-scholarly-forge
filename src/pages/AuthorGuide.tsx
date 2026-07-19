import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">{children}</h2>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-bold text-stone-900 mt-5 mb-1.5">{children}</h3>
);

const Table = ({ head, rows }: { head: [string, string]; rows: [string, React.ReactNode][] }) => (
  <>
    {/* Mobile: stacked rows (no horizontal scrolling) */}
    <div className="mt-4 sm:hidden border border-stone-200 divide-y divide-stone-100">
      {rows.map(([k, v], i) => (
        <div key={i} className="p-4">
          <p className="font-semibold text-stone-800 mb-1.5">{k}</p>
          <p className="text-sm text-stone-600 leading-relaxed">{v}</p>
        </div>
      ))}
    </div>

    {/* sm and up: real table */}
    <div className="mt-4 hidden sm:block border border-stone-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-200 text-left">
            <th className="px-4 py-2.5 font-semibold text-stone-700 w-1/3">{head[0]}</th>
            <th className="px-4 py-2.5 font-semibold text-stone-700">{head[1]}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map(([k, v], i) => (
            <tr key={i} className="align-top">
              <td className="px-4 py-3 font-semibold text-stone-800">{k}</td>
              <td className="px-4 py-3 text-stone-600 leading-relaxed">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

export const AuthorGuide = () => {
  return (
    <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
      <Helmet>
        <title>Author Guide: Review & Editing — IJSDS</title>
        <meta
          name="description"
          content="What happens to your manuscript after you submit to IJSDS: the review stages, how AI tools are and are not used, what you receive at each step, and your rights as an author."
        />
      </Helmet>

      <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-4 inline-block">
            ← Home
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-3">For Authors</span>
          <h1 className="text-3xl font-headline font-light tracking-tight text-stone-900">
            Author Guide: <span className="italic text-primary">Review &amp; Editing</span>
          </h1>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl">
            What happens to your manuscript after you submit — the stages it moves through, how AI tools are (and are never) used, what we send you at each step, and your rights throughout.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-widest">
            <Link to="/submission-guidelines" className="text-stone-500 hover:text-primary">Submission Guidelines →</Link>
            <Link to="/ai-policy" className="text-stone-500 hover:text-primary">AI Use &amp; Disclosure Policy →</Link>
            <Link to="/peer-review" className="text-stone-500 hover:text-primary">Peer Review Policy →</Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-16">
        <div className="space-y-10 text-stone-700 leading-[1.85] text-[15px]">
          <section>
            <H2>1. What this guide is for</H2>
            <p>
              Once you submit to IJSDS, your manuscript enters a structured process before it is either returned for
              revision or accepted for publication. This guide explains every stage in plain language: what we check,
              who makes decisions, how AI tools are used (and where they are never used), and what you can expect from
              us at each step. Reading it before you submit helps you prepare a manuscript that moves through the
              process more smoothly.
            </p>
          </section>

          <section>
            <H2>2. Your manuscript's journey, stage by stage</H2>

            <H3>Stage 1 — Initial compliance check</H3>
            <p>
              Before your manuscript reaches a reviewer, our editorial team confirms it meets the basic requirements:
              correct article type and word limit, required sections present, APA 7th Edition referencing, Times New
              Roman 12pt, and double-spacing. We also confirm your main manuscript file contains no identifying
              information — your name, institution, and funding acknowledgements belong on the title page only. If a
              check fails, we return the manuscript with a specific description of what to correct. This is not a
              rejection; it is a request to resubmit with the issue resolved.
            </p>

            <H3>Stage 2 — AI-assisted pre-review check (only with your consent)</H3>
            <p>
              Once compliance is confirmed, and only where you gave explicit consent at submission, we use AI tools to
              assist with bounded pre-review checks. This produces a technical preparation report — a systematic check
              of references, formatting, and language. It is not peer review and not an editorial judgment. See
              Section 4 for exactly what this involves.
            </p>

            <H3>Stage 3 — Double-blind peer review</H3>
            <p>
              Your manuscript then enters double-blind review: reviewers do not know who you are, and you do not know
              who they are. We assign a minimum of two independent reviewers with relevant subject expertise, who
              assess the scholarly contribution, methodology, argumentation, and significance of your work. This stage
              is entirely human-led — no AI tool plays any role in the peer-review assessment, and none is permitted
              to. Peer review typically takes 90 to 120 days; we acknowledge receipt and notify you when it is
              complete.
            </p>

            <H3>Stage 4 — Editorial decision</H3>
            <p>
              After reviewers return their assessments, the editor-in-chief makes one of four decisions: accept, minor
              revision, major revision, or reject. You receive a decision letter explaining the outcome, with reviewer
              comments attached where revision is requested, and the expected turnaround time for your response.
            </p>

            <H3>Stage 5 — Post-revision check and final editing</H3>
            <p>
              Revised manuscripts are checked against the reviewers' comments before a final decision. Once accepted,
              your manuscript undergoes a final formatting and consistency edit — AI-assisted where you have consented,
              within the same bounded scope described in Section 4.
            </p>
          </section>

          <section>
            <H2>3. What we never change about your manuscript</H2>
            <p>
              Whether the work is done by a human editor, a peer reviewer, or an AI-assisted tool, the following are
              never changed without your explicit instruction:
            </p>
            <Table
              head={['We never change', 'What this means for you']}
              rows={[
                ['Your title', 'Even if we think another title would be clearer, we do not change it. We may note a concern; the decision is yours.'],
                ['Your research questions', 'These define the scope of your work. Reframing them changes your research, not your manuscript.'],
                ['Your methodology', 'If a method appears inconsistent with your findings, we flag it — we do not silently rewrite either section.'],
                ['Your findings and results', 'No number, figure, or reported outcome is altered without your confirmation, even if we suspect an error.'],
                ['Your conclusions', 'Your interpretation of your findings is yours. We may note where a conclusion reaches beyond its evidence; we do not rewrite it.'],
                ['Your theoretical position', 'The frameworks and disciplinary argument you make are your scholarly choices, not ours to second-guess.'],
                ['Your voice and register', 'Grammar and clarity may be smoothed; your distinctive expression is not homogenised beyond what APA 7th and IJSDS formatting require.'],
              ]}
            />
            <p className="mt-4">
              <strong>A working test:</strong> if a change corrects an error or improves clarity, it is within our
              editing scope. If it would more honestly be described as changing what you found or what you argued, it
              belongs to you as the author — never to the editing process acting alone.
            </p>
          </section>

          <section>
            <H2>4. How AI tools are used — and where they are not</H2>
            <p>
              This section summarises our full <Link to="/ai-policy" className="text-primary underline underline-offset-4">AI Use &amp; Disclosure Policy</Link>.
            </p>

            <H3>Where AI is used</H3>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Checking formatting requirements (font, spacing, margins, line numbering, section structure).</li>
              <li>Verifying that cited sources are real, accurately described, and correctly attributed — a citation-by-citation check against live academic databases.</li>
              <li>Reviewing language and grammar for clarity and consistency.</li>
              <li>Flagging potential unmarked overlap with other published work for human editorial review.</li>
            </ul>

            <H3>Where AI is never used</H3>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>To assess the scholarly merit, originality, or significance of your work.</li>
              <li>In the recommendation to accept, reject, or request revision.</li>
              <li>To generate the substantive comments peer reviewers provide.</li>
              <li>To change your manuscript's argument, findings, scope, or conclusions.</li>
            </ul>

            <H3>The safeguard that protects your double-blind status</H3>
            <p>
              Citation-verification searches are seeded only from your own reference list — confirming that sources you
              cited say what you attribute to them. Your original findings, unpublished results, and distinctive
              phrasing are never used to seed a search, so the check cannot inadvertently surface a preprint or working
              paper that identifies you.
            </p>

            <H3>Infrastructure and your consent</H3>
            <p>
              Where AI is used, it runs on commercial enterprise infrastructure under terms that prohibit your
              manuscript from being used to train AI models, and it is not retained beyond what the workflow requires.
              At submission you choose whether to consent. If you decline, your manuscript receives the same review and
              the same consideration, with these checks performed manually instead — the only difference is that manual
              checking takes longer.
            </p>
          </section>

          <section>
            <H2>5. What you will receive at each stage</H2>
            <Table
              head={['Stage', 'What we send you']}
              rows={[
                ['Submission received', 'Acknowledgement of receipt, with your submission reference number and the expected review timeline (90–120 days).'],
                ['Compliance check', 'If it fails: a specific list of what to correct, with the chance to resubmit. If it passes: notice that your manuscript has entered review.'],
                ['Pre-review check (with consent)', 'A summary of any formatting or citation concerns, with the chance to correct them before reviewers see your work. Not a review decision.'],
                ['Editorial decision', 'A decision letter (accept / minor revision / major revision / reject), with reviewer comments where revision is requested, plus a response turnaround time.'],
                ['Revision received', 'Confirmation that your revised manuscript has re-entered the editorial process.'],
                ['Final acceptance', 'An acceptance letter with the expected publication timeline and any final formatting requests.'],
              ]}
            />
          </section>

          <section>
            <H2>6. When a citation issue is found</H2>
            <p>
              The citation-verification step checks every reference against live academic databases. The response
              depends on the nature of the problem — and we never select a replacement source for you:
            </p>
            <Table
              head={['Type of finding', 'What happens']}
              rows={[
                ['Minor detail error', 'A verifiable slip (wrong year, volume, or page range) is corrected directly and noted in your report.'],
                ['Missing DOI', 'If a DOI exists and was omitted, it is added. If none exists (common for books and older work), that is noted as a normal fact, not a defect.'],
                ['Citation–claim mismatch', 'If a real source does not support the claim you attribute to it, we flag it with the source’s actual finding and ask you to revise the claim or supply another. We do not reword your claim to fit.'],
                ['Unverifiable citation', 'If a source cannot be located after multiple searches, it is flagged for you to substantiate or remove. We do not delete citations you may hold in your own records.'],
                ['Inflated or fabricated detail', 'If a real source’s sample size, scope, or finding has been significantly misrepresented, this is flagged for editorial review as an integrity concern, and your response is requested.'],
              ]}
            />
          </section>

          <section>
            <H2>7. What you must include — ethical declarations</H2>
            <p>Missing any of these will result in your manuscript being returned before review:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Ethics approval:</strong> for research with human participants, state clearly in the Method section that ethics-board approval was obtained, with the approval reference. If your national context does not require formal approval for your study type, state this and describe the ethical oversight that was in place instead.</li>
              <li><strong>Conflict of interest:</strong> declare any financial or personal relationship that could influence your work. If none exists, include a statement to that effect. A <em>missing</em> statement — not a declared conflict — is itself a compliance failure.</li>
              <li><strong>AI-use disclosure:</strong> if you used AI writing tools (ChatGPT, Claude, Gemini, Grammarly's AI features, or comparable) in preparing your manuscript, disclose which tool and for what purpose. We do not prohibit AI writing assistance, but undisclosed use identified later is treated as a transparency breach.</li>
              <li><strong>Author information (title page only):</strong> your name, institution, contact email, and any acknowledgements or funding must appear on the title page — not in the main file, including its document metadata.</li>
            </ul>
          </section>

          <section>
            <H2>8. Responding to a revision request</H2>
            <p>If review results in a minor or major revision, your revised submission should:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Address every reviewer comment — where you disagree, explain why clearly and respectfully rather than ignoring it.</li>
              <li>Include a separate response-to-reviewers document listing each comment and your action (revised as suggested; not revised, with explanation; or already addressed).</li>
              <li>Highlight changes so reviewers can find them quickly — tracked changes or highlighted text is fine.</li>
              <li>Not introduce new scope, new research questions, or substantively new findings unless the editor specifically invites it. Revision responds to the manuscript under review; it is not an opportunity to submit a different paper.</li>
            </ul>
            <p className="mt-3">A thoughtful response to reviewers is one of the strongest factors in a revised manuscript's success.</p>
          </section>

          <section>
            <H2>9. Your rights as an author</H2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>To know what changed and why.</strong> Any change made during editing is documented and disclosed to you; you never receive an edited version without a report of what changed, by whom, and on what basis.</li>
              <li><strong>To decline AI assistance</strong> without penalty. Your manuscript receives the same review; checks are performed manually instead.</li>
              <li><strong>To decline a suggested change.</strong> Editorial suggestions are suggestions, not instructions; declining one does not penalise your manuscript.</li>
              <li><strong>To respond before a citation issue is resolved.</strong> Where a concern needs your input, you are contacted before any change is made.</li>
              <li><strong>To appeal a decision.</strong> If you believe a rejection rested on a factual error or procedural failure rather than genuine scholarly assessment, write to the editor-in-chief at <a href="mailto:editor@ijsds.org" className="text-primary underline underline-offset-4">editor@ijsds.org</a> with the grounds for your appeal.</li>
            </ul>
          </section>

          <section>
            <H2>10. Contact</H2>
            <p>
              Editorial Office: Centre for Social Work and Development Studies, Rivers State University,
              Nkpolu-Oroworukwo, PMB 5060, Port Harcourt, Nigeria.
            </p>
            <p className="mt-2">
              Email <a href="mailto:editor@ijsds.org" className="text-primary underline underline-offset-4">editor@ijsds.org</a>. For a submission's status, include your reference number in the subject line. For questions about this guide, use the subject line "Author Guide Inquiry."
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AuthorGuide;
