import { useState, useMemo } from "react";
import ExamFilters from "@/components/ExamFilters";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Users,
  BookOpen,
  Trophy,
  ArrowRight,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useExamTemplates } from "@/hooks/useExamTemplates";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/BackButton";

export type CategoryConfig = {
  /** category slug stored in exam_templates.category */
  category: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** tailwind gradient stops e.g. "from-blue-500 to-cyan-500" */
  gradient: string;
  /** softer gradient for hero bg e.g. "from-blue-500/10 to-cyan-500/10" */
  heroGradient: string;
  /** subject filter chips: id is matched against template.subjects names */
  subjects: { id: string; name: string }[];
  stats?: { exams?: string; students?: string; successRate?: string };
};

const CategoryExamsPage = ({ config }: { config: CategoryConfig }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const { data: exams = [], isLoading } = useExamTemplates(config.category);
  const Icon = config.icon;

  const filteredAndSortedExams = useMemo(() => {
    let result = [...exams];

    if (selectedSubject !== "all") {
      const subjectName = config.subjects.find((s) => s.id === selectedSubject)?.name;
      if (subjectName) {
        result = result.filter((exam) => exam.subjects.includes(subjectName));
      }
    }

    if (searchQuery) {
      result = result.filter((exam) =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.attempts - a.attempts);
        break;
      case "newest":
        result.sort((a, b) => b.title.localeCompare(a.title));
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
  }, [exams, searchQuery, selectedSubject, sortBy, config.subjects]);

  return (
    <div className="min-h-screen bg-background font-bengali">
      <section className={`pt-24 pb-12 bg-gradient-to-br ${config.heroGradient}`}>
        <div className="container mx-auto px-4">
          <BackButton className="mb-6" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">{config.title}</h1>
                <p className="text-muted-foreground">{config.subtitle}</p>
              </div>
            </div>
            <Link to={`/exam/setup?category=${config.category}`}>
              <Button variant="hero" size="lg" className="w-full md:w-auto">
                <Settings className="w-5 h-5 mr-2" />
                কাস্টম এক্সাম সেটআপ
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card rounded-xl p-4 border border-border">
              <BookOpen className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{exams.length}+</p>
              <p className="text-sm text-muted-foreground">মোট এক্সাম</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Users className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{config.stats?.students ?? "১০০০০+"}</p>
              <p className="text-sm text-muted-foreground">শিক্ষার্থী</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Trophy className="w-6 h-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{config.stats?.successRate ?? "৯০%"}</p>
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

      <section className="py-12">
        <div className="container mx-auto px-4">
          <ExamFilters
            subjects={config.subjects}
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
                  : config.subjects.find((s) => s.id === selectedSubject)?.name}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredAndSortedExams.length}টি এক্সাম পাওয়া গেছে
              </span>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 rounded-xl" />
                ))}
              </div>
            ) : filteredAndSortedExams.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedExams.map((exam) => (
                  <Link
                    key={exam.id}
                    to={`/exam/${exam.id}`}
                    className="bg-card rounded-xl p-5 border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <h3 className="text-lg font-semibold text-card-foreground mb-3">{exam.title}</h3>
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
