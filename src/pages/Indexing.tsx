import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Globe, BookOpen, Rss, Database, Layers } from 'lucide-react';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

type Entry = {
  name: string;
  status: string;
  desc: string;
  href: string;
  linkLabel: string;
  logo?: string;
  icon?: React.ReactNode;
};

const ENTRIES: Entry[] = [
  {
    name: 'Crossref',
    status: 'Member',
    logo: 'https://res.cloudinary.com/drh4ma3hj/image/upload/v1778758989/Crossref-Logo_krmzqx.jpg',
    desc: 'IJSDS is a Crossref member. Every article is assigned a Crossref-registered DOI, enabling citation tracking, reference linking, and discovery across tens of thousands of member publishers worldwide.',
    href: 'https://www.crossref.org/',
    linkLabel: 'crossref.org',
  },
  {
    name: 'Google Scholar',
    status: 'Indexed',
    logo: 'https://res.cloudinary.com/drh4ma3hj/image/upload/v1778759110/google-scholar4372_knlsib.jpg',
    desc: 'Every article page exposes full citation metadata for Google Scholar. Articles are indexed as Scholar crawls them, making each paper discoverable and its citations tracked over time.',
    href: 'https://scholar.google.com/',
    linkLabel: 'scholar.google.com',
  },
  {
    name: 'Nigerian Journals Online',
    status: 'Host',
    logo: '/assets/indexing/njol_logo.png',
    desc: 'The NJOL platform provides professional hosting infrastructure for Nigerian scholarly journals, supporting regional discovery and long-term access.',
    href: 'https://www.nigerianjournalsonline.com',
    linkLabel: 'Visit platform',
  },
  {
    name: 'OAI-PMH',
    status: 'Enabled',
    icon: <Rss size={22} />,
    desc: 'IJSDS exposes a standards-compliant OAI-PMH metadata feed, the protocol scholarly aggregators use to harvest records. This is what makes the journal machine-discoverable by the services below.',
    href: 'https://www.ijsds.org/oai?verb=Identify',
    linkLabel: 'View OAI feed',
  },
  {
    name: 'BASE',
    status: 'Harvestable',
    icon: <Database size={22} />,
    desc: 'The Bielefeld Academic Search Engine is one of the largest indexes of open-access content. It can harvest IJSDS records through our OAI-PMH feed.',
    href: 'https://www.base-search.net/',
    linkLabel: 'base-search.net',
  },
  {
    name: 'CORE',
    status: 'Harvestable',
    icon: <Layers size={22} />,
    desc: 'CORE aggregates open-access research from repositories and journals globally. IJSDS metadata is available to CORE through the same OAI-PMH feed.',
    href: 'https://core.ac.uk/',
    linkLabel: 'core.ac.uk',
  },
];

export const Indexing = () => {
  return (
    <div className="min-h-screen bg-stone-50 font-body text-stone-900 pb-24">
      <Helmet>
        <title>Indexing & Visibility — IJSDS</title>
        <meta name="description" content="How IJSDS makes research discoverable — Crossref DOIs, Google Scholar, an OAI-PMH feed, and harvesting by BASE and CORE." />
      </Helmet>

      <PageHeader
        title="Indexing"
        subtitle="& Visibility"
        accent="Discoverability"
        description="How we make your research discoverable — through persistent identifiers, open metadata, and established indexing services."
      />

      <ContentSection dark>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ENTRIES.map((e) => (
              <div key={e.name} className="bg-white border border-stone-200 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  {e.logo ? (
                    <img src={e.logo} alt={`${e.name} logo`} className="h-9 max-w-[150px] object-contain" />
                  ) : (
                    <div className="w-11 h-11 bg-primary/10 text-primary flex items-center justify-center">
                      {e.icon}
                    </div>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-100 px-2 py-1">
                    {e.status}
                  </span>
                </div>
                <h2 className="font-headline text-lg text-stone-900 mb-2">{e.name}</h2>
                <p className="text-sm text-stone-500 leading-relaxed flex-1">{e.desc}</p>
                <a
                  href={e.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                >
                  {e.linkLabel} <ExternalLink size={11} />
                </a>
              </div>
            ))}
          </div>

          {/* Metadata practices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white border border-stone-200 p-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3 flex items-center gap-2">
                <BookOpen size={13} /> Citation data
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Each article exposes machine-readable citation metadata (Highwire and Dublin Core) and can be
                exported in BibTeX and RIS for Zotero, Mendeley, and EndNote.
              </p>
            </div>
            <div className="bg-white border border-stone-200 p-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3 flex items-center gap-2">
                <Globe size={13} /> Author identity
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Authors are linked to their ORCID iD, giving each contributor a persistent identifier that keeps
                citation and authorship records accurate over time.
              </p>
            </div>
          </div>

          {/* Honest trajectory note */}
          <p className="mt-6 text-sm text-stone-500 leading-relaxed max-w-2xl">
            IJSDS is actively pursuing inclusion in the Directory of Open Access Journals (DOAJ) and Scopus. This
            page is updated as each listing is confirmed.
          </p>

          <div className="mt-8 bg-white border border-stone-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-headline text-lg text-stone-900">Questions about indexing?</p>
              <p className="text-sm text-stone-500 mt-0.5">We're happy to help authors and libraries with metadata or harvesting.</p>
            </div>
            <a
              href="mailto:editor@ijsds.org"
              className="shrink-0 inline-flex items-center justify-center bg-primary hover:bg-[#7a2d11] text-white px-6 h-11 text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              Contact the editorial office
            </a>
          </div>
        </div>
      </ContentSection>
    </div>
  );
};

export default Indexing;
