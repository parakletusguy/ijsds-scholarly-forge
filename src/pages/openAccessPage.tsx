import { Helmet } from 'react-helmet-async';

export default function OpenAccessPage() {
  return (
    <div className="min-h-screen bg-[#fcf9f8] font-body">
      <Helmet>
        <title>Open Access Policy — IJSDS</title>
        <meta name="description" content="IJSDS is fully open access — every article is free to read, download, and share worldwide, immediately upon publication." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">

        {/* Page Header */}
        <div className="mb-14 pb-10 border-b border-stone-200">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary block mb-4">
            Journal Policy
          </span>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
            Open Access Policy
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xl">
            The International Journal of Social Work and Development Studies (IJSDS) is fully open access. 
            Every article we publish is freely available to anyone, anywhere in the world, immediately upon publication.
          </p>
        </div>

        {/* Body Content */}
        <div className="prose prose-stone max-w-none space-y-10 text-stone-700 leading-[1.85] text-[15px]">

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              What Open Access Means
            </h2>
            <p>
              Open access means that published research is made freely and permanently available online, 
              with no barriers such as subscriptions, registration fees, or paywalls. Anyone — whether a student 
              in a rural university, a policymaker, or a practitioner — can read, download, and use our 
              published articles without cost.
            </p>
            <p className="mt-4">
              IJSDS publishes all its articles under the{' '}
              <span className="font-semibold text-stone-900">Creative Commons Attribution 4.0 International (CC BY 4.0)</span>{' '}
              license. Under this license, readers are free to share and redistribute the material in any medium or 
              format, and to adapt, remix, or build upon it for any purpose — provided they give appropriate credit 
              to the original authors and indicate if changes were made.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Copyright
            </h2>
            <p>
              Authors who publish in IJSDS retain full copyright of their work. By submitting an article, 
              authors grant IJSDS the right of first publication, while retaining the right to archive, 
              share, and reuse their own work in any future context — including depositing it in institutional 
              repositories, sharing on personal or academic profile pages, and including it in future publications.
            </p>
            <p className="mt-4">
              We do not require authors to sign over copyright to the journal. The CC BY 4.0 license 
              grants readers broad permissions while ensuring authors are always credited as the originators of the work.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Article Processing Charges
            </h2>
            <p>
              To cover the costs of peer review management, copyediting, and digital production, IJSDS charges 
              a fee upon acceptance of a manuscript. There is no fee to submit or to be considered for publication — 
              charges apply only when an article has been accepted.
            </p>
            <div className="mt-5 bg-white border border-stone-200 rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="text-left px-5 py-3 font-semibold text-stone-700 tracking-wide text-xs uppercase">Fee Type</th>
                    <th className="text-right px-5 py-3 font-semibold text-stone-700 tracking-wide text-xs uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="px-5 py-3.5 text-stone-700">Submission Fee</td>
                    <td className="px-5 py-3.5 text-right font-medium text-stone-500">None</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3.5 text-stone-700">Manuscript Review Fee</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-stone-900">₦5,125</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3.5 text-stone-700">Article Publication Fee (APC)</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-stone-900">₦20,500</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Fee Waivers
            </h2>
            <p>
              We are committed to ensuring that financial constraints do not prevent high-quality research 
              from being published. Full or partial fee waivers are available to authors who are unable to 
              pay the processing charges, including researchers based in lower-income countries or those in 
              genuinely difficult financial circumstances.
            </p>
            <p className="mt-4">
              To request a waiver, authors should contact the editorial office before or at the time of 
              submission. Waiver requests are assessed on a case-by-case basis and are handled with discretion. 
              Send your request to{' '}
              <a
                href="mailto:editor.ijsds@gmail.com"
                className="text-primary font-medium underline underline-offset-4 hover:text-primary/70 transition-colors"
              >
                editor.ijsds@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Self-Archiving & Sharing
            </h2>
            <p>
              Authors are encouraged to share their published articles widely. You may post the final 
              published version (PDF) on your personal website, university profile, or academic platforms 
              such as ResearchGate, Academia.edu, or your institution's repository. The CC BY 4.0 license 
              explicitly permits this — no further permission from the journal is required.
            </p>
            <p className="mt-4">
              Every article published in IJSDS is also archived on{' '}
              <a
                href="https://zenodo.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium underline underline-offset-4 hover:text-primary/70 transition-colors"
              >
                Zenodo
              </a>
              {' '}(operated by CERN) and assigned a permanent DOI link, ensuring your work remains 
              discoverable and citable for the long term.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-xl font-bold text-stone-900 tracking-tight mb-3">
              Contact
            </h2>
            <p>
              For any questions about our open access policy, licensing terms, or fee waivers, 
              please contact the editorial office:
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

        {/* Footer line */}
        <div className="mt-16 pt-8 border-t border-stone-200 flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300">
          <span>Open Access</span>
          <span>•</span>
          <span>CC BY 4.0</span>
          <span>•</span>
          <span>Free to Read</span>
        </div>

      </div>
    </div>
  );
}
