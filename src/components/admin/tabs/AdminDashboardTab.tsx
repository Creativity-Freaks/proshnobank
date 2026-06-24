import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Layers, FileText, BookOpen, Users, FilePenLine, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboardTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all counts in parallel
      const [categories, subjects, questions, users, templates, batches, liveEvents] = await Promise.all([
        supabase.from("exam_categories").select("*", { count: "exact", head: true }),
        supabase.from("subjects").select("*", { count: "exact", head: true }),
        supabase.from("question_bank").select("*", { count: "exact", head: true }),
        supabase.from("user_profiles").select("*", { count: "exact", head: true }),
        supabase.from("exam_templates").select("*", { count: "exact", head: true }),
        supabase.from("exam_batches").select("*", { count: "exact", head: true }),
        supabase.from("live_exam_events").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        categories: categories.count || 0,
        subjects: subjects.count || 0,
        questions: questions.count || 0,
        users: users.count || 0,
        templates: templates.count || 0,
        batches: batches.count || 0,
        liveEvents: liveEvents.count || 0,
      });
    } catch (error) {
      console.error("[v0] Failed to fetch stats:", error);
      setStats({
        categories: 0,
        subjects: 0,
        questions: 0,
        users: 0,
        templates: 0,
        batches: 0,
        liveEvents: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { title: "মোট ক্যাটেগরি", value: stats?.categories || 0, icon: Layers, subtitle: "সিস্টেমে রয়েছে" },
    { title: "মোট বিষয়", value: stats?.subjects || 0, icon: FileText, subtitle: "সব ক্যাটেগরিতে" },
    { title: "মোট প্রশ্ন", value: stats?.questions || 0, icon: BookOpen, subtitle: "সব ধরনের" },
    { title: "মোট ব্যবহারকারী", value: stats?.users || 0, icon: Users, subtitle: "নিবন্ধিত ব্যবহারকারী" },
    { title: "সক্রিয় টেমপ্লেট", value: stats?.templates || 0, icon: FilePenLine, subtitle: "ব্যবহারযোগ্য" },
    { title: "মোট ব্যাচ", value: stats?.batches || 0, icon: Layers, subtitle: "পরীক্ষার ব্যাচ" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">স্বাগতম, প্রশাসক</h2>
        <p className="text-muted-foreground mt-1">আপনার প্রশ্নব্যাংক সিস্টেমের সম্পূর্ণ তথ্যবহুল ড্যাশবোর্ড</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-5 w-5 text-primary opacity-75" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-2">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            লাইভ পরীক্ষা ইভেন্ট
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-primary">{stats?.liveEvents || 0}</p>
            <p className="text-sm text-muted-foreground">সক্রিয় এবং আসন্ন ইভেন্ট</p>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                শেষ রিফ্রেশ: {new Date().toLocaleTimeString("bn-BD")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
