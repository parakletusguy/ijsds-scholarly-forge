import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Settings, 
  Database, 
  BarChart3, 
  CheckSquare, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  Activity,
  Server
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRole();
  }, [user]);

  const checkRole = async () => {
    if (!user) { navigate('/auth'); return; }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, is_editor')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (!profile?.is_admin && !profile?.is_editor) {
        toast({ title: 'Access Denied', description: 'Administrative credentials required.', variant: 'destructive' });
        navigate('/dashboard'); return;
      }

      setIsAdmin(profile.is_admin);
      setIsEditor(profile.is_editor);
    } catch (error) { navigate('/dashboard'); }
    finally { setLoading(false); }
  };

  const adminCards = [
    {
      title: 'Blog Management',
      description: 'Create, edit, and publish high-impact journal narratives and community insights.',
      icon: BookOpen,
      url: '/admin/blogs',
      color: 'bg-primary text-white border-primary/20',
      roles: ['admin', 'editor']
    },
    {
      title: 'Data Management',
      description: 'Export scholarly datasets, generate census reports, and monitor longitudinal health.',
      icon: Database,
      url: '/data-management',
      color: 'bg-secondary text-white border-secondary/20',
      roles: ['admin']
    },
    {
      title: 'System Settings',
      description: 'Configure global journal parameters, architectural boundaries, and protocol limits.',
      icon: Settings,
      url: '/system-settings',
      color: 'bg-foreground text-white border-foreground/20',
      roles: ['admin']
    },
    {
      title: 'Access Protocol',
      description: 'Authorize or refuse contributor credentials and manage institutional role requests.',
      icon: CheckSquare,
      url: '/requests',
      color: 'bg-primary/10 text-primary border-primary/20',
      roles: ['admin']
    },
    {
      title: 'Audit Analytics',
      description: 'Track submission velocity, citation trends, and global scholarly traffic patterns.',
      icon: BarChart3,
      url: '/analytics',
      color: 'bg-secondary/10 text-secondary border-secondary/20',
      roles: ['admin']
    }
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const cardClasses = "bg-white p-10 border border-border/40 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:border-primary/40 transition-all cursor-pointer";

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <PageHeader 
        title="Command" 
        subtitle="Hub" 
        accent="Infrastructure Oversight"
        description="Oversee the digital heartbeat of the journal. Manage publication workflows, system architecture, and authorized scholarly access with high-fidelity governance tools."
      />

      <ContentSection>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
           <Button onClick={() => navigate('/dashboard')} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
              <ArrowLeft className="h-4 w-4" /> Return to User Portal
           </Button>
           
           <div className="flex items-center gap-6 bg-white/50 p-4 border border-border/20">
              <div className="flex items-center gap-3">
                 <Server size={14} className="text-secondary" />
                 <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Infrastructure: <span className="text-green-600">Optimal</span></span>
              </div>
              <div className="w-px h-4 bg-border/40"></div>
              <div className="flex items-center gap-3">
                 <ShieldCheck size={14} className="text-primary" />
                 <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/40">Access: <span className="text-foreground">{isAdmin ? 'Full Domain' : 'Editorial'}</span></span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {adminCards.map((card) => {
            const hasAccess = isAdmin || (card.roles.includes('editor') && isEditor);
            if (!hasAccess) return null;

            return (
              <div 
                key={card.title} 
                className={cardClasses}
                onClick={() => navigate(card.url)}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-muted/10" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
                
                <div className={`w-14 h-14 ${card.color} flex items-center justify-center mb-8 border transition-transform group-hover:scale-110 shadow-lg`}>
                   <card.icon className="h-6 w-6" />
                </div>
                
                <h3 className="text-xl font-headline font-black uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">{card.title}</h3>
                <p className="font-body text-xs text-foreground/40 leading-relaxed mb-8 italic">{card.description}</p>
                
                <div className="pt-6 border-t border-border/10 flex items-center justify-between">
                   <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/30 flex items-center gap-2 group-hover:text-primary transition-colors">
                      Enter Module <ChevronRight size={10} />
                   </span>
                   <Award size={14} className="text-foreground/10 group-hover:text-secondary group-hover:opacity-40 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 border-t-8 border-foreground bg-white p-12 shadow-2xl relative overflow-hidden">
           <div className="absolute bottom-0 right-0 p-12 opacity-5 pointer-events-none transform translate-y-1/4 translate-x-1/4">
              <Zap size={200} />
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              <div className="lg:col-span-1">
                 <div className="p-4 bg-muted text-foreground/40 inline-block"><Info size={32} /></div>
              </div>
              <div className="lg:col-span-7">
                 <h3 className="text-xl font-headline font-black uppercase tracking-tight mb-4">Governance Intelligence Bulletin</h3>
                 <p className="font-body text-sm text-foreground/60 leading-relaxed italic border-l-4 border-primary pl-6">
                    Administrative components are now integrated into the primary navigation architecture. Ensure role-based credentials are synchronized across departmental workflows to maintain institutional compliance and system integrity.
                 </p>
              </div>
              <div className="lg:col-span-4 flex justify-end">
                 <Button onClick={() => navigate('/system-settings')} className="bg-foreground text-white rounded-none font-headline font-black uppercase text-[10px] tracking-widest px-12 py-6 h-auto hover:bg-secondary transition-all flex items-center gap-3">
                    Audit Settings <Activity size={14} />
                 </Button>
              </div>
           </div>
        </div>
      </ContentSection>
    </div>
  );
};
