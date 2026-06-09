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
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
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
        description={`Explore the scholarly records published in Volume ${volume}, Issue ${issue}.`}
      />

      <ContentSection>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <Link to={`/archive/vol-${volume}`} className="flex items-center gap-2 text-primary hover:underline font-bold text-sm uppercase tracking-widest">
              <ArrowLeft size={16} /> Back to Volume {volume}
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <LoadingSpinner size="lg" text="Loading issue records..." />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-24 bg-white border border-border/10 shadow-sm">
              <h3 className="text-2xl font-headline text-foreground/40 italic">No articles found in this issue.</h3>
            </div>
          ) : (
            <div className="space-y-8">
              {articles.map((article, idx) => (
                <div key={article.id} className="bg-white p-8 md:p-12 border border-border/10 shadow-sm hover:shadow-xl transition-all duration-500 relative group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 flex items-center justify-center font-headline font-black text-foreground/10 text-xl group-hover:bg-primary group-hover:text-white transition-all italic">
                    {idx + 1}
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-grow space-y-4 pr-16">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        {article.subject_area || 'Research Article'}
                      </span>
                      
                      <h3 className="text-2xl md:text-3xl font-headline font-black leading-snug">
                        <Link to={`/article/${buildArticleSlug(article)}`} className="hover:text-primary transition-colors">
                          {article.title}
                        </Link>
                      </h3>
                      
                      <p className="text-foreground/60 font-body text-lg italic border-l-2 border-primary/20 pl-4">
                        {formatAuthors(article.authors)}
                      </p>
                      
                      {article.page_start && article.page_end && (
                        <p className="text-sm text-foreground/50">
                          Pages {article.page_start} - {article.page_end}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-4 shrink-0 justify-center border-t md:border-t-0 md:border-l border-border/10 pt-6 md:pt-0 md:pl-8">
                      <Link 
                        to={`/article/${buildArticleSlug(article)}`}
                        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                      >
                        <BookOpen size={16} /> Read Abstract
                      </Link>
                      
                      {article.manuscript_file_url && (
                        <a 
                          href={article.manuscript_file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors"
                        >
                          <Download size={16} /> PDF Download
                        </a>
                      )}
                      
                      {article.doi && (
                        <a 
                          href={`https://doi.org/${article.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors"
                        >
                          <ExternalLink size={14} /> {article.doi}
                        </a>
                      )}
                    </div>
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
