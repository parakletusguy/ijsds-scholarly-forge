import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { BookOpen, User, LogOut, FileText, Settings } from 'lucide-react';
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
    <header className="border-b border-border bg-background md:p-2">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">IJSDS</h1>
            <p className="text-sm text-muted-foreground">International Journal for Social Work and Development Studies</p>
          </div>
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
          {loading ? (
            <div className="h-10 w-20 bg-muted animate-pulse rounded" />
          ) : user ? (
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
          ) : (
            <div className="sm:space-x-2 my-3 sm:my-0">
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