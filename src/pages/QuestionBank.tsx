import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { questionsApi } from "@/lib/api";
import { Search, BookOpen, Clock, ChevronRight, GraduationCap, Loader2 } from "lucide-react";

const subjects = [
  { id: "all", name: "সকল বিষয়" },
  { id: "bangla", name: "বাংলা" },
  { id: "english", name: "ইংরেজি" },
  { id: "math", name: "গণিত" },
  { id: "physics", name: "পদার্থবিজ্ঞান" },
  { id: "chemistry", name: "রসায়ন" },
  { id: "biology", name: "জীববিজ্ঞান" },
  { id: "gk", name: "সাধারণ জ্ঞান" },
];

const difficultyMap: Record<string, string> = { easy: "সহজ", medium: "মধ্যম", hard: "কঠিন" };
const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

interface QuestionGroup {
  subject: string;
  topic: string;
  difficulty: string;
  count: number;
}

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

function isQuestionLike(value: unknown): value is { subject: string; topic: string; difficulty: string } {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.subject === "string" && typeof v.topic === "string" && typeof v.difficulty === "string";
}

const QuestionBank = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await questionsApi.list({
        limit: 200,
        subject: selectedSubject !== "all" ? selectedSubject : undefined,
        search: searchQuery || undefined,
      });
      setTotal(res.total);

      // Group by subject+topic+difficulty
      const map = new Map<string, QuestionGroup>();
      const data = Array.isArray(res.data) ? (res.data as unknown[]) : [];
      data.forEach((q) => {
        if (!isQuestionLike(q)) return;
        const key = `${q.subject}|${q.topic}|${q.difficulty}`;
        const existing = map.get(key);
        if (existing) {
          existing.count++;
        } else {
          map.set(key, { subject: q.subject, topic: q.topic, difficulty: q.difficulty, count: 1 });
        }
      });
      setGroups(Array.from(map.values()));
    } catch (e) {
      console.error("Failed to load questions:", e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSubject]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

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
            {subjects.map((subject) => (
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

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : groups.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {groups.map((g, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-6 hover:shadow-card transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <Badge className={difficultyColor[g.difficulty] || "bg-muted text-muted-foreground"}>
                      {difficultyMap[g.difficulty] || g.difficulty}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-card-foreground mb-2">{g.topic}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{g.subject}</p>
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
                        subjects: [g.subject],
                        topics: { [g.subject]: [g.topic] },
                        questionCount: clampInt(Math.min(g.count, 25), 5, 50),
                        duration: 30,
                        marksPerQuestion: 1,
                        negativeMarking: 0,
                        difficulty: g.difficulty,
                      },
                    }}
                  >
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      প্র্যাকটিস শুরু করো <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
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
