import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Download, RefreshCw, Banknote, Users, TrendingUp,
  CreditCard, BookOpen, BarChart3, Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface RevenueData {
  totalRevenue: number;
  subscriptionRevenue: number;
  batchRevenue: number;
  totalSubscribers: number;
  activeSubscribers: number;
  totalBatchEnrollments: number;
  planBreakdown: { name: string; count: number; revenue: number }[];
  batchBreakdown: { name: string; enrolled: number; revenue: number }[];
  monthlyRevenue: { month: string; subscription: number; batch: number; total: number }[];
  planTypeBreakdown: { name: string; value: number }[];
  statusBreakdown: { name: string; value: number }[];
}

interface Filters {
  dateRange: "7d" | "30d" | "90d" | "all";
  planType: string;
  status: string;
}

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
const MONTHS_BN = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্ট", "অক্টো", "নভে", "ডিসে"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">৳{Number(p.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
      <p style={{ color: d.payload.fill }} className="font-semibold">{d.name}</p>
      <p>সংখ্যা: <strong>{d.value}</strong></p>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function AdminRevenueTab() {
  const { toast } = useToast();
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState<Filters>({ dateRange: "30d", planType: "all", status: "all" });
  const [planTypes, setPlanTypes] = useState<{ id: string; name: string; plan_type: string }[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  // ── Load plan types for filter ────────────────────────────────────────────────
  useEffect(() => {
    supabase.from("subscription_plans").select("id, name, plan_type").order("sort_order")
      .then(({ data: plans }) => setPlanTypes(plans || []));
  }, []);

  // ── Fetch data ─────────────────────────────────────────────────────────────────
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

      // Subscriptions query
      let subQuery = supabase
        .from("user_subscriptions")
        .select("id, status, billing_cycle, started_at, plan_id, subscription_plans(id, name, plan_type, price_monthly, price_yearly)");
      if (dateFrom) subQuery = subQuery.gte("started_at", dateFrom);
      if (filters.planType !== "all") subQuery = subQuery.eq("plan_id", filters.planType);
      if (filters.status !== "all") subQuery = subQuery.eq("status", filters.status);

      // Batch enrollments query
      let batchQuery = supabase
        .from("exam_batch_enrollments")
        .select("id, status, created_at, batch_id, exam_batches(id, title, price)");
      if (dateFrom) batchQuery = batchQuery.gte("created_at", dateFrom);

      const [subRes, batchRes] = await Promise.all([subQuery, batchQuery]);

      const subs = (subRes.data || []) as any[];
      const enrollments = (batchRes.data || []) as any[];

      // ── Subscription revenue ────────────────────────────────────────────────
      let subscriptionRevenue = 0;
      const planMap: Record<string, { name: string; count: number; revenue: number }> = {};

      subs.forEach(s => {
        const plan = s.subscription_plans;
        if (!plan) return;
        const price = s.billing_cycle === "yearly"
          ? Number(plan.price_yearly || 0)
          : Number(plan.price_monthly || 0);
        subscriptionRevenue += price;
        if (!planMap[plan.id]) planMap[plan.id] = { name: plan.name, count: 0, revenue: 0 };
        planMap[plan.id].count += 1;
        planMap[plan.id].revenue += price;
      });

      // ── Batch revenue ───────────────────────────────────────────────────────
      let batchRevenue = 0;
      const batchMap: Record<string, { name: string; enrolled: number; revenue: number }> = {};

      enrollments.forEach(e => {
        const batch = e.exam_batches;
        if (!batch) return;
        const price = Number(batch.price || 0);
        batchRevenue += price;
        if (!batchMap[batch.id]) batchMap[batch.id] = { name: batch.title, enrolled: 0, revenue: 0 };
        batchMap[batch.id].enrolled += 1;
        batchMap[batch.id].revenue += price;
      });

      // ── Monthly breakdown (last 6 months) ─────────────────────────────────
      const monthlyMap: Record<string, { subscription: number; batch: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap[key] = { subscription: 0, batch: 0 };
      }

      subs.forEach(s => {
        const d = new Date(s.started_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyMap[key]) {
          const plan = s.subscription_plans;
          const price = s.billing_cycle === "yearly"
            ? Number(plan?.price_yearly || 0)
            : Number(plan?.price_monthly || 0);
          monthlyMap[key].subscription += price;
        }
      });

      enrollments.forEach(e => {
        const d = new Date(e.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyMap[key]) {
          monthlyMap[key].batch += Number(e.exam_batches?.price || 0);
        }
      });

      const monthlyRevenue = Object.entries(monthlyMap).map(([key, val]) => {
        const [y, m] = key.split("-");
        return {
          month: MONTHS_BN[parseInt(m) - 1] + " " + y,
          subscription: val.subscription,
          batch: val.batch,
          total: val.subscription + val.batch,
        };
      });

      // ── Plan type distribution ─────────────────────────────────────────────
      const planTypeMap: Record<string, number> = {};
      subs.forEach(s => {
        const pt = s.subscription_plans?.plan_type || "unknown";
        planTypeMap[pt] = (planTypeMap[pt] || 0) + 1;
      });
      const planTypeBreakdown = Object.entries(planTypeMap).map(([k, v]) => ({
        name: planTypes.find(p => p.plan_type === k)?.name || k, value: v,
      }));

      // ── Status distribution ────────────────────────────────────────────────
      const statusMap: Record<string, number> = {};
      subs.forEach(s => { statusMap[s.status] = (statusMap[s.status] || 0) + 1; });
      const statusBreakdown = Object.entries(statusMap).map(([k, v]) => ({
        name: k === "active" ? "সক্রিয়" : k === "cancelled" ? "বাতিল" : k === "pending" ? "অপেক্ষমাণ" : k,
        value: v,
      }));

      setData({
        totalRevenue: subscriptionRevenue + batchRevenue,
        subscriptionRevenue,
        batchRevenue,
        totalSubscribers: subs.length,
        activeSubscribers: subs.filter(s => s.status === "active").length,
        totalBatchEnrollments: enrollments.length,
        planBreakdown: Object.values(planMap).sort((a, b) => b.revenue - a.revenue),
        batchBreakdown: Object.values(batchMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
        monthlyRevenue,
        planTypeBreakdown,
        statusBreakdown,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filters, planTypes, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── PDF Report Generator ──────────────────────────────────────────────────────
  const generatePDF = async () => {
    if (!data) return;
    setGenerating(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const {
        createReport, finalizePages,
        drawSectionHeading, drawKpiGrid, drawTable,
        BRAND, i18n,
      } = await import("@/lib/reportUtils");

      // Detect language from user's browser or localStorage
      const lang = (localStorage.getItem("appLanguage") ?? navigator.language.split("-")[0]) === "bn" ? "bn" : "en";
      const t = i18n[lang];

      const dateLabel =
        filters.dateRange === "7d"  ? (lang === "bn" ? "গত ৭ দিন" : "Last 7 Days") :
        filters.dateRange === "30d" ? (lang === "bn" ? "গত ৩০ দিন" : "Last 30 Days") :
        filters.dateRange === "90d" ? (lang === "bn" ? "গত ৯০ দিন" : "Last 90 Days") :
        (lang === "bn" ? "সর্বকালীন" : "All Time");
      const statusLabel =
        filters.status === "all"       ? t.all :
        filters.status === "active"    ? (lang === "bn" ? "সক্রিয়" : "Active") :
        filters.status === "cancelled" ? (lang === "bn" ? "বাতিল" : "Cancelled") :
        (lang === "bn" ? "অপেক্ষমাণ" : "Pending");
      const planLabel =
        filters.planType === "all"     ? t.all :
        filters.planType === "student" ? (lang === "bn" ? "স্টুডেন্ট" : "Student") :
        filters.planType === "teacher" ? (lang === "bn" ? "টিচার" : "Teacher") :
        (lang === "bn" ? "কোচিং" : "Coaching");

      const page = await createReport(
        jsPDF,
        t.revenue_title,
        t.revenue_subtitle,
        [
          { label: t.analytics_period, value: dateLabel },
          { label: t.revenue_plan,     value: planLabel  },
          { label: t.revenue_status,   value: statusLabel },
        ],
        lang,
      );

      // ── KPI Cards ────────────────────────────────────────────────────────
      drawSectionHeading(page, t.revenue_summary);
      drawKpiGrid(page, [
        { label: t.revenue_total,            value: `৳${data.totalRevenue.toLocaleString()}` },
        { label: t.revenue_subscription,   value: `৳${data.subscriptionRevenue.toLocaleString()}` },
        { label: t.revenue_batch,           value: `৳${data.batchRevenue.toLocaleString()}` },
        { label: t.revenue_total_subscribers,         value: String(data.totalSubscribers) },
        { label: t.revenue_active_subscribers,      value: String(data.activeSubscribers) },
        { label: t.revenue_batch_enrollments,   value: String(data.totalBatchEnrollments) },
      ]);

      // ── Plan Breakdown ────────────────────────────────────────────────────
      if (data.planBreakdown.length > 0) {
        drawSectionHeading(page, t.revenue_plan_breakdown);
        drawTable(page, [
          { header: lang === "bn" ? "প্ল্যানের নাম" : "Plan Name", key: "name",       width: 85 },
          { header: lang === "bn" ? "গ্রাহক" : "Subscribers",        key: "count",      width: 30, align: "right" },
          { header: lang === "bn" ? "আয় (৳)" : "Revenue (৳)",        key: "revenueStr", width: 40, align: "right" },
          { header: t.share,        key: "pct",        width: 25, align: "right" },
        ], data.planBreakdown.map(r => ({
          ...r,
          revenueStr: `৳${r.revenue.toLocaleString()}`,
          pct: data.subscriptionRevenue > 0
            ? `${Math.round((r.revenue / data.subscriptionRevenue) * 100)}%`
            : "০%",
        })));
      }

      // ── Batch Breakdown ───────────────────────────────────────────────────
      if (data.batchBreakdown.length > 0) {
        drawSectionHeading(page, t.revenue_batch_breakdown);
        drawTable(page, [
          { header: lang === "bn" ? "ব্যাচের নাম" : "Batch Name",    key: "name",       width: 90 },
          { header: lang === "bn" ? "এনরোল্ড" : "Enrolled",        key: "enrolled",   width: 25, align: "right" },
          { header: lang === "bn" ? "মূল্য (৳)" : "Price (৳)",       key: "priceStr",   width: 30, align: "right" },
          { header: lang === "bn" ? "মোট আয় (৳)" : "Total (৳)",     key: "revenueStr", width: 35, align: "right" },
        ], data.batchBreakdown.map(r => ({
          ...r,
          priceStr:   r.price != null ? `৳${r.price.toLocaleString()}` : "—",
          revenueStr: `৳${r.revenue.toLocaleString()}`,
        })), BRAND.teal as [number, number, number]);
      }

      // ── Monthly Trend ─────────────────────────────────────────────────────
      if (data.monthlyRevenue.length > 0) {
        drawSectionHeading(page, t.revenue_monthly_trend);
        drawTable(page, [
          { header: t.month,                  key: "month",    width: 55 },
          { header: lang === "bn" ? "সাবস্ক্রিপশন আয় (৳)" : "Subscription (৳)", key: "subStr",   width: 55, align: "right" },
          { header: lang === "bn" ? "ব্যাচ আয় (৳)" : "Batch (৳)",         key: "batchStr", width: 45, align: "right" },
          { header: lang === "bn" ? "মোট (৳)" : "Total (৳)",               key: "totalStr", width: 25, align: "right" },
        ], data.monthlyRevenue.map(r => ({
          ...r,
          subStr:   `৳${r.subscription.toLocaleString()}`,
          batchStr: `৳${r.batch.toLocaleString()}`,
          totalStr: `৳${(r.subscription + r.batch).toLocaleString()}`,
        })), BRAND.amber as [number, number, number]);
      }

      finalizePages(page.doc, lang);
      const fileName = `ProshnoBank_Revenue_${new Date().toISOString().slice(0, 10)}.pdf`;
      page.doc.save(fileName);
      const successMsg = lang === "bn" ? "রিপোর্ট তৈরি হয়েছে" : "Report generated";
      toast({ title: successMsg, description: fileName });
    } catch (err: any) {
      const errorMsg = lang === "bn" ? "PDF তৈরি করতে ব্যর্থ" : "Failed to generate PDF";
      toast({ title: "Error", description: errorMsg + ": " + err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const dateRangeOptions = [
    { value: "7d", label: "গত ৭ দিন" },
    { value: "30d", label: "গত ৩০ দিন" },
    { value: "90d", label: "গত ৯০ দিন" },
    { value: "all", label: "সর্বকালীন" },
  ];

  const statusOptions = [
    { value: "all", label: "সব স্ট্যাটাস" },
    { value: "active", label: "সক্রিয়" },
    { value: "cancelled", label: "বাতিল" },
    { value: "pending", label: "অপেক্ষমাণ" },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-muted-foreground mr-1">ফিল্টার:</span>

          {dateRangeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilters(f => ({ ...f, dateRange: opt.value as any }))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filters.dateRange === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {opt.label}
            </button>
          ))}

          <div className="w-px h-5 bg-border mx-1" />

          <select
            value={filters.planType}
            onChange={e => setFilters(f => ({ ...f, planType: e.target.value }))}
            className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm"
          >
            <option value="all">সব প্ল্যান</option>
            {planTypes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm"
          >
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {(filters.dateRange !== "30d" || filters.planType !== "all" || filters.status !== "all") && (
            <button
              onClick={() => setFilters({ dateRange: "30d", planType: "all", status: "all" })}
              className="px-3 py-1.5 rounded-lg text-sm text-destructive border border-destructive/30 hover:bg-destructive/10"
            >
              রিসেট
            </button>
          )}

          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-1" /> রিফ্রেশ
            </Button>
            <Button size="sm" onClick={generatePDF} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
              PDF রিপোর্ট
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "মোট আয়", value: `৳${data.totalRevenue.toLocaleString()}`, icon: Banknote, color: "text-primary" },
          { label: "সাবস্ক্রিপশন আয়", value: `৳${data.subscriptionRevenue.toLocaleString()}`, icon: CreditCard, color: "text-emerald-600" },
          { label: "ব্যাচ আয়", value: `৳${data.batchRevenue.toLocaleString()}`, icon: BookOpen, color: "text-amber-600" },
          { label: "মোট গ্রাহক", value: data.totalSubscribers, icon: Users, color: "text-sky-600" },
          { label: "সক্রিয় গ্রাহক", value: data.activeSubscribers, icon: TrendingUp, color: "text-violet-600" },
          { label: "ব্যাচ এনরোলমেন্ট", value: data.totalBatchEnrollments, icon: BarChart3, color: "text-rose-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div ref={reportRef}>
        {/* Monthly Revenue Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">মাসিক আয়ের গতিধারা</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.monthlyRevenue} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <defs>
                  <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="batchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="subscription" name="সাবস্ক্রিপশন" stroke="#2563eb" fill="url(#subGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="batch" name="ব্যাচ" stroke="#10b981" fill="url(#batchGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Plan distribution pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">প্ল্যান ধরন অনুযায়ী গ্রাহক</CardTitle>
            </CardHeader>
            <CardContent>
              {data.planTypeBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">কোনো ডেটা নেই</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.planTypeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine>
                      {data.planTypeBreakdown.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Status pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">সাবস্ক্রিপশন স্ট্যাটাস</CardTitle>
            </CardHeader>
            <CardContent>
              {data.statusBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">কোনো ডেটা নেই</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine>
                      {data.statusBreakdown.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Plan Revenue Bar */}
        {data.planBreakdown.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">প্ল্যান অনুযায়ী আয়</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.planBreakdown} margin={{ top: 4, right: 16, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `৳${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="আয়" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">প্ল্যানভিত্তিক বিস্তারিত</CardTitle>
            </CardHeader>
            <CardContent>
              {data.planBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">কোনো সাবস্ক্রিপশন নেই</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">প্ল্যান</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">গ্রাহক</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">আয়</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.planBreakdown.map(row => (
                        <tr key={row.name} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 font-medium">{row.name}</td>
                          <td className="py-2.5 text-right">{row.count}</td>
                          <td className="py-2.5 text-right font-semibold text-primary">৳{row.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Batch table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">ব্যাচভিত্তিক আয় (শীর্ষ ১০)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.batchBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">কোনো এনরোলমেন্ট নেই</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">ব্যাচ</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">এনরোল্ড</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">আয়</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.batchBreakdown.map(row => (
                        <tr key={row.name} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 font-medium truncate max-w-[160px]">{row.name}</td>
                          <td className="py-2.5 text-right">{row.enrolled}</td>
                          <td className="py-2.5 text-right font-semibold text-emerald-600">৳{row.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
