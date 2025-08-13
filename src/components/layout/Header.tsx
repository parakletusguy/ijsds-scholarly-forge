import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { HelpSystem } from '@/components/help/HelpSystem';
import { BookOpen, User, LogOut, FileText, Settings, BarChart3, Database } from 'lucide-react';
import icon from "../../../public/WhatsApp_Image_2025-08-12_at_1.50.31_PM-removebg-preview.png"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

export const Header = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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

  return (
    <header className="border-b border-border bg-background md:p-2 md:py-0">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          {/* <BookOpen className="h-8 w-8 text-primary" /> */}
          <img src={icon} alt="ijsds_icon" className='w-[100px] md:w-[150px] md:ml-[40px]'/> 
          {/* <div>
            <h1 className="text-2xl font-bold text-foreground">IJSDS</h1>
            <p className="text-sm text-muted-foreground">International Journal for Social Work and Development Studies</p>
          </div> */}
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Home
          </Button>
          <Button variant="ghost" onClick={() => navigate('/articles')}>
            Articles
          </Button>
          <Button variant="ghost" onClick={() => navigate('/about')}>
            About
          </Button>
          {user && (
            <Button variant="ghost" onClick={() => navigate('/submit')}>
              Submit Article
            </Button>
          )}
        </nav>

        <div className="flex items-center space-x-2">
            {/* <div className='hidden md:block'>
              <HelpSystem />
            </div> */}
              <HelpSystem />

          {loading ? (
            <div className="h-10 w-20 bg-muted animate-pulse rounded" />
          ) : user ? (
            <div className='flex flex-col items-center justify-center space-y-2'>
              {/* <div className='md:hidden'>
                <HelpSystem />
              </div> */}
            <div className="flex items-center gap-2">
              <NotificationBell />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/editorial')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Editorial
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/reviewer-dashboard')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Reviewer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/publication')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Publication
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/production')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Production
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/external-integrations')}>
                  <Settings className="h-4 w-4 mr-2" />
                  External Integrations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/data-management')}>
                  <Database className="h-4 w-4 mr-2" />
                  Data Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/analytics')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
            </div>
          ) : (
            <div className="sm:space-x-2 my-3 sm:my-0">
              {/* <div className='md:hidden'>
                <HelpSystem />
              </div> */}
              <Button variant="outline" className='my-2 sm:my-0' size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/auth?mode=signup')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};