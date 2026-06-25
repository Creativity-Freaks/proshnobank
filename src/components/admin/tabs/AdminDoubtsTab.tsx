import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  HelpCircle,
  MessageSquare,
  Clock,
  Search,
  CheckCircle2,
  X,
  Send,
  Loader2,
  Star,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DoubtAnswer {
  id: string;
  doubt_id: string;
  answerer_id: string;
  answer_text: string;
  image_url?: string | null;
  is_best_answer: boolean;
  helpful_count: number;
  created_at: string;
  answerer?: { full_name: string | null };
}

interface Doubt {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  subject: string;
  topic?: string;
  priority: string;
  status: string;
  views: number;
  helpful_count: number;
  created_at: string;
  student_id: string;
  student?: { full_name: string | null; email: string | null };
  answer_count?: number;
}

const STATUS_OPTIONS = [
  { value: "open", label: "উন্মুক্ত", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "answered", label: "উত্তর দেওয়া হয়েছে", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "resolved", label: "সমাধান হয়েছে", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "closed", label: "বন্ধ", color: "bg-gray-100 text-gray-600 border-gray-200" },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};
const PRIORITY_LABELS: Record<string, string> = { low: "কম", medium: "মাঝারি", high: "জরুরি" };

export default function AdminDoubtsTab() {
  const { toast } = useToast();

  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Category → Subject cascade filter
  const [filterCategories, setFilterCategories] = useState<{ id: string; name: string }[]>([]);
  const [filterSubjectsAll, setFilterSubjectsAll] = useState<{ id: string; name: string; category_id: string }[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");

  // Thread view
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [answers, setAnswers] = useState<DoubtAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [adminAnswer, setAdminAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total: 0, open: 0, answered: 0, resolved: 0 });

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("doubts")
        .select("*, doubt_answers(count)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (priorityFilter !== "all") query = query.eq("priority", priorityFilter);
      if (filterSubjectId) query = query.eq("subject_id", filterSubjectId);
      else if (filterCategoryId) query = query.eq("category_id", filterCategoryId);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const rows = data || [];

      // Fetch profiles separately — no FK registered to profiles in schema cache
      const studentIds = [...new Set(rows.map((d: any) => d.student_id).filter(Boolean))];
      const profileMap: Record<string, { full_name: string | null; email: string | null }> = {};
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", studentIds);
        (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });
      }

      const mapped = rows.map((d: any) => ({
        ...d,
        answer_count: d.doubt_answers?.[0]?.count ?? 0,
        student: profileMap[d.student_id] ?? null,
      }));
      setDoubts(mapped);

      // Stats
      setStats({
        total: mapped.length,
        open: mapped.filter((d: Doubt) => d.status === "open").length,
        answered: mapped.filter((d: Doubt) => d.status === "answered").length,
        resolved: mapped.filter((d: Doubt) => d.status === "resolved").length,
      });
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, filterCategoryId, filterSubjectId, toast]);

  useEffect(() => { fetchDoubts(); }, [fetchDoubts]);

  useEffect(() => {
    Promise.all([
      supabase.from("exam_categories").select("id, name").is("parent_id", null).order("sort_order"),
      supabase.from("subjects").select("id, name, category_id").order("name"),
    ]).then(([{ data: cats }, { data: subs }]) => {
      setFilterCategories(cats || []);
      setFilterSubjectsAll(subs || []);
    });
  }, []);

  const openThread = async (doubt: Doubt) => {
    setSelectedDoubt(doubt);
    setLoadingAnswers(true);
    try {
      const { data, error } = await supabase
        .from("doubt_answers")
        .select("*")
        .eq("doubt_id", doubt.id)
        .order("is_best_answer", { ascending: false })
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);

      const rows = data || [];
      const answererIds = [...new Set(rows.map((a: any) => a.answerer_id).filter(Boolean))];
      const profileMap: Record<string, { full_name: string | null }> = {};
      if (answererIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", answererIds);
        (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });
      }
      setAnswers(rows.map((a: any) => ({ ...a, answerer: profileMap[a.answerer_id] ?? null })));
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleStatusChange = async (doubtId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("doubts")
        .update({
          status: newStatus,
          resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
        })
        .eq("id", doubtId);
      if (error) throw new Error(error.message);
      toast({ title: "সাফল্য", description: "স্ট্যাটাস আপডেট হয়েছে" });
      fetchDoubts();
      if (selectedDoubt?.id === doubtId) {
        setSelectedDoubt(prev => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    }
  };

  const handleAdminAnswer = async () => {
    if (!adminAnswer.trim() || !selectedDoubt) return;
    setSubmittingAnswer(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("doubt_answers").insert({
        doubt_id: selectedDoubt.id,
        answerer_id: user.id,
        answer_text: adminAnswer.trim(),
      });
      if (error) throw new Error(error.message);

      // Auto-mark as answered
      if (selectedDoubt.status === "open") {
        await supabase.from("doubts").update({ status: "answered" }).eq("id", selectedDoubt.id);
        setSelectedDoubt(prev => prev ? { ...prev, status: "answered" } : prev);
      }

      toast({ title: "সাফল্য", description: "উত্তর পোস্ট হয়েছে" });
      setAdminAnswer("");
      openThread(selectedDoubt);
      fetchDoubts();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleMarkBestAnswer = async (answerId: string) => {
    if (!selectedDoubt) return;
    try {
      // Unmark all first
      await supabase.from("doubt_answers").update({ is_best_answer: false }).eq("doubt_id", selectedDoubt.id);
      // Mark selected
      const { error } = await supabase.from("doubt_answers").update({ is_best_answer: true }).eq("id", answerId);
      if (error) throw new Error(error.message);
      // Mark doubt as resolved
      await supabase.from("doubts").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", selectedDoubt.id);
      toast({ title: "সাফল্য", description: "সেরা উত্তর চিহ্নিত এবং সমাধান হয়েছে" });
      setSelectedDoubt(prev => prev ? { ...prev, status: "resolved" } : prev);
      openThread(selectedDoubt);
      fetchDoubts();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteDoubt = async (doubtId: string) => {
    if (!confirm("এই প্রশ্নটি মুছে দিবেন?")) return;
    try {
      await supabase.from("doubt_answers").delete().eq("doubt_id", doubtId);
      await supabase.from("doubt_helpful").delete().eq("doubt_id", doubtId);
      const { error } = await supabase.from("doubts").delete().eq("id", doubtId);
      if (error) throw new Error(error.message);
      toast({ title: "সাফল্য", description: "প্রশ্ন মুছে দেওয়া হয়েছে" });
      if (selectedDoubt?.id === doubtId) { setSelectedDoubt(null); setAnswers([]); }
      fetchDoubts();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    }
  };

  const statusInfo = (s: string) => STATUS_OPTIONS.find(o => o.value === s) || STATUS_OPTIONS[0];

  const filteredDoubts = doubts.filter(d =>
    !searchQuery ||
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.student?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 font-bengali space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "মোট প্রশ্ন", value: stats.total, icon: HelpCircle, color: "text-primary" },
          { label: "উন্মুক্ত", value: stats.open, icon: AlertCircle, color: "text-amber-600" },
          { label: "উত্তর দেওয়া", value: stats.answered, icon: MessageSquare, color: "text-blue-600" },
          { label: "সমাধান", value: stats.resolved, icon: CheckCircle2, color: "text-green-600" },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
            <div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="প্রশ্ন বা শিক্ষার্থীর নাম..."
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
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground"
        >
          <option value="all">সব অগ্রাধিকার</option>
          {Object.entries(PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select
          value={filterCategoryId}
          onChange={e => { setFilterCategoryId(e.target.value); setFilterSubjectId(""); }}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground"
        >
          <option value="">সব ক্যাটেগরি</option>
          {filterCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {filterCategoryId && (
          <select
            value={filterSubjectId}
            onChange={e => setFilterSubjectId(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground"
          >
            <option value="">সব বিষয়</option>
            {filterSubjectsAll.filter(s => s.category_id === filterCategoryId).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Doubt list */}
      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
      ) : filteredDoubts.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">কোনো প্রশ্ন পাওয়া যায়নি</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredDoubts.map(doubt => {
            const si = statusInfo(doubt.status);
            return (
              <Card key={doubt.id} className="p-4 border border-border hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${si.color}`}>{si.label}</span>
                      <Badge variant="secondary" className="text-xs">{doubt.subject}</Badge>
                      {doubt.topic && <Badge variant="outline" className="text-xs">{doubt.topic}</Badge>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[doubt.priority]}`}>{PRIORITY_LABELS[doubt.priority]}</span>
                    </div>
                    <p className="font-semibold text-foreground leading-snug truncate">{doubt.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{doubt.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">{doubt.student?.full_name || "অজানা"}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(doubt.created_at).toLocaleDateString("bn-BD")}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{doubt.answer_count}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{doubt.views}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{doubt.helpful_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openThread(doubt)}>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      দেখুন
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="w-7 h-7">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="font-bengali">
                        {STATUS_OPTIONS.filter(o => o.value !== doubt.status).map(o => (
                          <DropdownMenuItem key={o.value} onClick={() => handleStatusChange(doubt.id, o.value)}>
                            {o.label} হিসেবে চিহ্��িত করুন
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteDoubt(doubt.id)}>
                          মুছে দিন
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Thread modal */}
      {selectedDoubt && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-background w-full sm:max-w-2xl sm:rounded-2xl max-h-[92dvh] flex flex-col shadow-xl font-bengali">
            {/* Header */}
            <div className="flex items-start gap-3 p-5 border-b border-border shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusInfo(selectedDoubt.status).color}`}>
                    {statusInfo(selectedDoubt.status).label}
                  </span>
                  <Badge variant="secondary" className="text-xs">{selectedDoubt.subject}</Badge>
                  {/* Status changer */}
                  <select
                    value={selectedDoubt.status}
                    onChange={e => handleStatusChange(selectedDoubt.id, e.target.value)}
                    className="text-xs px-2 py-0.5 rounded-md border border-input bg-background text-foreground"
                  >
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <h2 className="font-bold text-foreground leading-tight">{selectedDoubt.title}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedDoubt.student?.full_name} &middot; {selectedDoubt.student?.email}
                </p>
              </div>
              <button onClick={() => { setSelectedDoubt(null); setAnswers([]); setAdminAnswer(""); }}
                className="text-muted-foreground hover:text-foreground p-1 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {/* Question */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selectedDoubt.description}</p>
                {selectedDoubt.image_url && (
                  <img
                    src={selectedDoubt.image_url}
                    alt="প্রশ্নের ছবি"
                    className="mt-3 max-h-64 rounded-lg border border-border object-contain cursor-pointer"
                    onClick={() => window.open(selectedDoubt.image_url!, "_blank")}
                  />
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span><Clock className="w-3 h-3 inline mr-1" />{new Date(selectedDoubt.created_at).toLocaleString("bn-BD")}</span>
                  <span><Eye className="w-3 h-3 inline mr-1" />{selectedDoubt.views} বার দেখা হয়েছে</span>
                  <span><ThumbsUp className="w-3 h-3 inline mr-1" />{selectedDoubt.helpful_count} সহায়ক</span>
                </div>
              </div>

              {/* Answers */}
              {loadingAnswers ? (
                <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></div>
              ) : answers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">এখনো কোনো উত্তর নেই</p>
              ) : (
                answers.map(ans => (
                  <div key={ans.id} className={`border rounded-xl p-4 ${ans.is_best_answer ? "border-green-300 bg-green-50" : "border-border bg-card"}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {ans.is_best_answer && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
                            <Star className="w-3 h-3 fill-green-500 text-green-500" /> সেরা উত্তর
                          </span>
                        )}
                        <span className="text-xs font-medium text-foreground/80">{ans.answerer?.full_name || "শিক্ষক"}</span>
                        <span className="text-xs text-muted-foreground">{new Date(ans.created_at).toLocaleDateString("bn-BD")}</span>
                      </div>
                      {!ans.is_best_answer && (
                        <Button size="sm" variant="outline" className="text-xs h-6 px-2" onClick={() => handleMarkBestAnswer(ans.id)}>
                          <Star className="w-3 h-3 mr-1" />
                          সেরা উত্তর
                        </Button>
                      )}
                    </div>
                    {ans.answer_text.trim() && (
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{ans.answer_text}</p>
                    )}
                    {ans.image_url && (
                      <img
                        src={ans.image_url}
                        alt="উত্তরের ছবি"
                        className="mt-2 max-h-56 rounded-lg border border-border object-contain cursor-pointer"
                        onClick={() => window.open(ans.image_url!, "_blank")}
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Admin answer input */}
            <div className="border-t border-border p-4 shrink-0">
              <p className="text-xs font-medium text-muted-foreground mb-2">অ্যাডমিন/শিক্ষক উত্তর</p>
              <div className="flex gap-2">
                <Textarea
                  placeholder="এই প্রশ্নের উত্তর লিখুন..."
                  value={adminAnswer}
                  onChange={e => setAdminAnswer(e.target.value)}
                  rows={2}
                  className="resize-none text-sm flex-1"
                />
                <Button
                  onClick={handleAdminAnswer}
                  disabled={!adminAnswer.trim() || submittingAnswer}
                  className="self-end"
                  size="icon"
                >
                  {submittingAnswer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
