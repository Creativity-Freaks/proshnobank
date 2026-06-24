import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, GraduationCap, Building2, ArrowRight } from "lucide-react";
import { subscriptionApi } from "@/lib/subscription-api";

interface Plan {
  id: string;
  name: string;
  plan_type: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_live_exams_per_month: number | null;
  question_upload_limit: number;
  batch_student_limit: number;
  omr_grading: boolean;
  features: string[];
}

const STUDENT_TYPES = ["free_student", "basic_student", "premium_student"];
const TEACHER_TYPES = ["teacher_basic", "coaching_standard", "coaching_pro"];

const POPULAR: Record<string, boolean> = {
  basic_student: true,
  coaching_standard: true,
};

const HIGHLIGHT: Record<string, boolean> = {
  coaching_pro: true,
  premium_student: true,
};

export default function PricingSection() {
  const [tab, setTab] = useState<"student" | "teacher">("student");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionApi.getPlans().then((data) => {
      setPlans((data as Plan[]) || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const studentPlans = plans.filter((p) => STUDENT_TYPES.includes(p.plan_type));
  const teacherPlans = plans.filter((p) => TEACHER_TYPES.includes(p.plan_type));
  const visiblePlans = tab === "student" ? studentPlans : teacherPlans;

  const studentRows = [
    { label: "প্র্যাকটিস পরীক্ষা", key: (p: Plan) => p.plan_type === "free_student" ? "১০টি/মাস" : "আনলিমিটেড" },
    { label: "লাইভ পরীক্ষায় অংশ", key: (p: Plan) => p.max_live_exams_per_month == null ? "আনলিমিটেড" : p.max_live_exams_per_month === 0 ? "না" : `${p.max_live_exams_per_month}টি/মাস` },
    { label: "সন্দেহ জমা", key: (p: Plan) => p.plan_type === "free_student" ? "৩টি/মাস" : p.plan_type === "basic_student" ? "২০টি/মাস" : "আনলিমিটেড" },
    { label: "ব্যাচ এনরোলমেন্ট", key: (p: Plan) => p.plan_type === "free_student" ? false : p.plan_type === "basic_student" ? "১টি" : "আনলিমিটেড" },
    { label: "পিডিএফ লাইব্রেরি", key: (p: Plan) => p.plan_type === "free_student" ? "সীমিত" : "সম্পূর্ণ" },
    { label: "পারফরমেন্স অ্যানালিটিক্স", key: (p: Plan) => p.plan_type === "free_student" ? "বেসিক" : p.plan_type === "basic_student" ? "পূর্ণ" : "পূর্ণ + AI প্রেডিকশন" },
    { label: "OMR গ্রেডিং", key: (p: Plan) => p.omr_grading },
  ];

  const teacherRows = [
    { label: "প্রশ্ন আপলোড লিমিট", key: (p: Plan) => p.question_upload_limit === 0 ? "আনলিমিটেড" : `${p.question_upload_limit.toLocaleString()}টি` },
    { label: "পরীক্ষা টেমপ্লেট", key: (p: Plan) => p.plan_type === "teacher_basic" ? "২০টি" : p.plan_type === "coaching_standard" ? "১০০টি" : "আনলিমিটেড" },
    { label: "লাইভ পরীক্ষা/মাস", key: (p: Plan) => p.max_live_exams_per_month == null ? "আনলিমিটেড" : `${p.max_live_exams_per_month}টি` },
    { label: "ব্যাচ প্রোগ্রাম", key: (p: Plan) => p.plan_type === "teacher_basic" ? "২টি" : p.plan_type === "coaching_standard" ? "১০টি" : "আনলিমিটেড" },
    { label: "শিক্ষার্থী ম্যানেজ", key: (p: Plan) => p.batch_student_limit === 0 ? "আনলিমিটেড" : `${p.batch_student_limit.toLocaleString()} জন পর্যন্ত` },
    { label: "কাস্টম ব্র্যান্ডিং", key: (p: Plan) => p.plan_type === "coaching_pro" },
    { label: "OMR শিট গ্রেডিং", key: (p: Plan) => p.omr_grading },
    { label: "শেয়ারযোগ্য লিংক", key: (p: Plan) => p.plan_type === "coaching_pro" ? "Yes + Custom URL" : true },
    { label: "সাপোর্ট", key: (p: Plan) => p.plan_type === "teacher_basic" ? "ইমেইল" : p.plan_type === "coaching_standard" ? "প্রায়রিটি ইমেইল" : "ডেডিকেটেড ম্যানেজার" },
  ];

  const rows = tab === "student" ? studentRows : teacherRows;

  const getPrice = (plan: Plan) => {
    if (plan.plan_type === "premium_student") return { amount: "৳৯৯৯", sub: "/বছর" };
    if (plan.price_monthly === 0) return { amount: "বিনামূল্যে", sub: "" };
    return { amount: `৳${plan.price_monthly.toLocaleString("bn")}`, sub: "/মাস" };
  };

  const renderCell = (val: string | boolean) => {
    if (typeof val === "boolean") {
      return val
        ? <Check className="w-4 h-4 text-green-500 mx-auto" />
        : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
    }
    return <span className="text-sm text-foreground">{val}</span>;
  };

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium tracking-wide uppercase">
            মূল্য তালিকা
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
            তোমার প্রয়োজন অনুযায়ী প্ল্যান বেছে নাও
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            শিক্ষার্থী থেকে বড় কোচিং সেন্টার — সবার জন্য আলাদা সুবিধামতো প্ল্যান।
          </p>
        </div>

        {/* B2C / B2B toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-muted rounded-xl p-1 gap-1">
            <button
              onClick={() => setTab("student")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "student"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              শিক্ষার্থী (B2C)
            </button>
            <button
              onClick={() => setTab("teacher")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "teacher"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              শিক্ষক / কোচিং (B2B)
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Plan cards */}
            <div className={`grid gap-5 mb-12 ${visiblePlans.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"}`}>
              {visiblePlans.map((plan) => {
                const price = getPrice(plan);
                const isHighlight = HIGHLIGHT[plan.plan_type];
                const isPopular = POPULAR[plan.plan_type];
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-2xl border transition-all ${
                      isHighlight
                        ? "bg-primary border-primary shadow-lg shadow-primary/20 text-primary-foreground"
                        : "bg-card border-border hover:border-primary/40 hover:shadow-md"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-amber-500 text-white text-xs px-3 shadow">
                          জনপ্রিয়
                        </Badge>
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isHighlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {plan.name}
                      </p>
                      <p className={`text-sm mb-5 ${isHighlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {plan.description}
                      </p>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className={`text-4xl font-bold ${isHighlight ? "text-primary-foreground" : "text-foreground"}`}>
                          {price.amount}
                        </span>
                        {price.sub && (
                          <span className={`text-sm ${isHighlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {price.sub}
                          </span>
                        )}
                      </div>
                      <ul className="space-y-2.5">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isHighlight ? "text-primary-foreground" : "text-green-500"}`} />
                            <span className={`text-sm leading-snug ${isHighlight ? "text-primary-foreground/90" : "text-foreground/80"}`}>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-6 pt-0">
                      <Link to={plan.price_monthly === 0 && plan.plan_type !== "premium_student" ? "/register" : "/pricing"}>
                        <Button
                          className={`w-full rounded-xl ${
                            isHighlight
                              ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          }`}
                        >
                          {plan.plan_type.includes("free") ? "বিনামূল্যে শুরু করো" : "শুরু করো"}
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison table */}
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground text-sm">বিস্তারিত তুলনা</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium w-44">বৈশিষ্ট্য</th>
                      {visiblePlans.map((p) => (
                        <th key={p.id} className="px-4 py-3 text-center text-foreground font-semibold">{p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-muted/20" : ""}`}>
                        <td className="px-6 py-3 text-muted-foreground font-medium">{row.label}</td>
                        {visiblePlans.map((p) => (
                          <td key={p.id} className="px-4 py-3 text-center">
                            {renderCell(row.key(p))}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="px-6 py-4" />
                      {visiblePlans.map((p) => (
                        <td key={p.id} className="px-4 py-4 text-center">
                          <Link to={p.price_monthly === 0 && p.plan_type !== "premium_student" ? "/register" : "/pricing"}>
                            <Button size="sm" variant={HIGHLIGHT[p.plan_type] ? "default" : "outline"} className="rounded-lg text-xs">
                              বেছে নাও
                            </Button>
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom CTA */}
            <p className="text-center text-muted-foreground text-sm mt-8">
              আরও তথ্যের জন্য{" "}
              <Link to="/pricing" className="text-primary font-medium hover:underline">
                সম্পূর্ণ প্রাইসিং পেজ দেখুন
              </Link>{" "}
              অথবা{" "}
              <a href="mailto:support@proshnobank.com" className="text-primary font-medium hover:underline">
                আমাদের সাথে যোগাযোগ করুন
              </a>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
