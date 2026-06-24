import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { examsApi } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { BackButton } from "@/components/BackButton";
import {
  BookOpen, Trophy, Clock, Target, TrendingUp, Calendar,
  Award, Play, CheckCircle2, XCircle, BarChart3,
  User, Loader2, CreditCard, Layers, ChevronRight,
} from "lucide-react";

interface ExamAttempt {
  id: string;
  subject: string;
  topic?: string;
  score: number;
  max_score: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  created_at: string;
}

interface UserStats {
  total_exams: number;
  avg_score: number;
  accuracy: number;
  total_study_time_hours: number;
  subject_stats: { subject: string; exams: number; accuracy: number }[];
}

interface EnrolledBatch {
  id: string;
  status: string;
  enrolled_at: string;
  expires_at: string | null;
  exam_batches: {
    id: string;
    title: string;
    description: string | null;
    duration_days: number | null;
    price: number | null;
    status: string;
  } | null;
}

interface ActiveSubscription {
  id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  subscription_plans: {
    id: string;
    name: string;
    plan_type: string;
    price_monthly: number | null;
    features: unknown;
  } | null;
}

const Dashboard = () => {
  usePageMeta({
    title: "ড্যাশবোর্ড",
    description: "তোমার সাম্প্রতিক এক্সাম, ব্যাচ, সাবস্ক্রিপশন এবং পারফরম্যান্স ট্র্যাক করো।",
  });

  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, attemptsRes] = await Promise.all([
        examsApi.stats().catch(() => ({ data: { total_exams: 0, avg_score: 0, accuracy: 0, total_study_time_hours: 0, subject_stats: [] } })),
        examsApi.attempts({ limit: 5 }).catch(() => ({ data: [], total: 0 })),
      ]);
      setStats(statsRes.data);
      setAttempts(attemptsRes.data as ExamAttempt[]);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) loadData();
  }, [authLoading, loadData, navigate, user]);

  // Scroll to hash on mount
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, []);

  const { data: enrolledBatches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ["my-batches", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batch_enrollments")
        .select("id, status, enrolled_at, expires_at, exam_batches(id, title, description, duration_days, price, status)")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .order("enrolled_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as EnrolledBatch[];
    },
  });

  const { data: activeSubscription } = useQuery({
    queryKey: ["my-subscription", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("id, status, started_at, expires_at, subscription_plans(id, name, plan_type, price_monthly, features)")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data as unknown as ActiveSubscription | null;
    },
  });

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "ব্যবহারকারী";

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background font-bengali">
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const totalExams = stats?.total_exams || 0;
  const avgScore = Math.round(stats?.accuracy || 0);
  const studyHours = Math.round(stats?.total_study_time_hours || 0);
  const subjectProgress = stats?.subject_stats || [];

  const planFeatures = (activeSubscription?.subscription_plans?.features as string[] | null) ?? [];

  return (
    <div className="min-h-screen bg-background font-bengali">
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                স্বাগতম, <span className="text-primary">{userName}</span>
              </h1>
              <p className="text-muted-foreground">
                তোমার প্রগ্রেস ট্র্যাক করো এবং নতুন এক্সামে অংশ নাও
              </p>
            </div>
            <Link to="/profile">
              <Button variant="outline" className="gap-2">
                <User className="w-4 h-4" />
                প্রোফাইল
              </Button>
            </Link>
          </div>

          <BackButton className="mb-8" />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{totalExams}</div>
              <div className="text-sm text-muted-foreground">মোট এক্সাম</div>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{avgScore}%</div>
              <div className="text-sm text-muted-foreground">গড় নির্ভুলতা</div>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{Math.round(stats?.avg_score || 0)}</div>
              <div className="text-sm text-muted-foreground">গড় স্কোর</div>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{studyHours}h</div>
              <div className="text-sm text-muted-foreground">পড়াশোনার সময়</div>
            </div>
          </div>

          {/* My Batches */}
          <section id="my-batches" className="mb-8 scroll-mt-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                আমার ব্যাচ
              </h2>
              <Link to="/batches">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  আরও দেখো <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            {batchesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : enrolledBatches.length === 0 ? (
              <div className="bg-card rounded-2xl border border-dashed border-border p-8 text-center">
                <Layers className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-3">এখনো কোনো ব্যাচে ভর্তি হওনি</p>
                <Link to="/batches">
                  <Button variant="hero" size="sm">ব্যাচ দেখো</Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledBatches.map((enrollment) => {
                  const batch = enrollment.exam_batches;
                  if (!batch) return null;
                  const expiresAt = enrollment.expires_at ? new Date(enrollment.expires_at) : null;
                  const daysLeft = expiresAt
                    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                    : null;
                  return (
                    <div key={enrollment.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-card transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">চলমান</Badge>
                        {daysLeft !== null && (
                          <span className="text-xs text-muted-foreground">{daysLeft} দিন বাকি</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{batch.title}</h3>
                      {batch.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{batch.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>ভর্তি: {new Date(enrollment.enrolled_at).toLocaleDateString("bn-BD")}</span>
                      </div>
                      <Link to={`/batches/ssc/${batch.id}`}>
                        <Button variant="outline" size="sm" className="w-full">বিস্তারিত</Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Subscription */}
          <section id="subscription" className="mb-8 scroll-mt-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                আমার সাবস্ক্রিপশন
              </h2>
            </div>
            {activeSubscription ? (
              <div className="bg-gradient-to-br from-primary/10 via-card to-accent/10 rounded-2xl border border-primary/20 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <Badge className="bg-secondary text-secondary-foreground mb-2">সক্রিয়</Badge>
                    <h3 className="text-xl font-bold text-foreground">
                      {activeSubscription.subscription_plans?.name ?? "প্রিমিয়াম"}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {activeSubscription.subscription_plans?.plan_type ?? "standard"} প্ল্যান
                    </p>
                  </div>
                  <div className="text-right">
                    {activeSubscription.expires_at && (
                      <>
                        <div className="text-xs text-muted-foreground">মেয়াদ শেষ</div>
                        <div className="font-semibold text-foreground">
                          {new Date(activeSubscription.expires_at).toLocaleDateString("bn-BD")}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {planFeatures.length > 0 && (
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {planFeatures.slice(0, 6).map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-dashed border-border p-8 text-center">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-1">কোনো সক্রিয় সাবস্ক্রিপশন নেই</p>
                <p className="text-sm text-muted-foreground mb-4">প্রিমিয়াম প্ল্যানে আপগ্রেড করে সব সুবিধা উপভোগ করো</p>
                <Link to="/teachers">
                  <Button variant="hero" size="sm">প্ল্যান দেখো</Button>
                </Link>
              </div>
            )}
          </section>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Exam History */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    সাম্প্রতিক এক্সাম
                  </h2>
                </div>
                {attempts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>এখনো কোনো এক্সাম দেওয়া হয়নি</p>
                    <Link to="/question-bank">
                      <Button variant="hero" size="sm" className="mt-3">প্রথম এক্সাম দাও</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attempts.map((exam) => {
                      const pct = exam.max_score > 0 ? Math.round((exam.score / exam.max_score) * 100) : 0;
                      return (
                        <div key={exam.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              pct >= 80 ? "bg-secondary/20" : pct >= 50 ? "bg-accent/20" : "bg-destructive/20"
                            }`}>
                              {pct >= 80 ? <CheckCircle2 className="w-5 h-5 text-secondary" /> :
                               pct >= 50 ? <TrendingUp className="w-5 h-5 text-accent" /> :
                               <XCircle className="w-5 h-5 text-destructive" />}
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{exam.subject}{exam.topic ? ` — ${exam.topic}` : ""}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(exam.created_at).toLocaleDateString("bn-BD")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-foreground">{exam.score}/{exam.max_score}</div>
                            <div className="text-sm text-muted-foreground">{pct}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Subject Progress */}
              {subjectProgress.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
                  <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    বিষয়ভিত্তিক প্রগ্রেস
                  </h2>
                  <div className="space-y-5">
                    {subjectProgress.map((subject, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{subject.subject}</span>
                          <span className="text-sm text-muted-foreground">
                            {subject.exams} এক্সাম • {Math.round(subject.accuracy)}%
                          </span>
                        </div>
                        <Progress value={subject.accuracy} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground">
                <h3 className="font-bold text-lg mb-4">দ্রুত অ্যাক্সেস</h3>
                <div className="space-y-3">
                  <Link to="/question-bank">
                    <Button variant="secondary" className="w-full justify-start gap-2">
                      <BookOpen className="w-4 h-4" />
                      প্রশ্নব্যাংক ব্রাউজ করো
                    </Button>
                  </Link>
                  <Link to="/live-exams">
                    <Button variant="secondary" className="w-full justify-start gap-2">
                      <Play className="w-4 h-4" />
                      লাইভ এক্সাম দেখো
                    </Button>
                  </Link>
                  <Link to="/leaderboard">
                    <Button variant="secondary" className="w-full justify-start gap-2">
                      <Trophy className="w-4 h-4" />
                      লিডারবোর্ড চেক করো
                    </Button>
                  </Link>
                  <Link to="/batches">
                    <Button variant="secondary" className="w-full justify-start gap-2">
                      <Layers className="w-4 h-4" />
                      ব্যাচ ব্রাউজ করো
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  অর্জনসমূহ
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {totalExams >= 10 ? (
                    <div className="text-center p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl">
                      <Trophy className="w-8 h-8 text-white mx-auto mb-1" />
                      <div className="text-xs text-white/90">১০+ এক্সাম</div>
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-muted/50 rounded-xl border-2 border-dashed border-border">
                      <div className="w-8 h-8 rounded-full bg-muted mx-auto mb-1 flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">?</span>
                      </div>
                      <div className="text-xs text-muted-foreground">১০ এক্সাম</div>
                    </div>
                  )}
                  {avgScore >= 80 ? (
                    <div className="text-center p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl">
                      <Target className="w-8 h-8 text-white mx-auto mb-1" />
                      <div className="text-xs text-white/90">৮০%+ গড়</div>
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-muted/50 rounded-xl border-2 border-dashed border-border">
                      <div className="w-8 h-8 rounded-full bg-muted mx-auto mb-1 flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">?</span>
                      </div>
                      <div className="text-xs text-muted-foreground">৮০%+ গড়</div>
                    </div>
                  )}
                  {totalExams >= 50 ? (
                    <div className="text-center p-3 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl">
                      <Award className="w-8 h-8 text-white mx-auto mb-1" />
                      <div className="text-xs text-white/90">৫০+ এক্সাম</div>
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-muted/50 rounded-xl border-2 border-dashed border-border">
                      <div className="w-8 h-8 rounded-full bg-muted mx-auto mb-1 flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">?</span>
                      </div>
                      <div className="text-xs text-muted-foreground">৫০ এক্সাম</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
