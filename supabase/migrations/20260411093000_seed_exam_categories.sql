-- Seed default exam categories (safe to re-run)

INSERT INTO public.exam_categories (name, slug, description, is_active, sort_order)
VALUES
  ('SSC পরীক্ষা', 'ssc', 'এসএসসি বোর্ড পরীক্ষার প্রস্তুতি', true, 10),
  ('HSC পরীক্ষা', 'hsc', 'এইচএসসি বোর্ড পরীক্ষার প্রস্তুতি', true, 20),
  ('মেডিকেল ভর্তি', 'medical', 'MBBS ভর্তি পরীক্ষার প্রস্তুতি', true, 30),
  ('ইঞ্জিনিয়ারিং ভর্তি', 'engineering', 'BUET, CUET, KUET ভর্তি প্রস্তুতি', true, 40),
  ('বিশ্ববিদ্যালয় ভর্তি', 'university', 'ঢাবি, জাবি, রাবি ভর্তি প্রস্তুতি', true, 50),
  ('চাকরি পরীক্ষা', 'job', 'BCS, Bank, Primary সহ সব চাকরি', true, 60)
ON CONFLICT (slug) DO NOTHING;
