import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Table, Calendar, Database, ShieldCheck, Activity, GraduationCap, ChevronRight, Hash, Send } from 'lucide-react';

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dataType: 'submissions' | 'reviews' | 'articles' | 'users';
  dateFrom: string;
  dateTo: string;
  includeMetadata: boolean;
  includeComments: boolean;
}

export const DataExport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    dataType: 'submissions',
    dateFrom: '',
    dateTo: '',
    includeMetadata: true,
    includeComments: false,
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await supabase.functions.invoke('export-data', {
        body: { options },
      });

      if (response.error) throw response.error;

      const { downloadUrl, filename } = response.data;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Archive Extracted", description: "Scholarly data has been successfully exported to the local repository." });
    } catch (error) {
      toast({ title: "Export Refused", description: "Failed to synchronize data for archival extraction.", variant: "destructive" });
    } finally { setExporting(false); }
  };

  const generateReport = async (reportType: 'editorial' | 'review-summary' | 'compliance') => {
    setExporting(true);
    try {
      const response = await supabase.functions.invoke('generate-report', {
        body: { reportType, dateFrom: options.dateFrom, dateTo: options.dateTo },
      });

      if (response.error) throw response.error;

      const { downloadUrl, filename } = response.data;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Intelligence Finalized", description: "Automated scholarly report has been generated and archived." });
    } catch (error) {
       toast({ title: "Audit Error", description: "Failed to generate the requested institutional report.", variant: "destructive" });
    } finally { setExporting(false); }
  };

  const cardClasses = "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group";
  const labelClasses = "font-headline font-black text-[10px] uppercase tracking-widest text-foreground/40 mb-4 block";
  const inputClasses = "bg-muted/10 border-border/60 rounded-none focus:border-primary transition-all font-body text-sm h-14";

  return (
    <div className="space-y-12">
      <div className={cardClasses + " border-t-8 border-foreground"}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border/20 relative z-10">
           <div className="p-3 bg-foreground text-white shadow-lg"><Database size={18} /></div>
           <h3 className="text-2xl font-headline font-black uppercase tracking-tighter">Archival Extraction Protocol</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-2">
            <Label htmlFor="format" className={labelClasses}>Registry Format</Label>
            <Select
              value={options.format}
              onValueChange={(value: 'csv' | 'excel' | 'pdf') => setOptions(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger className={inputClasses + " font-headline font-black uppercase text-[10px] tracking-widest px-6"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest">
                <SelectItem value="csv" className="py-4">CSV (Raw Analytics)</SelectItem>
                <SelectItem value="excel" className="py-4">Excel (Tabulated Dataset)</SelectItem>
                <SelectItem value="pdf" className="py-4">PDF (Archival Document)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataType" className={labelClasses}>Intelligence Stream</Label>
            <Select
              value={options.dataType}
              onValueChange={(value: 'submissions' | 'reviews' | 'articles' | 'users') => setOptions(prev => ({ ...prev, dataType: value }))}
            >
              <SelectTrigger className={inputClasses + " font-headline font-black uppercase text-[10px] tracking-widest px-6"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest">
                <SelectItem value="submissions" className="py-4">Submission Registry</SelectItem>
                <SelectItem value="reviews" className="py-4">Peer-Review Audit</SelectItem>
                <SelectItem value="articles" className="py-4">Published Archives</SelectItem>
                <SelectItem value="users" className="py-4">Scholar Identity Index</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFrom" className={labelClasses}>Temporal Horizon (From)</Label>
            <Input
              type="date"
              value={options.dateFrom}
              onChange={(e) => setOptions(prev => ({ ...prev, dateFrom: e.target.value }))}
              className={inputClasses}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTo" className={labelClasses}>Temporal Horizon (To)</Label>
            <Input
              type="date"
              value={options.dateTo}
              onChange={(e) => setOptions(prev => ({ ...prev, dateTo: e.target.value }))}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-border/10 mb-10">
          <div className="flex items-center space-x-4 group/box cursor-pointer">
            <Checkbox
              id="metadata"
              checked={options.includeMetadata}
              onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeMetadata: !!checked }))}
              className="border-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label htmlFor="metadata" className="font-headline font-black uppercase text-[10px] tracking-widest cursor-pointer group-hover/box:text-primary transition-colors">Synchronize Metadata Tags</Label>
          </div>
          <div className="flex items-center space-x-4 group/box cursor-pointer">
            <Checkbox
              id="comments"
              checked={options.includeComments}
              onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeComments: !!checked }))}
              className="border-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label htmlFor="comments" className="font-headline font-black uppercase text-[10px] tracking-widest cursor-pointer group-hover/box:text-primary transition-colors">Include Narrative Directives</Label>
          </div>
        </div>

        <Button onClick={handleExport} disabled={exporting} className="w-full bg-foreground hover:bg-primary text-white py-10 rounded-none font-headline font-black uppercase text-xs tracking-[0.3em] shadow-xl group transition-all">
          {exporting ? 'Processing Registry...' : <><Download className="h-5 w-5 mr-4 group-hover:-translate-y-1 transition-transform" /> Authorize Export</>}
        </Button>
      </div>

      <div className={cardClasses}>
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border/20">
           <div className="p-3 bg-secondary text-white shadow-lg"><FileText size={18} /></div>
           <h3 className="text-2xl font-headline font-black uppercase tracking-tighter">Automated Intelligence Reports</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: 'editorial', label: 'Editorial Census', desc: 'Submission metrics and review velocity registry.', icon: <Table size={24} /> },
            { id: 'review-summary', label: 'Peer Assessment Audit', desc: 'Reviewer responsiveness and temporal performance.', icon: <Calendar size={24} /> },
            { id: 'compliance', label: 'Compliance Protocol', desc: 'Policy adherence and institutional audit trail.', icon: <ShieldCheck size={24} /> }
          ].map((report) => (
            <div key={report.id} className="group/report relative border border-border/10 p-8 hover:border-primary/20 hover:bg-secondary/5 transition-all cursor-pointer" onClick={() => generateReport(report.id as any)}>
               <div className="p-4 bg-muted text-foreground/30 mb-8 inline-block group-hover/report:bg-primary group-hover/report:text-white transition-all transform group-hover/report:rotate-6 shadow-sm">
                  {report.icon}
               </div>
               <h4 className="font-headline font-black uppercase text-xs tracking-tight mb-4 group-hover/report:text-primary transition-colors">{report.label}</h4>
               <p className="font-body text-[10px] text-foreground/40 italic leading-relaxed mb-8">{report.desc}</p>
               <div className="flex items-center gap-2 font-headline font-bold text-[8px] uppercase tracking-[0.2em] text-foreground/20 group-hover/report:text-secondary group-hover/report:translate-x-2 transition-all">
                  Generate Ledger <ChevronRight size={10} />
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};