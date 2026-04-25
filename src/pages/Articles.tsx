import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { getArticles, getPartners, Article, Partner } from "@/lib/articleService";
import { buildArticleSlug } from "@/lib/articleSlug";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, ArrowUpRight, Quote, ChevronRight, BookOpen, ExternalLink, X, SlidersHorizontal } from "lucide-react";
import { downloadBibTeX } from "@/lib/bibtexService";
import { toast } from "@/hooks/use-toast";
import { handleFileDownload } from "@/lib/downloadUtils";

const PAGE_SIZE = 12;

export const Articles = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string | number | null }>({ type: "all", value: null });
  const [activeIssue, setActiveIssue] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    getArticles({ status: "published" })
      .then(setArticles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { subjectAreas, volumes } = useMemo(() => {
    // Only keep subject areas that look like real topics (not article titles)
    const rawSubjects = Array.from(new Set(articles.map(a => a.subject_area).filter(Boolean))) as string[];
    const subjectAreas = rawSubjects.filter(s => s.length <= 60).sort();
    const volumes = Array.from(new Set(articles.map(a => a.volume).filter(v => v != null) as number[])).sort((a, b) => b - a);
    return { subjectAreas, volumes };
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter(a => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        a.title.toLowerCase().includes(q) ||
        a.abstract?.toLowerCase().includes(q) ||
        a.authors?.some(au => au.name.toLowerCase().includes(q));
      if (!matchesSearch) return false;

      if (activeFilter.type === "subject") return a.subject_area === activeFilter.value;
      if (activeFilter.type === "volume") {
        if (a.volume !== activeFilter.value) return false;
        return !activeIssue || a.issue === activeIssue;
      }
      return true;
    });
  }, [articles, searchQuery, activeFilter, activeIssue]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (type: string, value: string | number | null) => {
    setActiveFilter({ type, value });
    setActiveIssue(null);
    setPage(1);
    setMobileFiltersOpen(false);
  };

  const handleCite = (article: Article) => {
    try {
      downloadBibTeX(article);
      toast({ title: "Citation Exported", description: "BibTeX file saved to downloads." });
    } catch {
      toast({ title: "Cite failed", variant: "destructive" });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter({ type: "all", value: null });
    setActiveIssue(null);
    setPage(1);
  };

  const hasActiveFilter = searchQuery || activeFilter.type !== "all";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner size="lg" text="Loading archive..." />
    </div>
  );

  const Sidebar = () => (
    <div className="space-y-8">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-3">By Topic</p>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => handleFilterChange("all", null)}
              className={`flex items-center justify-between w-full py-1.5 px-2 text-sm transition-colors rounded-sm ${activeFilter.type === "all" ? "text-primary font-semibold bg-primary/5" : "text-stone-600 hover:text-primary hover:bg-stone-50"}`}
            >
              <span>All Research</span>
              <span className="text-[10px] text-stone-400 font-mono tabular-nums">{articles.length}</span>
            </button>
          </li>
          {subjectAreas.map(area => {
            const count = articles.filter(a => a.subject_area === area).length;
            const active = activeFilter.type === "subject" && activeFilter.value === area;
            return (
              <li key={area}>
                <button
                  onClick={() => handleFilterChange("subject", area)}
                  className={`flex items-center justify-between w-full py-1.5 px-2 text-sm transition-colors rounded-sm ${active ? "text-primary font-semibold bg-primary/5" : "text-stone-600 hover:text-primary hover:bg-stone-50"}`}
                >
                  <span className="text-left truncate max-w-[150px]">{area}</span>
                  <span className="text-[10px] text-stone-400 font-mono tabular-nums shrink-0 ml-2">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {volumes.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-3">Volumes</p>
          <div className="space-y-2">
            {volumes.map((vol, i) => {
              const activeVol = activeFilter.type === "volume" && activeFilter.value === vol;
              const volIssues = Array.from(new Set(articles.filter(a => a.volume === vol).map(a => a.issue).filter(Boolean))).sort() as number[];
              return (
                <div key={vol}>
                  <button
                    onClick={() => handleFilterChange("volume", vol)}
                    className={`flex items-center justify-between w-full py-1.5 px-2 text-sm transition-colors rounded-sm ${activeVol ? "text-primary font-semibold bg-primary/5" : "text-stone-600 hover:text-primary hover:bg-stone-50"}`}
                  >
                    <span>Vol {vol}{i === 0 ? " (Latest)" : ""}</span>
                    {activeVol && <ChevronRight size={12} className="rotate-90 text-primary" />}
                  </button>
                  {activeVol && volIssues.length > 0 && (
                    <div className="pl-3 mt-1 flex flex-wrap gap-1.5">
                      {volIssues.map(iss => (
                        <button key={iss}
                          onClick={() => { setActiveIssue(activeIssue === iss ? null : iss); setPage(1); }}
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border transition-all ${activeIssue === iss ? "bg-primary text-white border-primary" : "border-stone-200 text-stone-500 hover:border-primary hover:text-primary"}`}
                        >
                          Iss {iss}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <Helmet>
        <title>Article Archive | IJSDS</title>
        <meta name="description" content="Explore peer-reviewed research from the International Journal of Social Work and Development Studies." />
      </Helmet>

      <main className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-24">
        {/* Page header */}
        <div className="mb-8 pb-6 border-b border-stone-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-1">Research Repository</p>
              <h1 className="font-headline text-3xl md:text-4xl font-light text-stone-900 leading-tight">
                Research <em>Archive</em>
              </h1>
            </div>
            <p className="text-sm text-stone-400 font-medium">
              {filtered.length} of {articles.length} peer-reviewed papers
            </p>
          </div>
        </div>

        <div className="flex gap-10">
          {/* Sidebar — desktop */}
          <aside className="hidden md:block w-52 flex-shrink-0">
            <Sidebar />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search bar + mobile filter toggle */}
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search title, author, or abstract..."
                  className="w-full bg-stone-50 border border-stone-200 py-2.5 pl-10 pr-9 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="md:hidden flex items-center gap-2 border border-stone-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-stone-600 hover:border-primary hover:text-primary transition-all"
              >
                <SlidersHorizontal size={14} /> Filter
              </button>
            </div>

            {/* Mobile filter panel */}
            {mobileFiltersOpen && (
              <div className="md:hidden bg-stone-50 border border-stone-100 p-5 mb-6 animate-in slide-in-from-top-2 duration-300">
                <Sidebar />
              </div>
            )}

            {/* Active filter chips */}
            {hasActiveFilter && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {activeFilter.type === "subject" && (
                  <span className="flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                    {activeFilter.value as string}
                    <button onClick={() => handleFilterChange("all", null)}><X size={10} /></button>
                  </span>
                )}
                {activeFilter.type === "volume" && (
                  <span className="flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                    Vol {activeFilter.value}{activeIssue ? ` · Iss ${activeIssue}` : ""}
                    <button onClick={() => handleFilterChange("all", null)}><X size={10} /></button>
                  </span>
                )}
                {searchQuery && (
                  <span className="flex items-center gap-1.5 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                    "{searchQuery}"
                    <button onClick={() => { setSearchQuery(""); setPage(1); }}><X size={10} /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors">
                  Clear all
                </button>
              </div>
            )}

            {/* Article list */}
            {paginated.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-stone-400 text-sm">No articles match your search.</p>
                <button onClick={clearFilters} className="text-primary font-bold text-[10px] uppercase tracking-widest hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {paginated.map(article => {
                  const pubDate = article.publication_date
                    ? new Date(article.publication_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
                    : null;
                  const authors = article.authors?.slice(0, 3) || [];
                  const moreAuthors = (article.authors?.length || 0) - 3;

                  return (
                    <article key={article.id} className="group py-5 first:pt-0">
                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {(article.volume || article.issue) && (
                          <span className="bg-primary text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5">
                            {article.volume ? `Vol ${article.volume}` : ""}
                            {article.volume && article.issue ? " · " : ""}
                            {article.issue ? `Iss ${article.issue}` : ""}
                          </span>
                        )}
                        {article.subject_area && article.subject_area.length <= 60 && (
                          <span className="text-[9px] font-bold text-primary/70 uppercase tracking-[0.15em]">
                            {article.subject_area}
                          </span>
                        )}
                        {pubDate && (
                          <span className="text-[10px] text-stone-400 ml-auto">{pubDate}</span>
                        )}
                      </div>

                      {/* Title */}
                      <h2
                        onClick={() => navigate(`/article/${buildArticleSlug(article)}`)}
                        className="font-headline text-lg md:text-xl font-semibold text-stone-900 group-hover:text-primary transition-colors leading-snug mb-2 cursor-pointer line-clamp-2"
                      >
                        {article.title}
                      </h2>

                      {/* Authors */}
                      {authors.length > 0 && (
                        <p className="text-xs text-stone-500 mb-2">
                          {authors.map(a => a.name).join(", ")}
                          {moreAuthors > 0 && <span className="text-stone-400"> +{moreAuthors} more</span>}
                        </p>
                      )}

                      {/* Abstract */}
                      {article.abstract && (
                        <p className="text-sm text-stone-500 leading-relaxed line-clamp-2 mb-3">
                          {article.abstract}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => navigate(`/article/${buildArticleSlug(article)}`)}
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors"
                        >
                          Read Article <ArrowUpRight size={12} />
                        </button>
                        {article.manuscript_file_url && (
                          <button
                            onClick={e => { e.stopPropagation(); handleFileDownload(article.manuscript_file_url!, article.title); }}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors"
                          >
                            <BookOpen size={11} /> PDF
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); handleCite(article); }}
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors"
                        >
                          <Quote size={11} /> Cite
                        </button>
                        {article.doi && (
                          <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors ml-auto"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink size={10} /> DOI
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 pt-6 flex items-center justify-between border-t border-stone-100">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-primary disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={14} className="rotate-180" /> Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-7 h-7 flex items-center justify-center text-xs font-bold transition-colors ${p === page ? "bg-primary text-white" : "text-stone-400 hover:text-primary"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-primary disabled:opacity-30 transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
