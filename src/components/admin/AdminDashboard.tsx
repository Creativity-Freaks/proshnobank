import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminCheck();
  const { currentTab, setCurrentTab } = useAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>("");

  useEffect(() => {
    if (!isCheckingAdmin && !isAdmin) {
      navigate("/admin/login", { replace: true });
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
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">প্রশ্নব্যাংক</h1>
            <p className="text-sm text-muted-foreground">আডমিন প্যানেল</p>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="text-sm">
              <p className="text-muted-foreground">Logged in as</p>
              <p className="font-medium text-foreground">{adminEmail}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
              <LogOut className="w-4 h-4" />
              লগ আউট
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as any)} className="w-full">
          {/* Tabs List */}
          <div className="overflow-x-auto border-b bg-card sticky top-16 z-30">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto border-0">
              <TabsTrigger value="dashboard" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                ড্যাশবোর্ড
              </TabsTrigger>
              <TabsTrigger value="categories" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                ক্যাটেগরি
              </TabsTrigger>
              <TabsTrigger value="subjects" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                বিষয়
              </TabsTrigger>
              <TabsTrigger value="questions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                প্রশ্ন
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                ব্যবহারকারী
              </TabsTrigger>
              <TabsTrigger value="templates" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                টেমপ্লেট
              </TabsTrigger>
              <TabsTrigger value="live-events" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                লাইভ ইভেন্ট
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                বিশ্লেষণ
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <div className="p-6">
            <TabsContent value="dashboard"><AdminDashboardTab /></TabsContent>
            <TabsContent value="categories"><AdminCategoriesTab /></TabsContent>
            <TabsContent value="subjects"><AdminSubjectsTab /></TabsContent>
            <TabsContent value="questions"><AdminQuestionsTab /></TabsContent>
            <TabsContent value="users"><AdminUsersTab /></TabsContent>
            <TabsContent value="templates"><AdminTemplatesTab /></TabsContent>
            <TabsContent value="live-events"><AdminLiveEventsTab /></TabsContent>
            <TabsContent value="analytics"><AdminAnalyticsTab /></TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background/95 p-4 z-40">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Logged in as {adminEmail}</p>
            <Button onClick={handleLogout} className="w-full gap-2">
              <LogOut className="w-4 h-4" />
              লগ আউট
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
