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

interface NavItemDef {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  items: NavItemDef[];
}

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
  const publicNav: NavItemDef[] = [
    { title: "Scholarly Archive", url: "/articles", icon: Library },
    { title: "About the Journal", url: "/about", icon: BookMarked },
  ];

  const authorNav: NavItemDef[] = [
    { title: "Manuscript Management", url: "/dashboard", icon: FileText },
    { title: "Submit Research", url: "/submit", icon: PenTool },
    { title: "Edit Profile", url: "/profile", icon: User },
  ];

  const reviewerNav: NavItemDef[] = [
    { title: "Peer Review Status", url: "/reviewer-dashboard", icon: Eye },
  ];

  const editorNav: NavItemDef[] = [
    { title: "Editorial Desk", url: "/editorial", icon: FileCheck },
    { title: "Production", url: "/production", icon: Wrench },
    { title: "Publication", url: "/publication", icon: Globe },
    { title: "Manage Blogs", url: "/admin", icon: BookOpen },
  ];

  const adminNav: NavItemDef[] = [
    { title: "Institutional Registry", url: "/requests", icon: Building2 },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Data Management", url: "/data-management", icon: Database },
    { title: "System Settings", url: "/system-settings", icon: Settings },
    { title: "Integrations", url: "/external-integrations", icon: CheckSquare },
    { title: "Scholarly Archive", url: "/archive", icon: Archive },
  ];

  const buildNavSections = (): NavSection[] => {
    if (!user) return [{ label: "Public Access", items: publicNav }];

    const sections: NavSection[] = [];

    sections.push({ label: "Author Tools", items: authorNav });

    if (userRole.is_reviewer || userRole.is_editor || userRole.is_admin) {
      sections.push({ label: "Reviewer Hub", items: reviewerNav });
    }

    if (userRole.is_editor || userRole.is_admin) {
      sections.push({ label: "Editorial Board", items: editorNav });
    }

    if (userRole.is_admin) {
      sections.push({ label: "Administration", items: adminNav });
    }

    return sections;
  };

  const navSections = buildNavSections();

  // ── Item renderer ──────────────────────────────────────────────────────────
  const NavItemRender = ({ item }: { item: NavItemDef }) => {
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
              <img src="/Logo_Black_Edited-removebg-preview.png" alt="IJSDS Logo" className="h-20 w-auto object-contain max-w-[200px]" />
          ) : (
            <img src="/Logo%20Symbol.png" alt="IJSDS" className="h-8 w-auto object-contain" />
          )}
        </button>
      </SidebarHeader>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <SidebarContent className="bg-white px-0 py-4 overflow-x-hidden">
        <nav className="flex flex-col">
          {navSections.map((section, index) => (
            <div key={section.label} className={index > 0 ? "mt-4" : ""}>
              {open ? (
                <div className="px-6 mb-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    {section.label}
                  </span>
                </div>
              ) : (
                index > 0 && <div className="mx-4 my-3 border-t border-stone-100" />
              )}
              
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavItemRender key={item.url} item={item} />
                ))}
              </div>
            </div>
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
