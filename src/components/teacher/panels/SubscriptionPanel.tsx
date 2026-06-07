import { Check, Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "ফ্রি",
    price: "৳০",
    period: "/মাস",
    features: ["প্রশ্ন তৈরী ও সংরক্ষণ", "সীমিত প্রশ্নপত্র জেনারেট", "বেসিক OMR মূল্যায়ন"],
  },
  {
    id: "premium",
    name: "প্রিমিয়াম",
    price: "৳৫০০",
    period: "/মাস",
    highlighted: true,
    features: [
      "আনলিমিটেড প্রশ্নপত্র + PDF",
      "OMR শিট তৈরী ও মূল্যায়ন",
      "অনলাইন লাইভ এক্সাম",
      "প্রতিষ্ঠান ব্র্যান্ডিং",
      "প্রায়োরিটি সাপোর্ট",
    ],
  },
  {
    id: "institution",
    name: "প্রতিষ্ঠান",
    price: "যোগাযোগ",
    period: "",
    features: ["একাধিক শিক্ষক একাউন্ট", "শিক্ষার্থী ম্যানেজমেন্ট", "কাস্টম রিপোর্ট", "ডেডিকেটেড সাপোর্ট"],
  },
];

export default function SubscriptionPanel() {
  const { user } = useAuth();
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const currentPlan = typeof metadata?.plan === "string" ? (metadata.plan as string) : "free";

  return (
    <div className="mt-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" /> সাবস্ক্রিপশন
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          বর্তমান প্ল্যান:{" "}
          <Badge variant="secondary" className="ml-1 capitalize">
            {currentPlan}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <Card
              key={plan.id}
              className={plan.highlighted ? "border-primary shadow-md" : undefined}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.name}</span>
                  {plan.highlighted ? <Badge>জনপ্রিয়</Badge> : null}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} disabled={isCurrent} asChild={!isCurrent}>
                  {isCurrent ? (
                    <span>বর্তমান প্ল্যান</span>
                  ) : (
                    <a href="mailto:info.proshnobank@gmail.com?subject=Subscription%20Upgrade">আপগ্রেড করুন</a>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
