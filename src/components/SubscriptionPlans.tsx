import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check, X, GraduationCap, Building2, ArrowRight,
  ShieldCheck, Headphones, Zap,
} from "lucide-react";
import { subscriptionApi } from "@/lib/subscription-api";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
const POPULAR: Record<string, boolean> = { basic_student: true, coaching_standard: true };
const HIGHLIGHT: Record<string, boolean> = { premium_student: true, coaching_pro: true };

export default function SubscriptionPlans() {
  const [tab, setTab] = useState<"student" | "teacher">("student");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlanType, setCurrentPlanType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      subscriptionApi.getPlans(),
      subscriptionApi.getCurrentSubscription(),
    ]).then(([data, current]) => {
      setPlans((data as Plan[]) || []);
      if (current) setCurrentPlanType((current as any).subscription_plans?.plan_type ?? null);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const studentPlans = plans.filter((p) => STUDENT_TYPES.includes(p.plan_type));
  const teacherPlans = plans.filter((p) => TEACHER_TYPES.includes(p.plan_type));
  const visiblePlans = tab === "student" ? studentPlans : teacherPlans;

  const getPrice = (plan: Plan) => {
    if (plan.plan_type === "premium_student") return { amount: "৳৯৯৯", sub: "/বছর", note: "বার্ষিক বিলিং" };
    if (plan.price_monthly === 0) return { amount: "বিনামূল্যে", sub: "", note: "" };
    return { amount: `৳${plan.price_monthly.toLocaleString()}`, sub: "/মাস", note: "মাসিক বিলিং" };
  };

  const handleSelect = async (plan: Plan) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }

    if (plan.price_monthly === 0 && plan.plan_type !== "premium_student") {
      navigate("/register"); return;
    }

    setSubscribing(plan.id);
    try {
      const cycle = plan.plan_type === "premium_student" ? "yearly" : "monthly";
      await supabase.from("user_subscriptions")
        .update({ status: "cancelled", cancel_at: new Date().toISOString() })
        .eq("user_id", user.id).eq("status", "active");
      const { error } = await supabase.from("user_subscriptions").insert({
        user_id: user.id,
        plan_id: plan.id,
        status: "active",
        billing_cycle: cycle,
        started_at: new Date().toISOString(),
      });
      if (error) throw error;
      setCurrentPlanType(plan.plan_type);
      toast({ title: "সফল!", description: `${plan.name} প্ল্যান সক্রিয় হয়েছে।` });
    } catch (e: any) {
      toast({ title: "ত্রুটি", description: e?.message, variant: "destructive" });
    } finally {
      setSubscribing(null);
    }
  };

  const studentRows = [
    { label: "প্র্যাকটিস পরীক্ষা", fn: (p: Plan) => p.plan_type === "free_student" ? "১০টি/মাস" : "আনলিমিটেড" },
    { label: "লাইভ পরীক্ষায় অংশ", fn: (p: Plan) => p.max_live_exams_per_month == null ? "আনলিমিটেড" : p.max_live_exams_per_month === 0 ? false : `${p.max_live_exams_per_month}টি/মাস` },
    { label: "সন্দেহ জমা", fn: (p: Plan) => p.plan_type === "free_student" ? "৩টি/মাস" : p.plan_type === "basic_student" ? "২০টি/মাস" : "আনলিমিটেড" },
    { label: "ব্যাচ এনরোলমেন্ট", fn: (p: Plan) => p.plan_type === "free_student" ? false : p.plan_type === "basic_student" ? "১টি (active)" : "Yes (unlimited)" },
    { label: "পিডিএফ লাইব্রেরি", fn: (p: Plan) => p.plan_type === "free_student" ? "সীমিত" : "সম্পূর্ণ" },
    { label: "পারফরমেন্স অ্যানালিটিক্স", fn: (p: Plan) => p.plan_type === "free_student" ? "বেসিক" : p.plan_type === "basic_student" ? "পূর্ণ" : "পূর্ণ + AI প্রেডিকশন" },
    { label: "OMR গ্রেডিং", fn: (p: Plan) => p.omr_grading },
  ];

  const teacherRows = [
    { label: "প্রশ্ন আপলোড লিমিট", fn: (p: Plan) => p.question_upload_limit === 0 ? "Unlimited" : `${p.question_upload_limit.toLocaleString()}টি` },
    { label: "পরীক্ষা টেমপ্লেট", fn: (p: Plan) => p.plan_type === "teacher_basic" ? "২০" : p.plan_type === "coaching_standard" ? "১০০" : "Unlimited" },
    { label: "লাইভ পরীক্ষা/মাস", fn: (p: Plan) => p.max_live_exams_per_month == null ? "Unlimited" : `${p.max_live_exams_per_month}টি` },
    { label: "ব্যাচ প্রোগ্রাম", fn: (p: Plan) => p.plan_type === "teacher_basic" ? "২টি active" : p.plan_type === "coaching_standard" ? "১০টি active" : "Unlimited" },
    { label: "শিক্ষার্থী ম্যানেজ", fn: (p: Plan) => p.batch_student_limit === 0 ? "Unlimited" : `Up to ${p.batch_student_limit.toLocaleString()}` },
    { label: "কাস্টম ব্র্যান্ডিং", fn: (p: Plan) => p.plan_type === "coaching_pro" },
    { label: "OMR শিট গ্রেডিং", fn: (p: Plan) => p.omr_grading },
    { label: "শেয়ারযোগ্য লিংক", fn: (p: Plan) => p.plan_type === "coaching_pro" ? "Yes + Custom URL" : p.plan_type === "teacher_basic" ? true : true },
    { label: "সাপোর্ট", fn: (p: Plan) => p.plan_type === "teacher_basic" ? "Email" : p.plan_type === "coaching_standard" ? "Priority Email" : "Dedicated Manager" },
  ];

  const rows = tab === "student" ? studentRows : teacherRows;

  const renderCell = (val: string | boolean) => {
    if (typeof val === "boolean") {
      return val
        ? <Check className="w-4 h-4 text-green-500 mx-auto" />
        : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />;
    }
    return <span className="text-sm">{val}</span>;
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-wide font-medium">
            সাবস্ক্রিপশন প্ল্যান
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
            তোমার প্রয়োজন অনুযায়ী প্ল্যান বেছে নাও
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            শিক্ষার্থী থেকে বড় কোচিং সেন্টার — সবার জন্য আলাদা সুবিধামতো প্ল্যান।
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-muted rounded-xl p-1 gap-1">
            <button
              onClick={() => setTab("student")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "student" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              শিক্ষার্থী <span className="hidden sm:inline">(B2C)</span>
            </button>
            <button
              onClick={() => setTab("teacher")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "teacher" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              শিক্ষক / কোচিং <span className="hidden sm:inline">(B2B)</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
              {visiblePlans.map((plan) => {
                const price = getPrice(plan);
                const isHighlight = HIGHLIGHT[plan.plan_type];
                const isPopular = POPULAR[plan.plan_type];
                const isCurrent = currentPlanType === plan.plan_type;

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-2xl border transition-all ${
                      isHighlight
                        ? "bg-primary border-primary shadow-xl shadow-primary/25 text-primary-foreground"
                        : isCurrent
                        ? "bg-card border-primary/50 shadow-md"
                        : "bg-card border-border hover:border-primary/30 hover:shadow-md"
                    }`}
                  >
                    {isPopular && !isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-amber-500 text-white text-xs px-3 shadow-sm">জনপ্রিয়</Badge>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-green-500 text-white text-xs px-3 shadow-sm">বর্তমান প্ল্যান</Badge>
                      </div>
                    )}

                    <div className="p-6 flex-1">
                      <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isHighlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {plan.name}
                      </p>
                      <p className={`text-sm mb-5 ${isHighlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {plan.description}
                      </p>

                      <div className="flex items-baseline gap-1 mb-1">
                        <span className={`text-4xl font-bold ${isHighlight ? "text-primary-foreground" : "text-foreground"}`}>
                          {price.amount}
                        </span>
                        {price.sub && (
                          <span className={`text-sm ${isHighlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {price.sub}
                          </span>
                        )}
                      </div>
                      {price.note && (
                        <p className={`text-xs mb-5 ${isHighlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {price.note}
                        </p>
                      )}

                      <ul className="space-y-2.5 mt-4">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isHighlight ? "text-primary-foreground" : "text-green-500"}`} />
                            <span className={`text-sm leading-snug ${isHighlight ? "text-primary-foreground/90" : "text-foreground/80"}`}>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6 pt-0">
                      <Button
                        onClick={() => handleSelect(plan)}
                        disabled={isCurrent || subscribing === plan.id}
                        className={`w-full rounded-xl font-medium ${
                          isCurrent
                            ? "opacity-60 cursor-not-allowed"
                            : isHighlight
                            ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {subscribing === plan.id ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            প্রক্রিয়াকরণ...
                          </span>
                        ) : isCurrent ? (
                          "বর্তমান প্ল্যান"
                        ) : plan.plan_type.includes("free") ? (
                          <span className="flex items-center gap-1.5">বিনামূল্যে শুরু <ArrowRight className="w-4 h-4" /></span>
                        ) : (
                          <span className="flex items-center gap-1.5">এখনই শুরু করো <ArrowRight className="w-4 h-4" /></span>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison table */}
            <div className="rounded-2xl border border-border overflow-hidden mb-12">
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground text-sm">বিস্তারিত বৈশিষ্ট্য তুলনা</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium min-w-44">বৈশিষ্ট্য</th>
                      {visiblePlans.map((p) => (
                        <th key={p.id} className="px-4 py-3 text-center text-foreground font-semibold">{p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className={`border-b border-border/40 ${i % 2 === 0 ? "bg-muted/10" : ""}`}>
                        <td className="px-6 py-3 text-muted-foreground font-medium">{row.label}</td>
                        {visiblePlans.map((p) => (
                          <td key={p.id} className="px-4 py-3 text-center">
                            {renderCell(row.fn(p))}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="px-6 py-4" />
                      {visiblePlans.map((p) => (
                        <td key={p.id} className="px-4 py-4 text-center">
                          <Button
                            size="sm"
                            variant={HIGHLIGHT[p.plan_type] ? "default" : "outline"}
                            className="rounded-lg text-xs"
                            onClick={() => handleSelect(p)}
                            disabled={currentPlanType === p.plan_type}
                          >
                            {currentPlanType === p.plan_type ? "বর্তমান" : "বেছে নাও"}
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {[
                { icon: ShieldCheck, title: "নিরাপদ পেমেন্ট", desc: "আপনার পেমেন্ট সম্পূর্ণ নিরাপদ ও এনক্রিপ্টেড" },
                { icon: Zap, title: "তাৎক্ষণিক সক্রিয়করণ", desc: "পেমেন্টের পরেই প্ল্যান সক্রিয় হয়ে যাবে" },
                { icon: Headphones, title: "২৪/৭ সাপোর্ট", desc: "যেকোনো সমস্যায় আমরা সবসময় পাশে আছি" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ note */}
            <p className="text-center text-muted-foreground text-sm">
              যেকোনো প্রশ্নের জন্য{" "}
              <a href="mailto:support@proshnobank.com" className="text-primary font-medium hover:underline">
                support@proshnobank.com
              </a>{" "}
              এ যোগাযোগ করুন অথবা{" "}
              <Link to="/" className="text-primary font-medium hover:underline">হোম পেজে ফিরে যান</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
