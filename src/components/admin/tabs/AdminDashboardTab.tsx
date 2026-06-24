import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2, Layers, FileText, BookOpen, Users,
  FilePenLine, CalendarClock, TrendingUp, Target,
  BarChart3, Activity, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  categories: number;
  subjects: number;
  questions: number;
  users: number;
  templates: number;
  batches: number;
  liveEvents: number;
  totalAttempts: number;
  avgAccuracy: number;
  recentAttempts: number;
  subjectBreakdown: { subject: string; count: number }[];
  recentActivity: { user_id: string; subject: string; score: number; max_score: number; created_at: string }[];
}

export default function AdminDashboardTab() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      const [
        categoriesRes, subjectsRes, questionsRes, templatesRes, batchesRes, liveEventsRes,
        attemptsRes, userRolesRes,
      ] = await Promise.all([
        supabase.from("exam_categories").select("id", { count: "exact", head: true }),
        supabase.from("subjects").select("id", { count: "exact", head: true }),
        supabase.from("question_bank").select("id", { count: "exact", head: true }),
        supabase.from("exam_templates").select("id", { count: "exact", head: true }),
        supabase.from("exam_batches").select("id", { count: "exact", head: true }),
        supabase.from("live_exam_events").select("id", { count: "exact", head: true }),
        supabase
          .from("exam_attempts")
          .select("user_id, subject, score, max_score, correct_answers, total_questions, created_at")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase.from("user_roles").select("user_id").limit(1000),
      ]);

      const attempts = attemptsRes.data || [];
      const uniqueUsers = new Set((userRolesRes.data || []).map((r: { user_id: string }) => r.user_id));
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const recentAttempts = attempts.filter(a => a.created_at >= weekAgo);

      const totalCorrect = attempts.reduce((s, a) => s + (a.correct_answers || 0), 0);
      const totalQ = attempts.reduce((s, a) => s + (a.total_questions || 0), 0);

      // Subject breakdown
      const subjectMap: Record<string, number> = {};
      attempts.forEach(a => {
        subjectMap[a.subject] = (subjectMap[a.subject] || 0) + 1;
      });
      const subjectBreakdown = Object.entries(subjectMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([subject, count]) => ({ subject, count }));

      setStats({
        categories: categoriesRes.count || 0,
        subjects: subjectsRes.count || 0,
        questions: questionsRes.count || 0,
        users: uniqueUsers.size,
        templates: templatesRes.count || 0,
        batches: batchesRes.count || 0,
        liveEvents: liveEventsRes.count || 0,
        totalAttempts: attempts.length,
        avgAccuracy: totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0,
        recentAttempts: recentAttempts.length,
        subjectBreakdown,
        recentActivity: attempts.slice(0, 8),
      });
      setLastRefresh(new Date());
    } catch (error) {
      console.error("[v0] Admin dashboard stats error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { title: "মোট প্রশ্ন", value: stats?.questions ?? 0, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "মোট পরীক্ষার্থী", value: stats?.users ?? 0, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "মোট পরীক্ষা দেওয়া", value: stats?.totalAttempts ?? 0, icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50" },
    { title: "গড় নির্ভুলতা", value: `${stats?.avgAccuracy ?? 0}%`, icon: Target, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "এক্সাম টেমপ্লেট", value: stats?.templates ?? 0, icon: FilePenLine, color: "text-sky-600", bg: "bg-sky-50" },
    { title: "মোট ব্যাচ", value: stats?.batches ?? 0, icon: Layers, color: "text-pink-600", bg: "bg-pink-50" },
    { title: "ক্যাটেগরি", value: stats?.categories ?? 0, icon: Layers, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "লাইভ ইভেন্ট", value: stats?.liveEvents ?? 0, icon: CalendarClock, color: "text-red-600", bg: "bg-red-50" },
  ];

  const subjectLabels: Record<string, string> = {
    bangla: "বাংলা", english: "ইংরেজি", math: "গণিত",
    physics: "পদার্থ", chemistry: "রসায়ন", biology: "জীববিজ্ঞান",
    gk: "সাধারণ জ্ঞান", ict: "ICT", science: "বিজ্ঞান",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            সর্বশেষ আপডেট: {lastRefresh.toLocaleTimeString("bn-BD")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          রিফ্রেশ
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subject Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              বিষয়ভিত্তিক পরীক্ষার সংখ্যা
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.subjectBreakdown || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">কোনো ডেটা নেই</p>
            ) : (
              <div className="space-y-3">
                {(stats?.subjectBreakdown || []).map((s, i) => {
                  const maxCount = stats!.subjectBreakdown[0].count;
                  const pct = Math.round((s.count / maxCount) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{subjectLabels[s.subject] || s.subject}</span>
                        <span className="text-muted-foreground">{s.count}টি</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              সাম্প্রতিক পরীক্ষা ({stats?.recentAttempts ?? 0} এই সপ্তাহে)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.recentActivity || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">এখনো কোনো পরীক্ষা হয়নি</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(stats?.recentActivity || []).map((a, i) => {
                  const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 text-sm">
                      <div>
                        <p className="font-medium">{subjectLabels[a.subject] || a.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString("bn-BD")}
                        </p>
                      </div>
                      <Badge
                        className={
                          pct >= 80 ? "bg-emerald-100 text-emerald-700" :
                          pct >= 50 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }
                      >
                        {a.score}/{a.max_score} ({pct}%)
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              সাত দিনের সারসংক্ষেপ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-3xl font-bold text-primary">{stats?.recentAttempts ?? 0}</p>
                <p className="text-sm text-muted-foreground mt-1">এই সপ্তাহে পরীক্ষা</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-3xl font-bold text-primary">{stats?.avgAccuracy ?? 0}%</p>
                <p className="text-sm text-muted-foreground mt-1">গড় নির্ভুলতা</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-3xl font-bold text-primary">{stats?.subjects ?? 0}</p>
                <p className="text-sm text-muted-foreground mt-1">সক্রিয় বিষয়</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
