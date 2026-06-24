import { useEffect, useState, useCallback } from "react";
import {
  Loader2, Search, UserPlus, RefreshCw, MoreHorizontal,
  BookOpen, Mail, CheckCircle2, Crown, CreditCard,
  XCircle, Users, BarChart3, CalendarDays, Eye,
  GraduationCap, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type Student = {
  user_id: string;
  name: string;
  email: string;
  avatar_url: string;
  created_at: string;
  is_active: boolean;
  exam_count: number;
  subscription: UserSubscription | null;
};

const PLAN_COLORS: Record<string, string> = {
  free_student: "bg-slate-100 text-slate-700",
  basic_student: "bg-blue-100 text-blue-700",
  premium_student: "bg-amber-100 text-amber-700",
  teacher_basic: "bg-violet-100 text-violet-700",
  coaching_standard: "bg-violet-100 text-violet-700",
  coaching_pro: "bg-violet-100 text-violet-700",
};

function PlanBadge({ plan }: { plan: SubscriptionPlan | undefined | null }) {
  if (!plan) return <Badge variant="outline" className="text-xs gap-1"><CreditCard className="h-3 w-3" />কোনো প্ল্যান নেই</Badge>;
  return (
    <Badge className={`text-xs gap-1 border-0 ${PLAN_COLORS[plan.plan_type] ?? "bg-slate-100 text-slate-700"}`}>
      {plan.plan_type.includes("premium") ? <Crown className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
      {plan.name}
    </Badge>
  );
}

export default function AdminStudentsTab() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planTarget, setPlanTarget] = useState<Student | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedBilling, setSelectedBilling] = useState<"monthly" | "yearly">("monthly");
  const [assigningPlan, setAssigningPlan] = useState(false);

  const studentPlans = plans.filter((p) =>
    ["free_student", "basic_student", "premium_student"].includes(p.plan_type)
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPlans = await adminApi.getPlans();
      setPlans(fetchedPlans);

      // Get all profiles that are NOT teachers or admins
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["admin", "teacher", "moderator"]);

      const excludeIds = (adminRoles || []).map((r: any) => r.user_id);

      let profileQuery = supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, created_at, is_active")
        .order("created_at", { ascending: false })
        .limit(200);

      if (excludeIds.length > 0) {
        profileQuery = profileQuery.not("id", "in", `(${excludeIds.join(",")})`);
      }

      const { data: profilesData, error: profilesErr } = await profileQuery;
      if (profilesErr) throw new Error(profilesErr.message);

      const profiles = profilesData || [];
      if (profiles.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const userIds = profiles.map((p: any) => p.id);

      // Fetch exam attempt counts and subscriptions in parallel
      const [attemptsRes, subsRes] = await Promise.all([
        supabase
          .from("exam_attempts")
          .select("user_id")
          .in("user_id", userIds),
        supabase
          .from("user_subscriptions")
          .select("*, plan:subscription_plans(*)")
          .in("user_id", userIds)
          .eq("status", "active"),
      ]);

      const countMap: Record<string, number> = {};
      (attemptsRes.data || []).forEach((r: any) => {
        countMap[r.user_id] = (countMap[r.user_id] || 0) + 1;
      });

      const subMap: Record<string, UserSubscription> = {};
      (subsRes.data || []).forEach((s: any) => { subMap[s.user_id] = s; });

      const search = searchQuery.toLowerCase();
      const filtered = profiles.filter((p: any) => {
        if (search && !(
          (p.full_name || "").toLowerCase().includes(search) ||
          (p.email || "").toLowerCase().includes(search)
        )) return false;
        if (planFilter === "no_plan") return !subMap[p.id];
        if (planFilter !== "all") {
          const sub = subMap[p.id];
          if (!sub) return false;
          return (sub.plan as any)?.plan_type === planFilter;
        }
        return true;
      });

      setStudents(
        filtered.map((p: any) => ({
          user_id: p.id,
          name: p.full_name || "(নাম নেই)",
          email: p.email || "",
          avatar_url: p.avatar_url || "",
          created_at: p.created_at,
          is_active: p.is_active !== false,
          exam_count: countMap[p.id] || 0,
          subscription: subMap[p.id] || null,
        }))
      );
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, planFilter, toast]);

  useEffect(() => {
    const t = setTimeout(fetchAll, 350);
    return () => clearTimeout(t);
  }, [fetchAll]);

  // Stats
  const totalStudents = students.length;
  const withPlan = students.filter((s) => s.subscription).length;
  const active = students.filter((s) => s.is_active).length;
  const suspended = students.filter((s) => !s.is_active).length;

  const planDistribution = plans
    .filter((p) => ["free_student", "basic_student", "premium_student"].includes(p.plan_type))
    .map((p) => ({
      ...p,
      count: students.filter((s) => (s.subscription?.plan as any)?.plan_type === p.plan_type).length,
    }));

  const handleSuspend = async (student: Student) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !student.is_active })
        .eq("id", student.user_id);
      if (error) throw new Error(error.message);
      toast({
        title: "সাফল্য",
        description: student.is_active ? "অ্যাকাউন্ট স্থগিত হয়েছে" : "অ্যাকাউন্ট পুনরায় সক্রিয় হয়েছে",
      });
      fetchAll();
      setDetailOpen(false);
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    }
  };

  const handleCancelPlan = async (student: Student) => {
    try {
      await adminApi.cancelSubscription(student.user_id);
      toast({ title: "সাফল্য", description: "সাবস্ক্রিপশন বাতিল হয়েছে" });
      fetchAll();
      setDetailOpen(false);
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    }
  };

  const handleAssignPlan = async () => {
    if (!planTarget || !selectedPlanId) return;
    setAssigningPlan(true);
    try {
      await adminApi.assignPlan(planTarget.user_id, selectedPlanId, selectedBilling);
      toast({ title: "সাফল্য", description: "প্ল্যান সফলভাবে নির্ধারণ হয়েছে" });
      setPlanDialogOpen(false);
      fetchAll();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    } finally {
      setAssigningPlan(false);
    }
  };

  const openPlanDialog = (student: Student) => {
    setPlanTarget(student);
    setSelectedPlanId(student.subscription?.plan_id || "");
    setSelectedBilling((student.subscription?.billing_cycle as "monthly" | "yearly") || "monthly");
    setPlanDialogOpen(true);
    setDetailOpen(false);
  };

  const previewPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">শিক্ষার্থী ব্যবস্থাপনা</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            মোট {totalStudents} জন নিবন্ধিত শিক্ষার্থী
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
          <RefreshCw className="h-4 w-4" />রিফ্রেশ
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "মোট শিক্ষার্থী", value: totalStudents, icon: Users, color: "text-primary" },
          { label: "সক্রিয়", value: active, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "প্ল্যান আছে", value: withPlan, icon: CreditCard, color: "text-blue-600" },
          { label: "স্থগিত", value: suspended, icon: XCircle, color: "text-red-500" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Plan distribution */}
      {planDistribution.some((p) => p.count > 0) && (
        <Card className="p-4">
          <p className="text-sm font-semibold mb-3 text-muted-foreground">প্ল্যান বিভাজন</p>
          <div className="flex flex-wrap gap-3">
            {planDistribution.map((p) => (
              <div key={p.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${PLAN_COLORS[p.plan_type] ?? "bg-slate-100 text-slate-700"}`}>
                {p.name}: <span className="font-bold">{p.count} জন</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600">
              প্ল্যান নেই: <span className="font-bold">{totalStudents - withPlan} জন</span>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "all", label: "সকল" },
            { id: "no_plan", label: "প্ল্যান নেই" },
            { id: "free_student", label: "ফ্রি" },
            { id: "basic_student", label: "বেসিক" },
            { id: "premium_student", label: "প্রিমিয়াম" },
          ].map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={planFilter === f.id ? "default" : "outline"}
              onClick={() => setPlanFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Students table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">শিক্ষার্থী তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>কোনো শিক্ষার্থী পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.user_id}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                    !student.is_active
                      ? "bg-red-50 border-red-200"
                      : "bg-background hover:bg-muted/40"
                  }`}
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold text-sm">
                    {(student.name || student.email || "S").charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{student.name}</span>
                      <PlanBadge plan={student.subscription?.plan as any} />
                      {!student.is_active && (
                        <Badge variant="destructive" className="text-xs">স্থগিত</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                      {student.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />{student.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />{student.exam_count}টি পরীক্ষা
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(student.created_at).toLocaleDateString("bn-BD")}
                      </span>
                      {student.subscription && (
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <TrendingUp className="h-3 w-3" />
                          {student.subscription.billing_cycle === "yearly" ? "বার্ষিক" : "মাসিক"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setSelectedStudent(student); setDetailOpen(true); }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600"
                      title="প্ল্যান পরিবর্তন করুন"
                      onClick={() => openPlanDialog(student)}
                    >
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => openPlanDialog(student)}>
                          <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                          প্ল্যান নির্ধারণ করুন
                        </DropdownMenuItem>
                        {student.subscription && (
                          <DropdownMenuItem onClick={() => handleCancelPlan(student)}>
                            <XCircle className="h-4 w-4 mr-2 text-amber-600" />
                            সাবস্ক্রিপশন বাতিল
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleSuspend(student)}
                          className={student.is_active ? "text-destructive" : "text-emerald-600"}
                        >
                          {student.is_active ? (
                            <><XCircle className="h-4 w-4 mr-2" />অ্যাকাউন্ট স্থগিত করুন</>
                          ) : (
                            <><CheckCircle2 className="h-4 w-4 mr-2" />স্থগিতাদেশ তুলে নিন</>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              {selectedStudent?.name}
            </DialogTitle>
            <DialogDescription>{selectedStudent?.email}</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <Tabs defaultValue="profile">
              <TabsList className="w-full">
                <TabsTrigger value="profile" className="flex-1">প্রোফাইল</TabsTrigger>
                <TabsTrigger value="subscription" className="flex-1">সাবস্ক্রিপশন</TabsTrigger>
                <TabsTrigger value="activity" className="flex-1">কার্যকলাপ</TabsTrigger>
              </TabsList>

              {/* Profile tab */}
              <TabsContent value="profile" className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs">নাম</p>
                    <p className="font-medium">{selectedStudent.name}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs">ইমেইল</p>
                    <p className="font-medium truncate">{selectedStudent.email}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs">যোগদানের তারিখ</p>
                    <p className="font-medium">
                      {new Date(selectedStudent.created_at).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs">অবস্থা</p>
                    <p className={`font-medium ${selectedStudent.is_active ? "text-emerald-600" : "text-red-600"}`}>
                      {selectedStudent.is_active ? "সক্রিয়" : "স্থগিত"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openPlanDialog(selectedStudent)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />প্ল্যান পরিবর্তন
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedStudent.is_active ? "destructive" : "default"}
                    className="flex-1"
                    onClick={() => handleSuspend(selectedStudent)}
                  >
                    {selectedStudent.is_active ? "স্থগিত করুন" : "পুনরায় সক্রিয়"}
                  </Button>
                </div>
              </TabsContent>

              {/* Subscription tab */}
              <TabsContent value="subscription" className="space-y-4 pt-2">
                {selectedStudent.subscription ? (
                  <>
                    <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <PlanBadge plan={selectedStudent.subscription.plan as any} />
                        <Badge variant="outline" className="text-xs">
                          {selectedStudent.subscription.billing_cycle === "yearly" ? "বার্ষিক" : "মাসিক"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">শুরুর তারিখ</p>
                          <p className="font-medium">
                            {new Date(selectedStudent.subscription.started_at).toLocaleDateString("bn-BD")}
                          </p>
                        </div>
                        {selectedStudent.subscription.cancel_at && (
                          <div>
                            <p className="text-muted-foreground">শেষের তারিখ</p>
                            <p className="font-medium text-red-600">
                              {new Date(selectedStudent.subscription.cancel_at).toLocaleDateString("bn-BD")}
                            </p>
                          </div>
                        )}
                      </div>
                      {/* Plan features */}
                      {(selectedStudent.subscription.plan as any)?.features?.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-muted-foreground">সুবিধাসমূহ</p>
                          <div className="flex flex-wrap gap-1.5">
                            {((selectedStudent.subscription.plan as any).features as string[]).map((f) => (
                              <span key={f} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={() => handleCancelPlan(selectedStudent)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />সাবস্ক্রিপশন বাতিল করুন
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <CreditCard className="h-10 w-10 mx-auto text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">কোনো সক্রিয় প্ল্যান নেই</p>
                    <Button size="sm" onClick={() => openPlanDialog(selectedStudent)}>
                      প্ল্যান নির্ধারণ করুন
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Activity tab */}
              <TabsContent value="activity" className="pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4 text-center">
                    <BookOpen className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">{selectedStudent.exam_count}</p>
                    <p className="text-xs text-muted-foreground">মোট পরীক্ষা দিয়েছে</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-1 text-emerald-600" />
                    <p className="text-2xl font-bold">
                      {(selectedStudent.subscription?.plan as any)?.max_practice_exams ?? "আনলিমিটেড"}
                    </p>
                    <p className="text-xs text-muted-foreground">প্র্যাকটিস পরীক্ষার সীমা/মাস</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                    <p className="text-2xl font-bold">
                      {(selectedStudent.subscription?.plan as any)?.max_live_exams_per_month ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">লাইভ পরীক্ষার সীমা/মাস</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <CalendarDays className="h-6 w-6 mx-auto mb-1 text-amber-600" />
                    <p className="text-2xl font-bold">
                      {Math.floor(
                        (Date.now() - new Date(selectedStudent.created_at).getTime()) /
                        (1000 * 60 * 60 * 24)
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">দিন ধরে সদস্য</p>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />প্ল্যান নির্ধারণ করুন
            </DialogTitle>
            <DialogDescription>
              {planTarget?.name} — {planTarget?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label>প্ল্যান বেছে নিন</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="প্ল্যান বেছে নিন..." />
                </SelectTrigger>
                <SelectContent>
                  {studentPlans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        {p.name}
                        <span className="text-xs text-muted-foreground">
                          {p.price_monthly > 0 ? `৳${p.price_monthly}/মাস` :
                           p.price_yearly > 0 ? `৳${p.price_yearly}/বছর` : "বিনামূল্যে"}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>বিলিং চক্র</Label>
              <div className="flex gap-2">
                {(["monthly", "yearly"] as const).map((cycle) => (
                  <Button
                    key={cycle}
                    size="sm"
                    variant={selectedBilling === cycle ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setSelectedBilling(cycle)}
                  >
                    {cycle === "monthly" ? "মাসিক" : "বার্ষিক"}
                  </Button>
                ))}
              </div>
            </div>
            {previewPlan && (
              <div className="p-3 rounded-xl border bg-muted/30 space-y-2">
                <p className="text-sm font-semibold">{previewPlan.name}</p>
                <p className="text-xs text-muted-foreground">{previewPlan.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {previewPlan.features.slice(0, 4).map((f) => (
                    <span key={f} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>বাতিল</Button>
            <Button onClick={handleAssignPlan} disabled={!selectedPlanId || assigningPlan}>
              {assigningPlan && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              প্ল্যান নির্ধারণ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
