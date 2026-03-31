import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getArticle } from '@/lib/articleService';
import { downloadBibTeX } from '@/lib/bibtexService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  FileText,
  User,
  Download,
  FileDown,
  Share2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { PaperDownload } from '@/components/papers/PaperDownload';

// ---------------------------------------------------------------------------
// Static journal constant — never changes per implementation plan §1.2
// ---------------------------------------------------------------------------
const JOURNAL_TITLE = 'International Journal of Social Work and Development Studies';
const JOURNAL_SHORT = 'IJSDS';

// ---------------------------------------------------------------------------
// Helper — build the Academia.edu pre-filled upload URL (§3.3)
// Using URL parameters to pre-fill title and source URL as specified in plan
// ---------------------------------------------------------------------------
function buildAcademiaShareUrl(title: string, articleUrl: string): string {
  const params = new URLSearchParams({
    title,
    source_url: articleUrl,
  });
  return `https://www.academia.edu/upload?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Helper — build the ResearchGate pre-filled URL (§3.3)
// ---------------------------------------------------------------------------
function buildResearchGateShareUrl(title: string, doi: string | null | undefined): string {
  const params = new URLSearchParams({ title });
  if (doi) params.set('doi', doi);
  return `https://www.researchgate.net/publication/create?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const ArticleInfo = () => {
  const { ArticleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (ArticleId) {
      fetchArticleDetails();
    }
  }, [ArticleId]);

  const fetchArticleDetails = async () => {
    try {
      const data = await getArticle(ArticleId!);
      setArticle(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch article details',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoadingData(false);
    }
  };

  // -------------------------------------------------------------------------
  // Derived values used in meta tags and share links
  // -------------------------------------------------------------------------
  const articleUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/article/${ArticleId}`
      : `https://ijsds.org/article/${ArticleId}`;

  // Format publication date as YYYY/MM/DD for Highwire Press (§1.2)
  const formattedDate = article?.publication_date
    ? new Date(article.publication_date).toLocaleDateString('en-CA').replace(/-/g, '/')
    : null;

  // Authors array, safe-guarded
  const authors: { name: string; affiliation?: string; orcid?: string }[] =
    article?.authors && Array.isArray(article.authors) ? article.authors : [];

  // -------------------------------------------------------------------------
  // BibTeX download handler — delegates to bibtexService (§1.3)
  // -------------------------------------------------------------------------
  const handleBibTeXDownload = () => {
    if (!article) return;
    downloadBibTeX(article);
    toast({
      title: 'BibTeX Downloaded',
      description: `${article.title.slice(0, 60)}… — .bib file saved.`,
    });
  };

  // -------------------------------------------------------------------------
  // Loading / not-found states
  // -------------------------------------------------------------------------
  if (loadingData) {
    return (
      <div className="min-h-[100vh] flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" text="Loading article details..." />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
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
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      {/* ===================================================================
          §1.2 — Highwire Press Meta Tags
          Source: IJSDS Master Implementation Guide §1.2
          These are the exact metadata names Google Scholar and ResearchGate
          rely on to properly index research.
          
          Static field : citation_journal_title (never changes)
          Dynamic fields: all others sourced from Supabase `articles` table
      ==================================================================== */}
      <Helmet>
        <title>{article.title} — {JOURNAL_SHORT}</title>
        <meta name="description" content={article.abstract?.slice(0, 160) ?? ''} />

        {/* Highwire Press citation meta tags (§1.2) */}
        <meta name="citation_title" content={article.title} />

        {/* Repeat citation_author once per author as required by the protocol */}
        {authors.map((author) => (
          <meta key={author.name} name="citation_author" content={author.name} />
        ))}

        {formattedDate && (
          <meta name="citation_publication_date" content={formattedDate} />
        )}

        {/* STATIC — journal title is invariant */}
        <meta name="citation_journal_title" content={JOURNAL_TITLE} />

        {/* Omitted if doi is null (Q3 decision) */}
        {article.doi && (
          <meta name="citation_doi" content={article.doi} />
        )}

        {/* Q1 decision: points to raw PDF URL (manuscript_file_url) */}
        {article.manuscript_file_url && (
          <meta name="citation_pdf_url" content={article.manuscript_file_url} />
        )}

        {/* Volume & Issue — bonus Highwire fields recognised by Google Scholar */}
        {article.volume && (
          <meta name="citation_volume" content={String(article.volume)} />
        )}
        {article.issue && (
          <meta name="citation_issue" content={String(article.issue)} />
        )}
        {article.page_start && (
          <meta name="citation_firstpage" content={String(article.page_start)} />
        )}
        {article.page_end && (
          <meta name="citation_lastpage" content={String(article.page_end)} />
        )}
      </Helmet>

      {/* ===================================================================
          Page body
      ==================================================================== */}
      <div className="min-h-screen flex flex-col">
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

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Article Details</h1>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* ---------------------------------------------------------------
                Article core information
            --------------------------------------------------------------- */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Article Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title + subject area */}
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{article.title}</h2>
                  {article.subject_area && (
                    <Badge variant="secondary" className="mb-4">
                      {article.subject_area}
                    </Badge>
                  )}
                </div>

                {/* Abstract */}
                <div>
                  <h3 className="font-medium text-lg mb-2">Abstract</h3>
                  <p className="text-muted-foreground leading-relaxed">{article.abstract}</p>
                </div>

                {/* Authors */}
                <div>
                  <h3 className="font-medium text-lg mb-2">Authors</h3>
                  {authors.length > 0 ? (
                    <div className="space-y-2">
                      {authors.map((author, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{author.name}</span>
                          {author.affiliation && (
                            <span className="text-muted-foreground">
                              ({author.affiliation})
                            </span>
                          )}
                          {author.orcid && (
                            <a
                              href={`https://orcid.org/${author.orcid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 hover:underline ml-1"
                              aria-label={`ORCID profile for ${author.name}`}
                            >
                              ORCID ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No author information available</p>
                  )}
                </div>

                {/* Publication metadata */}
                {(article.doi || article.volume || article.publication_date) && (
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground border-t pt-4">
                    {article.doi && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        DOI:{' '}
                        <a
                          href={`https://doi.org/${article.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-foreground"
                        >
                          {article.doi}
                        </a>
                      </span>
                    )}
                    {article.volume && <span>Vol. {article.volume}</span>}
                    {article.issue && <span>Issue {article.issue}</span>}
                    {article.page_start && article.page_end && (
                      <span>pp. {article.page_start}–{article.page_end}</span>
                    )}
                    {formattedDate && <span>Published: {formattedDate}</span>}
                  </div>
                )}

                {/* Manuscript Download */}
                {article.manuscript_file_url && (
                  <div>
                    <h3 className="font-medium text-lg mb-2">Manuscript</h3>
                    <PaperDownload
                      manuscriptFileUrl={article.manuscript_file_url}
                      title={article.title}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ---------------------------------------------------------------
                §1.3 + §3.3 — Citation Export & Share-to-Profile Buttons
                Source: IJSDS Master Implementation Guide §1.3 & §3.3
                
                BibTeX download: uses Blob trigger from bibtexService.ts
                Share buttons: use URL parameters to pre-fill external platforms
            --------------------------------------------------------------- */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Citation Export &amp; Indexing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Use the tools below to index this article on major academic platforms and
                  maximise its citation impact.
                </p>

                {/* Row 1 — BibTeX Export (§1.3) */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    Export Citation (BibTeX)
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Download a .bib file to bulk-upload your metadata to ORCID, ResearchGate,
                    or any reference manager in seconds — no manual data entry needed.
                  </p>
                  <Button
                    id="btn-export-bibtex"
                    onClick={handleBibTeXDownload}
                    variant="default"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download BibTeX (.bib)
                  </Button>
                </div>

                {/* Row 2 — Share to ResearchGate (§3.3) */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Share to ResearchGate
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Opens ResearchGate's publication form with the title and DOI pre-filled
                    via URL parameters.
                  </p>
                  <Button
                    id="btn-share-researchgate"
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={buildResearchGateShareUrl(article.title, article.doi)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Add to ResearchGate Profile
                    </a>
                  </Button>
                </div>

                {/* Row 3 — Share to Academia.edu (§3.3) */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Share to Academia.edu
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Opens Academia.edu's upload page with the title and article URL pre-filled
                    via URL parameters.
                  </p>
                  <Button
                    id="btn-share-academia"
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={buildAcademiaShareUrl(article.title, articleUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Share on Academia.edu
                    </a>
                  </Button>
                </div>

                {/* ORCID Guide link */}
                <p className="text-xs text-muted-foreground pt-2">
                  Want to add this article to your ORCID profile?{' '}
                  <a href="/orcidGuide" className="underline hover:text-foreground">
                    Follow the step-by-step ORCID guide →
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};