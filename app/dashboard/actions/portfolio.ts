"use server";

import { revalidatePath } from "next/cache";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActionResult, PortfolioCategory, PortfolioItem } from "@/types";

const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  "Business",
  "Healthcare",
  "E-commerce",
  "Education",
  "Real Estate",
  "Hospitality",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

const fallbackPortfolioItems: PortfolioItem[] = [
  {
    id: "elite-taxation",
    name: "Elite Taxation",
    category: "Business",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
    website_url: null,
    description: "Dark blue professional website mockup with Maximize Refunds. Minimize Stress.",
    display_order: 1,
    is_active: true,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: "carewell-clinic",
    name: "CareWell Clinic",
    category: "Healthcare",
    image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop",
    website_url: null,
    description: "Clean medical website with doctor image.",
    display_order: 2,
    is_active: true,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: "luxora-fashion",
    name: "Luxora Fashion",
    category: "E-commerce",
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop",
    website_url: null,
    description: "Fashion e-commerce site.",
    display_order: 3,
    is_active: true,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: "bright-future-academy",
    name: "Bright Future Academy",
    category: "Education",
    image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop",
    website_url: null,
    description: "Education website with student.",
    display_order: 4,
    is_active: true,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: "urbanspace-realty",
    name: "UrbanSpace Realty",
    category: "Real Estate",
    image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop",
    website_url: null,
    description: "Real estate website with property images.",
    display_order: 5,
    is_active: true,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: "taste-heaven",
    name: "Taste Heaven",
    category: "Hospitality",
    image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop",
    website_url: null,
    description: "Restaurant and food website.",
    display_order: 6,
    is_active: true,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
];

const normalizeCategory = (value: FormDataEntryValue | string | null): PortfolioCategory | null => {
  const category = typeof value === "string" ? value : "";
  return PORTFOLIO_CATEGORIES.includes(category as PortfolioCategory) ? (category as PortfolioCategory) : null;
};

const normalizeText = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

const normalizeUrl = (value: FormDataEntryValue | null) => {
  const url = normalizeText(value);
  return url || null;
};

const normalizeOrder = (value: FormDataEntryValue | null) => {
  const parsed = Number.parseInt(typeof value === "string" ? value : "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sortItems = (items: PortfolioItem[]) =>
  [...items].sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }

    return a.name.localeCompare(b.name);
  });

const getFileExtension = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "jpeg") {
    return "jpg";
  }

  if (ACCEPTED_EXTENSIONS.includes(extension)) {
    return extension;
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
};

const sanitizeFileName = (fileName: string) =>
  fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const validateFile = (file: File) => {
  const extension = getFileExtension(file);
  const validMime = ACCEPTED_MIME_TYPES.includes(file.type);
  const validExtension = ACCEPTED_EXTENSIONS.includes(extension);

  if (!validMime && !validExtension) {
    return "Upload a PNG, JPG, or WebP image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Portfolio images must be 2MB or smaller.";
  }

  return null;
};

const getStoragePathFromUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const marker = "/object/public/portfolio/";
    const index = parsed.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
};

const revalidatePortfolio = () => {
  revalidatePath("/lp/website-design");
  revalidatePath("/dashboard/portfolio");
};

