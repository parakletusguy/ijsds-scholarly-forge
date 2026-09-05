import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Zap,
  ShieldCheck,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import logo from "/public/Logo_Black_Edited-removebg-preview.png";

export const Header = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu before navigating, so it never lingers after a tap.
  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      navigate("/");
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
    { name: "Editorial Board", path: "/editorial-board" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
    { name: "Open Access", path: "/openAccess" },
    { name: "Indexing", path: "/indexing" },
    { name: "Partners", path: "/partners" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ── ISSN Top Bar ────────────────────────────────────────────────── */}
      <div className="bg-stone-900 text-stone-400 py-1.5 px-4 sm:px-6 lg:px-8 text-[11px] md:text-[10px] font-bold tracking-[0.15em] uppercase flex justify-between items-center w-full overflow-hidden">
        <div className="flex gap-4 md:gap-6 items-center">
          <span>ISSN: 3115-6940</span>
          <span className="hidden xs:inline text-[9px] md:text-[10px] opacity-40">|</span>
          <span>eISSN: 3115-6932</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Globe size={10} className="text-primary" /> Global Open Access
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={10} className="text-primary" /> Peer Reviewed
          </span>
        </div>
      </div>

      {/* ── Main Navigation ──────────────────────────────────────────────── */}
      <nav
        className={`bg-white/90 backdrop-blur-md transition-all duration-700 w-full ${isScrolled ? "py-0.5 shadow-sm" : "py-1"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center w-full">
          <div className="flex items-center gap-3 sm:gap-4 xl:gap-8 min-w-0">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 group shrink-0"
            >
              <img
                src={logo}
                alt="IJSDS Logo"
                className="w-36 sm:w-44 xl:w-52 h-auto object-contain -my-2 sm:-my-3 lg:-my-5 -ml-1 group-hover:scale-[1.02] transition-transform duration-500 shrink-0"
              />
            </button>

            <div className="hidden xl:flex gap-3 2xl:gap-5 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[10px] xl:text-[11px] font-medium uppercase tracking-[0.1em] 2xl:tracking-[0.18em] transition-all duration-300 whitespace-nowrap ${
                    isActive(link.path)
                      ? "text-primary border-b border-primary/40 pb-0.5 font-bold"
                      : "text-stone-400 hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">

            {loading ? (
              <div className="h-10 w-24 bg-stone-100 animate-pulse rounded" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-stone-50 border border-stone-200 hover:border-primary transition-all group font-headline whitespace-nowrap">
                    <User
                      size={16}
                      className="text-stone-400 group-hover:text-primary"
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-stone-600">
                      My Account
                    </span>
                    <ChevronDown size={14} className="text-stone-300" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-3 bg-white border border-stone-200 shadow-sm rounded-none"
                >
                  <div className="mb-3 px-1">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                      Account Session
                    </p>
                    <p className="text-xs font-medium text-stone-900 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="h-px bg-stone-100 my-2" />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-3 p-3 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-stone-50 text-stone-600 focus:text-primary"
                  >
                    <Zap size={14} /> Main Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-3 p-3 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-stone-50 text-stone-600 focus:text-primary"
                  >
                    <User size={14} /> My Profile
                  </DropdownMenuItem>
                  <div className="h-px bg-stone-100 my-2" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-3 p-3 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-red-50 text-red-600"
                  >
                    <LogOut size={14} /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => navigate("/auth")}
                  className="text-[11px] font-bold uppercase tracking-wider text-stone-500 hover:text-primary transition-colors px-2 sm:px-3 py-1.5 whitespace-nowrap"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/auth?reason=submit")}
                  className="hidden sm:block bg-primary text-white px-3 sm:px-4 xl:px-6 py-2 xl:py-2.5 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md shadow-primary/10 border border-transparent whitespace-nowrap"
                >
                  Submit Manuscript
                </button>
              </div>
            ) }

            <button
              className="xl:hidden p-1.5 text-stone-900 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-stone-900" />
              ) : (
                <Menu size={24} className="text-stone-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop — tap anywhere to close */}
            <div
              className="xl:hidden fixed inset-0 top-0 bg-black/25 z-40"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="xl:hidden relative z-50 bg-white border-t border-stone-100 shadow-xl max-h-[calc(100vh-6rem)] overflow-y-auto animate-in slide-in-from-top-4 duration-300">
              <div className="p-6 space-y-6">
                {/* Account / auth — placed first so it is always visible */}
                {user ? (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 truncate mb-2 px-2">
                      {user.email}
                    </p>
                    <button
                      onClick={() => handleNav("/dashboard")}
                      className="w-full flex items-center gap-3 min-h-11 px-2 text-sm font-bold uppercase tracking-widest text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <Zap size={16} className="text-primary" /> Dashboard
                    </button>
                    <button
                      onClick={() => handleNav("/profile")}
                      className="w-full flex items-center gap-3 min-h-11 px-2 text-sm font-bold uppercase tracking-widest text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <User size={16} className="text-primary" /> Profile
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-3 min-h-11 px-2 text-sm font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleNav("/auth")}
                        className="min-h-12 text-[11px] font-bold uppercase tracking-widest text-stone-700 border border-stone-300 hover:border-primary hover:text-primary transition-colors"
                      >
                        Log In
                      </button>
                      <button
                        onClick={() => handleNav("/auth?mode=signup")}
                        className="min-h-12 text-[11px] font-bold uppercase tracking-widest bg-primary text-white hover:bg-[#7a2d11] transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                    <button
                      onClick={() => handleNav("/auth?reason=submit")}
                      className="w-full min-h-12 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors"
                    >
                      Submit Manuscript
                    </button>
                  </div>
                )}

                <div className="h-px bg-stone-100" />

                {/* Navigation links */}
                <nav className="flex flex-col">
                  {navLinks.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => handleNav(link.path)}
                      className={`w-full text-left min-h-11 px-2 text-sm font-bold uppercase tracking-widest border-b border-stone-50 transition-colors ${
                        isActive(link.path) ? "text-primary" : "text-stone-500 hover:text-primary"
                      }`}
                    >
                      {link.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
};
