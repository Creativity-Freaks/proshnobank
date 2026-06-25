import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS_ENV = (Deno.env.get("ALLOWED_ORIGINS") || "").trim();
const allowWildcard = ALLOWED_ORIGINS_ENV === "*";
const allowedOrigins = allowWildcard
  ? []
  : ALLOWED_ORIGINS_ENV
    ? ALLOWED_ORIGINS_ENV.split(",").map((o: string) => o.trim()).filter(Boolean)
    : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080"];

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

const subjectAliases: Record<string, string[]> = {
  bangla: ["bangla", "বাংলা"],
  english: ["english", "ইংরেজি"],
  math: ["math", "mathematics", "গণিত"],
  physics: ["physics", "পদার্থবিজ্ঞান", "পদার্থ"],
  chemistry: ["chemistry", "রসায়ন"],
  biology: ["biology", "জীববিজ্ঞান"],
  gk: ["gk", "general knowledge", "সাধারণ জ্ঞান"],
  ict: ["ict"],
  science: ["science", "বিজ্ঞান"],
  computer: ["computer", "কম্পিউটার"],
  iq: ["iq", "বুদ্ধিমত্তা"],
};

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = allowWildcard ? "*" : (allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "*");

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
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

function parseIntSafe(value: string | null, fallback: number) {
  const n = Number.parseInt(value || "", 10);
  return Number.isFinite(n) ? n : fallback;
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

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  rateBuckets.set(key, record);
  return true;
}

async function getAuthenticatedUser(req: Request) {
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

async function hasRole(supabase: unknown, userId: string, role: string): Promise<boolean> {
  const client = supabase as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          eq: (column: string, value: string) => {
            maybeSingle: () => Promise<{ data: unknown }>;
          };
        };
      };
    };
  };

  const { data } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .maybeSingle();

  return Boolean(data);
}

