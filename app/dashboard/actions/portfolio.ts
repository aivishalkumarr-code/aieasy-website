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
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

const defaultStats = [
  { value: "98%", label: "Client Satisfaction" },
  { value: "40%+", label: "Lead Growth" },
  { value: "1.8s", label: "Fast Loading" },
  { value: "24/7", label: "Support" },
];

const defaultFeatures = ["Custom Design", "Mobile First", "SEO Ready", "Fast Loading"];

const defaultPortfolioItems: PortfolioItem[] = [
  {
    id: "elite-taxation",
    title: "Elite Taxation",
    name: "Elite Taxation",
    category: "Business",
    description: "Maximize Refunds. Minimize Stress.",
    client_name: "Elite Taxation",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=780&fit=crop",
    image_id: null,
    stats: [
      { value: "8,500+", label: "Returns Filed" },
      { value: "98%", label: "Client Satisfaction" },
      { value: "$2M+", label: "Revenue Generated" },
      { value: "7+", label: "Years Experience" },
    ],
    features: defaultFeatures,
    live_url: null,
    website_url: null,
    order_index: 1,
    display_order: 1,
    is_active: true,
  },
  {
    id: "carewell-clinic",
    title: "CareWell Clinic",
    name: "CareWell Clinic",
    category: "Healthcare",
    description: "Compassionate Care For Better Health",
    client_name: "CareWell Clinic",
    image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=780&fit=crop",
    image_id: null,
    stats: [
      { value: "12K+", label: "Patients Served" },
      { value: "99%", label: "Client Satisfaction" },
      { value: "45%", label: "Bookings Growth" },
      { value: "24/7", label: "Online Booking" },
    ],
    features: defaultFeatures,
    live_url: null,
    website_url: null,
    order_index: 2,
    display_order: 2,
    is_active: true,
  },
  {
    id: "luxora-fashion",
    title: "Luxora Fashion",
    name: "Luxora Fashion",
    category: "E-commerce",
    description: "New Season New You",
    client_name: "Luxora Fashion",
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=780&fit=crop",
    image_id: null,
    stats: [
      { value: "3.2x", label: "Revenue Generated" },
      { value: "96%", label: "Client Satisfaction" },
      { value: "1.8s", label: "Load Time" },
      { value: "42%", label: "Repeat Buyers" },
    ],
    features: defaultFeatures,
    live_url: null,
    website_url: null,
    order_index: 3,
    display_order: 3,
    is_active: true,
  },
  {
    id: "bright-future-academy",
    title: "Bright Future Academy",
    name: "Bright Future Academy",
    category: "Education",
    description: "Education Today Success Tomorrow",
    client_name: "Bright Future Academy",
    image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=780&fit=crop",
    image_id: null,
    stats: [
      { value: "2,400+", label: "Students Enrolled" },
      { value: "98%", label: "Client Satisfaction" },
      { value: "6", label: "Programs Built" },
      { value: "45%", label: "Inquiry Growth" },
    ],
    features: defaultFeatures,
    live_url: null,
    website_url: null,
    order_index: 4,
    display_order: 4,
    is_active: true,
  },
  {
    id: "urbanspace-realty",
    title: "UrbanSpace Realty",
    name: "UrbanSpace Realty",
    category: "Real Estate",
    description: "Find The Perfect Place To Call Home",
    client_name: "UrbanSpace Realty",
    image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=780&fit=crop",
    image_id: null,
    stats: [
      { value: "180+", label: "Listings Managed" },
      { value: "97%", label: "Client Satisfaction" },
      { value: "64%", label: "Lead Growth" },
      { value: "9", label: "Markets Served" },
    ],
    features: defaultFeatures,
    live_url: null,
    website_url: null,
    order_index: 5,
    display_order: 5,
    is_active: true,
  },
  {
    id: "taste-heaven",
    title: "Taste Heaven",
    name: "Taste Heaven",
    category: "Hospitality",
    description: "Delicious Food Great Experience",
    client_name: "Taste Heaven",
    image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=780&fit=crop",
    image_id: null,
    stats: [
      { value: "22K+", label: "Orders Generated" },
      { value: "98%", label: "Client Satisfaction" },
      { value: "35%", label: "Booking Growth" },
      { value: "15m", label: "Avg Response" },
    ],
    features: defaultFeatures,
    live_url: null,
    website_url: null,
    order_index: 6,
    display_order: 6,
    is_active: true,
  },
];

