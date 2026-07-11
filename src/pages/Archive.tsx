import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Download,
  ExternalLink,
  BookOpen,
  Plus,
  Layers,
  Database,
  History,
  Search,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { PageHeader, ContentSection } from "@/components/layout/PageElements";
import { getArticles, Article } from "@/lib/articleService";
import { PaperDownload } from "@/components/papers/PaperDownload";
import { buildArticleSlug } from "@/lib/articleSlug";

interface VolumeIssue {
  volume: number;
  issue: number;
  articles: Article[];
  year: string;
}

export default function Archive() {
  const [archiveData, setArchiveData] = useState<VolumeIssue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    try {
      // Use the custom backend service instead of direct Supabase queries
      const data = await getArticles({ status: "published" });

      // Group articles by Volume and Issue
      const grouped = data.reduce(
        (acc: Record<string, VolumeIssue>, article: Article) => {
          if (!article.volume || !article.issue) return acc;

          const key = `${article.volume}-${article.issue}`;
          if (!acc[key]) {
            acc[key] = {
              volume: article.volume,
              issue: article.issue,
              articles: [],
              year: article.publication_date
                ? new Date(article.publication_date).getFullYear().toString()
                : "N/A",
            };
          }
          acc[key].articles.push(article);
          return acc;
        },
        {},
      );

      // Sort by Volume and Issue descending
      const sortedArchive = (Object.values(grouped) as VolumeIssue[]).sort(
        (a, b) => {
          if (a.volume !== b.volume) return b.volume - a.volume;
          return b.issue - a.issue;
        },
      );

      setArchiveData(sortedArchive);
    } catch (error) {
      console.error("Error fetching archive:", error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatAuthors = (authors: any) => {
    if (!authors || !Array.isArray(authors) || authors.length === 0)
      return "Author TBD";
    if (authors.length === 1) return authors[0].name;
    if (authors.length === 2)
      return `${authors[0].name} and ${authors[1].name}`;
    return `${authors[0].name} et al.`;
  };
  const filteredArchive = archiveData.filter((vi) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchesVol = vi.volume.toString().includes(q);
    const matchesIssue = vi.issue.toString().includes(q);
    const matchesYear = vi.year.includes(q);
    const matchesArticle = vi.articles.some(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.authors?.some((au: any) => au.name.toLowerCase().includes(q)),
    );
    return matchesVol || matchesIssue || matchesYear || matchesArticle;
  });
  return (
    <div className="pb-24 bg-stone-50 min-h-screen font-body">
      <Helmet>
        <title>Archive — IJSDS</title>
        <meta
          name="description"
          content="Browse all published IJSDS research articles by volume and issue."
        />
      </Helmet>

      <PageHeader
        title="Journal"
        subtitle="Archive"
        accent="All Issues"
        description="Browse every published article, grouped by volume and issue."
      />

      <ContentSection dark>
        <div className="max-w-5xl mx-auto">
          {/* Search */}
          <div className="mb-10 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search volumes, issues, or article titles..."
              className="w-full bg-white border border-stone-200 h-12 pl-10 pr-4 text-sm focus:border-primary outline-none transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white border border-stone-200" />
              ))}
            </div>
          ) : fetchError ? (
            <div className="text-center py-24 bg-white border border-stone-200">
              <h3 className="font-headline text-2xl text-stone-900 mb-2">Something went wrong</h3>
              <p className="text-sm text-stone-500 mb-6">
                We couldn't load the articles. Please check your connection and try again.
              </p>
              <button
                onClick={() => {
                  setFetchError(false);
                  setLoading(true);
                  fetchArchive();
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : filteredArchive.length === 0 ? (
            <div className="text-center py-24 bg-white border border-dashed border-stone-200">
              <BookOpen size={40} className="mx-auto text-stone-300 mb-4" />
              <h3 className="font-headline text-xl text-stone-500">
                {searchQuery ? "No results match your search." : "No published issues yet."}
              </h3>
            </div>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={
                filteredArchive.length > 0
                  ? [`${filteredArchive[0].volume}-${filteredArchive[0].issue}`]
                  : []
              }
              className="space-y-4"
            >
              {filteredArchive.map((volumeIssue) => (
                <AccordionItem
                  key={`${volumeIssue.volume}-${volumeIssue.issue}`}
                  value={`${volumeIssue.volume}-${volumeIssue.issue}`}
                  className="border border-stone-200 bg-white"
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline data-[state=open]:border-b data-[state=open]:border-stone-100">
                    <div className="flex items-center justify-between w-full pr-4 text-left gap-4">
                      <h2 className="font-headline text-xl sm:text-2xl text-stone-900">
                        Volume {volumeIssue.volume}
                        <span className="text-stone-400"> · Issue {volumeIssue.issue}</span>
                      </h2>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400">
                          <Calendar size={13} /> {volumeIssue.year}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-100 px-2.5 py-1">
                          {volumeIssue.articles.length} {volumeIssue.articles.length === 1 ? "article" : "articles"}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-6 pb-6 pt-2 bg-stone-50/50">
                    <div className="flex flex-wrap gap-5 pb-5 mb-5 border-b border-stone-100">
                      <Link to={`/archive/vol-${volumeIssue.volume}`} className="text-[11px] font-bold uppercase tracking-widest text-primary hover:underline">
                        View volume {volumeIssue.volume}
                      </Link>
                      <Link to={`/archive/vol-${volumeIssue.volume}/issue-${volumeIssue.issue}`} className="text-[11px] font-bold uppercase tracking-widest text-primary hover:underline">
                        View issue {volumeIssue.issue}
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {volumeIssue.articles.map((article) => (
                        <div
                          key={article.id}
                          className="flex flex-col lg:flex-row gap-4 lg:gap-6 bg-white p-5 border border-stone-200"
                        >
                          <div className="flex-grow min-w-0">
                            <Link to={`/article/${buildArticleSlug(article)}`} className="block">
                              <h3 className="font-headline text-lg sm:text-xl text-stone-900 leading-snug hover:text-primary transition-colors">
                                {article.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-stone-500 mt-1.5">{formatAuthors(article.authors)}</p>
                            {article.abstract && (
                              <p className="text-sm text-stone-500 leading-relaxed mt-3 line-clamp-2">{article.abstract}</p>
                            )}
                          </div>

                          <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                            <PaperDownload
                              articleId={article.id}
                              manuscriptFileUrl={article.manuscript_file_url!}
                              title={article.title}
                            />
                            <Link
                              to={`/article/${buildArticleSlug(article)}`}
                              className="inline-flex items-center gap-1.5 border border-stone-200 hover:border-primary text-stone-700 px-4 h-9 text-[10px] font-bold uppercase tracking-widest transition-colors"
                            >
                              View <ArrowRight size={13} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </ContentSection>
    </div>
  );
}
