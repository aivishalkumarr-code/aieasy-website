-- Logo Management schema

CREATE TABLE IF NOT EXISTS logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('main', 'favicon', 'og_image')),
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS logos_type_created_at_idx ON logos(type, created_at DESC);

ALTER TABLE logos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'logos'
      AND policyname = 'Public can read logos'
  ) THEN
    CREATE POLICY "Public can read logos"
    ON logos
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'logos'
      AND policyname = 'Authenticated users can manage logos'
  ) THEN
    CREATE POLICY "Authenticated users can manage logos"
    ON logos
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can read logo files'
  ) THEN
    CREATE POLICY "Public can read logo files"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'logos');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can upload logo files'
  ) THEN
    CREATE POLICY "Authenticated users can upload logo files"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'logos');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can update logo files'
  ) THEN
    CREATE POLICY "Authenticated users can update logo files"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'logos')
    WITH CHECK (bucket_id = 'logos');
  END IF;
END $$;
