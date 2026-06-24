import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { doubtApi } from "@/lib/doubt-api";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  HelpCircle,
  ThumbsUp,
  MessageSquare,
  Clock,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  Lock,
  Loader2,
  BookOpen,
  AlertCircle,
  Star,
} from "lucide-react";

interface DoubtAnswer {
  id: string;
  doubt_id: string;
  answerer_id: string;
  answer_text: string;
  is_best_answer: boolean;
  helpful_count: number;
  created_at: string;
  answerer?: { full_name: string | null };
}

interface Doubt {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic?: string;
  priority: string;
  status: string;
  views: number;
  helpful_count: number;
  created_at: string;
  student_id: string;
  student?: { full_name: string | null };
  answer_count?: number;
}

const STATUS_LABELS: Record<string, string> = {
  open: "উন্মুক্ত",
  answered: "উত্তর দেওয়া হয়েছে",
  resolved: "সমাধান হয়েছে",
  closed: "বন্ধ",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "কম",
  medium: "মাঝারি",
  high: "জরুরি",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-amber-100 text-amber-800 border-amber-200",
  answered: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

export default function Doubts() {
  usePageMeta({
    title: "ডাউট সমাধান",
    description: "প্রশ্ন জিজ্ঞাসা করুন এবং শিক্ষক ও সহপাঠীদের সাহায্য পান",
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plan, max_doubts_per_month, loading: subLoading } = useSubscription();

  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [subjects, setSubjects] = useState<string[]>([]);

  // Thread view
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [answers, setAnswers] = useState<DoubtAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Ask form
  const [showAskForm, setShowAskForm] = useState(false);
  const [submittingDoubt, setSubmittingDoubt] = useState(false);
  const [newDoubt, setNewDoubt] = useState({
    title: "",
    description: "",
    subject: "",
    topic: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  // Monthly usage tracking
  const [monthlyDoubtCount, setMonthlyDoubtCount] = useState(0);

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("doubts")
        .select("*, student:profiles!doubts_student_id_fkey(full_name), doubt_answers(count)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (subjectFilter !== "all") query = query.eq("subject", subjectFilter);

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data || []).map((d: any) => ({
        ...d,
        answer_count: d.doubt_answers?.[0]?.count ?? 0,
      }));
      setDoubts(mapped);

      // Build subject list
      const allSubjects = [...new Set(mapped.map((d: Doubt) => d.subject).filter(Boolean))];
      setSubjects(allSubjects as string[]);
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, subjectFilter, toast]);

  const fetchMonthlyUsage = useCallback(async () => {
    if (!user) return;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("doubts")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.id)
      .gte("created_at", startOfMonth.toISOString());
    setMonthlyDoubtCount(count ?? 0);
  }, [user]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  useEffect(() => {
    fetchMonthlyUsage();
  }, [fetchMonthlyUsage]);

  const openThread = async (doubt: Doubt) => {
    setSelectedDoubt(doubt);
    setLoadingAnswers(true);
    try {
      const { data, error } = await supabase
        .from("doubt_answers")
        .select("*, answerer:profiles!doubt_answers_answerer_id_fkey(full_name)")
        .eq("doubt_id", doubt.id)
        .order("is_best_answer", { ascending: false })
        .order("helpful_count", { ascending: false });
      if (error) throw error;
      setAnswers(data || []);
      // Increment views
      await supabase.from("doubts").update({ views: (doubt.views || 0) + 1 }).eq("id", doubt.id);
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setLoadingAnswers(false);
    }
  };

  const closeThread = () => {
    setSelectedDoubt(null);
    setAnswers([]);
    setAnswerText("");
  };

  const handleSubmitDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (max_doubts_per_month !== null && monthlyDoubtCount >= max_doubts_per_month) {
      toast({ title: "সীমা শেষ", description: `আপনার প্ল্যানে মাসে সর্বোচ্চ ${max_doubts_per_month}টি প্রশ্ন করা যায়।`, variant: "destructive" });
      return;
    }
    setSubmittingDoubt(true);
    try {
      await doubtApi.createDoubt(newDoubt);
      toast({ title: "সাফল্য", description: "আপনার প্রশ্ন জমা দেওয়া হয়েছে" });
      setNewDoubt({ title: "", description: "", subject: "", topic: "", priority: "medium" });
      setShowAskForm(false);
      fetchDoubts();
      fetchMonthlyUsage();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setSubmittingDoubt(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!user) { navigate("/login"); return; }
    if (!answerText.trim() || !selectedDoubt) return;
    setSubmittingAnswer(true);
    try {
      await doubtApi.answerDoubt(selectedDoubt.id, answerText.trim());
      toast({ title: "সাফল্য", description: "উত্তর পোস্ট হয়েছে" });
      setAnswerText("");
      openThread(selectedDoubt);
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleHelpful = async (doubtId: string) => {
    if (!user) { navigate("/login"); return; }
    try {
      await doubtApi.markHelpful(doubtId);
      fetchDoubts();
      if (selectedDoubt?.id === doubtId) {
        setSelectedDoubt(prev => prev ? { ...prev, helpful_count: prev.helpful_count + 1 } : prev);
      }
    } catch { /* ignore duplicate */ }
  };

  const canAskDoubt = user && !subLoading && (max_doubts_per_month === null || monthlyDoubtCount < max_doubts_per_month);
  const doubtLimitReached = user && max_doubts_per_month !== null && monthlyDoubtCount >= max_doubts_per_month;

  const filteredDoubts = doubts.filter(d =>
    !searchQuery ||
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background font-bengali">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ডাউট সমাধান</h1>
              <p className="text-sm text-muted-foreground">প্রশ্ন জিজ্ঞাসা করুন, শিক্ষক ও সহপাঠীদের সাহায্য পান</p>
            </div>
          </div>

          {/* Quota bar */}
          {user && plan && max_doubts_per_month !== null && (
            <div className="mt-4 bg-card border border-border rounded-xl p-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>এই মাসে ব্যবহৃত প্রশ্ন</span>
                  <span className="font-medium text-foreground">{monthlyDoubtCount}/{max_doubts_per_month}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min((monthlyDoubtCount / max_doubts_per_month) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {doubtLimitReached && (
                <Button size="sm" variant="outline" onClick={() => navigate("/pricing")} className="text-xs shrink-0">
                  আপগ্রেড করুন
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="প্রশ্ন খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground"
          >
            <option value="all">সব স্ট্যাটাস</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground"
          >
            <option value="all">সব বিষয়</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Ask button */}
          {!user ? (
            <Button onClick={() => navigate("/login")}>লগইন করুন</Button>
          ) : !plan && !subLoading ? (
            <Button variant="outline" onClick={() => navigate("/pricing")} className="gap-2 border-amber-400 text-amber-700 hover:bg-amber-50">
              <Lock className="w-4 h-4" />
              প্ল্যান নিন
            </Button>
          ) : doubtLimitReached ? (
            <Button variant="outline" onClick={() => navigate("/pricing")} className="gap-2 border-amber-400 text-amber-700">
              <AlertCircle className="w-4 h-4" />
              সীমা শেষ
            </Button>
          ) : (
            <Button onClick={() => setShowAskForm(v => !v)} className="gap-2 shrink-0">
              {showAskForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              প্রশ্ন করুন
            </Button>
          )}
        </div>

        {/* Ask Form */}
        {showAskForm && canAskDoubt && (
          <Card className="p-6 mb-6 border-primary/30 bg-primary/5">
            <h2 className="font-semibold text-foreground mb-4">নতুন প্রশ্ন করুন</h2>
            <form onSubmit={handleSubmitDoubt} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">বিষয় <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="যেমন: গণিত, পদার্থবিজ্ঞান"
                    value={newDoubt.subject}
                    onChange={e => setNewDoubt({ ...newDoubt, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">টপিক (ঐচ্ছিক)</label>
                  <Input
                    placeholder="যেমন: দ্বিঘাত সমীকরণ"
                    value={newDoubt.topic}
                    onChange={e => setNewDoubt({ ...newDoubt, topic: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">প্রশ্নের শিরোনাম <span className="text-red-500">*</span></label>
                <Input
                  placeholder="সংক্ষিপ্ত ও স্পষ্ট শিরোনাম লিখুন"
                  value={newDoubt.title}
                  onChange={e => setNewDoubt({ ...newDoubt, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">বিস্তারিত বর্ণনা <span className="text-red-500">*</span></label>
                <Textarea
                  placeholder="আপনার প্রশ্নের বিস্তারিত লিখুন, যত বেশি তথ্য দেবেন তত ভালো উত্তর পাবেন"
                  value={newDoubt.description}
                  onChange={e => setNewDoubt({ ...newDoubt, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-1">অগ্রাধিকার</label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewDoubt({ ...newDoubt, priority: p })}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${newDoubt.priority === p ? PRIORITY_COLORS[p] + " border-current" : "border-border text-muted-foreground"}`}
                      >
                        {PRIORITY_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-5">
                  <Button type="button" variant="outline" onClick={() => setShowAskForm(false)}>বাতিল</Button>
                  <Button type="submit" disabled={submittingDoubt}>
                    {submittingDoubt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                    জমা দিন
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}

        {/* Doubt List */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          </div>
        ) : filteredDoubts.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">কোনো প্রশ্ন পাওয়া যায়নি</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredDoubts.map(doubt => (
              <Card
                key={doubt.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow border border-border"
                onClick={() => openThread(doubt)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[doubt.status] || STATUS_COLORS.open}`}>
                        {STATUS_LABELS[doubt.status] || doubt.status}
                      </span>
                      <Badge variant="secondary" className="text-xs">{doubt.subject}</Badge>
                      {doubt.topic && <Badge variant="outline" className="text-xs">{doubt.topic}</Badge>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[doubt.priority] || ""}`}>
                        {PRIORITY_LABELS[doubt.priority]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 leading-snug">{doubt.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{doubt.description}</p>
                  </div>
                  {doubt.status === "resolved" && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                  )}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(doubt.created_at).toLocaleDateString("bn-BD")}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {doubt.answer_count} উত্তর
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {doubt.helpful_count}
                  </span>
                  {doubt.student?.full_name && (
                    <span className="ml-auto">{doubt.student.full_name}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Thread modal */}
      {selectedDoubt && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-background w-full sm:max-w-2xl sm:rounded-2xl max-h-[92dvh] flex flex-col shadow-xl">
            {/* Thread header */}
            <div className="flex items-start gap-3 p-5 border-b border-border shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[selectedDoubt.status]}`}>
                    {STATUS_LABELS[selectedDoubt.status]}
                  </span>
                  <Badge variant="secondary" className="text-xs">{selectedDoubt.subject}</Badge>
                  {selectedDoubt.topic && <Badge variant="outline" className="text-xs">{selectedDoubt.topic}</Badge>}
                </div>
                <h2 className="font-bold text-foreground text-lg leading-tight">{selectedDoubt.title}</h2>
              </div>
              <button onClick={closeThread} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thread body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Original question */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selectedDoubt.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{new Date(selectedDoubt.created_at).toLocaleString("bn-BD")}</span>
                  <button
                    onClick={e => { e.stopPropagation(); handleHelpful(selectedDoubt.id); }}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {selectedDoubt.helpful_count} সহায়ক
                  </button>
                </div>
              </div>

              {/* Answers */}
              {loadingAnswers ? (
                <div className="text-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></div>
              ) : answers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">এখনো কোনো উত্তর নেই — প্রথম উত্তর দিন!</div>
              ) : (
                answers.map(ans => (
                  <div key={ans.id} className={`border rounded-xl p-4 ${ans.is_best_answer ? "border-green-300 bg-green-50" : "border-border bg-card"}`}>
                    {ans.is_best_answer && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 mb-2">
                        <Star className="w-3.5 h-3.5 fill-green-500 text-green-500" />
                        সেরা উত্তর
                      </div>
                    )}
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{ans.answer_text}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{ans.answerer?.full_name || "শিক্ষক"}</span>
                      <span>{new Date(ans.created_at).toLocaleDateString("bn-BD")}</span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {ans.helpful_count}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Answer input */}
            {user && selectedDoubt.status !== "closed" && (
              <div className="border-t border-border p-4 shrink-0">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="উত্তর লিখুন..."
                    value={answerText}
                    onChange={e => setAnswerText(e.target.value)}
                    rows={2}
                    className="resize-none text-sm flex-1"
                  />
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!answerText.trim() || submittingAnswer}
                    className="self-end"
                    size="icon"
                  >
                    {submittingAnswer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
