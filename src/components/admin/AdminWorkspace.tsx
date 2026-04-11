import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarClock,
  FilePenLine,
  FolderTree,
  LayoutDashboard,
  Layers3,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  School,
  Search,
  Shield,
  Sparkles,
  Trash2,
  Users,
  UsersRound,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { QuestionList } from "@/components/admin/QuestionList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";
import { adminApi, type AdminCreateUserRequest, type AdminUser } from "@/lib/admin/admin-api";
import {
  adminDashboardApi,
  type AdminAnalytics,
  type AdminOverviewStats,
  type BatchStatus,
  type ExamBatch,
  type ExamBatchInput,
  type ExamCategory,
  type ExamCategoryInput,
  type ExamTemplate,
  type ExamTemplateInput,
  type LiveEventInput,
  type LiveExamEvent,
  type LiveExamStatus,
  type Question,
  type RoleInput,
  type SubjectInput,
  type SubjectRecord,
  type UserRole,
  type UserDirectoryItem,
} from "@/lib/admin/admin-dashboard-api";
import { SUBJECT_OPTIONS } from "@/lib/subjects";

interface QuestionFormData {
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

type TemplateFormState = {
  title: string;
  category: string;
  description: string;
  question_count: string;
  duration_minutes: string;
  marks_per_question: string;
  negative_marks: string;
  difficulty: string;
  subjectsCsv: string;
  featuresCsv: string;
  topicsJson: string;
};

type LiveEventFormState = {
  template_id: string;
  start_time: string;
  status: LiveExamStatus;
  participants: string;
  prize: string;
};

type RoleFormState = {
  user_id: string;
  role: RoleInput["role"];
};

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  sort_order: string;
  is_active: boolean;
};

type SubjectFormState = {
  name: string;
  key: string;
  category_id: string;
  description: string;
  is_active: boolean;
};

type BatchFormState = {
  title: string;
  category_id: string;
  template_id: string;
  description: string;
  price: string;
  duration_days: string;
  seats: string;
  status: BatchStatus;
  start_date: string;
};

type PanelTab =
  | "overview"
  | "analytics"
  | "questions"
  | "templates"
  | "events"
  | "categories"
  | "subjects"
  | "batches"
  | "users"
  | "settings";

type AdminPanelProps = {
  forcedTab?: PanelTab;
};

type SettingsSection = "access-control" | "user" | "teacher" | "moderator" | "admin";

const SETTINGS_SECTION_ROUTES: Record<SettingsSection, string> = {
  "access-control": "/admin/settings/access-control",
  user: "/admin/settings/users",
  teacher: "/admin/settings/teachers",
  moderator: "/admin/settings/moderators",
  admin: "/admin/settings/admins",
};

const TAB_LABELS: Record<PanelTab, string> = {
  overview: "Overview",
  analytics: "Analytics",
  questions: "Question Bank",
  templates: "Exam Templates",
  events: "Live Events",
  categories: "Exam Categories",
  subjects: "Subjects",
  batches: "Exam Batches",
  users: "Users",
  settings: "Settings",
};

const TAB_ROUTES: Record<PanelTab, string> = {
  overview: "/admin",
  analytics: "/admin/analytics",
  questions: "/admin/questions",
  templates: "/admin/templates",
  events: "/admin/live-exams",
  categories: "/admin/categories",
  subjects: "/admin/subjects",
  batches: "/admin/batches",
  users: "/admin/users",
  settings: "/admin/settings",
};

function tabFromPathname(pathname: string): PanelTab {
  const normalized = pathname.replace(/\/+$/, "");
  if (normalized === "/admin") return "overview";
  if (normalized === "/admin/analytics") return "analytics";
  if (normalized === "/admin/questions") return "questions";
  if (normalized === "/admin/templates") return "templates";
  if (normalized === "/admin/live-exams") return "events";
  if (normalized === "/admin/categories") return "categories";
  if (normalized === "/admin/subjects") return "subjects";
  if (normalized === "/admin/batches") return "batches";
  if (normalized === "/admin/users") return "settings";
  if (normalized === "/admin/settings" || normalized.startsWith("/admin/settings/")) return "settings";
  if (normalized === "/admin/roles") return "settings";
  return "overview";
}

function settingsSectionFromPathname(pathname: string): SettingsSection {
  const normalized = pathname.replace(/\/+$/, "");
  if (normalized === "/admin/settings" || normalized === "/admin/roles") return "access-control";
  if (normalized === "/admin/users") return "user";

  const match = normalized.match(/^\/admin\/settings\/(.+)$/);
  const raw = match?.[1] || "";

  if (raw === "access-control") return "access-control";
  if (raw === "users") return "user";
  if (raw === "teachers") return "teacher";
  if (raw === "moderators") return "moderator";
  if (raw === "admins") return "admin";
  return "access-control";
}

type SubjectTopicInsight = {
  subject: string;
  questions: number;
  topics: number;
  topTopics: Array<{ topic: string; questions: number }>;
};

const defaultTemplateForm: TemplateFormState = {
  title: "",
  category: "",
  description: "",
  question_count: "25",
  duration_minutes: "30",
  marks_per_question: "1",
  negative_marks: "0",
  difficulty: "all",
  subjectsCsv: "",
  featuresCsv: "",
  topicsJson: "{}",
};

const defaultEventForm: LiveEventFormState = {
  template_id: "",
  start_time: "",
  status: "upcoming",
  participants: "0",
  prize: "",
};

const defaultRoleForm: RoleFormState = {
  user_id: "",
  role: "teacher",
};

const defaultCategoryForm: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  sort_order: "0",
  is_active: true,
};

const defaultSubjectForm: SubjectFormState = {
  name: "",
  key: "",
  category_id: "none",
  description: "",
  is_active: true,
};

const defaultBatchForm: BatchFormState = {
  title: "",
  category_id: "none",
  template_id: "none",
  description: "",
  price: "0",
  duration_days: "30",
  seats: "0",
  status: "draft",
  start_date: "",
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("bn-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function parseCsvInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTopics(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const normalized: Record<string, string[]> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, nested]) => {
    normalized[key] = Array.isArray(nested)
      ? nested.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
  });
  return normalized;
}

