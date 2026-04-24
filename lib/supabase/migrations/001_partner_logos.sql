-- Create partner_logos table for managing deployment platform logos
-- Run this in your Supabase SQL Editor

-- Create the table
create table if not exists public.partner_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text not null,
  url text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Create index for ordering
create index if not exists partner_logos_display_order_idx on public.partner_logos(display_order);

-- Enable RLS
alter table public.partner_logos enable row level security;

-- Allow authenticated users to manage partner logos
create policy "authenticated can manage partner logos"
on public.partner_logos
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- Allow public read access (for displaying on homepage)
create policy "public can read partner logos"
on public.partner_logos
for select
using (true);

-- Insert default partners
insert into public.partner_logos (name, image_url, url, display_order)
values
  ('Azure', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg', 'https://azure.microsoft.com', 1),
  ('AWS', 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', 'https://aws.amazon.com', 2),
  ('IBM Cloud', 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg', 'https://cloud.ibm.com', 3),
  ('Google Cloud', 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg', 'https://cloud.google.com', 4),
  ('STACKIT', 'https://www.stackit.de/wp-content/uploads/2021/01/STACKIT-Logo-RGB-Blue.svg', 'https://www.stackit.de', 5)
on conflict do nothing;
