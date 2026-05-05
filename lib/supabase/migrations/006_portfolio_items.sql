CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('Business', 'Healthcare', 'E-commerce', 'Education', 'Real Estate', 'Hospitality')),
  description text,
  client_name text,
  image_url text,
  image_id uuid REFERENCES public.images(id) ON DELETE SET NULL,
  stats jsonb DEFAULT '[]'::jsonb,
  features text[] DEFAULT '{}',
  live_url text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS client_name text;
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS image_id uuid REFERENCES public.images(id) ON DELETE SET NULL;
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS stats jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}';
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS live_url text;
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

UPDATE public.portfolio_items
SET
  title = COALESCE(title, name),
  live_url = COALESCE(live_url, website_url),
  order_index = COALESCE(order_index, display_order, 0),
  stats = CASE WHEN stats IS NULL OR jsonb_typeof(stats) <> 'array' THEN '[]'::jsonb ELSE stats END,
  features = COALESCE(features, '{}')
WHERE title IS NULL OR live_url IS NULL OR order_index IS NULL OR stats IS NULL OR features IS NULL;

ALTER TABLE public.portfolio_items ALTER COLUMN title SET NOT NULL;

CREATE INDEX IF NOT EXISTS portfolio_items_category_idx ON public.portfolio_items(category);
CREATE INDEX IF NOT EXISTS portfolio_items_order_index_idx ON public.portfolio_items(order_index);
CREATE INDEX IF NOT EXISTS portfolio_items_active_idx ON public.portfolio_items(is_active);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_portfolio_items_updated_at ON public.portfolio_items;
CREATE TRIGGER set_portfolio_items_updated_at
BEFORE UPDATE ON public.portfolio_items
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage portfolio" ON public.portfolio_items;
CREATE POLICY "Authenticated users can manage portfolio"
ON public.portfolio_items
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view portfolio" ON public.portfolio_items;
CREATE POLICY "Public can view portfolio"
ON public.portfolio_items
FOR SELECT
TO anon, authenticated
USING (true);

CREATE TABLE IF NOT EXISTS public.lp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

DROP TRIGGER IF EXISTS set_lp_settings_updated_at ON public.lp_settings;
CREATE TRIGGER set_lp_settings_updated_at
BEFORE UPDATE ON public.lp_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.lp_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage lp settings" ON public.lp_settings;
CREATE POLICY "Authenticated users can manage lp settings"
ON public.lp_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view lp settings" ON public.lp_settings;
CREATE POLICY "Public can view lp settings"
ON public.lp_settings
FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.lp_settings (key, value)
VALUES ('portfolio_version', 'v2')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.portfolio_items (title, category, description, client_name, image_url, stats, features, live_url, order_index, is_active)
VALUES
  ('Elite Taxation', 'Business', 'Maximize Refunds. Minimize Stress.', 'Elite Taxation', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=780&fit=crop', '[{"label":"Returns Filed","value":"8,500+"},{"label":"Client Satisfaction","value":"98%"},{"label":"Revenue Generated","value":"$2M+"},{"label":"Years Experience","value":"7+"}]'::jsonb, ARRAY['Custom Design','Mobile First','SEO Ready','Fast Loading'], NULL, 1, true),
  ('CareWell Clinic', 'Healthcare', 'Compassionate Care For Better Health', 'CareWell Clinic', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=780&fit=crop', '[{"label":"Patients Served","value":"12K+"},{"label":"Client Satisfaction","value":"99%"},{"label":"Bookings Growth","value":"45%"},{"label":"Online Booking","value":"24/7"}]'::jsonb, ARRAY['Custom Design','Mobile First','SEO Ready','Fast Loading'], NULL, 2, true),
  ('Luxora Fashion', 'E-commerce', 'New Season New You', 'Luxora Fashion', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=780&fit=crop', '[{"label":"Revenue Generated","value":"3.2x"},{"label":"Client Satisfaction","value":"96%"},{"label":"Load Time","value":"1.8s"},{"label":"Repeat Buyers","value":"42%"}]'::jsonb, ARRAY['Custom Design','Mobile First','SEO Ready','Fast Loading'], NULL, 3, true),
  ('Bright Future Academy', 'Education', 'Education Today Success Tomorrow', 'Bright Future Academy', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=780&fit=crop', '[{"label":"Students Enrolled","value":"2,400+"},{"label":"Client Satisfaction","value":"98%"},{"label":"Programs Built","value":"6"},{"label":"Inquiry Growth","value":"45%"}]'::jsonb, ARRAY['Custom Design','Mobile First','SEO Ready','Fast Loading'], NULL, 4, true),
  ('UrbanSpace Realty', 'Real Estate', 'Find The Perfect Place To Call Home', 'UrbanSpace Realty', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=780&fit=crop', '[{"label":"Listings Managed","value":"180+"},{"label":"Client Satisfaction","value":"97%"},{"label":"Lead Growth","value":"64%"},{"label":"Markets Served","value":"9"}]'::jsonb, ARRAY['Custom Design','Mobile First','SEO Ready','Fast Loading'], NULL, 5, true),
  ('Taste Heaven', 'Hospitality', 'Delicious Food Great Experience', 'Taste Heaven', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=780&fit=crop', '[{"label":"Orders Generated","value":"22K+"},{"label":"Client Satisfaction","value":"98%"},{"label":"Booking Growth","value":"35%"},{"label":"Avg Response","value":"15m"}]'::jsonb, ARRAY['Custom Design','Mobile First','SEO Ready','Fast Loading'], NULL, 6, true)
ON CONFLICT DO NOTHING;
