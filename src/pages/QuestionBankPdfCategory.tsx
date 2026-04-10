import type { ComponentType } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Briefcase, FileText, GraduationCap, Loader2 } from "lucide-react";

type ProshnobankPdfCategory = "ssc" | "hsc" | "admission" | "chakri";

type ProshnobankPdfRow = {
  id: string;
  title: string;
  category: ProshnobankPdfCategory;
  storage_path: string;
  file_name: string;
  created_at: string;
};

const categoryConfig: Record<ProshnobankPdfCategory, {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
}> = {
  ssc: {
    title: "SSC PDF প্রশ্নব্যাংক",
    subtitle: "এসএসসি প্রশ্নপত্র PDF দেখো",
    icon: GraduationCap,
  },
  hsc: {
    title: "HSC PDF প্রশ্নব্যাংক",
    subtitle: "এইচএসসি প্রশ্নপত্র PDF দেখো",
    icon: GraduationCap,
  },
  admission: {
    title: "ভর্তি PDF প্রশ্নব্যাংক",
    subtitle: "ভর্তি প্রস্তুতির PDF দেখো",
    icon: FileText,
  },
  chakri: {
    title: "চাকরি PDF প্রশ্নব্যাংক",
    subtitle: "চাকরি প্রস্তুতির PDF দেখো",
    icon: Briefcase,
  },
};

function isValidCategory(value: string | undefined): value is ProshnobankPdfCategory {
  return value === "ssc" || value === "hsc" || value === "admission" || value === "chakri";
}

export default function QuestionBankPdfCategory() {
  const params = useParams();
  const categoryParam = params.category;
  const { toast } = useToast();

  const category: ProshnobankPdfCategory | null = isValidCategory(categoryParam) ? categoryParam : null;

  usePageMeta({
    title: category ? categoryConfig[category].title : "PDF প্রশ্নব্যাংক",
    description: "ক্যাটাগরি অনুযায়ী প্রশ্নপত্র PDF দেখুন।",
  });

  const {
    data: pdfRows,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["proshnobank-pdfs", category],
    enabled: Boolean(category),
    queryFn: async () => {
      const query = (supabase as unknown as any)
        .from("proshnobank_pdfs")
        .select("id,title,category,storage_path,file_name,created_at")
        .eq("category", category)
        .order("created_at", { ascending: false })
        .limit(100);

      const { data: rows, error } = await query;
      if (error) throw error;
      return (rows || []) as ProshnobankPdfRow[];
    },
  });

  const handleOpenPdf = async (storagePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("proshnobank-pdfs")
        .createSignedUrl(storagePath, 60);

      if (error) throw error;
      if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "PDF খুলতে সমস্যা হয়েছে।";
      toast({ title: "ত্রুটি", description: message, variant: "destructive" });
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-background font-bengali">
        <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Link to="/question-bank" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> প্রশ্নব্যাংক
              </Link>
              <h1 className="mt-4 text-2xl md:text-3xl font-bold text-foreground">ভুল ক্যাটাগরি</h1>
              <p className="mt-2 text-muted-foreground">SSC, HSC, ভর্তি অথবা চাকরি ক্যাটাগরি সিলেক্ট করুন।</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const Icon = categoryConfig[category].icon;

  return (
    <div className="min-h-screen bg-background font-bengali">
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link to="/question-bank" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> প্রশ্নব্যাংক
            </Link>

            <div className="mt-6 flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{categoryConfig[category].title}</h1>
                <p className="mt-2 text-muted-foreground">{categoryConfig[category].subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-foreground mb-2">PDF লোড করা যায়নি</h3>
              <p className="text-muted-foreground">কিছুক্ষণ পরে আবার চেষ্টা করো</p>
            </div>
          ) : (pdfRows || []).length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">কোনো PDF পাওয়া যায়নি</h3>
              <p className="text-muted-foreground">শিগগিরই নতুন প্রশ্নপত্র যোগ হবে</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(pdfRows || []).map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-border bg-card p-5 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">{p.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground truncate">{p.file_name}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleOpenPdf(p.storage_path)}>
                    দেখুন
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
