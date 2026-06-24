import { supabase } from "@/integrations/supabase/client";

export type ExamTemplateSummary = {
  id: string;
  title: string;
  category: string;
  description: string;
  question_count: number;
  duration_minutes: number;
  difficulty: string;
  rating: number | null;
  attempts: number;
  subjects: string[];
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function mapRow(row: Record<string, unknown>): ExamTemplateSummary {
  return {
    id: String(row.id),
    title: typeof row.title === "string" ? row.title : "",
    category: typeof row.category === "string" ? row.category : "",
    description: typeof row.description === "string" ? row.description : "",
    question_count: typeof row.question_count === "number" ? row.question_count : 0,
    duration_minutes: typeof row.duration_minutes === "number" ? row.duration_minutes : 0,
    difficulty: typeof row.difficulty === "string" ? row.difficulty : "medium",
    rating:
      typeof row.rating === "number" || typeof row.rating === "string"
        ? Number(row.rating)
        : null,
    attempts: typeof row.attempts === "number" ? row.attempts : 0,
    subjects: toStringArray(row.subjects),
  };
}

/**
 * List published exam templates, optionally filtered by category slug
 * (e.g. "ssc", "hsc", "medical", "engineering", "university", "job").
 * Public read — uses the anon Supabase client.
 */
export async function listExamTemplates(category?: string): Promise<ExamTemplateSummary[]> {
  let query = supabase
    .from("exam_templates")
    .select("id, title, category, description, question_count, duration_minutes, difficulty, rating, attempts, subjects")
    .order("attempts", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[v0] listExamTemplates error:", error.message);
    return [];
  }
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}