const uploadPortfolioImage = async (file: File, category: PortfolioCategory) => {
  const validationMessage = validateFile(file);

  if (validationMessage) {
    return { url: null, path: null, message: validationMessage };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { url: null, path: null, message: "Supabase client unavailable." };
  }

  const extension = getFileExtension(file);
  const safeName = sanitizeFileName(file.name) || "portfolio";
  const folder = category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const path = `${folder}/${Date.now()}-${safeName}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || `image/${extension === "jpg" ? "jpeg" : extension}`,
    upsert: false,
  });

  if (uploadError) {
    return {
      url: null,
      path: null,
      message: "Unable to upload image. Confirm the portfolio storage bucket exists and retry.",
    };
  }

  const { data } = supabase.storage.from("portfolio").getPublicUrl(path);

  if (!data.publicUrl) {
    await supabase.storage.from("portfolio").remove([path]);
    return { url: null, path: null, message: "Image uploaded, but no public URL was returned." };
  }

  return { url: data.publicUrl, path, message: null };
};

export const getPortfolioItems = async (options?: {
  includeInactive?: boolean;
  useFallback?: boolean;
}): Promise<PortfolioItem[]> => {
  const useFallback = options?.useFallback ?? true;
  const fallback = useFallback ? fallbackPortfolioItems : [];

  if (!isSupabaseConfigured()) {
    return fallback;
  }

  const supabase = await createClient();

  if (!supabase) {
    return fallback;
  }

  let query = supabase
    .from("portfolio_items")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return fallback;
  }

  return sortItems(data as PortfolioItem[]);
};

export const createPortfolioItem = async (formData: FormData): Promise<ActionResult<PortfolioItem>> => {
  const name = normalizeText(formData.get("name"));
  const category = normalizeCategory(formData.get("category"));
  const websiteUrl = normalizeUrl(formData.get("website_url"));
  const description = normalizeUrl(formData.get("description"));
  const displayOrder = normalizeOrder(formData.get("display_order"));
  const file = formData.get("file");

  if (!name) {
    return { success: false, message: "Project name is required." };
  }

  if (!category) {
    return { success: false, message: "Choose a valid portfolio category." };
  }

  if (!(file instanceof File) || !file.size) {
    return { success: false, message: "Upload a portfolio image." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, message: "Supabase is not configured. Connect Supabase to save portfolio items." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const upload = await uploadPortfolioImage(file, category);

  if (!upload.url) {
    return { success: false, message: upload.message ?? "Unable to upload portfolio image." };
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .insert({
      name,
      category,
      image_url: upload.url,
      website_url: websiteUrl,
      description,
      display_order: displayOrder,
      is_active: true,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (upload.path) {
      await supabase.storage.from("portfolio").remove([upload.path]);
    }

    return {
      success: false,
      message: "Unable to save portfolio item. Run lib/supabase/migrations/004_portfolio_management.sql in Supabase, then retry.",
    };
  }

  revalidatePortfolio();

  return { success: true, data: data as PortfolioItem, message: "Portfolio item created." };
};

export const updatePortfolioItem = async (formData: FormData): Promise<ActionResult<PortfolioItem>> => {
  const id = normalizeText(formData.get("id"));
  const name = normalizeText(formData.get("name"));
  const category = normalizeCategory(formData.get("category"));
  const websiteUrl = normalizeUrl(formData.get("website_url"));
  const description = normalizeUrl(formData.get("description"));
  const displayOrder = normalizeOrder(formData.get("display_order"));
  const file = formData.get("file");

  if (!id) {
    return { success: false, message: "Portfolio item ID is required." };
  }

  if (!name) {
    return { success: false, message: "Project name is required." };
  }

  if (!category) {
    return { success: false, message: "Choose a valid portfolio category." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, message: "Supabase is not configured. Connect Supabase to update portfolio items." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data: existingItem, error: existingError } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("id", id)
    .single();

  if (existingError || !existingItem) {
    return { success: false, message: "Portfolio item not found." };
  }

  let imageUrl = (existingItem as PortfolioItem).image_url;
  let newStoragePath: string | null = null;

  if (file instanceof File && file.size) {
    const upload = await uploadPortfolioImage(file, category);

    if (!upload.url) {
      return { success: false, message: upload.message ?? "Unable to upload replacement image." };
    }

    imageUrl = upload.url;
    newStoragePath = upload.path;
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .update({
      name,
      category,
      image_url: imageUrl,
      website_url: websiteUrl,
      description,
      display_order: displayOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    if (newStoragePath) {
      await supabase.storage.from("portfolio").remove([newStoragePath]);
    }

    return { success: false, message: "Unable to update portfolio item." };
  }

  if (newStoragePath) {
    const previousPath = getStoragePathFromUrl((existingItem as PortfolioItem).image_url);

    if (previousPath) {
      await supabase.storage.from("portfolio").remove([previousPath]);
    }
  }

  revalidatePortfolio();

  return { success: true, data: data as PortfolioItem, message: "Portfolio item updated." };
};

export const deletePortfolioItem = async (item: PortfolioItem): Promise<ActionResult<string>> => {
  if (!isSupabaseConfigured()) {
    return { success: false, message: "Supabase is not configured. Connect Supabase to delete portfolio items." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const storagePath = getStoragePathFromUrl(item.image_url);

  if (storagePath) {
    await supabase.storage.from("portfolio").remove([storagePath]);
  }

  const { error } = await supabase.from("portfolio_items").delete().eq("id", item.id);

  if (error) {
    return { success: false, message: "Unable to delete portfolio item." };
  }

  revalidatePortfolio();

  return { success: true, data: item.id, message: "Portfolio item deleted." };
};
