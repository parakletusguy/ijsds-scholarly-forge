import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Settings, Database, BarChart3, CheckSquare, ArrowLeft, ChevronRight, Activity } from 'lucide-react';
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
      description: 'Create, edit, and publish posts on the journal blog.',
      icon: BookOpen,
      url: '/admin/blogs',
      color: 'bg-primary text-white border-primary/20',
      roles: ['admin', 'editor']
    },
    {
      title: 'Data Management',
      description: 'Export submission data and generate reports.',
      icon: Database,
      url: '/data-management',
      color: 'bg-secondary text-white border-secondary/20',
      roles: ['admin']
    },
    {
      title: 'System Settings',
      description: 'Configure journal-wide settings and parameters.',
      icon: Settings,
      url: '/system-settings',
      color: 'bg-foreground text-white border-foreground/20',
      roles: ['admin']
    },
    {
      title: 'Access Requests',
      description: 'Review and approve role requests from contributors.',
      icon: CheckSquare,
      url: '/requests',
      color: 'bg-primary/10 text-primary border-primary/20',
      roles: ['admin']
    },
    {
      title: 'Analytics',
      description: 'View submission trends and journal activity metrics.',
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
        title="Admin"
        subtitle="Dashboard"
        accent="Administration"
        description="Manage blog posts, review access requests, and configure journal settings."
      />

      <ContentSection>
        <div className="flex items-center mb-12">
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest gap-2 py-6 border-primary/20 hover:border-primary transition-all">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
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
                
                <div className="pt-6 border-t border-border/10 flex items-center">
                  <span className="font-headline font-bold text-[9px] uppercase tracking-widest text-foreground/30 flex items-center gap-2 group-hover:text-primary transition-colors">
                    Open <ChevronRight size={10} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-white border border-border/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="font-body text-sm text-foreground/60 leading-relaxed max-w-xl">
            All admin tools are also accessible from the sidebar navigation. Make sure user roles are kept up to date under Access Requests.
          </p>
          <Button onClick={() => navigate('/system-settings')} variant="outline" className="rounded-none font-headline font-black uppercase text-[10px] tracking-widest px-8 py-5 h-auto border-primary/20 hover:border-primary transition-all shrink-0 flex items-center gap-2">
            System Settings <Activity size={13} />
          </Button>
        </div>
      </ContentSection>
    </div>
  );
};
