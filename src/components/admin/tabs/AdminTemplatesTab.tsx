import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus, Trash2, Edit2, Loader2, RefreshCw, FilePenLine,
  Clock, BookOpen, Target, Star, TrendingUp, ChevronDown, ChevronUp, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import { adminApi, type ExamTemplate } from "@/lib/admin/admin-api";

const CATEGORIES = [
  { id: "ssc", label: "SSC" },
  { id: "hsc", label: "HSC" },
  { id: "admission", label: "ভর্তি পরীক্ষা" },
  { id: "medical", label: "মেডিকেল" },
  { id: "engineering", label: "ইঞ্জিনিয়ারিং" },
  { id: "university", label: "বিশ্ববিদ্যালয়" },
  { id: "job", label: "চাকরি / BCS" },
  { id: "general", label: "সাধারণ" },
];

const DIFFICULTIES = [
  { id: "easy", label: "সহজ" },
  { id: "medium", label: "মাঝারি" },
  { id: "hard", label: "কঠিন" },
  { id: "all", label: "মিশ্র" },
];

const SUBJECTS = [
  "bangla", "english", "math", "physics", "chemistry",
  "biology", "gk", "ict", "science", "computer", "iq",
];
const SUBJECT_LABELS: Record<string, string> = {
  bangla: "বাংলা", english: "ইংরেজি", math: "গণিত",
  physics: "পদার্থ", chemistry: "রসায়ন", biology: "জীববিজ্ঞান",
  gk: "সাধারণ জ্ঞান", ict: "ICT", science: "বিজ্ঞান",
  computer: "কম্পিউটার", iq: "বুদ্ধিমত্তা",
};

type TemplateForm = {
  title: string;
  category: string;
  description: string;
  question_count: number;
  duration_minutes: number;
  marks_per_question: number;
  negative_marks: number;
  difficulty: string;
  subjects: string[];
  features: string;
};

const defaultForm: TemplateForm = {
  title: "",
  category: "general",
  description: "",
  question_count: 25,
  duration_minutes: 30,
  marks_per_question: 1,
  negative_marks: 0,
  difficulty: "medium",
  subjects: [],
  features: "",
};

