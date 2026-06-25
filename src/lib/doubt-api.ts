import { supabase } from "@/integrations/supabase/client";

export const doubtApi = {
  // Create a new doubt
  async createDoubt(data: {
    subject: string;
    topic?: string;
    title: string;
    description: string;
    question_id?: string;
    exam_attempt_id?: string;
    priority?: "low" | "medium" | "high";
    category_id?: string | null;
    subject_id?: string | null;
    chapter_id?: string | null;
  }) {
    const { data: doubt, error } = await supabase
      .from("doubts")
      .insert([
        {
          student_id: (await supabase.auth.getUser()).data.user?.id,
          ...data,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return doubt;
  },

  // Get all open doubts with pagination
  async getOpenDoubts(
    page: number = 1,
    pageSize: number = 10,
    subject?: string,
    priority?: string
  ) {
    let query = supabase
      .from("doubts")
      .select("*, doubt_answers(count)", { count: "exact" })
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (subject) query = query.eq("subject", subject);
    if (priority) query = query.eq("priority", priority);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data, total: count };
  },

  // Get user's own doubts
  async getMyDoubts(page: number = 1, pageSize: number = 10) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    const { data, count, error } = await supabase
      .from("doubts")
      .select("*, doubt_answers(count)", { count: "exact" })
      .eq("student_id", user.data.user.id)
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return { data, total: count };
  },

  // Get single doubt with answers
  async getDoubDetail(doubtId: string) {
    const { data, error } = await supabase
      .from("doubts")
      .select("*, doubt_answers(*, answerer_id)")
      .eq("id", doubtId)
      .single();

    if (error) throw error;

    // Increment view count
    await supabase
      .from("doubts")
      .update({ views: (data.views || 0) + 1 })
      .eq("id", doubtId);

    return data;
  },

  // Post answer to doubt
  async answerDoubt(doubtId: string, answerText: string) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("doubt_answers")
      .insert([
        {
          doubt_id: doubtId,
          answerer_id: user.data.user.id,
          answer_text: answerText,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark doubt as helpful
  async markHelpful(doubtId: string) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    const { error } = await supabase.from("doubt_helpful").insert([
      {
        user_id: user.data.user.id,
        doubt_id: doubtId,
      },
    ]);

    if (error && !error.message.includes("duplicate")) throw error;

    // Update helpful count
    const { data: count } = await supabase
      .from("doubt_helpful")
      .select("*", { count: "exact" })
      .eq("doubt_id", doubtId);

    await supabase
      .from("doubts")
      .update({ helpful_count: count?.length || 0 })
      .eq("id", doubtId);
  },

  // Bookmark a question
  async bookmarkQuestion(questionId: string) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("bookmarks")
      .insert([
        {
          user_id: user.data.user.id,
          question_id: questionId,
          bookmark_type: "question",
        },
      ])
      .select()
      .single();

    if (error && !error.message.includes("duplicate")) throw error;
    return data;
  },

  // Get bookmarked questions
  async getBookmarkedQuestions(page: number = 1, pageSize: number = 20) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    const { data, count, error } = await supabase
      .from("bookmarks")
      .select("question_bank(*)", { count: "exact" })
      .eq("user_id", user.data.user.id)
      .eq("bookmark_type", "question")
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return { data, total: count };
  },

  // Get student progress by subject
  async getProgressBySubject(subject: string) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("student_progress")
      .select("*")
      .eq("user_id", user.data.user.id)
      .eq("subject", subject);

    if (error) throw error;
    return data;
  },

  // Update progress stats (called after each exam)
  async updateProgressStats(
    subject: string,
    topic: string,
    isCorrect: boolean
  ) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    const { data: existing } = await supabase
      .from("student_progress")
      .select("*")
      .eq("user_id", user.data.user.id)
      .eq("subject", subject)
      .eq("topic", topic)
      .single();

    if (existing) {
      const newTotal = existing.total_attempts + 1;
      const newCorrect = existing.correct_attempts + (isCorrect ? 1 : 0);
      const accuracy = (newCorrect / newTotal) * 100;

      await supabase
        .from("student_progress")
        .update({
          total_attempts: newTotal,
          correct_attempts: newCorrect,
          accuracy,
          last_attempt_at: new Date().toISOString(),
          strength: accuracy >= 70,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("student_progress").insert([
        {
          user_id: user.data.user.id,
          subject,
          topic,
          total_attempts: 1,
          correct_attempts: isCorrect ? 1 : 0,
          accuracy: isCorrect ? 100 : 0,
          strength: isCorrect,
        },
      ]);
    }
  },

  // Update doubt status
  async updateDoubtStatus(
    doubtId: string,
    status: "open" | "answered" | "resolved" | "closed"
  ) {
    const { data, error } = await supabase
      .from("doubts")
      .update({
        status,
        resolved_at: status === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", doubtId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
