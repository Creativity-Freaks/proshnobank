import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS_ENV = (Deno.env.get("ALLOWED_ORIGINS") || "").trim();
const allowWildcard = ALLOWED_ORIGINS_ENV === "*";
const allowedOrigins = allowWildcard
  ? []
  : ALLOWED_ORIGINS_ENV
    ? ALLOWED_ORIGINS_ENV.split(",").map((o: string) => o.trim()).filter(Boolean)
    : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080"];

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = allowWildcard ? "*" : (allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "*");

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req) });
  }

  if (req.method !== "GET") {
    return errorResponse(req, "Method not allowed", 405);
  }

  const requester = getClientKey(req);
  const rateAllowed = applyRateLimit(`${requester}:leaderboard:read`, 120, 60_000);
  if (!rateAllowed) {
    return errorResponse(req, "Too many requests, please try again later", 429);
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "rankings";
  const limit = Number.parseInt(url.searchParams.get("limit") || "20", 10);
  const clampedLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 100)) : 20;
  const subject = url.searchParams.get("subject");
  const period = url.searchParams.get("period") || "all";

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    if (action === "rankings") {
      let query = supabase
        .from("exam_attempts")
        .select("user_id, score, max_score, correct_answers, total_questions, created_at");

      if (subject && subject !== "all") {
        query = query.eq("subject", subject);
      }

      if (period !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (period) {
          case "daily":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "weekly":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "monthly":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte("created_at", startDate.toISOString());
      }

      const { data: attempts, error } = await query;
      if (error) return errorResponse(req, error.message, 500);

      const userMap: Record<
        string,
        {
          user_id: string;
          total_score: number;
          exams: number;
          correct: number;
          total_questions: number;
        }
      > = {};

      (attempts || []).forEach((a: { user_id: string; score: number | string; correct_answers: number; total_questions: number }) => {
        if (!userMap[a.user_id]) {
          userMap[a.user_id] = {
            user_id: a.user_id,
            total_score: 0,
            exams: 0,
            correct: 0,
            total_questions: 0,
          };
        }

        userMap[a.user_id].total_score += Number(a.score);
        userMap[a.user_id].exams += 1;
        userMap[a.user_id].correct += a.correct_answers;
        userMap[a.user_id].total_questions += a.total_questions;
      });

      const rankings = Object.values(userMap)
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, clampedLimit)
        .map((u, index) => ({
          rank: index + 1,
          user_id: u.user_id,
          score: Math.round(u.total_score),
          exams: u.exams,
          accuracy: u.total_questions > 0 ? Math.round((u.correct / u.total_questions) * 100) : 0,
        }));

      const result = rankings.map((r) => ({
        ...r,
        name: `User-${r.user_id.slice(0, 8)}`,
      }));

      return jsonResponse(req, { data: result });
    }

    if (action === "stats") {
      const { data: attempts, error } = await supabase
        .from("exam_attempts")
        .select("user_id, correct_answers, total_questions");

      if (error) return errorResponse(req, error.message, 500);

      const uniqueUsers = new Set((attempts || []).map((a: { user_id: string }) => a.user_id));
      const totalExams = attempts?.length || 0;
      const totalCorrect = attempts?.reduce((sum: number, a: { correct_answers: number }) => sum + a.correct_answers, 0) || 0;
      const totalQuestions = attempts?.reduce((sum: number, a: { total_questions: number }) => sum + a.total_questions, 0) || 0;

      return jsonResponse(req, {
        data: {
          total_participants: uniqueUsers.size,
          total_exams: totalExams,
          avg_accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
        },
      });
    }

    return errorResponse(req, "Invalid action", 400);
  } catch (err) {
    console.error("Leaderboard API error:", err);
    return errorResponse(req, "Internal server error", 500);
  }
});
