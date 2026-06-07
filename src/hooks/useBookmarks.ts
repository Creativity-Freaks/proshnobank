import { useCallback, useMemo, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type BookmarkedQuestion = {
  id: string;
  question_text: string;
  options: string[];
  subject?: string;
  topic?: string;
  difficulty?: string;
  correct_answer?: number;
  explanation?: string;
  saved_at: string;
};

function isBookmark(value: unknown): value is BookmarkedQuestion {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.question_text === "string" && Array.isArray(v.options);
}

function readBookmarks(metadata: Record<string, unknown> | undefined): BookmarkedQuestion[] {
  const raw = metadata?.bookmarks;
  if (!Array.isArray(raw)) return [];
  return raw.filter(isBookmark);
}

export function useBookmarks() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const bookmarks = useMemo(() => readBookmarks(user?.user_metadata), [user?.user_metadata]);

  const ids = useMemo(() => new Set(bookmarks.map((b) => b.id)), [bookmarks]);

  const isBookmarked = useCallback((id: string) => ids.has(id), [ids]);

  const persist = useCallback(async (next: BookmarkedQuestion[]) => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { bookmarks: next } });
      if (error) throw error;
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const add = useCallback(
    async (question: Omit<BookmarkedQuestion, "saved_at">) => {
      if (ids.has(question.id)) return true;
      const entry: BookmarkedQuestion = { ...question, saved_at: new Date().toISOString() };
      return persist([entry, ...bookmarks]);
    },
    [bookmarks, ids, persist],
  );

  const remove = useCallback(
    async (id: string) => persist(bookmarks.filter((b) => b.id !== id)),
    [bookmarks, persist],
  );

  const toggle = useCallback(
    async (question: Omit<BookmarkedQuestion, "saved_at">) =>
      ids.has(question.id) ? remove(question.id) : add(question),
    [ids, add, remove],
  );

  return { bookmarks, isBookmarked, add, remove, toggle, saving };
}
