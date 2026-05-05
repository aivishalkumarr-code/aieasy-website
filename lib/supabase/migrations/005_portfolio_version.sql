CREATE TABLE IF NOT EXISTS public.lp_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT lp_settings_portfolio_version_check CHECK (
    key <> 'portfolio_version' OR value IN ('v1', 'v2')
  )
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_lp_settings_updated_at ON public.lp_settings;
CREATE TRIGGER set_lp_settings_updated_at
BEFORE UPDATE ON public.lp_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.lp_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage landing page settings" ON public.lp_settings;
CREATE POLICY "Authenticated users can manage landing page settings"
ON public.lp_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view landing page settings" ON public.lp_settings;
CREATE POLICY "Public can view landing page settings"
ON public.lp_settings
FOR SELECT
TO anon, authenticated
USING (true);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'settings'
      AND column_name = 'portfolio_version'
  ) THEN
    EXECUTE '
      INSERT INTO public.lp_settings (key, value)
      SELECT ''portfolio_version'', portfolio_version
      FROM public.settings
      WHERE portfolio_version IN (''v1'', ''v2'')
      LIMIT 1
      ON CONFLICT (key) DO NOTHING
    ';
  END IF;
END $$;

INSERT INTO public.lp_settings (key, value)
VALUES ('portfolio_version', 'v2')
ON CONFLICT (key) DO NOTHING;
