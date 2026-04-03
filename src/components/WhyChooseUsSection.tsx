import { CheckCircle2, Sparkles, ShieldCheck, Zap } from "lucide-react";

type WhyPoint = {
  title: string;
  description: string;
  icon?: typeof Sparkles;
};

const defaultPoints: WhyPoint[] = [
  {
    title: "প্র্যাকটিস + লাইভ এক্সাম",
    description: "প্রশ্নব্যাংক থেকে প্র্যাকটিস, তারপর লাইভ এক্সামে পারফরম্যান্স যাচাই—একই প্ল্যাটফর্মে।",
    icon: Zap,
  },
  {
    title: "শিক্ষকদের জন্য টুলস",
    description: "প্রশ্ন তৈরি, প্রশ্নপত্র সেট, শিডিউল এক্সাম ও আপলোড—সবকিছু দ্রুত ও সহজ।",
    icon: Sparkles,
  },
  {
    title: "রিপোর্ট ও লিডারবোর্ড",
    description: "স্কোর, র‍্যাঙ্কিং আর প্রগ্রেস ট্র্যাক করে নিজের দুর্বলতা ধরো।",
    icon: CheckCircle2,
  },
  {
    title: "বিশ্বস্ত ও নিরাপদ",
    description: "নির্ভরযোগ্য সার্ভিস, স্থিতিশীল এক্সাম এক্সপেরিয়েন্স এবং নিরাপদ ডাটা হ্যান্ডলিং।",
    icon: ShieldCheck,
  },
];

export default function WhyChooseUsSection({
  eyebrow = "কেন আমরা",
  title = "কেন প্রশ্নব্যাংক বেছে নেবেন?",
  subtitle = "শিক্ষার্থী আর শিক্ষকদের জন্য—একটা আধুনিক, দ্রুত ও নির্ভরযোগ্য প্ল্যাটফর্ম।",
  points = defaultPoints,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  points?: WhyPoint[];
}) {
  return (
    <section className="relative overflow-hidden py-16">
      {/* Themed background (no custom colors) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-background/0 via-background/0 to-background" />

      {/* Decorative SVG accents */}
      <svg
        className="pointer-events-none absolute -left-10 -top-10 -z-10 h-64 w-64 text-primary/10"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M42.4,-63.8C55.4,-56.9,66.8,-46.8,71.1,-34.7C75.4,-22.6,72.6,-8.5,69.4,5.1C66.2,18.8,62.6,32,54.1,42.3C45.6,52.6,32.1,60.1,17.3,64.8C2.5,69.4,-13.6,71.2,-28.1,66.4C-42.5,61.6,-55.3,50.1,-63.7,36.6C-72.1,23.1,-76.2,7.6,-74.7,-7.4C-73.2,-22.4,-66.2,-36.9,-55.4,-44.8C-44.6,-52.7,-30,-54,-16.6,-60.7C-3.2,-67.3,9,-79.2,22.8,-78.5C36.6,-77.8,52.1,-64.7,42.4,-63.8Z"
          transform="translate(100 100)"
          fill="currentColor"
        />
      </svg>

      <svg
        className="pointer-events-none absolute -right-16 bottom-0 -z-10 h-72 w-72 text-accent/10"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="10" opacity="0.7" />
        <circle cx="100" cy="100" r="38" stroke="currentColor" strokeWidth="8" opacity="0.5" />
      </svg>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary">{eyebrow}</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4">{title}</h2>
            <p className="text-muted-foreground mt-4 max-w-xl">{subtitle}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                দ্রুত সেটআপ
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                মোবাইল ফ্রেন্ডলি
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                অটোমেটেড ফ্লো
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                রেজাল্ট-ফোকাসড
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {points.map((p, idx) => {
              const Icon = p.icon ?? Sparkles;
              return (
                <div
                  key={idx}
                  className="group relative rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-500 hover:shadow-card hover:-translate-y-1 motion-reduce:transform-none animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="absolute right-4 top-4 rounded-full border border-border bg-background/70 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
                    #{String(idx + 1).padStart(2, "0")}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/10 transition-transform duration-500 group-hover:scale-[1.04]">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <div className="inline-flex items-center rounded-full border border-border bg-muted/30 px-3 py-1 text-[11px] text-muted-foreground">
                        Featured
                      </div>
                      <h3 className="mt-3 font-bold text-foreground leading-snug">{p.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="h-1.5 rounded-full bg-primary/15" />
                    <div className="h-1.5 rounded-full bg-primary/10" />
                    <div className="h-1.5 rounded-full bg-primary/5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
