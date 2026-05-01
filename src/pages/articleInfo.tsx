import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  getArticle, 
  getArticles, 
  getPartners, 
  Article, 
  Partner 
} from "@/lib/articleService";
import { extractDoiFromSlug, buildArticleSlug } from "@/lib/articleSlug";
import { downloadBibTeX } from "@/lib/bibtexService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { PaperDownload } from "@/components/papers/PaperDownload";
import { handleFileDownload } from "@/lib/downloadUtils";
import { Search, BookOpen, Quote, Bookmark, Share2, ChevronLeft, Minus, Plus, ExternalLink } from "lucide-react";

const JOURNAL_TITLE = "International Journal of Social Work and Development Studies";

export const ArticleInfo = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fontSize, setFontSize] = useState(1.125); // rem

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      let currentArticle: Article | null = null;

      // 1. Try to extract a DOI from the slug (e.g. "some-title-10.5281-zenodo.123456")
      const doi = extractDoiFromSlug(slug!);
      if (doi) {
        const results = await getArticles({ doi });
        if (results.length > 0) currentArticle = results[0];
      }

      // 2. If no DOI found or lookup returned nothing, treat slug as a UUID
      if (!currentArticle) {
        currentArticle = await getArticle(slug!);
      }

      setArticle(currentArticle);

      // Fetch partners and related research in parallel
      const [partnersData, allArticles] = await Promise.all([
        getPartners(),
        getArticles({ status: 'published' }),
      ]);

      setPartners(partnersData);

      // Filter related by same subject area if possible, excluding current
      const related = allArticles
        .filter(a => a.id !== currentArticle!.id && (!currentArticle!.subject_area || a.subject_area === currentArticle!.subject_area))
        .slice(0, 3);

      setRelatedArticles(related.length > 0 ? related : allArticles.filter(a => a.id !== currentArticle!.id).slice(0, 3));

    } catch (error: any) {
      console.error("Failed to fetch scholarly record:", error);
      toast({
        title: "Error",
        description: "The article could not be retrieved at this time.",
        variant: "destructive",
      });
      // Delay navigation to let user read the toast
      setTimeout(() => navigate("/"), 2000);
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <LoadingSpinner size="lg" text="Loading article details..." />
      </div>
    );
  }

  if (!article) return null;

  const authors = article.authors || [];

  const handleBibTeXDownload = () => {
    downloadBibTeX(article);
    toast({ title: "Citation Exported", description: "BibTeX file has been saved to your downloads." });
  };

  const pubDate = article.publication_date
    ? new Date(article.publication_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null;

  const volIssue = [
    article.volume ? `Volume ${article.volume}` : null,
    article.issue ? `Issue ${article.issue}` : null,
    pubDate,
  ].filter(Boolean).join(' • ');

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Helmet>
        <title>{article.title} | IJSDS</title>
        <meta name="citation_title" content={article.title} />
        {authors.map((a: any) => <meta key={a.name} name="citation_author" content={a.name} />)}
        <meta name="citation_journal_title" content={JOURNAL_TITLE} />
        <meta name="citation_issn" content="3115-6940" />
        <meta name="citation_issn" content="3115-6932" />
        <meta name="citation_publisher" content={JOURNAL_TITLE} />
        <meta name="citation_volume" content={String(article.volume || "")} />
        <meta name="citation_issue" content={String(article.issue || "")} />
        <meta name="citation_date" content={article.publication_date || ""} />
        {article.doi && <meta name="citation_doi" content={article.doi} />}
        {article.manuscript_file_url && (
          <meta name="citation_pdf_url" content={article.manuscript_file_url} />
        )}
        <meta name="citation_language" content="en" />
        <style>{`
          .serif-dropcap::first-letter {
            float: left;
            font-size: 4.5rem;
            line-height: 0.8;
            padding-right: 0.5rem;
            color: #8f3514;
            font-family: 'Newsreader', serif;
          }
        `}</style>
      </Helmet>



      <main className="max-w-7xl mx-auto px-8 mt-16 lg:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Article Main Column */}
          <article className="lg:col-span-8">
            {/* Article Type Badge */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full">
                {article.subject_area || "Original Research"}
              </span>
              {volIssue && (
                <span className="text-xs text-on-surface-variant font-medium">{volIssue}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-headline text-5xl md:text-6xl leading-[1.1] text-on-surface mb-10 tracking-tight">
              {article.title}
            </h1>

            {/* Authors & Affiliations */}
            <div className="flex flex-col gap-6 mb-12">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {authors.map((author: any, idx: number) => (
                  <div key={idx} className="group cursor-pointer">
                    <span className="font-semibold text-lg border-b border-transparent group-hover:border-primary transition-colors">
                      {author.name}
                    </span>
                    <sup className="text-primary font-bold">{idx + 1}{idx === 0 && article.corresponding_author_email ? '*' : ''}</sup>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm text-on-surface-variant font-medium leading-relaxed max-w-2xl">
                {authors.map((author: any, idx: number) => (
                  <p key={idx}>{idx + 1}. {author.affiliation || "Faculty of Social Sciences"}</p>
                ))}
                {article.corresponding_author_email && (
                  <p className="pt-2 italic text-primary/80">
                    * Corresponding author: {article.corresponding_author_email}
                  </p>
                )}
              </div>
            </div>

            {/* Prominent Download Button */}
            {article.manuscript_file_url && (
              <div className="mb-12">
                <button
                  onClick={() => handleFileDownload(article.manuscript_file_url!, article.title, article.id)}
                  className="bg-primary text-white rounded-none border border-transparent hover:border-primary px-8 py-5 font-headline font-black text-[12px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-white hover:text-primary transition-all shadow-xl shadow-primary/10"
                >
                  <BookOpen className="w-5 h-5" />
                  Download Full PDF
                </button>
              </div>
            )}

            {/* Abstract Container */}
            <div className="bg-surface-container-low p-10 lg:p-14 rounded-2xl mb-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <BookOpen className="w-32 h-32" />
              </div>
              <h2 className="font-headline text-2xl mb-6 text-primary italic">Abstract</h2>
              <p className="font-body text-lg leading-relaxed text-on-surface-variant font-light">
                {article.abstract}
              </p>
              {article.keywords && article.keywords.length > 0 && (
                <div className="mt-8 pt-8 border-t border-outline-variant/20 flex flex-wrap gap-3 items-center">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mr-2">Keywords:</span>
                  {article.keywords.map(kw => (
                    <span key={kw} className="px-3 py-1 bg-surface-container-highest rounded-full text-xs text-on-surface-variant">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Article Footer */}
            <div className="mt-20 pt-10 border-t border-outline-variant/30 flex justify-between items-center">
              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
                  <Bookmark className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Save</span>
                </button>
                <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Share</span>
                </button>
              </div>
              {article.doi && (
                <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                  <span className="font-bold uppercase tracking-widest text-[10px] opacity-40">DOI</span>
                  <a
                    href={`https://doi.org/${article.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 font-mono"
                  >
                    {article.doi}
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-12">

              {/* Actions Card */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_40px_rgba(143,53,20,0.05)] p-8">
                <div className="flex flex-col gap-4">
                  <PaperDownload
                    articleId={article.id}
                    manuscriptFileUrl={article.manuscript_file_url}
                    title={article.title}
                    className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg font-bold flex items-center justify-center gap-3 hover:shadow-lg transition-all"
                  />
                  <button
                    onClick={handleBibTeXDownload}
                    className="w-full py-4 border border-outline-variant/40 text-primary rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-primary/5 transition-all text-sm"
                  >
                    <Quote className="w-4 h-4" />
                    Cite This Article
                  </button>
                </div>

                <div className="mt-8 space-y-4 border-t border-stone-100 pt-8">
                  {pubDate && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-on-surface-variant">Published</span>
                      <span className="font-bold">{pubDate}</span>
                    </div>
                  )}
                  {article.subject_area && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-on-surface-variant">Section</span>
                      <span className="font-bold">{article.subject_area}</span>
                    </div>
                  )}
                  {(article.volume || article.issue) && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-on-surface-variant">Issue</span>
                      <span className="font-bold">Vol {article.volume || '—'}, Iss {article.issue || '—'}</span>
                    </div>
                  )}
                </div>
              </div>



              {/* Related Research */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-8 pb-2 border-b border-outline-variant/20">
                  Related Research
                </h3>
                <div className="space-y-10">
                  {relatedArticles.length > 0 ? relatedArticles.map((ra) => (
                    <button
                      key={ra.id}
                      onClick={() => navigate(`/article/${buildArticleSlug(ra)}`)}
                      className="group block text-left w-full"
                    >
                      <span className="text-[10px] uppercase font-bold text-primary tracking-tighter mb-2 block">
                        {ra.subject_area || "Research Article"}
                      </span>
                      <h4 className="font-headline text-lg leading-snug group-hover:text-primary transition-colors">
                        {ra.title}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-on-surface-variant">
                          By {ra.authors?.[0]?.name || "IJSDS Editorial"}{ra.authors && ra.authors.length > 1 ? ' et al.' : ''}{ra.publication_date ? ` (${new Date(ra.publication_date).getFullYear()})` : ''}
                        </p>
                        {ra.doi && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-primary/5 text-[9px] font-bold text-primary px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest"
                          >
                            <ExternalLink size={8} />
                            DOI
                          </div>
                        )}
                      </div>
                    </button>
                  )) : (
                    <p className="text-xs text-on-surface-variant italic">No related articles found.</p>
                  )}
                </div>
              </div>

            </div>
          </aside>
        </div>
      </main>

      {/* Floating Reading Mode Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 bg-surface/80 backdrop-blur-xl border border-outline-variant/20 rounded-full px-6 py-3 shadow-xl hidden md:flex items-center gap-6">
        <div className="flex items-center gap-3 pr-6 border-r border-outline-variant/20">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-on-surface whitespace-nowrap">Reading Mode</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFontSize(p => Math.max(0.9, p - 0.1))}
            className="p-2 hover:bg-primary/5 rounded-full text-on-surface-variant transition-all"
            title="Decrease Font Size"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFontSize(p => Math.min(1.5, p + 0.1))}
            className="p-2 hover:bg-primary/5 rounded-full text-on-surface-variant transition-all"
            title="Increase Font Size"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleBibTeXDownload}
            className="bg-primary/10 text-primary text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all"
          >
            Quick Cite
          </button>
        </div>
      </div>


    </div>
  );
};
