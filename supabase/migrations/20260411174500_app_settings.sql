-- App settings: store simple configuration values in a single table

CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Default: only admins can access admin panel
INSERT INTO public.app_settings (key, value)
VALUES ('admin_access_role', jsonb_build_object('role', 'admin'))
ON CONFLICT (key) DO NOTHING;

-- Authenticated users can read settings (needed for route gating)
DROP POLICY IF EXISTS "Authenticated can read app settings" ON public.app_settings;
CREATE POLICY "Authenticated can read app settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify settings
DROP POLICY IF EXISTS "Admins can manage app settings" ON public.app_settings;
CREATE POLICY "Admins can manage app settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