const normalizeCategory = (value: unknown): PortfolioCategory => {
  const category = typeof value === "string" ? value : "Business";
  return PORTFOLIO_CATEGORIES.includes(category as PortfolioCategory) ? (category as PortfolioCategory) : "Business";
};

const normalizePortfolioVersion = (value: unknown): PortfolioVersion =>
  PORTFOLIO_VERSIONS.includes(value as PortfolioVersion) ? (value as PortfolioVersion) : "v2";

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

const parseLines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const parseStats = (value: FormDataEntryValue | null) => {
  const parsed = parseLines(value)
    .map((line) => {
      const [valuePart, ...labelParts] = line.split("|");
      return { value: valuePart?.trim() ?? "", label: labelParts.join("|").trim() };
    })
    .filter((stat) => stat.value && stat.label);

  return parsed.length ? parsed : defaultStats;
};

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

  if (!ACCEPTED_MIME_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(extension)) {
    return "Upload a PNG, JPG, or WebP image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Portfolio images must be 3MB or smaller.";
  }

  return null;
};

const getStoragePathFromUrl = (url: string, bucket: string) => {
  try {
    const parsed = new URL(url);
    const marker = `/object/public/${bucket}/`;
    const index = parsed.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
};

const normalizePortfolioItem = (raw: Record<string, unknown>): PortfolioItem => {
  const title = String(raw.title ?? raw.name ?? "Untitled Project");
  const category = normalizeCategory(raw.category);
  const liveUrl = typeof raw.live_url === "string" ? raw.live_url : typeof raw.website_url === "string" ? raw.website_url : null;
  const orderIndex = Number(raw.order_index ?? raw.display_order ?? 0);
  const rawStats = Array.isArray(raw.stats) ? raw.stats : defaultStats;
  const stats = rawStats
    .map((stat) => {
      if (!stat || typeof stat !== "object") {
        return null;
      }

      const entry = stat as Record<string, unknown>;
      return { value: String(entry.value ?? ""), label: String(entry.label ?? "") };
    })
    .filter((stat): stat is { value: string; label: string } => Boolean(stat?.value && stat.label));
  const features = Array.isArray(raw.features)
    ? raw.features.map((feature) => String(feature).trim()).filter(Boolean)
    : defaultFeatures;

  return {
    id: String(raw.id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
    title,
    name: title,
    category,
    description: typeof raw.description === "string" ? raw.description : null,
    client_name: typeof raw.client_name === "string" ? raw.client_name : title,
    image_url: String(raw.image_url ?? defaultPortfolioItems.find((item) => item.category === category)?.image_url ?? defaultPortfolioItems[0].image_url),
    image_id: typeof raw.image_id === "string" ? raw.image_id : null,
    stats: stats.length ? stats : defaultStats,
    features: features.length ? features : defaultFeatures,
    live_url: liveUrl,
    website_url: liveUrl,
    order_index: Number.isFinite(orderIndex) ? orderIndex : 0,
    display_order: Number.isFinite(orderIndex) ? orderIndex : 0,
    is_active: typeof raw.is_active === "boolean" ? raw.is_active : true,
    created_at: typeof raw.created_at === "string" ? raw.created_at : undefined,
    updated_at: typeof raw.updated_at === "string" ? raw.updated_at : undefined,
  };
};

const sortPortfolioItems = (items: PortfolioItem[]) =>
  [...items].sort((a, b) => {
    if (a.order_index !== b.order_index) {
      return a.order_index - b.order_index;
    }

    return a.title.localeCompare(b.title);
  });

const revalidatePortfolio = () => {
  revalidatePath("/lp/website-design");
  revalidatePath("/dashboard/portfolio");
};

const uploadPortfolioImage = async (file: File, category: PortfolioCategory, title: string) => {
  const validationMessage = validateFile(file);

  if (validationMessage) {
    return { error: validationMessage };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase client unavailable." };
  }

  const extension = getFileExtension(file);
  const safeTitle = sanitizeFileName(title) || "portfolio";
  const safeName = sanitizeFileName(file.name) || safeTitle;
  const folder = category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const path = `portfolio/${folder}/${Date.now()}-${safeName}.${extension}`;
  const { error } = await supabase.storage.from("images").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || `image/${extension === "jpg" ? "jpeg" : extension}`,
    upsert: false,
  });

  if (error) {
    return { error: "Unable to upload image. Confirm the images bucket exists and retry." };
  }

  const { data } = supabase.storage.from("images").getPublicUrl(path);

  if (!data.publicUrl) {
    await supabase.storage.from("images").remove([path]);
    return { error: "Image uploaded, but no public URL was returned." };
  }

  const { data: imageData } = await supabase
    .from("images")
    .insert({ url: data.publicUrl, filename: `${safeTitle}.${extension}`, category: "Portfolio", file_size: file.size })
    .select("id")
    .maybeSingle();

  return { url: data.publicUrl, path, imageId: imageData?.id as string | undefined };
};

