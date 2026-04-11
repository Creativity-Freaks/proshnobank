import { questionsApi } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import type { Enums, Json, Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Question = Tables<"question_bank">;

export type ExamTemplate = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  question_count: number;
  duration_minutes: number;
  marks_per_question: number;
  negative_marks: number;
  difficulty: string | null;
  subjects: string[];
  subjects_breakdown: Json[];
  topics: Record<string, string[]>;
  features: string[];
  rating: number | null;
  attempts: number;
  created_at: string;
};

export type LiveExamStatus = "upcoming" | "starting-soon" | "live";

export type LiveExamEvent = {
  id: string;
  template_id: string;
  start_time: string;
  status: LiveExamStatus;
  participants: number;
  prize: string | null;
  created_at: string;
  template: Pick<
    ExamTemplate,
    "id" | "title" | "category" | "difficulty" | "question_count" | "duration_minutes"
  > | null;
};

export type UserRole = {
  id: string;
  user_id: string;
  role: Enums<"app_role">;
  created_at: string;
};

export type ExamCategory = Tables<"exam_categories">;

export type SubjectRecord = Tables<"subjects"> & {
  category_name: string | null;
};

export type BatchStatus = "draft" | "published" | "archived";

export type AdminAccessRole = Enums<"app_role">;

export type ExamBatch = Tables<"exam_batches"> & {
  category_name: string | null;
  subcategory_name: string | null;
  template_title: string | null;
};

export type UserDirectoryItem = {
  user_id: string;
  roles: Enums<"app_role">[];
  primary_role: Enums<"app_role">;
  attempts: number;
  avg_accuracy: number;
  last_attempt_at: string | null;
};

export type AnalyticsSubjectStat = {
  subject: string;
  attempts: number;
  avg_accuracy: number;
};

export type AnalyticsRoleDistribution = {
  role: Enums<"app_role">;
  count: number;
};

export type AdminAnalytics = {
  total_users: number;
  total_attempts: number;
  avg_accuracy: number;
  attempts_last_30_days: number;
  top_subjects: AnalyticsSubjectStat[];
  role_distribution: AnalyticsRoleDistribution[];
};

export type AdminOverviewStats = {
  totalQuestions: number;
  totalTemplates: number;
  totalLiveEvents: number;
  activeLiveEvents: number;
  totalCategories: number;
  totalSubjects: number;
  totalBatches: number;
  totalUsers: number;
  totalRoleAssignments: number;
  totalAdmins: number;
  totalModerators: number;
  totalTeachers: number;
};

export type QuestionFilters = {
  subject?: string;
  topic?: string;
  difficulty?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export type QuestionInput = {
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
};

export type ExamTemplateInput = {
  title: string;
  category: string;
  description?: string;
  question_count: number;
  duration_minutes: number;
  marks_per_question: number;
  negative_marks: number;
  difficulty?: string;
  subjects: string[];
  subjects_breakdown?: Json[];
  topics?: Record<string, string[]>;
  features?: string[];
  rating?: number;
  attempts?: number;
};

export type LiveEventInput = {
  template_id: string;
  start_time: string;
  status: LiveExamStatus;
  participants?: number;
  prize?: string;
};

export type RoleInput = {
  user_id: string;
  role: Enums<"app_role">;
};

export type ExamCategoryInput = {
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type SubjectInput = {
  name: string;
  key: string;
  category_id?: string | null;
  description?: string;
  is_active?: boolean;
};

export type ExamBatchInput = {
  title: string;
  category_id?: string | null;
  template_id?: string | null;
  description?: string;
  price: number;
  duration_days: number;
  seats: number;
  status: BatchStatus;
  start_date?: string | null;
};

type CountableTable =
  | "question_bank"
  | "exam_templates"
  | "live_exam_events"
  | "exam_categories"
  | "subjects"
  | "exam_batches";

type AttemptLite = {
  user_id: string;
  score: number;
  max_score: number;
  created_at: string;
  subject: string;
};

const roleOrder: Enums<"app_role">[] = ["admin", "moderator", "teacher", "user"];

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function ensureJsonArray(value: unknown): Json[] {
  if (!Array.isArray(value)) return [];
  return value as Json[];
}

function ensureTopics(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const output: Record<string, string[]> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, nested]) => {
    output[key] = ensureStringArray(nested);
  });

  return output;
}

