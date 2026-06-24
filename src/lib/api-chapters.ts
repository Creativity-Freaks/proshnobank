import { supabase } from "@/integrations/supabase/client";

export interface Chapter {
  id: string;
  subject_id: string;
  chapter_number: number;
  chapter_name_bn: string;
  chapter_name_en?: string;
  topics: ChapterTopic[];
  display_order: number;
}

export interface ChapterTopic {
  id: string;
  topic_name_bn: string;
  topic_name_en?: string;
}

/**
 * Fetch all chapters for a specific subject from database
 * This is the single source of truth for chapters across the entire app
 */
export async function getChaptersFromDatabase(
  subjectId: string
): Promise<Chapter[]> {
  try {
    // Fetch chapters with their topics in one query
    const { data, error } = await supabase
      .from("chapters")
      .select(
        `
        id,
        subject_id,
        chapter_number,
        chapter_name_bn,
        chapter_name_en,
        display_order,
        chapter_topics (
          id,
          topic_name_bn,
          topic_name_en
        )
      `
      )
      .eq("subject_id", subjectId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[v0] Error fetching chapters from database:", error);
      return [];
    }

    return (
      data?.map((chapter: any) => ({
        id: chapter.id,
        subject_id: chapter.subject_id,
        chapter_number: chapter.chapter_number,
        chapter_name_bn: chapter.chapter_name_bn,
        chapter_name_en: chapter.chapter_name_en,
        display_order: chapter.display_order,
        topics: chapter.chapter_topics || [],
      })) || []
    );
  } catch (error) {
    console.error("[v0] Exception fetching chapters:", error);
    return [];
  }
}

/**
 * Fetch chapters for multiple subjects at once (for batch operations)
 */
export async function getChaptersForSubjects(
  subjectIds: string[]
): Promise<Record<string, Chapter[]>> {
  try {
    const { data, error } = await supabase
      .from("chapters")
      .select(
        `
        id,
        subject_id,
        chapter_number,
        chapter_name_bn,
        chapter_name_en,
        display_order,
        chapter_topics (
          id,
          topic_name_bn,
          topic_name_en
        )
      `
      )
      .in("subject_id", subjectIds)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[v0] Error fetching chapters batch:", error);
      return {};
    }

    // Group chapters by subject_id
    const result: Record<string, Chapter[]> = {};
    data?.forEach((chapter: any) => {
      if (!result[chapter.subject_id]) {
        result[chapter.subject_id] = [];
      }
      result[chapter.subject_id].push({
        id: chapter.id,
        subject_id: chapter.subject_id,
        chapter_number: chapter.chapter_number,
        chapter_name_bn: chapter.chapter_name_bn,
        chapter_name_en: chapter.chapter_name_en,
        display_order: chapter.display_order,
        topics: chapter.chapter_topics || [],
      });
    });

    return result;
  } catch (error) {
    console.error("[v0] Exception fetching chapters batch:", error);
    return {};
  }
}

/**
 * Add a new chapter (admin only)
 */
export async function addChapter(
  subjectId: string,
  chapterNumber: number,
  chapterNameBn: string,
  chapterNameEn?: string,
  displayOrder?: number
): Promise<Chapter | null> {
  try {
    const { data, error } = await supabase
      .from("chapters")
      .insert({
        subject_id: subjectId,
        chapter_number: chapterNumber,
        chapter_name_bn: chapterNameBn,
        chapter_name_en: chapterNameEn,
        display_order: displayOrder || chapterNumber,
      })
      .select();

    if (error) {
      console.error("[v0] Error adding chapter:", error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error("[v0] Exception adding chapter:", error);
    return null;
  }
}

/**
 * Update chapter information (admin only)
 */
export async function updateChapter(
  chapterId: string,
  updates: Partial<{
    chapter_name_bn: string;
    chapter_name_en: string;
    display_order: number;
    is_active: boolean;
  }>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("chapters")
      .update(updates)
      .eq("id", chapterId);

    if (error) {
      console.error("[v0] Error updating chapter:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[v0] Exception updating chapter:", error);
    return false;
  }
}

/**
 * Add a topic to a chapter (admin only)
 */
export async function addChapterTopic(
  chapterId: string,
  topicNameBn: string,
  topicNameEn?: string,
  displayOrder?: number
): Promise<ChapterTopic | null> {
  try {
    const { data, error } = await supabase
      .from("chapter_topics")
      .insert({
        chapter_id: chapterId,
        topic_name_bn: topicNameBn,
        topic_name_en: topicNameEn,
        display_order: displayOrder || 0,
      })
      .select();

    if (error) {
      console.error("[v0] Error adding topic:", error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error("[v0] Exception adding topic:", error);
    return null;
  }
}

/**
 * Delete a chapter (admin only) - will cascade delete topics
 */
export async function deleteChapter(chapterId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", chapterId);

    if (error) {
      console.error("[v0] Error deleting chapter:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[v0] Exception deleting chapter:", error);
    return false;
  }
}
