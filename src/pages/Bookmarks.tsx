import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, BookOpen, Loader2, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getSubjectLabel } from "@/lib/subjects";

const difficultyMap: Record<string, string> = { easy: "সহজ", medium: "মধ্যম", hard: "কঠিন" };

const Bookmarks = () => {
  usePageMeta({
    title: "সেভ করা প্রশ্ন",
    description: "তোমার বুকমার্ক করা প্রশ্নগুলো এক জায়গায় দেখো ও রিভিশন করো।",
  });

  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { bookmarks, remove, saving } = useBookmarks();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookmarks;
    return bookmarks.filter(
      (b) =>
        b.question_text.toLowerCase().includes(q) ||
        (b.subject || "").toLowerCase().includes(q) ||
        (b.topic || "").toLowerCase().includes(q),
    );
  }, [bookmarks, search]);

  if (!authLoading && !user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background font-bengali">
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Bookmark className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">সেভ করা প্রশ্ন</h1>
              <p className="text-sm text-muted-foreground">{bookmarks.length}টি প্রশ্ন বুকমার্ক করা আছে</p>
            </div>
          </div>

          {bookmarks.length > 0 && (
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="সেভ করা প্রশ্ন খুঁজো..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {bookmarks.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center">
              <BookOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">এখনো কোনো প্রশ্ন সেভ করা হয়নি।</p>
              <p className="mt-1 text-sm text-muted-foreground">
                এক্সাম চলাকালীন প্রশ্নের পাশে “সেভ” বাটনে ক্লিক করে প্রশ্ন বুকমার্ক করো।
              </p>
              <Link to="/question-bank">
                <Button variant="hero" size="sm" className="mt-4">
                  প্রশ্নব্যাংকে যাও
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((b, idx) => (
                <div key={b.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {b.subject ? <Badge variant="secondary">{getSubjectLabel(b.subject)}</Badge> : null}
                      {b.topic ? <Badge variant="outline">{b.topic}</Badge> : null}
                      {b.difficulty ? (
                        <Badge variant="outline">{difficultyMap[b.difficulty] || b.difficulty}</Badge>
                      ) : null}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={saving}
                      onClick={() => remove(b.id)}
                      aria-label="Remove bookmark"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                  <h3 className="mb-3 font-semibold text-foreground">
                    {idx + 1}. {b.question_text}
                  </h3>
                  <ol className="grid gap-2 sm:grid-cols-2" type="A">
                    {b.options.map((opt, i) => {
                      const isCorrect = typeof b.correct_answer === "number" && b.correct_answer === i;
                      return (
                        <li
                          key={i}
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            isCorrect ? "border-green-500 bg-green-50 text-green-800" : "border-border"
                          }`}
                        >
                          <span className="mr-2 font-bold">{String.fromCharCode(2453 + i)}.</span>
                          {opt}
                        </li>
                      );
                    })}
                  </ol>
                  {b.explanation ? (
                    <p className="mt-3 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">ব্যাখ্যা: </span>
                      {b.explanation}
                    </p>
                  ) : null}
                </div>
              ))}
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  “{search}” এর সাথে মেলে এমন কোনো প্রশ্ন পাওয়া যায়নি।
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Bookmarks;
