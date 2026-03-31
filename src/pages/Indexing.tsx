import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  BookOpen,
  Globe,
  Link2,
  Mail,
  Users,
  FileDown,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

/**
 * /indexing — Author Indexing Guide
 *
 * Source: IJSDS Master Implementation Guide for Indexing & Discoverability
 * §4.2 Instructions Page + §2.1 Zenodo Community + §3.1–3.2 External Platforms
 *
 * Explains to authors how to link their Zenodo DOI to ORCID, ResearchGate,
 * and Academia.edu after publication.
 */

// ---------------------------------------------------------------------------
// Data — keeps the JSX clean and easier to maintain
// ---------------------------------------------------------------------------

interface StepItem {
  title: string;
  description: string;
  link?: { label: string; href: string };
}

const orcidSteps: StepItem[] = [
  {
    title: 'Link your Zenodo account to ORCID (once only)',
    description:
      'Log in to zenodo.org → Settings → Linked Accounts → Connect ORCID. After this one-time setup, every paper you upload to the IJSDS Zenodo community will appear on your ORCID profile automatically.',
  },
  {
    title: 'Add manually using your DOI',
    description:
      'If you have not linked accounts, log in to orcid.org → Works → Add Work → Add by DOI, and paste your Zenodo DOI (e.g. 10.5281/zenodo.XXXXX).',
    link: { label: 'Step-by-step ORCID screenshot guide →', href: '/orcidGuide' },
  },
];

const researchGateSteps: StepItem[] = [
  {
    title: 'Upload via BibTeX (recommended)',
    description:
      'Download the .bib file from your article page on ijsds.org. On ResearchGate, go to Add Research → From File and upload the .bib file. All metadata — title, authors, DOI — will be populated automatically.',
  },
  {
    title: 'Request indexing via OAI-PMH',
    description:
      'ResearchGate uses the OAI-PMH protocol to find and index journals. IJSDS has submitted a harvesting request using the Zenodo Community OAI feed URL so that new articles are discovered automatically.',
  },
];

const academiaSteps: StepItem[] = [
  {
    title: 'Create or use the IJSDS Organisation Page',
    description:
      'Visit the official IJSDS page on Academia.edu. Authors can follow the journal to be linked to publications.',
  },
  {
    title: 'Upload your abstract and link',
    description:
      'On your Academia.edu profile, click Add Work and paste your article title and the ijsds.org article URL. You can also click the "Share on Academia.edu" button on your article page — it pre-fills the form for you.',
  },
];

