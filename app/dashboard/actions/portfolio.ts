"use server";

import { revalidatePath } from "next/cache";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActionResult, PortfolioCategory, PortfolioItem, PortfolioVersion } from "@/types";

const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  "Business",
  "Healthcare",
  "E-commerce",
  "Education",
  "Real Estate",
  "Hospitality",
];
const PORTFOLIO_VERSIONS: PortfolioVersion[] = ["v1", "v2"];
const PORTFOLIO_SELECT_FIELDS = "id,name,category,image_url,image_id,website_url,description,display_order,is_active,created_at,updated_at";
const LEGACY_PORTFOLIO_SELECT_FIELDS = "id,name,category,image_url,website_url,description,display_order,is_active,created_at,updated_at";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

const defaultPortfolioItems: PortfolioItem[] = [
  {
    id: "elite-taxation",
    name: "Elite Taxation",
    category: "Business",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
    website_url: null,
    description: "Dark blue professional website mockup with Maximize Refunds. Minimize Stress.",
    display_order: 1,
    is_active: true,
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
  },
];

const categoryLabels: Record<PortfolioCategory, string> = {
  Business: "Finance / Taxation",
  Healthcare: "Healthcare",
  "E-commerce": "E-commerce",
  Education: "Education",
  "Real Estate": "Real Estate",
  Hospitality: "Hospitality / Restaurant",
};

const defaultImageByCategory = (category: PortfolioCategory) =>
  defaultPortfolioItems.find((item) => item.category === category)?.image_url ?? defaultPortfolioItems[0].image_url;

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

const normalizeCategory = (value: FormDataEntryValue | string | null): PortfolioCategory => {
  const category = typeof value === "string" ? value : "Business";
  return PORTFOLIO_CATEGORIES.includes(category as PortfolioCategory)
    ? (category as PortfolioCategory)
    : "Business";
};

const normalizeBoolean = (value: FormDataEntryValue | null, fallback = true) => {
  if (typeof value !== "string") {
    return fallback;
  }

  return value === "true" || value === "on" || value === "1";
};

const normalizeNumber = (value: FormDataEntryValue | null, fallback = 0) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePortfolioVersion = (value: unknown): PortfolioVersion =>
  PORTFOLIO_VERSIONS.includes(value as PortfolioVersion) ? (value as PortfolioVersion) : "v1";

const normalizePortfolioItem = (item: PortfolioItem): PortfolioItem => ({
  ...item,
  category: normalizeCategory(item.category),
  image_id: item.image_id ?? null,
  website_url: item.website_url?.trim() || null,
  description: item.description?.trim() || categoryLabels[normalizeCategory(item.category)],
  display_order: item.display_order ?? 0,
  is_active: item.is_active ?? true,
});

const sortPortfolioItems = (items: PortfolioItem[]) =>
  [...items].sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }

    return a.name.localeCompare(b.name);
  });

const applyAssignedPortfolioImages = async (
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  items: PortfolioItem[],
) => {
  const assignedImageIds = [...new Set(items.map((item) => item.image_id).filter(Boolean))] as string[];

  if (!assignedImageIds.length) {
    return items;
  }

  const { data, error } = await supabase
    .from("images")
    .select("id,url,category")
    .in("id", assignedImageIds)
    .eq("category", "Portfolio");

  if (error || !data) {
    return items;
  }

  const imageUrlById = new Map((data as Array<{ id: string; url: string }>).map((image) => [image.id, image.url]));

  return items.map((item) => {
    if (!item.image_id) {
      return item;
    }

    return {
      ...item,
      image_url: imageUrlById.get(item.image_id) ?? defaultImageByCategory(item.category),
    };
  });
};

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
  revalidatePath("/dashboard/images");
};

const uploadPortfolioImage = async (file: File, category: PortfolioCategory) => {
  const validationMessage = validateFile(file);

  if (validationMessage) {
    return { error: validationMessage };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase client unavailable." };
  }

  const extension = getFileExtension(file);
  const safeName = sanitizeFileName(file.name) || "portfolio";
  const folder = category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const path = `${folder}/${Date.now()}-${safeName}.${extension}`;
  const { error } = await supabase.storage.from("portfolio").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || `image/${extension === "jpg" ? "jpeg" : extension}`,
    upsert: false,
  });

  if (error) {
    return { error: "Unable to upload image. Confirm the portfolio bucket exists and retry." };
  }

  const { data } = supabase.storage.from("portfolio").getPublicUrl(path);

  if (!data.publicUrl) {
    await supabase.storage.from("portfolio").remove([path]);
    return { error: "Image uploaded, but no public URL was returned." };
  }

  return { url: data.publicUrl, path };
};

