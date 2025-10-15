import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { HelpSystem } from '@/components/help/HelpSystem';
import { 
  BookOpen, 
  User, 
  LogOut, 
  FileText, 
  Settings, 
  BarChart3, 
  Database,
  Home,
  FileCheck,
  Info,
  PenTool,
  Users,
  Eye,
  Wrench,
  Globe,
  CheckSquare
} from 'lucide-react';
import icon from "/public/Logo_Black_Edited-removebg-preview.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';

export const AppSidebar = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { open } = useSidebar();
  const [userRole, setUserRole] = useState<{
    is_admin: boolean;
    is_editor: boolean;
    is_reviewer: boolean;
  }>({ is_admin: false, is_editor: false, is_reviewer: false });

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, is_editor, is_reviewer')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (profile) {
        setUserRole(profile);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Signed out successfully',
      });
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const mainNavItems = [
    { title: 'Home', url: '/', icon: Home },
    { title: 'Articles', url: '/articles', icon: FileText },
    { title: 'Blog', url: '/blog', icon: BookOpen },
    { title: 'Partners', url: '/partners', icon: Users },
    { title: 'About', url: '/about', icon: Info },
  ];

  // Dynamic navigation based on user roles
  const getNavItemsForRole = () => {
    if (!user) return [];

    const baseItems = [
      { title: 'Submit Article', url: '/submit', icon: PenTool, roles: ['author', 'editor', 'reviewer', 'admin'] },
      { title: 'Dashboard', url: '/dashboard', icon: FileText, roles: ['author', 'editor', 'reviewer', 'admin'] },
      { title: 'Edit Profile', url: '/profile', icon: User, roles: ['author', 'editor', 'reviewer', 'admin'] },
    ];

    const roleSpecificItems = [
      // Reviewer items (visible to reviewers, editors, admins)
      { title: 'Reviewer Dashboard', url: '/reviewer-dashboard', icon: Eye, roles: ['reviewer', 'editor', 'admin'] },
      
      // Editor items (visible to editors and admins)
      { title: 'Editorial', url: '/editorial', icon: FileCheck, roles: ['editor', 'admin'] },
      { title: 'Production', url: '/production', icon: Wrench, roles: ['editor', 'admin'] },
      { title: 'Publication', url: '/publication', icon: Globe, roles: ['editor','admin'] },
      
      // Admin-only items
      { title: 'System Settings', url: '/system-settings', icon: Settings, roles: ['admin'] },
      { title: 'External Integrations', url: '/external-integrations', icon: Settings, roles: ['admin'] },
      { title: 'Data Management', url: '/data-management', icon: Database, roles: ['admin'] },
      { title: 'Analytics', url: '/analytics', icon: BarChart3, roles: ['admin'] },
      { title: 'Check Requests', url: '/requests', icon: CheckSquare, roles: ['admin'] },
    ];

    const allItems = [...baseItems, ...roleSpecificItems];
    
    return allItems.filter(item => {
      if (userRole.is_admin) return item.roles.includes('admin');
      if (userRole.is_editor) return item.roles.includes('editor');
      if (userRole.is_reviewer) return item.roles.includes('reviewer');
      return item.roles.includes('author');
    });
  };

  const userNavItems = getNavItemsForRole();

  return (
    <Sidebar className="border-r border-sidebar-border fixed z-30 rounded-sm ">
      <SidebarHeader className="border-sidebar-border mt-[-35px] bg-[#FBE5B6] ">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <img 
            src={icon} 
            alt="ijsds_icon" 
            className={open ? 'w-50 h-auto' : 'w-8 h-8'} 
          />
        </div>
      </SidebarHeader>

      <SidebarContent className='mt-[-45px] border-t bg-[#FBE5B6] '>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.url)}
                    className="w-full justify-start"
                  >
                    <button onClick={() => navigate(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {open && <span className="ml-2">{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <>
            <SidebarSeparator />
            <SidebarGroup >
              <SidebarGroupLabel>User Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={isActive(item.url)}
                        className="w-full justify-start"
                      >
                        <button onClick={() => navigate(item.url)}>
                          <item.icon className="h-4 w-4" />
                          {open && <span className="ml-2">{item.title}</span>}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 bg-[#FBE5B6]">
        <div className="flex items-center gap-2 mb-1">
          <HelpSystem />
          {user && <NotificationBell />}
        </div>
          <div className='mb-2'>
            <p>ISSN: <span className='font-semibold'>3115-6940</span></p>
            <p>eISSN: <span className='font-semibold'>3115-6932</span></p>
            <p>Date: <span className='font-semibold'>3th of October, 2025</span></p>
          </div>
        
        {loading ? (
          <div className="h-10 w-full bg-sidebar-accent animate-pulse rounded" />
        ) : user ? (
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            {open && <span className="ml-2">Sign Out</span>}
          </Button>
        ) : (
          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="w-full justify-start"
            >
              <User className="h-4 w-4" />
              {open && <span className="ml-2">Sign In</span>}
            </Button>
            <Button 
              onClick={() => navigate('/auth?mode=signup')}
              className="w-full justify-start"
            >
              <User className="h-4 w-4" />
              {open && <span className="ml-2">Sign Up</span>}
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};