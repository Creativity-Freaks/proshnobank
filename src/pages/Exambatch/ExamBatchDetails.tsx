import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";

type ExamBatch = Tables<"exam_batches">;

const fallbackBatchesBySlug: Record<string, ExamBatch[]> = {
  ssc: [
    {
      id: "fallback-batch-ssc-1",
      title: "SSC 2026 সম্পূর্ণ প্রস্তুতি",
      description: "SSC পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি - সকল বিষয়",
      duration_days: 180,
      start_date: null,
      seats: 0,
      price: 599,
      status: "published",
      created_at: new Date(0).toISOString(),
      category_id: "fallback-ssc",
      subcategory_id: "fallback-ssc-2026",
      template_id: null,
    },
  ],
  hsc: [
    {
      id: "fallback-batch-hsc-1",
      title: "HSC 2026 Science Batch",
      description: "HSC বিজ্ঞান বিভাগের সম্পূর্ণ প্রস্তুতি",
      duration_days: 365,
      start_date: null,
      seats: 0,
      price: 799,
      status: "published",
      created_at: new Date(0).toISOString(),
      category_id: "fallback-hsc",
      subcategory_id: "fallback-hsc-science",
      template_id: null,
    },
  ],
  admission: [
    {
      id: "fallback-batch-admission-1",
      title: "ভর্তি পরীক্ষা - কম্বো ব্যাচ",
      description: "মেডিকেল/ইঞ্জিনিয়ারিং/বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি",
      duration_days: 240,
      start_date: null,
      seats: 0,
      price: 999,
      status: "published",
      created_at: new Date(0).toISOString(),
      category_id: "fallback-admission",
      subcategory_id: "fallback-admission-university",
      template_id: null,
    },
  ],
  medical: [
    {
      id: "fallback-batch-medical-1",
      title: "মেডিকেল ভর্তি ২০২৬",
      description: "MBBS ভর্তি পরীক্ষার জন্য সেরা প্রস্তুতি",
      duration_days: 240,
      start_date: null,
      seats: 0,
      price: 1299,
      status: "published",
      created_at: new Date(0).toISOString(),
      category_id: "fallback-medical",
      subcategory_id: "fallback-medical-mat",
      template_id: null,
    },
  ],
  engineering: [
    {
      id: "fallback-batch-engineering-1",
      title: "ইঞ্জিনিয়ারিং ভর্তি ২০২৬",
      description: "BUET, CUET, KUET সহ সকল ইঞ্জিনিয়ারিং ভর্তি",
      duration_days: 240,
      start_date: null,
      seats: 0,
      price: 1099,
      status: "published",
      created_at: new Date(0).toISOString(),
      category_id: "fallback-engineering",
      subcategory_id: "fallback-engineering-2026",
      template_id: null,
    },
  ],
  university: [
    {
      id: "fallback-batch-university-1",
      title: "বিশ্ববিদ্যালয় ভর্তি - ক ইউনিট",
      description: "ঢাবি, জাবি, রাবি ক ইউনিট সম্পূর্ণ প্রস্তুতি",
      duration_days: 180,
      start_date: null,
      seats: 0,
      price: 899,
      status: "published",
      created_at: new Date(0).toISOString(),
      category_id: "fallback-university",
      subcategory_id: "fallback-university-2026",
      template_id: null,
    },
  ],
  job: [
    {
      id: "fallback-batch-job-1",
      title: "BCS প্রিলিমিনারি ২০২৬",
      description: "৪৭তম BCS প্রিলিমিনারি সম্পূর্ণ প্রস্তুতি",
      duration_days: 365,
      start_date: null,
      seats: 0,
      price: 1499,
      status: "published",
      created_at: new Date(0).toISOString(),
      category_id: "fallback-job",
      subcategory_id: null,
      template_id: null,
    },
  ],
  chakri: [
    {
      id: "fallback-batch-job-1",
      title: "BCS প্রিলিমিনারি ২০২৬",
      description: "৪৭তম BCS প্রিলিমিনারি সম্পূর্ণ প্রস্তুতি",
      duration_days: 365,
      start_date: null,
      seats: 0,
      price: 1499,
      status: "published",
      created_at: new Date(0).toISOString(),
      category_id: "fallback-job",
      subcategory_id: null,
      template_id: null,
    },
  ],
};

