import { supabase } from "@/integrations/supabase/client";

export async function setupHierarchyTables() {
  try {
    console.log("[v0] Setting up hierarchy tables...");

    // Create subcategories table
    const { error: subcatError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS category_subcategories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          category_id UUID NOT NULL REFERENCES exam_categories(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          icon_name VARCHAR(50),
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(category_id, name)
        );
      `,
    });

    if (subcatError)
      console.warn("[v0] Subcategories table error:", subcatError);

    // Create chapters table
    const { error: chapError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS chapters (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(subject_id, name)
        );
      `,
    });

    if (chapError) console.warn("[v0] Chapters table error:", chapError);

    console.log("[v0] Hierarchy tables setup completed!");
  } catch (error) {
    console.error("[v0] Setup error:", error);
  }
}
