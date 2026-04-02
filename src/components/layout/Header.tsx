import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { HelpSystem } from '@/components/help/HelpSystem';
import { User, LogOut, FileText, Search, Menu, X, ChevronDown, Zap, ShieldCheck, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export const Header = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Registry Access Revoked', description: 'Institutional session terminated successfully.' });
      navigate('/');
    }
  };

  const navLinks = [
    { name: 'Portal', path: '/' },
    { name: 'Archives', path: '/articles' },
    { name: 'Discourse', path: '/blog' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 font-headline ${isScrolled ? 'bg-white/90 backdrop-blur-xl py-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border-b border-border/10' : 'bg-transparent py-8'}`}>
      <div className="container mx-auto px-6 md:px-10 flex justify-between items-center max-w-screen-2xl">
        
        {/* Brand Identity — Premium Scholarly Logo */}
        <div 
          className="flex items-center gap-4 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
           <div className="relative">
              <span className={`text-3xl md:text-4xl font-black tracking-tighter uppercase transition-colors duration-500 ${isScrolled ? 'text-foreground' : 'text-foreground'}`}>
                IJSDS
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-500"></div>
           </div>
           <div className="hidden lg:flex flex-col border-l border-border/20 pl-4 py-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/30 italic leading-none mb-1">Scholarly Forge</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary leading-none">Initiative Afrique</span>
           </div>
        </div>

        {/* Desktop Navigation Ledgers */}
        <div className="hidden md:flex items-center gap-10">
           {navLinks.map((link) => (
             <button
               key={link.path}
               onClick={() => navigate(link.path)}
               className={`relative h-10 px-2 font-black text-[11px] uppercase tracking-[0.4em] transition-all duration-300 group ${isActive(link.path) ? 'text-primary' : 'text-foreground/40 hover:text-foreground'}`}
             >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-500 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
             </button>
           ))}
           {user && (
             <button
               onClick={() => navigate('/submit')}
               className={`relative h-10 px-2 font-black text-[11px] uppercase tracking-[0.4em] transition-all duration-300 group ${isActive('/submit') ? 'text-secondary' : 'text-foreground/40 hover:text-secondary'}`}
             >
                Registry
                <span className={`absolute bottom-0 left-0 h-0.5 bg-secondary transition-all duration-500 ${isActive('/submit') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
             </button>
           )}
        </div>

        {/* Protocol Control Center */}
        <div className="flex items-center gap-4 md:gap-8">
           {/* Global Search Node */}
           <div className="hidden lg:flex items-center bg-secondary/5 border border-border/10 px-6 py-2 group focus-within:border-primary/40 transition-all shadow-sm">
              <Search size={16} className="text-foreground/20 group-hover:text-primary transition-colors" />
              <input 
                className="bg-transparent border-none focus:ring-0 text-[11px] font-headline font-black uppercase tracking-widest w-24 xl:w-40 placeholder:text-foreground/10 ml-3" 
                placeholder="Search Archive" 
                type="text"
              />
           </div>

           <div className="flex items-center gap-4">
              <HelpSystem />
              {loading ? (
                <div className="h-12 w-12 rounded-none bg-muted animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-4">
                   <NotificationBell />
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <button className="h-12 px-6 bg-foreground text-white flex items-center justify-center gap-4 font-headline font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary transition-all shadow-xl group/acc">
                            <span className="hidden sm:inline">Dossier</span>
                            <User size={16} className="group-hover/acc:rotate-12 transition-transform" />
                            <ChevronDown size={14} className="opacity-40" />
                         </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 p-2 bg-white/95 backdrop-blur-xl border border-border/10 rounded-none shadow-[0_30px_60px_-10px_rgba(0,0,0,0.2)]">
                         <div className="p-4 border-b border-border/5 mb-2">
                            <p className="text-[9px] font-headline font-black uppercase tracking-[0.5em] text-foreground/20 italic mb-1">Authenticated Node</p>
                            <p className="text-xs font-headline font-black uppercase tracking-tight truncate text-primary">{user.email}</p>
                         </div>
                         {[
                           { name: 'Dashboard', path: '/dashboard', icon: Layers },
                           { name: 'Editorial Office', path: '/editorial', icon: ShieldCheck },
                           { name: 'Reviewer Node', path: '/reviewer-dashboard', icon: Zap },
                           { name: 'Profile Dossier', path: '/profile', icon: User },
                         ].map((item) => (
                           <DropdownMenuItem key={item.path} className="cursor-pointer p-4 hover:bg-secondary/5 rounded-none font-headline font-black uppercase text-[10px] tracking-widest group" onClick={() => navigate(item.path)}>
                              <item.icon size={14} className="mr-4 text-foreground/20 group-hover:text-primary transition-colors" /> {item.name}
                           </DropdownMenuItem>
                         ))}
                         <div className="h-px bg-border/5 my-2" />
                         <DropdownMenuItem className="cursor-pointer p-4 hover:bg-red-50 text-red-600 rounded-none font-headline font-black uppercase text-[10px] tracking-widest group" onClick={handleSignOut}>
                            <LogOut size={14} className="mr-4 group-hover:rotate-12 transition-transform" /> Revoke Access
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/auth')}
                  className="h-12 px-8 bg-primary text-white font-headline font-black text-[10px] uppercase tracking-[0.5em] hover:bg-foreground transition-all shadow-xl flex items-center justify-center group"
                >
                   Registry Access <ArrowRight size={14} className="ml-4 group-hover:translate-x-2 transition-transform" />
                </button>
              )}
           </div>

           {/* Mobile Menu Trigger */}
           <button 
             className="md:hidden h-12 w-12 bg-white border border-border/10 flex items-center justify-center text-foreground shadow-xl"
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
           >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </div>

      {/* Mobile Registry Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-border/10 shadow-[0_50px_100px_rgba(0,0,0,0.2)] p-8 space-y-8 animate-in fade-in slide-in-from-top-4">
           {navLinks.map((link) => (
             <button
               key={link.path}
               onClick={() => {navigate(link.path); setMobileMenuOpen(false);}}
               className="w-full text-left font-black text-xs uppercase tracking-[0.5em] text-foreground/40 hover:text-primary transition-colors py-4 border-b border-border/5"
             >
                {link.name}
             </button>
           ))}
           {!user && (
             <button 
               onClick={() => navigate('/auth')}
               className="w-full h-16 bg-primary text-white font-headline font-black text-xs uppercase tracking-[0.5em] shadow-2xl"
             >
                Registry Access
             </button>
           )}
        </div>
      )}
    </nav>
  );
};
import { ArrowRight, Layers } from 'lucide-react';