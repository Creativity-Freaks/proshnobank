-- Add teacher role and automatically assign roles on signup.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';

CREATE OR REPLACE FUNCTION public.assign_signup_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text;
  signup_role public.app_role;
BEGIN
  -- Remove email confirmation requirement by auto-confirming newly created users.
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE id = new.id;

  requested_role := lower(coalesce(new.raw_user_meta_data ->> 'registration_type', 'student'));

  IF requested_role = 'teacher' THEN
    signup_role := 'teacher'::public.app_role;
  ELSE
    signup_role := 'user'::public.app_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, signup_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;

CREATE TRIGGER on_auth_user_created_assign_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_signup_role();

-- Backfill a base role for existing users who do not have any role row.
INSERT INTO public.user_roles (user_id, role)
SELECT
  u.id,
  CASE
    WHEN lower(coalesce(u.raw_user_meta_data ->> 'registration_type', 'student')) = 'teacher'
      THEN 'teacher'::public.app_role
    ELSE 'user'::public.app_role
  END
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1
  FROM public.user_roles ur
  WHERE ur.user_id = u.id
);

-- Also confirm existing users who were created before this trigger.
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;