function parseNumeric(value: unknown, fallback = 0): number {
  const normalized = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(normalized) ? normalized : fallback;
}

function parseTemplate(row: unknown): ExamTemplate | null {
  if (!row || typeof row !== "object") return null;

  const value = row as Record<string, unknown>;
  if (typeof value.id !== "string") return null;
  if (typeof value.title !== "string") return null;
  if (typeof value.category !== "string") return null;
  if (typeof value.created_at !== "string") return null;

  const parsedRating = parseNumeric(value.rating, Number.NaN);

  return {
    id: value.id,
    title: value.title,
    category: value.category,
    description: typeof value.description === "string" ? value.description : null,
    question_count: parseNumeric(value.question_count, 0),
    duration_minutes: parseNumeric(value.duration_minutes, 30),
    marks_per_question: parseNumeric(value.marks_per_question, 1),
    negative_marks: parseNumeric(value.negative_marks, 0),
    difficulty: typeof value.difficulty === "string" ? value.difficulty : null,
    subjects: ensureStringArray(value.subjects),
    subjects_breakdown: ensureJsonArray(value.subjects_breakdown),
    topics: ensureTopics(value.topics),
    features: ensureStringArray(value.features),
    rating: Number.isFinite(parsedRating) ? parsedRating : null,
    attempts: parseNumeric(value.attempts, 0),
    created_at: value.created_at,
  };
}

function parseLiveEvent(row: unknown): LiveExamEvent | null {
  if (!row || typeof row !== "object") return null;

  const value = row as Record<string, unknown>;
  if (typeof value.id !== "string") return null;
  if (typeof value.template_id !== "string") return null;
  if (typeof value.start_time !== "string") return null;
  if (typeof value.created_at !== "string") return null;

  const status = value.status;
  const normalizedStatus: LiveExamStatus =
    status === "live" || status === "starting-soon" || status === "upcoming" ? status : "upcoming";

  const nested = value.exam_templates;
  let template: LiveExamEvent["template"] = null;

  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const t = nested as Record<string, unknown>;
    if (typeof t.id === "string" && typeof t.title === "string" && typeof t.category === "string") {
      template = {
        id: t.id,
        title: t.title,
        category: t.category,
        difficulty: typeof t.difficulty === "string" ? t.difficulty : null,
        question_count: parseNumeric(t.question_count, 0),
        duration_minutes: parseNumeric(t.duration_minutes, 30),
      };
    }
  }

  return {
    id: value.id,
    template_id: value.template_id,
    start_time: value.start_time,
    status: normalizedStatus,
    participants: parseNumeric(value.participants, 0),
    prize: typeof value.prize === "string" ? value.prize : null,
    created_at: value.created_at,
    template,
  };
}

function parseRole(row: unknown): UserRole | null {
  if (!row || typeof row !== "object") return null;

  const value = row as Record<string, unknown>;
  const role = value.role;
  if (typeof value.id !== "string") return null;
  if (typeof value.user_id !== "string") return null;
  if (typeof value.created_at !== "string") return null;
  if (role !== "admin" && role !== "moderator" && role !== "teacher" && role !== "user") return null;

  return {
    id: value.id,
    user_id: value.user_id,
    role,
    created_at: value.created_at,
  };
}

