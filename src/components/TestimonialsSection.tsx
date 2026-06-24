import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSiteContent } from "@/hooks/useSiteContent";

type Testimonial = {
  name: string;
  role: "শিক্ষক" | "শিক্ষার্থী";
  institute?: string;
  quote: string;
  avatarUrl?: string;
};

const defaultItems: Testimonial[] = [
  {
    name: "সাদিয়া রহমান",
    role: "শিক্ষার্থী",
    institute: "HSC (Science)",
    quote:
      "লাইভ এক্সাম আর প্রশ্নব্যাংক দিয়ে নিয়মিত প্র্যাকটিস করতে পারি—ভুলগুলোও দ্রুত ধরতে পারি।",
  },
  {
    name: "আরিফুল ইসলাম",
    role: "শিক্ষার্থী",
    institute: "SSC",
    quote:
      "লিডারবোর্ড দেখে নিজের অবস্থান বুঝতে পারি। প্রতিদিন একটু করে এগোতে মোটিভেশন পাই।",
  },
  {
    name: "মাহবুব স্যার",
    role: "শিক্ষক",
    institute: "কোচিং সেন্টার",
    quote:
      "প্রশ্ন বানানো, প্রশ্নপত্র সেট করা আর শিডিউল এক্সাম—সবকিছু এক জায়গায় থাকায় কাজ অনেক সহজ।",
  },
  {
    name: "ফারহানা ম্যাডাম",
    role: "শিক্ষক",
    institute: "স্কুল",
    quote:
      "অনলাইনে দ্রুত পরীক্ষা নেওয়া যায়, আর রিপোর্ট দেখে ছাত্রদের দুর্বলতা ধরতে পারি।",
  },
  {
    name: "তানজিম হাসান",
    role: "শিক্ষার্থী",
    institute: "Admission",
    quote:
      "এখানে প্র্যাকটিস করার পর লাইভ এক্সামে আত্মবিশ্বাস বেড়েছে। প্রশ্নগুলো একদম টার্গেটেড লাগে।",
  },
  {
    name: "নাবিলা ইসলাম",
    role: "শিক্ষার্থী",
    institute: "University",
    quote:
      "মোবাইল থেকেই সহজে পরীক্ষা দিতে পারি। ইন্টারফেসটা ক্লিন, আর এক্সাম এক্সপেরিয়েন্স স্মুথ।",
  },
  {
    name: "রাশেদ স্যার",
    role: "শিক্ষক",
    institute: "কলেজ",
    quote:
      "প্রশ্ন সিলেক্ট করে প্রশ্নপত্র বানানোটা খুব দ্রুত। আমার স্টুডেন্টদের জন্য নিয়মিত এক্সাম নিতে পারি।",
  },
  {
    name: "নাজমা ম্যাডাম",
    role: "শিক্ষক",
    institute: "কোচিং",
    quote:
      "শিডিউল সেট করলেই বাকি কাজটা প্ল্যাটফর্ম সামলায়—সময় বাঁচে, আর ক্লাস ম্যানেজ করা সহজ হয়।",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export default function TestimonialsSection({
  title = "টেস্টিমোনিয়াল",
  subtitle = "শিক্ষক ও শিক্ষার্থীদের কথা",
  items = defaultItems,
  perPage = 4,
  cycleMs = 4500,
}: {
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
  perPage?: number;
  cycleMs?: number;
}) {
  const safePerPage = Math.max(1, Math.floor(perPage));

  // Pull dynamic testimonials from site_content; map stored {name,role,text,rating}
  // to the component's shape. Falls back to the passed-in items.
  const { data: content } = useSiteContent<{ items?: Array<Record<string, unknown>> }>(
    "testimonials",
    {},
  );
  const dynamicItems = useMemo<Testimonial[] | null>(() => {
    const raw = content?.items;
    if (!Array.isArray(raw) || raw.length === 0) return null;
    return raw.map((r) => ({
      name: String(r.name ?? ""),
      role: (String(r.role ?? "").includes("শিক্ষক") ? "শিক্ষক" : "শিক্ষার্থী") as Testimonial["role"],
      institute: r.institute ? String(r.institute) : (r.role ? String(r.role) : undefined),
      quote: String(r.quote ?? r.text ?? ""),
      avatarUrl: r.avatarUrl ? String(r.avatarUrl) : undefined,
    }));
  }, [content]);

  const effectiveItems = dynamicItems ?? items;
  const normalizedItems = useMemo(() => effectiveItems.filter(Boolean), [effectiveItems]);
  const canRotate = normalizedItems.length > safePerPage;

  const [startIndex, setStartIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const visibleItems = useMemo(() => {
    if (normalizedItems.length === 0) return [];
    const window: Testimonial[] = [];
    for (let i = 0; i < safePerPage; i++) {
      window.push(normalizedItems[(startIndex + i) % normalizedItems.length]);
    }
    return window;
  }, [normalizedItems, safePerPage, startIndex]);

  useEffect(() => {
    if (!canRotate) return;
    const id = window.setInterval(() => {
      setIsFading(true);
      window.setTimeout(() => {
        setStartIndex((prev) => (prev + safePerPage) % normalizedItems.length);
        setIsFading(false);
      }, 280);
    }, Math.max(2000, cycleMs));

    return () => window.clearInterval(id);
  }, [canRotate, cycleMs, normalizedItems.length, safePerPage]);

  return (
    <section className="py-16 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              {subtitle}
            </span>
          </h2>
          <p className="mt-3 text-background/70">{title}</p>
          <p className="mt-2 text-background/70 text-sm">
            স্কুল, কলেজ, এডমিশন ও জব প্রস্তুতির সকল প্রতিযোগিতামূলক পরীক্ষায় আমাদের শিক্ষার্থীরা যেভাবে এগিয়ে থাকে
          </p>
        </div>

        <div
          className={
            "grid md:grid-cols-2 gap-6 transition-all duration-300 ease-out " +
            (isFading
              ? "opacity-0 translate-y-2 motion-reduce:transform-none"
              : "opacity-100 translate-y-0")
          }
        >
          {visibleItems.map((t, idx) => (
            <div
              key={`${t.name}-${startIndex}-${idx}`}
              className="rounded-3xl bg-background text-foreground border border-primary/30 shadow-card"
            >
              <div className="p-6 md:p-7">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 rounded-2xl bg-muted border border-border">
                    <AvatarImage src={t.avatarUrl} alt={t.name} />
                    <AvatarFallback className="rounded-2xl bg-muted text-muted-foreground font-semibold">
                      {initials(t.name) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="text-xl font-bold leading-tight truncate">{t.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.role}
                      {t.institute ? ` • ${t.institute}` : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-5 text-muted-foreground leading-relaxed">
                  <span className="text-2xl align-top text-primary/70">“</span>
                  <span className="text-base">{t.quote}</span>
                  <span className="text-2xl align-bottom text-primary/70">”</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
