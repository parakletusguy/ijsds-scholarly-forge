import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckSquare, ArrowLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

export const AdminDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = !!profile?.is_admin;
  const isEditor = !!profile?.is_editor;

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/auth'); return; }
    if (!isAdmin && !isEditor) {
      toast({ title: 'Access denied', description: 'You need admin access to view this page.', variant: 'destructive' });
      navigate('/dashboard');
    }
  }, [user, profile, loading, navigate]);

  const adminCards = [
    {
      title: 'Blog',
      description: 'Create, edit, and publish posts on the journal blog.',
      icon: BookOpen,
      url: '/admin/blogs',
      roles: ['admin', 'editor'],
    },
    {
      title: 'Access Requests',
      description: 'Review and approve role requests from members.',
      icon: CheckSquare,
      url: '/requests',
      roles: ['admin'],
    },
  ];

  if (loading || (!isAdmin && !isEditor)) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <PageHeader
        title="Admin"
        subtitle="Dashboard"
        accent="Administration"
        description="Manage blog posts and review access requests."
      />

      <ContentSection dark>
        <div className="mb-8">
          <Button onClick={() => navigate('/dashboard')} variant="outline"
            className="rounded-none h-10 text-[10px] font-bold uppercase tracking-widest border-stone-200 hover:border-primary gap-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminCards.map((card) => {
            const hasAccess = isAdmin || (card.roles.includes('editor') && isEditor);
            if (!hasAccess) return null;
            return (
              <button
                key={card.title}
                onClick={() => navigate(card.url)}
                className="text-left bg-white border border-stone-200 p-6 hover:border-primary transition-colors group"
              >
                <div className="w-11 h-11 bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="font-headline text-lg text-stone-900 mb-1.5">{card.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{card.description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-primary transition-colors">
                  Open <ChevronRight size={12} />
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-stone-500 max-w-xl">
          These tools are also available from the sidebar. Keep member roles up to date under Access Requests.
        </p>
      </ContentSection>
    </div>
  );
};
