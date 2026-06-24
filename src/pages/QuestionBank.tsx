import { useState, useEffect, type ComponentType } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { questionsApi } from "@/lib/api";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getSubjectLabel, normalizeSubjectKey } from "@/lib/subjects";
import { supabase } from "@/integrations/supabase/client";
import { Search, BookOpen, ChevronRight, GraduationCap, Briefcase, FileText, Loader2, Layers } from "lucide-react";

const difficultyMap: Record<string, string> = { easy: "সহজ", medium: "মধ্যম", hard: "কঠিন" };
const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

type ProshnobankPdfCategory = "ssc" | "hsc" | "admission" | "chakri";

const pdfCategories: Array<{
  id: ProshnobankPdfCategory;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
}> = [
  {
    id: "ssc",
    title: "SSC",
    description: "এসএসসি প্রশ্নপত্র PDF",
    icon: GraduationCap,
    gradient: "from-primary/20 to-accent/10",
  },
  {
    id: "hsc",
    title: "HSC",
    description: "এইচএসসি প্রশ্নপত্র PDF",
    icon: GraduationCap,
    gradient: "from-accent/20 to-primary/10",
  },
  {
    id: "admission",
    title: "ভর্তি",
    description: "ভর্তি প্রস্তুতির PDF",
    icon: FileText,
    gradient: "from-primary/10 to-accent/20",
  },
  {
    id: "chakri",
    title: "চাকরি",
    description: "চাকরি প্রস্তুতির PDF",
    icon: Briefcase,
    gradient: "from-accent/10 to-primary/20",
  },
];

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

