import { Helmet } from 'react-helmet-async';

export const EthicalGuidelines = () => {
  return (
    <div className="min-h-screen bg-[#fcf9f8] font-body">
      <Helmet>
        <title>Ethical Guidelines — IJSDS</title>
        <meta name="description" content="IJSDS ethical guidelines for authors, editors, and reviewers — our commitment to integrity, fairness, and transparency in scholarly publishing." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">

        {/* Page Header */}
        <div className="mb-14 pb-10 border-b border-stone-200">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary block mb-4">
            Journal Policy
          </span>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
            Ethical Guidelines
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xl">
            IJSDS is committed to upholding the highest ethical standards in scholarly publishing. 
            These guidelines apply to all parties involved — authors, editors, and peer reviewers — 
            and are aligned with the principles of the Committee on Publication Ethics (COPE).
          </p>
        </div>

        {/* Body */}
        <div className="space-y-10 text-stone-700 leading-[1.85] text-[15px]">

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Responsibilities of Authors
            </h2>
            <p>
              Authors are expected to submit only original work that has not been published elsewhere 
              and is not currently under review at another journal. The submitted manuscript must 
              be the authors' own work, and all sources used must be properly cited.
            </p>
            <p className="mt-4">
              Authorship should be limited to those who have made a genuine and significant contribution 
              to the research — including its conception, design, execution, or interpretation. 
              Anyone who meets these criteria should be listed as an author. Those who have contributed 
              in a supporting capacity (such as providing funding or administrative support) should be 
              acknowledged in a separate section but not listed as authors.
            </p>
            <p className="mt-4">
              Where the research involves data, authors may be asked to provide the underlying data 
              for editorial review. Authors must also disclose any financial interests, institutional 
              affiliations, or personal relationships that could be perceived as influencing the 
              outcomes or interpretation of their research.
            </p>
            <p className="mt-4">
              If an author discovers a significant error or inaccuracy in their published work, they 
              are obligated to notify the editorial office promptly and cooperate in issuing a 
              correction or retraction where necessary.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Responsibilities of Editors
            </h2>
            <p>
              Editors are responsible for making fair, impartial decisions about which manuscripts 
              are published. All editorial decisions are based solely on the academic merit and 
              relevance of the submitted work — never on the author's nationality, ethnicity, 
              gender, institutional affiliation, or prior publication history.
            </p>
            <p className="mt-4">
              Editors must keep all submitted manuscripts strictly confidential. They may not share 
              manuscripts with anyone outside the peer review process, and they must not use unpublished 
              material from a submitted manuscript in their own research without the explicit written 
              consent of the author.
            </p>
            <p className="mt-4">
              Where an editor has a conflict of interest with the author or subject matter of a 
              submitted manuscript, they must recuse themselves from the review process and delegate 
              the decision to another member of the editorial team.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Responsibilities of Reviewers
            </h2>
            <p>
              Peer reviewers play a critical role in maintaining the quality and integrity of published 
              research. Reviewers should only agree to review a manuscript if they have the relevant 
              expertise and are able to complete the review within the requested timeframe. If they 
              cannot, they should inform the editor immediately so an alternative reviewer can be found.
            </p>
            <p className="mt-4">
              All manuscripts received for review must be treated as strictly confidential. 
              Reviewers must not share, discuss, or disclose the content of a manuscript to anyone 
              without the explicit permission of the editor. They must not use unpublished information 
              from a manuscript under review for their own research purposes.
            </p>
            <p className="mt-4">
              Reviews should be conducted objectively and constructively. Personal criticism of the 
              authors is not appropriate. Reviewers should clearly articulate their assessments with 
              supporting arguments and references, and should identify any relevant published work 
              that has not been cited by the authors.
            </p>
            <p className="mt-4">
              Reviewers must disclose any conflict of interest — such as a professional or personal 
              relationship with the authors, or a competing financial interest in the subject matter — 
              and should decline to review manuscripts where such conflicts exist.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Plagiarism and Originality
            </h2>
            <p>
              IJSDS takes plagiarism seriously. Submissions are screened using Crossref Similarity Check 
              before peer review. Any manuscript found to contain plagiarised material — including 
              text copied without attribution, substantial paraphrasing without credit, or 
              undisclosed reuse of the author's own previously published work — will be rejected.
            </p>
            <p className="mt-4">
              Authors must also disclose any use of artificial intelligence tools in the drafting of 
              their manuscript. AI-generated content presented as original scholarly work without 
              disclosure constitutes a violation of our publishing ethics.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Handling Misconduct
            </h2>
            <p>
              Ethical concerns about a published or submitted article can be raised at any time by any 
              party — including authors, reviewers, editors, or readers. If you become aware of 
              potential misconduct, please contact the editorial office in confidence at{' '}
              <a
                href="mailto:editor.ijsds@gmail.com"
                className="text-primary font-medium underline underline-offset-4 hover:text-primary/70 transition-colors"
              >
                editor.ijsds@gmail.com
              </a>.
            </p>
            <p className="mt-4">
              All reports are handled discreetly and investigated thoroughly. Where misconduct is 
              confirmed, the journal will take appropriate action — which may include rejection before 
              publication, formal retraction of a published article, notification of the author's 
              institution, or referral to COPE. Authors are given the opportunity to respond to 
              any allegations before a final decision is made.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Human and Animal Research
            </h2>
            <p>
              Research involving human participants must have been conducted in accordance with the 
              ethical standards of the relevant national and institutional review bodies, and in line 
              with the Declaration of Helsinki. Authors must confirm in their submission that the 
              necessary ethics approvals were obtained and that informed consent was given where required.
            </p>
            <p className="mt-4">
              Research involving animals must comply with established national and institutional 
              guidelines for the care and use of laboratory animals. The relevant approvals must 
              be stated in the manuscript.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Corrections and Retractions
            </h2>
            <p>
              If an error is identified in a published article, the editorial team will work with the 
              authors to issue a formal correction notice as quickly as possible. The original article 
              will be updated to include a link to the correction.
            </p>
            <p className="mt-4">
              In cases where the integrity of a published article has been fundamentally compromised — 
              through fabricated data, plagiarism, duplicate publication, or other serious misconduct — 
              the article will be formally retracted. A retraction notice will be published in its place, 
              and the article will be clearly marked as retracted in all digital records.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Contact
            </h2>
            <p>
              For questions about these guidelines, to report an ethical concern, or to request 
              further information, please contact:
            </p>
            <div className="mt-5 bg-white border border-stone-200 p-5 space-y-1 text-sm text-stone-600">
              <p className="font-semibold text-stone-900">Prof. Mina Magaret Ogbanga</p>
              <p>Editor-in-Chief, IJSDS</p>
              <p>
                <a
                  href="mailto:editor.ijsds@gmail.com"
                  className="text-primary font-medium underline underline-offset-4 hover:text-primary/70 transition-colors"
                >
                  editor.ijsds@gmail.com
                </a>
              </p>
              <p className="pt-1 text-stone-400 text-xs">
                Dept. of Social Work, Faculty of Social Sciences, Rivers State University, Emohua.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-stone-200 flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300">
          <span>Ethical Guidelines</span>
          <span>•</span>
          <span>COPE Aligned</span>
          <span>•</span>
          <span>IJSDS</span>
        </div>

      </div>
    </div>
  );
};

export default EthicalGuidelines;
