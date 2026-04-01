import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

function toFiniteNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

async function getUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await anonClient.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

function stripCorrectAnswer(question: Record<string, unknown>) {
  const { correct_answer, ...rest } = question;
  return rest;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // GET ?action=live - List live exam events (public)
    if (req.method === "GET" && action === "live") {
      const { data, error } = await supabase
        .from("live_exam_events")
        .select(
          "id, start_time, status, participants, prize, exam_templates ( id, title, category, description, question_count, duration_minutes, marks_per_question, negative_marks, difficulty, subjects, subjects_breakdown, topics, features, rating, attempts )",
        )
        .order("start_time", { ascending: true });

      if (error) return errorResponse(error.message, 500);

      const mapped = (data || []).map((row: unknown) => {
        const e = (row && typeof row === "object" ? (row as Record<string, unknown>) : {}) as Record<string, unknown>;
        const t = (e.exam_templates && typeof e.exam_templates === "object"
          ? (e.exam_templates as Record<string, unknown>)
          : null);

        return {
          event_id: typeof e.id === "string" ? e.id : null,
          id: t && typeof t.id === "string" ? t.id : null,
          title: t && typeof t.title === "string" ? t.title : null,
          category: t && typeof t.category === "string" ? t.category : null,
          description: t && typeof t.description === "string" ? t.description : null,
          question_count: t && typeof t.question_count === "number" ? t.question_count : null,
          duration_minutes: t && typeof t.duration_minutes === "number" ? t.duration_minutes : null,
          marks_per_question: t && (typeof t.marks_per_question === "number" || typeof t.marks_per_question === "string")
            ? Number(t.marks_per_question)
            : null,
          negative_marks: t && (typeof t.negative_marks === "number" || typeof t.negative_marks === "string")
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

      return jsonResponse({ data: mapped });
    }

    // GET ?action=details&id=xxx - Get exam template details (public)
    if (req.method === "GET" && action === "details") {
      const id = url.searchParams.get("id");
      if (!id) return errorResponse("Missing exam id", 400);

      const { data, error } = await supabase
        .from("exam_templates")
        .select(
          "id, title, category, description, question_count, duration_minutes, marks_per_question, negative_marks, difficulty, subjects, subjects_breakdown, topics, features, rating, attempts",
        )
        .eq("id", id)
        .single();

      if (error) return errorResponse("Exam not found", 404);
      return jsonResponse({ data });
    }

    // GET ?action=generate - Generate random questions for an exam
    if (req.method === "GET" && action === "generate") {
      const user = await getUser(req);
      if (!user) return errorResponse("Unauthorized", 401);

      const subject = url.searchParams.get("subject");
      const topic = url.searchParams.get("topic");
      const topics = url.searchParams.get("topics"); // comma-separated
      const difficulty = url.searchParams.get("difficulty");
      const count = parseInt(url.searchParams.get("count") || "10");
      const subjects = url.searchParams.get("subjects"); // comma-separated

      // Do not return correct answers to clients.
      let query = supabase
        .from("question_bank")
        .select("id, subject, topic, difficulty, question_text, options");

      if (subjects) {
        query = query.in("subject", subjects.split(","));
      } else if (subject && subject !== "all") {
        query = query.eq("subject", subject);
      }
      if (topics) {
        const list = topics
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        if (list.length > 0) query = query.in("topic", list);
      } else if (topic) {
        query = query.eq("topic", topic);
      }
      if (difficulty && difficulty !== "all") query = query.eq("difficulty", difficulty);

      const { data, error } = await query;
      if (error) return errorResponse(error.message, 500);

      // Shuffle and pick 'count' questions
      const shuffled = (data || []).sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));

      const sanitized = selected.map((q) => ({
        id: q.id,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        question_text: q.question_text,
        options: q.options,
      }));

      return jsonResponse({
        data: sanitized,
        total_available: data?.length || 0,
        selected_count: selected.length,
      });
    }

    // GET ?action=attempts - Get user's exam attempts
    if (req.method === "GET" && action === "attempts") {
      const user = await getUser(req);
      if (!user) return errorResponse("Unauthorized", 401);

      const limit = parseInt(url.searchParams.get("limit") || "20");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      const { data, error, count } = await supabase
        .from("exam_attempts")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ data, total: count, limit, offset });
    }

    // GET ?action=attempt&id=xxx - Get single attempt
    if (req.method === "GET" && action === "attempt") {
      const user = await getUser(req);
      if (!user) return errorResponse("Unauthorized", 401);

      const id = url.searchParams.get("id");
      if (!id) return errorResponse("Missing attempt id");

      const { data, error } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) return errorResponse("Attempt not found", 404);
      return jsonResponse({ data });
    }

    // GET ?action=stats - Get user's exam statistics
    if (req.method === "GET" && action === "stats") {
      const user = await getUser(req);
      if (!user) return errorResponse("Unauthorized", 401);

      const { data: attempts, error } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("user_id", user.id);

      if (error) return errorResponse(error.message, 500);

      const totalExams = attempts?.length || 0;
      const totalScore = attempts?.reduce((sum, a) => sum + Number(a.score), 0) || 0;
      const totalMaxScore = attempts?.reduce((sum, a) => sum + Number(a.max_score), 0) || 0;
      const avgScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
      const totalCorrect = attempts?.reduce((sum, a) => sum + a.correct_answers, 0) || 0;
      const totalQuestions = attempts?.reduce((sum, a) => sum + a.total_questions, 0) || 0;
      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      const totalTimeSecs = attempts?.reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0) || 0;

      // Subject-wise breakdown
      const subjectMap: Record<string, { exams: number; correct: number; total: number }> = {};
      attempts?.forEach((a) => {
        if (!subjectMap[a.subject]) subjectMap[a.subject] = { exams: 0, correct: 0, total: 0 };
        subjectMap[a.subject].exams++;
        subjectMap[a.subject].correct += a.correct_answers;
        subjectMap[a.subject].total += a.total_questions;
      });

      const subjectStats = Object.entries(subjectMap).map(([subject, stats]) => ({
        subject,
        exams: stats.exams,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      }));

      return jsonResponse({
        data: {
          total_exams: totalExams,
          avg_score: avgScore,
          accuracy,
          total_study_time_hours: Math.round(totalTimeSecs / 3600),
          subject_stats: subjectStats,
        },
      });
    }

    // POST - Submit exam attempt (server-side score calculation)
    if (req.method === "POST") {
      const user = await getUser(req);
      if (!user) return errorResponse("Unauthorized", 401);

      const body = await req.json();
      const {
        subject,
        topic,
        difficulty,
        duration_minutes,
        marks_per_question,
        negative_marks,
        time_taken_seconds,
        answers,
      } = body;

      const duration = toFiniteNumber(duration_minutes, NaN);
      if (!subject || !Number.isFinite(duration) || duration <= 0) return errorResponse("Missing required fields");
      if (!Array.isArray(answers) || answers.length === 0) return errorResponse("Missing answers");

      const normalizedAnswers = answers
        .map((a: unknown) => {
          if (!a || typeof a !== "object") return null;
          const v = a as Record<string, unknown>;
          const question_id = typeof v.question_id === "string" ? v.question_id : null;
          const selected = toFiniteNumber(v.selected, -1);
          return question_id ? { question_id, selected: Math.trunc(selected) } : null;
        })
        .filter((x): x is { question_id: string; selected: number } => Boolean(x));

      if (normalizedAnswers.length === 0) return errorResponse("Invalid answers");

      // Fetch correct answers from DB (server-side) so client cannot tamper.
      const questionIds = normalizedAnswers.map((a) => a.question_id);
      const { data: rows, error: qErr } = await supabase
        .from("question_bank")
        .select("id, correct_answer")
        .in("id", questionIds);
      if (qErr) return errorResponse(qErr.message, 500);

      const correctById = new Map<string, number>();
      (rows || []).forEach((r: { id: string; correct_answer: number }) => {
        correctById.set(r.id, r.correct_answer);
      });

      // If any question is missing, reject (prevents submitting arbitrary ids).
      const missing = questionIds.filter((id: string) => !correctById.has(id));
      if (missing.length > 0) return errorResponse("Invalid question ids", 400);

      const marks = clamp(toFiniteNumber(marks_per_question, 1), 0, 100);
      const negative = clamp(toFiniteNumber(negative_marks, 0), 0, marks);

      let correct = 0;
      let wrong = 0;
      let skipped = 0;
      const gradedAnswers = normalizedAnswers.map((a) => {
        const correctAnswer = correctById.get(a.question_id)!;
        const isSkipped = a.selected < 0;
        const isCorrect = !isSkipped && a.selected === correctAnswer;
        if (isSkipped) skipped++;
        else if (isCorrect) correct++;
        else wrong++;
        return { question_id: a.question_id, selected: a.selected, is_correct: isCorrect };
      });

      const totalQuestions = normalizedAnswers.length;
      const maxScore = totalQuestions * marks;
      const scoreRaw = correct * marks - wrong * negative;
      const score = Math.max(0, scoreRaw);

      // Validate marks_per_question
      const mPerQ = Number(marks_per_question) || 1;
      const negMarks = Number(negative_marks) || 0;
      const hasNegativeMarking = !!negative_marking;

      // Extract question IDs from submitted answers
      const questionIds = answers.map((a: { question_id: string }) => a.question_id).filter(Boolean);
      if (questionIds.length === 0) {
        return errorResponse("No valid question_id in answers");
      }

      // Look up correct answers from the database (server is the authority)
      const { data: dbQuestions, error: qError } = await supabase
        .from("question_bank")
        .select("id, correct_answer")
        .in("id", questionIds);

      if (qError) return errorResponse("Failed to validate questions", 500);

      // Build a map of question_id -> correct_answer
      const correctMap: Record<string, number> = {};
      (dbQuestions || []).forEach((q: { id: string; correct_answer: number }) => {
        correctMap[q.id] = q.correct_answer;
      });

      // Server-side score calculation
      let correct = 0;
      let wrong = 0;
      let skipped = 0;
      const gradedAnswers: { question_id: string; selected: number; correct: number; is_correct: boolean }[] = [];

      for (const ans of answers as { question_id: string; selected: number }[]) {
        const correctAnswer = correctMap[ans.question_id];
        if (correctAnswer === undefined) continue; // question not found, skip

        if (ans.selected === -1 || ans.selected === undefined || ans.selected === null) {
          skipped++;
          gradedAnswers.push({ question_id: ans.question_id, selected: -1, correct: correctAnswer, is_correct: false });
        } else if (ans.selected === correctAnswer) {
          correct++;
          gradedAnswers.push({ question_id: ans.question_id, selected: ans.selected, correct: correctAnswer, is_correct: true });
        } else {
          wrong++;
          gradedAnswers.push({ question_id: ans.question_id, selected: ans.selected, correct: correctAnswer, is_correct: false });
        }
      }

      const totalQuestions = gradedAnswers.length;
      const positiveMarks = correct * mPerQ;
      const deductedMarks = hasNegativeMarking ? wrong * negMarks : 0;
      const score = Math.max(0, positiveMarks - deductedMarks);
      const maxScore = totalQuestions * mPerQ;

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
          negative_marking: negative > 0,
          negative_marks: negative,
          time_taken_seconds: Number.isFinite(toFiniteNumber(time_taken_seconds, NaN))
            ? Math.trunc(toFiniteNumber(time_taken_seconds, NaN))
            : null,
          answers: gradedAnswers,
        })
        .select()
        .single();

      if (error) return errorResponse(error.message, 500);

      // Return server-computed results so client can display them
      return jsonResponse({
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
      }, 201);
    }

    return errorResponse("Invalid action or method", 400);
  } catch (err) {
    console.error("Exams API error:", err);
    return errorResponse("Internal server error", 500);
  }
});