export const getDefaultPortfolioItems = async () => sortPortfolioItems(defaultPortfolioItems);

export async function getPortfolioVersion(): Promise<PortfolioVersion> {
  if (!isSupabaseConfigured()) {
    return "v2";
  }

  const supabase = await createClient();

  if (!supabase) {
    return "v2";
  }

  const { data, error } = await supabase
    .from("lp_settings")
    .select("value")
    .eq("key", "portfolio_version")
    .maybeSingle();

  if (error || !data) {
    return "v2";
  }

  return normalizePortfolioVersion(data.value);
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
    .from("lp_settings")
    .upsert({ key: "portfolio_version", value: portfolioVersion }, { onConflict: "key" })
    .select("value")
    .single();

  if (error || !data) {
    return {
      success: false,
      message: "Unable to save display style. Run lib/supabase/migrations/006_portfolio_items.sql in Supabase, then retry.",
    };
  }

  revalidatePortfolio();

  return { success: true, data: normalizePortfolioVersion(data.value), message: "Portfolio display style saved." };
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
    .select("id,title,category,description,client_name,image_url,image_id,stats,features,live_url,order_index,is_active,created_at,updated_at")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return sortPortfolioItems(defaultPortfolioItems);
  }

  return sortPortfolioItems((data as Array<Record<string, unknown>>).map(normalizePortfolioItem));
}

export async function getActivePortfolioItems(): Promise<PortfolioItem[]> {
  const items = await getPortfolioItems();
  const activeItems = items.filter((item) => item.is_active);
  return activeItems.length ? activeItems : sortPortfolioItems(defaultPortfolioItems);
}

export async function createPortfolioItem(formData: FormData): Promise<ActionResult<PortfolioItem>> {
  const title = String(formData.get("title") ?? formData.get("name") ?? "").trim();
  const category = normalizeCategory(formData.get("category"));
  const description = String(formData.get("description") ?? "").trim() || null;
  const clientName = String(formData.get("client_name") ?? "").trim() || title;
  const liveUrl = String(formData.get("live_url") ?? formData.get("website_url") ?? "").trim() || null;
  const orderIndex = normalizeNumber(formData.get("order_index") ?? formData.get("display_order"));
  const isActive = normalizeBoolean(formData.get("is_active"), true);
  const stats = parseStats(formData.get("stats"));
  const features = parseLines(formData.get("features"));
  const file = formData.get("image");
  let imageUrl = String(formData.get("image_url") ?? "").trim();
  let imageId = String(formData.get("image_id") ?? "").trim() || null;

  if (!title) {
    return { success: false, message: "Project title is required." };
  }

  if (file instanceof File && file.size > 0) {
    const validationMessage = validateFile(file);

    if (validationMessage) {
      return { success: false, message: validationMessage };
    }
  }

  if (!imageUrl && !(file instanceof File && file.size > 0)) {
    imageUrl = defaultPortfolioItems.find((item) => item.category === category)?.image_url ?? defaultPortfolioItems[0].image_url;
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: normalizePortfolioItem({
        id: crypto.randomUUID(),
        title,
        category,
        description,
        client_name: clientName,
        image_url: imageUrl,
        image_id: imageId,
        stats,
        features,
        live_url: liveUrl,
        order_index: orderIndex,
        is_active: isActive,
        created_at: new Date().toISOString(),
      }),
      message: "Portfolio item added locally. Connect Supabase to persist changes.",
    };
  }

  let uploadedPath: string | null = null;

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadPortfolioImage(file, category, title);

    if (uploaded.error || !uploaded.url) {
      return { success: false, message: uploaded.error ?? "Unable to upload image." };
    }

    imageUrl = uploaded.url;
    imageId = uploaded.imageId ?? imageId;
    uploadedPath = uploaded.path ?? null;
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .insert({
      title,
      category,
      description,
      client_name: clientName,
      image_url: imageUrl,
      image_id: imageId,
      stats,
      features: features.length ? features : defaultFeatures,
      live_url: liveUrl,
      order_index: orderIndex,
      is_active: isActive,
    })
    .select("id,title,category,description,client_name,image_url,image_id,stats,features,live_url,order_index,is_active,created_at,updated_at")
    .single();

  if (error || !data) {
    if (uploadedPath) {
      await supabase.storage.from("images").remove([uploadedPath]);
    }

    return {
      success: false,
      message: "Unable to save portfolio item. Run lib/supabase/migrations/006_portfolio_items.sql in Supabase, then retry.",
    };
  }

  revalidatePortfolio();

  return { success: true, data: normalizePortfolioItem(data as Record<string, unknown>), message: "Portfolio item created." };
}

