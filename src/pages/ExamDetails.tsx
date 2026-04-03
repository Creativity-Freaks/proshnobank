import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { examsApi } from "@/lib/api";
import { usePageMeta } from "@/hooks/usePageMeta";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  CheckCircle,
  FileText,
  ChevronRight,
  Star,
  BarChart3,
  Loader2,
} from "lucide-react";

type ExamSubjectBreakdown = { name: string; questions: number; marks: number };

type ExamTemplateDetails = {
  id: string;
  title: string;
  category: string;
  description: string;
  question_count: number;
  duration_minutes: number;
  marks_per_question: number;
  negative_marks: number;
  difficulty: string;
  rating: number | null;
  attempts: number;
  subjects: string[];
  topics: Record<string, string[]>;
  subjects_breakdown: ExamSubjectBreakdown[];
  features: string[];
};

type ExamConfig = {
  category: string;
  subjects: string[];
  topics: Record<string, string[]>;
  questionCount: number;
  duration: number;
  marksPerQuestion: number;
  negativeMarking: number;
  difficulty: string;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function toTopicsRecord(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const v = value as Record<string, unknown>;
  const out: Record<string, string[]> = {};
  Object.entries(v).forEach(([k, val]) => {
    out[k] = toStringArray(val);
  });
  return out;
}

function toBreakdown(value: unknown): ExamSubjectBreakdown[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const v = x as Record<string, unknown>;
      const name = typeof v.name === "string" ? v.name : null;
      const questions = typeof v.questions === "number" ? v.questions : null;
      const marks = typeof v.marks === "number" ? v.marks : null;
      return name && questions !== null && marks !== null ? { name, questions, marks } : null;
    })
    .filter((x): x is ExamSubjectBreakdown => Boolean(x));
}

