import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getArticles, Article } from '@/lib/articleService';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import { ArrowLeft, BookOpen, ExternalLink, Download } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { buildArticleSlug } from '@/lib/articleSlug';

export default function IssuePage() {
  const { volume, issue } = useParams<{ volume: string; issue: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (volume && issue) {
      fetchIssueArticles(parseInt(volume, 10), parseInt(issue, 10));
    }
  }, [volume, issue]);

  const fetchIssueArticles = async (vol: number, iss: number) => {
    setLoading(true);
    try {
      const data = await getArticles({ volume: vol, issue: iss, status: 'published' });
      setArticles(data);
    } catch (error) {
      console.error('Error fetching issue articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAuthors = (authors: any) => {
    if (!authors || !Array.isArray(authors) || authors.length === 0) return 'IJSDS Editorial';
    if (authors.length === 1) return authors[0].name;
    if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`;
    return `${authors[0].name} et al.`;
  };

  const publicationYear = articles.length > 0 && articles[0].publication_date
    ? new Date(articles[0].publication_date).getFullYear().toString()
    : '';

  return (
    <div className="pb-24 bg-stone-50 min-h-screen font-body">
      <Helmet>
        <title>Volume {volume}, Issue {issue} | IJSDS Archive</title>
        <meta name="description" content={`Table of Contents for Volume ${volume}, Issue ${issue} of the International Journal On Social Work and Development Studies.`} />
        <meta name="robots" content="index, follow" />
        <meta name="citation_volume" content={volume} />
        <meta name="citation_issue" content={issue} />
        <meta name="citation_journal_title" content="International Journal of Social Work and Development Studies" />
      </Helmet>

      <PageHeader 
        title={`Issue ${issue}`}
        subtitle={`Volume ${volume}`}
        accent={publicationYear ? `Published in ${publicationYear}` : 'Table of Contents'}
        description={`Articles published in Volume ${volume}, Issue ${issue}.`}
      />

      <ContentSection dark>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link to={`/archive/vol-${volume}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors">
              <ArrowLeft size={14} /> Back to Volume {volume}
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <LoadingSpinner size="lg" text="Loading articles..." />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 bg-white border border-stone-200">
              <h3 className="font-headline text-xl text-stone-500">No articles in this issue yet.</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="bg-white border border-stone-200 p-6 md:p-8 flex flex-col md:flex-row gap-6">
                  <div className="flex-grow min-w-0">
                    {article.subject_area && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{article.subject_area}</span>
                    )}
                    <h3 className="font-headline text-xl md:text-2xl text-stone-900 leading-snug mt-1.5">
                      <Link to={`/article/${buildArticleSlug(article)}`} className="hover:text-primary transition-colors">
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-stone-500 mt-2">{formatAuthors(article.authors)}</p>
                    {article.page_start && article.page_end && (
                      <p className="text-xs text-stone-400 mt-1">Pages {article.page_start}–{article.page_end}</p>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col gap-x-6 gap-y-3 shrink-0 md:border-l md:border-stone-100 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 border-stone-100 flex-wrap">
                    <Link to={`/article/${buildArticleSlug(article)}`} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-stone-700 hover:text-primary transition-colors">
                      <BookOpen size={14} /> Read
                    </Link>
                    {article.manuscript_file_url && (
                      <a href={article.manuscript_file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity">
                        <Download size={14} /> PDF
                      </a>
                    )}
                    {article.doi && (
                      <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors">
                        <ExternalLink size={12} /> DOI
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ContentSection>
    </div>
  );
}
