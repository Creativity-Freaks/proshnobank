import { Check, Crown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type DbPlan = {
  id: string;
  name: string;
  slug: string;
  price_bdt: number;
  period: string;
  features: string[];
  is_highlighted: boolean;
  is_active: boolean;
  sort_order: number;
};

export default function SubscriptionPanel() {
  const { user } = useAuth();
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const currentPlan = typeof metadata?.plan === "string" ? (metadata.plan as string) : "free";

  const { data: plans = [], isLoading } = useQuery<DbPlan[]>({
    queryKey: ["subscription_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("id,name,slug,price_bdt,period,features,is_highlighted,is_active,sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DbPlan[];
    },
    staleTime: 5 * 60_000,
  });

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

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.slug === currentPlan;
            const priceLabel =
              plan.price_bdt === 0
                ? "৳০"
                : plan.price_bdt < 0
                ? "যোগাযোগ"
                : `৳${plan.price_bdt}`;
            const periodLabel = plan.period ? `/${plan.period}` : "";

            return (
              <Card
                key={plan.id}
                className={plan.is_highlighted ? "border-primary shadow-md" : undefined}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {plan.is_highlighted ? <Badge>জনপ্রিয়</Badge> : null}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{priceLabel}</span>
                    <span className="text-sm text-muted-foreground">{periodLabel}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-sm">
                    {(plan.features ?? []).map((f: string) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.is_highlighted ? "default" : "outline"}
                    disabled={isCurrent}
                    asChild={!isCurrent}
                  >
                    {isCurrent ? (
                      <span>বর্তমান প্ল্যান</span>
                    ) : (
                      <a href="mailto:info.proshnobank@gmail.com?subject=Subscription%20Upgrade">
                        আপগ্রেড করুন
                      </a>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
