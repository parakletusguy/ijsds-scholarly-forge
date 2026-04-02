import { ComprehensiveReports } from '@/components/reporting/ComprehensiveReports';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

export const Reports = () => {
  const navigate = useNavigate();
  
  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <PageHeader 
        title="Intelligence" 
        subtitle="Nexus" 
        accent="Institutional Auditing"
        description="Comprehensive scholarly reporting and performance analysis. Monitor the institutional efficacy of the journal through high-fidelity data visualizations and archival trajectories."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate('/admin')} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Return to Command Hub
           </Button>
           
           <div className="flex items-center gap-4 bg-white/50 p-4 border border-border/20">
              <ShieldCheck size={16} className="text-secondary" />
              <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Authorized Institutional Audit Stream</span>
           </div>
        </div>

        <div className="animate-fade-in-up">
           <ComprehensiveReports />
        </div>
      </ContentSection>
    </div>
  );
};