async function getTableCount(tableName: CountableTable) {
  const { count, error } = await supabase.from(tableName).select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

async function getTableCountSafe(tableName: CountableTable) {
  try {
    return await getTableCount(tableName);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    // If a migration hasn't been applied yet, PostgREST often reports missing relations.
    if (message.toLowerCase().includes("relation") || message.toLowerCase().includes("does not exist")) {
      return 0;
    }
    return 0;
  }
}

async function getAttemptLites() {
  const { data, error } = await supabase.from("exam_attempts").select("user_id, score, max_score, created_at, subject");
  if (error) throw new Error(error.message);

  return (Array.isArray(data) ? data : []).filter(
    (row): row is AttemptLite =>
      Boolean(row) &&
      typeof row.user_id === "string" &&
      typeof row.score === "number" &&
      typeof row.max_score === "number" &&
      typeof row.created_at === "string" &&
      typeof row.subject === "string",
  );
}

function getPrimaryRole(roles: Enums<"app_role">[]): Enums<"app_role"> {
  for (const role of roleOrder) {
    if (roles.includes(role)) return role;
  }
  return "user";
}

export const adminDashboardApi = {
  settings: {
    async getAdminAccessRole(): Promise<AdminAccessRole> {
      const { data, error } = await supabase
        .from("app_settings")
        .select("key, value")
        .eq("key", "admin_access_role")
        .maybeSingle();

      if (error) throw new Error(error.message);
      const value = (data?.value || {}) as Record<string, unknown>;
      const role = value.role;
      if (role === "admin" || role === "moderator" || role === "teacher" || role === "user") return role;
      return "admin";
    },
    async setAdminAccessRole(role: AdminAccessRole) {
      const payload: TablesInsert<"app_settings"> = {
        key: "admin_access_role",
        value: { role } as unknown as Json,
      };

      const { error } = await supabase.from("app_settings").upsert(payload, { onConflict: "key" });
      if (error) throw new Error(error.message);
    },
  },
  questions: {
    async list(filters?: QuestionFilters) {
      const response = await questionsApi.list(filters);
      const rows = Array.isArray(response.data) ? response.data : [];
      const data = rows
        .map((row) => row as Question)
        .filter((question) => typeof question?.id === "string" && Array.isArray(question?.options));

      return {
        data,
        total: response.total || data.length,
      };
    },
    create(input: QuestionInput) {
      return questionsApi.create(input);
    },
    update(id: string, input: Partial<QuestionInput>) {
      return questionsApi.update(id, input as Record<string, unknown>);
    },
    delete(id: string) {
      return questionsApi.delete(id);
    },
  },

  templates: {
    async list() {
      const { data, error } = await supabase.from("exam_templates").select("*").order("created_at", { ascending: false });
      if (error) throw new Error(error.message);

      return (Array.isArray(data) ? data : []).map(parseTemplate).filter((item): item is ExamTemplate => Boolean(item));
    },
    async create(input: ExamTemplateInput) {
      const payload = {
        ...input,
        description: input.description || null,
        subjects: input.subjects,
        subjects_breakdown: input.subjects_breakdown || [],
        topics: input.topics || {},
        features: input.features || [],
        rating: Number.isFinite(input.rating) ? input.rating : null,
        attempts: Number.isFinite(input.attempts) ? input.attempts : 0,
      };

      const { data, error } = await supabase.from("exam_templates").insert(payload).select("*").single();
      if (error) throw new Error(error.message);

      const parsed = parseTemplate(data);
      if (!parsed) throw new Error("Template তৈরি করা যায়নি");
      return parsed;
    },
    async update(id: string, input: Partial<ExamTemplateInput>) {
      const payload = {
        ...input,
        description: input.description === undefined ? undefined : input.description || null,
        subjects: input.subjects,
        subjects_breakdown: input.subjects_breakdown,
        topics: input.topics,
        features: input.features,
        rating: input.rating === undefined ? undefined : Number.isFinite(input.rating) ? input.rating : null,
        attempts: input.attempts,
      };

      const { data, error } = await supabase.from("exam_templates").update(payload).eq("id", id).select("*").single();
      if (error) throw new Error(error.message);

      const parsed = parseTemplate(data);
      if (!parsed) throw new Error("Template আপডেট করা যায়নি");
      return parsed;
    },
    async delete(id: string) {
      const { error } = await supabase.from("exam_templates").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
  },

  liveEvents: {
    async list() {
      const { data, error } = await supabase
        .from("live_exam_events")
        .select(
          "id, template_id, start_time, status, participants, prize, created_at, exam_templates(id, title, category, difficulty, question_count, duration_minutes)",
        )
        .order("start_time", { ascending: true });

      if (error) throw new Error(error.message);

      return (Array.isArray(data) ? data : []).map(parseLiveEvent).filter((item): item is LiveExamEvent => Boolean(item));
    },
    async create(input: LiveEventInput) {
      const payload = {
        ...input,
        participants: Number.isFinite(input.participants) ? input.participants : 0,
        prize: input.prize || null,
      };

      const { data, error } = await supabase.from("live_exam_events").insert(payload).select("*").single();
      if (error) throw new Error(error.message);

      const parsed = parseLiveEvent(data);
      if (!parsed) throw new Error("Live event তৈরি করা যায়নি");
      return parsed;
    },
    async update(id: string, input: Partial<LiveEventInput>) {
      const payload = {
        ...input,
        participants: input.participants,
        prize: input.prize === undefined ? undefined : input.prize || null,
      };

      const { data, error } = await supabase.from("live_exam_events").update(payload).eq("id", id).select("*").single();
      if (error) throw new Error(error.message);

      const parsed = parseLiveEvent(data);
      if (!parsed) throw new Error("Live event আপডেট করা যায়নি");
      return parsed;
    },
    async delete(id: string) {
      const { error } = await supabase.from("live_exam_events").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
  },

  roles: {
    async list() {
      const { data, error } = await supabase.from("user_roles").select("id, user_id, role, created_at").order("created_at", {
        ascending: false,
      });
      if (error) throw new Error(error.message);

      return (Array.isArray(data) ? data : []).map(parseRole).filter((item): item is UserRole => Boolean(item));
    },
    async create(input: RoleInput) {
      const { data, error } = await supabase.from("user_roles").insert(input).select("id, user_id, role, created_at").single();
      if (error) throw new Error(error.message);

      const parsed = parseRole(data);
      if (!parsed) throw new Error("Role তৈরি করা যায়নি");
      return parsed;
    },
    async update(id: string, input: Partial<RoleInput>) {
      const { data, error } = await supabase
        .from("user_roles")
        .update(input)
        .eq("id", id)
        .select("id, user_id, role, created_at")
        .single();
      if (error) throw new Error(error.message);

      const parsed = parseRole(data);
      if (!parsed) throw new Error("Role আপডেট করা যায়নি");
      return parsed;
    },
    async delete(id: string) {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
  },

  categories: {
    async list() {
      const { data, error } = await supabase
        .from("exam_categories")
        .select("id, name, slug, description, is_active, sort_order, created_at")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw new Error(error.message);
      return (Array.isArray(data) ? data : []) as ExamCategory[];
    },
    async create(input: ExamCategoryInput) {
      const payload: TablesInsert<"exam_categories"> = {
        name: input.name.trim(),
        slug: input.slug.trim().toLowerCase(),
        description: input.description?.trim() || null,
        sort_order: Number.isFinite(input.sort_order) ? Math.trunc(input.sort_order as number) : 0,
        is_active: input.is_active ?? true,
      };

      const { data, error } = await supabase.from("exam_categories").insert(payload).select("*").single();
      if (error) throw new Error(error.message);
      return data as ExamCategory;
    },
    async update(id: string, input: Partial<ExamCategoryInput>) {
      const payload: TablesUpdate<"exam_categories"> = {
        name: input.name?.trim(),
        slug: input.slug?.trim().toLowerCase(),
        description: input.description === undefined ? undefined : input.description?.trim() || null,
        sort_order: Number.isFinite(input.sort_order) ? Math.trunc(input.sort_order as number) : undefined,
        is_active: input.is_active,
      };

      const { data, error } = await supabase.from("exam_categories").update(payload).eq("id", id).select("*").single();
      if (error) throw new Error(error.message);
      return data as ExamCategory;
    },
    async delete(id: string) {
      const { error } = await supabase.from("exam_categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
  },

  subjects: {
    async list() {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, key, category_id, description, is_active, created_at, exam_categories(name)")
        .order("name", { ascending: true });
      if (error) throw new Error(error.message);

      const rows = Array.isArray(data) ? data : [];
      return rows.map((row) => {
        const record = row as Record<string, unknown>;
        const category = record.exam_categories as Record<string, unknown> | null;
        return {
          ...(row as Tables<"subjects">),
          category_name: category && typeof category.name === "string" ? category.name : null,
        } as SubjectRecord;
      });
    },
    async create(input: SubjectInput) {
      const payload: TablesInsert<"subjects"> = {
        name: input.name.trim(),
        key: input.key.trim().toLowerCase(),
        category_id: input.category_id || null,
        description: input.description?.trim() || null,
        is_active: input.is_active ?? true,
      };
      const { data, error } = await supabase.from("subjects").insert(payload).select("*").single();
      if (error) throw new Error(error.message);
      return data as Tables<"subjects">;
    },
    async update(id: string, input: Partial<SubjectInput>) {
      const payload: TablesUpdate<"subjects"> = {
        name: input.name?.trim(),
        key: input.key?.trim().toLowerCase(),
        category_id: input.category_id === undefined ? undefined : input.category_id || null,
        description: input.description === undefined ? undefined : input.description?.trim() || null,
        is_active: input.is_active,
      };
      const { data, error } = await supabase.from("subjects").update(payload).eq("id", id).select("*").single();
      if (error) throw new Error(error.message);
      return data as Tables<"subjects">;
    },
    async delete(id: string) {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
  },

  batches: {
    async list() {
      const { data, error } = await supabase
        .from("exam_batches")
        .select(
          "id, title, category_id, subcategory_id, template_id, description, price, duration_days, seats, status, start_date, created_at, category:exam_categories!exam_batches_category_id_fkey(name), subcategory:exam_categories!exam_batches_subcategory_id_fkey(name), exam_templates(title)",
        )
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);

      const rows = Array.isArray(data) ? data : [];
      return rows.map((row) => {
        const record = row as Record<string, unknown>;
        const category = record.category as Record<string, unknown> | null;
        const subcategory = record.subcategory as Record<string, unknown> | null;
        const template = record.exam_templates as Record<string, unknown> | null;
        return {
          ...(row as Tables<"exam_batches">),
          category_name: category && typeof category.name === "string" ? category.name : null,
          subcategory_name: subcategory && typeof subcategory.name === "string" ? subcategory.name : null,
          template_title: template && typeof template.title === "string" ? template.title : null,
        } as ExamBatch;
      });
    },
    async create(input: ExamBatchInput) {
      const payload: TablesInsert<"exam_batches"> = {
        title: input.title.trim(),
        category_id: input.category_id || null,
        template_id: input.template_id || null,
        description: input.description?.trim() || null,
        price: Number(input.price) || 0,
        duration_days: Math.max(1, Math.trunc(Number(input.duration_days) || 30)),
        seats: Math.max(0, Math.trunc(Number(input.seats) || 0)),
        status: input.status,
        start_date: input.start_date || null,
      };

      const { data, error } = await supabase.from("exam_batches").insert(payload).select("*").single();
      if (error) throw new Error(error.message);
      return data as Tables<"exam_batches">;
    },
    async update(id: string, input: Partial<ExamBatchInput>) {
      const payload: TablesUpdate<"exam_batches"> = {
        title: input.title?.trim(),
        category_id: input.category_id === undefined ? undefined : input.category_id || null,
        template_id: input.template_id === undefined ? undefined : input.template_id || null,
        description: input.description === undefined ? undefined : input.description?.trim() || null,
        price: input.price === undefined ? undefined : Number(input.price) || 0,
        duration_days:
          input.duration_days === undefined ? undefined : Math.max(1, Math.trunc(Number(input.duration_days) || 30)),
        seats: input.seats === undefined ? undefined : Math.max(0, Math.trunc(Number(input.seats) || 0)),
        status: input.status,
        start_date: input.start_date === undefined ? undefined : input.start_date || null,
      };
      const { data, error } = await supabase.from("exam_batches").update(payload).eq("id", id).select("*").single();
      if (error) throw new Error(error.message);
      return data as Tables<"exam_batches">;
    },
    async delete(id: string) {
      const { error } = await supabase.from("exam_batches").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
  },

  users: {
    async list() {
      const [roles, attempts] = await Promise.all([adminDashboardApi.roles.list(), getAttemptLites()]);

      const roleMap = new Map<string, Enums<"app_role">[]>();
      roles.forEach((role) => {
        const existing = roleMap.get(role.user_id) || [];
        if (!existing.includes(role.role)) existing.push(role.role);
        roleMap.set(role.user_id, existing);
      });

      const attemptMap = new Map<string, { attempts: number; score: number; max: number; lastAt: string | null }>();
      attempts.forEach((attempt) => {
        const previous = attemptMap.get(attempt.user_id) || { attempts: 0, score: 0, max: 0, lastAt: null };
        const lastAt = !previous.lastAt || new Date(attempt.created_at) > new Date(previous.lastAt)
          ? attempt.created_at
          : previous.lastAt;

        attemptMap.set(attempt.user_id, {
          attempts: previous.attempts + 1,
          score: previous.score + attempt.score,
          max: previous.max + attempt.max_score,
          lastAt,
        });
      });

      const allUserIds = Array.from(new Set([...roleMap.keys(), ...attemptMap.keys()]));
      const users = allUserIds.map((userId) => {
        const userRoles = roleMap.get(userId) || ["user"];
        const attemptInfo = attemptMap.get(userId) || { attempts: 0, score: 0, max: 0, lastAt: null };
        const avgAccuracy = attemptInfo.max > 0 ? Number(((attemptInfo.score / attemptInfo.max) * 100).toFixed(2)) : 0;
        return {
          user_id: userId,
          roles: userRoles,
          primary_role: getPrimaryRole(userRoles),
          attempts: attemptInfo.attempts,
          avg_accuracy: avgAccuracy,
          last_attempt_at: attemptInfo.lastAt,
        } as UserDirectoryItem;
      });

      return users.sort((a, b) => b.attempts - a.attempts || a.user_id.localeCompare(b.user_id));
    },
    async assignRole(userId: string, role: Enums<"app_role">) {
      const existing = await adminDashboardApi.roles.list();
      const already = existing.some((item) => item.user_id === userId && item.role === role);
      if (already) return;
      await adminDashboardApi.roles.create({ user_id: userId, role });
    },
    async removeRole(userId: string, role: Enums<"app_role">) {
      const existing = await adminDashboardApi.roles.list();
      const target = existing.find((item) => item.user_id === userId && item.role === role);
      if (!target) return;
      await adminDashboardApi.roles.delete(target.id);
    },
  },

  analytics: {
    async getDashboard(): Promise<AdminAnalytics> {
      const [users, attempts] = await Promise.all([adminDashboardApi.users.list(), getAttemptLites()]);
      const totalAttempts = attempts.length;

      const totalScore = attempts.reduce((acc, item) => acc + item.score, 0);
      const totalMaxScore = attempts.reduce((acc, item) => acc + item.max_score, 0);
      const avgAccuracy = totalMaxScore > 0 ? Number(((totalScore / totalMaxScore) * 100).toFixed(2)) : 0;

      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const attemptsLast30Days = attempts.filter((item) => new Date(item.created_at).getTime() >= thirtyDaysAgo).length;

      const subjectMap = new Map<string, { attempts: number; score: number; max: number }>();
      attempts.forEach((item) => {
        const previous = subjectMap.get(item.subject) || { attempts: 0, score: 0, max: 0 };
        subjectMap.set(item.subject, {
          attempts: previous.attempts + 1,
          score: previous.score + item.score,
          max: previous.max + item.max_score,
        });
      });

      const topSubjects = Array.from(subjectMap.entries())
        .map(([subject, stat]) => ({
          subject,
          attempts: stat.attempts,
          avg_accuracy: stat.max > 0 ? Number(((stat.score / stat.max) * 100).toFixed(2)) : 0,
        }))
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 8);

      const roleDistributionMap = new Map<Enums<"app_role">, number>([
        ["admin", 0],
        ["moderator", 0],
        ["teacher", 0],
        ["user", 0],
      ]);

      users.forEach((user) => {
        roleDistributionMap.set(user.primary_role, (roleDistributionMap.get(user.primary_role) || 0) + 1);
      });

      const roleDistribution = Array.from(roleDistributionMap.entries()).map(([role, count]) => ({ role, count }));

      return {
        total_users: users.length,
        total_attempts: totalAttempts,
        avg_accuracy: avgAccuracy,
        attempts_last_30_days: attemptsLast30Days,
        top_subjects: topSubjects,
        role_distribution: roleDistribution,
      };
    },
  },

  async getOverviewStats(): Promise<AdminOverviewStats> {
    const [
      totalQuestions,
      totalTemplates,
      totalLiveEvents,
      totalCategories,
      totalSubjects,
      totalBatches,
      roles,
      users,
    ] = await Promise.all([
      getTableCount("question_bank"),
      getTableCount("exam_templates"),
      getTableCount("live_exam_events"),
      getTableCountSafe("exam_categories"),
      getTableCountSafe("subjects"),
      getTableCountSafe("exam_batches"),
      this.roles.list(),
      this.users.list(),
    ]);

    const activeLive = await this.liveEvents.list();

    return {
      totalQuestions,
      totalTemplates,
      totalLiveEvents,
      activeLiveEvents: activeLive.filter((event) => event.status === "live" || event.status === "starting-soon").length,
      totalCategories,
      totalSubjects,
      totalBatches,
      totalUsers: users.length,
      totalRoleAssignments: roles.length,
      totalAdmins: roles.filter((role) => role.role === "admin").length,
      totalModerators: roles.filter((role) => role.role === "moderator").length,
      totalTeachers: roles.filter((role) => role.role === "teacher").length,
    };
  },
};
