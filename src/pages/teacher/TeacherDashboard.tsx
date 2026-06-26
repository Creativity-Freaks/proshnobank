import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  FileText,
  Loader2,
  PenTool,
  Search,
  Share2,
  Upload,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { usePageMeta } from "@/hooks/usePageMeta";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { questionsApi } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { TeacherSidebar, type TeacherView as SidebarTeacherView } from "@/components/teacher/TeacherSidebar";
import ContactPanel from "@/components/teacher/panels/ContactPanel";
import FeedbackPanel from "@/components/teacher/panels/FeedbackPanel";
import InstitutionPanel from "@/components/teacher/panels/InstitutionPanel";
import OmrEvaluatorPanel from "@/components/teacher/panels/OmrEvaluatorPanel";
import OmrGraderPanel from "@/components/teacher/panels/OmrGraderPanel";
import OmrSheetPanel from "@/components/teacher/panels/OmrSheetPanel";
import OmrTokenPanel from "@/components/teacher/panels/OmrTokenPanel";
import ReadyQuestionsPanel from "@/components/teacher/panels/ReadyQuestionsPanel";
import ReportsPanel from "@/components/teacher/panels/ReportsPanel";
import SharePanel from "@/components/teacher/panels/SharePanel";
import StudentsPanel from "@/components/teacher/panels/StudentsPanel";
import SubscriptionPanel from "@/components/teacher/panels/SubscriptionPanel";
import {
  buildQuestionPaperHtml,
  openPrintWindow,
  readInstitutionProfile,
  type PaperQuestion,
} from "@/lib/teacherPaper";

type TeacherView = SidebarTeacherView;

type QuestionRow = {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  question_text: string;
  options: string[];
  correct_answer?: number;
};

