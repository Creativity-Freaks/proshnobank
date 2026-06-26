import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActivePlan {
  subscription_id: string;
  plan_id: string;
  plan_type: string;
  plan_name: string;
  billing_cycle: string;
  started_at: string;
  cancel_at: string | null;
  // limits
  max_practice_exams: number | null;
  max_live_exams_per_month: number | null;
  max_doubts_per_month: number | null;
  question_upload_limit: number;
  batch_student_limit: number;
  omr_grading: boolean;
  features: string[];
  price_monthly: number;
  price_yearly: number;
}

interface SubscriptionState {
  loading: boolean;
  plan: ActivePlan | null;
  /** user has NO active plan at all */
  isFreeTier: boolean;
  /** free tier student plan specifically */
  isFreeStudent: boolean;
  canTakePracticeExam: boolean;
  canTakeLiveExam: boolean;
  refresh: () => void;
}

export function useSubscription(): SubscriptionState {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<ActivePlan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Track auth state — only update userId on real sign-in/sign-out, not TOKEN_REFRESHED
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) =>
      setUserId(session?.user?.id ?? null)
    );
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // TOKEN_REFRESHED fires on every tab focus — ignore it to prevent loading flicker
        if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
          setUserId(session?.user?.id ?? null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const fetchPlan = useCallback(async () => {
    if (!userId) {
      setPlan(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          id,
          plan_id,
          billing_cycle,
          started_at,
          cancel_at,
          subscription_plans (
            id,
            plan_type,
            name,
            max_practice_exams,
            max_live_exams_per_month,
            max_doubts_per_month,
            question_upload_limit,
            batch_student_limit,
            omr_grading,
            features,
            price_monthly,
            price_yearly
          )
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      if (!data || !data.subscription_plans) {
        setPlan(null);
      } else {
        const sp = data.subscription_plans as any;
        setPlan({
          subscription_id: data.id,
          plan_id: data.plan_id,
          billing_cycle: data.billing_cycle,
          started_at: data.started_at,
          cancel_at: data.cancel_at,
          plan_type: sp.plan_type,
          plan_name: sp.name,
          max_practice_exams: sp.max_practice_exams,
          max_live_exams_per_month: sp.max_live_exams_per_month,
          max_doubts_per_month: sp.max_doubts_per_month,
          question_upload_limit: sp.question_upload_limit,
          batch_student_limit: sp.batch_student_limit,
          omr_grading: sp.omr_grading,
          features: sp.features ?? [],
          price_monthly: sp.price_monthly,
          price_yearly: sp.price_yearly,
        });
      }
    } catch {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const isFreeTier = !plan;
  const isFreeStudent = plan?.plan_type === "free_student";

  // free_student can do limited practice exams; null limit means unlimited
  const canTakePracticeExam =
    !loading &&
    !!plan &&
    (plan.max_practice_exams === null || plan.max_practice_exams > 0);

  // live exams require paid plan with live_exam allowance > 0
  const canTakeLiveExam =
    !loading &&
    !!plan &&
    plan.plan_type !== "free_student" &&
    (plan.max_live_exams_per_month === null || plan.max_live_exams_per_month > 0);

  return {
    loading,
    plan,
    isFreeTier,
    isFreeStudent,
    canTakePracticeExam,
    canTakeLiveExam,
    refresh: fetchPlan,
  };
}
