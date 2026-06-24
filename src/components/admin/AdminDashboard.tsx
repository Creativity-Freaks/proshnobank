import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut,
  Shield,
  LayoutDashboard,
  BarChart3,
  BookOpen,
  Layers,
  FileText,
  Users,
  FilePenLine,
  CalendarClock,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardTab from "./tabs/AdminDashboardTab";
import AdminCategoriesTab from "./tabs/AdminCategoriesTab";
import AdminSubjectsTab from "./tabs/AdminSubjectsTab";
import AdminQuestionsTab from "./tabs/AdminQuestionsTab";
import AdminUsersTab from "./tabs/AdminUsersTab";
import AdminTemplatesTab from "./tabs/AdminTemplatesTab";
import AdminLiveEventsTab from "./tabs/AdminLiveEventsTab";
import AdminAnalyticsTab from "./tabs/AdminAnalyticsTab";

const TAB_CONFIG = [
  { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { id: "analytics", label: "বিশ্লেষণ", icon: BarChart3 },
  { id: "questions", label: "প্রশ্ন", icon: BookOpen },
  { id: "categories", label: "ক্যাটেগরি", icon: Layers },
  { id: "subjects", label: "বিষয়", icon: FileText },
  { id: "users", label: "ব্যবহারকারী", icon: Users },
  { id: "templates", label: "টেমপ্লেট", icon: FilePenLine },
  { id: "live-events", label: "লাইভ ইভেন্ট", icon: CalendarClock },
];

const TAB_COMPONENTS = {
  dashboard: AdminDashboardTab,
  analytics: AdminAnalyticsTab,
  questions: AdminQuestionsTab,
  categories: AdminCategoriesTab,
  subjects: AdminSubjectsTab,
  users: AdminUsersTab,
  templates: AdminTemplatesTab,
  "live-events": AdminLiveEventsTab,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminCheck();
  const { currentTab, setCurrentTab } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const adminCheckCompleted = useRef(false);

  useEffect(() => {
    if (!isCheckingAdmin) {
      adminCheckCompleted.current = true;
      if (!isAdmin) {
        navigate("/admin/login", { replace: true });
      }
    }
  }, [isCheckingAdmin, isAdmin, navigate]);

  useEffect(() => {
    const getAdminEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminEmail(user.email || "Admin");
      }
    };
    getAdminEmail();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  if (adminCheckCompleted.current && !isAdmin) return null;

  const CurrentTabComponent = TAB_COMPONENTS[currentTab] || AdminDashboardTab;
  const currentTabLabel = TAB_CONFIG.find((tab) => tab.id === currentTab)?.label || "Dashboard";

  return (
    <div className="min-h-screen flex bg-muted/40 text-foreground font-bengali">
      {/* Left Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } shrink-0 border-r border-background/10 bg-foreground text-background transition-all duration-300 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-background/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2 font-semibold">
              <Shield className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm truncate">ProshnoBank Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-background hover:bg-background/10 ml-auto"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {sidebarOpen && (
            <p className="px-2 text-xs font-medium uppercase tracking-widest text-background/50 mb-3">
              Menu
            </p>
          )}
          <div className="space-y-1">
            {TAB_CONFIG.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size={sidebarOpen ? "default" : "icon"}
                  className={`w-full ${
                    sidebarOpen ? "justify-start" : "justify-center"
                  } ${
                    isActive
                      ? "bg-background/10 text-background"
                      : "text-background/80 hover:bg-background/10 hover:text-background"
                  }`}
                  onClick={() => setCurrentTab(tab.id as any)}
                  title={!sidebarOpen ? tab.label : ""}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${sidebarOpen ? "mr-2" : ""}`} />
                  {sidebarOpen && <span className="text-sm">{tab.label}</span>}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Logout Section */}
        <div className="border-t border-background/10 p-3">
          <Button
            variant="ghost"
            size={sidebarOpen ? "default" : "icon"}
            className={`w-full ${
              sidebarOpen ? "justify-start" : "justify-center"
            } text-background/80 hover:bg-background/10 hover:text-background`}
            onClick={handleLogout}
            title={!sidebarOpen ? "Logout" : ""}
          >
            <LogOut className={`h-4 w-4 flex-shrink-0 ${sidebarOpen ? "mr-2" : ""}`} />
            {sidebarOpen && <span className="text-sm">লগ আউট</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <div className="h-16 border-b border-background/10 bg-background flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-foreground">{currentTabLabel}</h1>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Admin: {adminEmail}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {CurrentTabComponent && <CurrentTabComponent />}
          </div>
        </div>
      </div>
    </div>
  );
}
