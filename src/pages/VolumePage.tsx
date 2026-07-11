import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getArticles, Article } from '@/lib/articleService';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function VolumePage() {
  const { volume } = useParams<{ volume: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (volume) {
      fetchVolumeArticles(parseInt(volume, 10));
    }
  }, [volume]);

  const fetchVolumeArticles = async (vol: number) => {
    setLoading(true);
    try {
      const data = await getArticles({ volume: vol, status: 'published' });
      setArticles(data);
    } catch (error) {
      console.error('Error fetching volume articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group by issue
  const issuesMap = articles.reduce((acc, article) => {
    if (article.issue) {
      if (!acc[article.issue]) {
        acc[article.issue] = [];
      }
      acc[article.issue].push(article);
    }
    return acc;
  }, {} as Record<number, Article[]>);

  const sortedIssues = Object.keys(issuesMap)
    .map(Number)
    .sort((a, b) => b - a);

  const publicationYear = articles.length > 0 && articles[0].publication_date
    ? new Date(articles[0].publication_date).getFullYear().toString()
    : '';

  return (
    <div className="pb-24 bg-stone-50 min-h-screen font-body">
      <Helmet>
        <title>Volume {volume} | IJSDS Archive</title>
        <meta name="description" content={`Browse issues and articles in Volume ${volume} of the International Journal of Social Work and Development Studies.`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <PageHeader
        title={`Volume ${volume}`}
        subtitle="Archive"
        accent={publicationYear ? `Published in ${publicationYear}` : ''}
        description={`Browse the issues published in Volume ${volume}.`}
      />

      <ContentSection dark>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/archive" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors">
              <ArrowLeft size={14} /> Back to full archive
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <LoadingSpinner size="lg" text="Loading issues..." />
            </div>
          ) : sortedIssues.length === 0 ? (
            <div className="text-center py-20 bg-white border border-stone-200">
              <h3 className="font-headline text-xl text-stone-500">No issues in this volume yet.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedIssues.map((issueNum) => (
                <Link
                  key={issueNum}
                  to={`/archive/vol-${volume}/issue-${issueNum}`}
                  className="bg-white p-6 border border-stone-200 hover:border-primary transition-colors group"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center">
                      <BookOpen size={18} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      {issuesMap[issueNum].length} {issuesMap[issueNum].length === 1 ? 'article' : 'articles'}
                    </span>
                  </div>
                  <h2 className="font-headline text-2xl text-stone-900 group-hover:text-primary transition-colors">
                    Issue {issueNum}
                  </h2>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-primary transition-colors">
                    <Layers size={13} /> Browse articles
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </ContentSection>
    </div>
  );
}
