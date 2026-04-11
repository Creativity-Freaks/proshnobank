import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const defaultDevOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];
const configuredOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "")
  .split(",")
  .map((o: string) => o.trim())
  .filter(Boolean);
const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultDevOrigins;

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
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

async function getUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const anonClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await anonClient.auth.getUser(token);
  if (error || !data?.user?.id) return null;
  return data.user.id;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return errorResponse(req, "Method not allowed", 405);
  }

  const userId = await getUserId(req);
  if (!userId) {
    return errorResponse(req, "Unauthorized", 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const action = typeof payload.action === "string" ? payload.action : "";
  const batchId = typeof payload.batch_id === "string" ? payload.batch_id : "";

  if (action !== "enroll") {
    return errorResponse(req, "Invalid action", 400);
  }

  if (!batchId) {
    return errorResponse(req, "batch_id is required", 400);
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Basic guard: batch must exist and be published.
  const { data: batchRow, error: batchErr } = await supabase
    .from("exam_batches")
    .select("id,status,seats")
    .eq("id", batchId)
    .maybeSingle();

  if (batchErr) return errorResponse(req, batchErr.message, 500);
  if (!batchRow) return errorResponse(req, "Batch not found", 404);
  if (batchRow.status !== "published") return errorResponse(req, "Batch not available", 400);

  // If seats > 0, enforce capacity.
  const seats = Number(batchRow.seats ?? 0);
  if (Number.isFinite(seats) && seats > 0) {
    const { count, error: countErr } = await supabase
      .from("exam_batch_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("batch_id", batchId)
      .eq("status", "enrolled");

    if (countErr) return errorResponse(req, countErr.message, 500);
    const enrolledCount = Number(count ?? 0);
    if (enrolledCount >= seats) return errorResponse(req, "No seats available", 409);
  }

  // Create enrollment (idempotent).
  const { error: insertErr } = await supabase
    .from("exam_batch_enrollments")
    .upsert({ user_id: userId, batch_id: batchId, status: "enrolled" }, { onConflict: "user_id,batch_id" });

  if (insertErr) return errorResponse(req, insertErr.message, 500);

  return jsonResponse(req, { ok: true, status: "enrolled" }, 200);
});
