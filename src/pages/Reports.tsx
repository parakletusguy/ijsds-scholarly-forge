import { useEffect } from 'react';
import { ComprehensiveReports } from '@/components/reporting/ComprehensiveReports';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

export const Reports = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const isEditor = !!(profile?.is_editor || profile?.is_admin);

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (!loading && user && !isEditor) {
      toast({ title: 'Access denied', description: 'You need editor access to view reports.', variant: 'destructive' });
      navigate('/dashboard');
    }
  }, [user, profile, loading, navigate]);

  if (loading || !isEditor) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <PageHeader
        title="Reports"
        subtitle="& Analytics"
        accent="Editorial"
        description="Journal performance, submission trends, and reporting."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate('/admin')} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Back
           </Button>

           <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
              <ShieldCheck size={16} className="text-secondary" />
              <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Editor</span>
           </div>
        </div>

        <div className="animate-fade-in-up">
           <ComprehensiveReports />
        </div>
      </ContentSection>
    </div>
  );
};
