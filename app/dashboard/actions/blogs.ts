"use server";

import { revalidatePath } from "next/cache";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActionResult, BlogCategory, BlogPost, BlogPostStatus, BlogTag } from "@/types";

const BLOG_POST_SELECT = `
  id,
  title,
  slug,
  excerpt,
  content,
  featured_image,
  status,
  scheduled_at,
  seo_title,
  meta_description,
  canonical_url,
  og_image,
  keywords,
  reading_time,
  category_id,
  author_id,
  created_at,
  updated_at,
  published_at,
  category:blog_categories(id,name,slug,description,created_at),
  blog_post_tags(tag:blog_tags(id,name,slug,created_at))
`;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const demoCategories: BlogCategory[] = [
  {
    id: "cat-ai-automation",
    name: "AI Automation",
    slug: "ai-automation",
    description: "Automation workflows and implementation guides.",
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-marketing",
    name: "Marketing",
    slug: "marketing",
    description: "Growth playbooks and acquisition strategies.",
    created_at: new Date().toISOString(),
  },
];

const demoTags: BlogTag[] = [
  { id: "tag-ai", name: "AI", slug: "ai", created_at: new Date().toISOString() },
  { id: "tag-seo", name: "SEO", slug: "seo", created_at: new Date().toISOString() },
  { id: "tag-guides", name: "Guides", slug: "guides", created_at: new Date().toISOString() },
];

const demoPosts: BlogPost[] = [
  {
    id: "blog-ai-outreach",
    title: "How AI Automation Improves Outreach Conversion",
    slug: "how-ai-automation-improves-outreach-conversion",
    excerpt: "A practical breakdown of qualification and routing flows.",
    content: "AI workflows can qualify, segment, and route leads in real time.",
    featured_image: null,
    status: "published",
    scheduled_at: null,
    seo_title: "AI Outreach Conversion Guide",
    meta_description: "How to improve conversion with AI outreach automation.",
    canonical_url: null,
    og_image: null,
    keywords: "ai,automation,outreach",
    reading_time: 3,
    category_id: demoCategories[0].id,
    category: demoCategories[0],
    tags: [demoTags[0], demoTags[2]],
    author_id: null,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "blog-seo-playbook",
    title: "B2B SEO Playbook for AI Service Businesses",
    slug: "b2b-seo-playbook-for-ai-service-businesses",
    excerpt: "Positioning and on-page tactics for qualified pipeline.",
    content: "SEO compounds when your content strategy matches buyer intent.",
    featured_image: null,
    status: "draft",
    scheduled_at: null,
    seo_title: null,
    meta_description: null,
    canonical_url: null,
    og_image: null,
    keywords: null,
    reading_time: 2,
    category_id: demoCategories[1].id,
    category: demoCategories[1],
    tags: [demoTags[1]],
    author_id: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    published_at: null,
  },
];

interface GetBlogPostsOptions {
  status?: BlogPostStatus | "all";
  category_id?: string;
  query?: string;
  sort?: "latest" | "oldest";
  page?: number;
  pageSize?: number;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const normalizeStatus = (value: string | null): BlogPostStatus => {
  if (value === "published" || value === "scheduled") {
    return value;
  }

  return "draft";
};

const sanitizeText = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const parseTagIds = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || !value.trim()) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map((entry) => String(entry).trim()).filter(Boolean);
    }
  } catch {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [] as string[];
};