export async function updatePortfolioItem(formData: FormData): Promise<ActionResult<PortfolioItem>> {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? formData.get("name") ?? "").trim();
  const category = normalizeCategory(formData.get("category"));
  const description = String(formData.get("description") ?? "").trim() || null;
  const clientName = String(formData.get("client_name") ?? "").trim() || title;
  const liveUrl = String(formData.get("live_url") ?? formData.get("website_url") ?? "").trim() || null;
  const orderIndex = normalizeNumber(formData.get("order_index") ?? formData.get("display_order"));
  const isActive = normalizeBoolean(formData.get("is_active"), true);
  const stats = parseStats(formData.get("stats"));
  const features = parseLines(formData.get("features"));
  const file = formData.get("image");
  let imageUrl = String(formData.get("image_url") ?? formData.get("current_image_url") ?? "").trim();
  let imageId = String(formData.get("image_id") ?? "").trim() || null;

  if (!id) {
    return { success: false, message: "Portfolio item ID is required." };
  }

  if (!title) {
    return { success: false, message: "Project title is required." };
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
      data: normalizePortfolioItem({
        id,
        title,
        category,
        description,
        client_name: clientName,
        image_url: imageUrl || defaultPortfolioItems.find((item) => item.category === category)?.image_url,
        image_id: imageId,
        stats,
        features,
        live_url: liveUrl,
        order_index: orderIndex,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      }),
      message: "Portfolio item updated locally. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data: existingData } = await supabase
    .from("portfolio_items")
    .select("id,title,category,description,client_name,image_url,image_id,stats,features,live_url,order_index,is_active,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (!existingData) {
    return { success: false, message: "Portfolio item not found." };
  }

  const existing = normalizePortfolioItem(existingData as Record<string, unknown>);
  imageUrl = imageUrl || existing.image_url;
  imageId = imageId || existing.image_id;
  let uploadedPath: string | null = null;

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadPortfolioImage(file, category, title);

    if (uploaded.error || !uploaded.url) {
      return { success: false, message: uploaded.error ?? "Unable to upload image." };
    }

    imageUrl = uploaded.url;
    imageId = uploaded.imageId ?? imageId;
    uploadedPath = uploaded.path ?? null;
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .update({
      title,
      category,
      description,
      client_name: clientName,
      image_url: imageUrl,
      image_id: imageId,
      stats,
      features: features.length ? features : defaultFeatures,
      live_url: liveUrl,
      order_index: orderIndex,
      is_active: isActive,
    })
    .eq("id", id)
    .select("id,title,category,description,client_name,image_url,image_id,stats,features,live_url,order_index,is_active,created_at,updated_at")
    .single();

  if (error || !data) {
    if (uploadedPath) {
      await supabase.storage.from("images").remove([uploadedPath]);
    }

    return { success: false, message: "Unable to update portfolio item." };
  }

  if (uploadedPath) {
    const previousPath = getStoragePathFromUrl(existing.image_url, "images");

    if (previousPath) {
      await supabase.storage.from("images").remove([previousPath]);
    }
  }

  revalidatePortfolio();

  return { success: true, data: normalizePortfolioItem(data as Record<string, unknown>), message: "Portfolio item updated." };
}

export async function deletePortfolioItem(item: PortfolioItem): Promise<ActionResult<string>> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: item.id, message: "Portfolio item removed locally. Connect Supabase to persist changes." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const storagePath = getStoragePathFromUrl(item.image_url, "images");

  if (storagePath) {
    await supabase.storage.from("images").remove([storagePath]);
  }

  const { error } = await supabase.from("portfolio_items").delete().eq("id", item.id);

  if (error) {
    return { success: false, message: "Unable to delete portfolio item." };
  }

  revalidatePortfolio();

  return { success: true, data: item.id, message: "Portfolio item deleted." };
}
