create table if not exists public.marketing_snippets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  code text not null,
  placement text not null check (placement in ('head', 'body_start', 'body_end')),
  is_active boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index marketing_snippets_placement_active_idx on public.marketing_snippets(placement, is_active, order_index);

create trigger set_marketing_snippets_updated_at
  before update on public.marketing_snippets
  for each row execute function public.set_updated_at();

alter table public.marketing_snippets enable row level security;

create policy "public can read active marketing snippets"
  on public.marketing_snippets for select
  using (is_active = true);

create policy "authenticated can manage marketing snippets"
  on public.marketing_snippets for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
