import { supabase } from "@/integrations/supabase/client";

export const subscriptionApi = {
  // Get all subscription plans
  async getPlans() {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("price_monthly", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get user's current subscription
  async getCurrentSubscription() {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return null;

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", user.data.user.id)
      .eq("status", "active")
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
    return data;
  },

  // Get subscription by plan type
  async getSubscriptionByPlan(planType: string) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return null;

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.data.user.id)
      .eq("status", "active");

    if (error) throw error;

    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("plan_type", planType)
      .single();

    if (!plan) return null;

    return data?.find(
      (sub) => sub.plan_id === plan.id
    ) || null;
  },

  // Create checkout session
  async createCheckoutSession(planId: string, billingCycle: "monthly" | "yearly") {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    // This would typically call a backend API that creates Stripe checkout session
    // For now, returning the data structure
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        billingCycle,
        userId: user.data.user.id,
      }),
    });

    if (!response.ok) throw new Error("Failed to create checkout session");
    return response.json();
  },

  // Get billing history
  async getBillingHistory(page: number = 1, pageSize: number = 10) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    const { data, count, error } = await supabase
      .from("billing_history")
      .select(
        "*, user_subscriptions(subscription_plans(name))",
        { count: "exact" }
      )
      .range((page - 1) * pageSize, page * pageSize - 1)
      .order("billing_date", { ascending: false });

    if (error) throw error;
    return { data, total: count };
  },

  // Get usage stats for current month
  async getMonthlyUsage() {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const { data, error } = await supabase
      .from("usage_tracking")
      .select("usage_type, quantity")
      .eq("user_id", user.data.user.id)
      .eq("month_year", monthYear);

    if (error) throw error;

    const usage: Record<string, number> = {
      practice_exams: 0,
      live_exams: 0,
      doubts: 0,
      questions_uploaded: 0,
      batch_students: 0,
    };

    data?.forEach((item) => {
      usage[item.usage_type] = item.quantity;
    });

    return usage;
  },

  // Check if user can perform action based on subscription
  async canPerformAction(actionType: string): Promise<boolean> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return false;

    const subscription = await this.getCurrentSubscription();
    if (!subscription) return actionType === "free"; // Free users can do limited things

    const plan = subscription.subscription_plans;
    const usage = await this.getMonthlyUsage();

    switch (actionType) {
      case "take_practice_exam":
        return (
          !plan.max_practice_exams ||
          usage.practice_exams < plan.max_practice_exams
        );
      case "take_live_exam":
        return (
          !plan.max_live_exams_per_month ||
          usage.live_exams < plan.max_live_exams_per_month
        );
      case "ask_doubt":
        return (
          !plan.max_doubts_per_month ||
          usage.doubts < plan.max_doubts_per_month
        );
      case "upload_questions":
        return plan.question_upload_limit > 0;
      case "use_omr_grading":
        return plan.omr_grading;
      default:
        return false;
    }
  },

  // Apply discount code
  async applyDiscountCode(code: string) {
    const { data, error } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error) throw new Error("Invalid discount code");

    const now = new Date();
    if (
      new Date(data.valid_from) > now ||
      new Date(data.valid_until) < now
    ) {
      throw new Error("This discount code has expired");
    }

    if (data.max_uses && data.uses_count >= data.max_uses) {
      throw new Error("This discount code has reached maximum uses");
    }

    return {
      discount_percent: data.discount_percent,
      applicable_plans: data.applicable_plans,
    };
  },

  // Cancel subscription
  async cancelSubscription(reason?: string) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "cancelled",
        cancel_at: new Date().toISOString(),
      })
      .eq("user_id", user.data.user.id)
      .eq("status", "active");

    if (error) throw error;

    // Log cancellation reason if provided
    if (reason) {
      console.log("[v0] Subscription cancelled:", { userId: user.data.user.id, reason });
    }
  },

  // Upgrade subscription
  async upgradeSubscription(newPlanId: string) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    const { data: currentSub } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.data.user.id)
      .eq("status", "active")
      .single();

    if (!currentSub) {
      // Create new subscription if none exists
      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert([
          {
            user_id: user.data.user.id,
            plan_id: newPlanId,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Update existing subscription
    const { data, error } = await supabase
      .from("user_subscriptions")
      .update({
        plan_id: newPlanId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentSub.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Track usage
  async trackUsage(usageType: string, quantity: number = 1) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const { data: existing } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_id", user.data.user.id)
      .eq("usage_type", usageType)
      .eq("month_year", monthYear)
      .single();

    if (existing) {
      await supabase
        .from("usage_tracking")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
    } else {
      await supabase.from("usage_tracking").insert([
        {
          user_id: user.data.user.id,
          usage_type: usageType,
          quantity,
          month_year: monthYear,
        },
      ]);
    }
  },
};
