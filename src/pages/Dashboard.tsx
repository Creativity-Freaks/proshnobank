import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { examsApi } from "@/lib/api";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  BookOpen, Trophy, Clock, Target, TrendingUp, Calendar,
  Award, ChevronRight, Play, CheckCircle2, XCircle, BarChart3,
  User, Loader2,
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

const Dashboard = () => {
  usePageMeta({
    title: "ড্যাশবোর্ড",
    description: "তোমার সাম্প্রতিক এক্সাম, বিষয়ভিত্তিক প্রগ্রেস এবং পারফরম্যান্স ট্র্যাক করো।",
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
    if (user) {
      loadData();
    }
  }, [authLoading, loadData, navigate, user]);

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
                  <Link to="/exam-history">
                    <Button variant="ghost" size="sm" className="gap-1">
                      সম্পূর্ণ ইতিহাস <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
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
                              <h3 className="font-semibold text-foreground">{exam.subject} {exam.topic ? `- ${exam.topic}` : ""}</h3>
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
                        <span className="text-muted-foreground">?</span>
                      </div>
                      <div className="text-xs text-muted-foreground">১০ এক্সাম দাও</div>
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
                        <span className="text-muted-foreground">?</span>
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
                        <span className="text-muted-foreground">?</span>
                      </div>
                      <div className="text-xs text-muted-foreground">৫০ এক্সাম দাও</div>
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