export const getDefaultPortfolioItems = async () => sortPortfolioItems(defaultPortfolioItems);

export async function getPortfolioVersion(): Promise<PortfolioVersion> {
  if (!isSupabaseConfigured()) {
    return "v1";
  }

  const supabase = await createClient();

  if (!supabase) {
    return "v1";
  }

  const { data, error } = await supabase
    .from("settings")
    .select("portfolio_version")
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return "v1";
  }

  return normalizePortfolioVersion(data.portfolio_version);
}

export async function setPortfolioVersion(version: PortfolioVersion): Promise<ActionResult<PortfolioVersion>> {
  const portfolioVersion = normalizePortfolioVersion(version);

  if (!isSupabaseConfigured()) {
    revalidatePortfolio();
    return {
      success: true,
      data: portfolioVersion,
      message: "Portfolio display style updated locally. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase
    .from("settings")
    .update({ portfolio_version: portfolioVersion })
    .neq("portfolio_version", "__never__")
    .select("portfolio_version")
    .limit(1)
    .maybeSingle();

  if (!error && data) {
    revalidatePortfolio();
    return { success: true, data: normalizePortfolioVersion(data.portfolio_version), message: "Portfolio display style saved." };
  }

  const { data: insertedData, error: insertError } = await supabase
    .from("settings")
    .insert({ portfolio_version: portfolioVersion })
    .select("portfolio_version")
    .single();

  if (insertError || !insertedData) {
    return {
      success: false,
      message: "Unable to save display style. Run lib/supabase/migrations/005_portfolio_version.sql in Supabase, then retry.",
    };
  }

  revalidatePortfolio();

  return {
    success: true,
    data: normalizePortfolioVersion(insertedData.portfolio_version),
    message: "Portfolio display style saved.",
  };
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  if (!isSupabaseConfigured()) {
    return sortPortfolioItems(defaultPortfolioItems);
  }

  const supabase = await createClient();

  if (!supabase) {
    return sortPortfolioItems(defaultPortfolioItems);
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .select(PORTFOLIO_SELECT_FIELDS)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    const { data: legacyData, error: legacyError } = await supabase
      .from("portfolio_items")
      .select(LEGACY_PORTFOLIO_SELECT_FIELDS)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!legacyError && legacyData) {
      const legacyItems = sortPortfolioItems((legacyData as PortfolioItem[]).map(normalizePortfolioItem));
      return applyAssignedPortfolioImages(supabase, legacyItems);
    }

    return sortPortfolioItems(defaultPortfolioItems);
  }

  const items = sortPortfolioItems((data as PortfolioItem[]).map(normalizePortfolioItem));
  return applyAssignedPortfolioImages(supabase, items);
}

export async function getActivePortfolioItems(): Promise<PortfolioItem[]> {
  const items = await getPortfolioItems();
  const activeItems = items.filter((item) => item.is_active);
  return activeItems.length ? activeItems : sortPortfolioItems(defaultPortfolioItems);
}

export async function createPortfolioItem(formData: FormData): Promise<ActionResult<PortfolioItem>> {
  const name = String(formData.get("name") ?? "").trim();
  const category = normalizeCategory(formData.get("category"));
  const file = formData.get("image");
  const websiteUrl = String(formData.get("website_url") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const displayOrder = normalizeNumber(formData.get("display_order"));
  const isActive = normalizeBoolean(formData.get("is_active"), true);

  if (!name) {
    return { success: false, message: "Project name is required." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Choose a portfolio image to upload." };
  }

  const validationMessage = validateFile(file);

  if (validationMessage) {
    return { success: false, message: validationMessage };
  }

  if (!isSupabaseConfigured()) {
    const preview: PortfolioItem = {
      id: crypto.randomUUID(),
      name,
      category,
      image_url: defaultImageByCategory(category),
      website_url: websiteUrl,
      description,
      display_order: displayOrder,
      is_active: isActive,
      created_at: new Date().toISOString(),
    };

    return {
      success: true,
      data: preview,
      message: "Portfolio item added locally. Connect Supabase to persist changes.",
    };
  }

  const uploaded = await uploadPortfolioImage(file, category);

  if (uploaded.error || !uploaded.url) {
    return { success: false, message: uploaded.error ?? "Unable to upload image." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .insert({
      name,
      category,
      image_url: uploaded.url,
      website_url: websiteUrl,
      description,
      display_order: displayOrder,
      is_active: isActive,
    })
    .select("id,name,category,image_url,website_url,description,display_order,is_active,created_at,updated_at")
    .single();

  if (error || !data) {
    await supabase.storage.from("portfolio").remove([uploaded.path!]);
    return {
      success: false,
      message: "Unable to save portfolio item. Run lib/supabase/migrations/004_portfolio_management.sql in Supabase, then retry.",
    };
  }

  revalidatePortfolio();

  return { success: true, data: normalizePortfolioItem(data as PortfolioItem), message: "Portfolio item created." };
}

export async function updatePortfolioItem(formData: FormData): Promise<ActionResult<PortfolioItem>> {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = normalizeCategory(formData.get("category"));
  const file = formData.get("image");
  const websiteUrl = String(formData.get("website_url") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const displayOrder = normalizeNumber(formData.get("display_order"));
  const isActive = normalizeBoolean(formData.get("is_active"), true);

  if (!id) {
    return { success: false, message: "Portfolio item ID is required." };
  }

  if (!name) {
    return { success: false, message: "Project name is required." };
  }

  if (file instanceof File && file.size > 0) {
    const validationMessage = validateFile(file);

    if (validationMessage) {
      return { success: false, message: validationMessage };
    }
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: {
        id,
        name,
        category,
        image_url: file instanceof File && file.size > 0 ? defaultImageByCategory(category) : String(formData.get("current_image_url") ?? defaultImageByCategory(category)),
        website_url: websiteUrl,
        description,
        display_order: displayOrder,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      },
      message: "Portfolio item updated locally. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data: existingData, error: existingError } = await supabase
    .from("portfolio_items")
    .select("id,name,category,image_url,website_url,description,display_order,is_active,created_at,updated_at")
    .eq("id", id)
    .single();

  if (existingError || !existingData) {
    return { success: false, message: "Portfolio item not found." };
  }

  const existing = normalizePortfolioItem(existingData as PortfolioItem);
  let imageUrl = existing.image_url;
  let uploadedPath: string | null = null;

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadPortfolioImage(file, category);

    if (uploaded.error || !uploaded.url) {
      return { success: false, message: uploaded.error ?? "Unable to upload image." };
    }

    imageUrl = uploaded.url;
    uploadedPath = uploaded.path ?? null;
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
      is_active: isActive,
    })
    .eq("id", id)
    .select("id,name,category,image_url,website_url,description,display_order,is_active,created_at,updated_at")
    .single();

  if (error || !data) {
    if (uploadedPath) {
      await supabase.storage.from("portfolio").remove([uploadedPath]);
    }

    return { success: false, message: "Unable to update portfolio item." };
  }

  if (uploadedPath) {
    const previousPath = getStoragePathFromUrl(existing.image_url);

    if (previousPath) {
      await supabase.storage.from("portfolio").remove([previousPath]);
    }
  }

  revalidatePortfolio();

  return { success: true, data: normalizePortfolioItem(data as PortfolioItem), message: "Portfolio item updated." };
}

export async function assignPortfolioImage(portfolioItemId: string, imageId: string | null): Promise<ActionResult<PortfolioItem>> {
  const id = portfolioItemId.trim();

  if (!id) {
    return { success: false, message: "Portfolio item ID is required." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, message: "Supabase is not configured. Connect Supabase to assign portfolio images." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data: existingData, error: existingError } = await supabase
    .from("portfolio_items")
    .select(PORTFOLIO_SELECT_FIELDS)
    .eq("id", id)
    .single();

  if (existingError || !existingData) {
    return { success: false, message: "Portfolio item not found. Run lib/supabase/migrations/006_portfolio_image_assignments.sql in Supabase, then retry." };
  }

  const existing = normalizePortfolioItem(existingData as PortfolioItem);
  let nextImageUrl = defaultImageByCategory(existing.category);
  let nextImageId: string | null = null;

  if (imageId) {
    const { data: imageData, error: imageError } = await supabase
      .from("images")
      .select("id,url,category")
      .eq("id", imageId)
      .eq("category", "Portfolio")
      .single();

    if (imageError || !imageData) {
      return { success: false, message: "Choose an image tagged as Portfolio." };
    }

    nextImageUrl = imageData.url;
    nextImageId = imageData.id;
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .update({ image_id: nextImageId, image_url: nextImageUrl })
    .eq("id", id)
    .select(PORTFOLIO_SELECT_FIELDS)
    .single();

  if (error || !data) {
    return { success: false, message: "Unable to assign portfolio image. Run lib/supabase/migrations/006_portfolio_image_assignments.sql in Supabase, then retry." };
  }

  revalidatePortfolio();

  return {
    success: true,
    data: normalizePortfolioItem(data as PortfolioItem),
    message: imageId ? "Portfolio image assigned." : "Portfolio image reset to default.",
  };
}

export async function deletePortfolioItem(item: PortfolioItem): Promise<ActionResult<string>> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: item.id, message: "Portfolio item removed locally. Connect Supabase to persist changes." };
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
}
