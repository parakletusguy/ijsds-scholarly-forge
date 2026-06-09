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
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>Volume {volume} | IJSDS Archive</title>
        <meta name="description" content={`Browse issues and articles in Volume ${volume} of the International Journal On Social Work and Development Studies.`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <PageHeader 
        title={`Volume ${volume}`}
        subtitle="Archive"
        accent={publicationYear ? `Published in ${publicationYear}` : ''}
        description={`Explore the scholarly records published in Volume ${volume}.`}
      />

      <ContentSection>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <Link to="/archive" className="flex items-center gap-2 text-primary hover:underline font-bold text-sm uppercase tracking-widest">
              <ArrowLeft size={16} /> Back to Full Archive
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <LoadingSpinner size="lg" text="Loading volume records..." />
            </div>
          ) : sortedIssues.length === 0 ? (
            <div className="text-center py-24 bg-white border border-border/10 shadow-sm">
              <h3 className="text-2xl font-headline text-foreground/40 italic">No issues found in this volume.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sortedIssues.map((issueNum) => (
                <Link 
                  key={issueNum}
                  to={`/archive/vol-${volume}/issue-${issueNum}`}
                  className="bg-white p-10 border border-border/10 hover:border-primary shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-primary/5 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                      <BookOpen size={24} className="text-primary group-hover:text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30">
                      {issuesMap[issueNum].length} Articles
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-headline font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                    Issue {issueNum}
                  </h2>
                  
                  <div className="mt-8 flex items-center text-xs font-bold uppercase tracking-widest text-primary gap-2">
                    <Layers size={14} /> Browse Articles
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </ContentSection>
    </div>
  );
}
