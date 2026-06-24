/**
 * Admin API Client
 * All admin operations go through the /functions/v1/admin edge function.
 */

import {
  supabase,
  SUPABASE_URL as DEFAULT_SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY as DEFAULT_SUPABASE_KEY,
} from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
  };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function adminCall<T = unknown>(
  params?: Record<string, string>,
  options?: { method?: string; body?: unknown }
): Promise<T> {
  const url = new URL(`${SUPABASE_URL}/functions/v1/admin`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    });
  }

  const headers = await getAuthHeaders();
  const res = await fetch(url.toString(), {
    method: options?.method || "GET",
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `API Error: ${res.status}`);
  return json;
}

export interface AdminStats {
  total_questions: number;
  total_attempts: number;
  total_templates: number;
  total_users: number;
  total_live_exams: number;
  avg_accuracy: number;
  recent_attempts: number;
  role_breakdown: Record<string, number>;
  subject_breakdown: Record<string, number>;
}

export interface AdminUser {
  user_id: string;
  roles: string[];
  created_at: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url: string;
  last_sign_in: string | null;
  is_suspended?: boolean;
  is_restricted?: boolean;
  purchased_batches?: { id: string; title: string; price: number }[];
}

export interface AdminCreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: "admin" | "moderator";
}

export interface ExamTemplate {
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
  subjects_breakdown: unknown[];
  topics: Record<string, string[]>;
  features: string[];
  rating: number | null;
  attempts: number;
  created_at: string;
}

export interface LiveExamEvent {
  id: string;
  template_id: string;
  start_time: string;
  status: string;
  participants: number;
  prize: string | null;
  created_at: string;
  exam_templates?: { id: string; title: string; category: string };
}

export interface SubjectInfo {
  name: string;
  topics: string[];
  question_count: number;
}

export const adminApi = {
  stats: () => adminCall<{ data: AdminStats }>({ action: "stats" }),

  // Users
  users: (filters?: { role?: string; search?: string; limit?: number; offset?: number }) =>
    adminCall<{ data: AdminUser[]; total: number }>({
      action: "users",
      role: filters?.role || "all",
      search: filters?.search || "",
      limit: String(filters?.limit || 50),
      offset: String(filters?.offset || 0),
    }),

  updateRole: (userId: string, role: string, remove = false) =>
    adminCall<{ success: boolean }>(
      { action: "role" },
      { method: "PUT", body: { user_id: userId, role, remove } }
    ),

  updateRestriction: (userId: string, restrict: boolean) =>
    adminCall<{ success: boolean }>(
      { action: "restrict" },
      { method: "PUT", body: { user_id: userId, restrict } }
    ),

  updateSuspension: (userId: string, suspend: boolean) =>
    adminCall<{ success: boolean }>(
      { action: "suspend" },
      { method: "PUT", body: { user_id: userId, suspend } }
    ),

  createUser: (payload: AdminCreateUserRequest) =>
    adminCall<{ data: { user_id: string } }>(
      { action: "create-user" },
      { method: "POST", body: payload }
    ),

  // Exam Templates
  templates: () => adminCall<{ data: ExamTemplate[]; total: number }>({ action: "templates" }),

  createTemplate: (data: Partial<ExamTemplate>) =>
    adminCall<{ data: ExamTemplate }>(
      { action: "templates" },
      { method: "POST", body: data }
    ),

  updateTemplate: (id: string, data: Partial<ExamTemplate>) =>
    adminCall<{ data: ExamTemplate }>(
      { action: "templates" },
      { method: "PUT", body: { id, ...data } }
    ),

  deleteTemplate: (id: string) =>
    adminCall<{ success: boolean }>(
      { action: "templates", id },
      { method: "DELETE" }
    ),

  // Live Exams
  liveExams: () => adminCall<{ data: LiveExamEvent[] }>({ action: "live-exams" }),

  createLiveExam: (data: { template_id: string; start_time: string; prize?: string }) =>
    adminCall<{ data: LiveExamEvent }>(
      { action: "live-exams" },
      { method: "POST", body: data }
    ),

  updateLiveExam: (id: string, data: Partial<LiveExamEvent>) =>
    adminCall<{ data: LiveExamEvent }>(
      { action: "live-exams" },
      { method: "PUT", body: { id, ...data } }
    ),

  deleteLiveExam: (id: string) =>
    adminCall<{ success: boolean }>(
      { action: "live-exams", id },
      { method: "DELETE" }
    ),

  // Subjects
  subjects: () => adminCall<{ data: SubjectInfo[] }>({ action: "subjects" }),
};
