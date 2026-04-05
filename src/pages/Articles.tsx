import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { getArticles, getPartners, Article, Partner } from "@/lib/articleService";
import { buildArticleSlug } from "@/lib/articleSlug";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, ArrowUpRight, Quote, ChevronRight, ArrowRight, BookOpen } from "lucide-react";
import { downloadBibTeX } from "@/lib/bibtexService";
import { toast } from "@/hooks/use-toast";
import { handleFileDownload } from "@/lib/downloadUtils";

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1473186505569-9c61870c11f9?auto=format&fit=crop&q=80&w=800",
];

const PAGE_SIZE = 8;

export const Articles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string | number | null }>({ type: "all", value: null });
  const [page, setPage] = useState(1);

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
      if (activeFilter.type === "subject") return a.subject_area === activeFilter.value;
      if (activeFilter.type === "volume") return a.volume === activeFilter.value;
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

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside className="w-full md:w-64 flex-shrink-0 space-y-10">
            <div>
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

                {/* By Volume */}
                {volumes.length > 0 && (
                  <section>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-secondary/60 mb-4 block">By Volume</span>
                    <ul className="space-y-3">
                      {volumes.map((vol, i) => {
                        const active = activeFilter.type === "volume" && activeFilter.value === vol;
                        return (
                          <li key={vol}>
                            <button
                              onClick={() => handleFilterChange("volume", vol)}
                              className={`text-sm font-medium transition-colors ${active ? "text-primary font-bold" : "text-on-surface hover:text-primary"}`}
                            >
                              Volume {vol}{i === 0 ? " (Current)" : ""}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}
              </div>
            </div>

            {/* Featured Paper Card */}
            {featured && (
              <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                <span className="text-[9px] font-bold tracking-widest text-primary uppercase block mb-3">Featured Paper</span>
                <h4 className="font-headline text-lg leading-snug mb-3 line-clamp-3">{featured.title}</h4>
                <p className="text-xs text-secondary mb-4 leading-relaxed line-clamp-2">{featured.abstract}</p>
                <button
                  onClick={() => navigate(`/article/${buildArticleSlug(featured)}`)}
                  className="text-xs font-bold text-primary flex items-center gap-2 group"
                >
                  VIEW PAPER
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </aside>

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
              </div>

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
                  const img = STOCK_IMAGES[globalIndex % STOCK_IMAGES.length];
                  const pubDate = article.publication_date
                    ? new Date(article.publication_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
                    : null;

                  return (
                    <article key={article.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start group">
                      {/* Text */}
                      <div className="lg:col-span-8">
                        <div className="flex items-center gap-4 mb-4">
                          {(article.volume || article.issue) && (
                            <span className="bg-surface-container-highest px-2 py-1 text-[10px] font-bold tracking-widest uppercase text-secondary">
                              {article.volume ? `Volume ${article.volume}` : ""}
                              {article.volume && article.issue ? ", " : ""}
                              {article.issue ? `Issue ${article.issue}` : ""}
                            </span>
                          )}
                          {pubDate && (
                            <span className="text-secondary/40 text-xs font-mono">{pubDate}</span>
                          )}
                        </div>

                        <h2
                          onClick={() => navigate(`/article/${buildArticleSlug(article)}`)}
                          className="font-headline text-3xl md:text-4xl text-on-surface group-hover:text-primary transition-colors leading-tight mb-4 cursor-pointer"
                        >
                          {article.title}
                        </h2>

                        {article.authors && article.authors.length > 0 && (
                          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-6">
                            {article.authors.slice(0, 3).map((author, i) => (
                              <span key={i} className="text-sm font-semibold text-secondary">{author.name}</span>
                            ))}
                            {article.authors[0]?.affiliation && (
                              <span className="text-sm text-secondary/60 italic">{article.authors[0].affiliation}</span>
                            )}
                          </div>
                        )}

                        {article.abstract && (
                          <p
                            className="text-on-background/80 leading-relaxed text-lg mb-6 overflow-hidden"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {article.abstract}
                          </p>
                        )}

                        <div className="flex items-center gap-8">
                          <button
                            onClick={() => navigate(`/article/${buildArticleSlug(article)}`)}
                            className="text-primary font-bold text-sm tracking-widest uppercase flex items-center gap-2 group/link"
                          >
                            Read Research
                            <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                          </button>
                          {article.manuscript_file_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileDownload(article.manuscript_file_url!, article.title);
                              }}
                              className="text-secondary/60 hover:text-primary flex items-center gap-2 transition-colors"
                            >
                              <BookOpen className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-widest">Download</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCite(article);
                            }}
                            className="text-secondary/60 hover:text-primary flex items-center gap-2 transition-colors"
                          >
                            <Quote className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Cite</span>
                          </button>
                        </div>
                      </div>

                      {/* Image */}
                      <div className="lg:col-span-4 hidden lg:block">
                        <div
                          onClick={() => navigate(`/article/${buildArticleSlug(article)}`)}
                          className="aspect-[4/3] bg-surface-container-low rounded-lg overflow-hidden cursor-pointer"
                        >
                          <img
                            src={img}
                            alt={article.title}
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                          />
                        </div>
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
