-- Subscription and Billing System for Proshnobank

-- 1) Create subscription plan enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'subscription_plan'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.subscription_plan AS ENUM ('free', 'basic', 'pro', 'premium');
  END IF;
END
$$;

-- 2) Create subscription status enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'subscription_status'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');
  END IF;
END
$$;

-- 3) Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  plan_type public.subscription_plan NOT NULL UNIQUE,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2),
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_practice_exams INTEGER,
  max_live_exams_per_month INTEGER,
  max_doubts_per_month INTEGER,
  max_batch_students INTEGER,
  omr_grading BOOLEAN DEFAULT false,
  question_upload_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT positive_price CHECK (price_monthly > 0)
);

-- 4) Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status public.subscription_status NOT NULL DEFAULT 'pending',
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  cancel_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_type)
);

-- 5) Create billing history table
CREATE TABLE IF NOT EXISTS public.billing_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BDT',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  invoice_number TEXT UNIQUE,
  stripe_invoice_id TEXT UNIQUE,
  billing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- 6) Create usage tracking table (for quota management)
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN (
    'practice_exams',
    'live_exams',
    'doubts',
    'questions_uploaded',
    'batch_students'
  )),
  quantity INTEGER NOT NULL DEFAULT 1,
  month_year DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_type, month_year)
);

-- 7) Create discount codes table (for teacher/coaching promos)
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent NUMERIC(3,1) CHECK (discount_percent > 0 AND discount_percent <= 100),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  applicable_plans JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8) Seed subscription plans
INSERT INTO public.subscription_plans (name, plan_type, price_monthly, price_yearly, description, features, omr_grading)
VALUES
  (
    'ফ্রি',
    'free',
    0,
    0,
    'শুরু করার জন্য নিখুঁত',
    '[
      "প্রতি মাসে ৫টি অনুশীলন পরীক্ষা",
      "লিডারবোর্ড অ্যাক্সেস",
      "সীমিত প্রশ্ন ব্যাংক",
      "মৌলিক ড্যাশবোর্ড"
    ]'::jsonb,
    false
  ),
  (
    'বেসিক',
    'basic',
    99,
    999,
    'গুরুতর শিক্ষার্থীদের জন্য',
    '[
      "প্রতি মাসে ৫০টি অনুশীলন পরীক্ষা",
      "মাসিক ৫টি লাইভ পরীক্ষা",
      "সম্পূর্ণ প্রশ্ন ব্যাংক",
      "উন্নত ড্যাশবোর্ড এবং বিশ্লেষণ",
      "প্রতি মাসে ২০টি সন্ধেহ"
    ]'::jsonb,
    false
  ),
  (
    'প্রো',
    'pro',
    299,
    2999,
    'শিক্ষকদের জন্য আদর্শ',
    '[
      "সীমাহীন অনুশীলন পরীক্ষা",
      "মাসিক ১৫টি লাইভ পরীক্ষা",
      "সম্পূর্ণ প্রশ্ন ব্যাংক",
      "১ টি ব্যাচ এবং ৫০ জন শিক্ষার্থী",
      "প্রশ্ন আপলোড করার ক্ষমতা (১০০+ প্রশ্ন/মাস)",
      "OMR গ্রেডিং",
      "উন্নত রিপোর্টিং"
    ]'::jsonb,
    true
  ),
  (
    'প্রিমিয়াম',
    'premium',
    999,
    9999,
    'শিক্ষা প্রতিষ্ঠানের জন্য',
    '[
      "সীমাহীন অনুশীলন এবং লাইভ পরীক্ষা",
      "সম্পূর্ণ প্রশ্ন ব্যাংক",
      "সীমাহীন ব্যাচ এবং শিক্ষার্থী",
      "সীমাহীন প্রশ্ন আপলোড",
      "OMR গ্রেডিং এবং বিশ্লেষণ",
      "API অ্যাক্সেস",
      "ডেডিকেটেড সাপোর্ট",
      "কাস্টম ব্র্যান্ডিং"
    ]'::jsonb,
    true
  )
ON CONFLICT (plan_type) DO NOTHING;

-- 9) Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_subscription_id ON public.billing_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON public.billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month_year ON public.usage_tracking(month_year);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);

-- 10) Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- 11) RLS Policies
-- Subscription plans: everyone can view, no one can modify
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (true);

-- User subscriptions: users can only view/manage their own
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (user_id = auth.uid());

-- Billing history: users can view their own
CREATE POLICY "Users can view own billing history" ON public.billing_history
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM public.user_subscriptions WHERE user_id = auth.uid()
    )
  );

-- Usage tracking: users can view their own
CREATE POLICY "Users can view own usage" ON public.usage_tracking
  FOR SELECT USING (user_id = auth.uid());
