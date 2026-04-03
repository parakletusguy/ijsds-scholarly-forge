import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { HelpSystem } from "@/components/help/HelpSystem";
import {
  User,
  LogOut,
  FileText,
  Search,
  Menu,
  X,
  ChevronDown,
  Zap,
  ShieldCheck,
  Globe,
  ArrowRight,
  Layers,
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
        title: "Registry Access Revoked",
        description: "Institutional session terminated successfully.",
      });
      navigate("/");
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Archive", path: "/articles" },
    { name: "About", path: "/about" },
    { name: "Partners", path: "/partners" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ── ISSN Top Bar ────────────────────────────────────────────────── */}
      <div className="bg-stone-900 text-stone-400 py-1.5 px-8 text-[10px] font-bold tracking-[0.2em] uppercase flex justify-between items-center">
        <div className="flex gap-6">
          <span>ISSN: 3115-6940</span>
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
        className={`bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 transition-all duration-500 ${isScrolled ? "py-3 shadow-lg" : "py-5"}`}
      >
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 group"
            >
              <img
                src={logo}
                alt="IJSDS Logo"
                className="h-9 w-auto group-hover:scale-105 transition-transform duration-500"
              />
            </button>

            <div className="hidden md:flex gap-8 items-center pt-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    isActive(link.path)
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-stone-500 hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Search className="w-5 h-5 text-stone-400 cursor-pointer hover:text-primary transition-colors hidden sm:block" />

            {loading ? (
              <div className="h-10 w-24 bg-stone-100 animate-pulse rounded" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-200 hover:border-primary transition-all group font-headline">
                    <User
                      size={16}
                      className="text-stone-400 group-hover:text-primary"
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-stone-600">
                      Dossier
                    </span>
                    <ChevronDown size={14} className="text-stone-300" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-3 bg-white border border-stone-200 shadow-2xl rounded-none"
                >
                  <div className="mb-3 px-1">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                      Authenticated Account
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
                    <LogOut size={14} /> Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/auth")}
                  className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-primary transition-colors px-4 py-2"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="bg-primary text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-primary-container transition-all shadow-lg shadow-primary/10"
                >
                  Sign Up
                </button>
              </div>
            )}

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
          <div className="md:hidden bg-white border-t border-stone-100 p-8 space-y-6 animate-in slide-in-from-top-10 duration-500">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-left text-sm font-bold uppercase tracking-widest py-3 border-b border-stone-50 ${isActive(link.path) ? "text-primary" : "text-stone-500"}`}
              >
                {link.name}
              </Link>
            ))}
            {!user && (
              <div className="pt-6 space-y-4">
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full text-center text-sm font-bold uppercase tracking-widest text-stone-500 py-4 border border-stone-200"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full bg-primary text-white py-4 text-sm font-bold uppercase tracking-widest"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

import { ArrowRight, Layers } from "lucide-react";
