import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { examsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle,
  AlertCircle, BookOpen, Bookmark, X, Loader2,
} from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";

interface ExamConfig {
  category: string;
  subjects: string[];
  topics: Record<string, string[]>;
  questionCount: number;
  duration: number;
  marksPerQuestion: number;
  negativeMarking: number;
  difficulty: string;
}

interface Question {
  id: string;
  question_text: string;
  options: string[];
  subject?: string;
  topic?: string;
  difficulty?: string;
}

type ExamAttempt = Tables<"exam_attempts">;

function isQuestionRow(value: unknown): value is Question {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.question_text === "string" &&
    Array.isArray(v.options) &&
    v.options.every((o) => typeof o === "string")
  );
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

const ExamTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const defaultConfig = useMemo<ExamConfig>(
    () => ({
      category: "general",
      subjects: [],
      topics: {},
      questionCount: 10,
      duration: 30,
      marksPerQuestion: 1,
      negativeMarking: 0,
      difficulty: "all",
    }),
    [],
  );

  const config = useMemo<ExamConfig>(() => {
    const state = location.state as { config?: ExamConfig } | null | undefined;
    return state?.config ?? defaultConfig;
  }, [defaultConfig, location.state]);

  const { isBookmarked, toggle: toggleBookmark, saving: bookmarkSaving } = useBookmarks();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);

  const loadQuestions = useCallback(async () => {
    try {
      setLoadingQuestions(true);
      const shouldUseTemplate = Boolean(id && id !== "custom");

      const res = shouldUseTemplate
        ? await examsApi.generateTemplate(id as string)
        : await examsApi.generate({
            subjects: config.subjects.length > 0 ? config.subjects.join(",") : undefined,
            topics: (() => {
              const selectedTopics = uniqueStrings(
                Object.values(config.topics || {}).flatMap((arr) => (Array.isArray(arr) ? arr : [])),
              );
              return selectedTopics.length > 0 ? selectedTopics.join(",") : undefined;
            })(),
            difficulty: config.difficulty !== "all" ? config.difficulty : undefined,
            count: config.questionCount,
          });
      const data = Array.isArray(res.data) ? (res.data as unknown[]) : [];
      setQuestions(
        data
          .filter(isQuestionRow)
          .map((q) => ({
            id: q.id,
            question_text: q.question_text,
            options: q.options,
            subject: q.subject,
            topic: q.topic,
            difficulty: q.difficulty,
          })),
      );
    } catch (e) {
      console.error("Failed to load exam questions:", e);
    } finally {
      setLoadingQuestions(false);
    }
  }, [config.difficulty, config.questionCount, config.subjects, config.topics, id]);

  // Load questions from API
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitted(true);
    setShowSubmitDialog(false);
    setAttempt(null);

    if (!user) return;

    try {
      setSubmitting(true);
      const res = await examsApi.submit({
        subject: config.subjects.join(", ") || "General",
        difficulty: config.difficulty !== "all" ? config.difficulty : undefined,
        duration_minutes: config.duration,
        marks_per_question: config.marksPerQuestion,
        negative_marks: config.negativeMarking,
        time_taken_seconds: config.duration * 60 - timeLeft,
        answers: questions.map((q, i) => ({ question_id: q.id, selected: answers[i] ?? -1 })),
      });
      setAttempt(res.data as ExamAttempt);
    } catch (e) {
      console.error("Failed to submit exam:", e);
    } finally {
      setSubmitting(false);
    }
  }, [answers, config, questions, timeLeft, user]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && !loadingQuestions) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && !isSubmitted && !loadingQuestions) {
      handleSubmit();
    }
    return;
  }, [handleSubmit, isSubmitted, loadingQuestions, timeLeft]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleAnswer = (optionIndex: number) => setAnswers({ ...answers, [currentQuestion]: optionIndex });
  const toggleFlag = () => setFlagged(flagged.includes(currentQuestion) ? flagged.filter((f) => f !== currentQuestion) : [...flagged, currentQuestion]);

  const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;
  const totalPossibleMarks = attempt?.max_score ?? questions.length * config.marksPerQuestion;

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-background font-bengali flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">প্রশ্ন লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background font-bengali flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">প্রশ্ন পাওয়া যায়নি</h1>
          <p className="text-muted-foreground mb-6">ডাটাবেজে প্রশ্ন যোগ করুন অ্যাডমিন প্যানেল থেকে।</p>
          <Button variant="hero" onClick={() => navigate(-1)}>ফিরে যাও</Button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    if (!attempt) {
      return (
        <div className="min-h-screen bg-background font-bengali flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">ফলাফল প্রসেস হচ্ছে...</h1>
            <p className="text-muted-foreground">অনুগ্রহ করে অপেক্ষা করুন</p>
          </div>
        </div>
      );
    }

    const totalMarks = Number(attempt.score);
    const percentage = attempt.max_score > 0 ? (totalMarks / attempt.max_score) * 100 : 0;
    return (
      <div className="min-h-screen bg-background font-bengali flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full text-center">
          <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${percentage >= 80 ? "bg-green-100" : percentage >= 50 ? "bg-yellow-100" : "bg-red-100"}`}>
            {percentage >= 80 ? <CheckCircle className="w-12 h-12 text-green-600" /> : <AlertCircle className="w-12 h-12 text-yellow-600" />}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">পরীক্ষা শেষ!</h1>
          <div className="bg-muted rounded-xl p-6 mb-6">
            <p className="text-4xl font-bold text-primary mb-2">{totalMarks.toFixed(1)}/{attempt.max_score}</p>
            <p className="text-muted-foreground">মোট মার্কস ({percentage.toFixed(1)}%)</p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div><p className="font-bold text-green-600">{attempt.correct_answers}</p><p className="text-muted-foreground">সঠিক</p></div>
              <div><p className="font-bold text-red-600">{attempt.wrong_answers}</p><p className="text-muted-foreground">ভুল</p></div>
              <div><p className="font-bold text-muted-foreground">{attempt.skipped}</p><p className="text-muted-foreground">এড়িয়ে গেছ</p></div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/question-bank")}>আরো প্র্যাকটিস</Button>
            <Button variant="hero" className="flex-1" onClick={() => navigate("/dashboard")}>ড্যাশবোর্ড</Button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background font-bengali">
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><X className="w-5 h-5" /></Button>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-medium">{id === "custom" ? "কাস্টম এক্সাম" : `এক্সাম`}</span>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${timeLeft < 300 ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"}`}>
              <Clock className="w-5 h-5" />
              <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
            </div>
            <Button variant="hero" onClick={() => setShowSubmitDialog(true)}>সাবমিট করো</Button>
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </header>

      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mt-6">
            <div className="flex items-center justify-between mb-6">
              <Badge variant="outline">প্রশ্ন {currentQuestion + 1}/{questions.length}</Badge>
              <div className="flex items-center gap-1">
                <Button
                  variant={isBookmarked(q.id) ? "secondary" : "ghost"}
                  size="sm"
                  disabled={bookmarkSaving}
                  onClick={() =>
                    toggleBookmark({
                      id: q.id,
                      question_text: q.question_text,
                      options: q.options,
                      subject: q.subject,
                      topic: q.topic,
                      difficulty: q.difficulty,
                    })
                  }
                  className="gap-1"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked(q.id) ? "fill-current" : ""}`} />
                  {isBookmarked(q.id) ? "সেভড" : "সেভ"}
                </Button>
                <Button variant={flagged.includes(currentQuestion) ? "destructive" : "ghost"} size="sm" onClick={toggleFlag} className="gap-1">
                  <Flag className="w-4 h-4" /> {flagged.includes(currentQuestion) ? "ফ্ল্যাগড" : "ফ্ল্যাগ"}
                </Button>
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-6">{q.question_text}</h2>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(i)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers[currentQuestion] === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold mr-3">
                    {String.fromCharCode(2453 + i)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(currentQuestion - 1)} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> আগের
            </Button>
            <div className="flex flex-wrap gap-2 justify-center max-w-xs">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQuestion(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    i === currentQuestion ? "bg-primary text-primary-foreground" :
                    answers[i] !== undefined ? "bg-secondary text-secondary-foreground" :
                    flagged.includes(i) ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"
                  }`}>{i + 1}</button>
              ))}
            </div>
            <Button variant="outline" disabled={currentQuestion === questions.length - 1} onClick={() => setCurrentQuestion(currentQuestion + 1)} className="gap-2">
              পরের <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-foreground mb-4">সাবমিট করবে?</h3>
            <div className="bg-muted rounded-xl p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">উত্তর দেওয়া:</span><span className="font-bold">{Object.keys(answers).length}/{questions.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">এড়িয়ে গেছ:</span><span className="font-bold">{questions.length - Object.keys(answers).length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ফ্ল্যাগড:</span><span className="font-bold">{flagged.length}</span></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSubmitDialog(false)}>বাতিল</Button>
              <Button variant="hero" className="flex-1" onClick={handleSubmit}>সাবমিট</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTake;
