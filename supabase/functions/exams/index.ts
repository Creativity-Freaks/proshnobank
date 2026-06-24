import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS_ENV = (Deno.env.get("ALLOWED_ORIGINS") || "").trim();
const allowWildcard = ALLOWED_ORIGINS_ENV === "*";
const allowedOrigins = allowWildcard
  ? []
  : ALLOWED_ORIGINS_ENV
    ? ALLOWED_ORIGINS_ENV.split(",").map((o: string) => o.trim()).filter(Boolean)
    : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080"];

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

const subjectLabelMap: Record<string, string> = {
  bangla: "বাংলা",
  english: "ইংরেজি",
  math: "গণিত",
  physics: "পদার্থবিজ্ঞান",
  chemistry: "রসায়ন",
  biology: "জীববিজ্ঞান",
  gk: "সাধারণ জ্ঞান",
  ict: "ICT",
  science: "বিজ্ঞান",
  computer: "কম্পিউটার",
  iq: "বুদ্ধিমত্তা",
};

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = allowWildcard ? "*" : (allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "*");

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    Vary: "Origin",
  };
}

function jsonResponse(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function errorResponse(req: Request, message: string, status = 400) {
  return jsonResponse(req, { error: message }, status);
}

function toFiniteNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function parseCsv(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
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

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function topicIdFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff\s-]/g, "")
    .replace(/\s+/g, "-");
}

function getClientKey(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  return realIp || "anonymous";
}

function applyRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const record = rateBuckets.get(key);

  if (!record || now >= record.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) return false;

  record.count += 1;
  rateBuckets.set(key, record);
  return true;
}

async function getUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const anonClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await anonClient.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

