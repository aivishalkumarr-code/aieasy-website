"use server";

import { revalidatePath } from "next/cache";

import { DEFAULT_LOGO_URL } from "@/lib/logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActionResult, LogoInput, LogoType, ManagedLogo } from "@/types";

const LOGO_TYPES: LogoType[] = ["main", "dark", "favicon", "og_image"];

const createDemoLogo = (type: LogoType = "main", url = DEFAULT_LOGO_URL): ManagedLogo => ({
  id: type,
  type,
  url,
  width: type === "favicon" ? 32 : 400,
  height: type === "favicon" ? 32 : 80,
  file_size: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const normalizeLogo = (logo: ManagedLogo): ManagedLogo => ({
  ...logo,
  url: logo.url || DEFAULT_LOGO_URL,
  width: logo.width ?? null,
  height: logo.height ?? null,
  file_size: logo.file_size ?? null,
});

const revalidateLogoUsage = () => {
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/services/[slug]", "page");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/logo");
};

export const getLogos = async (): Promise<ManagedLogo[]> => {
  if (!isSupabaseConfigured()) {
    return [createDemoLogo()];
  }

  const supabase = await createClient();

  if (!supabase) {
    return [createDemoLogo()];
  }

  const { data, error } = await supabase
    .from("logos")
    .select("*")
    .in("type", LOGO_TYPES)
    .order("updated_at", { ascending: false });

  if (error || !data?.length) {
    return [createDemoLogo()];
  }

  return (data as ManagedLogo[]).map(normalizeLogo);
};

export const getLogoByType = async (type: LogoType = "main"): Promise<ManagedLogo> => {
  const logos = await getLogos();
  return logos.find((logo) => logo.type === type) ?? createDemoLogo(type);
};

export const getMainLogoUrl = async () => {
  const logo = await getLogoByType("main");
  return logo.url || DEFAULT_LOGO_URL;
};

export const ensureLogoBucket = async (): Promise<ActionResult> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Supabase is not configured. Connect Supabase to upload logos.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase client unavailable.",
    };
  }

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === "logos");

  if (exists) {
    return { success: true };
  }

  const { error } = await supabase.storage.createBucket("logos", {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/svg+xml"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    return {
      success: false,
      message:
        "Unable to create the logos storage bucket. Run lib/supabase/migrations/002_logo_management.sql in Supabase, then retry.",
    };
  }

  return { success: true };
};

export const saveLogo = async (input: LogoInput): Promise<ActionResult<ManagedLogo>> => {
  const type = input.type;

  if (!LOGO_TYPES.includes(type)) {
    return { success: false, message: "Unsupported logo type." };
  }

  const logo: ManagedLogo = {
    id: type,
    type,
    url: input.url.trim(),
    width: input.width ?? null,
    height: input.height ?? null,
    file_size: input.file_size ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: logo,
      message: "Logo updated in demo mode. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase client unavailable.",
    };
  }

  const { data, error } = await supabase
    .from("logos")
    .upsert(
      {
        type,
        url: logo.url,
        width: logo.width,
        height: logo.height,
        file_size: logo.file_size,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "type" },
    )
    .select("*")
    .single();

  if (error || !data) {
    return {
      success: false,
      message:
        "Unable to save logo metadata. Run lib/supabase/migrations/002_logo_management.sql in Supabase, then retry.",
    };
  }

  revalidateLogoUsage();

  return {
    success: true,
    data: data as ManagedLogo,
    message: "Logo updated successfully.",
  };
};
