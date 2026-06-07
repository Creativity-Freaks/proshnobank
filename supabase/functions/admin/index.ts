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
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function err(req: Request, message: string, status = 400) {
  return json(req, { error: message }, status);
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

async function requireAdmin(req: Request, supabase: ReturnType<typeof createClient>) {
  const user = await getUser(req);
  if (!user) return { user: null, error: err(req, "Unauthorized", 401) };

  // 1. Check if user is among VITE_ADMIN_EMAILS
  const adminEmails = (Deno.env.get("VITE_ADMIN_EMAILS") || Deno.env.get("VITE_ADMIN_MAIL") || "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  if (user.email && adminEmails.includes(user.email.toLowerCase())) {
     return { user, error: null };
  }

  // 2. Fetch all user_roles for the user
  const { data: rolesData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  
  const roles = (rolesData || []).map(r => r.role);
  if (roles.includes("admin")) {
    return { user, error: null };
  }

  // 3. Fallback to app_settings configured admin access role
  const { data: settings } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "admin_access_role")
    .maybeSingle();

  const requiredRole = (settings?.value as Record<string, string>)?.role || "admin";
  if (roles.includes(requiredRole)) {
    return { user, error: null };
  }

  // Include context in the 403 so the frontend knows exactly why it was rejected
  const reason = `Email: ${user.email}, Roles: ${roles.join(",")}, Required: ${requiredRole}`;
  return { user: null, error: err(req, "Forbidden. Details: " + reason, 403) };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req) });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";

  try {
    // All admin endpoints require admin role
    const { user, error: authErr } = await requireAdmin(req, supabase);
    if (authErr) return authErr;

    // ======================== STATS ========================
    if (req.method === "GET" && action === "stats") {
      const [questionsRes, attemptsRes, templatesRes, usersRes, liveRes] = await Promise.all([
        supabase.from("question_bank").select("id", { count: "exact", head: true }),
        supabase.from("exam_attempts").select("id, user_id, score, max_score, correct_answers, total_questions, created_at"),
        supabase.from("exam_templates").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("live_exam_events").select("id", { count: "exact", head: true }),
      ]);

      const attempts = attemptsRes.data || [];
      const roles = usersRes.data || [];
      const uniqueUsers = new Set(roles.map((r: { user_id: string }) => r.user_id));
      const totalExams = attempts.length;
      const totalCorrect = attempts.reduce((s: number, a: { correct_answers: number }) => s + a.correct_answers, 0);
      const totalQ = attempts.reduce((s: number, a: { total_questions: number }) => s + a.total_questions, 0);

      // Recent activity (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const recentAttempts = attempts.filter((a: { created_at: string }) => a.created_at >= weekAgo);

      // Role breakdown
      const roleCounts: Record<string, number> = {};
      roles.forEach((r: { role: string }) => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });

      // Subject breakdown from attempts
      const subjectCounts: Record<string, number> = {};
      attempts.forEach((a: { subject?: string }) => {
        const s = (a as Record<string, unknown>).subject as string || "unknown";
        subjectCounts[s] = (subjectCounts[s] || 0) + 1;
      });

      return json(req, {
        data: {
          total_questions: questionsRes.count || 0,
          total_attempts: totalExams,
          total_templates: templatesRes.count || 0,
          total_users: uniqueUsers.size,
          total_live_exams: liveRes.count || 0,
          avg_accuracy: totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0,
          recent_attempts: recentAttempts.length,
          role_breakdown: roleCounts,
          subject_breakdown: subjectCounts,
        },
      });
    }

    // ======================== USERS ========================
    if (req.method === "GET" && action === "users") {
      const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 200);
      const offset = Math.max(0, Number(url.searchParams.get("offset") || "0"));
      const roleFilter = url.searchParams.get("role");
      const search = url.searchParams.get("search")?.toLowerCase() || "";

      // Get all roles
      let rolesQuery = supabase.from("user_roles").select("user_id, role, created_at");
      if (roleFilter && roleFilter !== "all") {
        rolesQuery = rolesQuery.eq("role", roleFilter);
      }
      const { data: roles, error: rolesErr } = await rolesQuery;
      if (rolesErr) return err(req, rolesErr.message, 500);

      // Group by user
      const userMap = new Map<string, { user_id: string; roles: string[]; created_at: string }>();
      (roles || []).forEach((r: { user_id: string; role: string; created_at: string }) => {
        const existing = userMap.get(r.user_id);
        if (existing) {
          existing.roles.push(r.role);
        } else {
          userMap.set(r.user_id, { user_id: r.user_id, roles: [r.role], created_at: r.created_at });
        }
      });

      const allUsers = Array.from(userMap.values());

      // Get user metadata from auth and batch enrollments in parallel
      const mappedUsers = await Promise.all(
        allUsers.map(async (u) => {
          try {
            const [{ data: authData }, { data: enrollments }] = await Promise.all([
              supabase.auth.admin.getUserById(u.user_id),
              supabase
                .from("exam_batch_enrollments")
                .select("batch_id, exam_batches(id, title, price)")
                .eq("user_id", u.user_id)
            ]);
            
            const user = authData?.user;
            type EnrollmentRow = {
              batch_id?: string;
              exam_batches?: { id?: string; title?: string; price?: number } | null;
            };
            const purchased_batches = ((enrollments || []) as EnrollmentRow[]).map((e) => ({
                id: e.exam_batches?.id,
                title: e.exam_batches?.title,
                price: e.exam_batches?.price
            })).filter((b) => b.id);

            return {
              ...u,
              email: user?.email || "",
              phone: user?.phone || user?.user_metadata?.phone || "",
              name: user?.user_metadata?.full_name || user?.user_metadata?.name || "",
              avatar_url: user?.user_metadata?.avatar_url || "",
              last_sign_in: user?.last_sign_in_at || null,
              is_suspended: !!user?.banned_until,
              is_restricted: !!user?.user_metadata?.is_restricted,
              purchased_batches
            };
          } catch {
            return { ...u, email: "", phone: "", name: "", avatar_url: "", last_sign_in: null, is_suspended: false, is_restricted: false, purchased_batches: [] };
          }
        })
      );

      // Now filter by search query (name, email, phone)
      const filteredUsers = mappedUsers.filter(u => {
        if (!search) return true;
        return (u.name || "").toLowerCase().includes(search) || 
               (u.email || "").toLowerCase().includes(search) ||
               (u.phone || "").toLowerCase().includes(search);
      });

      const paged = filteredUsers.slice(offset, offset + limit);

      return json(req, { data: paged, total: filteredUsers.length });
    }

    // ======================== UPDATE ROLE ========================
    if (req.method === "PUT" && action === "role") {
      const body = await req.json();
      const { user_id: targetUserId, role, remove } = body;
      if (!targetUserId || !role) return err(req, "Missing user_id or role");

      // Prevent removing own admin role
      if (targetUserId === user!.id && role === "admin" && remove) {
        return err(req, "Cannot remove your own admin role");
      }

      if (remove) {
        const { error: delErr } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", targetUserId)
          .eq("role", role);
        if (delErr) return err(req, delErr.message, 500);
      } else {
        const { error: insErr } = await supabase
          .from("user_roles")
          .upsert({ user_id: targetUserId, role }, { onConflict: "user_id,role" });
        if (insErr) return err(req, insErr.message, 500);
      }

      return json(req, { success: true });
    }

    
    // ======================== RESTRICT USER ========================
    if (req.method === "PUT" && action === "restrict") {
      const body = await req.json();
      const { user_id: targetUserId, restrict } = body;
      if (!targetUserId) return err(req, "Missing user_id");

      const { data: userObj, error: uErr } = await supabase.auth.admin.getUserById(targetUserId);
      if (uErr) return err(req, uErr.message, 500);

      const metadata = userObj.user.user_metadata || {};
      const { data, error } = await supabase.auth.admin.updateUserById(targetUserId, {
        user_metadata: { ...metadata, is_restricted: restrict === true }
      });
      if (error) return err(req, error.message, 500);
      return json(req, { success: true });
    }

    // ======================== SUSPEND USER ========================
    if (req.method === "PUT" && action === "suspend") {
      const body = await req.json();
      const { user_id: targetUserId, suspend } = body;
      if (!targetUserId) return err(req, "Missing user_id");
      
      const { data, error } = await supabase.auth.admin.updateUserById(targetUserId, {
        ban_duration: suspend ? "876000h" : "none"
      });
      if (error) return err(req, error.message, 500);
      return json(req, { success: true });
    }

    // ======================== CREATE USER (ADMIN/MODERATOR) ========================
    if (req.method === "POST" && action === "create-user") {
      const body = await req.json();
      const email = String((body as Record<string, unknown>)?.email || "").trim().toLowerCase();
      const password = String((body as Record<string, unknown>)?.password || "");
      const name = String((body as Record<string, unknown>)?.name || "").trim();
      const role = String((body as Record<string, unknown>)?.role || "").trim();

      if (!email || !password || !name) return err(req, "Missing name, email or password");
      if (role !== "admin" && role !== "moderator") return err(req, "Role must be admin or moderator");
      if (password.length < 6) return err(req, "Password must be at least 6 characters");

      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name, name },
      });

      if (createErr) return err(req, createErr.message, 400);
      const createdUserId = created?.user?.id;
      if (!createdUserId) return err(req, "User creation failed", 500);

      const { error: roleErr } = await supabase
        .from("user_roles")
        .upsert(
          [
            { user_id: createdUserId, role: "user" },
            { user_id: createdUserId, role },
          ],
          { onConflict: "user_id,role" },
        );
      if (roleErr) return err(req, roleErr.message, 500);

      return json(req, { data: { user_id: createdUserId } }, 201);
    }

    // ======================== EXAM TEMPLATES CRUD ========================
    if (action === "templates") {
      if (req.method === "GET") {
        const { data, error: tErr, count } = await supabase
          .from("exam_templates")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });
        if (tErr) return err(req, tErr.message, 500);
        return json(req, { data, total: count });
      }

      if (req.method === "POST") {
        const body = await req.json();
        const { title, category, description, question_count, duration_minutes, marks_per_question, negative_marks, difficulty, subjects, subjects_breakdown, topics, features } = body;
        if (!title || !category) return err(req, "Missing title or category");

        const { data, error: insErr } = await supabase
          .from("exam_templates")
          .insert({
            title, category,
            description: description || null,
            question_count: question_count || 0,
            duration_minutes: duration_minutes || 30,
            marks_per_question: marks_per_question || 1,
            negative_marks: negative_marks || 0,
            difficulty: difficulty || null,
            subjects: subjects || [],
            subjects_breakdown: subjects_breakdown || [],
            topics: topics || {},
            features: features || [],
          })
          .select("*")
          .single();
        if (insErr) return err(req, insErr.message, 500);
        return json(req, { data }, 201);
      }

      if (req.method === "PUT") {
        const body = await req.json();
        const { id, ...updateData } = body;
        if (!id) return err(req, "Missing template id");
        const { data, error: upErr } = await supabase
          .from("exam_templates")
          .update(updateData)
          .eq("id", id)
          .select("*")
          .single();
        if (upErr) return err(req, upErr.message, 500);
        return json(req, { data });
      }

      if (req.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return err(req, "Missing template id");
        const { error: delErr } = await supabase.from("exam_templates").delete().eq("id", id);
        if (delErr) return err(req, delErr.message, 500);
        return json(req, { success: true });
      }
    }

    // ======================== LIVE EXAMS CRUD ========================
    if (action === "live-exams") {
      if (req.method === "GET") {
        const { data, error: lErr } = await supabase
          .from("live_exam_events")
          .select("*, exam_templates(id, title, category)")
          .order("start_time", { ascending: false });
        if (lErr) return err(req, lErr.message, 500);
        return json(req, { data });
      }

      if (req.method === "POST") {
        const body = await req.json();
        const { template_id, start_time, prize, status } = body;
        if (!template_id || !start_time) return err(req, "Missing template_id or start_time");
        const { data, error: insErr } = await supabase
          .from("live_exam_events")
          .insert({ template_id, start_time, prize: prize || null, status: status || "upcoming" })
          .select("*, exam_templates(id, title, category)")
          .single();
        if (insErr) return err(req, insErr.message, 500);
        return json(req, { data }, 201);
      }

      if (req.method === "PUT") {
        const body = await req.json();
        const { id, ...updateData } = body;
        if (!id) return err(req, "Missing event id");
        const { data, error: upErr } = await supabase
          .from("live_exam_events")
          .update(updateData)
          .eq("id", id)
          .select("*, exam_templates(id, title, category)")
          .single();
        if (upErr) return err(req, upErr.message, 500);
        return json(req, { data });
      }

      if (req.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return err(req, "Missing event id");
        const { error: delErr } = await supabase.from("live_exam_events").delete().eq("id", id);
        if (delErr) return err(req, delErr.message, 500);
        return json(req, { success: true });
      }
    }

    // ======================== SUBJECTS (derived from question_bank) ========================
    if (req.method === "GET" && action === "subjects") {
      const { data, error: sErr } = await supabase
        .from("question_bank")
        .select("subject, topic, difficulty");
      if (sErr) return err(req, sErr.message, 500);

      const subjectMap = new Map<string, { topics: Set<string>; count: number }>();
      (data || []).forEach((row: { subject: string; topic: string }) => {
        const existing = subjectMap.get(row.subject);
        if (existing) {
          existing.topics.add(row.topic);
          existing.count += 1;
        } else {
          subjectMap.set(row.subject, { topics: new Set([row.topic]), count: 1 });
        }
      });

      const subjects = Array.from(subjectMap.entries()).map(([name, info]) => ({
        name,
        topics: Array.from(info.topics),
        question_count: info.count,
      }));

      return json(req, { data: subjects });
    }

    return err(req, "Invalid action or method");
  } catch (e) {
    console.error("Admin API error:", e);
    return err(req, "Internal server error", 500);
  }
});
