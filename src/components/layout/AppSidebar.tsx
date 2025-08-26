import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';
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
import icon from "/WhatsApp_Image_2025-08-26_at_1.13.52_PM-removebg-preview.png";
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
    { title: 'About', url: '/about', icon: Info },
  ];

  const userNavItems = user ? [
    { title: 'Submit Article', url: '/submit', icon: PenTool },
    { title: 'Dashboard', url: '/dashboard', icon: FileText },
    { title: 'Editorial', url: '/editorial', icon: FileCheck },
    { title: 'Reviewer', url: '/reviewer-dashboard', icon: Eye },
    { title: 'Production', url: '/production', icon: Wrench },
    { title: 'Publication', url: '/publication', icon: Globe },
    { title: 'External Integrations', url: '/external-integrations', icon: Settings },
    { title: 'Data Management', url: '/data-management', icon: Database },
    { title: 'Analytics', url: '/analytics', icon: BarChart3 },
    { title: 'Edit Profile', url: '/profile', icon: User },
    { title: 'Check Requests', url: '/requests', icon: CheckSquare },
  ] : [];

  return (
    <Sidebar className="border-r border-sidebar-border fixed z-30 rounded-sm">
      <SidebarHeader className="border-sidebar-border mt-[-35px]">
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

      <SidebarContent className='mt-[-45px] border-t'>
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
            <SidebarGroup>
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

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <HelpSystem />
          {user && <NotificationBell />}
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