import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Edit2, Loader2, Search, X, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category { id: string; name: string; }
interface Subject   { id: string; name: string; category_id: string; }
interface Chapter   { id: string; chapter_name_bn: string; chapter_number: number; subject_id: string; }

export default function AdminQuestionsTab() {
  const { toast } = useToast();
  const { refreshTrigger } = useAdmin();

  // ── Hierarchy state ──────────────────────────────────────────────────────────
  const [categories,       setCategories]       = useState<Category[]>([]);
  const [subjects,         setSubjects]         = useState<Subject[]>([]);
  const [chapters,         setChapters]         = useState<Chapter[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubject,  setSelectedSubject]  = useState<string>("");
  const [selectedChapter,  setSelectedChapter]  = useState<string>("");

  // ── Question list state ──────────────────────────────────────────────────────
  const [questions,   setQuestions]   = useState<any[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Form state ───────────────────────────────────────────────────────────────
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData,  setFormData]  = useState({
    category_id:    "",
    subject_id:     "",
    chapter_id:     "",
    // legacy text fields kept for backward compat
    subject:        "",
    topic:          "",
    difficulty:     "medium",
    question_text:  "",
    options:        ["", "", "", ""],
    correct_answer: 0,
    explanation:    "",
  });

  // form-level cascade
  const [formSubjects, setFormSubjects] = useState<Subject[]>([]);
  const [formChapters, setFormChapters] = useState<Chapter[]>([]);

  // ── Fetch categories once ────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from("exam_categories")
      .select("id, name")
      .is("parent_id", null)
      .order("sort_order", { ascending: true });
    setCategories(data || []);
  }, []);

  // ── Fetch subjects when filter category changes ──────────────────────────────
  const fetchSubjectsForFilter = useCallback(async (catId: string) => {
    if (!catId) { setSubjects([]); setSelectedSubject(""); setChapters([]); setSelectedChapter(""); return; }
    const { data } = await supabase
      .from("subjects")
      .select("id, name, category_id")
      .eq("category_id", catId)
      .order("name");
    setSubjects(data || []);
    setSelectedSubject("");
    setChapters([]);
    setSelectedChapter("");
  }, []);

  // ── Fetch chapters when filter subject changes ───────────────────────────────
  const fetchChaptersForFilter = useCallback(async (subId: string) => {
    if (!subId) { setChapters([]); setSelectedChapter(""); return; }
    const { data } = await supabase
      .from("chapters")
      .select("id, chapter_name_bn, chapter_number, subject_id")
      .eq("subject_id", subId)
      .order("display_order", { ascending: true });
    setChapters(data || []);
    setSelectedChapter("");
  }, []);

  // ── Fetch questions ──────────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("question_bank")
        .select(`id, subject, topic, difficulty, question_text, options, correct_answer, explanation, created_at,
                 category_id, subject_id, chapter_id,
                 exam_categories(name), subjects(name), chapters(chapter_name_bn)`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (selectedCategory) query = query.eq("category_id", selectedCategory);
      if (selectedSubject)  query = query.eq("subject_id",  selectedSubject);
      if (selectedChapter)  query = query.eq("chapter_id",  selectedChapter);
      if (searchQuery)      query = query.ilike("question_text", `%${searchQuery}%`);

      const { data, error } = await query;
      if (error) {
        toast({ title: "Error", description: error.message || "প্রশ্ন লোড করতে ব্যর্থ", variant: "destructive" });
      }
      setQuestions(data || []);
    } catch {
      toast({ title: "Error", description: "প্রশ্ন লোড করতে ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSubject, selectedChapter, searchQuery, refreshTrigger]);

  // ── Fetch form subjects/chapters ─────────────────────────────────────────────
  const fetchFormSubjects = async (catId: string) => {
    if (!catId) { setFormSubjects([]); return; }
    const { data } = await supabase.from("subjects").select("id, name, category_id").eq("category_id", catId).order("name");
    setFormSubjects(data || []);
    setFormData(prev => ({ ...prev, subject_id: "", chapter_id: "" }));
    setFormChapters([]);
  };

  const fetchFormChapters = async (subId: string) => {
    if (!subId) { setFormChapters([]); return; }
    const { data } = await supabase.from("chapters").select("id, chapter_name_bn, chapter_number, subject_id").eq("subject_id", subId).order("display_order", { ascending: true });
    setFormChapters(data || []);
    setFormData(prev => ({ ...prev, chapter_id: "" }));
  };

  // ── Effects ───────────────────────────��──────────────────────────────────────
  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchSubjectsForFilter(selectedCategory); }, [selectedCategory]);
  useEffect(() => { fetchChaptersForFilter(selectedSubject); },  [selectedSubject]);
  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই প্রশ্ন মুছে দিতে চান?")) return;
    try {
      const { error } = await supabase.from("question_bank").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "সাফল্য", description: "প্রশ্ন মুছে দেওয়া হয়েছে" });
      fetchQuestions();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "মুছতে ব্যর্থ", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!formData.category_id) {
      toast({ title: "Error", description: "ক্যাটেগরি বাধ্যতামূলক", variant: "destructive" });
      return;
    }
    if (!formData.subject_id) {
      toast({ title: "Error", description: "বিষয় বাধ্যতামূলক", variant: "destructive" });
      return;
    }
    if (!formData.question_text.trim()) {
      toast({ title: "Error", description: "প্রশ্ন টেক্সট বাধ্যতামূলক", variant: "destructive" });
      return;
    }
    if (formData.options.some(o => !o.trim())) {
      toast({ title: "Error", description: "সব বিকল্প পূরণ করুন", variant: "destructive" });
      return;
    }

    // derive legacy text fields from FK selections
    const catName = categories.find(c => c.id === formData.category_id)?.name || "";
    const subName = formSubjects.find(s => s.id === formData.subject_id)?.name || formData.subject;
    const chapName = formChapters.find(c => c.id === formData.chapter_id)?.chapter_name_bn || formData.topic;

    try {
      const payload: any = {
        category_id:    formData.category_id || null,
        subject_id:     formData.subject_id  || null,
        chapter_id:     formData.chapter_id  || null,
        subject:        subName,
        topic:          chapName || formData.topic.trim(),
        difficulty:     formData.difficulty as "easy" | "medium" | "hard",
        question_text:  formData.question_text.trim(),
        options:        formData.options,
        correct_answer: parseInt(String(formData.correct_answer)),
        explanation:    formData.explanation.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase.from("question_bank").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "প্রশ্ন আপডেট হয়েছে" });
      } else {
        const { error } = await supabase.from("question_bank").insert([payload]);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "প্রশ্ন তৈরি হয়েছে" });
      }
      resetForm();
      fetchQuestions();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "সংরক্ষণ করতে ব্যর্থ", variant: "destructive" });
    }
  };

  const handleEdit = (q: any) => {
    setEditingId(q.id);
    const newFormData = {
      category_id:    q.category_id || "",
      subject_id:     q.subject_id  || "",
      chapter_id:     q.chapter_id  || "",
      subject:        q.subject     || "",
      topic:          q.topic       || "",
      difficulty:     q.difficulty  || "medium",
      question_text:  q.question_text || "",
      options:        Array.isArray(q.options) ? q.options : ["", "", "", ""],
      correct_answer: q.correct_answer ?? 0,
      explanation:    q.explanation || "",
    };
    setFormData(newFormData);
    if (q.category_id) {
      supabase.from("subjects").select("id, name, category_id").eq("category_id", q.category_id).order("name")
        .then(({ data }) => {
          setFormSubjects(data || []);
          if (q.subject_id) {
            supabase.from("chapters").select("id, chapter_name_bn, chapter_number, subject_id").eq("subject_id", q.subject_id).order("display_order", { ascending: true })
              .then(({ data: cdata }) => setFormChapters(cdata || []));
          }
        });
    }
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ category_id: "", subject_id: "", chapter_id: "", subject: "", topic: "", difficulty: "medium", question_text: "", options: ["", "", "", ""], correct_answer: 0, explanation: "" });
    setFormSubjects([]);
    setFormChapters([]);
    setShowForm(false);
  };

  // ── Derived display ──────────────────────────────────────────────────────────
  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;
  const selectedSubjectName  = subjects.find(s => s.id === selectedSubject)?.name;
  const selectedChapterName  = chapters.find(c => c.id === selectedChapter)?.chapter_name_bn;

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">প্রশ্ন ব্যবস্থাপনা</h2>
          <p className="text-sm text-muted-foreground mt-1">মোট {questions.length}টি প্রশ্ন দেখাচ্ছে</p>
        </div>
        <Button className="gap-2" onClick={() => { if (showForm) resetForm(); else { setShowForm(true); setEditingId(null); } }}>
          <Plus className="w-4 h-4" />
          {showForm ? "বাতিল করুন" : "নতুন প্রশ্ন"}
        </Button>
      </div>

      {/* ── Question Form ────────────────────────────────────────────────────── */}
      {showForm && (
        <Card className="border-2 border-primary">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? "প্রশ্ন সম্পাদনা করুন" : "নতুন প্রশ্ন যোগ করুন"}</CardTitle>
            <Button size="sm" variant="ghost" onClick={resetForm}><X className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Step 1: Category */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">১</span>
                ক্যাটেগরি <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id} type="button"
                    onClick={() => { setFormData(p => ({ ...p, category_id: cat.id, subject_id: "", chapter_id: "" })); fetchFormSubjects(cat.id); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${formData.category_id === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Subject */}
            {formData.category_id && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">২</span>
                  বিষ��় <span className="text-destructive">*</span>
                </Label>
                {formSubjects.length === 0 ? (
                  <p className="text-xs text-muted-foreground">এই ক্যাটেগরিতে কোনো বিষয় নেই</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formSubjects.map(sub => (
                      <button
                        key={sub.id} type="button"
                        onClick={() => { setFormData(p => ({ ...p, subject_id: sub.id, subject: sub.name, chapter_id: "" })); fetchFormChapters(sub.id); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${formData.subject_id === sub.id ? "bg-secondary text-secondary-foreground border-secondary" : "bg-background border-border hover:bg-muted"}`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Chapter (optional) */}
            {formData.subject_id && formChapters.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-bold shrink-0">৩</span>
                  অধ্যায় <span className="text-muted-foreground text-xs">(ঐচ্ছিক)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, chapter_id: "" }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${!formData.chapter_id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}
                  >
                    সব অধ্যায়
                  </button>
                  {formChapters.map(ch => (
                    <button
                      key={ch.id} type="button"
                      onClick={() => setFormData(p => ({ ...p, chapter_id: ch.id, topic: ch.chapter_name_bn }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${formData.chapter_id === ch.id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}
                    >
                      {ch.chapter_number}. {ch.chapter_name_bn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Topic (manual if no chapter selected) */}
            {formData.subject_id && formChapters.length === 0 && (
              <div className="space-y-2">
                <Label>অধ্যায়/টপিক</Label>
                <Input
                  placeholder="যেমন: বীজগণিত, অনুচ্ছেদ রচনা"
                  value={formData.topic}
                  onChange={e => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>কঠিনতা স্তর</Label>
                <div className="flex gap-2">
                  {[{ value: "easy", label: "সহজ" }, { value: "medium", label: "মাঝারি" }, { value: "hard", label: "কঠিন" }].map(level => (
                    <Button key={level.value} size="sm" type="button" variant={formData.difficulty === level.value ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, difficulty: level.value })}>{level.label}</Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>সঠিক উত্তর *</Label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map(index => (
                    <Button key={index} size="sm" type="button" variant={formData.correct_answer === index ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, correct_answer: index })}>{index + 1}</Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>প্রশ্ন টেক্সট *</Label>
              <Textarea placeholder="প্রশ্ন এখানে লিখুন..." value={formData.question_text}
                onChange={e => setFormData({ ...formData, question_text: e.target.value })} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>বিকল্পগুলি *</Label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${formData.correct_answer === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {index + 1}
                  </span>
                  <Input placeholder={`বিকল্প ${index + 1}`} value={option}
                    onChange={e => { const opts = [...formData.options]; opts[index] = e.target.value; setFormData({ ...formData, options: opts }); }} />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>ব্যাখ্যা (ঐচ্ছিক)</Label>
              <Textarea placeholder="সঠিক উত্তরের ব্যাখ্যা..." value={formData.explanation}
                onChange={e => setFormData({ ...formData, explanation: e.target.value })} rows={2} />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">{editingId ? "আপডেট করুন" : "প্রশ্ন সংরক্ষণ করুন"}</Button>
              <Button onClick={resetForm} variant="outline" className="flex-1">বাতিল করুন</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ফিল্টার এবং অনুসন্ধান</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="প্রশ্নের টেক্সট দিয়ে খুঁজুন..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>

          {/* Step 1: Category */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Layers className="h-3 w-3" /> ক্যাটেগরি
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={selectedCategory === "" ? "default" : "outline"}
                onClick={() => setSelectedCategory("")}>সব</Button>
              {categories.map(cat => (
                <Button key={cat.id} size="sm" variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id === selectedCategory ? "" : cat.id)}>{cat.name}</Button>
              ))}
            </div>
          </div>

          {/* Step 2: Subject */}
          {selectedCategory && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <ChevronRight className="h-3 w-3" /> বিষয়
              </Label>
              {subjects.length === 0 ? (
                <p className="text-xs text-muted-foreground">এই ক্যাটেগরিতে কোনো বিষয় নেই</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={selectedSubject === "" ? "secondary" : "outline"}
                    onClick={() => setSelectedSubject("")}>সব বিষয়</Button>
                  {subjects.map(sub => (
                    <Button key={sub.id} size="sm" variant={selectedSubject === sub.id ? "secondary" : "outline"}
                      onClick={() => setSelectedSubject(sub.id === selectedSubject ? "" : sub.id)}>{sub.name}</Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Chapter */}
          {selectedSubject && chapters.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <ChevronRight className="h-3 w-3" /> অধ্যায়
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={selectedChapter === "" ? "secondary" : "outline"}
                  onClick={() => setSelectedChapter("")}>সব অধ্যায়</Button>
                {chapters.map(ch => (
                  <Button key={ch.id} size="sm" variant={selectedChapter === ch.id ? "secondary" : "outline"}
                    onClick={() => setSelectedChapter(ch.id === selectedChapter ? "" : ch.id)}>
                    {ch.chapter_number}. {ch.chapter_name_bn}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Breadcrumb / active filters */}
          {(selectedCategory || searchQuery) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t items-center text-xs text-muted-foreground">
              <span>ফিল্টার:</span>
              {selectedCategoryName && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedCategory("")}>
                  {selectedCategoryName} <X className="h-2.5 w-2.5" />
                </Badge>
              )}
              {selectedSubjectName && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedSubject("")}>
                  {selectedSubjectName} <X className="h-2.5 w-2.5" />
                </Badge>
              )}
              {selectedChapterName && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedChapter("")}>
                  {selectedChapterName} <X className="h-2.5 w-2.5" />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSearchQuery("")}>
                  খোঁজ: {searchQuery.substring(0, 15)} <X className="h-2.5 w-2.5" />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Question List ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">প্রশ্ন তালিকা ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : questions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">কোনো প্রশ্ন পাওয়া যায়নি</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {questions.map(question => (
                <div key={question.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{question.question_text}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {question.exam_categories?.name && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                          {question.exam_categories.name}
                        </span>
                      )}
                      {question.subjects?.name && (
                        <span className="text-xs text-foreground font-medium">{question.subjects.name}</span>
                      )}
                      {question.chapters?.chapter_name_bn && (
                        <span className="text-xs text-muted-foreground">{question.chapters.chapter_name_bn}</span>
                      )}
                      {!question.subjects?.name && question.subject && (
                        <span className="text-xs text-primary font-medium">{question.subject}</span>
                      )}
                      {!question.chapters?.chapter_name_bn && question.topic && (
                        <span className="text-xs text-muted-foreground">{question.topic}</span>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        question.difficulty === "easy" ? "bg-green-100 text-green-700"
                        : question.difficulty === "hard" ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"}`}>
                        {question.difficulty === "easy" ? "সহজ" : question.difficulty === "hard" ? "কঠিন" : "মাঝারি"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(question)}><Edit2 className="w-3 h-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(question.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