function formatMinutesBn(minutes: number) {
  const total = Math.max(0, Math.trunc(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h.toLocaleString("bn-BD")} ঘণ্টা ${m.toLocaleString("bn-BD")} মিনিট`;
  if (h > 0) return `${h.toLocaleString("bn-BD")} ঘণ্টা`;
  return `${m.toLocaleString("bn-BD")} মিনিট`;
}

const ExamDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState<ExamTemplateDetails | null>(null);
  const [loading, setLoading] = useState(true);

  usePageMeta({
    title: details ? details.title : "এক্সাম ডিটেইলস",
    description: details
      ? `${details.title} পরীক্ষার প্রশ্ন, সময়, মার্কিং ও অংশগ্রহণের বিস্তারিত দেখো।`
      : "নির্বাচিত পরীক্ষার বিস্তারিত তথ্য দেখো।",
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await examsApi.details(id);
        const raw = res.data as unknown;
        if (!raw || typeof raw !== "object") {
          setDetails(null);
          return;
        }
        const v = raw as Record<string, unknown>;
        const title = typeof v.title === "string" ? v.title : null;
        const category = typeof v.category === "string" ? v.category : null;
        const description = typeof v.description === "string" ? v.description : "";
        const question_count = typeof v.question_count === "number" ? v.question_count : 0;
        const duration_minutes = typeof v.duration_minutes === "number" ? v.duration_minutes : 30;
        const marks_per_question = (typeof v.marks_per_question === "number" || typeof v.marks_per_question === "string") ? Number(v.marks_per_question) : 1;
        const negative_marks = (typeof v.negative_marks === "number" || typeof v.negative_marks === "string") ? Number(v.negative_marks) : 0;
        const difficulty = typeof v.difficulty === "string" ? v.difficulty : "";
        const rating = (typeof v.rating === "number" || typeof v.rating === "string") ? Number(v.rating) : null;
        const attempts = typeof v.attempts === "number" ? v.attempts : 0;
        const subjects = toStringArray(v.subjects);
        const topics = toTopicsRecord(v.topics);
        const subjects_breakdown = toBreakdown(v.subjects_breakdown);
        const features = toStringArray(v.features);

        if (!id || !title || !category) {
          setDetails(null);
          return;
        }

        setDetails({
          id,
          title,
          category,
          description,
          question_count,
          duration_minutes,
          marks_per_question,
          negative_marks,
          difficulty,
          rating,
          attempts,
          subjects,
          topics,
          subjects_breakdown,
          features,
        });
      } catch (e) {
        console.error("Failed to load exam details:", e);
        setDetails(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const config = useMemo<ExamConfig | null>(() => {
    if (!details) return null;
    return {
      category: details.category,
      subjects: details.subjects,
      topics: details.topics,
      questionCount: details.question_count,
      duration: details.duration_minutes,
      marksPerQuestion: details.marks_per_question,
      negativeMarking: details.negative_marks,
      difficulty: details.difficulty || "all",
    };
  }, [details]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-bengali flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-background font-bengali">
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">এক্সাম পাওয়া যায়নি</h1>
              <p className="text-muted-foreground mb-6">এই আইডি দিয়ে কোনো এক্সাম খুঁজে পাওয়া যায়নি</p>
              <Link to="/live-exams"><Button variant="hero">লাইভ এক্সাম দেখো</Button></Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const totalMarks = details.question_count * details.marks_per_question;
  const durationLabel = formatMinutesBn(details.duration_minutes);
  const breakdown = details.subjects_breakdown.length > 0
    ? details.subjects_breakdown
    : details.subjects.map((s) => ({ name: s, questions: 0, marks: 0 }));

  return (
    <div className="min-h-screen bg-background font-bengali">
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6">
                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="secondary">{details.category}</Badge>
                  {details.rating !== null && (
                    <Badge className="bg-yellow-100 text-yellow-700">
                    <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                    {details.rating}
                    </Badge>
                  )}
                  <Badge variant="outline">{details.difficulty}</Badge>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {details.title}
                </h1>

                <p className="text-muted-foreground mb-6">{details.description}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-bold text-foreground">{details.question_count}</p>
                    <p className="text-sm text-muted-foreground">প্রশ্ন</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-bold text-foreground">{durationLabel}</p>
                    <p className="text-sm text-muted-foreground">সময়</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <Award className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-bold text-foreground">{totalMarks}</p>
                    <p className="text-sm text-muted-foreground">মার্কস</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-bold text-foreground">{details.attempts.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">অংশগ্রহণ</p>
                  </div>
                </div>

                {/* Subject Breakdown */}
                <h2 className="text-xl font-bold text-foreground mb-4">বিষয়ভিত্তিক প্রশ্ন বণ্টন</h2>
                <div className="space-y-3 mb-8">
                  {breakdown.map((subject, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <span className="font-medium text-foreground">{subject.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{subject.questions} প্রশ্ন</span>
                        <span className="font-medium text-primary">{subject.marks} মার্কস</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <h2 className="text-xl font-bold text-foreground mb-4">এক্সামের বৈশিষ্ট্য</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {details.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-primary mb-1">বিনামূল্যে</p>
                  <p className="text-muted-foreground text-sm">এখনই শুরু করো</p>
                </div>

                <Link to={`/exam/${id}/take`} state={config ? { config } : undefined}>
                  <Button variant="hero" className="w-full mb-4" size="lg">
                    পরীক্ষা শুরু করো
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      মোট প্রশ্ন
                    </span>
                    <span className="font-medium text-foreground">{details.question_count}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      সময়
                    </span>
                    <span className="font-medium text-foreground">{durationLabel}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      মোট মার্কস
                    </span>
                    <span className="font-medium text-foreground">{totalMarks}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      নেগেটিভ মার্কিং
                    </span>
                    <span className="font-medium text-foreground">-{details.negative_marks}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      অংশগ্রহণ
                    </span>
                    <span className="font-medium text-foreground">{details.attempts.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>টিপস:</strong> পরীক্ষা শুরু করার আগে সব প্রশ্ন পড়ে নাও এবং সহজ প্রশ্ন আগে উত্তর দাও।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default ExamDetails;
