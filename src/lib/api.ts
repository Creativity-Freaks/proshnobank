/**
 * ProshnoBank API Client
 * 
 * All API calls go through Supabase Edge Functions.
 * Frontend uses these functions instead of direct Supabase client calls.
 * 
 * ## API Endpoints
 * 
 * ### Questions API (`/functions/v1/questions`)
 * - `GET ?subject=X&topic=X&difficulty=X&search=X&limit=50&offset=0` - List questions
 * - `GET ?id=X` - Get single question
 * - `POST` - Create question (admin only, requires auth)
 * - `PUT` - Update question (admin only, requires auth)
 * - `DELETE ?id=X` - Delete question (admin only, requires auth)
 * 
 * ### Exams API (`/functions/v1/exams`)
 * - `GET ?action=generate&subjects=X,Y&topics=A,B&difficulty=X&count=10` - Generate random exam questions
 * - `GET ?action=attempts&limit=20&offset=0` - Get user's exam history (auth required)
 * - `GET ?action=attempt&id=X` - Get single attempt (auth required)
 * - `GET ?action=stats` - Get user's statistics (auth required)
 * - `POST` - Submit exam attempt (auth required)
 * 
 * ### Leaderboard API (`/functions/v1/leaderboard`)
 * - `GET ?action=rankings&period=weekly&subject=all&limit=20` - Get leaderboard
 * - `GET ?action=stats` - Get global stats
 */

import { supabase } from "@/integrations/supabase/client";
import { examCatalog } from "./exam-catalog";

// Use the same values as the generated supabase client to avoid undefined env vars
const SUPABASE_URL = "https://urtptlxotyyjfqynpbwx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydHB0bHhvdHl5amZxeW5wYnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTA2NzQsImV4cCI6MjA4NDE2NjY3NH0.w-0GuzuZ3DU0BACTHoCXBPj6qBRxsA3JirwcVflR9BE";

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

async function apiCall<T = unknown>(
  functionName: string,
  params?: Record<string, string>,
  options?: { method?: string; body?: unknown }
): Promise<T> {
  const url = new URL(`${SUPABASE_URL}/functions/v1/${functionName}`);
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

// ==================== Questions API ====================

export const questionsApi = {
  list: (filters?: {
    subject?: string;
    topic?: string;
    difficulty?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) =>
    apiCall<{ data: unknown[]; total: number; limit: number; offset: number }>(
      "questions",
      {
        subject: filters?.subject,
        topic: filters?.topic,
        difficulty: filters?.difficulty,
        search: filters?.search,
        limit: String(filters?.limit || 50),
        offset: String(filters?.offset || 0),
      } as Record<string, string>
    ),

  get: (id: string) => apiCall<{ data: unknown }>("questions", { id }),

  groups: (filters?: {
    subject?: string;
    subject_id?: string;
    category_id?: string;
    difficulty?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) =>
    apiCall<{
      data: { subject: string; topic: string; difficulty: string; count: number }[];
      total_questions: number;
      total_groups: number;
      limit: number;
      offset: number;
    }>("questions", {
      action: "groups",
      ...(filters?.subject_id  ? { subject_id:  filters.subject_id  } : {}),
      ...(filters?.category_id ? { category_id: filters.category_id } : {}),
      ...(filters?.subject && !filters.subject_id ? { subject: filters.subject } : {}),
      difficulty: filters?.difficulty,
      search: filters?.search,
      limit: String(filters?.limit || 120),
      offset: String(filters?.offset || 0),
    } as Record<string, string>),

  /** Teacher/admin: list only my created questions (includes correct answers) */
  mine: (filters?: {
    subject?: string;
    topic?: string;
    difficulty?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) =>
    apiCall<{ data: unknown[]; total: number; limit: number; offset: number }>(
      "questions",
      {
        action: "mine",
        subject: filters?.subject,
        topic: filters?.topic,
        difficulty: filters?.difficulty,
        search: filters?.search,
        limit: String(filters?.limit || 50),
        offset: String(filters?.offset || 0),
      } as Record<string, string>,
    ),

  create: (question: {
    subject: string;
    topic: string;
    difficulty: string;
    question_text: string;
    options: string[];
    correct_answer: number;
    explanation?: string;
  }) => apiCall<{ data: unknown }>("questions", undefined, { method: "POST", body: question }),

  update: (id: string, data: Record<string, unknown>) =>
    apiCall<{ data: unknown }>("questions", undefined, { method: "PUT", body: { id, ...data } }),

  delete: (id: string) =>
    apiCall<{ success: boolean }>("questions", { id }, { method: "DELETE" }),
};

// ==================== Exams API ====================

export const examsApi = {
  generate: (config: {
    subjects?: string;
    subject?: string;
    topic?: string;
    topics?: string;
    difficulty?: string;
    count?: number;
  }) =>
    apiCall<{ data: unknown[]; total_available: number; selected_count: number }>(
      "exams",
      {
        action: "generate",
        subjects: config.subjects,
        subject: config.subject,
        topic: config.topic,
        topics: config.topics,
        difficulty: config.difficulty,
        count: String(config.count || 10),
      } as Record<string, string>
    ),

  /** Generate exam questions from a template (uses template.question_ids when present). */
  generateTemplate: (id: string) =>
    apiCall<{ data: unknown[]; total_available: number; selected_count: number }>("exams", {
      action: "generate_template",
      id,
    }),

  attempts: (filters?: { limit?: number; offset?: number }) =>
    apiCall<{ data: unknown[]; total: number }>("exams", {
      action: "attempts",
      limit: String(filters?.limit || 20),
      offset: String(filters?.offset || 0),
    }),

  getAttempt: (id: string) =>
    apiCall<{ data: unknown }>("exams", { action: "attempt", id }),

  stats: () =>
    apiCall<{
      data: {
        total_exams: number;
        avg_score: number;
        accuracy: number;
        total_study_time_hours: number;
        subject_stats: { subject: string; exams: number; accuracy: number }[];
      };
    }>("exams", { action: "stats" }),

  /** List live exam events (public) */
  live: () => apiCall<{ data: unknown[] }>("exams", { action: "live" }),

  /** Get exam template details (public) */
  details: (id: string) => apiCall<{ data: unknown }>("exams", { action: "details", id }),

  /** Get category/subject/topic catalog for exam setup */
  catalog: () =>
    Promise.resolve({
      data: {
        categories: examCatalog,
      },
    }),

  /** Submit an exam attempt */
  submit: (attempt: {
    subject: string;
    difficulty?: string;
    duration_minutes: number;
    marks_per_question?: number;
    negative_marks?: number;
    time_taken_seconds?: number;
    answers: { question_id: string; selected: number }[];
  }) => apiCall<{ data: unknown }>("exams", undefined, { method: "POST", body: attempt }),
};

// ==================== Leaderboard API ====================

export const leaderboardApi = {
  rankings: (filters?: {
    period?: string;
    subject?: string;
    limit?: number;
  }) =>
    apiCall<{
      data: {
        rank: number;
        user_id: string;
        name: string;
        score: number;
        exams: number;
        accuracy: number;
      }[];
    }>("leaderboard", {
      action: "rankings",
      period: filters?.period || "all",
      subject: filters?.subject || "all",
      limit: String(filters?.limit || 20),
    }),

  stats: () =>
    apiCall<{
      data: {
        total_participants: number;
        total_exams: number;
        avg_accuracy: number;
      };
    }>("leaderboard", { action: "stats" }),
};
