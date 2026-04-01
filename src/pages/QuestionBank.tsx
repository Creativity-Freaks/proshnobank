import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { questionsApi } from "@/lib/api";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SUBJECT_OPTIONS, getSubjectLabel, normalizeSubjectKey } from "@/lib/subjects";
import { Search, BookOpen, ChevronRight, GraduationCap, Loader2 } from "lucide-react";

const subjectFilters = [{ id: "all", name: "সকল বিষয়" }, ...SUBJECT_OPTIONS.map((x) => ({ id: x.key, name: x.label }))];

const difficultyMap: Record<string, string> = { easy: "সহজ", medium: "মধ্যম", hard: "কঠিন" };
const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

const QuestionBank = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  usePageMeta({
    title: "প্রশ্নব্যাংক",
    description: "বিষয়, টপিক ও কঠিনতার ভিত্তিতে সাজানো প্রশ্নব্যাংক থেকে প্র্যাকটিস শুরু করো।",
  });

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

  const groups = data?.data ?? [];
  const total = data?.total_questions ?? 0;

  return (
    <div className="min-h-screen bg-background font-bengali">
      <Navbar />

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
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {subjectFilters.map((subject) => (
              <Button
                key={subject.id}
                variant={selectedSubject === subject.id ? "hero" : "outline"}
                size="sm"
                onClick={() => setSelectedSubject(subject.id)}
                className="font-bengali"
              >
                {subject.name}
              </Button>
            ))}
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

      <Footer />
    </div>
  );
};

export default QuestionBank;
