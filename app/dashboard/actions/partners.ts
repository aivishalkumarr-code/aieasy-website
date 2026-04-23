"use server";

import { revalidatePath } from "next/cache";

import { getMockPartners } from "@/lib/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActionResult, PartnerInput, PartnerLogo } from "@/types";

const sortPartners = (partners: PartnerLogo[]) =>
  [...partners].sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }

    return (a.name ?? "").localeCompare(b.name ?? "");
  });

const createLocalPartner = (data: PartnerInput, id = crypto.randomUUID()): PartnerLogo => ({
  id,
  name: data.name.trim(),
  image_url: data.image_url.trim(),
  url: data.url?.trim() ? data.url.trim() : null,
  display_order: data.display_order,
  created_at: new Date().toISOString(),
});

const revalidatePartners = () => {
  revalidatePath("/");
  revalidatePath("/dashboard/partners");
};

export const getPartners = async (): Promise<PartnerLogo[]> => {
  const fallback = sortPartners(getMockPartners());

  if (!isSupabaseConfigured()) {
    return fallback;
  }

  const supabase = await createClient();

  if (!supabase) {
    return fallback;
  }

  const { data, error } = await supabase
    .from("partner_logos")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data?.length) {
    return fallback;
  }

  return data as PartnerLogo[];
};

export const createPartner = async (
  data: PartnerInput,
): Promise<ActionResult<PartnerLogo>> => {
  const partner = createLocalPartner(data);

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: partner,
      message: "Partner added in demo mode. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      success: true,
      data: partner,
      message: "Supabase client unavailable. Partner added locally only.",
    };
  }

  const { data: created, error } = await supabase
    .from("partner_logos")
    .insert({
      name: partner.name,
      image_url: partner.image_url,
      url: partner.url,
      display_order: partner.display_order,
    })
    .select("*")
    .single();

  if (error || !created) {
    return {
      success: true,
      data: partner,
      message: "Partner table unavailable. Change applied locally only.",
    };
  }

  revalidatePartners();

  return {
    success: true,
    data: created as PartnerLogo,
    message: "Partner created.",
  };
};

export const updatePartner = async (
  id: string,
  data: PartnerInput,
): Promise<ActionResult<PartnerLogo>> => {
  const partner = createLocalPartner(data, id);

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: partner,
      message: "Partner updated in demo mode. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      success: true,
      data: partner,
      message: "Supabase client unavailable. Partner updated locally only.",
    };
  }

  const { data: updated, error } = await supabase
    .from("partner_logos")
    .update({
      name: partner.name,
      image_url: partner.image_url,
      url: partner.url,
      display_order: partner.display_order,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !updated) {
    return {
      success: true,
      data: partner,
      message: "Partner table unavailable. Change applied locally only.",
    };
  }

  revalidatePartners();

  return {
    success: true,
    data: updated as PartnerLogo,
    message: "Partner updated.",
  };
};

export const deletePartner = async (id: string): Promise<ActionResult<string>> => {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: id,
      message: "Partner removed in demo mode. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      success: true,
      data: id,
      message: "Supabase client unavailable. Partner removed locally only.",
    };
  }

  const { error } = await supabase.from("partner_logos").delete().eq("id", id);

  if (error) {
    return {
      success: true,
      data: id,
      message: "Partner table unavailable. Change applied locally only.",
    };
  }

  revalidatePartners();

  return {
    success: true,
    data: id,
    message: "Partner deleted.",
  };
};
