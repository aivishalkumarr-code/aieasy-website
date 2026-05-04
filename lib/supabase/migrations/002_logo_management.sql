-- Logo Management Migration
-- Run this in Supabase SQL Editor to enable logo uploads

-- 1. Create logos table
CREATE TABLE IF NOT EXISTS logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('main', 'favicon', 'og_image')),
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on logos table
ALTER TABLE logos ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies for logos table

-- Allow authenticated users to manage logos (dashboard access already restricted)
CREATE POLICY "Authenticated users can manage logos" 
ON logos FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Allow public to view logos
CREATE POLICY "Public can view logos" 
ON logos FOR SELECT 
TO anon, authenticated 
USING (true);

-- 3. Create storage bucket for logos (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage RLS Policies for logos bucket

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload logos" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'logos');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update logos" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'logos');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete logos" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'logos');

-- Allow public to view logos
CREATE POLICY "Public can view logos storage" 
ON storage.objects 
FOR SELECT 
TO anon, authenticated 
USING (bucket_id = 'logos');
