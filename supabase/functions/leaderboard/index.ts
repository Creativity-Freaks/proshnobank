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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return errorResponse("Method not allowed", 405);
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "rankings";
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const subject = url.searchParams.get("subject");
  const period = url.searchParams.get("period") || "all"; // daily, weekly, monthly, all

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Rankings
    if (action === "rankings") {
      let query = supabase.from("exam_attempts").select("*");

      if (subject && subject !== "all") {
        query = query.eq("subject", subject);
      }

      // Time filter
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
      if (error) return errorResponse(error.message, 500);

      // Aggregate by user
      const userMap: Record<string, {
        user_id: string;
        total_score: number;
        total_max_score: number;
        exams: number;
        correct: number;
        total_questions: number;
      }> = {};

      attempts?.forEach((a) => {
        if (!userMap[a.user_id]) {
          userMap[a.user_id] = {
            user_id: a.user_id,
            total_score: 0,
            total_max_score: 0,
            exams: 0,
            correct: 0,
            total_questions: 0,
          };
        }
        userMap[a.user_id].total_score += Number(a.score);
        userMap[a.user_id].total_max_score += Number(a.max_score);
        userMap[a.user_id].exams++;
        userMap[a.user_id].correct += a.correct_answers;
        userMap[a.user_id].total_questions += a.total_questions;
      });

      // Sort by total score descending
      const rankings = Object.values(userMap)
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, limit)
        .map((u, index) => ({
          rank: index + 1,
          user_id: u.user_id,
          score: Math.round(u.total_score),
          exams: u.exams,
          accuracy: u.total_questions > 0 ? Math.round((u.correct / u.total_questions) * 100) : 0,
        }));

      // Fetch user names from auth (using admin client)
      const userIds = rankings.map((r) => r.user_id);
      const usersWithNames = await Promise.all(
        userIds.map(async (uid) => {
          const { data } = await supabase.auth.admin.getUserById(uid);
          return {
            id: uid,
            name: data?.user?.user_metadata?.full_name || "অজানা ব্যবহারকারী",
          };
        })
      );

      const nameMap = Object.fromEntries(usersWithNames.map((u) => [u.id, u.name]));

      const result = rankings.map((r) => ({
        ...r,
        name: nameMap[r.user_id] || "অজানা ব্যবহারকারী",
      }));

      return jsonResponse({ data: result });
    }

    // Global stats
    if (action === "stats") {
      const { data: attempts, error } = await supabase
        .from("exam_attempts")
        .select("user_id, score, correct_answers, total_questions");

      if (error) return errorResponse(error.message, 500);

      const uniqueUsers = new Set(attempts?.map((a) => a.user_id));
      const totalExams = attempts?.length || 0;
      const totalCorrect = attempts?.reduce((s, a) => s + a.correct_answers, 0) || 0;
      const totalQuestions = attempts?.reduce((s, a) => s + a.total_questions, 0) || 0;

      return jsonResponse({
        data: {
          total_participants: uniqueUsers.size,
          total_exams: totalExams,
          avg_accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
        },
      });
    }

    return errorResponse("Invalid action", 400);
  } catch (err) {
    console.error("Leaderboard API error:", err);
    return errorResponse("Internal server error", 500);
  }
});
