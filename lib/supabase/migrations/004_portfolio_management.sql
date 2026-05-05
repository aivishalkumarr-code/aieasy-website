-- Portfolio Management Migration
-- Run this in Supabase SQL Editor to enable landing page portfolio CRUD

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Business', 'Healthcare', 'E-commerce', 'Education', 'Real Estate', 'Hospitality')),
  image_url TEXT NOT NULL,
  image_id UUID REFERENCES public.images(id) ON DELETE SET NULL,
  website_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portfolio_items_category_idx ON public.portfolio_items(category);
CREATE INDEX IF NOT EXISTS portfolio_items_image_id_idx ON public.portfolio_items(image_id);
CREATE INDEX IF NOT EXISTS portfolio_items_display_order_idx ON public.portfolio_items(display_order);
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

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('portfolio', 'portfolio', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated users can upload portfolio" ON storage.objects;
CREATE POLICY "Authenticated users can upload portfolio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Authenticated users can update portfolio" ON storage.objects;
CREATE POLICY "Authenticated users can update portfolio"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio')
WITH CHECK (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Authenticated users can delete portfolio" ON storage.objects;
CREATE POLICY "Authenticated users can delete portfolio"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Public can view portfolio storage" ON storage.objects;
CREATE POLICY "Public can view portfolio storage"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'portfolio');
