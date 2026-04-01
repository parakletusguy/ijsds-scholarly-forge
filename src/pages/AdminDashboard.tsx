import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, is_editor')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (!profile?.is_admin && !profile?.is_editor) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access the admin dashboard.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(profile.is_admin);
      setIsEditor(profile.is_editor);
    } catch (error) {
      console.error('Error checking role:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const adminCards = [
    {
      title: 'Blog Management',
      description: 'Create, edit, and publish journal blog posts.',
      icon: BookOpen,
      url: '/admin/blogs',
      color: 'bg-blue-500/10 text-blue-600',
      roles: ['admin', 'editor']
    },
    {
      title: 'Data Management',
      description: 'Export system data, generate reports, and monitor health.',
      icon: Database,
      url: '/data-management',
      color: 'bg-green-500/10 text-green-600',
      roles: ['admin']
    },
    {
      title: 'System Settings',
      description: 'Configure global journal parameters and file limits.',
      icon: Settings,
      url: '/system-settings',
      color: 'bg-purple-500/10 text-purple-600',
      roles: ['admin']
    },
    {
      title: 'Check Requests',
      description: 'Approve or reject contributor and role requests.',
      icon: CheckSquare,
      url: '/requests',
      color: 'bg-amber-500/10 text-amber-600',
      roles: ['admin']
    },
    {
      title: 'Analytics',
      description: 'Track submission trends and visitor traffic.',
      icon: BarChart3,
      url: '/analytics',
      color: 'bg-rose-500/10 text-rose-600',
      roles: ['admin']
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              User Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Administration Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {isAdmin ? 'Administrator' : 'Editor'}. Manage your journal's digital infrastructure.
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg border">
          <Zap className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">System Status: <span className="text-green-600">Optimal</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card) => {
          const hasAccess = isAdmin || (card.roles.includes('editor') && isEditor);
          if (!hasAccess) return null;

          return (
            <Card 
              key={card.title} 
              className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
              onClick={() => navigate(card.url)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Open {card.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 bg-muted/20 rounded-xl p-6 border border-dashed border-muted-foreground/30">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <Info className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Administrative Quick Tip</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can now access these tools through the <strong>"Main Navigation"</strong> sidebar by expanding the dashboard specific section. 
              Only users with matching administrative privileges will see these options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
