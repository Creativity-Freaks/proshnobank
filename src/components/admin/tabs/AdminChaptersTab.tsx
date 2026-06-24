import { useEffect, useState, useCallback } from "react";
import {
  Plus, Trash2, Edit2, Loader2, BookOpen,
  Layers, GraduationCap, ChevronRight, X, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category { id: string; name: string; slug: string; sort_order: number; }
interface Subject   { id: string; name: string; key: string; category_id: string; description?: string; }
interface Chapter   {
  id: string;
  chapter_name_bn: string;
  chapter_name_en?: string;
  description?: string;
  chapter_number: number;
  display_order: number;
  subject_id: string;
  is_active: boolean;
}

interface FormState {
  chapter_name_bn: string;
  chapter_name_en: string;
  description: string;
  chapter_number: string;
}

const emptyForm: FormState = {
  chapter_name_bn: "",
  chapter_name_en: "",
  description: "",
  chapter_number: "",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminChaptersTab() {
  const { toast } = useToast();

  // Selection state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubject,  setSelectedSubject]  = useState<string>("");

  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects,   setSubjects]   = useState<Subject[]>([]);
  const [chapters,   setChapters]   = useState<Chapter[]>([]);

  // Loading flags
  const [loadingCats,  setLoadingCats]  = useState(true);
  const [loadingSubs,  setLoadingSubs]  = useState(false);
  const [loadingChaps, setLoadingChaps] = useState(false);

  // Form state
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [formData,   setFormData]   = useState<FormState>(emptyForm);
  const [saving,     setSaving]     = useState(false);

  // ── fetch categories ────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoadingCats(true);
    try {
      const { data, error } = await supabase
        .from("exam_categories")
        .select("id, name, slug, sort_order")
        .eq("is_active", true)
        .is("parent_id", null)
        .order("sort_order");
      if (error) throw error;
      const cats = data || [];
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) setSelectedCategory(cats[0].id);
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setLoadingCats(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch subjects for selected category ───────────────────────────────────
  const fetchSubjects = useCallback(async () => {
    if (!selectedCategory) { setSubjects([]); setSelectedSubject(""); return; }
    setLoadingSubs(true);
    setSelectedSubject("");
    setChapters([]);
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, key, category_id, description")
        .eq("category_id", selectedCategory)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      const subs = data || [];
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubject(subs[0].id);
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setLoadingSubs(false);
    }
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch chapters for selected subject ────────────────────────────────────
  const fetchChapters = useCallback(async () => {
    if (!selectedSubject) { setChapters([]); return; }
    setLoadingChaps(true);
    try {
      const { data, error } = await supabase
        .from("chapters")
        .select("id, chapter_name_bn, chapter_name_en, description, chapter_number, display_order, subject_id, is_active")
        .eq("subject_id", selectedSubject)
        .order("display_order", { ascending: true });
      if (error) throw error;
      setChapters(data || []);
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setLoadingChaps(false);
    }
  }, [selectedSubject]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchSubjects(); }, [selectedCategory]);
  useEffect(() => { fetchChapters(); }, [selectedSubject]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.chapter_name_bn.trim()) {
      toast({ title: "ত্রুটি", description: "বাংলা নাম পূরণ করুন", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const chapterNum = parseInt(formData.chapter_number) ||
        (chapters.length > 0 ? Math.max(...chapters.map((c) => c.chapter_number)) + 1 : 1);
      const displayOrder = chapters.length > 0
        ? Math.max(...chapters.map((c) => c.display_order || 0)) + 1
        : 1;

      const payload = {
        chapter_name_bn: formData.chapter_name_bn.trim(),
        chapter_name_en: formData.chapter_name_en.trim() || null,
        description:     formData.description.trim() || null,
        chapter_number:  chapterNum,
        display_order:   displayOrder,
        subject_id:      selectedSubject,
      };

      if (editingId) {
        const { error } = await supabase.from("chapters").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "অধ্যায় আপডেট হয়েছে" });
      } else {
        const { error } = await supabase.from("chapters").insert(payload);
        if (error) throw error;
        toast({ title: "সাফল্য", description: "নতুন অধ্যায় তৈরি হয়েছে" });
      }
      cancelForm();
      fetchChapters();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Chapter) => {
    setEditingId(item.id);
    setFormData({
      chapter_name_bn: item.chapter_name_bn,
      chapter_name_en: item.chapter_name_en || "",
      description:     item.description || "",
      chapter_number:  String(item.chapter_number),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই অধ্যায়টি মুছে দিবেন? এটি পূর্বাবস্থায় ফেরানো যাবে না।")) return;
    try {
      const { error } = await supabase.from("chapters").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "সাফল্য", description: "অধ্যায় মুছে দেওয়া হয়েছে" });
      fetchChapters();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (item: Chapter) => {
    try {
      const { error } = await supabase
        .from("chapters")
        .update({ is_active: !item.is_active })
        .eq("id", item.id);
      if (error) throw error;
      fetchChapters();
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name;
  const selectedSubjectName  = subjects.find((s) => s.id === selectedSubject)?.name;

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loadingCats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold font-bengali">অধ্যায় ব্যবস্থাপনা</h2>
          <p className="text-sm text-muted-foreground font-bengali mt-0.5">
            ক্যাটেগরি → বিষয় → অধ্যায় ক্রমে ব্রাউজ করুন
          </p>
        </div>
        <Button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }}
          disabled={!selectedSubject}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          নতুন অধ্যায়
        </Button>
      </div>

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      {(selectedCategoryName || selectedSubjectName) && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-bengali flex-wrap">
          <Layers className="h-3.5 w-3.5" />
          {selectedCategoryName && <span className="text-foreground font-medium">{selectedCategoryName}</span>}
          {selectedSubjectName && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <GraduationCap className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{selectedSubjectName}</span>
            </>
          )}
          {chapters.length > 0 && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>{chapters.length}টি অধ্যায়</span>
            </>
          )}
        </div>
      )}

      {/* ── Step 1 — Category Selector ─────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">১</span>
              <CardTitle className="text-sm font-bengali">ক্যাটেগরি বেছে নিন</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">{categories.length}টি</Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground font-bengali text-center py-2">
              কোনো ক্যাটেগরি নেই — আগে ক্যাটেগরি ট্যাব থেকে যোগ করুন
            </p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium font-bengali transition-colors border ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-muted"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Step 2 — Subject Selector ──────────────────────────────────────── */}
      {selectedCategory && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">২</span>
                <CardTitle className="text-sm font-bengali">বিষয় বেছে নিন</CardTitle>
              </div>
              {!loadingSubs && <Badge variant="outline" className="text-xs">{subjects.length}টি</Badge>}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {loadingSubs ? (
              <div className="flex justify-center py-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground font-bengali text-center py-2">
                এই ক্যাটেগরিতে কোনো বিষয় নেই — আগে বিষয় ট্যাব থেকে যোগ করুন
              </p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {subjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium font-bengali transition-colors border ${
                      selectedSubject === sub.id
                        ? "bg-secondary text-secondary-foreground border-secondary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Add / Edit Form ────────────────────────────────────────────────── */}
      {showForm && selectedSubject && (
        <Card className="border-primary/40">
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-bengali text-base">
                {editingId ? "অধ্যায় সম্পাদনা" : `নতুন অধ্যায় — ${selectedSubjectName}`}
              </CardTitle>
              <Button size="icon" variant="ghost" onClick={cancelForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bengali">বাংলা নাম <span className="text-destructive">*</span></Label>
                <Input
                  value={formData.chapter_name_bn}
                  onChange={(e) => setFormData({ ...formData, chapter_name_bn: e.target.value })}
                  placeholder="যেমন: সরল সমীকরণ, নিউটনের গতিসূত্র"
                  className="font-bengali"
                />
              </div>
              <div className="space-y-1.5">
                <Label>English Name <span className="text-muted-foreground text-xs">(ঐচ্ছিক)</span></Label>
                <Input
                  value={formData.chapter_name_en}
                  onChange={(e) => setFormData({ ...formData, chapter_name_en: e.target.value })}
                  placeholder="e.g. Simple Equations"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bengali">অধ্যায় নম্বর <span className="text-muted-foreground text-xs">(ঐচ্ছিক — স্বয়ংক্রিয়)</span></Label>
                <Input
                  type="number"
                  value={formData.chapter_number}
                  onChange={(e) => setFormData({ ...formData, chapter_number: e.target.value })}
                  placeholder={String(chapters.length + 1)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bengali">সংক্ষিপ্ত বর্ণনা <span className="text-muted-foreground text-xs">(ঐচ্ছিক)</span></Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="সংক্ষিপ্ত বর্ণনা"
                  className="font-bengali"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} disabled={saving} className="gap-2 font-bengali">
                {saving
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Check className="h-4 w-4" />
                }
                {editingId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
              </Button>
              <Button variant="outline" onClick={cancelForm} className="font-bengali">
                বাতিল
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3 — Chapters List ─────────────────────────────────────────── */}
      {selectedSubject && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">৩</span>
              <h3 className="font-semibold font-bengali text-sm">
                {selectedSubjectName} — অধ্যায়সমূহ
              </h3>
            </div>
            {!loadingChaps && <Badge variant="outline" className="text-xs">{chapters.length}টি</Badge>}
          </div>

          {loadingChaps ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : chapters.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="font-bengali text-sm text-muted-foreground mb-3">
                  এই বিষয়ে এখনো কোনো অধ্যায় নেই
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 font-bengali"
                  onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  প্রথম অধ্যায় যোগ করুন
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {chapters.map((item) => (
                <Card
                  key={item.id}
                  className={`group transition-opacity ${item.is_active ? "" : "opacity-60"}`}
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-start gap-3">
                      {/* Chapter number badge */}
                      <span className="shrink-0 h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                        {item.chapter_number}
                      </span>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-bengali leading-snug">
                          {item.chapter_name_bn}
                        </CardTitle>
                        {item.chapter_name_en && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {item.chapter_name_en}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {item.description && (
                      <p className="text-xs text-muted-foreground font-bengali line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 text-xs font-bengali h-8"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 className="w-3 h-3" />
                        সম্পাদনা
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-8 px-2 text-xs ${item.is_active ? "text-amber-600 hover:text-amber-700" : "text-green-600 hover:text-green-700"}`}
                        onClick={() => handleToggleActive(item)}
                        title={item.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                      >
                        {item.is_active ? "বন্ধ" : "চালু"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 px-2"
                        onClick={() => handleDelete(item.id)}
                        title="মুছুন"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
