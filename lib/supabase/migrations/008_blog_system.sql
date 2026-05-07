create type public.blog_post_status as enum ('draft', 'published', 'scheduled');

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  featured_image text,
  status public.blog_post_status not null default 'draft',
  scheduled_at timestamptz,
  seo_title text,
  meta_description text,
  canonical_url text,
  og_image text,
  keywords text,
  reading_time integer,
  category_id uuid references public.blog_categories(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create index blog_posts_status_idx on public.blog_posts(status);
create index blog_posts_category_idx on public.blog_posts(category_id);
create index blog_posts_slug_idx on public.blog_posts(slug);
create index blog_posts_created_at_idx on public.blog_posts(created_at desc);
create index blog_post_tags_post_id_idx on public.blog_post_tags(post_id);
create index blog_post_tags_tag_id_idx on public.blog_post_tags(tag_id);

create trigger set_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_tags enable row level security;

create policy "public can read published blog posts"
  on public.blog_posts for select
  using (status = 'published' and (scheduled_at is null or scheduled_at <= now()));

create policy "authenticated can manage blog posts"
  on public.blog_posts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public can read blog categories"
  on public.blog_categories for select using (true);

create policy "authenticated can manage blog categories"
  on public.blog_categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public can read blog tags"
  on public.blog_tags for select using (true);

create policy "authenticated can manage blog tags"
  on public.blog_tags for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public can read blog post tags"
  on public.blog_post_tags for select using (true);

create policy "authenticated can manage blog post tags"
  on public.blog_post_tags for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog_images', 'blog_images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public can read blog images"
  on storage.objects for select using (bucket_id = 'blog_images');

create policy "authenticated can upload blog images"
  on storage.objects for insert to authenticated with check (bucket_id = 'blog_images');

create policy "authenticated can update blog images"
  on storage.objects for update to authenticated using (bucket_id = 'blog_images') with check (bucket_id = 'blog_images');

create policy "authenticated can delete blog images"
  on storage.objects for delete to authenticated using (bucket_id = 'blog_images');
