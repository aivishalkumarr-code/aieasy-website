-- Logo management table, storage bucket, and policies.

create table if not exists public.logos (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('main', 'dark', 'favicon', 'og_image')),
  url text not null,
  width integer,
  height integer,
  file_size integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists logos_type_key on public.logos(type);
create index if not exists logos_updated_at_idx on public.logos(updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_logos_updated_at'
  ) then
    create trigger set_logos_updated_at
    before update on public.logos
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

alter table public.logos enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'logos' and policyname = 'public can read logos'
  ) then
    create policy "public can read logos"
    on public.logos
    for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'logos' and policyname = 'authenticated can manage logos'
  ) then
    create policy "authenticated can manage logos"
    on public.logos
    for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 2097152, array['image/png', 'image/jpeg', 'image/svg+xml'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'public can read logo files'
  ) then
    create policy "public can read logo files"
    on storage.objects
    for select
    using (bucket_id = 'logos');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated can upload logo files'
  ) then
    create policy "authenticated can upload logo files"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'logos');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated can update logo files'
  ) then
    create policy "authenticated can update logo files"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'logos')
    with check (bucket_id = 'logos');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated can delete logo files'
  ) then
    create policy "authenticated can delete logo files"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'logos');
  end if;
end $$;