const normalizeBlogPost = (raw: Record<string, unknown>): BlogPost => {
  const category = raw.category && typeof raw.category === "object" ? (raw.category as BlogCategory) : null;
  const rawPostTags = Array.isArray(raw.blog_post_tags) ? raw.blog_post_tags : [];
  const tags = rawPostTags
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Record<string, unknown>;
      return record.tag && typeof record.tag === "object" ? (record.tag as BlogTag) : null;
    })
    .filter((entry): entry is BlogTag => Boolean(entry));

  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? "Untitled"),
    slug: String(raw.slug ?? ""),
    excerpt: typeof raw.excerpt === "string" ? raw.excerpt : null,
    content: typeof raw.content === "string" ? raw.content : "",
    featured_image: typeof raw.featured_image === "string" ? raw.featured_image : null,
    status: normalizeStatus(typeof raw.status === "string" ? raw.status : null),
    scheduled_at: typeof raw.scheduled_at === "string" ? raw.scheduled_at : null,
    seo_title: typeof raw.seo_title === "string" ? raw.seo_title : null,
    meta_description: typeof raw.meta_description === "string" ? raw.meta_description : null,
    canonical_url: typeof raw.canonical_url === "string" ? raw.canonical_url : null,
    og_image: typeof raw.og_image === "string" ? raw.og_image : null,
    keywords: typeof raw.keywords === "string" ? raw.keywords : null,
    reading_time: typeof raw.reading_time === "number" ? raw.reading_time : raw.reading_time ? Number(raw.reading_time) : null,
    category_id: typeof raw.category_id === "string" ? raw.category_id : null,
    category,
    tags,
    author_id: typeof raw.author_id === "string" ? raw.author_id : null,
    created_at: typeof raw.created_at === "string" ? raw.created_at : new Date().toISOString(),
    updated_at: typeof raw.updated_at === "string" ? raw.updated_at : new Date().toISOString(),
    published_at: typeof raw.published_at === "string" ? raw.published_at : null,
  };
};

const sortBlogPosts = (posts: BlogPost[], sort: "latest" | "oldest") =>
  [...posts].sort((a, b) => {
    const left = new Date(a.created_at).getTime();
    const right = new Date(b.created_at).getTime();
    return sort === "oldest" ? left - right : right - left;
  });

const revalidateBlogs = () => {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]");
  revalidatePath("/dashboard/blogs");
};

const randomSuffix = () => Math.random().toString(36).slice(2, 6);

const generateSlug = (title: string) => {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || `post-${randomSuffix()}`;
};