type BatchExtra = {
  categoryName: string | null;
  subcategoryName: string | null;
  templateTitle: string | null;
};

function formatPriceBDT(value: number | null): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return "ফ্রি";
  return `BDT ${Math.trunc(amount)}`;
}

export default function ExamBatchDetails() {
  const params = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const slug = typeof params.slug === "string" ? params.slug : "";
  const batchId = typeof params.batchId === "string" ? params.batchId : "";

  const backTo = slug ? `/batches/${slug}` : "/batches";

  const fallbackBatch = (fallbackBatchesBySlug[slug] || []).find((b) => b.id === batchId) || null;

  const {
    data: batch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["exam-batch-details", batchId],
    enabled: Boolean(batchId) && !fallbackBatch,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exam_batches")
        .select("*")
        .eq("id", batchId)
        .maybeSingle();

      if (error) throw error;
      return data as ExamBatch | null;
    },
  });

  const resolvedBatch = fallbackBatch ?? batch;

  const { data: extra } = useQuery({
    queryKey: ["exam-batch-details-extra", resolvedBatch?.category_id, resolvedBatch?.subcategory_id, resolvedBatch?.template_id],
    enabled: Boolean(resolvedBatch) && !fallbackBatch,
    queryFn: async () => {
      const result: BatchExtra = { categoryName: null, subcategoryName: null, templateTitle: null };

      if (!resolvedBatch) return result;

      const tasks: Array<Promise<void>> = [];

      if (resolvedBatch.category_id) {
        tasks.push(
          (async () => {
            try {
              const { data } = await supabase
                .from("exam_categories")
                .select("name")
                .eq("id", resolvedBatch.category_id)
                .maybeSingle();
              result.categoryName = (data as { name?: string } | null)?.name ?? null;
            } catch {
              result.categoryName = null;
            }
          })(),
        );
      }

      if (resolvedBatch.subcategory_id) {
        tasks.push(
          (async () => {
            try {
              const { data } = await supabase
                .from("exam_categories")
                .select("name")
                .eq("id", resolvedBatch.subcategory_id)
                .maybeSingle();
              result.subcategoryName = (data as { name?: string } | null)?.name ?? null;
            } catch {
              result.subcategoryName = null;
            }
          })(),
        );
      }

      if (resolvedBatch.template_id) {
        tasks.push(
          (async () => {
            try {
              const { data } = await supabase
                .from("exam_templates")
                .select("title")
                .eq("id", resolvedBatch.template_id)
                .maybeSingle();
              result.templateTitle = (data as { title?: string } | null)?.title ?? null;
            } catch {
              result.templateTitle = null;
            }
          })(),
        );
      }

      await Promise.all(tasks);
      return result;
    },
    staleTime: 60_000,
  });

  usePageMeta({
    title: resolvedBatch?.title ? `${resolvedBatch.title} — ব্যাচ বিস্তারিত` : "ব্যাচ বিস্তারিত",
    description: "এক্সাম ব্যাচের বিস্তারিত দেখুন এবং ভর্তি করুন।",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-bengali">
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if ((isError && !fallbackBatch) || !resolvedBatch) {
    return (
      <div className="min-h-screen bg-background font-bengali">
        <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> ব্যাচসমূহ
              </Link>
              <h1 className="mt-4 text-2xl md:text-3xl font-bold text-foreground">ব্যাচ পাওয়া যায়নি</h1>
              <p className="mt-2 text-muted-foreground">এই ব্যাচটি এখন উপলব্ধ নয়।</p>
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
                <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-background/75 hover:text-background">
                  <ArrowLeft className="h-4 w-4" /> ব্যাচসমূহ
                </Link>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-background">{resolvedBatch.title}</h1>
                    <p className="mt-2 text-background/80">
                      {resolvedBatch.description || "এই ব্যাচের বিস্তারিত শীঘ্রই যোগ হবে"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {extra?.categoryName ? (
                        <Badge variant="secondary" className="bg-background/10 text-background border border-background/10">
                          {extra.categoryName}
                        </Badge>
                      ) : null}
                      {extra?.subcategoryName ? (
                        <Badge variant="secondary" className="bg-background/10 text-background border border-background/10">
                          {extra.subcategoryName}
                        </Badge>
                      ) : null}
                      {extra?.templateTitle ? (
                        <Badge variant="secondary" className="bg-background/10 text-background border border-background/10">
                          {extra.templateTitle}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-background/10 border border-background/10 p-4 text-center">
                    <div className="text-xs text-background/75">ফি</div>
                    <div className="mt-1 text-2xl font-bold text-background">{formatPriceBDT(resolvedBatch.price)}</div>
                    <div className="mt-1 text-xs text-background/75">সিট: {resolvedBatch.seats}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-bold text-foreground">ব্যাচ ইনফো</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-4 w-4" /> মেয়াদ
                  </div>
                  <div className="mt-1 font-semibold text-foreground">{resolvedBatch.duration_days} দিন</div>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-4 w-4" /> শুরু
                  </div>
                  <div className="mt-1 font-semibold text-foreground">{resolvedBatch.start_date || "—"}</div>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="text-xs text-muted-foreground">স্ট্যাটাস</div>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {resolvedBatch.status}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="text-xs text-muted-foreground">আইডি</div>
                  <div className="mt-1 font-mono text-xs text-foreground break-all">{resolvedBatch.id}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-bold text-foreground">ভর্তি</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                ভর্তি করতে লগইন প্রয়োজন। লগইন থাকলে এই ব্যাচে ভর্তি হবে।
              </p>
              <Button
                variant="hero"
                size="lg"
                className="w-full mt-5"
                onClick={async () => {
                  if (!user) {
                    toast({
                      title: "লগইন প্রয়োজন",
                      description: "ভর্তি করতে আগে লগইন করুন।",
                      variant: "destructive",
                    });
                    navigate("/login");
                    return;
                  }

                  if (fallbackBatch) {
                    toast({
                      title: "ভর্তি করা যাচ্ছে না",
                      description: "এই ব্যাচটি এখন ডেমো মোডে আছে। ডাটাবেসে ব্যাচ যোগ হলে ভর্তি চালু হবে।",
                      variant: "destructive",
                    });
                    return;
                  }

                  try {
                    const { data, error } = await supabase.functions.invoke("enrollments", {
                      body: { action: "enroll", batch_id: resolvedBatch.id },
                    });

                    if (error) {
                      const msg = error.message || "ভর্তি করতে সমস্যা হয়েছে।";
                      if (msg.toLowerCase().includes("no seats")) {
                        toast({ title: "সিট নেই", description: "এই ব্যাচের সিট শেষ।", variant: "destructive" });
                        return;
                      }

                      if (msg.toLowerCase().includes("unauthorized")) {
                        toast({ title: "লগইন প্রয়োজন", description: "ভর্তি করতে আগে লগইন করুন।", variant: "destructive" });
                        navigate("/login");
                        return;
                      }

                      toast({ title: "ত্রুটি", description: msg, variant: "destructive" });
                      return;
                    }

                    if (data && typeof data === "object" && (data as { ok?: boolean }).ok === true) {
                      toast({
                        title: "ভর্তি সফল",
                        description: "তুমি সফলভাবে এই ব্যাচে ভর্তি হয়েছো।",
                      });
                      return;
                    }

                    toast({
                      title: "ভর্তি সফল",
                      description: "তুমি সফলভাবে এই ব্যাচে ভর্তি হয়েছো।",
                    });
                  } catch (e: unknown) {
                    const message = e instanceof Error ? e.message : "ভর্তি করতে সমস্যা হয়েছে।";
                    toast({ title: "ত্রুটি", description: message, variant: "destructive" });
                  }
                }}
              >
                ভর্তি করুন
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
