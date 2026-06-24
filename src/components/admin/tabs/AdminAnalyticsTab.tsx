import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, BookOpen, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminAnalyticsTab() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all counts
      const [categories, subjects, questions, users, templates, exams] = await Promise.all([
        supabase.from("exam_categories").select("*", { count: "exact", head: true }),
        supabase.from("subjects").select("*", { count: "exact", head: true }),
        supabase.from("question_bank").select("*", { count: "exact", head: true }),
        supabase.from("user_profiles").select("*", { count: "exact", head: true }),
        supabase.from("exam_templates").select("*", { count: "exact", head: true }),
        supabase.from("exam_attempts").select("*", { count: "exact", head: true }),
      ]);

      // Fetch average score from exam_attempts
      const { data: attempts } = await supabase
        .from("exam_attempts")
        .select("score")
        .limit(1000);

      const avgScore = attempts && attempts.length > 0
        ? (attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length).toFixed(1)
        : 0;

      setAnalytics({
        categories: categories.count || 0,
        subjects: subjects.count || 0,
        questions: questions.count || 0,
        users: users.count || 0,
        templates: templates.count || 0,
        totalAttempts: exams.count || 0,
        avgScore: avgScore,
      });
    } catch (error) {
      console.error("[v0] Failed to fetch analytics:", error);
      setAnalytics({
        categories: 0,
        subjects: 0,
        questions: 0,
        users: 0,
        templates: 0,
        totalAttempts: 0,
        avgScore: 0,
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

  const analyticsCards = [
    { title: "মোট ক্যাটেগরি", value: analytics?.categories || 0, icon: TrendingUp },
    { title: "মোট বিষয়", value: analytics?.subjects || 0, icon: BookOpen },
    { title: "মোট প্রশ্ন", value: analytics?.questions || 0, icon: Award },
    { title: "মোট ব্যবহারকারী", value: analytics?.users || 0, icon: Users },
    { title: "মোট টেমপ্লেট", value: analytics?.templates || 0, icon: TrendingUp },
    { title: "মোট পরীক্ষা প্রচেষ্টা", value: analytics?.totalAttempts || 0, icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">বিশ্লেষণ এবং পরিসংখ্যান</h2>
        <p className="text-muted-foreground mt-1">প্রশ্নব্যাংক সিস্টেমের সম্পূর্ণ বিশ্লেষণাত্মক তথ্য</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-5 w-5 text-primary opacity-75" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>পরীক্ষার পারফরম্যান্স</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">গড় স্কোর</p>
              <p className="text-3xl font-bold text-primary">{analytics?.avgScore || 0}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">মোট প্রচেষ্টা</p>
              <p className="text-3xl font-bold text-primary">{analytics?.totalAttempts || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>সিস্টেম তথ্য</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">শেষ আপডেট:</span>
              <span className="font-medium">{new Date().toLocaleString("bn-BD")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">মোট কন্টেন্ট:</span>
              <span className="font-medium">{(analytics?.categories || 0) + (analytics?.subjects || 0) + (analytics?.questions || 0)} আইটেম</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