const estimateReadingTime = (content: string) => {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

const ensureUniqueSlug = async (slug: string, postId?: string) => {
  const supabase = await createClient();

  if (!supabase) {
    return slug;
  }

  let candidate = slug;

  for (let i = 0; i < 8; i += 1) {
    let query = supabase.from("blog_posts").select("id").eq("slug", candidate);

    if (postId) {
      query = query.neq("id", postId);
    }

    const { data } = await query.maybeSingle();

    if (!data) {
      return candidate;
    }

    candidate = `${slug}-${randomSuffix()}`;
  }

  return `${slug}-${crypto.randomUUID().slice(0, 4)}`;
};

export const getBlogPosts = async (options: GetBlogPostsOptions = {}): Promise<BlogPostsResponse> => {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 10));
  const sort = options.sort === "oldest" ? "oldest" : "latest";

  if (!isSupabaseConfigured()) {
    const normalizedQuery = (options.query ?? "").trim().toLowerCase();
    const filtered = sortBlogPosts(demoPosts, sort).filter((post) => {
      const statusMatch = !options.status || options.status === "all" ? true : post.status === options.status;
      const categoryMatch = options.category_id ? post.category_id === options.category_id : true;
      const queryMatch =
        !normalizedQuery ||
        `${post.title} ${post.excerpt ?? ""} ${post.content}`.toLowerCase().includes(normalizedQuery);
      return statusMatch && categoryMatch && queryMatch;
    });

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return {
      posts: paged,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { posts: [], total: 0, page, pageSize, totalPages: 1 };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("blog_posts")
    .select(BLOG_POST_SELECT, { count: "exact" })
    .order("created_at", { ascending: sort === "oldest" })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }

  if (options.category_id) {
    query = query.eq("category_id", options.category_id);
  }

  if (options.query?.trim()) {
    const term = options.query.trim().replace(/,/g, " ");
    query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`);
  }

  if (!user) {
    query = query.eq("status", "published");
  }

  const { data, error, count } = await query;

  if (error || !data) {
    return { posts: [], total: 0, page, pageSize, totalPages: 1 };
  }

  const posts = (data as Array<Record<string, unknown>>).map(normalizeBlogPost);
  const total = count ?? posts.length;

  return {
    posts,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  if (!slug.trim()) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return demoPosts.find((post) => post.slug === slug) ?? null;
  }

  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_POST_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeBlogPost(data as Record<string, unknown>);
};

export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  if (!id.trim()) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return demoPosts.find((post) => post.id === id) ?? null;
  }

  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_POST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeBlogPost(data as Record<string, unknown>);
};

export const createBlogPost = async (formData: FormData): Promise<ActionResult<BlogPost>> => {
  const title = sanitizeText(formData.get("title"));
  const excerpt = sanitizeText(formData.get("excerpt")) || null;
  const content = sanitizeText(formData.get("content"));
  const status = normalizeStatus(sanitizeText(formData.get("status")) || null);
  const scheduled_at = sanitizeText(formData.get("scheduled_at")) || null;
  const seo_title = sanitizeText(formData.get("seo_title")) || null;
  const meta_description = sanitizeText(formData.get("meta_description")) || null;
  const canonical_url = sanitizeText(formData.get("canonical_url")) || null;
  const og_image = sanitizeText(formData.get("og_image")) || null;
  const keywords = sanitizeText(formData.get("keywords")) || null;
  const featured_image = sanitizeText(formData.get("featured_image")) || null;
  const category_id = sanitizeText(formData.get("category_id")) || null;
  const requestedSlug = sanitizeText(formData.get("slug"));
  const tagIds = parseTagIds(formData.get("tag_ids"));

  if (!title) {
    return { success: false, message: "Blog post title is required." };
  }

  const readingTime = estimateReadingTime(content);
  const baseSlug = generateSlug(requestedSlug || title);

  if (!isSupabaseConfigured()) {
    const category = demoCategories.find((entry) => entry.id === category_id) ?? null;
    const tags = demoTags.filter((entry) => tagIds.includes(entry.id));
    return {
      success: true,
      data: {
        id: crypto.randomUUID(),
        title,
        slug: baseSlug,
        excerpt,
        content,
        featured_image,
        status,
        scheduled_at,
        seo_title,
        meta_description,
        canonical_url,
        og_image,
        keywords,
        reading_time: readingTime,
        category_id,
        category,
        tags,
        author_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: status === "published" ? new Date().toISOString() : null,
      },
      message: "Blog post created locally. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const slug = await ensureUniqueSlug(baseSlug);
  const publishedAt = status === "published" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title,
      slug,
      excerpt,
      content,
      featured_image,
      status,
      scheduled_at,
      seo_title,
      meta_description,
      canonical_url,
      og_image,
      keywords,
      reading_time: readingTime,
      category_id,
      author_id: user?.id ?? null,
      published_at: publishedAt,
    })
    .select(BLOG_POST_SELECT)
    .single();

  if (error || !data) {
    return {
      success: false,
      message: "Unable to create blog post. Run lib/supabase/migrations/008_blog_system.sql in Supabase, then retry.",
    };
  }

  const createdPost = normalizeBlogPost(data as Record<string, unknown>);

  if (tagIds.length) {
    const junctionRows = tagIds.map((tag_id) => ({ post_id: createdPost.id, tag_id }));
    const { error: tagError } = await supabase.from("blog_post_tags").insert(junctionRows);

    if (tagError) {
      return { success: false, message: "Blog post created, but tags could not be linked." };
    }
  }

  const hydrated = await getBlogPostById(createdPost.id);
  revalidateBlogs();

  return {
    success: true,
    data: hydrated ?? createdPost,
    message: "Blog post created.",
  };
};

export const updateBlogPost = async (formData: FormData): Promise<ActionResult<BlogPost>> => {
  const id = sanitizeText(formData.get("id"));
  const title = sanitizeText(formData.get("title"));
  const excerpt = sanitizeText(formData.get("excerpt")) || null;
  const content = sanitizeText(formData.get("content"));
  const status = normalizeStatus(sanitizeText(formData.get("status")) || null);
  const scheduled_at = sanitizeText(formData.get("scheduled_at")) || null;
  const seo_title = sanitizeText(formData.get("seo_title")) || null;
  const meta_description = sanitizeText(formData.get("meta_description")) || null;
  const canonical_url = sanitizeText(formData.get("canonical_url")) || null;
  const og_image = sanitizeText(formData.get("og_image")) || null;
  const keywords = sanitizeText(formData.get("keywords")) || null;
  const featured_image = sanitizeText(formData.get("featured_image")) || null;
  const category_id = sanitizeText(formData.get("category_id")) || null;
  const requestedSlug = sanitizeText(formData.get("slug"));
  const tagIds = parseTagIds(formData.get("tag_ids"));

  if (!id) {
    return { success: false, message: "Blog post ID is required." };
  }

  if (!title) {
    return { success: false, message: "Blog post title is required." };
  }

  const readingTime = estimateReadingTime(content);
  const baseSlug = generateSlug(requestedSlug || title);

  if (!isSupabaseConfigured()) {
    const category = demoCategories.find((entry) => entry.id === category_id) ?? null;
    const tags = demoTags.filter((entry) => tagIds.includes(entry.id));
    return {
      success: true,
      data: {
        id,
        title,
        slug: baseSlug,
        excerpt,
        content,
        featured_image,
        status,
        scheduled_at,
        seo_title,
        meta_description,
        canonical_url,
        og_image,
        keywords,
        reading_time: readingTime,
        category_id,
        category,
        tags,
        author_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: status === "published" ? new Date().toISOString() : null,
      },
      message: "Blog post updated locally. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data: existing, error: existingError } = await supabase
    .from("blog_posts")
    .select("id,status,published_at")
    .eq("id", id)
    .maybeSingle();

  if (existingError || !existing) {
    return { success: false, message: "Blog post not found." };
  }

  const slug = await ensureUniqueSlug(baseSlug, id);
  const wasPublished = existing.status === "published";
  const publishedAt = status === "published" ? existing.published_at ?? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("blog_posts")
    .update({
      title,
      slug,
      excerpt,
      content,
      featured_image,
      status,
      scheduled_at,
      seo_title,
      meta_description,
      canonical_url,
      og_image,
      keywords,
      reading_time: readingTime,
      category_id,
      published_at: publishedAt,
    })
    .eq("id", id)
    .select(BLOG_POST_SELECT)
    .single();

  if (error || !data) {
    return { success: false, message: "Unable to update blog post." };
  }

  const { error: clearTagError } = await supabase.from("blog_post_tags").delete().eq("post_id", id);

  if (clearTagError) {
    return { success: false, message: "Blog post updated, but previous tags could not be cleared." };
  }

  if (tagIds.length) {
    const junctionRows = tagIds.map((tag_id) => ({ post_id: id, tag_id }));
    const { error: tagError } = await supabase.from("blog_post_tags").insert(junctionRows);

    if (tagError) {
      return { success: false, message: "Blog post updated, but tags could not be linked." };
    }
  }

  const hydrated = await getBlogPostById(id);
  revalidateBlogs();

  return {
    success: true,
    data: hydrated ?? normalizeBlogPost(data as Record<string, unknown>),
    message: wasPublished || status !== "published" ? "Blog post updated." : "Blog post published.",
  };
};

export const deleteBlogPost = async (id: string): Promise<ActionResult<string>> => {
  const postId = id.trim();

  if (!postId) {
    return { success: false, message: "Blog post ID is required." };
  }

  if (!isSupabaseConfigured()) {
    return { success: true, data: postId, message: "Blog post removed locally. Connect Supabase to persist changes." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  await supabase.from("blog_post_tags").delete().eq("post_id", postId);

  const { error } = await supabase.from("blog_posts").delete().eq("id", postId);

  if (error) {
    return { success: false, message: "Unable to delete blog post." };
  }

  revalidateBlogs();

  return { success: true, data: postId, message: "Blog post deleted." };
};

export const getBlogCategories = async (): Promise<BlogCategory[]> => {
  if (!isSupabaseConfigured()) {
    return demoCategories;
  }

  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from("blog_categories").select("*").order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as BlogCategory[];
};

export const createBlogCategory = async (formData: FormData): Promise<ActionResult<BlogCategory>> => {
  const name = sanitizeText(formData.get("name"));
  const description = sanitizeText(formData.get("description")) || null;
  const baseSlug = generateSlug(sanitizeText(formData.get("slug")) || name);

  if (!name) {
    return { success: false, message: "Category name is required." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: { id: crypto.randomUUID(), name, slug: baseSlug, description, created_at: new Date().toISOString() },
      message: "Category created locally. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  let slug = baseSlug;
  for (let i = 0; i < 8; i += 1) {
    const { data: slugData } = await supabase.from("blog_categories").select("id").eq("slug", slug).maybeSingle();
    if (!slugData) {
      break;
    }
    slug = `${baseSlug}-${randomSuffix()}`;
  }

  const { data, error } = await supabase
    .from("blog_categories")
    .insert({ name, slug, description })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, message: "Unable to create blog category." };
  }

  revalidateBlogs();
  return { success: true, data: data as BlogCategory, message: "Category created." };
};

export const updateBlogCategory = async (
  id: string,
  name: string,
  slug: string,
  description: string | null,
): Promise<ActionResult<BlogCategory>> => {
  const categoryId = id.trim();
  const cleanName = name.trim();
  const cleanSlug = generateSlug(slug || name);

  if (!categoryId) {
    return { success: false, message: "Category ID is required." };
  }

  if (!cleanName) {
    return { success: false, message: "Category name is required." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: { id: categoryId, name: cleanName, slug: cleanSlug, description, created_at: new Date().toISOString() },
      message: "Category updated locally. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data: existing } = await supabase.from("blog_categories").select("id").eq("slug", cleanSlug).maybeSingle();

  if (existing && existing.id !== categoryId) {
    return { success: false, message: "Category slug is already in use." };
  }

  const { data, error } = await supabase
    .from("blog_categories")
    .update({ name: cleanName, slug: cleanSlug, description })
    .eq("id", categoryId)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, message: "Unable to update blog category." };
  }

  revalidateBlogs();
  return { success: true, data: data as BlogCategory, message: "Category updated." };
};

export const deleteBlogCategory = async (id: string): Promise<ActionResult<string>> => {
  const categoryId = id.trim();

  if (!categoryId) {
    return { success: false, message: "Category ID is required." };
  }

  if (!isSupabaseConfigured()) {
    return { success: true, data: categoryId, message: "Category removed locally. Connect Supabase to persist changes." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { error } = await supabase.from("blog_categories").delete().eq("id", categoryId);

  if (error) {
    return { success: false, message: "Unable to delete blog category." };
  }

  revalidateBlogs();
  return { success: true, data: categoryId, message: "Category deleted." };
};

export const getBlogTags = async (): Promise<BlogTag[]> => {
  if (!isSupabaseConfigured()) {
    return demoTags;
  }

  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from("blog_tags").select("*").order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as BlogTag[];
};

export const createBlogTag = async (formData: FormData): Promise<ActionResult<BlogTag>> => {
  const name = sanitizeText(formData.get("name"));
  const baseSlug = generateSlug(sanitizeText(formData.get("slug")) || name);

  if (!name) {
    return { success: false, message: "Tag name is required." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: { id: crypto.randomUUID(), name, slug: baseSlug, created_at: new Date().toISOString() },
      message: "Tag created locally. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  let slug = baseSlug;
  for (let i = 0; i < 8; i += 1) {
    const { data: slugData } = await supabase.from("blog_tags").select("id").eq("slug", slug).maybeSingle();
    if (!slugData) {
      break;
    }
    slug = `${baseSlug}-${randomSuffix()}`;
  }

  const { data, error } = await supabase
    .from("blog_tags")
    .insert({ name, slug })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, message: "Unable to create blog tag." };
  }

  revalidateBlogs();
  return { success: true, data: data as BlogTag, message: "Tag created." };
};

export const deleteBlogTag = async (id: string): Promise<ActionResult<string>> => {
  const tagId = id.trim();

  if (!tagId) {
    return { success: false, message: "Tag ID is required." };
  }

  if (!isSupabaseConfigured()) {
    return { success: true, data: tagId, message: "Tag removed locally. Connect Supabase to persist changes." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { error } = await supabase.from("blog_tags").delete().eq("id", tagId);

  if (error) {
    return { success: false, message: "Unable to delete blog tag." };
  }

  revalidateBlogs();
  return { success: true, data: tagId, message: "Tag deleted." };
};

export const uploadBlogImage = async (file: File): Promise<ActionResult<string>> => {
  if (!(file instanceof File) || !file.size) {
    return { success: false, message: "Choose an image file to upload." };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, message: "Upload a PNG, JPG, WebP, or GIF image." };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { success: false, message: "Blog images must be 5MB or smaller." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=800&fit=crop",
      message: "Image upload simulated locally. Connect Supabase to store files.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "blog-image";
  const path = `blogs/${Date.now()}-${safeName}.${extension === "jpeg" ? "jpg" : extension}`;

  const { error } = await supabase.storage.from("blog_images").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return { success: false, message: "Unable to upload blog image. Confirm the blog_images bucket exists and retry." };
  }

  const { data } = supabase.storage.from("blog_images").getPublicUrl(path);

  if (!data.publicUrl) {
    return { success: false, message: "Image uploaded, but no public URL was returned." };
  }

  return { success: true, data: data.publicUrl, message: "Blog image uploaded." };
};
