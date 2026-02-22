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

async function getAuthenticatedClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await anonClient.auth.getUser(token);
  if (error || !data?.user) return null;

  return { supabase, userId: data.user.id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Path: /questions or /questions/{id}
  // After edge function routing, pathParts might be just [] or [id]
  const questionId = pathParts.length > 0 ? pathParts[pathParts.length - 1] : null;

  const publicClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // GET - List/search questions (public)
    if (req.method === "GET") {
      const subject = url.searchParams.get("subject");
      const topic = url.searchParams.get("topic");
      const difficulty = url.searchParams.get("difficulty");
      const search = url.searchParams.get("search");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");
      const id = url.searchParams.get("id");

      // Get single question by id
      if (id) {
        const { data, error } = await publicClient
          .from("question_bank")
          .select("*")
          .eq("id", id)
          .single();
        if (error) return errorResponse("Question not found", 404);
        return jsonResponse({ data });
      }

      let query = publicClient
        .from("question_bank")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (subject && subject !== "all") query = query.eq("subject", subject);
      if (topic) query = query.eq("topic", topic);
      if (difficulty && difficulty !== "all") query = query.eq("difficulty", difficulty);
      if (search) query = query.ilike("question_text", `%${search}%`);

      const { data, error, count } = await query;
      if (error) return errorResponse(error.message, 500);

      return jsonResponse({ data, total: count, limit, offset });
    }

    // POST - Create question (admin only)
    if (req.method === "POST") {
      const auth = await getAuthenticatedClient(req);
      if (!auth) return errorResponse("Unauthorized", 401);

      // Check admin role
      const { data: roleData } = await auth.supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", auth.userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) return errorResponse("Forbidden: Admin access required", 403);

      const body = await req.json();
      const { subject, topic, difficulty, question_text, options, correct_answer, explanation } = body;

      if (!subject || !topic || !question_text || !options || correct_answer === undefined) {
        return errorResponse("Missing required fields: subject, topic, question_text, options, correct_answer");
      }

      const { data, error } = await auth.supabase
        .from("question_bank")
        .insert({ subject, topic, difficulty: difficulty || "medium", question_text, options, correct_answer, explanation: explanation || null })
        .select()
        .single();

      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ data }, 201);
    }

    // PUT - Update question (admin only)
    if (req.method === "PUT") {
      const auth = await getAuthenticatedClient(req);
      if (!auth) return errorResponse("Unauthorized", 401);

      const { data: roleData } = await auth.supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", auth.userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) return errorResponse("Forbidden", 403);

      const body = await req.json();
      const { id, ...updateData } = body;
      if (!id) return errorResponse("Missing question id");

      const { data, error } = await auth.supabase
        .from("question_bank")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ data });
    }

    // DELETE - Delete question (admin only)
    if (req.method === "DELETE") {
      const auth = await getAuthenticatedClient(req);
      if (!auth) return errorResponse("Unauthorized", 401);

      const { data: roleData } = await auth.supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", auth.userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) return errorResponse("Forbidden", 403);

      const id = url.searchParams.get("id");
      if (!id) return errorResponse("Missing question id");

      const { error } = await auth.supabase
        .from("question_bank")
        .delete()
        .eq("id", id);

      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ success: true });
    }

    return errorResponse("Method not allowed", 405);
  } catch (err) {
    console.error("Questions API error:", err);
    return errorResponse("Internal server error", 500);
  }
});