const AdminWorkspace = ({ forcedTab }: AdminPanelProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminCheck();

  const resolvedTab = forcedTab ?? tabFromPathname(location.pathname);
  const [activeTab, setActiveTab] = useState<PanelTab>(resolvedTab);
  const [isBootLoading, setIsBootLoading] = useState(true);

  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjectInsightQuestions, setSubjectInsightQuestions] = useState<Question[]>([]);
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveExamEvent[]>([]);
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [batches, setBatches] = useState<ExamBatch[]>([]);
  const [users, setUsers] = useState<UserDirectoryItem[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);

  const [settingsUsers, setSettingsUsers] = useState<AdminUser[]>([]);
  const [settingsUsersTotal, setSettingsUsersTotal] = useState(0);
  const [isSettingsUsersLoading, setIsSettingsUsersLoading] = useState(false);
  const [settingsSearch, setSettingsSearch] = useState("");

  const [settingsSection, setSettingsSection] = useState<SettingsSection>("access-control");

  const [createUserForm, setCreateUserForm] = useState<AdminCreateUserRequest>({
    name: "",
    email: "",
    password: "",
    role: "moderator",
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [isSubjectInsightLoading, setIsSubjectInsightLoading] = useState(false);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isEventLoading, setIsEventLoading] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [isSubjectLoading, setIsSubjectLoading] = useState(false);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionSubmitting, setIsQuestionSubmitting] = useState(false);
  const [isQuestionDeleting, setIsQuestionDeleting] = useState<string | null>(null);

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState<TemplateFormState>(defaultTemplateForm);
  const [isTemplateSubmitting, setIsTemplateSubmitting] = useState(false);
  const [isTemplateDeleting, setIsTemplateDeleting] = useState<string | null>(null);

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<LiveEventFormState>(defaultEventForm);
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);
  const [isEventDeleting, setIsEventDeleting] = useState<string | null>(null);

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState<RoleFormState>(defaultRoleForm);
  const [isRoleSubmitting, setIsRoleSubmitting] = useState(false);
  const [isRoleDeleting, setIsRoleDeleting] = useState<string | null>(null);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(defaultCategoryForm);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [isCategoryDeleting, setIsCategoryDeleting] = useState<string | null>(null);

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState<SubjectFormState>(defaultSubjectForm);
  const [isSubjectSubmitting, setIsSubjectSubmitting] = useState(false);
  const [isSubjectDeleting, setIsSubjectDeleting] = useState<string | null>(null);

  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchForm, setBatchForm] = useState<BatchFormState>(defaultBatchForm);
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const fetchOverview = useCallback(async () => {
    setIsOverviewLoading(true);
    try {
      const response = await adminDashboardApi.getOverviewStats();
      setOverview(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Overview লোড করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsOverviewLoading(false);
    }
  }, [toast]);

  const fetchQuestions = useCallback(async () => {
    setIsQuestionLoading(true);
    try {
      const response = await adminDashboardApi.questions.list({
        search: searchQuery || undefined,
        subject: subjectFilter !== "all" ? subjectFilter : undefined,
        difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined,
      });
      setQuestions(response.data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "প্রশ্ন লোড করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsQuestionLoading(false);
    }
  }, [difficultyFilter, searchQuery, subjectFilter, toast]);

  const fetchSubjectInsights = useCallback(async () => {
    setIsSubjectInsightLoading(true);
    try {
      const response = await adminDashboardApi.questions.list({ limit: 5000, offset: 0 });
      setSubjectInsightQuestions(response.data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Subject data লোড করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubjectInsightLoading(false);
    }
  }, [toast]);

  const fetchTemplates = useCallback(async () => {
    setIsTemplateLoading(true);
    try {
      const response = await adminDashboardApi.templates.list();
      setTemplates(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Template লোড করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsTemplateLoading(false);
    }
  }, [toast]);

  const fetchLiveEvents = useCallback(async () => {
    setIsEventLoading(true);
    try {
      const response = await adminDashboardApi.liveEvents.list();
      setLiveEvents(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Live event লোড করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsEventLoading(false);
    }
  }, [toast]);

  const fetchRoles = useCallback(async () => {
    setIsRoleLoading(true);
    try {
      const response = await adminDashboardApi.roles.list();
      setRoles(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Role data লোড করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsRoleLoading(false);
    }
  }, [toast]);

  const fetchAnalytics = useCallback(async () => {
    setIsOverviewLoading(true);
    try {
      const response = await adminDashboardApi.analytics.getDashboard();
      setAnalytics(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Analytics লোড করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsOverviewLoading(false);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    setIsCategoryLoading(true);
    try {
      const response = await adminDashboardApi.categories.list();
      setCategories(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Categories লোড করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsCategoryLoading(false);
    }
  }, [toast]);

  const fetchSubjects = useCallback(async () => {
    setIsSubjectLoading(true);
    try {
      const response = await adminDashboardApi.subjects.list();
      setSubjects(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Subjects লোড করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubjectLoading(false);
    }
  }, [toast]);

  const fetchBatches = useCallback(async () => {
    setIsBatchLoading(true);
    try {
      const response = await adminDashboardApi.batches.list();
      setBatches(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Batches লোড করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsBatchLoading(false);
    }
  }, [toast]);

  const fetchUsers = useCallback(async () => {
    setIsUserLoading(true);
    try {
      const response = await adminDashboardApi.users.list();
      setUsers(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Users data লোড করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsUserLoading(false);
    }
  }, [toast]);

  const loadAllData = useCallback(async () => {
    setIsBootLoading(true);
    await Promise.all([
      fetchOverview(),
      fetchAnalytics(),
      fetchQuestions(),
      fetchTemplates(),
      fetchLiveEvents(),
      fetchCategories(),
      fetchSubjects(),
      fetchBatches(),
      fetchUsers(),
      fetchRoles(),
    ]);
    setIsBootLoading(false);
  }, [
    fetchAnalytics,
    fetchBatches,
    fetchCategories,
    fetchLiveEvents,
    fetchOverview,
    fetchQuestions,
    fetchRoles,
    fetchSubjects,
    fetchTemplates,
    fetchUsers,
  ]);

  useEffect(() => {
    if (!isCheckingAdmin && !isAdmin) {
      toast({
        title: "Access denied",
        description: "অ্যাডমিন পারমিশন ছাড়া এই প্যানেলে প্রবেশ করা যাবে না",
        variant: "destructive",
      });
      navigate("/admin/login", { replace: true });
    }
  }, [isAdmin, isCheckingAdmin, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin, loadAllData]);

  useEffect(() => {
    setActiveTab(resolvedTab);
  }, [resolvedTab]);

  useEffect(() => {
    const normalized = location.pathname.replace(/\/+$/, "");
    if (normalized === "/admin/users") {
      navigate("/admin/settings/users", { replace: true });
      return;
    }
    if (normalized === "/admin/roles") {
      navigate("/admin/settings/access-control", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (resolvedTab === "settings") {
      setIsSettingsMenuOpen(true);
      const section = settingsSectionFromPathname(location.pathname);
      setSettingsSection(section);
      if (section === "admin" || section === "moderator") {
        setCreateUserForm((prev) => ({ ...prev, role: section }));
      }
    } else {
      setIsSettingsMenuOpen(false);
    }
  }, [location.pathname, resolvedTab]);

  const handleSettingsNavigate = (section: SettingsSection) => {
    setSettingsSection(section);
    if (section === "admin" || section === "moderator") {
      setCreateUserForm((prev) => ({ ...prev, role: section }));
    }
    navigate(SETTINGS_SECTION_ROUTES[section]);
  };

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === "subjects") {
      fetchSubjectInsights();
    }
  }, [activeTab, fetchSubjectInsights, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== "settings") return;

    let isMounted = true;
    const load = async () => {
      setIsSettingsUsersLoading(true);
      setSettingsUsers([]);
      setSettingsUsersTotal(0);
      try {
        const queryRole = settingsSection === "access-control" ? "all" : settingsSection;
        const res = await adminApi.users({ role: queryRole, limit: 200, offset: 0, search: settingsSearch });
        if (!isMounted) return;
        setSettingsUsers(res.data);
        setSettingsUsersTotal(res.total);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Users লোড করা যায়নি";
        toast({ title: "Error", description: message, variant: "destructive" });
        if (!isMounted) return;
        setSettingsUsers([]);
        setSettingsUsersTotal(0);
      } finally {
        if (isMounted) {
          setIsSettingsUsersLoading(false);
        }
      }
    };

    const debounceId = setTimeout(() => {
      load();
    }, 500);
    
    return () => {
      isMounted = false;
      clearTimeout(debounceId);
    };
  }, [activeTab, isAdmin, settingsSection, settingsSearch, toast]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchQuestions();
  }, [fetchQuestions, isAdmin]);

  const recentTemplates = useMemo(() => templates.slice(0, 5), [templates]);
  const upcomingEvents = useMemo(() => liveEvents.slice(0, 5), [liveEvents]);

  const templateCategoryFilter = useMemo(() => {
    if (activeTab !== "templates") return "";
    return (searchParams.get("category") || "").trim();
  }, [activeTab, searchParams]);

  const templateCategories = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((template) => {
      if (template.category) set.add(template.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b)).slice(0, 12);
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (!templateCategoryFilter) return templates;
    return templates.filter((template) => template.category === templateCategoryFilter);
  }, [templateCategoryFilter, templates]);

  const subjectTopicInsights = useMemo<SubjectTopicInsight[]>(() => {
    const bySubject = new Map<string, Map<string, number>>();

    subjectInsightQuestions.forEach((question) => {
      const subject = String(question.subject || "").trim();
      const topic = String(question.topic || "").trim();
      if (!subject) return;

      const topicKey = topic || "(untitled)";
      const topicMap = bySubject.get(subject) || new Map<string, number>();
      topicMap.set(topicKey, (topicMap.get(topicKey) || 0) + 1);
      bySubject.set(subject, topicMap);
    });

    return Array.from(bySubject.entries())
      .map(([subject, topicsMap]) => {
        const topTopics = Array.from(topicsMap.entries())
          .map(([topic, count]) => ({ topic, questions: count }))
          .sort((a, b) => b.questions - a.questions)
          .slice(0, 4);

        const questionsCount = Array.from(topicsMap.values()).reduce((sum, value) => sum + value, 0);

        return {
          subject,
          questions: questionsCount,
          topics: topicsMap.size,
          topTopics,
        };
      })
      .sort((a, b) => b.questions - a.questions);
  }, [subjectInsightQuestions]);

  const handleQuestionSubmit = async (formData: QuestionFormData) => {
    setIsQuestionSubmitting(true);
    try {
      if (editingQuestion) {
        await adminDashboardApi.questions.update(editingQuestion.id, formData);
        toast({ title: "সফল", description: "প্রশ্ন আপডেট হয়েছে" });
      } else {
        await adminDashboardApi.questions.create(formData);
        toast({ title: "সফল", description: "নতুন প্রশ্ন যোগ হয়েছে" });
      }

      setEditingQuestion(null);
      setShowQuestionForm(false);
      await Promise.all([fetchQuestions(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "প্রশ্ন সেভ করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsQuestionSubmitting(false);
    }
  };

  const handleQuestionDelete = async (id: string) => {
    if (!window.confirm("এই প্রশ্নটি মুছে ফেলতে চান?")) return;

    setIsQuestionDeleting(id);
    try {
      await adminDashboardApi.questions.delete(id);
      toast({ title: "সফল", description: "প্রশ্ন মুছে ফেলা হয়েছে" });
      await Promise.all([fetchQuestions(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "প্রশ্ন ডিলিট করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsQuestionDeleting(null);
    }
  };

  const resetTemplateEditor = () => {
    setEditingTemplateId(null);
    setTemplateForm(defaultTemplateForm);
  };

  const handleTemplateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsTemplateSubmitting(true);

    try {
      const topicsObject = normalizeTopics(JSON.parse(templateForm.topicsJson || "{}"));
      const payload: ExamTemplateInput = {
        title: templateForm.title.trim(),
        category: templateForm.category.trim(),
        description: templateForm.description.trim(),
        question_count: Math.max(0, Number(templateForm.question_count) || 0),
        duration_minutes: Math.max(1, Number(templateForm.duration_minutes) || 30),
        marks_per_question: Number(templateForm.marks_per_question) || 1,
        negative_marks: Number(templateForm.negative_marks) || 0,
        difficulty: templateForm.difficulty.trim() || "all",
        subjects: parseCsvInput(templateForm.subjectsCsv),
        features: parseCsvInput(templateForm.featuresCsv),
        topics: topicsObject,
      };

      if (!payload.title || !payload.category) {
        throw new Error("Template title এবং category বাধ্যতামূলক");
      }

      if (editingTemplateId) {
        await adminDashboardApi.templates.update(editingTemplateId, payload);
        toast({ title: "সফল", description: "Template আপডেট হয়েছে" });
      } else {
        await adminDashboardApi.templates.create(payload);
        toast({ title: "সফল", description: "Template তৈরি হয়েছে" });
      }

      resetTemplateEditor();
      await Promise.all([fetchTemplates(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Template সেভ করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsTemplateSubmitting(false);
    }
  };

  const handleTemplateEdit = (template: ExamTemplate) => {
    setEditingTemplateId(template.id);
    setTemplateForm({
      title: template.title,
      category: template.category,
      description: template.description || "",
      question_count: String(template.question_count),
      duration_minutes: String(template.duration_minutes),
      marks_per_question: String(template.marks_per_question),
      negative_marks: String(template.negative_marks),
      difficulty: template.difficulty || "all",
      subjectsCsv: template.subjects.join(", "),
      featuresCsv: template.features.join(", "),
      topicsJson: JSON.stringify(template.topics || {}, null, 2),
    });
    navigate(TAB_ROUTES.templates);
  };

  const handleTemplateDelete = async (id: string) => {
    if (!window.confirm("এই template মুছে ফেললে related live event-ও মুছে যেতে পারে। চালিয়ে যাবেন?")) return;
    setIsTemplateDeleting(id);

    try {
      await adminDashboardApi.templates.delete(id);
      toast({ title: "সফল", description: "Template ডিলিট হয়েছে" });
      await Promise.all([fetchTemplates(), fetchLiveEvents(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Template ডিলিট করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsTemplateDeleting(null);
    }
  };

  const resetEventEditor = () => {
    setEditingEventId(null);
    setEventForm(defaultEventForm);
  };

  const handleEventSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsEventSubmitting(true);

    try {
      if (!eventForm.template_id || !eventForm.start_time) {
        throw new Error("Template এবং start time বাধ্যতামূলক");
      }

      const payload: LiveEventInput = {
        template_id: eventForm.template_id,
        start_time: new Date(eventForm.start_time).toISOString(),
        status: eventForm.status,
        participants: Math.max(0, Number(eventForm.participants) || 0),
        prize: eventForm.prize.trim(),
      };

      if (editingEventId) {
        await adminDashboardApi.liveEvents.update(editingEventId, payload);
        toast({ title: "সফল", description: "Live event আপডেট হয়েছে" });
      } else {
        await adminDashboardApi.liveEvents.create(payload);
        toast({ title: "সফল", description: "Live event তৈরি হয়েছে" });
      }

      resetEventEditor();
      await Promise.all([fetchLiveEvents(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Live event সেভ করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsEventSubmitting(false);
    }
  };

  const handleEventEdit = (eventItem: LiveExamEvent) => {
    setEditingEventId(eventItem.id);
    setEventForm({
      template_id: eventItem.template_id,
      start_time: new Date(eventItem.start_time).toISOString().slice(0, 16),
      status: eventItem.status,
      participants: String(eventItem.participants),
      prize: eventItem.prize || "",
    });
    navigate(TAB_ROUTES.events);
  };

  const handleEventDelete = async (id: string) => {
    if (!window.confirm("এই live event মুছে ফেলতে চান?")) return;

    setIsEventDeleting(id);
    try {
      await adminDashboardApi.liveEvents.delete(id);
      toast({ title: "সফল", description: "Live event ডিলিট হয়েছে" });
      await Promise.all([fetchLiveEvents(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Live event ডিলিট করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsEventDeleting(null);
    }
  };

  const resetRoleEditor = () => {
    setEditingRoleId(null);
    setRoleForm(defaultRoleForm);
  };

  const handleRoleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsRoleSubmitting(true);
    try {
      if (!roleForm.user_id.trim()) {
        throw new Error("User ID বাধ্যতামূলক");
      }

      const payload: RoleInput = {
        user_id: roleForm.user_id.trim(),
        role: roleForm.role,
      };

      if (editingRoleId) {
        await adminDashboardApi.roles.update(editingRoleId, payload);
        toast({ title: "সফল", description: "Role আপডেট হয়েছে" });
      } else {
        await adminDashboardApi.roles.create(payload);
        toast({ title: "সফল", description: "Role অ্যাসাইন হয়েছে" });
      }

      resetRoleEditor();
      await Promise.all([fetchRoles(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Role সেভ করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsRoleSubmitting(false);
    }
  };

  const handleRoleEdit = (role: UserRole) => {
    setEditingRoleId(role.id);
    setRoleForm({ user_id: role.user_id, role: role.role });
    navigate(TAB_ROUTES.settings);
  };

  const handleRoleDelete = async (id: string) => {
    if (!window.confirm("এই role assignment মুছে ফেলতে চান?")) return;

    setIsRoleDeleting(id);
    try {
      await adminDashboardApi.roles.delete(id);
      toast({ title: "সফল", description: "Role assignment ডিলিট হয়েছে" });
      await Promise.all([fetchRoles(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Role ডিলিট করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsRoleDeleting(null);
    }
  };

  const resetCategoryEditor = () => {
    setEditingCategoryId(null);
    setCategoryForm(defaultCategoryForm);
  };

  const handleCategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCategorySubmitting(true);
    try {
      const payload: ExamCategoryInput = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim().toLowerCase(),
        description: categoryForm.description.trim(),
        sort_order: Math.trunc(Number(categoryForm.sort_order) || 0),
        is_active: categoryForm.is_active,
      };

      if (!payload.name || !payload.slug) {
        throw new Error("Category name এবং slug বাধ্যতামূলক");
      }

      if (editingCategoryId) {
        await adminDashboardApi.categories.update(editingCategoryId, payload);
        toast({ title: "সফল", description: "Category আপডেট হয়েছে" });
      } else {
        await adminDashboardApi.categories.create(payload);
        toast({ title: "সফল", description: "Category তৈরি হয়েছে" });
      }

      resetCategoryEditor();
      await Promise.all([fetchCategories(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Category সেভ করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleCategoryEdit = (category: ExamCategory) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      sort_order: String(category.sort_order),
      is_active: category.is_active,
    });
    navigate(TAB_ROUTES.categories);
  };

  const handleCategoryDelete = async (id: string) => {
    if (!window.confirm("এই category মুছে ফেলতে চান?")) return;
    setIsCategoryDeleting(id);
    try {
      await adminDashboardApi.categories.delete(id);
      toast({ title: "সফল", description: "Category ডিলিট হয়েছে" });
      await Promise.all([fetchCategories(), fetchSubjects(), fetchBatches(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Category ডিলিট করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsCategoryDeleting(null);
    }
  };

  const resetSubjectEditor = () => {
    setEditingSubjectId(null);
    setSubjectForm(defaultSubjectForm);
  };

  const handleSubjectSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubjectSubmitting(true);
    try {
      const payload: SubjectInput = {
        name: subjectForm.name.trim(),
        key: subjectForm.key.trim().toLowerCase(),
        category_id: subjectForm.category_id === "none" ? null : subjectForm.category_id,
        description: subjectForm.description.trim(),
        is_active: subjectForm.is_active,
      };

      if (!payload.name || !payload.key) {
        throw new Error("Subject name এবং key বাধ্যতামূলক");
      }

      if (editingSubjectId) {
        await adminDashboardApi.subjects.update(editingSubjectId, payload);
        toast({ title: "সফল", description: "Subject আপডেট হয়েছে" });
      } else {
        await adminDashboardApi.subjects.create(payload);
        toast({ title: "সফল", description: "Subject তৈরি হয়েছে" });
      }

      resetSubjectEditor();
      await Promise.all([fetchSubjects(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Subject সেভ করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubjectSubmitting(false);
    }
  };

  const handleSubjectEdit = (subject: SubjectRecord) => {
    setEditingSubjectId(subject.id);
    setSubjectForm({
      name: subject.name,
      key: subject.key,
      category_id: subject.category_id || "none",
      description: subject.description || "",
      is_active: subject.is_active,
    });
    navigate(TAB_ROUTES.subjects);
  };

  const handleSubjectDelete = async (id: string) => {
    if (!window.confirm("এই subject মুছে ফেলতে চান?")) return;
    setIsSubjectDeleting(id);
    try {
      await adminDashboardApi.subjects.delete(id);
      toast({ title: "সফল", description: "Subject ডিলিট হয়েছে" });
      await Promise.all([fetchSubjects(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Subject ডিলিট করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubjectDeleting(null);
    }
  };

  const resetBatchEditor = () => {
    setEditingBatchId(null);
    setBatchForm(defaultBatchForm);
  };

  const handleBatchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsBatchSubmitting(true);
    try {
      const payload: ExamBatchInput = {
        title: batchForm.title.trim(),
        category_id: batchForm.category_id === "none" ? null : batchForm.category_id,
        template_id: batchForm.template_id === "none" ? null : batchForm.template_id,
        description: batchForm.description.trim(),
        price: Number(batchForm.price) || 0,
        duration_days: Math.max(1, Math.trunc(Number(batchForm.duration_days) || 30)),
        seats: Math.max(0, Math.trunc(Number(batchForm.seats) || 0)),
        status: batchForm.status,
        start_date: batchForm.start_date || null,
      };

      if (!payload.title) {
        throw new Error("Batch title বাধ্যতামূলক");
      }

      if (editingBatchId) {
        await adminDashboardApi.batches.update(editingBatchId, payload);
        toast({ title: "সফল", description: "Batch আপডেট হয়েছে" });
      } else {
        await adminDashboardApi.batches.create(payload);
        toast({ title: "সফল", description: "Batch তৈরি হয়েছে" });
      }

      resetBatchEditor();
      await Promise.all([fetchBatches(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Batch সেভ করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsBatchSubmitting(false);
    }
  };

  const handleBatchEdit = (batch: ExamBatch) => {
    setEditingBatchId(batch.id);
    setBatchForm({
      title: batch.title,
      category_id: batch.category_id || "none",
      template_id: batch.template_id || "none",
      description: batch.description || "",
      price: String(batch.price),
      duration_days: String(batch.duration_days),
      seats: String(batch.seats),
      status: (batch.status as BatchStatus) || "draft",
      start_date: batch.start_date || "",
    });
    navigate(TAB_ROUTES.batches);
  };

  const handleBatchDelete = async (id: string) => {
    if (!window.confirm("এই batch মুছে ফেলতে চান?")) return;
    setIsBatchDeleting(id);
    try {
      await adminDashboardApi.batches.delete(id);
      toast({ title: "সফল", description: "Batch ডিলিট হয়েছে" });
      await Promise.all([fetchBatches(), fetchOverview()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Batch ডিলিট করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsBatchDeleting(null);
    }
  };

  const reloadSettingsUsers = async () => {
    if (activeTab !== "settings") return;
    const queryRole = settingsSection === "access-control" ? "all" : settingsSection;
    const res = await adminApi.users({ role: queryRole, limit: 200, offset: 0, search: settingsSearch });
    setSettingsUsers(res.data);
    setSettingsUsersTotal(res.total);
  };

  const handleUserPrimaryRole = async (userId: string, nextRole: RoleInput["role"]) => {
    try {
      await adminApi.updateRole(userId, nextRole, false);
      toast({ title: "সফল", description: `${userId.slice(0, 8)}... এ ${nextRole} role assign হয়েছে` });
      await Promise.all([fetchUsers(), fetchRoles(), fetchOverview(), fetchAnalytics(), reloadSettingsUsers()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "User role আপডেট করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleRefreshByTab = async () => {
    if (activeTab === "overview") {
      await Promise.all([fetchOverview(), fetchAnalytics()]);
      return;
    }
    if (activeTab === "analytics") {
      await fetchAnalytics();
      return;
    }
    if (activeTab === "questions") {
      await fetchQuestions();
      return;
    }
    if (activeTab === "templates") {
      await fetchTemplates();
      return;
    }
    if (activeTab === "events") {
      await fetchLiveEvents();
      return;
    }
    if (activeTab === "categories") {
      await fetchCategories();
      return;
    }
    if (activeTab === "subjects") {
      await fetchSubjects();
      return;
    }
    if (activeTab === "batches") {
      await fetchBatches();
      return;
    }
    if (activeTab === "users") {
      await fetchUsers();
      return;
    }
    if (activeTab === "settings") {
      await Promise.all([fetchUsers(), fetchRoles()]);
      return;
    }
    await fetchRoles();
  };

  const handleUserRoleRemove = async (userId: string, role: RoleInput["role"]) => {
    try {
      await adminApi.updateRole(userId, role, true);
      toast({ title: "সফল", description: `${userId.slice(0, 8)}... থেকে ${role} role remove হয়েছে` });
      await Promise.all([fetchUsers(), fetchRoles(), fetchOverview(), fetchAnalytics(), reloadSettingsUsers()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "User role remove করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleUserRestrictionToggle = async (userId: string, nextRestricted: boolean) => {
    try {
      await adminApi.updateRestriction(userId, nextRestricted);
      toast({
        title: "সফল",
        description: `${userId.slice(0, 8)}... account ${nextRestricted ? "restricted" : "unrestricted"} হয়েছে`,
      });
      await Promise.all([fetchUsers(), fetchRoles(), fetchOverview(), fetchAnalytics(), reloadSettingsUsers()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "User restriction আপডেট করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleUserSuspensionToggle = async (userId: string, nextSuspended: boolean) => {
    try {
      await adminApi.updateSuspension(userId, nextSuspended);
      toast({
        title: "সফল",
        description: `${userId.slice(0, 8)}... account ${nextSuspended ? "suspended" : "unsuspended"} হয়েছে`,
      });
      await Promise.all([fetchUsers(), fetchRoles(), fetchOverview(), fetchAnalytics(), reloadSettingsUsers()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "User suspension আপডেট করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleCreatePrivilegedUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingUser(true);

    try {
      const payload: AdminCreateUserRequest = {
        name: createUserForm.name.trim(),
        email: createUserForm.email.trim().toLowerCase(),
        password: createUserForm.password,
        role: createUserForm.role,
      };

      if (!payload.name || !payload.email || !payload.password) {
        throw new Error("Name, email, password বাধ্যতামূলক");
      }

      const res = await adminApi.createUser(payload);
      toast({
        title: "সফল",
        description: `${payload.role} user তৈরি হয়েছে (${res.data.user_id.slice(0, 8)}...)`,
      });

      setCreateUserForm((prev) => ({ ...prev, name: "", email: "", password: "" }));
      await Promise.all([fetchUsers(), fetchRoles(), fetchOverview(), fetchAnalytics()]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "User create করা যায়নি";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsCreatingUser(false);
    }
  };

  if (isCheckingAdmin || isBootLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm tracking-wide text-muted-foreground">Admin workspace loading...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-muted/40 text-foreground">
      <aside className="w-64 shrink-0 border-r border-background/10 bg-foreground text-background">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5" />
            <span>ProshnoBank Admin</span>
          </div>
        </div>

        <div className="flex h-[calc(100vh-4rem)] flex-col overflow-y-auto px-3 pb-4">
          <p className="px-2 pt-2 text-xs font-medium uppercase tracking-widest text-background/50">Menu</p>
          <div className="mt-3 space-y-1">
            <Button
              className={`w-full justify-start hover:bg-background/10 hover:text-background ${
                activeTab === "overview" ? "bg-background/10 text-background" : "text-background/80"
              }`}
              variant="ghost"
              onClick={() => navigate(TAB_ROUTES.overview)}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {TAB_LABELS.overview}
            </Button>
            <Button
              className={`w-full justify-start hover:bg-background/10 hover:text-background ${
                activeTab === "analytics" ? "bg-background/10 text-background" : "text-background/80"
              }`}
              variant="ghost"
              onClick={() => navigate(TAB_ROUTES.analytics)}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {TAB_LABELS.analytics}
            </Button>
            <Button
              className={`w-full justify-start hover:bg-background/10 hover:text-background ${
                activeTab === "questions" ? "bg-background/10 text-background" : "text-background/80"
              }`}
              variant="ghost"
              onClick={() => navigate(TAB_ROUTES.questions)}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {TAB_LABELS.questions}
            </Button>

            <div className="pt-2">
              <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-widest text-background/50">Exams</p>
              <div className="space-y-1">
                <Button
                  className={`w-full justify-start hover:bg-background/10 hover:text-background ${
                    activeTab === "templates" ? "bg-background/10 text-background" : "text-background/80"
                  }`}
                  variant="ghost"
                  onClick={() => navigate(TAB_ROUTES.templates)}
                >
                  <FilePenLine className="mr-2 h-4 w-4" />
                  {TAB_LABELS.templates}
                </Button>
                <Button
                  className={`w-full justify-start hover:bg-background/10 hover:text-background ${
                    activeTab === "events" ? "bg-background/10 text-background" : "text-background/80"
                  }`}
                  variant="ghost"
                  onClick={() => navigate(TAB_ROUTES.events)}
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  {TAB_LABELS.events}
                </Button>

                {templateCategories.length > 0 ? (
                  <div className="mt-2 rounded-lg border border-background/10 bg-background/5 p-2">
                    <p className="mb-2 text-[11px] uppercase tracking-widest text-background/50">Categories</p>
                    <div className="space-y-1">
                      {templateCategories.map((category) => (
                        <Button
                          key={category}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-full justify-start text-background/80 hover:bg-background/10 hover:text-background"
                          onClick={() => navigate(`${TAB_ROUTES.templates}?category=${encodeURIComponent(category)}`)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="pt-2">
              <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-widest text-background/50">Management</p>
              <div className="space-y-1">
                <Button
                  className={`w-full justify-start hover:bg-background/10 hover:text-background ${
                    activeTab === "categories" ? "bg-background/10 text-background" : "text-background/80"
                  }`}
                  variant="ghost"
                  onClick={() => navigate(TAB_ROUTES.categories)}
                >
                  <FolderTree className="mr-2 h-4 w-4" />
                  {TAB_LABELS.categories}
                </Button>
                <Button
                  className={`w-full justify-start hover:bg-background/10 hover:text-background ${
                    activeTab === "subjects" ? "bg-background/10 text-background" : "text-background/80"
                  }`}
                  variant="ghost"
                  onClick={() => navigate(TAB_ROUTES.subjects)}
                >
                  <School className="mr-2 h-4 w-4" />
                  {TAB_LABELS.subjects}
                </Button>
                <Button
                  className={`w-full justify-start hover:bg-background/10 hover:text-background ${
                    activeTab === "batches" ? "bg-background/10 text-background" : "text-background/80"
                  }`}
                  variant="ghost"
                  onClick={() => navigate(TAB_ROUTES.batches)}
                >
                  <Layers3 className="mr-2 h-4 w-4" />
                  {TAB_LABELS.batches}
                </Button>
                <Button
                  className={`w-full justify-start hover:bg-background/10 hover:text-background ${
                    activeTab === "settings" ? "bg-background/10 text-background" : "text-background/80"
                  }`}
                  variant="ghost"
                  onClick={() => {
                    if (activeTab !== "settings") {
                      handleSettingsNavigate("access-control");
                      return;
                    }
                    setIsSettingsMenuOpen((prev) => !prev);
                  }}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {TAB_LABELS.settings}
                </Button>

                {isSettingsMenuOpen ? (
                  <div className="ml-6 space-y-1 border-l border-background/10 pl-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-full justify-start text-background/80 hover:bg-background/10 hover:text-background ${
                        activeTab === "settings" && settingsSection === "access-control"
                          ? "bg-background/10 text-background"
                          : ""
                      }`}
                      onClick={() => handleSettingsNavigate("access-control")}
                    >
                      Access Control
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-full justify-start text-background/80 hover:bg-background/10 hover:text-background ${
                        activeTab === "settings" && settingsSection === "user" ? "bg-background/10 text-background" : ""
                      }`}
                      onClick={() => handleSettingsNavigate("user")}
                    >
                      Users
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-full justify-start text-background/80 hover:bg-background/10 hover:text-background ${
                        activeTab === "settings" && settingsSection === "teacher"
                          ? "bg-background/10 text-background"
                          : ""
                      }`}
                      onClick={() => handleSettingsNavigate("teacher")}
                    >
                      Teachers
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-full justify-start text-background/80 hover:bg-background/10 hover:text-background ${
                        activeTab === "settings" && settingsSection === "moderator"
                          ? "bg-background/10 text-background"
                          : ""
                      }`}
                      onClick={() => handleSettingsNavigate("moderator")}
                    >
                      Moderators
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-full justify-start text-background/80 hover:bg-background/10 hover:text-background ${
                        activeTab === "settings" && settingsSection === "admin" ? "bg-background/10 text-background" : ""
                      }`}
                      onClick={() => handleSettingsNavigate("admin")}
                    >
                      Admins
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-xs text-muted-foreground">{TAB_LABELS[activeTab]}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" asChild>
              <Link to="/" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back To Site
              </Link>
            </Button>
            <Button variant="outline" onClick={handleRefreshByTab}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">
          <div className="space-y-6">
            {activeTab === "overview" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Questions</CardDescription>
                      <CardTitle className="text-2xl">{overview?.totalQuestions ?? 0}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Exam Templates</CardDescription>
                      <CardTitle className="text-2xl">{overview?.totalTemplates ?? 0}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Active Live Events</CardDescription>
                      <CardTitle className="text-2xl">{overview?.activeLiveEvents ?? 0}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Role Assignments</CardDescription>
                      <CardTitle className="text-2xl">{overview?.totalRoleAssignments ?? 0}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Templates</CardTitle>
                      <CardDescription>Latest exam template library</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isOverviewLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                        </div>
                      ) : recentTemplates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No templates yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {recentTemplates.map((template) => (
                            <div key={template.id} className="rounded-lg border border-border bg-muted/30 p-3">
                              <p className="font-medium">{template.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {template.category} • {template.question_count} প্রশ্ন • {template.duration_minutes} মিনিট
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming Live Events</CardTitle>
                      <CardDescription>Scheduled event timeline</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isOverviewLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                        </div>
                      ) : upcomingEvents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No live events scheduled.</p>
                      ) : (
                        <div className="space-y-3">
                          {upcomingEvents.map((eventItem) => (
                            <div key={eventItem.id} className="rounded-lg border border-border bg-muted/30 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium">{eventItem.template?.title || "Untitled template"}</p>
                                <Badge variant="outline">{eventItem.status}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{formatDateTime(eventItem.start_time)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeTab === "analytics" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Users</CardDescription>
                      <CardTitle className="text-2xl">{analytics?.total_users ?? 0}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Attempts</CardDescription>
                      <CardTitle className="text-2xl">{analytics?.total_attempts ?? 0}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Avg Accuracy</CardDescription>
                      <CardTitle className="text-2xl">{analytics?.avg_accuracy ?? 0}%</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Last 30 Days Attempts</CardDescription>
                      <CardTitle className="text-2xl">{analytics?.attempts_last_30_days ?? 0}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Subjects</CardTitle>
                      <CardDescription>Most attempted subjects with accuracy</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isOverviewLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics...
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject</TableHead>
                              <TableHead>Attempts</TableHead>
                              <TableHead>Avg Accuracy</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(analytics?.top_subjects || []).map((item) => (
                              <TableRow key={item.subject}>
                                <TableCell>{item.subject}</TableCell>
                                <TableCell>{item.attempts}</TableCell>
                                <TableCell>{item.avg_accuracy}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Role Distribution</CardTitle>
                      <CardDescription>Current primary role based user split</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isOverviewLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading role distribution...
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Role</TableHead>
                              <TableHead>Users</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(analytics?.role_distribution || []).map((item) => (
                              <TableRow key={item.role}>
                                <TableCell>
                                  <Badge variant={item.role === "admin" ? "destructive" : "secondary"}>{item.role}</Badge>
                                </TableCell>
                                <TableCell>{item.count}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeTab === "questions" && (
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>Question Bank Management</CardTitle>
                      <CardDescription>Create, edit, filter, and delete questions</CardDescription>
                    </div>
                    {!showQuestionForm && (
                      <Button onClick={() => setShowQuestionForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Question
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {showQuestionForm ? (
                    <QuestionForm
                      initialData={
                        editingQuestion
                          ? {
                              subject: editingQuestion.subject,
                              topic: editingQuestion.topic,
                              difficulty: editingQuestion.difficulty,
                              question_text: editingQuestion.question_text,
                              options: editingQuestion.options as string[],
                              correct_answer: editingQuestion.correct_answer,
                              explanation: editingQuestion.explanation || "",
                            }
                          : undefined
                      }
                      onSubmit={handleQuestionSubmit}
                      onCancel={() => {
                        setShowQuestionForm(false);
                        setEditingQuestion(null);
                      }}
                      isSubmitting={isQuestionSubmitting}
                    />
                  ) : (
                    <>
                      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="Search question by topic/text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                          />
                        </div>
                        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {SUBJECT_OPTIONS.map((subject) => (
                              <SelectItem key={subject.key} value={subject.key}>
                                {subject.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {isQuestionLoading ? (
                        <div className="flex justify-center py-10">
                          <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        </div>
                      ) : (
                        <QuestionList
                          questions={questions}
                          onEdit={(question) => {
                            setEditingQuestion(question);
                            setShowQuestionForm(true);
                          }}
                          onDelete={handleQuestionDelete}
                          isDeleting={isQuestionDeleting}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "templates" && (
              <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>{editingTemplateId ? "Edit Template" : "Create Template"}</CardTitle>
                    <CardDescription>Exam structure and metadata management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-3" onSubmit={handleTemplateSubmit}>
                      <div className="space-y-1">
                        <Label>Title</Label>
                        <Input
                          value={templateForm.title}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, title: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <Input
                          value={templateForm.category}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, category: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Textarea
                          rows={2}
                          value={templateForm.description}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, description: event.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label>Questions</Label>
                          <Input
                            type="number"
                            min={0}
                            value={templateForm.question_count}
                            onChange={(event) =>
                              setTemplateForm((prev) => ({ ...prev, question_count: event.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Duration (min)</Label>
                          <Input
                            type="number"
                            min={1}
                            value={templateForm.duration_minutes}
                            onChange={(event) =>
                              setTemplateForm((prev) => ({ ...prev, duration_minutes: event.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Marks / Q</Label>
                          <Input
                            type="number"
                            step="0.25"
                            value={templateForm.marks_per_question}
                            onChange={(event) =>
                              setTemplateForm((prev) => ({ ...prev, marks_per_question: event.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Negative Mark</Label>
                          <Input
                            type="number"
                            step="0.25"
                            value={templateForm.negative_marks}
                            onChange={(event) =>
                              setTemplateForm((prev) => ({ ...prev, negative_marks: event.target.value }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label>Difficulty</Label>
                        <Input
                          value={templateForm.difficulty}
                          placeholder="all / easy / medium / hard"
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, difficulty: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Subjects (comma separated)</Label>
                        <Input
                          value={templateForm.subjectsCsv}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, subjectsCsv: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Features (comma separated)</Label>
                        <Input
                          value={templateForm.featuresCsv}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, featuresCsv: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Topics (JSON)</Label>
                        <Textarea
                          rows={5}
                          value={templateForm.topicsJson}
                          onChange={(event) => setTemplateForm((prev) => ({ ...prev, topicsJson: event.target.value }))}
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={isTemplateSubmitting}>
                          {isTemplateSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {editingTemplateId ? "Update Template" : "Create Template"}
                        </Button>
                        {editingTemplateId ? (
                          <Button type="button" variant="secondary" onClick={resetTemplateEditor}>
                            Cancel Edit
                          </Button>
                        ) : null}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <CardTitle>Template Library</CardTitle>
                        <CardDescription>All available templates for exam setup</CardDescription>
                      </div>
                      {templateCategoryFilter ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Category: {templateCategoryFilter}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => navigate(TAB_ROUTES.templates)}>
                            Clear
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isTemplateLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      </div>
                    ) : filteredTemplates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No template found.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Q / Time</TableHead>
                            <TableHead>Subjects</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTemplates.map((template) => (
                            <TableRow key={template.id}>
                              <TableCell>
                                <p className="font-medium">{template.title}</p>
                                {template.description ? (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                                ) : null}
                              </TableCell>
                              <TableCell>{template.category}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{template.difficulty || "all"}</Badge>
                              </TableCell>
                              <TableCell>
                                {template.question_count} / {template.duration_minutes}m
                              </TableCell>
                              <TableCell className="max-w-[180px] truncate">{template.subjects.join(", ") || "-"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleTemplateEdit(template)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleTemplateDelete(template.id)}
                                    disabled={isTemplateDeleting === template.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "events" && (
              <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>{editingEventId ? "Edit Live Event" : "Create Live Event"}</CardTitle>
                    <CardDescription>Schedule and status control for live exams</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-3" onSubmit={handleEventSubmit}>
                      <div className="space-y-1">
                        <Label>Template</Label>
                        <Select
                          value={eventForm.template_id}
                          onValueChange={(value) => setEventForm((prev) => ({ ...prev, template_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>Start Time</Label>
                        <Input
                          type="datetime-local"
                          value={eventForm.start_time}
                          onChange={(event) => setEventForm((prev) => ({ ...prev, start_time: event.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Status</Label>
                        <Select
                          value={eventForm.status}
                          onValueChange={(value: LiveExamStatus) => setEventForm((prev) => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">upcoming</SelectItem>
                            <SelectItem value="starting-soon">starting-soon</SelectItem>
                            <SelectItem value="live">live</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>Participants</Label>
                        <Input
                          type="number"
                          min={0}
                          value={eventForm.participants}
                          onChange={(event) => setEventForm((prev) => ({ ...prev, participants: event.target.value }))}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Prize</Label>
                        <Input
                          value={eventForm.prize}
                          onChange={(event) => setEventForm((prev) => ({ ...prev, prize: event.target.value }))}
                          placeholder="Optional"
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={isEventSubmitting}>
                          {isEventSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {editingEventId ? "Update Event" : "Create Event"}
                        </Button>
                        {editingEventId ? (
                          <Button type="button" variant="secondary" onClick={resetEventEditor}>
                            Cancel Edit
                          </Button>
                        ) : null}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Live Event Queue</CardTitle>
                    <CardDescription>Manage schedule, state and participation snapshot</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isEventLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      </div>
                    ) : liveEvents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No live events found.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Template</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Participants</TableHead>
                            <TableHead>Prize</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {liveEvents.map((eventItem) => (
                            <TableRow key={eventItem.id}>
                              <TableCell>
                                <p className="font-medium">{eventItem.template?.title || "Untitled"}</p>
                                <p className="text-xs text-muted-foreground">{eventItem.template?.category || "-"}</p>
                              </TableCell>
                              <TableCell>{formatDateTime(eventItem.start_time)}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{eventItem.status}</Badge>
                              </TableCell>
                              <TableCell>{eventItem.participants}</TableCell>
                              <TableCell>{eventItem.prize || "-"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleEventEdit(eventItem)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleEventDelete(eventItem.id)}
                                    disabled={isEventDeleting === eventItem.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "categories" && (
              <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>{editingCategoryId ? "Edit Category" : "Create Category"}</CardTitle>
                    <CardDescription>Manage exam category taxonomy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-3" onSubmit={handleCategorySubmit}>
                      <div className="space-y-1">
                        <Label>Name</Label>
                        <Input
                          value={categoryForm.name}
                          onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Slug</Label>
                        <Input
                          value={categoryForm.slug}
                          onChange={(event) => setCategoryForm((prev) => ({ ...prev, slug: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          value={categoryForm.description}
                          onChange={(event) =>
                            setCategoryForm((prev) => ({ ...prev, description: event.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Sort Order</Label>
                        <Input
                          type="number"
                          value={categoryForm.sort_order}
                          onChange={(event) =>
                            setCategoryForm((prev) => ({ ...prev, sort_order: event.target.value }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="category-active"
                          type="checkbox"
                          checked={categoryForm.is_active}
                          onChange={(event) =>
                            setCategoryForm((prev) => ({ ...prev, is_active: event.target.checked }))
                          }
                        />
                        <Label htmlFor="category-active">Active Category</Label>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={isCategorySubmitting}>
                          {isCategorySubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {editingCategoryId ? "Update Category" : "Create Category"}
                        </Button>
                        {editingCategoryId ? (
                          <Button type="button" variant="secondary" onClick={resetCategoryEditor}>
                            Cancel Edit
                          </Button>
                        ) : null}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category List</CardTitle>
                    <CardDescription>All exam categories with display ordering</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isCategoryLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categories.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.slug}</TableCell>
                              <TableCell>{item.sort_order}</TableCell>
                              <TableCell>
                                <Badge variant={item.is_active ? "secondary" : "outline"}>
                                  {item.is_active ? "active" : "inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleCategoryEdit(item)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleCategoryDelete(item.id)}
                                    disabled={isCategoryDeleting === item.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "subjects" && (
              <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
                <Card className="xl:col-span-2">
                  <CardHeader>
                    <CardTitle>Subjects & Topics (Auto from Question Bank)</CardTitle>
                    <CardDescription>স্বয়ংক্রিয়ভাবে question bank থেকে subject/topic breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isSubjectInsightLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading insights...
                      </div>
                    ) : subjectTopicInsights.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No subject data found in question bank.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead>Topics</TableHead>
                            <TableHead>Top Topics</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subjectTopicInsights.slice(0, 20).map((item) => (
                            <TableRow key={item.subject}>
                              <TableCell className="font-medium">{item.subject}</TableCell>
                              <TableCell>{item.questions}</TableCell>
                              <TableCell>{item.topics}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {item.topTopics.map((topic) => `${topic.topic} (${topic.questions})`).join(" • ")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{editingSubjectId ? "Edit Subject" : "Create Subject"}</CardTitle>
                    <CardDescription>Manage subject catalog and category mapping</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-3" onSubmit={handleSubjectSubmit}>
                      <div className="space-y-1">
                        <Label>Name</Label>
                        <Input
                          value={subjectForm.name}
                          onChange={(event) => setSubjectForm((prev) => ({ ...prev, name: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Key</Label>
                        <Input
                          value={subjectForm.key}
                          onChange={(event) => setSubjectForm((prev) => ({ ...prev, key: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <Select
                          value={subjectForm.category_id}
                          onValueChange={(value) => setSubjectForm((prev) => ({ ...prev, category_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          value={subjectForm.description}
                          onChange={(event) => setSubjectForm((prev) => ({ ...prev, description: event.target.value }))}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="subject-active"
                          type="checkbox"
                          checked={subjectForm.is_active}
                          onChange={(event) =>
                            setSubjectForm((prev) => ({ ...prev, is_active: event.target.checked }))
                          }
                        />
                        <Label htmlFor="subject-active">Active Subject</Label>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={isSubjectSubmitting}>
                          {isSubjectSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {editingSubjectId ? "Update Subject" : "Create Subject"}
                        </Button>
                        {editingSubjectId ? (
                          <Button type="button" variant="secondary" onClick={resetSubjectEditor}>
                            Cancel Edit
                          </Button>
                        ) : null}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subject List</CardTitle>
                    <CardDescription>All managed subjects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isSubjectLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Key</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subjects.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.key}</TableCell>
                              <TableCell>{item.category_name || "-"}</TableCell>
                              <TableCell>
                                <Badge variant={item.is_active ? "secondary" : "outline"}>
                                  {item.is_active ? "active" : "inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleSubjectEdit(item)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleSubjectDelete(item.id)}
                                    disabled={isSubjectDeleting === item.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "batches" && (
              <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>{editingBatchId ? "Edit Batch" : "Create Batch"}</CardTitle>
                    <CardDescription>Batch management for enrollment and publishing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-3" onSubmit={handleBatchSubmit}>
                      <div className="space-y-1">
                        <Label>Title</Label>
                        <Input
                          value={batchForm.title}
                          onChange={(event) => setBatchForm((prev) => ({ ...prev, title: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <Select
                          value={batchForm.category_id}
                          onValueChange={(value) => setBatchForm((prev) => ({ ...prev, category_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Template</Label>
                        <Select
                          value={batchForm.template_id}
                          onValueChange={(value) => setBatchForm((prev) => ({ ...prev, template_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Template</SelectItem>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Textarea
                          rows={2}
                          value={batchForm.description}
                          onChange={(event) => setBatchForm((prev) => ({ ...prev, description: event.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label>Price</Label>
                          <Input
                            type="number"
                            min={0}
                            value={batchForm.price}
                            onChange={(event) => setBatchForm((prev) => ({ ...prev, price: event.target.value }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Duration (days)</Label>
                          <Input
                            type="number"
                            min={1}
                            value={batchForm.duration_days}
                            onChange={(event) =>
                              setBatchForm((prev) => ({ ...prev, duration_days: event.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Seats</Label>
                          <Input
                            type="number"
                            min={0}
                            value={batchForm.seats}
                            onChange={(event) => setBatchForm((prev) => ({ ...prev, seats: event.target.value }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Status</Label>
                          <Select
                            value={batchForm.status}
                            onValueChange={(value: BatchStatus) => setBatchForm((prev) => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">draft</SelectItem>
                              <SelectItem value="published">published</SelectItem>
                              <SelectItem value="archived">archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={batchForm.start_date}
                          onChange={(event) => setBatchForm((prev) => ({ ...prev, start_date: event.target.value }))}
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={isBatchSubmitting}>
                          {isBatchSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {editingBatchId ? "Update Batch" : "Create Batch"}
                        </Button>
                        {editingBatchId ? (
                          <Button type="button" variant="secondary" onClick={resetBatchEditor}>
                            Cancel Edit
                          </Button>
                        ) : null}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Batch List</CardTitle>
                    <CardDescription>Exam batches with status and linking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isBatchLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Template</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batches.map((batch) => (
                            <TableRow key={batch.id}>
                              <TableCell>{batch.title}</TableCell>
                              <TableCell>{batch.category_name || "-"}</TableCell>
                              <TableCell>{batch.template_title || "-"}</TableCell>
                              <TableCell>৳{Number(batch.price || 0).toLocaleString("bn-BD")}</TableCell>
                              <TableCell>
                                <Badge variant={batch.status === "published" ? "secondary" : "outline"}>{batch.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleBatchEdit(batch)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleBatchDelete(batch.id)}
                                    disabled={isBatchDeleting === batch.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "users" && (
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user/teacher/moderator/admin role access</CardDescription>
                </CardHeader>
                <CardContent>
                  {isUserLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User ID</TableHead>
                          <TableHead>Current Roles</TableHead>
                          <TableHead>Attempts</TableHead>
                          <TableHead>Accuracy</TableHead>
                          <TableHead>Quick Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.user_id}>
                            <TableCell className="font-mono text-xs">{user.user_id}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                  <Badge key={`${user.user_id}-${role}`} variant={role === "admin" ? "destructive" : "secondary"}>
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{user.attempts}</TableCell>
                            <TableCell>{user.avg_accuracy}%</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                <Button variant="outline" size="sm" onClick={() => handleUserPrimaryRole(user.user_id, "user")}>user</Button>
                                <Button variant="outline" size="sm" onClick={() => handleUserPrimaryRole(user.user_id, "teacher")}>teacher</Button>
                                <Button variant="outline" size="sm" onClick={() => handleUserPrimaryRole(user.user_id, "moderator")}>moderator</Button>
                                <Button variant="outline" size="sm" onClick={() => handleUserPrimaryRole(user.user_id, "admin")}>admin</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                {(() => {
                    const section =
                      settingsSection === "admin"
                        ? { key: "admin" as const, label: "Admins", role: "admin" as const }
                        : settingsSection === "moderator"
                          ? { key: "moderator" as const, label: "Moderators", role: "moderator" as const }
                          : settingsSection === "teacher"
                            ? { key: "teacher" as const, label: "Teachers", role: "teacher" as const }
                            : settingsSection === "access-control"
                              ? { key: "all" as const, label: "All Users / Access Control", role: "all" as const }
                              : { key: "user" as const, label: "Users", role: "user" as const };

                    const attemptMap = new Map(users.map((u) => [u.user_id, u] as const));
                    const list = settingsUsers;
                    const total = settingsUsersTotal;

                    return (
                      <div className="space-y-4">
                        {section.role === "admin" || section.role === "moderator" ? (
                          <Card>
                            <CardHeader>
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle>Create {section.role}</CardTitle>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    setCreateUserForm({ name: "", email: "", password: "", role: section.role })
                                  }
                                >
                                  Clear
                                </Button>
                              </div>
                              <CardDescription>নাম, ইমেইল, পাসওয়ার্ড দিয়ে direct create (admin-only)</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <form className="space-y-3" onSubmit={handleCreatePrivilegedUser}>
                                <div className="space-y-1">
                                  <Label>Name</Label>
                                  <Input
                                    value={createUserForm.name}
                                    onChange={(event) =>
                                      setCreateUserForm((prev) => ({ ...prev, name: event.target.value }))
                                    }
                                    required
                                    disabled={isCreatingUser}
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label>Email</Label>
                                  <Input
                                    type="email"
                                    value={createUserForm.email}
                                    onChange={(event) =>
                                      setCreateUserForm((prev) => ({ ...prev, email: event.target.value }))
                                    }
                                    required
                                    disabled={isCreatingUser}
                                  />
                                </div>

                                <div className="space-y-1">
                                  <Label>Password</Label>
                                  <Input
                                    type="password"
                                    value={createUserForm.password}
                                    onChange={(event) =>
                                      setCreateUserForm((prev) => ({ ...prev, password: event.target.value }))
                                    }
                                    required
                                    disabled={isCreatingUser}
                                  />
                                </div>

                                <Button type="submit" disabled={isCreatingUser}>
                                  {isCreatingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  Create
                                </Button>
                              </form>
                            </CardContent>
                          </Card>
                        ) : null}

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                              <CardTitle>
                                {section.label} ({total})
                              </CardTitle>
                              <CardDescription>All details + CRUD actions</CardDescription>
                            </div>
                            <div className="w-1/3">
                              <Input
                                placeholder="Search by name, email or phone..."
                                value={settingsSearch}
                                onChange={(e) => setSettingsSearch(e.target.value)}
                              />
                            </div>
                          </CardHeader>
                          <CardContent>
                            {isSettingsUsersLoading ? (
                              <div className="flex justify-center py-10">
                                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                              </div>
                            ) : list.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No users found.</p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Avatar</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>{section.role === "teacher" ? "Subscription" : "ExamBatch"}</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Attempts</TableHead>
                                    <TableHead>Accuracy</TableHead>
                                    <TableHead>Last Sign In</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {list.map((item) => {
                                    const stats = attemptMap.get(item.user_id);
                                    return (
                                      <TableRow key={`${section.key}-${item.user_id}`}>
                                        <TableCell>
                                          {item.avatar_url ? (
                                            <img src={item.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                                          ) : (
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">
                                              {item.name?.charAt(0)?.toUpperCase() || "U"}
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell>{item.name || "-"}</TableCell>
                                        <TableCell className="text-sm">{item.email || "-"}</TableCell>
                                        <TableCell className="text-sm">{item.phone || "-"}</TableCell>
                                        <TableCell>
                                          <div className="flex flex-wrap gap-1">
                                            {(item.roles || []).map((role) => (
                                              <Badge
                                                key={`${item.user_id}-${role}`}
                                                variant={role === "admin" ? "destructive" : "secondary"}
                                              >
                                                {role}
                                              </Badge>
                                            ))}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {item.purchased_batches && item.purchased_batches.length > 0 ? (
                                              item.purchased_batches.map((batch) => (
                                                <Badge
                                                  key={`${item.user_id}-batch-${batch.id}`}
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  {batch.title}
                                                </Badge>
                                              ))
                                            ) : (
                                              <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                          {item.created_at ? formatDateTime(item.created_at) : "-"}
                                        </TableCell>
                                        <TableCell>{stats?.attempts ?? 0}</TableCell>
                                        <TableCell>{stats ? `${stats.avg_accuracy}%` : "0%"}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                          {item.last_sign_in ? formatDateTime(item.last_sign_in) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                              <DropdownMenuSeparator />
                                              {section.role === "all" ? (
                                                <>
                                                  {(["admin", "moderator", "teacher"] as const).map((r) => {
                                                    const hasRole = (item.roles || []).includes(r);
                                                    return hasRole ? (
                                                      <DropdownMenuItem
                                                        key={`rm-${r}`}
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleUserRoleRemove(item.user_id, r)}
                                                      >
                                                        Remove {r} Role
                                                      </DropdownMenuItem>
                                                    ) : (
                                                      <DropdownMenuItem
                                                        key={`add-${r}`}
                                                        onClick={() => handleUserPrimaryRole(item.user_id, r)}
                                                      >
                                                        Add {r} Role
                                                      </DropdownMenuItem>
                                                    );
                                                  })}
                                                </>
                                              ) : (
                                                <>
                                                  <DropdownMenuItem onClick={() => handleUserPrimaryRole(item.user_id, section.role)}>
                                                    Add {section.role} Role
                                                  </DropdownMenuItem>
                                                  {section.role !== "user" ? (
                                                    <DropdownMenuItem
                                                      className="text-destructive hover:bg-destructive/10"
                                                      onClick={() => handleUserRoleRemove(item.user_id, section.role)}
                                                    >
                                                      Remove {section.role} Role
                                                    </DropdownMenuItem>
                                                  ) : null}
                                                </>
                                              )}
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem
                                                onClick={() =>
                                                  handleUserRestrictionToggle(item.user_id, !(item.is_restricted ?? false))
                                                }
                                              >
                                                {item.is_restricted ? "Unrestrict Account" : "Restrict Account"}
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() =>
                                                  handleUserSuspensionToggle(item.user_id, !(item.is_suspended ?? false))
                                                }
                                              >
                                                {item.is_suspended ? "Unsuspend Account" : "Suspend Account"}
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()
                }
              </div>
            )}

            <footer className="text-center text-xs text-muted-foreground">
              {activeTab === "questions" && questions.length > 0
                ? `Filtered প্রশ্ন: ${questions.length}`
                : "Use this dashboard carefully. Every CRUD action changes live data."}
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminWorkspace;
