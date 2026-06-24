import { supabase } from "@/integrations/supabase/client";

// ============ SUBCATEGORIES ============
export async function getSubcategoriesByCategory(categoryId: string) {
  try {
    const { data } = await supabase
      .from("category_subcategories")
      .select("*")
      .eq("category_id", categoryId)
      .order("order_index", { ascending: true });
    return data || [];
  } catch (error) {
    console.error("[v0] Failed to fetch subcategories:", error);
    return [];
  }
}

export async function createSubcategory(
  categoryId: string,
  name: string,
  description?: string,
  iconName?: string
) {
  try {
    const { data } = await supabase
      .from("category_subcategories")
      .insert([{ category_id: categoryId, name, description, icon_name: iconName }])
      .select()
      .single();
    return data;
  } catch (error) {
    console.error("[v0] Failed to create subcategory:", error);
    throw error;
  }
}

export async function updateSubcategory(
  subcategoryId: string,
  updates: any
) {
  try {
    const { data } = await supabase
      .from("category_subcategories")
      .update(updates)
      .eq("id", subcategoryId)
      .select()
      .single();
    return data;
  } catch (error) {
    console.error("[v0] Failed to update subcategory:", error);
    throw error;
  }
}

export async function deleteSubcategory(subcategoryId: string) {
  try {
    await supabase
      .from("category_subcategories")
      .delete()
      .eq("id", subcategoryId);
  } catch (error) {
    console.error("[v0] Failed to delete subcategory:", error);
    throw error;
  }
}

// ============ CHAPTERS ============
export async function getChaptersBySubject(subjectId: string) {
  try {
    const { data } = await supabase
      .from("chapters")
      .select("*")
      .eq("subject_id", subjectId)
      .order("order_index", { ascending: true });
    return data || [];
  } catch (error) {
    console.error("[v0] Failed to fetch chapters:", error);
    return [];
  }
}

export async function createChapter(
  subjectId: string,
  name: string,
  description?: string
) {
  try {
    const { data } = await supabase
      .from("chapters")
      .insert([{ subject_id: subjectId, name, description }])
      .select()
      .single();
    return data;
  } catch (error) {
    console.error("[v0] Failed to create chapter:", error);
    throw error;
  }
}

export async function updateChapter(
  chapterId: string,
  updates: any
) {
  try {
    const { data } = await supabase
      .from("chapters")
      .update(updates)
      .eq("id", chapterId)
      .select()
      .single();
    return data;
  } catch (error) {
    console.error("[v0] Failed to update chapter:", error);
    throw error;
  }
}

export async function deleteChapter(chapterId: string) {
  try {
    await supabase.from("chapters").delete().eq("id", chapterId);
  } catch (error) {
    console.error("[v0] Failed to delete chapter:", error);
    throw error;
  }
}

// ============ HIERARCHICAL QUERIES ============
export async function getFullHierarchy() {
  try {
    const { data: categories } = await supabase
      .from("exam_categories")
      .select(
        `
        id,
        name,
        description,
        icon_name,
        category_subcategories (
          id,
          name,
          description,
          icon_name,
          subjects (
            id,
            name,
            description,
            chapters (
              id,
              name,
              description
            )
          )
        )
      `
      )
      .order("order_index", { ascending: true });
    return categories || [];
  } catch (error) {
    console.error("[v0] Failed to fetch full hierarchy:", error);
    return [];
  }
}

export async function getQuestionsWithHierarchy(
  categoryId?: string,
  subcategoryId?: string,
  subjectId?: string,
  chapterId?: string
) {
  try {
    let query = supabase
      .from("question_bank")
      .select(
        `
        *,
        chapters(id, name, subject_id),
        subjects(id, name, category_id),
        category_subcategories(id, name, category_id),
        exam_categories(id, name)
      `
      );

    if (categoryId) {
      query = query.eq("exam_categories.id", categoryId);
    }
    if (subcategoryId) {
      query = query.eq("category_subcategories.id", subcategoryId);
    }
    if (subjectId) {
      query = query.eq("subjects.id", subjectId);
    }
    if (chapterId) {
      query = query.eq("chapter_id", chapterId);
    }

    const { data } = await query.limit(100);
    return data || [];
  } catch (error) {
    console.error("[v0] Failed to fetch questions with hierarchy:", error);
    return [];
  }
}
