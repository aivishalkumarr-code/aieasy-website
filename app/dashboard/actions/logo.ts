"use server";

import { revalidatePath } from "next/cache";

import { DEFAULT_LOGO_URL } from "@/lib/logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActionResult, LogoType, ManagedLogo } from "@/types";

/*
-- Logos table
CREATE TABLE IF NOT EXISTS logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('main', 'favicon', 'og_image')),
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage bucket already created via SQL
*/

const LOGO_TYPES: LogoType[] = ["main", "favicon", "og_image"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const ACCEPTED_EXTENSIONS = ["png", "jpg", "jpeg", "svg"];

interface UploadLogoResult {
  url: string;
  path: string;
}

const createDefaultLogo = (type: LogoType = "main"): ManagedLogo => ({
  id: type,
  type,
  url: DEFAULT_LOGO_URL,
  width: type === "favicon" ? 32 : type === "og_image" ? 1200 : 400,
  height: type === "favicon" ? 32 : type === "og_image" ? 630 : 80,
  file_size: null,
  created_at: new Date().toISOString(),
});

const normalizeType = (value: FormDataEntryValue | string | null): LogoType => {
  const type = typeof value === "string" ? value : "main";
  return LOGO_TYPES.includes(type as LogoType) ? (type as LogoType) : "main";
};

const normalizeLogo = (logo: Partial<ManagedLogo> & { type: LogoType; url: string }): ManagedLogo => ({
  id: logo.id ?? logo.type,
  type: logo.type,
  url: logo.url || DEFAULT_LOGO_URL,
  width: logo.width ?? null,
  height: logo.height ?? null,
  file_size: null,
  created_at: logo.created_at,
});

const getFileExtension = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "jpeg") {
    return "jpg";
  }

  if (ACCEPTED_EXTENSIONS.includes(extension)) {
    return extension;
  }

  if (file.type === "image/svg+xml") {
    return "svg";
  }

  if (file.type === "image/png") {
    return "png";
  }

  return "jpg";
};

const validateLogoType = (type: LogoType) => LOGO_TYPES.includes(type);

const validateFile = (file: File) => {
  const extension = getFileExtension(file);
  const validMime = ACCEPTED_MIME_TYPES.includes(file.type);
  const validExtension = ACCEPTED_EXTENSIONS.includes(extension);

  if (!validMime && !validExtension) {
    return "Upload a PNG, JPG, or SVG logo file.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Logo files must be 2MB or smaller.";
  }

  return null;
};

const revalidateLogoPaths = () => {
  revalidatePath("/");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/logo");
};

export async function getCurrentLogo(): Promise<ManagedLogo> {
  if (!isSupabaseConfigured()) {
    return createDefaultLogo("main");
  }

  const supabase = await createClient();

  if (!supabase) {
    return createDefaultLogo("main");
  }

  const { data, error } = await supabase
    .from("logos")
    .select("id,type,url,width,height,created_at")
    .eq("type", "main")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return createDefaultLogo("main");
  }

  return normalizeLogo(data as ManagedLogo);
}

export async function getLogos(): Promise<ManagedLogo[]> {
  if (!isSupabaseConfigured()) {
    return [createDefaultLogo("main")];
  }

  const supabase = await createClient();

  if (!supabase) {
    return [createDefaultLogo("main")];
  }

  const { data, error } = await supabase
    .from("logos")
    .select("id,type,url,width,height,created_at")
    .in("type", LOGO_TYPES)
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return [createDefaultLogo("main")];
  }

  const latestByType = new Map<LogoType, ManagedLogo>();

  for (const logo of data as ManagedLogo[]) {
    if (!latestByType.has(logo.type)) {
      latestByType.set(logo.type, normalizeLogo(logo));
    }
  }

  return [...latestByType.values()];
}

export async function getLogoByType(type: LogoType = "main"): Promise<ManagedLogo> {
  if (!validateLogoType(type)) {
    return createDefaultLogo("main");
  }

  const logos = await getLogos();
  return logos.find((logo) => logo.type === type) ?? createDefaultLogo(type);
}

export async function getMainLogoUrl() {
  const logo = await getCurrentLogo();
  return logo.url || DEFAULT_LOGO_URL;
}

export async function uploadLogo(formData: FormData): Promise<ActionResult<UploadLogoResult>> {
  const file = formData.get("file");
  const type = normalizeType(formData.get("type"));

  if (!(file instanceof File)) {
    return { success: false, message: "Choose a logo file to upload." };
  }

  const validationMessage = validateFile(file);

  if (validationMessage) {
    return { success: false, message: validationMessage };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, message: "Supabase is not configured. Connect Supabase to upload logos." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const extension = getFileExtension(file);
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const path = `${type}/${Date.now()}-${safeName || "logo"}.${extension}`;

  const { error } = await supabase.storage.from("logos").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || (extension === "svg" ? "image/svg+xml" : "image/jpeg"),
    upsert: true,
  });

  if (error) {
    return {
      success: false,
      message: "Unable to upload logo to Supabase Storage. Confirm the logos bucket exists and retry.",
    };
  }

  const { data } = supabase.storage.from("logos").getPublicUrl(path);

  if (!data.publicUrl) {
    return { success: false, message: "Logo uploaded, but no public URL was returned." };
  }

  return { success: true, data: { url: data.publicUrl, path } };
}

export async function saveLogoToDatabase(
  url: string,
  type: LogoType,
  width: number | null,
  height: number | null,
): Promise<ActionResult<ManagedLogo>> {
  if (!validateLogoType(type)) {
    return { success: false, message: "Unsupported logo type." };
  }

  if (!url.trim()) {
    return { success: false, message: "Logo URL is required." };
  }

  const fallbackLogo = normalizeLogo({
    id: type,
    type,
    url: url.trim(),
    width,
    height,
    created_at: new Date().toISOString(),
  });

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: fallbackLogo,
      message: "Logo saved in demo mode. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase
    .from("logos")
    .insert({
      type,
      url: url.trim(),
      width,
      height,
    })
    .select("id,type,url,width,height,created_at")
    .single();

  if (error || !data) {
    return {
      success: false,
      message: "Unable to save logo metadata. Run lib/supabase/migrations/002_logo_management.sql in Supabase, then retry.",
    };
  }

  revalidateLogoPaths();

  return {
    success: true,
    data: normalizeLogo(data as ManagedLogo),
    message: "Logo uploaded and saved successfully.",
  };
}