function subjectCandidates(input: string) {
  const normalized = input.trim().toLowerCase();
  const alias = subjectAliases[normalized];
  if (!alias) return [input];
  return Array.from(new Set([...alias, input]));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req) });
  }

  const requester = getClientKey(req);
  const actionForRate = req.method === "GET" ? "read" : "write";
  const rateAllowed = applyRateLimit(
    `${requester}:questions:${actionForRate}`,
    req.method === "GET" ? 120 : 40,
    60_000,
  );

  if (!rateAllowed) {
    return errorResponse(req, "Too many requests, please try again later", 429);
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "list";

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    if (req.method === "GET") {
      const user = await getAuthenticatedUser(req);
      const userIsAdmin = user ? await hasRole(supabase, user.id, "admin") : false;
      const userIsTeacher = user ? await hasRole(supabase, user.id, "teacher") : false;

      const subject = url.searchParams.get("subject");
      const subject_id = url.searchParams.get("subject_id");
      const category_id = url.searchParams.get("category_id");
      const topic = url.searchParams.get("topic");
      const difficulty = url.searchParams.get("difficulty");
      const search = url.searchParams.get("search");
      const limit = parseIntSafe(url.searchParams.get("limit"), 50);
      const offset = parseIntSafe(url.searchParams.get("offset"), 0);
      const id = url.searchParams.get("id");

      if (action === "mine") {
        if (!user) return errorResponse(req, "Unauthorized", 401);
        if (!userIsTeacher && !userIsAdmin) return errorResponse(req, "Forbidden", 403);

        const baseSelectMine =
          "id, subject, topic, difficulty, question_text, options, correct_answer, explanation, created_at";

        let query = supabase
          .from("question_bank")
          .select(baseSelectMine, { count: "exact" })
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });

        if (subject && subject !== "all") {
          const candidates = subjectCandidates(subject);
          query = candidates.length > 1 ? query.in("subject", candidates) : query.eq("subject", candidates[0]);
        }

        if (topic) query = query.eq("topic", topic);
        if (difficulty && difficulty !== "all") query = query.eq("difficulty", difficulty);
        if (search) query = query.ilike("question_text", `%${search}%`);

        const { data, error, count } = await query.range(offset, offset + limit - 1);
        if (error) return errorResponse(req, error.message, 500);
        return jsonResponse(req, { data, total: count, limit, offset });
      }

      const baseSelect = userIsAdmin
        ? "id, subject, topic, difficulty, question_text, options, correct_answer, explanation, created_at"
        : "id, subject, topic, difficulty, question_text, options, explanation, created_at";

      if (id) {
        const { data, error } = await supabase.from("question_bank").select(baseSelect).eq("id", id).single();
        if (error) return errorResponse(req, "Question not found", 404);
        return jsonResponse(req, { data });
      }

      let query = supabase
        .from("question_bank")
        .select(action === "groups" ? "subject, topic, difficulty, question_text" : baseSelect, { count: "exact" })
        .order("created_at", { ascending: false });

      if (subject_id) {
        query = query.eq("subject_id", subject_id);
      } else if (category_id) {
        query = query.eq("category_id", category_id);
      } else if (subject && subject !== "all") {
        const candidates = subjectCandidates(subject);
        query = candidates.length > 1 ? query.in("subject", candidates) : query.eq("subject", candidates[0]);
      }

      if (topic) query = query.eq("topic", topic);
      if (difficulty && difficulty !== "all") query = query.eq("difficulty", difficulty);
      if (search) query = query.ilike("question_text", `%${search}%`);

      if (action === "groups") {
        const { data, error, count } = await query;
        if (error) return errorResponse(req, error.message, 500);

        const grouped = new Map<string, { subject: string; topic: string; difficulty: string; count: number }>();
        const groupedRows = (data || []) as unknown as Array<{ subject: string; topic: string; difficulty: string }>;
        groupedRows.forEach((row) => {
          const key = `${row.subject}|${row.topic}|${row.difficulty}`;
          const prev = grouped.get(key);
          if (prev) prev.count += 1;
          else grouped.set(key, { ...row, count: 1 });
        });

        const sortedGroups = Array.from(grouped.values()).sort((a, b) => b.count - a.count);
        const paged = sortedGroups.slice(offset, offset + limit);

        return jsonResponse(req, {
          data: paged,
          total_questions: count || 0,
          total_groups: sortedGroups.length,
          limit,
          offset,
        });
      }

      const { data, error, count } = await query.range(offset, offset + limit - 1);
      if (error) return errorResponse(req, error.message, 500);
      return jsonResponse(req, { data, total: count, limit, offset });
    }

    if (req.method === "POST") {
      const user = await getAuthenticatedUser(req);
      if (!user) return errorResponse(req, "Unauthorized", 401);
      const userIsAdmin = await hasRole(supabase, user.id, "admin");
      const userIsTeacher = await hasRole(supabase, user.id, "teacher");
      if (!userIsAdmin && !userIsTeacher) return errorResponse(req, "Forbidden", 403);

      const body = await req.json();
      const { subject, topic, difficulty, question_text, options, correct_answer, explanation } = body;

      if (!subject || !topic || !question_text || !Array.isArray(options) || correct_answer === undefined) {
        return errorResponse(req, "Missing required fields: subject, topic, question_text, options, correct_answer");
      }

      const insertPayload = {
        subject,
        topic,
        difficulty: difficulty || "medium",
        question_text,
        options,
        correct_answer,
        explanation: explanation || null,
        ...(userIsTeacher ? { created_by: user.id } : {}),
      };

      const { data, error } = await supabase
        .from("question_bank")
        .insert(insertPayload)
        .select("id, subject, topic, difficulty, question_text, options, correct_answer, explanation, created_at")
        .single();

      if (error) return errorResponse(req, error.message, 500);
      return jsonResponse(req, { data }, 201);
    }

    if (req.method === "PUT") {
      const user = await getAuthenticatedUser(req);
      if (!user) return errorResponse(req, "Unauthorized", 401);
      const userIsAdmin = await hasRole(supabase, user.id, "admin");
      const userIsTeacher = await hasRole(supabase, user.id, "teacher");
      if (!userIsAdmin && !userIsTeacher) return errorResponse(req, "Forbidden", 403);

      const body = await req.json();
      const { id, ...updateData } = body;
      if (!id) return errorResponse(req, "Missing question id");

      const { created_by: _createdBy, ...safeUpdateData } = updateData as Record<string, unknown>;

      let updateQuery = supabase
        .from("question_bank")
        .update(safeUpdateData)
        .eq("id", id);

      if (userIsTeacher && !userIsAdmin) {
        updateQuery = updateQuery.eq("created_by", user.id);
      }

      const { data, error } = await updateQuery
        .select("id, subject, topic, difficulty, question_text, options, correct_answer, explanation, created_at")
        .single();

      if (error) return errorResponse(req, error.message, 500);
      return jsonResponse(req, { data });
    }

    if (req.method === "DELETE") {
      const user = await getAuthenticatedUser(req);
      if (!user) return errorResponse(req, "Unauthorized", 401);
      const userIsAdmin = await hasRole(supabase, user.id, "admin");
      const userIsTeacher = await hasRole(supabase, user.id, "teacher");
      if (!userIsAdmin && !userIsTeacher) return errorResponse(req, "Forbidden", 403);

      const id = url.searchParams.get("id");
      if (!id) return errorResponse(req, "Missing question id");

      let deleteQuery = supabase.from("question_bank").delete().eq("id", id);
      if (userIsTeacher && !userIsAdmin) {
        deleteQuery = deleteQuery.eq("created_by", user.id);
      }

      const { error } = await deleteQuery;
      if (error) return errorResponse(req, error.message, 500);

      return jsonResponse(req, { success: true });
    }

    return errorResponse(req, "Method not allowed", 405);
  } catch (err) {
    console.error("Questions API error:", err);
    return errorResponse(req, "Internal server error", 500);
  }
});