export default function AdminTemplatesTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(defaultForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.templates();
      setTemplates(res.data || []);
    } catch (e) {
      console.error("[v0] AdminTemplatesTab fetch error:", e);
      toast({ title: "ত্রুটি", description: "টেমপ্লেট লোড করা যায়নি", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates, refreshTrigger]);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (t: ExamTemplate) => {
    setEditingId(t.id);
    setForm({
      title: t.title,
      category: t.category,
      description: t.description || "",
      question_count: t.question_count,
      duration_minutes: t.duration_minutes,
      marks_per_question: t.marks_per_question,
      negative_marks: t.negative_marks,
      difficulty: t.difficulty || "medium",
      subjects: t.subjects || [],
      features: (t.features || []).join(", "),
    });
    setDialogOpen(true);
  };

  const toggleSubject = (s: string) => {
    setForm(p => ({
      ...p,
      subjects: p.subjects.includes(s)
        ? p.subjects.filter(x => x !== s)
        : [...p.subjects, s],
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.category) {
      toast({ title: "ত্রুটি", description: "শিরোনাম ও ক্যাটেগরি দেওয়া আবশ্যক", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description || null,
        question_count: form.question_count,
        duration_minutes: form.duration_minutes,
        marks_per_question: form.marks_per_question,
        negative_marks: form.negative_marks,
        difficulty: form.difficulty,
        subjects: form.subjects,
        features: form.features ? form.features.split(",").map(s => s.trim()).filter(Boolean) : [],
        subjects_breakdown: [],
        topics: {},
      };
      if (editingId) {
        await adminApi.updateTemplate(editingId, payload);
        toast({ title: "সাফল্য", description: "টেমপ্লেট আপডেট হয়েছে" });
      } else {
        await adminApi.createTemplate(payload);
        toast({ title: "সাফল্য", description: "নতুন টেমপ্লেট তৈরি হয়েছে" });
      }
      setDialogOpen(false);
      fetchTemplates();
    } catch (e: unknown) {
      toast({ title: "ত্রুটি", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteTemplate(id);
      toast({ title: "সাফল্য", description: "টেমপ্লেট মুছে দেওয়া হয়েছে" });
      fetchTemplates();
    } catch (e: unknown) {
      toast({ title: "ত্রুটি", description: (e as Error).message, variant: "destructive" });
    }
  };

  const catLabel = (cat: string) => CATEGORIES.find(c => c.id === cat)?.label || cat;
  const diffLabel = (d: string | null) => DIFFICULTIES.find(x => x.id === d)?.label || d || "-";

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesCat    = !filterCategory || t.category === filterCategory;
      const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [templates, filterCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">এক্সাম টেমপ্লেট</h2>
          <p className="text-sm text-muted-foreground mt-0.5">মোট {templates.length}টি টেমপ্লেট</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTemplates} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            রিফ্রেশ
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            নতুন টেমপ্লেট
          </Button>
        </div>
      </div>

      {/* ── Filter / Search Bar ─────────────────────────────────────────── */}
      {!loading && (
        <Card>
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="টেমপ্লেট নাম দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={filterCategory === "" ? "default" : "outline"}
                onClick={() => setFilterCategory("")}>সব ক্যাটেগরি</Button>
              {CATEGORIES.map(cat => (
                <Button key={cat.id} size="sm" variant={filterCategory === cat.id ? "default" : "outline"}
                  onClick={() => setFilterCategory(cat.id === filterCategory ? "" : cat.id)}>{cat.label}</Button>
              ))}
            </div>
            {(searchQuery || filterCategory) && (
              <p className="text-xs text-muted-foreground">দেখাচ্ছে: {filteredTemplates.length}/{templates.length}টি</p>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <FilePenLine className="h-12 w-12 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">{searchQuery || filterCategory ? "কোনো ফলাফল পাওয়া যায়নি" : "কোনো টেমপ্লেট নেই"}</p>
            {!searchQuery && !filterCategory && (
              <Button size="sm" onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                প্রথম টেমপ্লেট তৈরি করুন
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTemplates.map(t => (
            <Card key={t.id} className="overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
              >
                {/* Icon */}
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FilePenLine className="h-5 w-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate">{t.title}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{catLabel(t.category)}</Badge>
                    {t.difficulty && (
                      <Badge
                        className={`text-xs shrink-0 ${
                          t.difficulty === "easy" ? "bg-green-100 text-green-700" :
                          t.difficulty === "hard" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {diffLabel(t.difficulty)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{t.question_count} প্রশ্ন</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration_minutes} মিনিট</span>
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" />{t.marks_per_question} নম্বর/প্রশ্ন</span>
                    {t.attempts > 0 && <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{t.attempts} বার</span>}
                    {t.rating && t.rating > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{t.rating.toFixed(1)}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>টেমপ্লেট মুছে দিবেন?</AlertDialogTitle>
                        <AlertDialogDescription>এই টেমপ্লেটটি স্থায়ীভাবে মুছে যাবে।</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>বাতিল</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-destructive hover:bg-destructive/90">
                          মুছুন
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {expandedId === t.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Expanded */}
              {expandedId === t.id && (
                <div className="px-4 pb-4 pt-0 border-t border-border">
                  <div className="pt-3 grid sm:grid-cols-2 gap-3">
                    {t.description && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-muted-foreground font-medium mb-1">বিবরণ</p>
                        <p className="text-sm">{t.description}</p>
                      </div>
                    )}
                    {t.subjects && t.subjects.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">বিষয়সমূহ</p>
                        <div className="flex flex-wrap gap-1">
                          {t.subjects.map(s => (
                            <Badge key={s} variant="outline" className="text-xs">{SUBJECT_LABELS[s] || s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {t.features && t.features.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">ফিচার</p>
                        <div className="flex flex-wrap gap-1">
                          {t.features.map((f, i) => (
                            <Badge key={i} className="text-xs bg-primary/10 text-primary">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">নেগেটিভ মার্কিং</p>
                      <p className="text-sm">{t.negative_marks > 0 ? `-${t.negative_marks} প্রতি ভুল` : "নেই"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">তৈরির তারিখ</p>
                      <p className="text-sm">{new Date(t.created_at).toLocaleDateString("bn-BD")}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "টেমপ্লেট সম্পাদনা" : "নতুন এক্সাম টেমপ্লেট"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>শিরোনাম</Label>
                <Input
                  placeholder="যেমন: SSC বাংলা মডেল টেস্ট"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>ক্যাটেগরি</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>কঠিনতা</Label>
                <Select value={form.difficulty} onValueChange={v => setForm(p => ({ ...p, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>বিবরণ (ঐচ্ছিক)</Label>
                <Textarea
                  placeholder="এক্সামের সংক্ষিপ্ত বিবরণ..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>

            {/* Exam Config */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label>প্রশ্ন সংখ্যা</Label>
                <Input
                  type="number" min={1} max={200}
                  value={form.question_count}
                  onChange={e => setForm(p => ({ ...p, question_count: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>সময় (মিনিট)</Label>
                <Input
                  type="number" min={1} max={300}
                  value={form.duration_minutes}
                  onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>নম্বর/প্রশ্ন</Label>
                <Input
                  type="number" min={0.25} max={10} step={0.25}
                  value={form.marks_per_question}
                  onChange={e => setForm(p => ({ ...p, marks_per_question: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>নেগেটিভ</Label>
                <Input
                  type="number" min={0} max={5} step={0.25}
                  value={form.negative_marks}
                  onChange={e => setForm(p => ({ ...p, negative_marks: Number(e.target.value) }))}
                />
              </div>
            </div>

            {/* Subjects */}
            <div className="space-y-2">
              <Label>বিষয়সমূহ</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSubject(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.subjects.includes(s)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {SUBJECT_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-1.5">
              <Label>ফিচার (কমা দিয়ে আলাদা করুন)</Label>
              <Input
                placeholder="যেমন: নেগেটিভ মার্কিং, টাইমার, রিভিউ মোড"
                value={form.features}
                onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? "আপডেট করুন" : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
