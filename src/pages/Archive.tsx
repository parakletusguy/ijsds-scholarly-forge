import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, ExternalLink, BookOpen, Plus, Layers, Database, History, Search, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

interface Author {
  name: string;
  affiliation?: string;
}

interface Article {
  id: string;
  title: string;
  abstract: string;
  authors: Author[];
  doi: string | null;
  volume: number | null;
  issue: number | null;
  page_start: number | null;
  page_end: number | null;
  publication_date: string | null;
  manuscript_file_url: string | null;
  keywords: string[] | null;
}

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
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .not('volume', 'is', null)
        .not('issue', 'is', null)
        .order('volume', { ascending: false })
        .order('issue', { ascending: false })
        .order('publication_date', { ascending: false });

      if (error) throw error;

      const grouped = (data as any[]).reduce((acc: Record<string, VolumeIssue>, article: any) => {
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
        acc[key].articles.push({
          ...article,
          authors: article.authors as Author[]
        });
        return acc;
      }, {});

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

  const formatAuthors = (authors: Author[]) => {
    return authors.map(a => a.name).join(', ');
  };

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <Helmet>
        <title>Archive IJSDS — Digital Scientific Record</title>
        <meta name="description" content="Browse the complete digital archive of the International Journal of Social Work and Development Studies (IJSDS)." />
      </Helmet>

      <PageHeader 
        title="Digital" 
        subtitle="Archives" 
        accent="The Scientific Record Ledger"
        description="The complete collection of IJSDS publications, documenting the evolution of multicisciplinary social work and development scholarship across continental borders."
      />

      {/* Archive Chronology — High Fidelity Ledger */}
      <ContentSection>
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="space-y-12 animate-pulse">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-32 bg-white border border-border/10 shadow-sm" />
               ))}
            </div>
          ) : archiveData.length === 0 ? (
            <div className="text-center py-48 bg-white border-2 border-dashed border-border/20 group relative overflow-hidden">
               <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <Database size={64} className="mx-auto text-foreground/10 mb-8 group-hover:rotate-12 transition-transform" />
               <h3 className="text-3xl font-headline font-black text-foreground/20 uppercase tracking-[0.3em] relative z-10">Archive Node Synchronizing</h3>
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
                           <Badge className="bg-foreground text-white px-4 py-1.5 font-headline text-[10px] font-black uppercase tracking-widest rounded-none">
                              Released: {volumeIssue.year}
                           </Badge>
                           <div className="flex items-center gap-2">
                              <Layers size={14} className="text-secondary" />
                              <span className="text-foreground/40 text-[11px] font-bold uppercase tracking-widest">
                                 {volumeIssue.articles.length} Manuscripts
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
                          {/* Article index motif */}
                          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 flex items-center justify-center font-headline font-black text-foreground/10 text-xl group-hover/article:bg-secondary group-hover/article:text-white transition-all">
                             0{idx+1}
                          </div>

                          <div className="flex-grow space-y-6">
                             <div className="flex items-center gap-4 font-headline font-black text-[9px] uppercase tracking-[0.4em] text-foreground/30 italic">
                                <History size={12} className="text-primary" />
                                <span>Article Segment</span>
                             </div>

                             <h3 className="text-3xl font-black font-headline uppercase tracking-tighter leading-tight group-hover/article:text-primary transition-colors">
                               {article.title}
                             </h3>

                             <p className="font-body text-xl text-foreground/40 leading-snug border-l-4 border-secondary/20 pl-8 italic group-hover/article:border-secondary transition-colors">
                               {formatAuthors(article.authors)}
                             </p>

                             <p className="font-body text-lg text-foreground/50 leading-relaxed max-w-4xl line-clamp-2">
                               {article.abstract}
                             </p>

                             <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-border/10 font-headline font-black text-[10px] uppercase tracking-widest">
                                {article.doi && (
                                   <div className="flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors cursor-default">
                                      <ExternalLink size={14} className="text-secondary" /> DOI: {article.doi}
                                   </div>
                                )}
                                {article.page_start && article.page_end && (
                                   <div className="bg-foreground text-white px-3 py-1 scale-90">
                                      Pages {article.page_start}—{article.page_end}
                                   </div>
                                )}
                             </div>
                          </div>

                          <div className="flex lg:flex-col gap-4 shrink-0 justify-end lg:justify-start pt-8 lg:pt-0">
                             {article.manuscript_file_url && (
                               <button 
                                 className="group/dl relative bg-primary text-white p-6 font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:bg-foreground transition-all shadow-xl overflow-hidden flex items-center gap-4"
                                 onClick={() => window.open(article.manuscript_file_url!, '_blank')}
                               >
                                 <Download size={18} className="relative z-10 group-hover/dl:-translate-y-1 transition-transform" />
                                 <span className="relative z-10 hidden sm:inline">Download PDF</span>
                                 <div className="absolute inset-0 bg-white translate-x-full group-hover/dl:translate-x-0 transition-transform duration-500 opacity-10"></div>
                               </button>
                             )}
                             <button 
                               className="relative border-2 border-foreground text-foreground p-6 font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:bg-foreground hover:text-white transition-all flex items-center gap-4"
                               onClick={() => window.location.href = `/article/${article.id}`}
                             >
                               <Search size={18} />
                               <span className="hidden sm:inline">View Details</span>
                             </button>
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

      {/* Continuity Note — High Fidelity Seal */}
      <ContentSection>
        <div className="max-w-5xl mx-auto py-32 text-center border-t border-border/20 relative group">
            <Layers size={32} className="mx-auto text-foreground/5 mb-12 group-hover:text-primary transition-colors" />
           <h3 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter mb-8 max-w-4xl mx-auto leading-none italic">Preserving the <span className="text-primary not-italic">Scientific Legacy</span></h3>
           <p className="text-2xl font-body text-foreground/40 italic mb-16 max-w-3xl mx-auto">Access the high-impact Multidisciplinary discoveries that define African developmental transformation.</p>
           
           <div className="flex flex-col items-center gap-12">
              <div className="flex flex-wrap justify-center gap-12 font-headline font-black text-[10px] uppercase tracking-[0.6em] text-foreground/10 italic">
                 <span>Permanent Record</span>
                 <span className="text-foreground/5 shrink-0 hidden sm:block">•</span>
                 <span>Scholarly Continuity</span>
                 <span className="text-foreground/5 shrink-0 hidden sm:block">•</span>
                 <span>Global Archive</span>
              </div>
           </div>
        </div>
      </ContentSection>
    </div>
  );
}
