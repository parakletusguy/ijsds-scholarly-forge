import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

/**
 * Publication Facts — the details DOAJ, COPE, Scopus and Web of Science
 * assess, gathered on one page. DOAJ's Publication Facts Label (April 2026)
 * surfaces most of these, so they are stated explicitly rather than scattered.
 */
const FACTS: { label: string; value: React.ReactNode }[] = [
  {
    label: 'Journal title',
    value: 'International Journal of Social Work and Development Studies (IJSDS)',
  },
  {
    label: 'ISSN',
    value: (
      <>
        <span className="block">3115-6940 (Print)</span>
        <span className="block">3115-6932 (Online)</span>
      </>
    ),
  },
  {
    label: 'Peer review',
    value: (
      <>
        Double-blind. Every manuscript that passes the initial editorial screen is evaluated by{' '}
        <strong className="text-stone-800">2–3 independent subject experts</strong>.{' '}
        <Link to="/peer-review" className="text-primary hover:underline">Read the policy</Link>.
      </>
    ),
  },
  {
    label: 'Publication frequency',
    value: (
      <>
        <strong className="text-stone-800">Quarterly — four issues per year</strong>, released in March, June,
        September and December.
      </>
    ),
  },
  {
    label: 'Time to publication',
    value: (
      <>
        Approximately <strong className="text-stone-800">8–12 weeks</strong> on average from submission to
        publication, for manuscripts accepted after review.
      </>
    ),
  },
  {
    label: 'Open access',
    value: (
      <>
        Fully open access. Every article is free to read and download immediately upon publication, with no
        subscription or paywall. <Link to="/openAccess" className="text-primary hover:underline">Open access statement</Link>.
      </>
    ),
  },
  {
    label: 'Licence',
    value: (
      <>
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="license noopener noreferrer"
          className="text-primary hover:underline"
        >
          Creative Commons Attribution 4.0 International (CC BY 4.0)
        </a>
        . Authors retain copyright. The licence is embedded in each article's metadata in machine-readable form.
      </>
    ),
  },
  {
    label: 'Article processing charges',
    value: (
      <>
        No submission fee. Charges apply only on acceptance:{' '}
        <strong className="text-stone-800">₦10,000</strong> manuscript vetting and{' '}
        <strong className="text-stone-800">₦25,500</strong> publication.{' '}
        <Link to="/openAccess" className="text-primary hover:underline">Full fee schedule</Link>.
      </>
    ),
  },
  {
    label: 'Digital preservation',
    value: (
      <>
        Crossref-registered DOIs, deposit with the institutional repository, and redundant backup storage.
        Authors may self-archive the published version.{' '}
        <Link to="/preservation-policy" className="text-primary hover:underline">Preservation policy</Link>.
      </>
    ),
  },
  {
    label: 'Persistent identifiers',
    value: 'Every published article is assigned a Crossref-registered DOI. Author identity is linked via ORCID iD.',
  },
  {
    label: 'Plagiarism screening',
    value: (
      <>
        All manuscripts are screened before review.{' '}
        <Link to="/plagiarism-policy" className="text-primary hover:underline">Plagiarism policy</Link>.
      </>
    ),
  },
  {
    label: 'Publication ethics',
    value: (
      <>
        Ethics approval, conflict-of-interest declaration, and AI-use disclosure are required of all
        submissions. <Link to="/ethical-guidelines" className="text-primary hover:underline">Ethical guidelines</Link>.
      </>
    ),
  },
  {
    label: 'Editorial board',
    value: (
      <>
        Named and publicly listed.{' '}
        <Link to="/editorial-board" className="text-primary hover:underline">View the editorial board</Link>.
      </>
    ),
  },
  {
    label: 'Editorial contact',
    value: (
      <a href="mailto:editor@ijsds.org" className="text-primary hover:underline">
        editor@ijsds.org
      </a>
    ),
  },
];

export const JournalInformation = () => {
  return (
    <div className="min-h-screen bg-stone-50 font-body pb-24">
      <Helmet>
        <title>Journal Information — IJSDS</title>
        <meta
          name="description"
          content="Publication facts for IJSDS: peer review, publication frequency, open access licensing, article processing charges, preservation, and editorial contact."
        />
      </Helmet>

      <PageHeader
        title="Journal"
        subtitle="Information"
        accent="Publication Facts"
        description="Everything an author, reader, or indexing body needs to evaluate IJSDS, stated in one place."
      />

      <ContentSection dark>
        <div className="max-w-3xl mx-auto">
          <dl className="bg-white border border-stone-200 divide-y divide-stone-100">
            {FACTS.map(({ label, value }) => (
              <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-6 px-6 py-5">
                <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 sm:pt-1">
                  {label}
                </dt>
                <dd className="sm:col-span-2 text-sm text-stone-600 leading-relaxed">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-xs text-stone-400 leading-relaxed">
            IJSDS is published by Rivers State University. Our aim is that every claim on this page is
            independently verifiable. If you find anything here that is unclear or out of date, please write to{' '}
            <a href="mailto:editor@ijsds.org" className="text-primary hover:underline">editor@ijsds.org</a>.
          </p>
        </div>
      </ContentSection>
    </div>
  );
};

export default JournalInformation;
