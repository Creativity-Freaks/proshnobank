import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  BookOpen,
  Briefcase,
  Building2,
  Cog,
  GraduationCap,
  Stethoscope,
} from "lucide-react";

type Icon = ComponentType<{ className?: string }>;

function iconForSlug(slug: string): Icon {
  switch (slug) {
    case "ssc":
    case "hsc":
      return GraduationCap;
    case "admission":
      return Building2;
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

const gradients = [
  "from-primary/20 to-accent/10",
  "from-accent/20 to-primary/10",
  "from-primary/10 to-accent/20",
  "from-accent/10 to-primary/20",
] as const;

type BatchLandingCard = {
  id: string;
  name: string;
  description: string;
  slug: string;
  to: string;
};

const landingCards: BatchLandingCard[] = [
  {
    id: "landing-ssc",
    name: "SSC পরীক্ষা",
    slug: "ssc",
    description: "এসএসসি বোর্ড পরীক্ষার প্রস্তুতি",
    to: "/batches/ssc",
  },
  {
    id: "landing-hsc",
    name: "HSC পরীক্ষা",
    slug: "hsc",
    description: "এইচএসসি বোর্ড পরীক্ষার প্রস্তুতি",
    to: "/batches/hsc",
  },
  {
    id: "landing-admission",
    name: "ভর্তি পরীক্ষা",
    slug: "admission",
    description: "মেডিকেল, ইঞ্জিনিয়ারিং ও বিশ্ববিদ্যালয় ভর্তি",
    to: "/batches/admission",
  },
  {
    id: "landing-job",
    name: "চাকরি পরীক্ষা",
    slug: "job",
    description: "BCS, Bank, Primary সহ সব চাকরি",
    to: "/batches/chakri",
  },
];

export default function ExamBatches() {
  usePageMeta({
    title: "এক্সাম ব্যাচ",
    description: "ক্যাটাগরি অনুযায়ী তোমার জন্য সেরা এক্সাম ব্যাচ বেছে নাও।",
  });

  return (
    <div className="min-h-screen bg-background font-bengali">
      {/* Dark hero like screenshot */}
      <section className="pt-24 pb-10">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-foreground/95 via-foreground/90 to-foreground/80 px-6 py-10 md:px-10">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />

            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl mx-auto md:mx-0 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-background">
                  প্রিসেট <span className="text-primary">এক্সাম ক্যাটাগরি</span>
                </h1>
                <p className="mt-3 text-background/80">
                  স্কুল, কলেজ, এডমিশন ও চাকরি প্রস্তুতিতে সঠিক ক্যাটাগরি বেছে নাও
                </p>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-background/10 border border-background/10 flex items-center justify-center">
                  <GraduationCap className="h-7 w-7 text-background" />
                </div>
                <div className="h-14 w-14 rounded-2xl bg-background/10 border border-background/10 flex items-center justify-center">
                  <BookOpen className="h-7 w-7 text-background" />
                </div>
                <div className="h-14 w-14 rounded-2xl bg-background/10 border border-background/10 flex items-center justify-center">
                  <Briefcase className="h-7 w-7 text-background" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal category cards */}
      <section className="pb-14">
        <div className="container mx-auto px-4">
          <div className="mt-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {landingCards.map((c, idx) => {
              const Icon = iconForSlug(c.slug);
              const gradient = gradients[idx % gradients.length];
              return (
                <Link
                  key={c.id}
                  to={c.to}
                  className="group relative w-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient}`} />
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                  <div className="pointer-events-none absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />

                  <div className="relative flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-background/70 border border-border/60 flex items-center justify-center backdrop-blur">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-foreground truncate">{c.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground truncate">
                        {c.description || "এই ক্যাটাগরির সকল ব্যাচ দেখো"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
