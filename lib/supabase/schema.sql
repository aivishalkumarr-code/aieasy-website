create extension if not exists pgcrypto;

create type public.contact_status as enum (
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Closed'
);

create type public.deal_stage as enum (
  'Discovery',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won'
);

create type public.quote_status as enum (
  'Draft',
  'Sent',
  'Accepted',
  'Expired'
);

create type public.email_status as enum (
  'queued',
  'sent',
  'failed'
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  company text,
  status public.contact_status not null default 'New',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  value numeric(12, 2) not null default 0,
  stage public.deal_stage not null default 'Discovery',
  probability integer not null default 25 check (probability >= 0 and probability <= 100),
  expected_close_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  services text[] not null default '{}',
  subtotal numeric(12, 2) not null default 0,
  tax_rate numeric(5, 2) not null default 18,
  tax_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  status public.quote_status not null default 'Draft',
  valid_until date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sent_emails (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  to_name text,
  subject text not null,
  template text,
  status public.email_status not null default 'queued',
  sent_at timestamptz not null default now()
);

create table if not exists public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  page_path text not null unique,
  title text not null,
  description text not null,
  keywords text not null,
  og_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_seo_settings_updated_at
before update on public.seo_settings
for each row
execute function public.set_updated_at();

create index if not exists contacts_status_idx on public.contacts(status);
create index if not exists deals_stage_idx on public.deals(stage);
create index if not exists quotes_status_idx on public.quotes(status);
create index if not exists seo_page_path_idx on public.seo_settings(page_path);

alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.quotes enable row level security;
alter table public.sent_emails enable row level security;
alter table public.seo_settings enable row level security;

create policy "authenticated can manage contacts"
on public.contacts
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "authenticated can manage deals"
on public.deals
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "authenticated can manage quotes"
on public.quotes
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "authenticated can manage sent emails"
on public.sent_emails
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "authenticated can manage seo settings"
on public.seo_settings
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
