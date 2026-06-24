import { useEffect, useState, useCallback } from "react";
import {
  Loader2, Search, UserPlus, RefreshCw, MoreHorizontal,
  ShieldOff, BookOpen, Mail, CheckCircle2, GraduationCap,
  CreditCard, Crown, ChevronDown, XCircle, Users, BarChart3,
  CalendarDays, Building2, Eye, Pencil, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { adminApi, SubscriptionPlan, UserSubscription } from "@/lib/admin/admin-api";
import { useAdmin } from "@/contexts/AdminContext";

type Teacher = {
  user_id: string;
  name: string;
  email: string;
  institution: string;
  avatar_url: string;
  created_at: string;
  is_suspended: boolean;
  question_count: number;
  subscription: UserSubscription | null;
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-slate-100 text-slate-700",
  student: "bg-blue-100 text-blue-700",
  teacher: "bg-violet-100 text-violet-700",
  premium: "bg-amber-100 text-amber-700",
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <CreditCard className="h-3.5 w-3.5" />,
  student: <BookOpen className="h-3.5 w-3.5" />,
  teacher: <GraduationCap className="h-3.5 w-3.5" />,
  premium: <Crown className="h-3.5 w-3.5" />,
};

function PlanBadge({ plan }: { plan: SubscriptionPlan | undefined | null }) {
  if (!plan) return <Badge variant="outline" className="text-xs gap-1">কোনো প্ল্যান নেই</Badge>;
  const colorClass = PLAN_COLORS[plan.plan_type] || "bg-slate-100 text-slate-700";
  return (
    <Badge className={`text-xs gap-1 border-0 ${colorClass}`}>
      {PLAN_ICONS[plan.plan_type]}
      {plan.name}
    </Badge>
  );
}

export default function AdminTeachersTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Detail/subscription dialog
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Create teacher dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "", email: "", password: "", institution: "",
  });

  // Assign plan dialog
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planTarget, setPlanTarget] = useState<Teacher | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedBilling, setSelectedBilling] = useState<"monthly" | "yearly">("monthly");
  const [assigningPlan, setAssigningPlan] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get all teacher role entries directly from Supabase (no admin edge function needed for read)
      let rolesQuery = supabase
        .from("user_roles")
        .select("user_id, created_at")
        .eq("role", "teacher");
      const { data: rolesData, error: rolesErr } = await rolesQuery;
      if (rolesErr) throw new Error(rolesErr.message);

      const teacherRoles = rolesData || [];

      // Fetch plans in parallel
      const fetchedPlans = await adminApi.getPlans();
      setPlans(fetchedPlans);

      if (teacherRoles.length === 0) {
        setTeachers([]);
        setLoading(false);
        return;
      }

      const userIds = teacherRoles.map((r: any) => r.user_id);

      // 2. Fetch profiles, question counts, and subscriptions in parallel
      const [profilesRes, qRes, subsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, institution, avatar_url, created_at, is_active")
          .in("id", userIds),
        supabase
          .from("question_bank")
          .select("created_by")
          .in("created_by", userIds),
        supabase
          .from("user_subscriptions")
          .select("*, plan:subscription_plans(*)")
          .in("user_id", userIds)
          .eq("status", "active"),
      ]);

      // Build lookup maps
      const profileMap: Record<string, any> = {};
      (profilesRes.data || []).forEach((p: any) => { profileMap[p.id] = p; });

      const countMap: Record<string, number> = {};
      (qRes.data || []).forEach((row: any) => {
        if (row.created_by) countMap[row.created_by] = (countMap[row.created_by] || 0) + 1;
      });

      const subMap: Record<string, UserSubscription> = {};
      (subsRes.data || []).forEach((s: any) => { subMap[s.user_id] = s; });

      // Apply search filter client-side
      const search = searchQuery.toLowerCase();
      const filtered = teacherRoles.filter((r: any) => {
        if (!search) return true;
        const p = profileMap[r.user_id];
        return (
          (p?.full_name || "").toLowerCase().includes(search) ||
          (p?.email || "").toLowerCase().includes(search) ||
          (p?.institution || "").toLowerCase().includes(search)
        );
      });

      setTeachers(
        filtered.map((r: any) => {
          const p = profileMap[r.user_id] || {};
          return {
            user_id: r.user_id,
            name: p.full_name || "(নাম নেই)",
            email: p.email || "",
            institution: p.institution || "",
            avatar_url: p.avatar_url || "",
            created_at: p.created_at || r.created_at,
            is_suspended: p.is_active === false,
            question_count: countMap[r.user_id] || 0,
            subscription: subMap[r.user_id] || null,
          };
        })
      );
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, toast]);

  useEffect(() => {
    const t = setTimeout(fetchAll, 300);
    return () => clearTimeout(t);
  }, [fetchAll, refreshTrigger]);

  // Stats
  const activeCount = teachers.filter((t) => !t.is_suspended).length;
  const withPlanCount = teachers.filter((t) => t.subscription).length;
  const totalQuestions = teachers.reduce((s, t) => s + t.question_count, 0);

  const planDistribution = plans
    .filter((p) => p.plan_type === "teacher" || p.plan_type === "premium")
    .map((p) => ({
      plan: p,
      count: teachers.filter((t) => t.subscription?.plan_id === p.id).length,
    }));

  const handleOpenDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDetailOpen(true);
  };

  const handleSuspend = async (teacher: Teacher) => {
    try {
      const newActive = teacher.is_suspended; // if currently suspended, set active=true
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: newActive })
        .eq("id", teacher.user_id);
      if (error) throw new Error(error.message);
      toast({
        title: "সাফল্য",
        description: teacher.is_suspended ? "শিক্ষক পুনরায় সক্রিয় হয়েছে" : "শিক্ষক স্থগিত হয়েছে",
      });
      fetchAll();
      setDetailOpen(false);
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    }
  };

  const handleRemoveRole = async (userId: string) => {
    if (!confirm("এই শিক্ষকের রোল সরিয়ে দেবেন?")) return;
    try {
      await adminApi.updateRole(userId, "teacher", true);
      toast({ title: "সাফল্য", description: "শিক্ষক রোল সরানো হয়েছে" });
      fetchAll();
      setDetailOpen(false);
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    }
  };

  const openAssignPlan = (teacher: Teacher) => {
    setPlanTarget(teacher);
    setSelectedPlanId(teacher.subscription?.plan_id || "");
    setSelectedBilling((teacher.subscription?.billing_cycle as "monthly" | "yearly") || "monthly");
    setPlanDialogOpen(true);
  };

  const handleAssignPlan = async () => {
    if (!planTarget || !selectedPlanId) return;
    setAssigningPlan(true);
    try {
      await adminApi.assignPlan(planTarget.user_id, selectedPlanId, selectedBilling);
      toast({ title: "সাফল্য", description: "প্ল্যান সফলভাবে অ্যাসাইন করা হয়েছে" });
      setPlanDialogOpen(false);
      fetchAll();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    } finally {
      setAssigningPlan(false);
    }
  };

  const handleCancelSubscription = async (teacher: Teacher) => {
    if (!confirm("সাবস্ক্রিপশন বাতিল করবেন?")) return;
    try {
      await adminApi.cancelSubscription(teacher.user_id);
      toast({ title: "সাফল্য", description: "সাবস্ক্রিপশন বাতিল হয়েছে" });
      fetchAll();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    }
  };

  const handleCreateTeacher = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast({ title: "ত্রুটি", description: "নাম, ইমেইল ও পাসওয়ার্ড আবশ্যক", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("https://urtptlxotyyjfqynpbwx.supabase.co/functions/v1/admin?action=create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydHB0bHhvdHl5amZxeW5wYnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTA2NzQsImV4cCI6MjA4NDE2NjY3NH0.w-0GuzuZ3DU0BACTHoCXBPj6qBRxsA3JirwcVflR9BE",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ ...createForm, role: "teacher" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "তৈরি করা যায়নি");
      toast({ title: "সাফল্য", description: "নতুন শিক্ষক তৈরি হয়েছে" });
      setCreateOpen(false);
      setCreateForm({ name: "", email: "", password: "", institution: "" });
      fetchAll();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold font-bengali">শিক্ষক প্যানেল</h2>
          <p className="text-sm text-muted-foreground mt-0.5 font-bengali">
            B2B — শিক্ষকদের অ্যাকাউন্ট ও সাবস্ক্রিপশন পরিচালনা
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            রিফ্রেশ
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            নতুন শিক্ষক
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <GraduationCap className="h-5 w-5 text-violet-600" />, bg: "bg-violet-100", value: teachers.length, label: "মোট শিক্ষক" },
          { icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, bg: "bg-emerald-100", value: activeCount, label: "সক্রিয়" },
          { icon: <Crown className="h-5 w-5 text-amber-600" />, bg: "bg-amber-100", value: withPlanCount, label: "প্ল্যান আছে" },
          { icon: <BookOpen className="h-5 w-5 text-blue-600" />, bg: "bg-blue-100", value: totalQuestions, label: "মোট প্রশ্ন" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-bengali">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan distribution */}
      {planDistribution.some((p) => p.count > 0) && (
        <div className="flex flex-wrap gap-3">
          {planDistribution.map(({ plan, count }) => count > 0 && (
            <div key={plan.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${PLAN_COLORS[plan.plan_type]}`}>
              {PLAN_ICONS[plan.plan_type]}
              {plan.name}: {count} জন
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 font-bengali"
        />
      </div>

      {/* Teacher Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bengali">শিক্ষক তালিকা</CardTitle>
          <CardDescription className="font-bengali">প্রতিটি শিক্ষকের অ্যাকাউন্ট ও সাবস্ক্রিপশন অবস্থা</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-bengali">কোনো শিক্ষক পাওয়া যায়নি</p>
              <Button size="sm" className="mt-4 gap-2 font-bengali" onClick={() => setCreateOpen(true)}>
                <UserPlus className="h-4 w-4" />
                প্রথম শিক্ষক যোগ করুন
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {teachers.map((teacher) => {
                const activePlan = teacher.subscription?.plan as SubscriptionPlan | undefined;
                return (
                  <div
                    key={teacher.user_id}
                    className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30 ${teacher.is_suspended ? "opacity-60" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0 text-violet-700 font-bold text-sm">
                      {(teacher.name || "T").charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm font-bengali">{teacher.name}</span>
                        {teacher.is_suspended && (
                          <Badge variant="destructive" className="text-xs">স্থগিত</Badge>
                        )}
                        <PlanBadge plan={activePlan} />
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />{teacher.email}
                        </span>
                        {teacher.institution && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />{teacher.institution}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <BookOpen className="h-3 w-3" />{teacher.question_count}টি প্রশ্ন
                        </span>
                        {teacher.subscription && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(teacher.subscription.started_at).toLocaleDateString("bn-BD")} থেকে সক্রিয়
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Billing cycle */}
                    {teacher.subscription && (
                      <div className="hidden md:block text-xs text-muted-foreground text-center shrink-0">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          teacher.subscription.billing_cycle === "yearly"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {teacher.subscription.billing_cycle === "yearly" ? "বার্ষিক" : "মাসিক"}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="বিস্তারিত দেখুন"
                        onClick={() => handleOpenDetail(teacher)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="প্ল্যান পরিবর্তন"
                        onClick={() => openAssignPlan(teacher)}
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 font-bengali">
                          <DropdownMenuItem onClick={() => openAssignPlan(teacher)}>
                            <CreditCard className="h-4 w-4 mr-2 text-violet-500" />
                            প্ল্যান অ্যাসাইন করুন
                          </DropdownMenuItem>
                          {teacher.subscription && (
                            <DropdownMenuItem
                              onClick={() => handleCancelSubscription(teacher)}
                              className="text-orange-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              সাবস্ক্রিপশন বাতিল
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleSuspend(teacher)}>
                            {teacher.is_suspended ? (
                              <><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />পুনরায় সক্রিয় করুন</>
                            ) : (
                              <><XCircle className="h-4 w-4 mr-2 text-orange-500" />অ্যাকাউন্ট স্থগিত</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleRemoveRole(teacher.user_id)}
                          >
                            <ShieldOff className="h-4 w-4 mr-2" />
                            শিক্ষক রোল সরাও
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Teacher Detail Dialog ── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bengali flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-violet-600" />
              শিক্ষকের বিস্তারিত
            </DialogTitle>
          </DialogHeader>
          {selectedTeacher && (
            <Tabs defaultValue="profile">
              <TabsList className="w-full">
                <TabsTrigger value="profile" className="flex-1 font-bengali text-xs">প্রোফাইল</TabsTrigger>
                <TabsTrigger value="subscription" className="flex-1 font-bengali text-xs">সাবস্ক্রিপশন</TabsTrigger>
                <TabsTrigger value="activity" className="flex-1 font-bengali text-xs">কার্যকলাপ</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4 pt-3">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xl">
                    {(selectedTeacher.name || "T").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-lg font-bengali">{selectedTeacher.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedTeacher.email}</p>
                    {selectedTeacher.institution && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" />{selectedTeacher.institution}
                      </p>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground font-bengali">যোগদানের তারিখ</p>
                    <p className="font-medium mt-0.5">
                      {new Date(selectedTeacher.created_at).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground font-bengali">মোট প্রশ্ন</p>
                    <p className="font-medium mt-0.5">{selectedTeacher.question_count}টি</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground font-bengali">অ্যাকাউন্ট অবস্থা</p>
                    <p className={`font-medium mt-0.5 ${selectedTeacher.is_suspended ? "text-destructive" : "text-emerald-600"}`}>
                      {selectedTeacher.is_suspended ? "স্থগিত" : "সক্রিয়"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground font-bengali">বর্তমান প্ল্যান</p>
                    <div className="mt-0.5">
                      <PlanBadge plan={selectedTeacher.subscription?.plan as SubscriptionPlan | undefined} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-bengali"
                    onClick={() => { openAssignPlan(selectedTeacher); setDetailOpen(false); }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    প্ল্যান পরিবর্তন
                  </Button>
                  <Button
                    variant={selectedTeacher.is_suspended ? "default" : "destructive"}
                    size="sm"
                    className="flex-1 font-bengali"
                    onClick={() => handleSuspend(selectedTeacher)}
                  >
                    {selectedTeacher.is_suspended ? "পুনরায় সক্রিয়" : "অ্যাকাউন্ট স্থগিত"}
                  </Button>
                </div>
              </TabsContent>

              {/* Subscription Tab */}
              <TabsContent value="subscription" className="space-y-4 pt-3">
                {selectedTeacher.subscription ? (
                  <>
                    <div className="rounded-xl border bg-gradient-to-br from-violet-50 to-white p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold font-bengali text-sm">সক্রিয় সাবস্ক্রিপশন</span>
                        <PlanBadge plan={selectedTeacher.subscription.plan as SubscriptionPlan | undefined} />
                      </div>
                      <Separator />
                      {(() => {
                        const p = selectedTeacher.subscription.plan as SubscriptionPlan | undefined;
                        if (!p) return null;
                        return (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground font-bengali">বিলিং সাইকেল</span>
                              <p className="font-medium mt-0.5 font-bengali">
                                {selectedTeacher.subscription.billing_cycle === "yearly" ? "বার্ষিক" : "মাসিক"}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground font-bengali">মূল্য</span>
                              <p className="font-medium mt-0.5">
                                ৳{selectedTeacher.subscription.billing_cycle === "yearly" ? p.price_yearly : p.price_monthly}
                                /{selectedTeacher.subscription.billing_cycle === "yearly" ? "বছর" : "মাস"}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground font-bengali">শুরু হয়েছে</span>
                              <p className="font-medium mt-0.5">
                                {new Date(selectedTeacher.subscription.started_at).toLocaleDateString("bn-BD")}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground font-bengali">প্রশ্ন আপলোড লিমিট</span>
                              <p className="font-medium mt-0.5">{p.question_upload_limit === 0 ? "নেই" : `${p.question_upload_limit}টি`}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground font-bengali">ব্যাচ স্টুডেন্ট লিমিট</span>
                              <p className="font-medium mt-0.5">{p.batch_student_limit === 0 ? "নেই" : `${p.batch_student_limit} জন`}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground font-bengali">OMR গ্রেডিং</span>
                              <p className={`font-medium mt-0.5 ${p.omr_grading ? "text-emerald-600" : "text-muted-foreground"}`}>
                                {p.omr_grading ? "আছে" : "নেই"}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground font-bengali mb-1.5">ফিচারসমূহ</p>
                        <div className="flex flex-wrap gap-1.5">
                          {((selectedTeacher.subscription.plan as SubscriptionPlan | undefined)?.features || []).map((f, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-bengali">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 font-bengali"
                        onClick={() => { openAssignPlan(selectedTeacher); setDetailOpen(false); }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        প্ল্যান পরিবর্তন
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 font-bengali"
                        onClick={() => { handleCancelSubscription(selectedTeacher); setDetailOpen(false); }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        বাতিল করুন
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-bengali text-sm">কোনো সক্রিয় সাবস্ক্রিপশন নেই</p>
                    <Button
                      size="sm"
                      className="mt-4 font-bengali gap-2"
                      onClick={() => { openAssignPlan(selectedTeacher); setDetailOpen(false); }}
                    >
                      <CreditCard className="h-4 w-4" />
                      প্ল্যান অ্যাসাইন করুন
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-xl font-bold">{selectedTeacher.question_count}</p>
                          <p className="text-xs text-muted-foreground font-bengali">প্রশ্ন তৈরি</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-violet-500" />
                        <div>
                          <p className="text-xl font-bold">
                            {(selectedTeacher.subscription?.plan as SubscriptionPlan | undefined)?.batch_student_limit || 0}
                          </p>
                          <p className="text-xs text-muted-foreground font-bengali">ব্যাচ লিমিট</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-emerald-500" />
                        <div>
                          <p className="text-xl font-bold">
                            {(selectedTeacher.subscription?.plan as SubscriptionPlan | undefined)?.question_upload_limit || 0}
                          </p>
                          <p className="text-xs text-muted-foreground font-bengali">আপলোড লিমিট</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-amber-500" />
                        <div>
                          <p className="text-xl font-bold">
                            {new Date(selectedTeacher.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "short" })}
                          </p>
                          <p className="text-xs text-muted-foreground font-bengali">সদস্যপদ</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Assign Plan Dialog ── */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bengali flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-violet-600" />
              প্ল্যান অ্যাসাইন করুন
            </DialogTitle>
            <DialogDescription className="font-bengali">
              {planTarget?.name} — বর্তমান সাবস্ক্রিপশন পরিবর্তন করুন
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="font-bengali">প্ল্যান বেছে নিন</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="font-bengali">
                  <SelectValue placeholder="প্ল্যান নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {plans.filter((p) => p.is_active).map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex items-center gap-2 font-bengali">
                        <span>{plan.name}</span>
                        <span className="text-xs text-muted-foreground">
                          — ৳{plan.price_monthly}/মাস
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlanId && (() => {
              const plan = plans.find((p) => p.id === selectedPlanId);
              if (!plan) return null;
              return (
                <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <PlanBadge plan={plan} />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedBilling("monthly")}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${
                          selectedBilling === "monthly"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        মাসিক ৳{plan.price_monthly}
                      </button>
                      <button
                        onClick={() => setSelectedBilling("yearly")}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${
                          selectedBilling === "yearly"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        বার্ষিক ৳{plan.price_yearly}
                      </button>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-xs font-bengali">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{plan.question_upload_limit === 0 ? "প্রশ্ন আপলোড নেই" : `${plan.question_upload_limit}টি আপলোড`}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{plan.batch_student_limit === 0 ? "ব্যাচ নেই" : `${plan.batch_student_limit} স্টুডেন্ট`}</span>
                    </div>
                    {plan.omr_grading && (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>OMR গ্রেডিং</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.features.map((f, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-background border rounded-full font-bengali">{f}</span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" className="font-bengali" onClick={() => setPlanDialogOpen(false)}>বাতিল</Button>
            <Button
              className="font-bengali"
              onClick={handleAssignPlan}
              disabled={!selectedPlanId || assigningPlan}
            >
              {assigningPlan && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              প্ল্যান সেভ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Teacher Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bengali flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-violet-600" />
              নতুন শিক্ষক তৈরি করুন
            </DialogTitle>
            <DialogDescription className="font-bengali">
              অ্যাকাউন্ট তৈরি হবে এবং teacher রোল স্বয়ংক্রিয়ভাবে যোগ হবে
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="font-bengali">পুরো নাম *</Label>
              <Input
                placeholder="শিক্ষকের নাম"
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                className="font-bengali"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bengali">ইমেইল *</Label>
              <Input
                type="email"
                placeholder="teacher@school.com"
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bengali">পাসওয়ার্ড *</Label>
              <Input
                type="password"
                placeholder="কমপক্ষে ৬ অক্ষর"
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bengali">প্রতিষ্ঠান (ঐচ্ছিক)</Label>
              <Input
                placeholder="স্কুল / কলেজ / কোচিং সেন্টার"
                value={createForm.institution}
                onChange={(e) => setCreateForm((p) => ({ ...p, institution: e.target.value }))}
                className="font-bengali"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="font-bengali" onClick={() => setCreateOpen(false)}>বাতিল</Button>
            <Button className="font-bengali" onClick={handleCreateTeacher} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              শিক্ষক তৈরি করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