type TeacherPaperRow = {
  id: string;
  title: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

function isQuestionRow(value: unknown): value is QuestionRow {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.subject === "string" &&
    typeof v.topic === "string" &&
    typeof v.difficulty === "string" &&
    typeof v.question_text === "string" &&
    Array.isArray(v.options) &&
    v.options.every((o) => typeof o === "string")
  );
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function viewTitle(view: TeacherView) {
  switch (view) {
    case "overview":
      return "ড্যাশবোর্ড";
    case "questions":
      return "প্রশ্ন তৈরি";
    case "builder":
      return "প্রশ্ন সেট/টেমপ্লেট";
    case "schedule":
      return "অনলাইন পরীক্ষা";
    case "upload":
      return "প্রশ্নপত্র আপলোড";
    case "ready_questions":
      return "রেডি প্রশ্ন/সাজেশন";
    case "reports":
      return "বিস্তারিত রিপোর্ট";
    case "share":
      return "সহজে শেয়ার";
    case "students":
      return "শিক্ষার্থী";
    case "institution":
      return "আমার প্রতিষ্ঠান";
    case "subscription":
      return "আমার সাবস্ক্রিপশন";
    case "omr_evaluator":
      return "OMR Evaluator";
    case "omr_create":
      return "OMR তৈরী";
    case "omr_token":
      return "OMR টোকেন";
    case "omr_grade":
      return "OMR মূল্যায়ন";
    case "contact":
      return "যোগাযোগ";
    case "feedback":
      return "মতামত";
    default:
      return "Teacher Panel";
  }
}

export default function TeacherDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<TeacherView>("overview");

  const [questionSearch, setQuestionSearch] = useState("");
  const [builderSearch, setBuilderSearch] = useState("");
  const [builderCategory, setBuilderCategory] = useState<string>("");
  const [builderSubjectId, setBuilderSubjectId] = useState<string>("all");
  const [builderSubject, setBuilderSubject] = useState<string>("all");
  const [builderDifficulty, setBuilderDifficulty] = useState<string>("all");
  const [builderCategories, setBuilderCategories] = useState<{ id: string; name: string }[]>([]);
  const [builderSubjects, setBuilderSubjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [templateTitle, setTemplateTitle] = useState("");
  const [templateCategory, setTemplateCategory] = useState("teacher");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateDuration, setTemplateDuration] = useState("30");
  const [templateMarksPer, setTemplateMarksPer] = useState("1");
  const [templateNegativeMarks, setTemplateNegativeMarks] = useState("0");
  const [templateDifficulty, setTemplateDifficulty] = useState("medium");

  const [paperSubject, setPaperSubject] = useState("");
  const [paperSetCode, setPaperSetCode] = useState("");
  const [paperColumns, setPaperColumns] = useState<"1" | "2">("2");
  const [paperIncludeAnswerKey, setPaperIncludeAnswerKey] = useState(false);

  const [creatingQuestion, setCreatingQuestion] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [uploadingPaper, setUploadingPaper] = useState(false);

  const [eventTemplateId, setEventTemplateId] = useState<string>("");
  const [eventStartTime, setEventStartTime] = useState<string>("");
  const [eventPrize, setEventPrize] = useState<string>("");

  const [paperTitle, setPaperTitle] = useState<string>("");
  const [paperFile, setPaperFile] = useState<File | null>(null);

  usePageMeta({
    title: "টিচার ড্যাশবোর্ড",
    description: "প্রশ্ন তৈরি, প্রশ্ন সেট বানানো, এক্সাম শিডিউল এবং প্রশ্নপত্র আপলোড করুন।",
  });

  // Load categories once on mount
  useEffect(() => {
    supabase.from("exam_categories").select("id, name").is("parent_id", null).order("sort_order", { ascending: true })
      .then(({ data }) => setBuilderCategories(data || []));
  }, []);

  // Load subjects when builder category changes
  useEffect(() => {
    if (!builderCategory) { setBuilderSubjects([]); setBuilderSubjectId("all"); setBuilderSubject("all"); return; }
    supabase.from("subjects").select("id, name").eq("category_id", builderCategory).order("name")
      .then(({ data }) => { setBuilderSubjects(data || []); setBuilderSubjectId("all"); setBuilderSubject("all"); });
  }, [builderCategory]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const { data: myQuestionCountRes, isLoading: myQuestionCountLoading } = useQuery({
    queryKey: ["teacher-question-count", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      return questionsApi.mine({ limit: 1 });
    },
  });

  const { data: myQuestionsData, isLoading: myQuestionsLoading } = useQuery({
    queryKey: ["teacher-questions", user?.id, questionSearch],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const res = await questionsApi.mine({
        search: questionSearch.trim() || undefined,
        limit: 20,
      });
      return (Array.isArray(res.data) ? res.data : []).filter(isQuestionRow);
    },
  });

  const { data: searchQuestionsData, isLoading: searchQuestionsLoading } = useQuery({
    queryKey: ["teacher-builder-search", builderSearch, builderSubject, builderDifficulty],
    queryFn: async () => {
      const res = await questionsApi.list({
        search: builderSearch.trim() || undefined,
        subject: builderSubject !== "all" ? builderSubject : undefined,
        difficulty: builderDifficulty !== "all" ? builderDifficulty : undefined,
        limit: 30,
      });
      return (Array.isArray(res.data) ? res.data : []).filter(isQuestionRow);
    },
  });

  const { data: myTemplatesData, isLoading: myTemplatesLoading } = useQuery({
    queryKey: ["teacher-templates", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await supabase
        .from("exam_templates" as never)
        .select("id, title, category, question_count, duration_minutes, created_at")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (res.error) throw res.error;
      return (res.data || []) as unknown as Array<{
        id: string;
        title: string;
        category: string;
        question_count: number;
        duration_minutes: number;
        created_at: string;
      }>;
    },
  });

  const { data: myEventsData, isLoading: myEventsLoading } = useQuery({
    queryKey: ["teacher-events", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await supabase
        .from("live_exam_events" as never)
        .select("id, template_id, start_time, status")
        .eq("created_by", user.id)
        .order("start_time", { ascending: true })
        .limit(50);
      if (res.error) throw res.error;
      return (res.data || []) as unknown as Array<{
        id: string;
        template_id: string;
        start_time: string;
        status: string;
      }>;
    },
  });

  const { data: myPapersData, isLoading: myPapersLoading } = useQuery({
    queryKey: ["teacher-papers", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await supabase
        .from("teacher_papers" as never)
        .select("id, title, storage_path, file_name, mime_type, size_bytes, created_at")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (res.error) throw res.error;
      return (res.data || []) as unknown as TeacherPaperRow[];
    },
  });

  const allKnownQuestions = useMemo(() => {
    const map = new Map<string, QuestionRow>();
    (myQuestionsData || []).forEach((q) => map.set(q.id, q));
    (searchQuestionsData || []).forEach((q) => map.set(q.id, q));
    return map;
  }, [myQuestionsData, searchQuestionsData]);

  const selectedQuestions = useMemo(() => {
    return Array.from(selectedIds)
      .map((id) => allKnownQuestions.get(id))
      .filter((q): q is QuestionRow => Boolean(q));
  }, [allKnownQuestions, selectedIds]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateQuestion = async (data: {
    subject: string;
    topic: string;
    difficulty: "easy" | "medium" | "hard";
    question_text: string;
    options: string[];
    correct_answer: number;
    explanation?: string;
  }) => {
    try {
      setCreatingQuestion(true);
      await questionsApi.create(data);
      toast({ title: "সফল!", description: "প্রশ্ন যোগ হয়েছে।" });
      setShowQuestionForm(false);
      queryClient.invalidateQueries({ queryKey: ["teacher-questions"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-question-count"] });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "প্রশ্ন যোগ করতে সমস্যা হয়েছে।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
    } finally {
      setCreatingQuestion(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!user?.id) return;
    if (!templateTitle.trim()) {
      toast({ title: "ত্রুটি", description: "টেমপ্লেট টাইটেল দিন।", variant: "destructive" });
      return;
    }
    if (selectedIds.size === 0) {
      toast({ title: "ত্রুটি", description: "কমপক্ষে ১টি প্রশ্ন সিলেক্ট করুন।", variant: "destructive" });
      return;
    }

    try {
      setCreatingTemplate(true);

      const marksPerQuestion = Number(templateMarksPer) || 1;

      const subjects = uniqueStrings(selectedQuestions.map((q) => q.subject));
      const topics: Record<string, string[]> = {};
      subjects.forEach((subject) => {
        topics[subject] = uniqueStrings(
          selectedQuestions.filter((q) => q.subject === subject).map((q) => q.topic)
        );
      });

      const subjectsBreakdown = subjects.map((name) => {
        const count = selectedQuestions.filter((q) => q.subject === name).length;
        return { name, questions: count, marks: count * marksPerQuestion };
      });

      const payload = {
        title: templateTitle.trim(),
        category: templateCategory.trim() || "teacher",
        description: templateDescription.trim() || null,
        question_count: selectedQuestions.length,
        duration_minutes: Math.max(1, Math.trunc(Number(templateDuration) || 30)),
        marks_per_question: marksPerQuestion,
        negative_marks: Math.max(0, Number(templateNegativeMarks) || 0),
        difficulty: templateDifficulty,
        subjects,
        subjects_breakdown: subjectsBreakdown,
        topics,
        features: [],
        question_ids: Array.from(selectedIds),
      };

      const res = await supabase.from("exam_templates" as never).insert(payload as unknown as never);
      if (res.error) throw res.error;

      toast({ title: "সফল!", description: "প্রশ্ন সেট/টেমপ্লেট তৈরি হয়েছে।" });
      setTemplateTitle("");
      setTemplateDescription("");
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["teacher-templates"] });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "টেমপ্লেট তৈরি করতে সমস্যা হয়েছে।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleDownloadPdf = () => {
    if (selectedQuestions.length === 0) {
      toast({ title: "ত্রুটি", description: "প্রথমে প্রশ্ন সিলেক্ট করুন।", variant: "destructive" });
      return;
    }

    const marksPer = Number(templateMarksPer) || 1;
    const totalMarks = selectedQuestions.length * marksPer;
    const subject = paperSubject.trim() || uniqueStrings(selectedQuestions.map((q) => q.subject)).join(", ");

    const questions: PaperQuestion[] = selectedQuestions.map((q) => ({
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
    }));

    const html = buildQuestionPaperHtml(
      {
        examName: templateTitle.trim() || "প্রশ্নপত্র",
        subject,
        className: "",
        timeText: `${Math.max(1, Math.trunc(Number(templateDuration) || 30))} মিনিট`,
        fullMarks: String(totalMarks),
        setCode: paperSetCode.trim(),
        columns: paperColumns === "1" ? 1 : 2,
        fontSize: 14,
        instructions: templateDescription.trim(),
        includeAnswerKey: paperIncludeAnswerKey,
        watermark: readInstitutionProfile(user?.user_metadata).name,
        institution: readInstitutionProfile(user?.user_metadata),
      },
      questions,
    );

    if (!openPrintWindow(html)) {
      toast({
        title: "ত্রুটি",
        description: "পপ-আপ ব্লকড। Pop-up allow করে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    }
  };

  const handleCreateEvent = async () => {
    if (!eventTemplateId) {
      toast({ title: "ত্রুটি", description: "টেমপ্লেট সিলেক্ট করুন।", variant: "destructive" });
      return;
    }
    if (!eventStartTime) {
      toast({ title: "ত্রুটি", description: "শুরুর সময় দিন।", variant: "destructive" });
      return;
    }

    try {
      setCreatingEvent(true);
      const start = new Date(eventStartTime);
      if (Number.isNaN(start.getTime())) throw new Error("Invalid start time");

      const res = await supabase.from("live_exam_events" as never).insert({
        template_id: eventTemplateId,
        start_time: start.toISOString(),
        status: "upcoming",
        participants: 0,
        prize: eventPrize.trim() || null,
      } as unknown as never);
      if (res.error) throw res.error;

      toast({ title: "সফল!", description: "লাইভ এক্সাম শিডিউল হয়েছে।" });
      setEventStartTime("");
      setEventPrize("");
      queryClient.invalidateQueries({ queryKey: ["teacher-events"] });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "শিডিউল করতে সমস্যা হয়েছে।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleUploadPaper = async () => {
    if (!user?.id) return;
    if (!paperTitle.trim()) {
      toast({ title: "ত্রুটি", description: "ফাইল টাইটেল দিন।", variant: "destructive" });
      return;
    }
    if (!paperFile) {
      toast({ title: "ত্রুটি", description: "ফাইল সিলেক্ট করুন।", variant: "destructive" });
      return;
    }

    try {
      setUploadingPaper(true);
      const key = `${user.id}/${crypto.randomUUID()}-${paperFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("teacher-papers")
        .upload(key, paperFile, { upsert: false });
      if (uploadError) throw uploadError;

      const res = await supabase.from("teacher_papers" as never).insert({
        teacher_id: user.id,
        title: paperTitle.trim(),
        storage_path: key,
        file_name: paperFile.name,
        mime_type: paperFile.type || null,
        size_bytes: paperFile.size,
      } as unknown as never);
      if (res.error) throw res.error;

      toast({ title: "সফল!", description: "প্রশ্নপত্র আপলোড হয়েছে।" });
      setPaperTitle("");
      setPaperFile(null);
      queryClient.invalidateQueries({ queryKey: ["teacher-papers"] });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "আপলোড করতে সমস্যা হয়েছে।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
    } finally {
      setUploadingPaper(false);
    }
  };

  const handleDownloadPaper = async (storagePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("teacher-papers")
        .createSignedUrl(storagePath, 60);
      if (error) throw error;
      if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "ডাউনলোড করতে সমস্যা হয়েছে।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
    }
  };

  const displayName =
    (typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
    user?.email?.split("@")[0] ||
    "Teacher";

  const secondaryLine =
    (typeof user?.user_metadata?.institute === "string" && user.user_metadata.institute.trim()) ||
    (typeof user?.user_metadata?.location === "string" && user.user_metadata.location.trim()) ||
    "";

  const stats = [
    {
      key: "questions",
      label: "মোট প্রশ্ন তৈরী",
      icon: PenTool,
      value: myQuestionCountLoading ? "…" : String(myQuestionCountRes?.total ?? 0),
    },
    {
      key: "templates",
      label: "আমার টেমপ্লেট",
      icon: CalendarClock,
      value: myTemplatesLoading ? "…" : String((myTemplatesData || []).length),
    },
    {
      key: "scheduled",
      label: "অনলাইন পরীক্ষা",
      icon: FileText,
      value: myEventsLoading ? "…" : String((myEventsData || []).length),
    },
    {
      key: "uploads",
      label: "আপলোড",
      icon: Upload,
      value: myPapersLoading ? "…" : String((myPapersData || []).length),
    },
    {
      key: "omr",
      label: "OMR মূল্যায়ন",
      icon: ClipboardList,
      value: "0",
    },
    {
      key: "students",
      label: "শিক্ষার্থী",
      icon: Users,
      value: "0",
    },
  ] as const;

  const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    view,
    badge,
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    view: TeacherView;
    badge?: string;
  }) => (
    <button
      type="button"
      onClick={() => setActiveView(view)}
      className="relative rounded-2xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-card"
    >
      {badge ? (
        <span className="absolute right-4 top-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
          {badge}
        </span>
      ) : null}
      <div className="flex flex-col items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="h-[100dvh] w-full overflow-hidden font-bengali">
      <div className="flex h-full w-full overflow-hidden">
        <TeacherSidebar
          activeView={activeView}
          onChangeView={setActiveView}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground truncate">{viewTitle(activeView)}</div>
              <div className="text-xs text-muted-foreground truncate">
                {secondaryLine ? secondaryLine : "প্রশ্ন তৈরি, টেমপ্লেট, শিডিউল, আপলোড"}
              </div>
            </div>

            <div className="w-[180px] md:hidden">
              <Select value={activeView} onValueChange={(v) => setActiveView(v as TeacherView)}>
                <SelectTrigger>
                  <SelectValue placeholder="মেনু" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">ড্যাশবোর্ড</SelectItem>
                  <SelectItem value="questions">প্রশ্ন তৈরি</SelectItem>
                  <SelectItem value="builder">প্রশ্ন সেট/টেমপ্লেট</SelectItem>
                  <SelectItem value="schedule">অনলাইন পরীক্ষা</SelectItem>
                  <SelectItem value="upload">প্রশ্নপত্র আপলোড</SelectItem>
                  <SelectItem value="ready_questions">রেডি প্রশ্ন/সাজেশন</SelectItem>
                  <SelectItem value="reports">বিস্তারিত রিপোর্ট</SelectItem>
                  <SelectItem value="students">শিক্ষার্থী</SelectItem>
                  <SelectItem value="share">সহজে শেয়ার</SelectItem>
                  <SelectItem value="institution">আমার প্রতিষ্ঠান</SelectItem>
                  <SelectItem value="subscription">আমার সাবস্ক্রিপশন</SelectItem>
                  <SelectItem value="omr_evaluator">OMR Evaluator</SelectItem>
                  <SelectItem value="omr_create">OMR তৈরী</SelectItem>
                  <SelectItem value="omr_token">OMR টোকেন</SelectItem>
                  <SelectItem value="omr_grade">OMR মূল্যায়ন</SelectItem>
                  <SelectItem value="contact">যোগাযোগ</SelectItem>
                  <SelectItem value="feedback">মতামত</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:hidden">
              <Button variant="outline" onClick={handleLogout}>
                লগআউট
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <div className="text-right leading-tight">
                <div className="text-sm font-semibold text-foreground">{displayName}</div>
                <div className="text-xs text-muted-foreground">Teacher</div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                লগআউট
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-muted/30">
            <div className="w-full p-4 md:p-6 max-w-6xl mx-auto">
              {/* Profile banner */}
              <div className="rounded-2xl border border-border bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{displayName}</h1>
                {secondaryLine ? <p className="mt-2 text-primary-foreground/80">{secondaryLine}</p> : null}
                <p className="mt-4 text-primary-foreground/80 text-sm">
                  প্রশ্ন তৈরি, প্রশ্নপত্র সেট, PDF ডাউনলোড এবং লাইভ এক্সাম শিডিউল—সবকিছু এক জায়গায়।
                </p>
              </div>

              {/* Stats */}
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                {stats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.key}
                      className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden"
                    >
                      <div className="absolute right-4 top-4 opacity-20">
                        <Icon className="h-10 w-10 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="mt-2 text-3xl font-bold text-foreground">{s.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Overview */}
              {activeView === "overview" ? (
                <>
                  <div className="mt-8">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground">শিক্ষকদের জন্য শক্তিশালী টুলস</h2>
                      <p className="mt-1 text-sm text-muted-foreground">পরীক্ষা পরিচালনার সব কাজ সহজ করতে আমাদের ফিচারগুলো</p>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <QuickActionCard
                        title="১ ক্লিক প্রশ্ন তৈরী"
                        description="১ ক্লিক + প্রশ্ন থেকে অটোমেটিক প্রশ্নপত্র তৈরি"
                        icon={PenTool}
                        view="questions"
                        badge="NEW"
                      />
                      <QuickActionCard
                        title="রেডি প্রশ্ন"
                        description="প্রস্তুত প্রশ্ন/সাজেশন থেকে দ্রুত প্রশ্নপত্র"
                        icon={BookOpen}
                        view="ready_questions"
                      />
                      <QuickActionCard
                        title="OMR মূল্যায়ন"
                        description="মোবাইল দিয়ে OMR স্ক্যান ও মূল্যায়ন"
                        icon={ClipboardList}
                        view="omr_grade"
                      />
                      <QuickActionCard
                        title="অনলাইন পরীক্ষা"
                        description="শিডিউল লিংক দিয়ে অনলাইন পরীক্ষা নিন"
                        icon={CalendarClock}
                        view="schedule"
                      />
                      <QuickActionCard
                        title="প্রশ্নপত্র আপলোড"
                        description="PDF/Word আপলোড করে সংরক্ষণ করুন"
                        icon={Upload}
                        view="upload"
                      />
                      <QuickActionCard
                        title="বিস্তারিত রিপোর্ট"
                        description="পারফরম্যান্স অ্যানালাইসিস (শীঘ্রই)"
                        icon={FileText}
                        view="reports"
                      />
                      <QuickActionCard
                        title="শিক্ষার্থী"
                        description="ক্লাস/শিক্ষার্থী ম্যানেজ করুন (শীঘ্রই)"
                        icon={Users}
                        view="students"
                      />
                      <QuickActionCard
                        title="সহজে শেয়ার"
                        description="কোড/লিংক শেয়ার করে যুক্ত করুন (শীঘ্রই)"
                        icon={Share2}
                        view="share"
                      />
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>ইম্পর্ট্যান্ট আপডেটস</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>সফটওয়্যারের নতুন ফিচার, জরুরি আপডেটস এবং নির্দেশনা—সবই আগে পাবেন।</p>
                        <p className="flex items-start gap-2">
                          <span className="mt-0.5">✅</span>
                          <span>ড্যাশবোর্ডের টুলগুলো থেকে কাজ শুরু করুন।</span>
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>মতামত জানান!</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-3">
                        <p>
                          প্রশ্ন তৈরী, OMR ইভ্যালুয়েশন বা অনলাইন পরীক্ষার যেকোনো উন্নতিতে আপনার মতামতই আমাদের সবচেয়ে
                          গুরুত্বপূর্ণ।
                        </p>
                        <Button variant="outline" disabled>
                          মতামত দিন
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>লাইভ আপডেট</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>
                          ডাটাবেজ/ফিচার আপডেট এখানে দেখানো হবে।
                        </p>
                        <Button variant="outline" disabled>
                          LIVE আপডেট শীঘ্রই
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>লাইভ চ্যাট</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>
                          যেকোনো প্রশ্ন/সমস্যায় দ্রুত সহায়তা।
                        </p>
                        <Button variant="outline" disabled>
                          চ্যাট শীঘ্রই
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : null}

              {/* Questions */}
              {activeView === "questions" ? (
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>নতুন প্রশ্ন</CardTitle>
                      <Button
                        variant="outline"
                        onClick={() => setShowQuestionForm((v) => !v)}
                        disabled={creatingQuestion}
                      >
                        {showQuestionForm ? "বন্ধ" : "প্রশ্ন যোগ"}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {showQuestionForm ? (
                        <QuestionForm
                          onSubmit={handleCreateQuestion}
                          onCancel={() => setShowQuestionForm(false)}
                          isSubmitting={creatingQuestion}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">"প্রশ্ন যোগ" ক্লিক করে নতুন প্রশ্ন তৈরি করুন।</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>আমার প্রশ্ন</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <Input
                          placeholder="প্রশ্ন খুঁজুন..."
                          value={questionSearch}
                          onChange={(e) => setQuestionSearch(e.target.value)}
                        />
                      </div>

                      {myQuestionsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : (myQuestionsData || []).length === 0 ? (
                        <div className="text-sm text-muted-foreground">আপনার কোনো প্রশ্ন নেই।</div>
                      ) : (
                        <div className="space-y-3">
                          {(myQuestionsData || []).map((q) => (
                            <div key={q.id} className="rounded-xl border border-border p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-medium text-foreground line-clamp-2">{q.question_text}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {q.subject} • {q.topic} • {q.difficulty}
                                  </div>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => toggleSelected(q.id)}>
                                  {selectedIds.has(q.id) ? "বাদ" : "সিলেক্ট"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : null}

              {/* Builder */}
              {activeView === "builder" ? (
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>ডাটাবেজ থেকে প্রশ্ন সিলেক্ট</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="কিওয়ার্ড দিয়ে খুঁজুন..."
                            className="pl-10"
                            value={builderSearch}
                            onChange={(e) => setBuilderSearch(e.target.value)}
                          />
                        </div>

                        {/* Category filter */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">ক্যাটেগরি</Label>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => { setBuilderCategory(""); setBuilderSubject("all"); }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${!builderCategory ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}
                            >সব</button>
                            {builderCategories.map(cat => (
                              <button key={cat.id} type="button"
                                onClick={() => setBuilderCategory(cat.id === builderCategory ? "" : cat.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${builderCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}
                              >{cat.name}</button>
                            ))}
                          </div>
                        </div>

                        {/* Subject filter (cascades from category) */}
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">বিষয়</Label>
                            <Select
                              value={builderSubjectId}
                              onValueChange={val => {
                                setBuilderSubjectId(val);
                                const sub = builderSubjects.find(s => s.id === val);
                                setBuilderSubject(sub ? sub.name : "all");
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="বিষয় নির্বাচন" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">সব বিষয়</SelectItem>
                                {builderSubjects.map(sub => (
                                  <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                ))}
                                {/* legacy fallback if no subjects loaded */}
                                {builderSubjects.length === 0 && !builderCategory && <>
                                  <SelectItem value="__bangla">বাংলা</SelectItem>
                                  <SelectItem value="__english">ইংরেজি</SelectItem>
                                  <SelectItem value="__math">গণিত</SelectItem>
                                  <SelectItem value="__physics">পদার্থবিজ্ঞান</SelectItem>
                                  <SelectItem value="__chemistry">রসায়ন</SelectItem>
                                  <SelectItem value="__biology">জীববিজ্ঞান</SelectItem>
                                  <SelectItem value="__gk">সাধারণ জ্ঞান</SelectItem>
                                  <SelectItem value="__ict">ICT</SelectItem>
                                </>}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">কঠিনতা</Label>
                            <Select value={builderDifficulty} onValueChange={setBuilderDifficulty}>
                              <SelectTrigger>
                                <SelectValue placeholder="কঠিনতা" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">সব</SelectItem>
                                <SelectItem value="easy">সহজ</SelectItem>
                                <SelectItem value="medium">মাঝারি</SelectItem>
                                <SelectItem value="hard">কঠিন</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {searchQuestionsLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : (searchQuestionsData || []).length === 0 ? (
                        <div className="text-sm text-muted-foreground">কোনো প্রশ্ন পাওয়া যায়নি।</div>
                      ) : (
                        <div className="space-y-3">
                          {(searchQuestionsData || []).map((q) => (
                            <div key={q.id} className="rounded-xl border border-border p-3">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={selectedIds.has(q.id)}
                                  onCheckedChange={() => toggleSelected(q.id)}
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-foreground line-clamp-2">{q.question_text}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {q.subject} • {q.topic} • {q.difficulty}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>প্রশ্ন সেট তৈরি</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        সিলেক্টেড: <span className="font-medium text-foreground">{selectedIds.size}</span> টি প্রশ্ন
                      </div>

                      <div>
                        <Label>টাইটেল</Label>
                        <Input
                          className="mt-2"
                          value={templateTitle}
                          onChange={(e) => setTemplateTitle(e.target.value)}
                          placeholder="প্রশ্নপত্র/টেস্ট নাম"
                        />
                      </div>

                      <div>
                        <Label>ক্যাটাগরি</Label>
                        <Input
                          className="mt-2"
                          value={templateCategory}
                          onChange={(e) => setTemplateCategory(e.target.value)}
                          placeholder="teacher"
                        />
                      </div>

                      <div>
                        <Label>ডেসক্রিপশন (ঐচ্ছিক)</Label>
                        <Input
                          className="mt-2"
                          value={templateDescription}
                          onChange={(e) => setTemplateDescription(e.target.value)}
                          placeholder="..."
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label>সময় (মিনিট)</Label>
                          <Input
                            className="mt-2"
                            value={templateDuration}
                            onChange={(e) => setTemplateDuration(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>প্রতি প্রশ্নে মার্কস</Label>
                          <Input
                            className="mt-2"
                            value={templateMarksPer}
                            onChange={(e) => setTemplateMarksPer(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>নেগেটিভ মার্কস</Label>
                          <Input
                            className="mt-2"
                            value={templateNegativeMarks}
                            onChange={(e) => setTemplateNegativeMarks(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>কঠিনতা</Label>
                        <Select value={templateDifficulty} onValueChange={setTemplateDifficulty}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="medium" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">easy</SelectItem>
                            <SelectItem value="medium">medium</SelectItem>
                            <SelectItem value="hard">hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div className="text-sm font-semibold">প্রশ্নপত্র (PDF) অপশন</div>

                      <div>
                        <Label>বিষয় (হেডারে দেখাবে)</Label>
                        <Input
                          className="mt-2"
                          value={paperSubject}
                          onChange={(e) => setPaperSubject(e.target.value)}
                          placeholder="খালি রাখলে সিলেক্টেড প্রশ্নের বিষয় বসবে"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>সেট কোড</Label>
                          <Input
                            className="mt-2"
                            value={paperSetCode}
                            onChange={(e) => setPaperSetCode(e.target.value)}
                            placeholder="যেমন: A"
                          />
                        </div>
                        <div>
                          <Label>ক��াম</Label>
                          <Select value={paperColumns} onValueChange={(v) => setPaperColumns(v === "1" ? "1" : "2")}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">১ কলাম</SelectItem>
                              <SelectItem value="2">২ কলাম</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={paperIncludeAnswerKey}
                          onCheckedChange={(v) => setPaperIncludeAnswerKey(v === true)}
                        />
                        উত্তরমালা (Answer Key) যুক্ত করুন
                      </label>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleDownloadPdf}
                          disabled={selectedIds.size === 0}
                        >
                          PDF
                        </Button>
                        <Button className="flex-1" onClick={handleCreateTemplate} disabled={creatingTemplate}>
                          {creatingTemplate ? "তৈরি হচ্ছে..." : "টেমপ্লেট তৈরি"}
                        </Button>
                      </div>

                      <Separator />

                      <div>
                        <div className="text-sm font-semibold">আমার টেমপ্লেট</div>
                        <div className="mt-2">
                          {myTemplatesLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin" /> লোড হচ্ছে...
                            </div>
                          ) : (myTemplatesData || []).length === 0 ? (
                            <div className="text-sm text-muted-foreground">কোনো টেমপ্লেট নেই।</div>
                          ) : (
                            <div className="space-y-2">
                              {(myTemplatesData || []).slice(0, 6).map((t) => (
                                <div key={t.id} className="rounded-xl border border-border p-3">
                                  <div className="text-sm font-medium text-foreground">{t.title}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {t.category} • {t.question_count} প্রশ্ন • {t.duration_minutes} মিনিট
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}

              {/* Schedule */}
              {activeView === "schedule" ? (
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>লাইভ এক্সাম শিডিউল</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>টেমপ্লেট</Label>
                        {myTemplatesLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> লোড হচ্ছে...
                          </div>
                        ) : (
                          <Select value={eventTemplateId} onValueChange={setEventTemplateId}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="টেমপ্লেট সিলেক্ট" />
                            </SelectTrigger>
                            <SelectContent>
                              {(myTemplatesData || []).map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div>
                        <Label>শুরুর সময়</Label>
                        <Input
                          className="mt-2"
                          type="datetime-local"
                          value={eventStartTime}
                          onChange={(e) => setEventStartTime(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>প্রাইজ (ঐচ্ছিক)</Label>
                        <Input
                          className="mt-2"
                          value={eventPrize}
                          onChange={(e) => setEventPrize(e.target.value)}
                          placeholder="যেমন: ১ম পুরস্কার"
                        />
                      </div>

                      <Button onClick={handleCreateEvent} disabled={creatingEvent}>
                        {creatingEvent ? "শিডিউল হচ্ছে..." : "শিডিউল করুন"}
                      </Button>
                      <p className="text-xs text-muted-foreground">শিডিউল করার পর এটি “লাইভ এক্সাম” পেজে দেখাবে।</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>আমার শিডিউল</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {myEventsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : (myEventsData || []).length === 0 ? (
                        <div className="text-sm text-muted-foreground">কোনো শিডিউলড এক্সাম নেই।</div>
                      ) : (
                        <div className="space-y-3">
                          {(myEventsData || []).map((e) => (
                            <div key={e.id} className="rounded-xl border border-border p-3">
                              <div className="text-sm font-medium text-foreground">{e.status}</div>
                              <div className="text-xs text-muted-foreground mt-1">{new Date(e.start_time).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : null}

              {/* Upload */}
              {activeView === "upload" ? (
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>প্রশ্নপত্র আপলোড</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>টাইটেল</Label>
                        <Input
                          className="mt-2"
                          value={paperTitle}
                          onChange={(e) => setPaperTitle(e.target.value)}
                          placeholder="যেমন: মডেল টেস্ট - ১"
                        />
                      </div>
                      <div>
                        <Label>ফাইল</Label>
                        <Input
                          className="mt-2"
                          type="file"
                          accept="application/pdf,.pdf,application/msword,.doc,.docx"
                          onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-muted-foreground mt-2">PDF/Word আপলোড করা যাবে।</p>
                      </div>
                      <Button onClick={handleUploadPaper} disabled={uploadingPaper}>
                        {uploadingPaper ? "আপলোড হচ্ছে..." : "আপলোড"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>আমার আপলোড</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {myPapersLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : (myPapersData || []).length === 0 ? (
                        <div className="text-sm text-muted-foreground">কোনো ফাইল নেই।</div>
                      ) : (
                        <div className="space-y-3">
                          {(myPapersData || []).map((p) => (
                            <div
                              key={p.id}
                              className="rounded-xl border border-border p-3 flex items-center justify-between gap-3"
                            >
                              <div>
                                <div className="text-sm font-medium text-foreground">{p.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">{p.file_name}</div>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => handleDownloadPaper(p.storage_path)}>
                                ডাউনলোড
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : null}

              {activeView === "ready_questions" ? (
                <ReadyQuestionsPanel
                  templates={myTemplatesData || []}
                  loading={myTemplatesLoading}
                  onCreateNew={() => setActiveView("builder")}
                />
              ) : null}
              {activeView === "reports" ? (
                <ReportsPanel
                  questionCount={myQuestionCountRes?.total ?? 0}
                  templates={myTemplatesData || []}
                  events={myEventsData || []}
                  paperCount={(myPapersData || []).length}
                  loading={myQuestionCountLoading || myTemplatesLoading}
                />
              ) : null}
              {activeView === "share" ? <SharePanel /> : null}
              {activeView === "students" ? <StudentsPanel /> : null}
              {activeView === "institution" ? <InstitutionPanel /> : null}
              {activeView === "subscription" ? <SubscriptionPanel /> : null}
              {activeView === "omr_evaluator" ? <OmrEvaluatorPanel /> : null}
              {activeView === "omr_create" ? <OmrSheetPanel /> : null}
              {activeView === "omr_token" ? <OmrTokenPanel /> : null}
              {activeView === "omr_grade" ? <OmrGraderPanel /> : null}
              {activeView === "contact" ? <ContactPanel /> : null}
              {activeView === "feedback" ? <FeedbackPanel /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
