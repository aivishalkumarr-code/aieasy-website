"use server";

import { revalidatePath } from "next/cache";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActionResult, ImageCategory, ManagedImage } from "@/types";

const IMAGE_CATEGORIES: ImageCategory[] = [
  "Landing Page",
  "Hero",
  "Portfolio",
  "Services",
  "Blog",
  "General",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

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

const normalizeCategory = (value: FormDataEntryValue | string | null): ImageCategory => {
  const category = typeof value === "string" ? value : "General";
  return IMAGE_CATEGORIES.includes(category as ImageCategory) ? (category as ImageCategory) : "General";
};

const normalizeNumber = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const validateFile = (file: File) => {
  const extension = getFileExtension(file);
  const validMime = ACCEPTED_MIME_TYPES.includes(file.type);
  const validExtension = ACCEPTED_EXTENSIONS.includes(extension);

  if (!validMime && !validExtension) {
    return "Upload a PNG, JPG, or WebP image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Image files must be 5MB or smaller.";
  }

  return null;
};

const normalizeImage = (image: ManagedImage): ManagedImage => ({
  ...image,
  category: image.category ?? "General",
  width: image.width ?? null,
  height: image.height ?? null,
  file_size: image.file_size ?? null,
});

const getStoragePathFromUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const marker = "/object/public/images/";
    const index = parsed.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
};

const revalidateImages = () => {
  revalidatePath("/dashboard/images");
};

export async function getImages(): Promise<ManagedImage[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("images")
    .select("id,url,filename,category,width,height,file_size,created_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ManagedImage[]).map(normalizeImage);
}

export async function uploadManagedImage(formData: FormData): Promise<ActionResult<ManagedImage>> {
  const file = formData.get("file");
  const category = normalizeCategory(formData.get("category"));
  const width = normalizeNumber(formData.get("width"));
  const height = normalizeNumber(formData.get("height"));

  if (!(file instanceof File)) {
    return { success: false, message: "Choose an image file to upload." };
  }

  const validationMessage = validateFile(file);

  if (validationMessage) {
    return { success: false, message: validationMessage };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, message: "Supabase is not configured. Connect Supabase to upload images." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const extension = getFileExtension(file);
  const safeName = sanitizeFileName(file.name) || "image";
  const folder = category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "general";
  const path = `${folder}/${Date.now()}-${safeName}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("images").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || `image/${extension === "jpg" ? "jpeg" : extension}`,
    upsert: false,
  });

  if (uploadError) {
    return {
      success: false,
      message: "Unable to upload image to Supabase Storage. Confirm the images bucket exists and retry.",
    };
  }

  const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(path);

  if (!publicUrlData.publicUrl) {
    return { success: false, message: "Image uploaded, but no public URL was returned." };
  }

  const { data, error } = await supabase
    .from("images")
    .insert({
      url: publicUrlData.publicUrl,
      filename: file.name,
      category,
      width,
      height,
      file_size: file.size,
    })
    .select("id,url,filename,category,width,height,file_size,created_at")
    .single();

  if (error || !data) {
    await supabase.storage.from("images").remove([path]);
    return {
      success: false,
      message: "Unable to save image metadata. Run lib/supabase/migrations/003_image_management.sql in Supabase, then retry.",
    };
  }

  revalidateImages();

  return {
    success: true,
    data: normalizeImage(data as ManagedImage),
    message: "Image uploaded and saved successfully.",
  };
}

export async function updateImageCategory(
  id: string,
  category: ImageCategory,
): Promise<ActionResult<ManagedImage>> {
  const normalizedCategory = normalizeCategory(category);

  if (!isSupabaseConfigured()) {
    return { success: false, message: "Supabase is not configured. Connect Supabase to update images." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase
    .from("images")
    .update({ category: normalizedCategory })
    .eq("id", id)
    .select("id,url,filename,category,width,height,file_size,created_at")
    .single();

  if (error || !data) {
    return { success: false, message: "Unable to update image category." };
  }

  revalidateImages();

  return {
    success: true,
    data: normalizeImage(data as ManagedImage),
    message: "Image category updated.",
  };
}

export async function updateImage(formData: FormData): Promise<ActionResult<ManagedImage>> {
  const id = formData.get("id");
  const file = formData.get("file");
  const width = normalizeNumber(formData.get("width"));
  const height = normalizeNumber(formData.get("height"));

  if (typeof id !== "string" || !id) {
    return { success: false, message: "Image ID is required." };
  }

  if (!(file instanceof File)) {
    return { success: false, message: "Choose an image file to upload." };
  }

  const validationMessage = validateFile(file);

  if (validationMessage) {
    return { success: false, message: validationMessage };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, message: "Supabase is not configured. Connect Supabase to replace images." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data: existingImage, error: existingError } = await supabase
    .from("images")
    .select("id,url,filename,category,width,height,file_size,created_at")
    .eq("id", id)
    .single();

  if (existingError || !existingImage) {
    return { success: false, message: "Image record not found." };
  }

  const existing = normalizeImage(existingImage as ManagedImage);
  const category = existing.category ?? "General";
  const extension = getFileExtension(file);
  const safeName = sanitizeFileName(file.name) || "image";
  const folder = category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "general";
  const path = `${folder}/${Date.now()}-${safeName}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("images").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || `image/${extension === "jpg" ? "jpeg" : extension}`,
    upsert: false,
  });

  if (uploadError) {
    return {
      success: false,
      message: "Unable to upload replacement image to Supabase Storage.",
    };
  }

  const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(path);

  if (!publicUrlData.publicUrl) {
    await supabase.storage.from("images").remove([path]);
    return { success: false, message: "Replacement uploaded, but no public URL was returned." };
  }

  const { data, error } = await supabase
    .from("images")
    .update({
      url: publicUrlData.publicUrl,
      filename: file.name,
      width,
      height,
      file_size: file.size,
    })
    .eq("id", id)
    .select("id,url,filename,category,width,height,file_size,created_at")
    .single();

  if (error || !data) {
    await supabase.storage.from("images").remove([path]);
    return { success: false, message: "Unable to update image metadata." };
  }

  const previousStoragePath = getStoragePathFromUrl(existing.url);

  if (previousStoragePath) {
    await supabase.storage.from("images").remove([previousStoragePath]);
  }

  revalidateImages();

  return {
    success: true,
    data: normalizeImage(data as ManagedImage),
    message: "Image replaced successfully.",
  };
}

export async function deleteManagedImage(image: ManagedImage): Promise<ActionResult<string>> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: image.id, message: "Image removed locally. Connect Supabase to persist changes." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const storagePath = getStoragePathFromUrl(image.url);

  if (storagePath) {
    await supabase.storage.from("images").remove([storagePath]);
  }

  const { error } = await supabase.from("images").delete().eq("id", image.id);

  if (error) {
    return { success: false, message: "Unable to delete image metadata." };
  }

  revalidateImages();

  return { success: true, data: image.id, message: "Image deleted." };
}
