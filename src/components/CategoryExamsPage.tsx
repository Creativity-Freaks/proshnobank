import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ExamFilters from "@/components/ExamFilters";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import {
  BookOpen,
  Clock,
  Users,
  Trophy,
  ArrowRight,
  Settings,
  Loader2,
} from "lucide-react";
import { useExamTemplates } from "@/hooks/useExamTemplates";
import type { LucideIcon } from "lucide-react";

export interface CategoryConfig {
  slug: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  /** Tailwind gradient classes for hero and icon bg, e.g. "from-blue-500 to-cyan-500" */
  gradient: string;
  heroGradient: string;
  /** Stats shown in the 4-card row. Falls back to computed counts where live data is unavailable. */
  examCount: string;
  studentCount: string;
  successRate: string;
}

interface Props {
  config: CategoryConfig;
}

const CategoryExamsPage = ({ config }: Props) => {
  const {
    slug,
    title,
    subtitle,
    Icon,
    gradient,
    heroGradient,
    examCount,
    studentCount,
    successRate,
  } = config;

  const { data: templates = [], isLoading } = useExamTemplates(slug);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  // Build subject list dynamically from the loaded templates
  const subjects = useMemo(() => {
    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];
    for (const t of templates) {
      for (const s of t.subjects) {
        if (!seen.has(s)) {
          seen.add(s);
          result.push({ id: s, name: s });
        }
      }
    }
    return result;
  }, [templates]);

  const filtered = useMemo(() => {
    let result = [...templates];

    if (selectedSubject !== "all") {
      result = result.filter((t) => t.subjects.includes(selectedSubject));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.attempts - a.attempts);
        break;
      case "newest":
        // newest by insertion order (stable sort preserves DB ordering)
        break;
      case "questions-high":
        result.sort((a, b) => b.question_count - a.question_count);
        break;
      case "questions-low":
        result.sort((a, b) => a.question_count - b.question_count);
        break;
      case "duration-high":
        result.sort((a, b) => b.duration_minutes - a.duration_minutes);
        break;
      case "duration-low":
        result.sort((a, b) => a.duration_minutes - b.duration_minutes);
        break;
    }

    return result;
  }, [templates, searchQuery, selectedSubject, sortBy]);

  const displayCount = isLoading ? "..." : `${filtered.length}+`;

  return (
    <div className="min-h-screen bg-background font-bengali">
      {/* Hero */}
      <section className={`pt-24 pb-12 bg-gradient-to-br ${heroGradient}`}>
        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
                <p className="text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            <Link to={`/exam/setup?category=${slug}`}>
              <Button variant="hero" size="lg" className="w-full md:w-auto">
                <Settings className="w-5 h-5 mr-2" />
                কাস্টম এক্সাম সেটআপ
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card rounded-xl p-4 border border-border">
              <BookOpen className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{examCount}</p>
              <p className="text-sm text-muted-foreground">মোট এক্সাম</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Users className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{studentCount}</p>
              <p className="text-sm text-muted-foreground">শিক্ষার্থী</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Trophy className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{successRate}</p>
              <p className="text-sm text-muted-foreground">সাফল্যের হার</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Clock className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">২৪/৭</p>
              <p className="text-sm text-muted-foreground">অ্যাক্সেস</p>
            </div>
          </div>
        </div>
      </section>

      {/* Exam grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <ExamFilters
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedSubject === "all"
                  ? "সব এক্সাম"
                  : subjects.find((s) => s.id === selectedSubject)?.name ?? selectedSubject}
              </h2>
              <span className="text-sm text-muted-foreground">
                {isLoading ? "লোড হচ্ছে..." : `${filtered.length}টি এক্সাম পাওয়া গেছে`}
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((exam) => (
                  <Link
                    key={exam.id}
                    to={`/exam/${exam.id}`}
                    className="bg-card rounded-xl p-5 border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <h3 className="text-lg font-semibold text-card-foreground mb-3">
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {exam.question_count} প্রশ্ন
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exam.duration_minutes} মিনিট
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {exam.attempts} জন অংশ নিয়েছে
                      </span>
                      <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">কোনো এক্সাম পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryExamsPage;
