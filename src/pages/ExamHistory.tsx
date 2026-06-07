import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, BookOpen, CheckCircle2, Loader2, Target, TrendingUp, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { examsApi } from "@/lib/api";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getSubjectLabel } from "@/lib/subjects";

interface ExamAttempt {
  id: string;
  subject: string;
  topic?: string;
  score: number;
  max_score: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  time_taken_seconds?: number | null;
  created_at: string;
}

function pct(score: number, max: number) {
  return max > 0 ? Math.round((score / max) * 100) : 0;
}

const ExamHistory = () => {
  usePageMeta({
    title: "এক্সাম ইতিহাস ও বিশ্লেষণ",
    description: "তোমার সব এক্সাম অ্যাটেম্পট, স্কোর ট্রেন্ড এবং বিষয়ভিত্তিক নির্ভুলতা বিশ্লেষণ।",
  });

  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (!user) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await examsApi.attempts({ limit: 100 }).catch(() => ({ data: [], total: 0 }));
        if (active) setAttempts((res.data as ExamAttempt[]) || []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authLoading, navigate, user]);

  const trend = useMemo(() => {
    return [...attempts]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((a, i) => ({
        name: `#${i + 1}`,
        date: new Date(a.created_at).toLocaleDateString("bn-BD"),
        accuracy: pct(a.score, a.max_score),
      }));
  }, [attempts]);

  const subjectStats = useMemo(() => {
    const map = new Map<string, { exams: number; correct: number; total: number }>();
    for (const a of attempts) {
      const key = a.subject || "অন্যান্য";
      const cur = map.get(key) || { exams: 0, correct: 0, total: 0 };
      cur.exams += 1;
      cur.correct += a.correct_answers || 0;
      cur.total += a.total_questions || 0;
      map.set(key, cur);
    }
    return Array.from(map.entries())
      .map(([subject, v]) => ({
        subject: getSubjectLabel(subject),
        exams: v.exams,
        accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.exams - a.exams);
  }, [attempts]);

  const summary = useMemo(() => {
    const totalExams = attempts.length;
    const totalCorrect = attempts.reduce((s, a) => s + (a.correct_answers || 0), 0);
    const totalQ = attempts.reduce((s, a) => s + (a.total_questions || 0), 0);
    const avgAccuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
    const best = attempts.reduce((m, a) => Math.max(m, pct(a.score, a.max_score)), 0);
    return { totalExams, avgAccuracy, best };
  }, [attempts]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background font-bengali">
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-bengali">
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">এক্সাম ইতিহাস ও বিশ্লেষণ</h1>
              <p className="text-sm text-muted-foreground">তোমার সব অ্যাটেম্পট, স্কোর ট্রেন্ড ও বিষয়ভিত্তিক পারফরম্যান্স</p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">ড্যাশবোর্ড</Button>
            </Link>
          </div>

          {attempts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center">
              <BookOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">এখনো কোনো এক্সাম দেওয়া হয়নি।</p>
              <Link to="/question-bank">
                <Button variant="hero" size="sm" className="mt-4">প্রথম এক্সাম দাও</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{summary.totalExams}</div>
                  <div className="text-sm text-muted-foreground">মোট এক্সাম</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                    <Target className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{summary.avgAccuracy}%</div>
                  <div className="text-sm text-muted-foreground">গড় নির্ভুলতা</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{summary.best}%</div>
                  <div className="text-sm text-muted-foreground">সেরা স্কোর</div>
                </div>
              </div>

              <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                    <TrendingUp className="h-5 w-5 text-primary" /> স্কোর ট্রেন্ড
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          formatter={(v: number) => [`${v}%`, "নির্ভুলতা"]}
                          labelFormatter={(_, p) => p?.[0]?.payload?.date ?? ""}
                          contentStyle={{ fontSize: 12 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="accuracy"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                    <BarChart3 className="h-5 w-5 text-primary" /> বিষয়ভিত্তিক নির্ভুলতা
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subjectStats} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-15} textAnchor="end" height={50} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip formatter={(v: number) => [`${v}%`, "নির্ভুলতা"]} contentStyle={{ fontSize: 12 }} />
                        <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  <BookOpen className="h-5 w-5 text-primary" /> সব অ্যাটেম্পট ({attempts.length})
                </h2>
                <div className="space-y-3">
                  {attempts.map((a) => {
                    const p = pct(a.score, a.max_score);
                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              p >= 80 ? "bg-secondary/20" : p >= 50 ? "bg-accent/20" : "bg-destructive/20"
                            }`}
                          >
                            {p >= 80 ? (
                              <CheckCircle2 className="h-5 w-5 text-secondary" />
                            ) : p >= 50 ? (
                              <TrendingUp className="h-5 w-5 text-accent" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {getSubjectLabel(a.subject)} {a.topic ? `- ${a.topic}` : ""}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(a.created_at).toLocaleDateString("bn-BD")} • {a.correct_answers}/{a.total_questions} সঠিক
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">
                            {a.score}/{a.max_score}
                          </div>
                          <Badge variant={p >= 50 ? "secondary" : "destructive"}>{p}%</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExamHistory;
