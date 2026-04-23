"use server";

import { revalidatePath } from "next/cache";

import { getMockSEOSettings } from "@/lib/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SEO_PAGE_OPTIONS, type ActionResult, type SEOSetting } from "@/types";

export const getSEOSettings = async (): Promise<SEOSetting[]> => {
  if (!isSupabaseConfigured()) {
    return getMockSEOSettings();
  }

  const supabase = await createClient();

  if (!supabase) {
    return getMockSEOSettings();
  }

  const { data, error } = await supabase
    .from("seo_settings")
    .select("*")
    .order("page_path", { ascending: true });

  if (error || !data || data.length === 0) {
    return getMockSEOSettings();
  }

  const byPath = new Map((data as SEOSetting[]).map((setting) => [setting.page_path, setting]));

  return SEO_PAGE_OPTIONS.map((pagePath, index) => {
    const existing = byPath.get(pagePath);
    return (
      existing ?? {
        id: `seo-fallback-${index + 1}`,
        page_path: pagePath,
        title: `AIeasy ${pagePath}`,
        description: `Metadata controls for ${pagePath}.`,
        keywords: `AIeasy, ${pagePath}`,
        og_image: "/og-default.png",
      }
    );
  });
};

export const updateSEOSetting = async (
  payload: SEOSetting,
): Promise<ActionResult<SEOSetting>> => {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: { ...payload },
      message: "SEO setting saved in demo mode.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase
    .from("seo_settings")
    .upsert(
      {
        id: payload.id.startsWith("seo-fallback") ? undefined : payload.id,
        page_path: payload.page_path,
        title: payload.title,
        description: payload.description,
        keywords: payload.keywords,
        og_image: payload.og_image,
      },
      { onConflict: "page_path" },
    )
    .select("*")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/seo");

  return { success: true, data: data as SEOSetting, message: "SEO setting saved." };
};
