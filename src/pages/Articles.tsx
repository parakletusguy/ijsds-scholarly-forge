import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { getArticles, getPartners, Article, Partner } from "@/lib/articleService";
import { buildArticleSlug } from "@/lib/articleSlug";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, ArrowUpRight, Quote, ChevronRight, ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { downloadBibTeX } from "@/lib/bibtexService";
import { toast } from "@/hooks/use-toast";
import { handleFileDownload } from "@/lib/downloadUtils";

const PAGE_SIZE = 10;

export const Articles = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string | number | null }>({ type: "all", value: null });
  const [activeIssue, setActiveIssue] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesData, partnersData] = await Promise.all([
          getArticles({ status: "published" }),
          getPartners(),
        ]);
        setArticles(articlesData);
        setPartners(partnersData);
      } catch (error) {
        console.error("Failed to fetch archive data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { subjectAreas, volumes, years } = useMemo(() => {
    const subjectAreas = Array.from(new Set(articles.map((a) => a.subject_area).filter(Boolean))) as string[];
    const volumes = Array.from(new Set(articles.map((a) => a.volume).filter((v) => v != null) as number[])).sort((a, b) => b - a);
    const years = Array.from(new Set(articles.map((a) => (a.publication_date ? new Date(a.publication_date).getFullYear() : null)).filter(Boolean) as number[])).sort((a, b) => b - a);
    return { subjectAreas, volumes, years };
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.abstract?.toLowerCase().includes(q) ||
        a.authors?.some((au) => au.name.toLowerCase().includes(q));
      if (!matchesSearch) return false;
      if (activeFilter.type === "volume") {
        const matchesVol = a.volume === activeFilter.value;
        if (!matchesVol) return false;
        if (activeIssue) return a.issue === activeIssue;
        return true;
      }
      if (activeFilter.type === "year") {
        const y = a.publication_date ? new Date(a.publication_date).getFullYear() : null;
        return y === activeFilter.value;
      }
      return true;
    });
  }, [articles, searchQuery, activeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (type: string, value: string | number | null) => {
    setActiveFilter({ type, value });
    setActiveIssue(null);
    setPage(1);
  };

  const handleCite = (article: Article) => {
    try {
      downloadBibTeX(article);
      toast({ title: "Citation Exported", description: "BibTeX file saved to downloads." });
    } catch {
      toast({ title: "Cite failed", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Loading archive..." />
      </div>
    );
  }

  const featured = articles[0];

  return (
    <div className="min-h-screen bg-background text-on-background font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Helmet>
        <title>Article Archive | IJSDS</title>
        <meta name="description" content="Explore peer-reviewed research from the International Journal of Social Work and Development Studies." />
      </Helmet>

      <main className="max-w-7xl mx-auto px-8 pt-12 min-h-screen">
        <div className="flex flex-col md:flex-row gap-12">

          {/* ── Sidebar (Desktop) ─────────────────────────────────────────────── */}
          <aside className="hidden md:block w-64 flex-shrink-0 space-y-10 border-r border-outline-variant/10 pr-8">
            <h3 className="font-headline text-xl text-primary mb-6 italic">Browse Archive</h3>
            <div className="space-y-8">

              {/* By Topic */}
              <section>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-secondary/60 mb-4 block">By Topic</span>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => handleFilterChange("all", null)}
                      className={`flex items-center justify-between w-full group ${activeFilter.type === "all" ? "text-primary font-bold" : "text-on-surface hover:text-primary transition-colors"}`}
                    >
                      <span className="text-sm font-medium">All Research</span>
                      <span className="text-[10px] text-secondary/40 font-mono">{articles.length}</span>
                    </button>
                  </li>
                  {subjectAreas.map((area) => {
                    const count = articles.filter((a) => a.subject_area === area).length;
                    const active = activeFilter.type === "subject" && activeFilter.value === area;
                    return (
                      <li key={area}>
                        <button
                          onClick={() => handleFilterChange("subject", area)}
                          className={`flex items-center justify-between w-full group ${active ? "text-primary font-bold" : "text-on-surface hover:text-primary transition-colors"}`}
                        >
                          <span className="text-sm font-medium">{area}</span>
                          {active
                            ? <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                            : <span className="text-[10px] text-secondary/40 font-mono">{count}</span>
                          }
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* By Volume & Issue */}
              {volumes.length > 0 && (
                <section>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-secondary/60 mb-4 block">Volumes & Issues</span>
                  <div className="space-y-4">
                    {volumes.map((vol, i) => {
                      const activeVol = activeFilter.type === "volume" && activeFilter.value === vol;
                      const volIssues = Array.from(new Set(articles.filter(a => a.volume === vol).map(a => a.issue).filter(Boolean))).sort() as number[];
                      
                      return (
                        <div key={vol} className="space-y-2">
                          <button
                            onClick={() => handleFilterChange("volume", vol)}
                            className={`text-sm font-medium transition-colors flex items-center gap-2 ${activeVol ? "text-primary font-bold" : "text-on-surface hover:text-primary"}`}
                          >
                            Volume {vol}{i === 0 ? " (Latest)" : ""}
                            {activeVol && <ChevronRight size={12} className="rotate-90" />}
                          </button>
                          
                          {activeVol && volIssues.length > 0 && (
                            <div className="pl-4 border-l border-primary/20 flex flex-wrap gap-2">
                              {volIssues.map(issue => (
                                <button
                                  key={issue}
                                  onClick={() => { setActiveIssue(activeIssue === issue ? null : issue); setPage(1); }}
                                  className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${activeIssue === issue ? "bg-primary text-white" : "bg-surface-container-low text-secondary hover:text-primary"}`}
                                >
                                  Issue {issue}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* By Year */}
              {years.length > 0 && (
                <section>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-secondary/60 mb-4 block">By Year</span>
                  <div className="grid grid-cols-2 gap-2">
                    {years.map((year) => (
                      <button
                        key={year}
                        onClick={() => handleFilterChange("year", year)}
                        className={`px-3 py-2 text-xs font-medium text-center rounded transition-colors ${
                          activeFilter.type === "year" && activeFilter.value === year
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-low hover:bg-surface-container-highest"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </aside>

            {/* Featured Paper Card */}
            {featured && (
              <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                <span className="text-[9px] font-bold tracking-widest text-primary uppercase block mb-3">Featured Paper</span>
                <h4 className="font-headline text-lg leading-snug mb-3 line-clamp-3">{featured.title}</h4>
                <p className="text-xs text-secondary mb-4 leading-relaxed line-clamp-2">{featured.abstract}</p>
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => navigate(`/article/${buildArticleSlug(featured)}`)}
                    className="text-xs font-bold text-primary flex items-center gap-2 group"
                  >
                    VIEW PAPER
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                  {featured.doi && (
                    <a
                      href={`https://doi.org/${featured.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-primary/60 hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-widest"
                    >
                      <ExternalLink size={10} />
                      DOI
                    </a>
                  )}
                </div>
              </div>
            )}

          {/* ── Main Content ─────────────────────────────────────────── */}
          <div className="flex-1">

            {/* Header & Search */}
            <div className="mb-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                  <h1 className="font-headline text-5xl md:text-6xl font-light text-on-surface leading-tight mb-2">
                    Research <span className="italic">Archive</span>
                  </h1>
                  <p className="text-secondary font-medium tracking-wide">
                    {articles.length} Peer-Reviewed Social Work Papers
                  </p>
                </div>

                {/* Mobile Filter Toggle */}
                <div className="md:hidden">
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-3 px-6 py-3 bg-surface-container text-primary font-bold uppercase tracking-widest text-[10px] shadow-sm active:scale-95 transition-all"
                  >
                    <Search size={14} />
                    {isFilterOpen ? "Close Filters" : "Filter Archive"}
                  </button>
                </div>
              </div>

              {/* Mobile Filter Panel */}
              {isFilterOpen && (
                <div className="md:hidden bg-surface-container-lowest p-6 mb-8 border border-outline-variant/10 animate-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 gap-8">
                     <section>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-secondary/40 mb-3 block">Volume & Issue</span>
                        <div className="flex flex-wrap gap-2">
                          {volumes.map(vol => (
                            <div key={vol} className="flex flex-col gap-1">
                              <button 
                                onClick={() => handleFilterChange("volume", vol)}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${activeFilter.type === "volume" && activeFilter.value === vol ? "bg-primary text-white border-primary" : "bg-white border-outline-variant text-secondary"}`}
                              >
                                Vol {vol}
                              </button>
                              {activeFilter.type === "volume" && activeFilter.value === vol && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                   {Array.from(new Set(articles.filter(a => a.volume === vol).map(a => a.issue).filter(Boolean))).sort().map(iss => (
                                      <button 
                                        key={iss}
                                        onClick={() => { setActiveIssue(activeIssue === iss ? null : iss); setPage(1); }}
                                        className={`px-2 py-1 text-[8px] font-bold border ${activeIssue === iss ? "bg-primary/10 border-primary text-primary" : "bg-white border-outline-variant/50 text-secondary/60"}`}
                                      >
                                        Iss {iss}
                                      </button>
                                   ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                     </section>
                     <section>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-secondary/40 mb-3 block">Topic</span>
                        <div className="flex flex-wrap gap-2">
                           <button 
                             onClick={() => handleFilterChange("all", null)}
                             className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${activeFilter.type === "all" ? "bg-primary text-white border-primary" : "bg-white border-outline-variant text-secondary"}`}
                           >
                            All
                           </button>
                           {subjectAreas.map(area => (
                              <button 
                                key={area}
                                onClick={() => handleFilterChange("subject", area)}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${activeFilter.type === "subject" && activeFilter.value === area ? "bg-primary text-white border-primary" : "bg-white border-outline-variant text-secondary"}`}
                              >
                                {area}
                              </button>
                           ))}
                        </div>
                     </section>
                  </div>
                </div>
              )}

              <div className="relative group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search by title, author, or keywords..."
                  className="w-full bg-surface-container-low border-none rounded-xl py-6 pl-16 pr-8 text-on-surface placeholder:text-secondary/50 focus:ring-0 focus:bg-surface-container-lowest transition-all shadow-sm group-hover:shadow-md outline-none"
                />
              </div>
            </div>

            {/* Article List */}
            <div className="space-y-20">
              {paginated.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <BookOpen className="w-12 h-12 text-secondary/30 mx-auto" />
                  <p className="text-secondary italic">No articles match your search.</p>
                  <button
                    onClick={() => { setSearchQuery(""); handleFilterChange("all", null); }}
                    className="text-primary font-bold text-xs uppercase tracking-widest hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                paginated.map((article, index) => {
                  const globalIndex = (page - 1) * PAGE_SIZE + index;
                  const pubDate = article.publication_date
                    ? new Date(article.publication_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
                    : null;

                  return (
                    <article key={article.id} className="group border-b border-outline-variant/10 pb-16 last:border-0">
                      <div className="flex items-center gap-4 mb-4">
                        {(article.volume || article.issue) && (
                          <span className="bg-primary px-2 py-1 text-[10px] font-bold tracking-widest uppercase text-white shadow-sm">
                            {article.volume ? `Vol ${article.volume}` : ""}
                            {article.volume && article.issue ? " : " : ""}
                            {article.issue ? `Iss ${article.issue}` : ""}
                          </span>
                        )}
                        {article.subject_area && (
                          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{article.subject_area}</span>
                        )}
                      </div>

                      <h2
                        onClick={() => navigate(`/article/${buildArticleSlug(article)}`)}
                        className="font-headline text-3xl md:text-5xl text-on-surface group-hover:text-primary transition-all leading-tight mb-6 cursor-pointer max-w-5xl"
                      >
                        {article.title}
                      </h2>

                      {article.authors && article.authors.length > 0 && (
                        <div className="flex flex-wrap gap-x-6 gap-y-1 mb-8">
                          {article.authors.slice(0, 5).map((author, i) => (
                            <div key={i} className="flex flex-col">
                              <span className="text-sm font-bold text-on-surface">{author.name}</span>
                              <span className="text-[10px] text-secondary/60 uppercase tracking-wider">{author.affiliation || "University Dept."}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {article.abstract && (
                        <p className="text-on-background/70 leading-relaxed text-lg mb-8 max-w-4xl italic border-l-4 border-primary/10 pl-6 line-clamp-3 group-hover:border-primary transition-all">
                          {article.abstract}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-8">
                        <button
                          onClick={() => navigate(`/article/${buildArticleSlug(article)}`)}
                          className="bg-primary text-white px-8 py-3 font-bold text-[10px] tracking-widest uppercase flex items-center gap-3 shadow-lg hover:shadow-primary/20 transition-all"
                        >
                          Read Research Article
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-6">
                          {article.manuscript_file_url && (
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleFileDownload(article.manuscript_file_url!, article.title);
                               }}
                               className="text-primary hover:text-primary/70 flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all"
                             >
                                <BookOpen className="w-4 h-4" />
                                Download PDF
                             </button>
                          )}
                          <button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleCite(article);
                             }}
                             className="text-secondary hover:text-primary flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all"
                          >
                             <Quote className="w-4 h-4" />
                             Cite
                          </button>
                        </div>

                        {pubDate && (
                           <span className="text-secondary/30 text-[10px] font-bold uppercase tracking-[0.2em] ml-auto">{pubDate}</span>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-24 pt-12 flex items-center justify-between border-t border-outline-variant/20">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 text-secondary hover:text-primary font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        p === page
                          ? "bg-primary text-on-primary"
                          : "hover:bg-surface-container-low text-on-surface"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 text-secondary hover:text-primary font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-30"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
