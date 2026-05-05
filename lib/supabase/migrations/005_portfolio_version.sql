CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'site',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS portfolio_version TEXT DEFAULT 'v1';

ALTER TABLE public.settings
DROP CONSTRAINT IF EXISTS settings_portfolio_version_check;

ALTER TABLE public.settings
ADD CONSTRAINT settings_portfolio_version_check CHECK (portfolio_version IN ('v1', 'v2'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_settings_updated_at ON public.settings;
CREATE TRIGGER set_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage settings" ON public.settings;
CREATE POLICY "Authenticated users can manage settings"
ON public.settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
CREATE POLICY "Public can view settings"
ON public.settings
FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.settings (portfolio_version)
SELECT 'v1'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);