async function fetchQuestionCount(
  supabase: unknown,
  subjects: string[],
  topics: string[],
  difficulty: string | null,
) {
  type CountQuery = {
    in: (column: string, values: string[]) => CountQuery;
    eq: (column: string, value: string) => CountQuery;
    then: Promise<{ count: number | null }>["then"];
  };

  const client = supabase as {
    from: (table: string) => {
      select: (columns: string, options: { count: "exact"; head: true }) => CountQuery;
    };
  };

  let query = client.from("question_bank").select("id", { count: "exact", head: true });

  if (subjects.length > 0) query = query.in("subject", subjects);
  if (topics.length > 0) query = query.in("topic", topics);
  if (difficulty && difficulty !== "all") query = query.eq("difficulty", difficulty);

  const { count } = await query;
  return count || 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req) });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const requester = getClientKey(req);

  const isHeavyAction = action === "generate" || req.method === "POST";
  const rateAllowed = applyRateLimit(
    `${requester}:exams:${action || req.method.toLowerCase()}`,
    isHeavyAction ? 25 : 120,
    60_000,
  );

  if (!rateAllowed) {
    return errorResponse(req, "Too many requests, please try again later", 429);
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    if (req.method === "GET" && action === "live") {
      const { data, error } = await supabase
        .from("live_exam_events")
        .select(
          "id, start_time, status, participants, prize, exam_templates ( id, title, category, description, question_count, duration_minutes, marks_per_question, negative_marks, difficulty, subjects, subjects_breakdown, topics, features, rating, attempts )",
        )
        .order("start_time", { ascending: true });

      if (error) return errorResponse(req, error.message, 500);

      const mapped = (data || []).map((row: unknown) => {
        const e = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        const t = e.exam_templates && typeof e.exam_templates === "object"
          ? (e.exam_templates as Record<string, unknown>)
          : null;

        return {
          event_id: typeof e.id === "string" ? e.id : null,
          id: t && typeof t.id === "string" ? t.id : null,
          title: t && typeof t.title === "string" ? t.title : null,
          category: t && typeof t.category === "string" ? t.category : null,
          description: t && typeof t.description === "string" ? t.description : null,
          question_count: t && typeof t.question_count === "number" ? t.question_count : null,
          duration_minutes: t && typeof t.duration_minutes === "number" ? t.duration_minutes : null,
          marks_per_question:
            t && (typeof t.marks_per_question === "number" || typeof t.marks_per_question === "string")
              ? Number(t.marks_per_question)
              : null,
          negative_marks:
            t && (typeof t.negative_marks === "number" || typeof t.negative_marks === "string")
              ? Number(t.negative_marks)
              : null,
          difficulty: t && typeof t.difficulty === "string" ? t.difficulty : null,
          subjects: t ? t.subjects : null,
          subjects_breakdown: t ? t.subjects_breakdown : null,
          topics: t ? t.topics : null,
          features: t ? t.features : null,
          rating: t && (typeof t.rating === "number" || typeof t.rating === "string") ? Number(t.rating) : null,
          attempts: t && typeof t.attempts === "number" ? t.attempts : null,
          start_time: typeof e.start_time === "string" ? e.start_time : null,
          status: typeof e.status === "string" ? e.status : null,
          participants: typeof e.participants === "number" ? e.participants : null,
          prize: typeof e.prize === "string" ? e.prize : null,
        };
      });

      return jsonResponse(req, { data: mapped });
    }

    if (req.method === "GET" && action === "details") {
      const id = url.searchParams.get("id");
      if (!id) return errorResponse(req, "Missing exam id", 400);

      const { data, error } = await supabase
        .from("exam_templates")
        .select(
          "id, title, category, description, question_count, duration_minutes, marks_per_question, negative_marks, difficulty, subjects, subjects_breakdown, topics, features, rating, attempts",
        )
        .eq("id", id)
        .single();

      if (error) return errorResponse(req, "Exam not found", 404);
      return jsonResponse(req, { data });
    }

    if (req.method === "GET" && action === "catalog") {
      const { data, error } = await supabase.from("exam_templates").select("category, subjects, topics");
      if (error) return errorResponse(req, error.message, 500);

      const categoryMap = new Map<string, { id: string; name: string; subjects: Map<string, { id: string; name: string; topics: Set<string> }> }>();

      (data || []).forEach((row: { category: unknown; subjects: unknown; topics: unknown }) => {
        const categoryId = typeof row.category === "string" ? row.category : "general";
        const categoryName = categoryId;

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, { id: categoryId, name: categoryName, subjects: new Map() });
        }

        const category = categoryMap.get(categoryId)!;
        const subjects = Array.isArray(row.subjects)
          ? row.subjects.filter((v: unknown): v is string => typeof v === "string")
          : [];
        const topics = row.topics && typeof row.topics === "object" ? (row.topics as Record<string, unknown>) : {};

        subjects.forEach((subjectIdRaw: string) => {
          const subjectId = subjectIdRaw.toLowerCase();
          const subjectName = subjectLabelMap[subjectId] || subjectIdRaw;

          if (!category.subjects.has(subjectId)) {
            category.subjects.set(subjectId, { id: subjectId, name: subjectName, topics: new Set<string>() });
          }

          const subject = category.subjects.get(subjectId)!;
          const topicList = Array.isArray(topics[subjectIdRaw])
            ? (topics[subjectIdRaw] as unknown[])
            : Array.isArray(topics[subjectId])
              ? (topics[subjectId] as unknown[])
              : [];

          topicList.forEach((topic) => {
            if (typeof topic === "string" && topic.trim()) {
              subject.topics.add(topic.trim());
            }
          });
        });
      });

      const categories = Array.from(categoryMap.values()).map((category) => ({
        id: category.id,
        name: category.name,
        subjects: Array.from(category.subjects.values()).map((subject) => ({
          id: subject.id,
          name: subject.name,
          topics: Array.from(subject.topics).map((name) => ({ id: topicIdFromName(name), name })),
        })),
      }));

      return jsonResponse(req, { data: { categories } });
    }

    if (req.method === "GET" && action === "generate") {
      const user = await getUser(req);
      if (!user) return errorResponse(req, "Unauthorized", 401);

      const subject = url.searchParams.get("subject");
      const topic = url.searchParams.get("topic");
      const topicsCsv = url.searchParams.get("topics");
      const subjectsCsv = url.searchParams.get("subjects");
      const difficulty = url.searchParams.get("difficulty");
      const count = clamp(Number.parseInt(url.searchParams.get("count") || "10", 10), 1, 200);

      const subjects = subjectsCsv ? parseCsv(subjectsCsv) : subject && subject !== "all" ? [subject] : [];
      const topics = topicsCsv ? parseCsv(topicsCsv) : topic ? [topic] : [];
      const normalizedDifficulty = difficulty && difficulty !== "all" ? difficulty : null;

      let selected: Array<{
        id: string;
        subject: string;
        topic: string;
        difficulty: string;
        question_text: string;
        options: unknown;
      }> = [];

      let randomQuery = supabase
        .from("question_bank")
        .select("id, subject, topic, difficulty, question_text, options");

      if (subjects.length > 0) randomQuery = randomQuery.in("subject", subjects);
      if (topics.length > 0) randomQuery = randomQuery.in("topic", topics);
      if (normalizedDifficulty) randomQuery = randomQuery.eq("difficulty", normalizedDifficulty);

      const { data: randomData, error: randomError } = await randomQuery;
      if (randomError) return errorResponse(req, randomError.message, 500);

      const shuffled = (randomData || []).sort(() => Math.random() - 0.5);
      selected = shuffled.slice(0, Math.min(count, shuffled.length));

      const totalAvailable = await fetchQuestionCount(supabase, subjects, topics, normalizedDifficulty);

      return jsonResponse(req, {
        data: selected,
        total_available: totalAvailable,
        selected_count: selected.length,
      });
    }

    if (req.method === "GET" && action === "generate_template") {
      const user = await getUser(req);
      if (!user) return errorResponse(req, "Unauthorized", 401);

      const id = url.searchParams.get("id");
      if (!id) return errorResponse(req, "Missing template id", 400);

      const { data: template, error: tErr } = await supabase
        .from("exam_templates")
        .select("id, question_count, difficulty, subjects, topics, question_ids")
        .eq("id", id)
        .single();

      if (tErr || !template) return errorResponse(req, "Exam template not found", 404);

      const questionIds = toStringArray((template as Record<string, unknown>).question_ids);
      const subjects = toStringArray((template as Record<string, unknown>).subjects);
      const topicsRecord = toTopicsRecord((template as Record<string, unknown>).topics);
      const topics = uniqueStrings(Object.values(topicsRecord).flat());
      const normalizedDifficulty =
        typeof (template as Record<string, unknown>).difficulty === "string" &&
        (template as Record<string, unknown>).difficulty !== "all"
          ? ((template as Record<string, unknown>).difficulty as string)
          : null;

      const desiredCountRaw = typeof (template as Record<string, unknown>).question_count === "number"
        ? ((template as Record<string, unknown>).question_count as number)
        : 10;
      const desiredCount = clamp(Math.trunc(desiredCountRaw), 1, 200);

      if (questionIds.length > 0) {
        const uniqueIds = uniqueStrings(questionIds);
        const cappedIds = uniqueIds.slice(0, desiredCount);

        const { data: rows, error: qErr } = await supabase
          .from("question_bank")
          .select("id, subject, topic, difficulty, question_text, options")
          .in("id", cappedIds);

        if (qErr) return errorResponse(req, qErr.message, 500);

        const byId = new Map<string, unknown>();
        (rows || []).forEach((r: { id: string }) => byId.set(r.id, r));
        const ordered = cappedIds
          .map((qid) => byId.get(qid))
          .filter((x): x is Record<string, unknown> => Boolean(x));

        return jsonResponse(req, {
          data: ordered,
          total_available: ordered.length,
          selected_count: ordered.length,
        });
      }

      // Fallback: generate randomly using template config
      let randomQuery = supabase
        .from("question_bank")
        .select("id, subject, topic, difficulty, question_text, options");

      if (subjects.length > 0) randomQuery = randomQuery.in("subject", subjects);
      if (topics.length > 0) randomQuery = randomQuery.in("topic", topics);
      if (normalizedDifficulty) randomQuery = randomQuery.eq("difficulty", normalizedDifficulty);

      const { data: randomData, error: randomError } = await randomQuery;
      if (randomError) return errorResponse(req, randomError.message, 500);

      const shuffled = (randomData || []).sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(desiredCount, shuffled.length));
      const totalAvailable = await fetchQuestionCount(supabase, subjects, topics, normalizedDifficulty);

      return jsonResponse(req, {
        data: selected,
        total_available: totalAvailable,
        selected_count: selected.length,
      });
    }

    if (req.method === "GET" && action === "attempts") {
      const user = await getUser(req);
      if (!user) return errorResponse(req, "Unauthorized", 401);

      const limit = clamp(Number.parseInt(url.searchParams.get("limit") || "20", 10), 1, 100);
      const offset = Math.max(0, Number.parseInt(url.searchParams.get("offset") || "0", 10));

      const { data, error, count } = await supabase
        .from("exam_attempts")
        .select(
          "id, user_id, subject, topic, difficulty, total_questions, correct_answers, wrong_answers, skipped, score, max_score, duration_minutes, time_taken_seconds, negative_marking, marks_per_question, negative_marks, answers, created_at",
          { count: "exact" },
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(req, error.message, 500);
      return jsonResponse(req, { data, total: count, limit, offset });
    }

    if (req.method === "GET" && action === "attempt") {
      const user = await getUser(req);
      if (!user) return errorResponse(req, "Unauthorized", 401);

      const id = url.searchParams.get("id");
      if (!id) return errorResponse(req, "Missing attempt id", 400);

      const { data, error } = await supabase
        .from("exam_attempts")
        .select(
          "id, user_id, subject, topic, difficulty, total_questions, correct_answers, wrong_answers, skipped, score, max_score, duration_minutes, time_taken_seconds, negative_marking, marks_per_question, negative_marks, answers, created_at",
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) return errorResponse(req, "Attempt not found", 404);
      return jsonResponse(req, { data });
    }

    if (req.method === "GET" && action === "stats") {
      const user = await getUser(req);
      if (!user) return errorResponse(req, "Unauthorized", 401);

      const { data: attempts, error } = await supabase
        .from("exam_attempts")
        .select("subject, score, max_score, correct_answers, total_questions, time_taken_seconds")
        .eq("user_id", user.id);

      if (error) return errorResponse(req, error.message, 500);

      const totalExams = attempts?.length || 0;
      const totalScore = attempts?.reduce((sum: number, a: { score: number | string }) => sum + Number(a.score), 0) || 0;
      const totalMaxScore = attempts?.reduce((sum: number, a: { max_score: number | string }) => sum + Number(a.max_score), 0) || 0;
      const avgScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
      const totalCorrect = attempts?.reduce((sum: number, a: { correct_answers: number }) => sum + a.correct_answers, 0) || 0;
      const totalQuestions = attempts?.reduce((sum: number, a: { total_questions: number }) => sum + a.total_questions, 0) || 0;
      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      const totalTimeSecs = attempts?.reduce((sum: number, a: { time_taken_seconds: number | null }) => sum + (a.time_taken_seconds || 0), 0) || 0;

      const subjectMap: Record<string, { exams: number; correct: number; total: number }> = {};
      attempts?.forEach((a: { subject: string; correct_answers: number; total_questions: number }) => {
        if (!subjectMap[a.subject]) subjectMap[a.subject] = { exams: 0, correct: 0, total: 0 };
        subjectMap[a.subject].exams += 1;
        subjectMap[a.subject].correct += a.correct_answers;
        subjectMap[a.subject].total += a.total_questions;
      });

      const subjectStats = Object.entries(subjectMap).map(([subjectName, stats]) => ({
        subject: subjectName,
        exams: stats.exams,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      }));

      return jsonResponse(req, {
        data: {
          total_exams: totalExams,
          avg_score: avgScore,
          accuracy,
          total_study_time_hours: Math.round(totalTimeSecs / 3600),
          subject_stats: subjectStats,
        },
      });
    }

    if (req.method === "POST") {
      const user = await getUser(req);
      if (!user) return errorResponse(req, "Unauthorized", 401);

      const body = await req.json();
      const {
        subject,
        topic,
        difficulty,
        duration_minutes,
        marks_per_question,
        negative_marks,
        negative_marking,
        time_taken_seconds,
        answers,
      } = body;

      const duration = toFiniteNumber(duration_minutes, NaN);
      if (!subject || !Number.isFinite(duration) || duration <= 0) {
        return errorResponse(req, "Missing required fields", 400);
      }

      if (!Array.isArray(answers) || answers.length === 0) {
        return errorResponse(req, "Missing answers", 400);
      }

      const normalizedAnswers = answers
        .map((a: unknown) => {
          if (!a || typeof a !== "object") return null;
          const v = a as Record<string, unknown>;
          const questionId = typeof v.question_id === "string" ? v.question_id : null;
          const selected = toFiniteNumber(v.selected, -1);
          return questionId ? { question_id: questionId, selected: Math.trunc(selected) } : null;
        })
        .filter((x): x is { question_id: string; selected: number } => Boolean(x));

      if (normalizedAnswers.length === 0) return errorResponse(req, "Invalid answers", 400);

      const questionIds = normalizedAnswers.map((a) => a.question_id);
      const { data: rows, error: qErr } = await supabase
        .from("question_bank")
        .select("id, correct_answer")
        .in("id", questionIds);

      if (qErr) return errorResponse(req, qErr.message, 500);

      const correctById = new Map<string, number>();
      (rows || []).forEach((r: { id: string; correct_answer: number }) => {
        correctById.set(r.id, r.correct_answer);
      });

      const missing = questionIds.filter((id: string) => !correctById.has(id));
      if (missing.length > 0) return errorResponse(req, "Invalid question ids", 400);

      const marks = clamp(toFiniteNumber(marks_per_question, 1), 0, 100);
      const negative = clamp(toFiniteNumber(negative_marks, 0), 0, marks);

      let correct = 0;
      let wrong = 0;
      let skipped = 0;

      const gradedAnswers = normalizedAnswers.map((a) => {
        const correctAnswer = correctById.get(a.question_id)!;
        const isSkipped = a.selected < 0;
        const isCorrect = !isSkipped && a.selected === correctAnswer;
        if (isSkipped) skipped += 1;
        else if (isCorrect) correct += 1;
        else wrong += 1;

        return { question_id: a.question_id, selected: a.selected, correct: correctAnswer, is_correct: isCorrect };
      });

      const totalQuestions = gradedAnswers.length;
      const maxScore = totalQuestions * marks;
      const scoreRaw = correct * marks - wrong * negative;
      const score = Math.max(0, scoreRaw);

      const { data, error } = await supabase
        .from("exam_attempts")
        .insert({
          user_id: user.id,
          subject,
          topic: topic || null,
          difficulty: difficulty || null,
          duration_minutes: Math.trunc(duration),
          total_questions: totalQuestions,
          correct_answers: correct,
          wrong_answers: wrong,
          skipped,
          score,
          max_score: maxScore,
          marks_per_question: marks,
          negative_marking: typeof negative_marking === "boolean" ? negative_marking : negative > 0,
          negative_marks: negative,
          time_taken_seconds: Number.isFinite(toFiniteNumber(time_taken_seconds, NaN))
            ? Math.trunc(toFiniteNumber(time_taken_seconds, NaN))
            : null,
          answers: gradedAnswers,
        })
        .select(
          "id, user_id, subject, topic, difficulty, total_questions, correct_answers, wrong_answers, skipped, score, max_score, duration_minutes, time_taken_seconds, negative_marking, marks_per_question, negative_marks, answers, created_at",
        )
        .single();

      if (error) return errorResponse(req, error.message, 500);

      return jsonResponse(
        req,
        {
          data,
          results: {
            correct,
            wrong,
            skipped,
            score,
            max_score: maxScore,
            total_questions: totalQuestions,
            graded_answers: gradedAnswers,
          },
        },
        201,
      );
    }

    return errorResponse(req, "Invalid action or method", 400);
  } catch (err) {
    console.error("Exams API error:", err);
    return errorResponse(req, "Internal server error", 500);
  }
});
