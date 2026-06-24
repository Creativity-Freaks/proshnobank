import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePageMeta } from "@/hooks/usePageMeta";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Cog,
  GraduationCap,
  Loader2,
  Stethoscope,
} from "lucide-react";

type ExamCategory = Tables<"exam_categories">;
type ExamBatch = Tables<"exam_batches">;

type Icon = ComponentType<{ className?: string }>;

function iconForSlug(slug: string): Icon {
  switch (slug) {
    case "ssc":
    case "hsc":
      return GraduationCap;
    case "medical":
      return Stethoscope;
    case "engineering":
      return Cog;
    case "university":
      return Building2;
    case "job":
      return Briefcase;
    default:
      return BookOpen;
  }
}

function formatPriceBDT(value: number | null): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return "ফ্রি";
  return `BDT ${Math.trunc(amount)}`;
}

const fallbackCategoriesBySlug: Record<string, ExamCategory> = {};

const fallbackSubcategoriesByParentSlug: Record<string, ExamCategory[]> = {};

const fallbackBatchesBySlug: Record<string, ExamBatch[]> = {};

type ExamBatchesCategoryProps = {
  forcedSlug?: string;
  pathSlug?: string;
};

export default function ExamBatchesCategory({ forcedSlug, pathSlug }: ExamBatchesCategoryProps) {
  const params = useParams();
  const slugFromRoute = typeof params.slug === "string" ? params.slug : "";
  const slug = forcedSlug ?? slugFromRoute;
  const navigate = useNavigate();

  const isDedicatedPage = Boolean(forcedSlug);
  const urlSlug = pathSlug ?? slug;

  const ALL_SUBCATEGORIES = "all";

  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [subcategoryId, setSubcategoryId] = useState<string>("");

  useEffect(() => {
    setSubcategoryId("");
  }, [slug]);

  const { data: categoriesForTabs } = useQuery({
    queryKey: ["exam-categories-tabs"],
    enabled: !isDedicatedPage,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("exam_categories")
          .select("id,name,slug,parent_id")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .limit(200);

        if (error) throw error;
        const list = (data || []) as Array<Pick<ExamCategory, "id" | "name" | "slug" | "parent_id">>;
        const parents = list.filter((c) => c.parent_id == null);
        const display = parents.length > 0 ? parents : list;
        return display.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["exam-category", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exam_categories")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) return null;
      return (data as ExamCategory | null) ?? null;
    },
  });

  usePageMeta({
    title: category?.name ? `${category.name} ব্যাচ` : "এক্সাম ব্যাচ",
    description: "ক্যাটাগরি অনুযায়ী এক্সাম ব্যাচ দেখুন।",
  });

  const {
    data: batches,
    isLoading: batchesLoading,
    isError: batchesError,
  } = useQuery({
    queryKey: ["exam-batches", category?.id],
    enabled: Boolean(category?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exam_batches")
        .select("*")
        .eq("category_id", category!.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(60);

      if (error) return [] as ExamBatch[];
      return (data || []) as ExamBatch[];
    },
  });

  const { data: subcategories, isLoading: subcategoryLoading } = useQuery({
    queryKey: ["exam-subcategories", category?.id],
    enabled: Boolean(category?.id),
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("exam_categories")
          .select("*")
          .eq("is_active", true)
          .eq("parent_id", category!.id)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true })
          .limit(60);

        if (error) throw error;
        return (data || []) as ExamCategory[];
      } catch {
        return [] as ExamCategory[];
      }
    },
    staleTime: 60_000,
  });

  const Icon = iconForSlug(slug);
  const hasSubcategories = (subcategories || []).length > 0;

  const filterGridCols = hasSubcategories
    ? (isDedicatedPage ? "md:grid-cols-3" : "md:grid-cols-4")
    : (isDedicatedPage ? "md:grid-cols-2" : "md:grid-cols-3");

  const filteredBatches = useMemo(() => {
    const list = (batches || []) as ExamBatch[];
    const q = search.trim().toLowerCase();

    return list.filter((b) => {
      if (subcategoryId) {
        if (b.subcategory_id !== subcategoryId) return false;
      }

      if (q) {
        const haystack = `${b.title ?? ""} ${b.description ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      const price = Number(b.price ?? 0);
      const isFree = !Number.isFinite(price) || price <= 0;

      if (priceFilter === "free" && !isFree) return false;
      if (priceFilter === "paid" && isFree) return false;
      return true;
    });
  }, [batches, search, priceFilter, subcategoryId]);

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background font-bengali">
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background font-bengali">
        <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Link
                to="/batches"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> ব্যাচসমূহ
              </Link>
              <h1 className="mt-4 text-2xl md:text-3xl font-bold text-foreground">ক্যাটাগরি পাওয়া যায়নি</h1>
              <p className="mt-2 text-muted-foreground">এই ক্যাটাগরি এখন উপলব্ধ নয়।</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-bengali">
      <section className="pt-24 pb-10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-foreground/95 via-foreground/90 to-foreground/80 px-6 py-10 md:px-10">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
              <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
              <div className="pointer-events-none absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />

              <div className="relative">
                <Link
                  to="/batches"
                  className="inline-flex items-center gap-2 text-sm text-background/75 hover:text-background"
                >
                  <ArrowLeft className="h-4 w-4" /> ব্যাচসমূহ
                </Link>

                <div className="mt-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                  <div className="h-14 w-14 rounded-2xl bg-background/10 border border-background/10 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-background" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-background">{category.name}</h1>
                    {category.description ? (
                      <p className="mt-2 text-background/80">{category.description}</p>
                    ) : (
                      <p className="mt-2 text-background/80">এই ক্যাটাগরির সকল এক্সাম ব্যাচ দেখো</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className={`grid gap-3 ${filterGridCols}`}>
              {!isDedicatedPage ? (
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">ক্যাটাগরি</div>
                  <Select
                    value={slug}
                    onValueChange={(value) => {
                      if (!value || value === slug) return;
                      navigate(`/batches/${value}`);
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="ক্যাটাগরি বেছে নাও" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(categoriesForTabs || []).map((c) => (
                          <SelectItem key={c.id} value={c.slug}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {hasSubcategories ? (
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">সাব-ক্যাটাগরি</div>
                  <Select
                    value={subcategoryId || ALL_SUBCATEGORIES}
                    onValueChange={(value) => setSubcategoryId(value === ALL_SUBCATEGORIES ? "" : value)}
                    disabled={subcategoryLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="সব" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={ALL_SUBCATEGORIES}>সব</SelectItem>
                        {(subcategories || []).map((sc) => (
                          <SelectItem key={sc.id} value={sc.id}>
                            {sc.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div>
                <div className="mb-1 text-xs text-muted-foreground">সার্চ</div>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ব্যাচ খুঁজুন (নাম/বিবরণ)"
                  className="h-11"
                />
              </div>

              <div>
                <div className="mb-1 text-xs text-muted-foreground">ফিল্টার</div>
                <Select value={priceFilter} onValueChange={(v) => setPriceFilter(v as typeof priceFilter)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="ফিল্টার" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">সব</SelectItem>
                      <SelectItem value="free">ফ্রি</SelectItem>
                      <SelectItem value="paid">পেইড</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            </div>

            {batchesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : batchesError ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-foreground mb-2">ব্যাচ লোড করা যায়নি</h3>
              <p className="text-muted-foreground">কিছুক্ষণ পরে আবার চেষ্টা করো</p>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                {(batches || []).length > 0 ? "কোনো ব্যাচ মেলেনি" : "কোনো ব্যাচ পাওয়া যায়নি"}
              </h3>
              <p className="text-muted-foreground">
                {(batches || []).length > 0
                  ? "সার্চ/ফিল্টার পরিবর্তন করে আবার চেষ্টা করো"
                  : "শিগগিরই নতুন ব্যাচ যোগ হবে"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
                >
                  <div className="h-2 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/20" />
                  <div className="bg-gradient-to-br from-primary/15 via-background to-accent/15 p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2">{batch.title}</h3>
                    {batch.description ? (
                      <p className="text-muted-foreground text-sm">{batch.description}</p>
                    ) : (
                      <p className="text-muted-foreground text-sm">এই ব্যাচের বিস্তারিত শীঘ্রই যোগ হবে</p>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="rounded-xl border border-border p-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-4 w-4" /> মেয়াদ
                        </div>
                        <div className="mt-1 font-semibold text-foreground">{batch.duration_days} দিন</div>
                      </div>
                      <div className="rounded-xl border border-border p-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-4 w-4" /> শুরু
                        </div>
                        <div className="mt-1 font-semibold text-foreground">{batch.start_date || "—"}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-primary">{formatPriceBDT(batch.price)}</div>
                        <div className="text-xs text-muted-foreground">সিট: {batch.seats}</div>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {batch.status}
                      </Badge>
                    </div>

                    <Button variant="hero" className="w-full" asChild>
                      <Link to={`/batches/${urlSlug}/${batch.id}`}>বিস্তারিত দেখো</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </section>
    </div>
  );
}
