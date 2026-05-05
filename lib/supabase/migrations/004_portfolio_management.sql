CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Business', 'Healthcare', 'E-commerce', 'Education', 'Real Estate', 'Hospitality')),
  image_url TEXT NOT NULL,
  website_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portfolio_items_active_order_idx ON portfolio_items (is_active, display_order, created_at);
CREATE INDEX IF NOT EXISTS portfolio_items_category_idx ON portfolio_items (category);

CREATE OR REPLACE FUNCTION update_portfolio_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS portfolio_items_updated_at ON portfolio_items;
CREATE TRIGGER portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_items_updated_at();

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage portfolio" ON portfolio_items;
CREATE POLICY "Authenticated users can manage portfolio"
  ON portfolio_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view portfolio" ON portfolio_items;
CREATE POLICY "Public can view portfolio"
  ON portfolio_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('portfolio', 'portfolio', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view portfolio files" ON storage.objects;
CREATE POLICY "Public can view portfolio files"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Authenticated users can upload portfolio files" ON storage.objects;
CREATE POLICY "Authenticated users can upload portfolio files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Authenticated users can update portfolio files" ON storage.objects;
CREATE POLICY "Authenticated users can update portfolio files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio')
  WITH CHECK (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Authenticated users can delete portfolio files" ON storage.objects;
CREATE POLICY "Authenticated users can delete portfolio files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio');