const QuestionBank = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  usePageMeta({
    title: "প্রশ্নব্যাংক",
    description: "বিষয়, টপিক ও কঠিনতার ভিত্তিতে সাজানো প্রশ্নব্যাংক থেকে প্র্যাকটিস শুরু করো।",
  });

  useEffect(() => {
    supabase.from("exam_categories").select("id, name").is("parent_id", null).order("sort_order", { ascending: true })
      .then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    if (!selectedCategory) { setSubjects([]); setSelectedSubjectId(""); setSelectedSubject("all"); return; }
    supabase.from("subjects").select("id, name").eq("category_id", selectedCategory).order("name")
      .then(({ data }) => { setSubjects(data || []); setSelectedSubjectId(""); setSelectedSubject("all"); });
  }, [selectedCategory]);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["question-groups", selectedSubject, searchQuery],
    queryFn: () =>
      questionsApi.groups({
        limit: 120,
        subject: selectedSubject !== "all" ? selectedSubject : undefined,
        search: searchQuery || undefined,
      }),
  });

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;
  const selectedSubjectName  = subjects.find(s => s.id === selectedSubjectId)?.name;

  const groups = data?.data ?? [];
  const total = data?.total_questions ?? 0;

  return (
    <div className="min-h-screen bg-background font-bengali">
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <span className="text-primary">প্রশ্নব্যাংক</span> থেকে প্র্যাকটিস করো
            </h1>
            <p className="text-muted-foreground mb-4">
              মোট {total}টি প্রশ্ন থেকে তোমার পছন্দের বিষয় বেছে নিয়ে প্র্যাকটিস করো
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="প্রশ্নব্যাংক খুঁজো..."
                className="pl-12 pr-4 py-6 text-lg rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              <span className="text-primary">PDF</span> প্রশ্নব্যাংক
            </h2>
            <p className="text-muted-foreground">SSC, HSC, ভর্তি এবং চাকরির প্রশ্নপত্র PDF দেখো</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pdfCategories.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.id}
                  to={`/question-bank/pdfs/${c.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.gradient}`} />
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                  <div className="pointer-events-none absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />

                  <div className="flex items-start gap-4">
                    <div className="relative h-12 w-12 rounded-2xl bg-background/60 border border-border/60 flex items-center justify-center backdrop-blur">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="relative min-w-0">
                      <div className="text-base font-semibold text-foreground">{c.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{c.description}</div>
                      <div className="mt-3 text-sm font-medium text-primary">দেখুন →</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* ── Category → Subject cascade ──────────────────────────── */}
          <div className="space-y-4 mb-8">
            {/* Step 1: Category */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                <Layers className="h-3.5 w-3.5" /> ক্যাটেগরি নির্বাচন
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  size="sm"
                  variant={!selectedCategory ? "hero" : "outline"}
                  onClick={() => { setSelectedCategory(""); setSelectedSubject("all"); setSelectedSubjectId(""); }}
                  className="font-bengali"
                >সব ক্যাটেগরি</Button>
                {categories.map(cat => (
                  <Button key={cat.id} size="sm"
                    variant={selectedCategory === cat.id ? "hero" : "outline"}
                    onClick={() => setSelectedCategory(cat.id === selectedCategory ? "" : cat.id)}
                    className="font-bengali">{cat.name}</Button>
                ))}
              </div>
            </div>

            {/* Step 2: Subject (shows when category selected) */}
            {selectedCategory && subjects.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                  <ChevronRight className="h-3.5 w-3.5" /> বিষয় নির্বাচন
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    size="sm"
                    variant={!selectedSubjectId ? "secondary" : "outline"}
                    onClick={() => { setSelectedSubjectId(""); setSelectedSubject("all"); }}
                    className="font-bengali"
                  >সব বিষয়</Button>
                  {subjects.map(sub => (
                    <Button key={sub.id} size="sm"
                      variant={selectedSubjectId === sub.id ? "secondary" : "outline"}
                      onClick={() => {
                        setSelectedSubjectId(sub.id === selectedSubjectId ? "" : sub.id);
                        setSelectedSubject(sub.id === selectedSubjectId ? "all" : sub.name);
                      }}
                      className="font-bengali">{sub.name}</Button>
                  ))}
                </div>
              </div>
            )}

            {/* Active filter indicator */}
            {(selectedCategoryName || selectedSubjectName) && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span>ফিল্টার:</span>
                {selectedCategoryName && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{selectedCategoryName}</span>}
                {selectedSubjectName && <span className="bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">{selectedSubjectName}</span>}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-foreground mb-2">প্রশ্ন লোড করা যায়নি</h3>
              <p className="text-muted-foreground">কিছুক্ষণ পরে আবার চেষ্টা করো</p>
            </div>
          ) : groups.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {groups.map((g, i) => {
                const subjectKey = normalizeSubjectKey(g.subject) || "science";
                return (
                  <div
                    key={`${g.subject}-${g.topic}-${g.difficulty}-${i}`}
                    className="bg-card rounded-2xl border border-border p-6 hover:shadow-card transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <Badge className={difficultyColor[g.difficulty] || "bg-muted text-muted-foreground"}>
                        {difficultyMap[g.difficulty] || g.difficulty}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-card-foreground mb-2">{g.topic}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{getSubjectLabel(g.subject)}</p>
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <BookOpen className="w-4 h-4" /> {g.count} প্রশ্ন
                      </span>
                    </div>
                    <Link
                      to="/exam/custom/take"
                      state={{
                        config: {
                          category: "general",
                          subjects: [subjectKey],
                          topics: { [subjectKey]: [g.topic] },
                          questionCount: clampInt(Math.min(g.count, 25), 5, 50),
                          duration: 30,
                          marksPerQuestion: 1,
                          negativeMarking: 0,
                          difficulty: g.difficulty,
                        },
                      }}
                    >
                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        প্র্যাকটিস শুরু করো <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">কোনো প্রশ্ন পাওয়া যায়নি</h3>
              <p className="text-muted-foreground">ডাটাবেজে প্রশ্ন যোগ করুন অ্যাডমিন প্যানেল থেকে</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default QuestionBank;
