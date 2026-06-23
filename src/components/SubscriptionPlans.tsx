import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { subscriptionApi } from "@/lib/subscription-api";
import { Check, X } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  plan_type: string;
  price_monthly: number;
  price_yearly?: number;
  description: string;
  features: string[];
  max_practice_exams?: number;
  max_live_exams_per_month?: number;
  omr_grading: boolean;
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const plansData = await subscriptionApi.getPlans();
        setPlans(plansData || []);

        const current = await subscriptionApi.getCurrentSubscription();
        if (current) {
          setCurrentSubscription(current.subscription_plans.plan_type);
        }
      } catch (error) {
        console.error("[v0] Error loading plans:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const getPrice = (plan: Plan) => {
    if (billingCycle === "yearly" && plan.price_yearly) {
      return {
        amount: plan.price_yearly,
        perMonth: Math.round(plan.price_yearly / 12),
      };
    }
    return {
      amount: plan.price_monthly,
      perMonth: plan.price_monthly,
    };
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (currentSubscription === plan.plan_type) return;

    try {
      const session = await subscriptionApi.createCheckoutSession(
        plan.id,
        billingCycle
      );
      window.location.href = session.url; // Redirect to Stripe checkout
    } catch (error) {
      console.error("[v0] Error creating checkout session:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">প্রাইসিং প্ল্যান লোড করা হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            সাবস্ক্রিপশন প্ল্যান
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            তোমার প্রয়োজন অনুযায়ী সঠিক প্ল্যান বেছে নাও
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={billingCycle === "monthly" ? "default" : "outline"}
              onClick={() => setBillingCycle("monthly")}
              className="px-6"
            >
              মাসিক
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "outline"}
              onClick={() => setBillingCycle("yearly")}
              className="px-6"
            >
              বার্ষিক (২০% সাশ্রয়)
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const price = getPrice(plan);
            const isCurrentPlan = currentSubscription === plan.plan_type;
            const isFree = plan.plan_type === "free";

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col h-full overflow-hidden transition-all hover:shadow-xl ${
                  isCurrentPlan
                    ? "ring-2 ring-blue-500 shadow-lg"
                    : "shadow-md"
                } ${isFree ? "bg-gray-50" : "bg-white"}`}
              >
                {/* Badge for popular plan */}
                {plan.plan_type === "pro" && (
                  <Badge className="absolute top-4 right-4 bg-orange-500">
                    জনপ্রিয়
                  </Badge>
                )}

                {/* Plan Info */}
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price_monthly === 0 ? "ফ্রি" : price.amount}
                      </span>
                      {plan.price_monthly > 0 && (
                        <>
                          <span className="text-gray-600">টাকা</span>
                          <span className="text-sm text-gray-500">/মাস</span>
                        </>
                      )}
                    </div>
                    {billingCycle === "yearly" && plan.price_yearly && (
                      <p className="text-xs text-green-600 mt-2">
                        সাশ্রয়: {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limits */}
                  {(plan.max_practice_exams ||
                    plan.max_live_exams_per_month) && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-6 space-y-2">
                      {plan.max_practice_exams && (
                        <p className="text-xs text-gray-700">
                          অনুশীলন পরীক্ষা:{" "}
                          <strong>
                            {plan.max_practice_exams === 999999
                              ? "সীমাহীন"
                              : plan.max_practice_exams}
                          </strong>
                        </p>
                      )}
                      {plan.max_live_exams_per_month && (
                        <p className="text-xs text-gray-700">
                          লাইভ পরীক্ষা:{" "}
                          <strong>
                            {plan.max_live_exams_per_month === 999999
                              ? "সীমাহীন"
                              : plan.max_live_exams_per_month}{" "}
                            /মাস
                          </strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div className="p-6 border-t">
                  {isCurrentPlan ? (
                    <Button disabled className="w-full" variant="outline">
                      বর্তমান প্ল্যান
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full ${
                        isFree
                          ? "bg-gray-600 hover:bg-gray-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isFree ? "শুরু করুন" : "আপগ্রেড করুন"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            বিস্তারিত তুলনা
          </h2>
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">বৈশিষ্ট্য</th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className="px-6 py-4 text-center font-semibold"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    OMR গ্রেডিং
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.omr_grading ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            আরও সাহায্য প্রয়োজন?
          </h3>
          <p className="text-gray-600 mb-4">
            আমাদের সাথে যোগাযোগ করুন:{" "}
            <a
              href="mailto:support@proshnobank.com"
              className="text-blue-600 hover:underline"
            >
              support@proshnobank.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
