import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  User,
  LogOut,
  FileText,
  Settings,
  BarChart3,
  Database,
  FileCheck,
  PenTool,
  Eye,
  Wrench,
  Globe,
  CheckSquare,
  Archive,
  Library,
  Building2,
  BookMarked,
  ChevronRight,
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { HelpSystem } from "@/components/help/HelpSystem";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "@/hooks/use-toast";

export const AppSidebar = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { open } = useSidebar();

  const userRole = {
    is_admin: profile?.is_admin ?? false,
    is_editor: profile?.is_editor ?? false,
    is_reviewer: profile?.is_reviewer ?? false,
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
      toast({ title: "Signed out successfully" });
      navigate("/");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // ── Nav definitions ────────────────────────────────────────────────────────
  const publicNav = [
    { title: "Scholarly Archive", url: "/articles", icon: Library },
    { title: "About the Journal", url: "/about", icon: BookMarked },
  ];

  const authorNav = [
    { title: "Manuscript Management", url: "/dashboard", icon: FileText },
    { title: "Submit Research", url: "/submit", icon: PenTool },
    { title: "Edit Profile", url: "/profile", icon: User },
  ];

  const reviewerNav = [
    { title: "Peer Review Status", url: "/reviewer-dashboard", icon: Eye },
  ];

  const editorNav = [
    { title: "Editorial Desk", url: "/editorial", icon: FileCheck },
    { title: "Production", url: "/production", icon: Wrench },
    { title: "Publication", url: "/publication", icon: Globe },
    { title: "Manage Blogs", url: "/admin", icon: BookOpen },
  ];

  const adminNav = [
    { title: "Institutional Registry", url: "/requests", icon: Building2 },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Data Management", url: "/data-management", icon: Database },
    { title: "System Settings", url: "/system-settings", icon: Settings },
    { title: "Integrations", url: "/external-integrations", icon: CheckSquare },
    { title: "Scholarly Archive", url: "/archive", icon: Archive },
  ];

  const buildNav = () => {
    if (!user) return publicNav;
    if (userRole.is_admin)
      return [...authorNav, ...reviewerNav, ...editorNav, ...adminNav];
    if (userRole.is_editor) return [...authorNav, ...reviewerNav, ...editorNav];
    if (userRole.is_reviewer) return [...authorNav, ...reviewerNav];
    return [...authorNav, ...publicNav];
  };

  const navItems = buildNav();

  // ── Item renderer ──────────────────────────────────────────────────────────
  const NavItem = ({
    item,
  }: {
    item: { title: string; url: string; icon: React.ElementType };
  }) => {
    const active = isActive(item.url);
    return (
      <button
        onClick={() => navigate(item.url)}
        className={`
          group relative flex items-center gap-3 w-full py-3 pr-4 text-sm font-medium
          transition-all duration-150 select-none
          ${open ? "pl-6" : "pl-4 justify-center"}
          ${
            active
              ? "text-primary bg-primary/5 border-l-2 border-primary"
              : "text-stone-500 hover:text-stone-800 hover:bg-stone-50 border-l-2 border-transparent"
          }
        `}
        title={!open ? item.title : undefined}
      >
        <item.icon
          className={`shrink-0 transition-colors ${active ? "text-primary" : "text-stone-400 group-hover:text-stone-600"}`}
          size={17}
        />
        {open && (
          <>
            <span className="flex-1 text-left truncate">{item.title}</span>
            {active && (
              <ChevronRight size={13} className="text-primary/50 shrink-0" />
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <Sidebar
      className="border-r border-stone-100 bg-white shadow-[2px_0_8px_rgba(0,0,0,0.04)]"
      style={{ borderLeft: "3px solid #1c1b1b" }}
    >
      {/* ── Brand ──────────────────────────────────────────────────────────── */}
      <SidebarHeader className="bg-white px-0 py-0 border-b border-stone-100">
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col w-full text-left transition-colors hover:bg-stone-50 ${open ? "px-6 pt-8 pb-6" : "px-4 pt-6 pb-5 items-center"}`}
        >
          {open ? (
            <>
              <span className="font-headline text-2xl font-bold text-stone-900 tracking-tight leading-none">
                IJSDS
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-stone-400 mt-2">
                Sovereign Design Systems
              </span>
            </>
          ) : (
            <span className="font-headline text-lg font-bold text-stone-900">
              IJ
            </span>
          )}
        </button>
      </SidebarHeader>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <SidebarContent className="bg-white px-0 py-4 overflow-x-hidden">
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavItem key={item.url} item={item} />
          ))}
        </nav>
      </SidebarContent>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <SidebarFooter className="bg-white border-t border-stone-100 px-0 py-0">
        {/* Notification + Help row */}
        <div
          className={`flex items-center gap-2 px-5 py-3 border-b border-stone-50 ${open ? "" : "justify-center"}`}
        >
          <HelpSystem />
          {user && <NotificationBell />}
        </div>

        {/* ISSN */}
        {open && (
          <div className="px-6 py-3 border-b border-stone-50">
            <p className="text-[10px] text-stone-400 font-medium">
              ISSN <span className="font-bold text-stone-600">3115-6940</span>
            </p>
            <p className="text-[10px] text-stone-400 font-medium">
              eISSN <span className="font-bold text-stone-600">3115-6932</span>
            </p>
          </div>
        )}

        {/* Auth action */}
        {loading ? (
          <div className="m-4 h-9 bg-stone-100 animate-pulse rounded" />
        ) : user ? (
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-3 w-full px-6 py-4 text-sm font-medium text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all border-l-2 border-transparent ${!open ? "justify-center px-4" : ""}`}
          >
            <LogOut size={16} className="shrink-0" />
            {open && <span>Sign Out</span>}
          </button>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className={`flex items-center gap-3 w-full px-6 py-4 text-sm font-medium text-primary hover:bg-primary/5 transition-all border-l-2 border-transparent ${!open ? "justify-center px-4" : ""}`}
          >
            <User size={16} className="shrink-0" />
            {open && <span>Sign In</span>}
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
