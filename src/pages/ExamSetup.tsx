import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  Loader2, BookOpen, Clock, Award, MinusCircle, Settings,
  Play, ChevronRight, Target, ChevronDown,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";

// ── DB types ─────────────────────────────────────────────────────────────────
type DbChapter  = { id: string; chapter_name_bn: string; chapter_number: number };
type DbSubject  = { id: string; name: string; chapters: DbChapter[] };
type DbCategory = { id: string; name: string; subjects: DbSubject[] };

// ── Difficulty options ────────────────────────────────────────────────────────
const difficultyLevels = [
  { id: "easy",   name: "সহজ"   },
  { id: "medium", name: "মাঝারি" },
  { id: "hard",   name: "কঠিন"  },
  { id: "all",    name: "সব"    },
];

const ExamSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryIdFromQuery = searchParams.get("category") || "";

  usePageMeta({
    title: "কাস্টম এক্সাম সেটআপ",
    description: "নিজের পছন্দমতো বিষয়, অধ্যায়, সময় ও মার্কিং সেট করে কাস্টম এক্সাম শুরু করো।",
  });

  // ── Data from DB ────────────────────────────────────────────────────────────
  const [categories, setCategories]             = useState<DbCategory[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");

  useEffect(() => {
    async function fetchCascade() {
      setLoading(true);
      // 1. Fetch top-level categories (parent_id IS NULL)
      const { data: cats } = await supabase
        .from("exam_categories")
        .select("id, name")
        .is("parent_id", null)
        .order("sort_order", { ascending: true });

      if (!cats || cats.length === 0) { setLoading(false); return; }

      // 2. Fetch all subjects (we'll group by category_id)
      const { data: subs } = await supabase
        .from("subjects")
        .select("id, name, category_id")
        .order("name", { ascending: true });

      // 3. Fetch all chapters (we'll group by subject_id)
      const { data: chaps } = await supabase
        .from("chapters")
        .select("id, chapter_name_bn, chapter_number, subject_id")
        .eq("is_active", true)
        .order("chapter_number", { ascending: true });

      // Build nested structure
      const chaptersBySubject = new Map<string, DbChapter[]>();
      (chaps || []).forEach((c) => {
        const arr = chaptersBySubject.get(c.subject_id) || [];
        arr.push({ id: c.id, chapter_name_bn: c.chapter_name_bn, chapter_number: c.chapter_number });
        chaptersBySubject.set(c.subject_id, arr);
      });

      const subjectsByCategory = new Map<string, DbSubject[]>();
      (subs || []).forEach((s) => {
        const arr = subjectsByCategory.get(s.category_id) || [];
        arr.push({ id: s.id, name: s.name, chapters: chaptersBySubject.get(s.id) || [] });
        subjectsByCategory.set(s.category_id, arr);
      });

      const built: DbCategory[] = cats.map((c) => ({
        id: c.id,
        name: c.name,
        subjects: subjectsByCategory.get(c.id) || [],
      }));

      setCategories(built);

      // Set active category: prefer URL param, else first with subjects
      const preferred = built.find((c) => c.id === categoryIdFromQuery);
      const fallback  = built.find((c) => c.subjects.length > 0) || built[0];
      setActiveCategoryId((preferred || fallback)?.id || "");
      setLoading(false);
    }
    fetchCascade();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || null;
  const subjects       = activeCategory?.subjects || [];

  // ── Selection state ─────────────────────────────────────────────────────────
  const [selectedSubjects,  setSelectedSubjects]  = useState<string[]>([]);
  const [selectedChapters,  setSelectedChapters]  = useState<Record<string, string[]>>({});
  const [expandedSubjects,  setExpandedSubjects]  = useState<Record<string, boolean>>({});

  // Reset selections when category changes
  useEffect(() => {
    setSelectedSubjects([]);
    setSelectedChapters({});
    setExpandedSubjects({});
  }, [activeCategoryId]);

  // ── Settings state ──────────────────────────────────────────────────────────
  const [questionCount,          setQuestionCount]          = useState([25]);
  const [duration,               setDuration]               = useState([30]);
  const [marksPerQuestion,       setMarksPerQuestion]       = useState([1]);
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(false);
  const [negativeMarkValue,      setNegativeMarkValue]      = useState("0.25");
  const [difficulty,             setDifficulty]             = useState("all");

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((s) => s !== subjectId) : [...prev, subjectId]
    );
    // Auto-expand when selecting
    if (!selectedSubjects.includes(subjectId)) {
      setExpandedSubjects((prev) => ({ ...prev, [subjectId]: true }));
    }
  };

  const handleChapterToggle = (subjectId: string, chapterId: string) => {
    setSelectedChapters((prev) => {
      const current = prev[subjectId] || [];
      return {
        ...prev,
        [subjectId]: current.includes(chapterId)
          ? current.filter((c) => c !== chapterId)
          : [...current, chapterId],
      };
    });
  };

  const handleSelectAllChapters = (subjectId: string, chapters: DbChapter[]) => {
    const current = selectedChapters[subjectId] || [];
    const allIds  = chapters.map((c) => c.id);
    const allSelected = allIds.every((id) => current.includes(id));
    setSelectedChapters((prev) => ({
      ...prev,
      [subjectId]: allSelected ? [] : allIds,
    }));
  };

  const toggleSubjectExpand = (subjectId: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  const totalMarks = questionCount[0] * marksPerQuestion[0];
  const canStart   = selectedSubjects.length > 0;

  const handleStartExam = () => {
    const config = {
      category:         activeCategoryId,
      category_id:      activeCategoryId,
      subjects:         selectedSubjects,
      subject_ids:      selectedSubjects,
      chapters:         selectedChapters,
      chapter_ids:      Object.values(selectedChapters).flat(),
      questionCount:    questionCount[0],
      duration:         duration[0],
      marksPerQuestion: marksPerQuestion[0],
      negativeMarking:  negativeMarkingEnabled ? parseFloat(negativeMarkValue) : 0,
      difficulty,
    };
    navigate("/exam/custom/take", { state: { config } });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background font-bengali">
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="mb-6 md:mb-8">
            <BackButton className="mb-4 md:mb-6" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4 text-primary">
                <Settings className="w-5 h-5" />
                <span className="font-medium">কাস্টম এক্সাম সেটআপ</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
                {activeCategory?.name || "এক্সাম"} - নিজের মতো করে সাজাও
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                বিষয়, অধ্যায়, প্রশ্ন সংখ্যা, সময়, মার্কস - সব কিছু তোমার ইচ্ছামতো সেট করো
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          {!loading && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    activeCategoryId === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 md:gap-8">

            {/* Left: Subject → Chapter cascade */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">বিষয় ও অধ্যায় নির্বাচন</h2>
                    <p className="text-sm text-muted-foreground">বিষয় বেছে নাও, তারপর অধ্যায় সিলেক্ট করো</p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : subjects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    এই ক্যাটাগরিতে এখনো কোনো বিষয় যোগ করা হয়নি।
                  </p>
                ) : (
                  <div className="space-y-3">
                    {subjects.map((subject) => {
                      const isSelected = selectedSubjects.includes(subject.id);
                      const isExpanded = !!expandedSubjects[subject.id];
                      const chapIds    = subject.chapters.map((c) => c.id);
                      const selChaps   = selectedChapters[subject.id] || [];
                      const allChapsSel = chapIds.length > 0 && chapIds.every((id) => selChaps.includes(id));

                      return (
                        <div
                          key={subject.id}
                          className={`border rounded-xl transition-all ${
                            isSelected ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          {/* Subject row */}
                          <div className="flex items-center justify-between p-4">
                            <div
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => handleSubjectToggle(subject.id)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleSubjectToggle(subject.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="font-medium text-foreground">{subject.name}</span>
                              {subject.chapters.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({subject.chapters.length}টি অধ্যায়)
                                </span>
                              )}
                            </div>
                            {isSelected && subject.chapters.length > 0 && (
                              <div className="flex items-center gap-2">
                                <button
                                  className="text-xs text-primary hover:underline"
                                  onClick={() => handleSelectAllChapters(subject.id, subject.chapters)}
                                >
                                  {allChapsSel ? "সব বাতিল" : "সব অধ্যায়"}
                                </button>
                                <button
                                  onClick={() => toggleSubjectExpand(subject.id)}
                                  className="p-1 rounded hover:bg-muted/50"
                                >
                                  <ChevronDown
                                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Chapter list — only when subject is selected & expanded */}
                          {isSelected && isExpanded && subject.chapters.length > 0 && (
                            <div className="px-4 pb-4 border-t border-border pt-3">
                              <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                <BookOpen className="w-4 h-4" />
                                <span>অধ্যায় নির্বাচন (ঐচ্ছিক)</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {subject.chapters.map((chapter) => (
                                  <label
                                    key={chapter.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                      selChaps.includes(chapter.id)
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/30 hover:bg-muted/30"
                                    }`}
                                  >
                                    <Checkbox
                                      checked={selChaps.includes(chapter.id)}
                                      onCheckedChange={() => handleChapterToggle(subject.id, chapter.id)}
                                    />
                                    <span className="text-sm">
                                      <span className="font-medium text-primary mr-1">
                                        {String(chapter.chapter_number).padStart(2, "0")}.
                                      </span>
                                      {chapter.chapter_name_bn}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* No chapters message */}
                          {isSelected && subject.chapters.length === 0 && (
                            <div className="px-4 pb-3 border-t border-border pt-3">
                              <p className="text-xs text-muted-foreground">
                                এই বিষয়ের সব প্রশ্ন অন্তর্ভুক্ত হবে।
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Difficulty */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">কঠিনতার মাত্রা</h2>
                    <p className="text-sm text-muted-foreground">কোন লেভেলের প্রশ্ন চাও?</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setDifficulty(level.id)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        difficulty === level.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Settings sidebar */}
            <div className="md:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-4 md:p-6 md:sticky md:top-24 space-y-4 md:space-y-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  এক্সাম সেটিংস
                </h2>

                {/* Question count */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-foreground">
                      <BookOpen className="w-4 h-4 text-primary" />
                      প্রশ্ন সংখ্যা
                    </Label>
                    <span className="text-xl font-bold text-primary">{questionCount[0]}</span>
                  </div>
                  <Slider value={questionCount} onValueChange={setQuestionCount} min={5} max={100} step={5} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>৫</span><span>১০০</span>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      সময় (মিনিট)
                    </Label>
                    <span className="text-xl font-bold text-primary">{duration[0]}</span>
                  </div>
                  <Slider value={duration} onValueChange={setDuration} min={5} max={180} step={5} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>৫ মি.</span><span>১৮০ মি.</span>
                  </div>
                </div>

                {/* Marks per question */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-foreground">
                      <Award className="w-4 h-4 text-primary" />
                      প্রতি প্রশ্নে মার্কস
                    </Label>
                    <span className="text-xl font-bold text-primary">{marksPerQuestion[0]}</span>
                  </div>
                  <Slider value={marksPerQuestion} onValueChange={setMarksPerQuestion} min={1} max={5} step={0.5} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>১</span><span>৫</span>
                  </div>
                </div>

                {/* Negative marking */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="flex items-center gap-2 text-foreground">
                      <MinusCircle className="w-4 h-4 text-destructive" />
                      নেগেটিভ মার্কিং
                    </Label>
                    <Switch checked={negativeMarkingEnabled} onCheckedChange={setNegativeMarkingEnabled} />
                  </div>
                  {negativeMarkingEnabled && (
                    <Select value={negativeMarkValue} onValueChange={setNegativeMarkValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="নেগেটিভ মার্ক সিলেক্ট করো" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.25">-০.২৫ (প্রতি ভুল উত্তরে)</SelectItem>
                        <SelectItem value="0.5">-০.৫০ (প্রতি ভুল উত্তরে)</SelectItem>
                        <SelectItem value="1">-১.০০ (প্রতি ভুল উত্তরে)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-muted rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">মোট প্রশ্ন</span>
                    <span className="font-medium text-foreground">{questionCount[0]}টি</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">মোট সময়</span>
                    <span className="font-medium text-foreground">{duration[0]} মিনিট</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">মোট মার্কস</span>
                    <span className="font-medium text-foreground">{totalMarks}</span>
                  </div>
                  {negativeMarkingEnabled && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">নেগেটিভ মার্ক</span>
                      <span className="font-medium text-destructive">-{negativeMarkValue}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">বিষয় সংখ্যা</span>
                    <span className="font-medium text-foreground">{selectedSubjects.length}টি</span>
                  </div>
                  {Object.values(selectedChapters).flat().length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">অধ্যায় সংখ্যা</span>
                      <span className="font-medium text-foreground">
                        {Object.values(selectedChapters).flat().length}টি
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={!canStart}
                  onClick={handleStartExam}
                >
                  <Play className="w-5 h-5 mr-2" />
                  পরীক্ষা শুরু করো
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>

                {!canStart && (
                  <p className="text-sm text-center text-muted-foreground">
                    অন্তত একটি বিষয় সিলেক্ট করো
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamSetup;
