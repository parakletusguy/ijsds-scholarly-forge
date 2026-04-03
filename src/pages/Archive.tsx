import { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, ExternalLink, BookOpen, Plus, Layers, Database, History, Search, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';
import { getArticles, Article } from '@/lib/articleService';
import { PaperDownload } from '@/components/papers/PaperDownload';

interface VolumeIssue {
  volume: number;
  issue: number;
  articles: Article[];
  year: string;
}

export default function Archive() {
  const [archiveData, setArchiveData] = useState<VolumeIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    try {
      // Use the custom backend service instead of direct Supabase queries
      const data = await getArticles({ status: 'published' });

      // Group articles by Volume and Issue
      const grouped = data.reduce((acc: Record<string, VolumeIssue>, article: Article) => {
        if (!article.volume || !article.issue) return acc;
        
        const key = `${article.volume}-${article.issue}`;
        if (!acc[key]) {
          acc[key] = {
            volume: article.volume,
            issue: article.issue,
            articles: [],
            year: article.publication_date 
              ? new Date(article.publication_date).getFullYear().toString()
              : 'N/A'
          };
        }
        acc[key].articles.push(article);
        return acc;
      }, {});

      // Sort by Volume and Issue descending
      const sortedArchive = (Object.values(grouped) as VolumeIssue[]).sort((a, b) => {
        if (a.volume !== b.volume) return b.volume - a.volume;
        return b.issue - a.issue;
      });

      setArchiveData(sortedArchive);
    } catch (error) {
      console.error('Error fetching archive:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAuthors = (authors: any) => {
    if (!authors || !Array.isArray(authors) || authors.length === 0) return 'Author TBD';
    if (authors.length === 1) return authors[0].name;
    if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`;
    return `${authors[0].name} et al.`;
  };

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>Archive IJSDS — Scholarly Record Ledger</title>
        <meta name="description" content="Browse the complete digital archive of the IJSDS scholarly records grouped by Volume and Issue." />
      </Helmet>

      <PageHeader 
        title="Scholarly" 
        subtitle="Archives" 
        accent="Digital Institutional Ledger"
        description="The complete historical record of IJSDS publications, documenting the evolution of multicisciplinary development scholarship."
      />

      <ContentSection>
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="space-y-12 animate-pulse">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-32 bg-white border border-border/10 shadow-sm" />
               ))}
            </div>
          ) : archiveData.length === 0 ? (
            <div className="text-center py-48 bg-white border-2 border-dashed border-border/10 group relative overflow-hidden">
               <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <Database size={64} className="mx-auto text-foreground/10 mb-8 group-hover:rotate-12 transition-transform" />
               <h3 className="text-3xl font-headline font-black text-foreground/20 uppercase tracking-[0.3em] relative z-10 italic">Archive Repository Status: Empty</h3>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-12">
              {archiveData.map((volumeIssue) => (
                <AccordionItem 
                  key={`${volumeIssue.volume}-${volumeIssue.issue}`} 
                  value={`${volumeIssue.volume}-${volumeIssue.issue}`}
                  className="border-none bg-white shadow-sm hover:shadow-2xl transition-all duration-700 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-full bg-secondary/5 -mr-16 group-hover:mr-0 transition-all duration-1000 -z-0" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                  
                  <AccordionTrigger className="px-12 py-10 md:py-16 hover:no-underline border-l-8 border-transparent hover:border-primary transition-all data-[state=open]:border-primary data-[state=open]:bg-secondary/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-12 text-left relative z-10 font-headline">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                           <div className="h-0.5 w-12 bg-primary group-hover:w-20 transition-all duration-700"></div>
                           <span className="text-[10px] uppercase tracking-[0.5em] text-foreground/30 font-black italic">Archival Record</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground leading-[0.85] group-hover:text-primary transition-colors">
                          Vol. <span className="text-secondary">{volumeIssue.volume}</span> / Issue {volumeIssue.issue}
                        </h2>
                        <div className="flex items-center gap-6 mt-6">
                           <Badge className="bg-foreground text-white px-4 py-1.5 font-headline text-[10px] font-black uppercase tracking-widest rounded-none shadow-md">
                              Institutional Release: {volumeIssue.year}
                           </Badge>
                           <div className="flex items-center gap-2">
                              <Layers size={14} className="text-secondary" />
                              <span className="text-foreground/40 text-[11px] font-bold uppercase tracking-widest italic">
                                 {volumeIssue.articles.length} Records Cataloged
                              </span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-12 pb-16 pt-12 border-t border-border/10 relative z-10 bg-secondary/5">
                    <div className="grid grid-cols-1 gap-16">
                      {volumeIssue.articles.map((article, idx) => (
                        <div key={article.id} className="relative group/article flex flex-col lg:flex-row gap-12 bg-white p-12 shadow-sm border border-border/10 hover:shadow-2xl transition-all duration-700">
                          {/* Article Metadata Prefix */}
                          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 flex items-center justify-center font-headline font-black text-foreground/10 text-xl group-hover/article:bg-primary group-hover/article:text-white transition-all italic">
                             ID-{idx+1}
                          </div>

                          <div className="flex-grow space-y-6">
                             <div className="flex items-center gap-4 font-headline font-black text-[9px] uppercase tracking-[0.4em] text-foreground/30 italic">
                                <History size={12} className="text-primary" />
                                <span>Digital Manuscript Segment</span>
                             </div>

                             <h3 className="text-3xl font-black font-headline uppercase tracking-tighter leading-tight group-hover/article:text-primary transition-colors cursor-pointer">
                               {article.title}
                             </h3>

                             <p className="font-body text-xl text-foreground/40 leading-snug border-l-4 border-primary/20 pl-8 italic group-hover/article:border-primary transition-colors">
                               {formatAuthors(article.authors)}
                             </p>

                             <p className="font-body text-lg text-foreground/50 leading-relaxed max-w-4xl line-clamp-2">
                               {article.abstract}
                             </p>
                          </div>

                          <div className="flex lg:flex-col gap-4 shrink-0 justify-end lg:justify-start pt-8 lg:pt-0">
                             <PaperDownload 
                               manuscriptFileUrl={article.manuscript_file_url}
                               title={article.title}
                               iconOnly={false}
                             />
                             <Button 
                               variant="outline"
                               className="relative border-2 border-foreground text-foreground p-6 font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:bg-foreground hover:text-white transition-all flex items-center gap-4 rounded-none h-auto"
                               onClick={() => window.location.href = `/article/${article.id}`}
                             >
                               <Search size={18} /> View Meta-Data
                             </Button>
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

      {/* Continuity Note */}
      <ContentSection>
        <div className="max-w-5xl mx-auto py-32 text-center border-t border-border/10 relative group">
           <Layers size={32} className="mx-auto text-foreground/5 mb-12 group-hover:text-primary transition-colors" />
           <h3 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter mb-8 max-w-4xl mx-auto leading-none italic">Preserving the <span className="text-primary not-italic">Scientific Legacy</span></h3>
           <p className="text-2xl font-body text-foreground/40 italic mb-16 max-w-3xl mx-auto">Access high-impact discoveries documenting developmental transformation.</p>
        </div>
      </ContentSection>
    </div>
  );
}
