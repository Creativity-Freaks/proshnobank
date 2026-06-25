import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, BookOpen, Award, BarChart3, Download, FileText, RefreshCw, Filter, Target, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalyticsData {
  totalQuestions: number;
  totalUsers: number;
  totalAttempts: number;
  totalCategories: number;
  totalSubjects: number;
  totalTemplates: number;
  avgAccuracyPct: number;
  weekAttempts: number;
  subjectBreakdown: { name: string; questions: number; attempts: number }[];
  difficultyBreakdown: { name: string; value: number }[];
  categoryBreakdown: { name: string; questions: number }[];
  scoreBandBreakdown: { name: string; value: number }[];
  dailyAttempts: { date: string; count: number }[];
}

// ─── Filters ──────────────────────────────────────────────────────────────────
interface Filters {
  dateRange: "7d" | "30d" | "90d" | "all";
  category: string;
  difficulty: string;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "সহজ", medium: "মধ্যম", hard: "কঠিন",
};

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

export default function AdminAnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState<Filters>({ dateRange: "30d", category: "all", difficulty: "all" });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  // ── Fetch categories for filter dropdown ──────────────────────────────────
  useEffect(() => {
    supabase.from("exam_categories").select("id, name").is("parent_id", null).order("sort_order")
      .then(({ data: cats }) => setCategories(cats || []));
  }, []);

  // ── Main data fetch ───────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const dateFrom = filters.dateRange === "7d"
        ? new Date(now.getTime() - 7 * 86400000).toISOString()
        : filters.dateRange === "30d"
        ? new Date(now.getTime() - 30 * 86400000).toISOString()
        : filters.dateRange === "90d"
        ? new Date(now.getTime() - 90 * 86400000).toISOString()
        : null;

      // Build attempts query
      let attemptsQ = supabase.from("exam_attempts")
        .select("user_id, subject, score, max_score, correct_answers, total_questions, created_at")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (dateFrom) attemptsQ = attemptsQ.gte("created_at", dateFrom);

      // Build questions query
      let questionsQ = supabase.from("question_bank").select("subject, difficulty, category_id");
      if (filters.category !== "all") questionsQ = questionsQ.eq("category_id", filters.category);
      if (filters.difficulty !== "all") questionsQ = questionsQ.eq("difficulty", filters.difficulty);

      const [
        attemptsRes, questionsRes, categoriesCountRes, subjectsCountRes,
        templatesCountRes, userRolesRes,
      ] = await Promise.all([
        attemptsQ,
        questionsQ,
        supabase.from("exam_categories").select("id", { count: "exact", head: true }),
        supabase.from("subjects").select("id", { count: "exact", head: true }),
        supabase.from("exam_templates").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("user_id").limit(2000),
      ]);

      const attempts = attemptsRes.data || [];
      const questions = questionsRes.data || [];
      const uniqueUsers = new Set((userRolesRes.data || []).map((r: any) => r.user_id));
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

      // Subject breakdown
      const subjectQMap: Record<string, number> = {};
      const subjectAMap: Record<string, number> = {};
      questions.forEach((q: any) => { subjectQMap[q.subject] = (subjectQMap[q.subject] || 0) + 1; });
      attempts.forEach(a => { subjectAMap[a.subject] = (subjectAMap[a.subject] || 0) + 1; });
      const allSubjectKeys = Array.from(new Set([...Object.keys(subjectQMap), ...Object.keys(subjectAMap)]));
      const subjectBreakdown = allSubjectKeys
        .map(k => ({ name: k, questions: subjectQMap[k] || 0, attempts: subjectAMap[k] || 0 }))
        .sort((a, b) => b.questions - a.questions).slice(0, 8);

      // Difficulty breakdown
      const diffMap: Record<string, number> = {};
      questions.forEach((q: any) => { diffMap[q.difficulty] = (diffMap[q.difficulty] || 0) + 1; });
      const difficultyBreakdown = Object.entries(diffMap).map(([k, v]) => ({
        name: DIFFICULTY_LABELS[k] || k, value: v,
      }));

      // Category questions
      const catMap: Record<string, number> = {};
      const catIdToName: Record<string, string> = {};
      categories.forEach(c => { catIdToName[c.id] = c.name; });
      questions.forEach((q: any) => {
        const n = catIdToName[q.category_id] || q.category_id || "অজানা";
        catMap[n] = (catMap[n] || 0) + 1;
      });
      const categoryBreakdown = Object.entries(catMap).map(([name, questions]) => ({ name, questions })).sort((a, b) => b.questions - a.questions);

      // Score band
      const bands: Record<string, number> = { "৮০%+": 0, "৬০-৮০%": 0, "৪০-৬০%": 0, "৪০%-এর নিচে": 0 };
      attempts.forEach(a => {
        const pct = a.max_score > 0 ? (a.score / a.max_score) * 100 : 0;
        if (pct >= 80) bands["৮০%+"]++;
        else if (pct >= 60) bands["৬০-৮০%"]++;
        else if (pct >= 40) bands["৪০-৬০%"]++;
        else bands["৪০%-এর নিচে"]++;
      });
      const scoreBandBreakdown = Object.entries(bands).map(([name, value]) => ({ name, value }));

      // Daily attempts (last 14 days)
      const dailyMap: Record<string, number> = {};
      const days = filters.dateRange === "7d" ? 7 : filters.dateRange === "30d" ? 30 : 14;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        dailyMap[d.toISOString().slice(0, 10)] = 0;
      }
      attempts.forEach(a => {
        const day = a.created_at.slice(0, 10);
        if (day in dailyMap) dailyMap[day]++;
      });
      const dailyAttempts = Object.entries(dailyMap).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("bn-BD", { month: "short", day: "numeric" }),
        count,
      }));

      // Accuracy
      const totalCorrect = attempts.reduce((s, a) => s + (a.correct_answers || 0), 0);
      const totalQ = attempts.reduce((s, a) => s + (a.total_questions || 0), 0);

      setData({
        totalQuestions: questions.length,
        totalUsers: uniqueUsers.size,
        totalAttempts: attempts.length,
        totalCategories: categoriesCountRes.count || 0,
        totalSubjects: subjectsCountRes.count || 0,
        totalTemplates: templatesCountRes.count || 0,
        avgAccuracyPct: totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0,
        weekAttempts: attempts.filter(a => a.created_at >= weekAgo).length,
        subjectBreakdown,
        difficultyBreakdown,
        categoryBreakdown,
        scoreBandBreakdown,
        dailyAttempts,
      });
    } catch (err) {
      console.error("[v0] analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, categories]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── PDF Report Generator ──────────────────────────────────────────────────
  const generateReport = async () => {
    if (!data) return;
    setGenerating(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210;
      const H = 297;
      const margin = 15;

      // ── Cover / Header ──
      doc.setFillColor(37, 99, 235); // primary blue
      doc.rect(0, 0, W, 40, "F");

      // Logo
      try {
        const img = new Image();
        img.src = "/logo.png";
        await new Promise((res) => { img.onload = res; img.onerror = res; });
        doc.addImage(img, "PNG", margin, 8, 30, 24);
      } catch { /* logo optional */ }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("ProshnoBank", 52, 20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Bangladesh's Online Exam Platform", 52, 27);

      // Report title
      doc.setFontSize(11);
      doc.text(`Analytics Report  |  Generated: ${new Date().toLocaleDateString("en-GB")}`, 52, 34);

      // ── Filter info ──
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      const filterLabel = filters.dateRange === "7d" ? "Last 7 Days" : filters.dateRange === "30d" ? "Last 30 Days" : filters.dateRange === "90d" ? "Last 90 Days" : "All Time";
      doc.text(`Period: ${filterLabel}   |   Category: ${filters.category === "all" ? "All" : categories.find(c => c.id === filters.category)?.name || filters.category}   |   Difficulty: ${filters.difficulty === "all" ? "All" : DIFFICULTY_LABELS[filters.difficulty] || filters.difficulty}`, margin, 48);

      // ── KPI grid ──
      const kpis = [
        { label: "Total Questions", value: data.totalQuestions },
        { label: "Total Users", value: data.totalUsers },
        { label: "Total Attempts", value: data.totalAttempts },
        { label: "Avg Accuracy", value: `${data.avgAccuracyPct}%` },
        { label: "Categories", value: data.totalCategories },
        { label: "Subjects", value: data.totalSubjects },
      ];

      const kpiCols = 3;
      const kpiW = (W - margin * 2) / kpiCols;
      const kpiStartY = 54;

      kpis.forEach((kpi, i) => {
        const col = i % kpiCols;
        const row = Math.floor(i / kpiCols);
        const x = margin + col * kpiW;
        const y = kpiStartY + row * 22;

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x + 1, y, kpiW - 2, 19, 2, 2, "F");
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x + 1, y, kpiW - 2, 19, 2, 2, "S");

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.text(kpi.label, x + 5, y + 7);

        doc.setTextColor(37, 99, 235);
        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");
        doc.text(String(kpi.value), x + 5, y + 15);
      });

      let yPos = kpiStartY + 2 * 22 + 8;

      // ── Subject breakdown table ──
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Subject Breakdown", margin, yPos);
      yPos += 6;

      // Table header
      doc.setFillColor(37, 99, 235);
      doc.rect(margin, yPos, W - margin * 2, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Subject", margin + 3, yPos + 4.5);
      doc.text("Questions", margin + 80, yPos + 4.5);
      doc.text("Attempts", margin + 120, yPos + 4.5);
      doc.text("Share", margin + 155, yPos + 4.5);
      yPos += 7;

      const totalQ2 = data.subjectBreakdown.reduce((s, r) => s + r.questions, 0) || 1;
      data.subjectBreakdown.forEach((row, i) => {
        const bg = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.rect(margin, yPos, W - margin * 2, 7, "F");

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(row.name.length > 30 ? row.name.slice(0, 28) + "…" : row.name, margin + 3, yPos + 4.5);
        doc.text(String(row.questions), margin + 80, yPos + 4.5);
        doc.text(String(row.attempts), margin + 120, yPos + 4.5);
        doc.text(`${Math.round((row.questions / totalQ2) * 100)}%`, margin + 155, yPos + 4.5);

        // Progress bar
        const barW = 25 * (row.questions / Math.max(...data.subjectBreakdown.map(s => s.questions), 1));
        doc.setFillColor(37, 99, 235);
        doc.rect(margin + 167, yPos + 2, barW, 3, "F");

        yPos += 7;
        if (yPos > H - 40) {
          doc.addPage();
          yPos = 20;
        }
      });

      yPos += 8;

      // ── Difficulty breakdown table ──
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Question Difficulty Distribution", margin, yPos);
      yPos += 6;

      doc.setFillColor(37, 99, 235);
      doc.rect(margin, yPos, W - margin * 2, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Difficulty", margin + 3, yPos + 4.5);
      doc.text("Count", margin + 80, yPos + 4.5);
      doc.text("Percentage", margin + 120, yPos + 4.5);
      yPos += 7;

      const totalDiff = data.difficultyBreakdown.reduce((s, r) => s + r.value, 0) || 1;
      data.difficultyBreakdown.forEach((row, i) => {
        const bg = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.rect(margin, yPos, W - margin * 2, 7, "F");
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(row.name, margin + 3, yPos + 4.5);
        doc.text(String(row.value), margin + 80, yPos + 4.5);
        doc.text(`${Math.round((row.value / totalDiff) * 100)}%`, margin + 120, yPos + 4.5);
        yPos += 7;
      });

      yPos += 8;

      // ── Score bands ──
      if (data.totalAttempts > 0) {
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Score Band Distribution", margin, yPos);
        yPos += 6;

        doc.setFillColor(37, 99, 235);
        doc.rect(margin, yPos, W - margin * 2, 7, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Score Range", margin + 3, yPos + 4.5);
        doc.text("Students", margin + 80, yPos + 4.5);
        doc.text("Percentage", margin + 120, yPos + 4.5);
        yPos += 7;

        data.scoreBandBreakdown.forEach((row, i) => {
          const bg = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
          doc.setFillColor(bg[0], bg[1], bg[2]);
          doc.rect(margin, yPos, W - margin * 2, 7, "F");
          doc.setTextColor(30, 41, 59);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(row.name, margin + 3, yPos + 4.5);
          doc.text(String(row.value), margin + 80, yPos + 4.5);
          doc.text(`${data.totalAttempts > 0 ? Math.round((row.value / data.totalAttempts) * 100) : 0}%`, margin + 120, yPos + 4.5);
          yPos += 7;
        });
      }

      // ── Footer ──
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, H - 12, W, 12, "F");
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.text("ProshnoBank — Confidential Report", margin, H - 5);
        doc.text(`Page ${p} of ${pageCount}`, W - margin - 20, H - 5);
        doc.text(`Generated: ${new Date().toLocaleString("en-GB")}`, W / 2 - 20, H - 5);
      }

      const fileName = `ProshnoBank_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("[v0] PDF generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "মোট প্রশ্ন", value: data?.totalQuestions ?? 0, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
    { label: "মোট ব্যবহারকারী", value: data?.totalUsers ?? 0, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
    { label: "মোট পরীক্ষা", value: data?.totalAttempts ?? 0, icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/40" },
    { label: "গড় নির্ভুলতা", value: `${data?.avgAccuracyPct ?? 0}%`, icon: Target, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
    { label: "ক্যাটেগরি", value: data?.totalCategories ?? 0, icon: Activity, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950/40" },
    { label: "বিষয়", value: data?.totalSubjects ?? 0, icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950/40" },
  ];

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">বিশ্লেষণ ও প্রতিবেদন</h2>
          <p className="text-muted-foreground text-sm mt-0.5">পরীক্ষা কার্যক্রমের বিস্তারিত পরিসংখ্যান ও রিপোর্ট</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            রিফ্রেশ
          </Button>
          <Button size="sm" onClick={generateReport} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            PDF রিপোর্ট ডাউনলোড
          </Button>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              ফিল্টার:
            </div>
            {/* Date Range */}
            <select
              value={filters.dateRange}
              onChange={e => setFilters(f => ({ ...f, dateRange: e.target.value as Filters["dateRange"] }))}
              className="px-3 py-1.5 rounded-md border border-input bg-background text-sm text-foreground"
            >
              <option value="7d">গত ৭ দিন</option>
              <option value="30d">গত ৩০ দিন</option>
              <option value="90d">গত ৯০ দিন</option>
              <option value="all">সব সময়</option>
            </select>
            {/* Category */}
            <select
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
              className="px-3 py-1.5 rounded-md border border-input bg-background text-sm text-foreground"
            >
              <option value="all">সব ক্যাটেগরি</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {/* Difficulty */}
            <select
              value={filters.difficulty}
              onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))}
              className="px-3 py-1.5 rounded-md border border-input bg-background text-sm text-foreground"
            >
              <option value="all">সব কঠিনতা</option>
              {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            {(filters.dateRange !== "30d" || filters.category !== "all" || filters.difficulty !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => setFilters({ dateRange: "30d", category: "all", difficulty: "all" })}>
                রিসেট
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`h-9 w-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-4.5 w-4.5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Charts Row 1: Daily Activity + Score Distribution ─────────── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Daily Attempts Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              দৈনিক পরীক্ষার কার্যকলাপ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.dailyAttempts || []).every(d => d.count === 0) ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">এই সময়সীমায় কোনো পরীক্ষা হয়নি</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data?.dailyAttempts || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="পরীক্ষা" stroke="#2563eb" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Score Band Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              স্কোর বিতরণ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.totalAttempts === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">কোনো পরীক্ষার ডেটা নেই</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={data?.scoreBandBreakdown || []} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {(data?.scoreBandBreakdown || []).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-1">
                  {(data?.scoreBandBreakdown || []).map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-muted-foreground">{b.name}</span>
                      </div>
                      <span className="font-medium">{b.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row 2: Subject breakdown + Difficulty ──────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Subject Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              বিষয়ভিত্তিক প্রশ্ন ও পরীক্ষার সংখ্যা
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.subjectBreakdown || []).length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">কোনো ডেটা নেই</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.subjectBreakdown || []} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="questions" name="প্রশ্ন" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attempts" name="পরীক্ষা" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Difficulty Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              প্রশ্নের কঠিনতার স্তর
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.difficultyBreakdown || []).length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">কোনো ডেটা নেই</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={data?.difficultyBreakdown || []} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value">
                      {(data?.difficultyBreakdown || []).map((_, i) => (
                        <Cell key={i} fill={["#10b981", "#f59e0b", "#ef4444"][i % 3]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-1">
                  {(data?.difficultyBreakdown || []).map((d, i) => {
                    const colors = ["#10b981", "#f59e0b", "#ef4444"];
                    const total = (data?.difficultyBreakdown || []).reduce((s, r) => s + r.value, 0);
                    return (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i % 3] }} />
                          <span className="text-muted-foreground">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{d.value}</span>
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Category Questions Bar ─────────────────────────────────────── */}
      {(data?.categoryBreakdown || []).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              ক্যাটেগরিভিত্তিক প্রশ্নের সংখ্যা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data?.categoryBreakdown || []} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={110} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="questions" name="প্রশ্ন" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* ── Summary card ─────────────────────────────────────────────── */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{data?.weekAttempts ?? 0}</p>
              <p className="text-sm opacity-80 mt-1">এই সপ্তাহে পরীক্ষা</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{data?.avgAccuracyPct ?? 0}%</p>
              <p className="text-sm opacity-80 mt-1">গড় নির্ভুলতা</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{data?.totalSubjects ?? 0}</p>
              <p className="text-sm opacity-80 mt-1">সক্রিয় বিষয়</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{data?.totalTemplates ?? 0}</p>
              <p className="text-sm opacity-80 mt-1">এক্সাম টেমপ্লেট</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
