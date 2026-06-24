import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MessageCircleQuestion,
  ImagePlus,
  CheckCircle2,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: MessageCircleQuestion,
    title: "প্রশ্ন পাঠান",
    desc: "টেক্সটে লিখুন অথবা বইয়ের পাতার ছবি তুলে পাঠান",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Clock,
    title: "শিক্ষক দেখেন",
    desc: "বিষয়ভিত্তিক শিক্ষক দ্রুত আপনার ডাউট রিভিউ করেন",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Star,
    title: "সেরা উত্তর পান",
    desc: "বিস্তারিত ব্যাখ্যা সহ উত্তর পান এবং সহপাঠীদের উত্তরও দেখুন",
    color: "bg-green-100 text-green-600",
  },
];

const highlights = [
  "টেক্সট ও ছবি উভয়ে প্রশ্ন করার সুবিধা",
  "শিক্ষক ও সহপাঠী উভয়ই উত্তর দেবেন",
  "সেরা উত্তর হাইলাইট করে রাখা হয়",
  "বিষয় ও টপিক অনুযায়ী প্রশ্ন ফিল্টার করুন",
  "সহায়ক ভোট দিয়ে সেরা উত্তর বেছে নিন",
  "পুরোনো প্রশ্নের উত্তর সবাই দেখতে পারে",
];

const DoubtMarketingSection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/5" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-secondary/5" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section label */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bengali font-medium mb-5">
            <MessageCircleQuestion className="w-4 h-4" />
            ডাউট সমাধান
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-bengali text-foreground mb-4 text-balance">
            কোনো প্রশ্ন আটকে গেছে?{" "}
            <span className="text-primary">সরাসরি জিজ্ঞেস করো</span>
          </h2>
          <p className="text-muted-foreground font-bengali max-w-xl mx-auto text-base leading-relaxed">
            টেক্সটে লেখো বা বইয়ের পাতার ছবি পাঠাও — শিক্ষক ও সহপাঠীরা উত্তর দেবেন।
            তোমার সব ডাউট এক জায়গায় সমাধান হবে।
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: steps */}
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold font-bengali text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground font-bengali leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link to="/doubts">
                <Button className="gap-2 font-bengali">
                  ডাউট সেকশনে যাও
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="font-bengali gap-2">
                  <ImagePlus className="w-4 h-4" />
                  প্ল্যান দেখুন
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: highlight list */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h3 className="font-bold font-bengali text-foreground text-lg mb-6">
              ডাউট সমাধানে যা পাবে
            </h3>
            <ul className="space-y-3">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-bengali text-foreground/80 leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>

            {/* Mock doubt card */}
            <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-medium font-bengali">উন্মুক্ত</span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bengali">পদার্থবিজ্ঞান</span>
              </div>
              <p className="text-sm font-semibold font-bengali text-foreground mb-1">
                নিউটনের তৃতীয় সূত্র কি রকেটে কাজ করে?
              </p>
              <p className="text-xs text-muted-foreground font-bengali line-clamp-2">
                রকেট মহাকাশে শূন্যের মধ্যে যায় তাহলে ধাক্কা দেওয়ার কিছু নেই, তাহলে কীভাবে...
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-bengali">
                <span className="flex items-center gap-1">
                  <MessageCircleQuestion className="w-3 h-3" /> ৩ উত্তর
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> সেরা উত্তর আছে
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoubtMarketingSection;