const zenodoSteps: StepItem[] = [
  {
    title: 'Upload your accepted manuscript to the IJSDS Zenodo community',
    description:
      'Go to zenodo.org/communities/ijsds and click New Upload. Fill in all metadata fields provided by the editorial team, including your ORCID iD.',
  },
  {
    title: 'Use the DOI on all your profiles',
    description:
      'Your Zenodo DOI is your paper\'s permanent identifier. Use the full clickable link format (https://doi.org/10.5281/zenodo.XXXXX) everywhere you share the paper.',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SectionHeader = ({
  icon: Icon,
  title,
  badge,
}: {
  icon: React.ElementType<React.SVGProps<SVGSVGElement>>;
  title: string;
  badge?: string;
}) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2 rounded-lg bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <h2 className="text-xl font-bold">{title}</h2>
      {badge && (
        <Badge variant="secondary" className="text-xs mt-0.5">
          {badge}
        </Badge>
      )}
    </div>
  </div>
);

const StepCard = ({ step, number }: { step: StepItem; number: number; key?: number }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
        {number}
      </div>
    </div>
    <div>
      <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
      {step.link && (
        <a
          href={step.link.href}
          className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
        >
          {step.link.label}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const Indexing = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* SEO — §1.2 Highwire Press-style meta for this static page */}
      <Helmet>
        <title>Author Indexing Guide — IJSDS</title>
        <meta
          name="description"
          content="Step-by-step guide for IJSDS authors on how to index their published articles on ORCID, ResearchGate, Academia.edu, and Zenodo to maximise citation impact."
        />
        <meta
          name="keywords"
          content="IJSDS indexing, ORCID, ResearchGate, Academia.edu, Zenodo, BibTeX, academic indexing, citation"
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Back button */}
        <div className="relative py-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4 absolute top-1 left-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Page header */}
          <div className="mb-8 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Author Indexing Guide</h1>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              Congratulations on your publication! Follow this guide to index your article
              on major academic networks and maximise its citation reach. These steps take
              less than 10 minutes in total.
            </p>
            <Separator className="mt-6" />
          </div>

          {/* ---------------------------------------------------------------
              §2.2 + §3.3 — Why indexing matters
          --------------------------------------------------------------- */}
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Tech Stack Overview</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    IJSDS uses <strong>Zenodo (DataCite DOI)</strong> as its primary identifier,{' '}
                    <strong>Highwire Press meta tags</strong> for web crawler discovery,{' '}
                    <strong>BibTeX</strong> for manual platform uploads, and{' '}
                    <strong>OAI-PMH</strong> for ResearchGate harvesting — all working together
                    so your paper is found everywhere academics search.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">

            {/* -----------------------------------------------------------
                §2.2 ORCID Auto-Update
            ----------------------------------------------------------- */}
            <Card id="orcid-section">
              <CardHeader>
                <SectionHeader
                  icon={Link2}
                  title="1. ORCID — Automatic or Manual"
                  badge="Recommended first step"
                />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-5">
                  ORCID is the gold-standard author identifier used by all major journals and
                  funding bodies. Linking your Zenodo account ensures every new IJSDS
                  publication appears on your ORCID record automatically.{' '}
                  <strong>
                    Source: IJSDS Implementation Guide §2.2 — Enable ORCID Auto-Update
                  </strong>
                </p>
                <div className="space-y-5">
                  {orcidSteps.map((step, i) => (
                    <StepCard key={i} step={step} number={i + 1} />
                  ))}
                </div>
                {/* BibTeX tip */}
                <div className="mt-5 p-3 bg-muted rounded-lg flex items-start gap-2">
                  <FileDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <strong>Tip — Bulk Upload:</strong> You can also use the{' '}
                    <strong>Export Citation (BibTeX)</strong> button on your article page to
                    download a .bib file, then use ORCID's "Add Work → Import BibTeX" option.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* -----------------------------------------------------------
                §3.1 + §3.3 ResearchGate
            ----------------------------------------------------------- */}
            <Card id="researchgate-section">
              <CardHeader>
                <SectionHeader
                  icon={Users}
                  title="2. ResearchGate"
                  badge="OAI-PMH harvesting active"
                />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-5">
                  ResearchGate uses the <strong>OAI-PMH</strong> protocol to discover and
                  index journals automatically. IJSDS has submitted a harvesting request
                  with the Zenodo Community OAI feed URL so new articles are indexed without
                  manual uploads. You can also add the paper to your personal profile
                  manually.{' '}
                  <strong>Source: IJSDS Implementation Guide §3.1 — ResearchGate Indexing</strong>
                </p>
                <div className="space-y-5">
                  {researchGateSteps.map((step, i) => (
                    <StepCard key={i} step={step} number={i + 1} />
                  ))}
                </div>
                <div className="mt-5">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://www.researchgate.net/publication/create"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Go to ResearchGate Upload
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* -----------------------------------------------------------
                §3.2 + §3.3 Academia.edu
            ----------------------------------------------------------- */}
            <Card id="academia-section">
              <CardHeader>
                <SectionHeader icon={Globe} title="3. Academia.edu" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-5">
                  Academia.edu does not offer an automated push API. Uploads must be done
                  manually, but the <strong>"Share on Academia.edu"</strong> button on your
                  article page pre-fills the form with your title and URL using URL
                  parameters, reducing data entry to one click.{' '}
                  <strong>Source: IJSDS Implementation Guide §3.2–3.3</strong>
                </p>
                <div className="space-y-5">
                  {academiaSteps.map((step, i) => (
                    <StepCard key={i} step={step} number={i + 1} />
                  ))}
                </div>
                <div className="mt-5 flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://www.academia.edu"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Go to Academia.edu
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* -----------------------------------------------------------
                §2.1 Zenodo Community
            ----------------------------------------------------------- */}
            <Card id="zenodo-section">
              <CardHeader>
                <SectionHeader
                  icon={BookOpen}
                  title="4. Zenodo Community Upload"
                  badge="CERN-backed DOI"
                />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-5">
                  All IJSDS articles receive a <strong>Zenodo (DataCite) DOI</strong>.
                  Authors are encouraged to include their ORCID iD in the Zenodo metadata
                  fields when submitting. This creates the bridge between all platforms.{' '}
                  <strong>Source: IJSDS Implementation Guide §2.1 — Zenodo Community</strong>
                </p>
                <div className="space-y-5">
                  {zenodoSteps.map((step, i) => (
                    <StepCard key={i} step={step} number={i + 1} />
                  ))}
                </div>
                <div className="mt-5">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://zenodo.org"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Go to Zenodo
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* -----------------------------------------------------------
                §1.3 BibTeX Explanation
            ----------------------------------------------------------- */}
            <Card id="bibtex-section" className="border-green-200 bg-green-50/30">
              <CardHeader>
                <SectionHeader icon={FileDown} title="BibTeX — Your Universal Metadata Key" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Every IJSDS article page includes an{' '}
                  <strong>"Export Citation (BibTeX)"</strong> button. The downloaded .bib
                  file contains your article's full metadata — title, authors, journal, DOI,
                  pages — in a format accepted by ORCID, ResearchGate, Academia.edu, and all
                  major reference managers (Zotero, Mendeley, EndNote).{' '}
                  <strong>Source: IJSDS Implementation Guide §1.3 — Citation Export Tool</strong>
                </p>
                <p className="text-sm font-mono bg-muted/60 p-3 rounded text-muted-foreground">
                  @article&#123;ijsds_2024_...,<br />
                  &nbsp;&nbsp;title = &#123;Your Article Title&#125;,<br />
                  &nbsp;&nbsp;author = &#123;Doe, John and Smith, Jane&#125;,<br />
                  &nbsp;&nbsp;journal = &#123;International Journal of Social Work...&#125;,<br />
                  &nbsp;&nbsp;doi = &#123;10.5281/zenodo.XXXXX&#125;<br />
                  &#125;
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  Visit your article page and click <strong>"Download BibTeX (.bib)"</strong> to
                  get this file instantly.
                </p>
              </CardContent>
            </Card>

            {/* -----------------------------------------------------------
                Risk note (from §Risk Analysis)
            ----------------------------------------------------------- */}
            <Card className="border-amber-200 bg-amber-50/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Important — Copyright Compliance</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      When uploading to ResearchGate or Academia.edu, always upload only the
                      <strong> published PDF from ijsds.org</strong> or link back to the official
                      article page. Uploading an incorrect version may cause copyright issues.
                      If in doubt, share the DOI link rather than the file.{' '}
                      <strong>Source: IJSDS Implementation Guide §Risk Analysis</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* -----------------------------------------------------------
                Contact / help
            ----------------------------------------------------------- */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Need Help?</h4>
                    <p className="text-xs text-muted-foreground">
                      Contact the IJSDS Editorial Team via the email in your post-publication
                      notification or through the journal website. We can assist with DOI
                      assignment, BibTeX files, and ORCID setup.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </>
  );
};
