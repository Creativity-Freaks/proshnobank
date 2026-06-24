import { supabase } from "@/integrations/supabase/client";

/**
 * Site content API — drives the dynamic marketing/landing sections.
 * Content is stored in the `site_content` table keyed by section name
 * (hero, stats, features, why_choose, testimonials, faq).
 *
 * All reads are public (RLS allows select to everyone); writes are admin-only.
 */
export const contentApi = {
  /** Fetch a single content section by key. Returns null when missing. */
  async get<T = unknown>(key: string): Promise<T | null> {
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      console.log("[v0] contentApi.get error for", key, error.message);
      return null;
    }
    return (data?.value as T) ?? null;
  },

  /** Fetch all content sections at once as a keyed map. */
  async getAll(): Promise<Record<string, unknown>> {
    const { data, error } = await supabase.from("site_content").select("key, value");
    if (error) {
      console.log("[v0] contentApi.getAll error", error.message);
      return {};
    }
    const map: Record<string, unknown> = {};
    (data ?? []).forEach((row: { key: string; value: unknown }) => {
      map[row.key] = row.value;
    });
    return map;
  },

  /** Admin: upsert a content section. */
  async set(key: string, value: unknown): Promise<void> {
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
  },
};
