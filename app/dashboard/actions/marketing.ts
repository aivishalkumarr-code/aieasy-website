"use server";

import { revalidatePath } from "next/cache";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  SNIPPET_PRESETS,
  SNIPPET_PLACEMENTS,
  type ActionResult,
  type MarketingSnippet,
  type SnippetPlacement,
} from "@/types";

const placementRank: Record<SnippetPlacement, number> = {
  head: 0,
  body_start: 1,
  body_end: 2,
};

const sortSnippets = (snippets: MarketingSnippet[]) =>
  [...snippets].sort((a, b) => {
    if (placementRank[a.placement] !== placementRank[b.placement]) {
      return placementRank[a.placement] - placementRank[b.placement];
    }

    if (a.order_index !== b.order_index) {
      return a.order_index - b.order_index;
    }

    return a.name.localeCompare(b.name);
  });

const sanitizeText = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const parsePlacement = (value: string): SnippetPlacement =>
  SNIPPET_PLACEMENTS.includes(value as SnippetPlacement) ? (value as SnippetPlacement) : "head";

const parseOrderIndex = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
};

const parseBoolean = (value: FormDataEntryValue | null) =>
  value === "true" || value === "on" || value === "1";

const createLocalSnippet = (
  payload: Omit<MarketingSnippet, "id" | "created_at" | "updated_at">,
  id = crypto.randomUUID(),
): MarketingSnippet => {
  const now = new Date().toISOString();
  return {
    id,
    ...payload,
    created_at: now,
    updated_at: now,
  };
};

const demoSnippets: MarketingSnippet[] = SNIPPET_PRESETS.slice(0, 3).map((preset, index) =>
  createLocalSnippet({
    name: preset.name,
    description: preset.description,
    code: preset.code,
    placement: preset.placement,
    is_active: true,
    order_index: index,
  }, `demo-marketing-${index + 1}`),
);

const revalidateMarketingRoutes = () => {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]");
  revalidatePath("/contact");
  revalidatePath("/services");
  revalidatePath("/services/[slug]");
  revalidatePath("/lp");
  revalidatePath("/lp/website-design");
  revalidatePath("/lp/website-design/thank-you");
  revalidatePath("/login");
  revalidatePath("/dashboard/marketing");
};

export const getMarketingSnippets = async (): Promise<MarketingSnippet[]> => {
  const fallback = sortSnippets(demoSnippets);

  if (!isSupabaseConfigured()) {
    return fallback;
  }

  const supabase = await createClient();

  if (!supabase) {
    return fallback;
  }

  const { data, error } = await supabase
    .from("marketing_snippets")
    .select("*")
    .order("placement", { ascending: true })
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return fallback;
  }

  return sortSnippets(data as MarketingSnippet[]);
};

export const getActiveMarketingSnippets = async (): Promise<MarketingSnippet[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("marketing_snippets")
    .select("*")
    .eq("is_active", true)
    .order("placement", { ascending: true })
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return sortSnippets(data as MarketingSnippet[]);
};

export const createMarketingSnippet = async (formData: FormData): Promise<ActionResult<MarketingSnippet>> => {
  const name = sanitizeText(formData.get("name"));
  const description = sanitizeText(formData.get("description")) || null;
  const code = typeof formData.get("code") === "string" ? String(formData.get("code")) : "";
  const placement = parsePlacement(sanitizeText(formData.get("placement")));
  const order_index = parseOrderIndex(sanitizeText(formData.get("order_index")));
  const is_active = parseBoolean(formData.get("is_active"));

  if (!name) {
    return { success: false, message: "Snippet name is required." };
  }

  if (!code.trim()) {
    return { success: false, message: "Snippet code is required." };
  }

  const localSnippet = createLocalSnippet({
    name,
    description,
    code,
    placement,
    is_active,
    order_index,
  });

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: localSnippet,
      message: "Snippet added in demo mode. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      success: true,
      data: localSnippet,
      message: "Supabase client unavailable. Snippet added locally only.",
    };
  }

  const { data, error } = await supabase
    .from("marketing_snippets")
    .insert({
      name,
      description,
      code,
      placement,
      is_active,
      order_index,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      success: true,
      data: localSnippet,
      message: "Marketing snippets table unavailable. Change applied locally only.",
    };
  }

  revalidateMarketingRoutes();

  return {
    success: true,
    data: data as MarketingSnippet,
    message: "Snippet created.",
  };
};

export const updateMarketingSnippet = async (formData: FormData): Promise<ActionResult<MarketingSnippet>> => {
  const id = sanitizeText(formData.get("id"));
  const name = sanitizeText(formData.get("name"));
  const description = sanitizeText(formData.get("description")) || null;
  const code = typeof formData.get("code") === "string" ? String(formData.get("code")) : "";
  const placement = parsePlacement(sanitizeText(formData.get("placement")));
  const order_index = parseOrderIndex(sanitizeText(formData.get("order_index")));
  const is_active = parseBoolean(formData.get("is_active"));

  if (!id) {
    return { success: false, message: "Snippet ID is required." };
  }

  if (!name) {
    return { success: false, message: "Snippet name is required." };
  }

  if (!code.trim()) {
    return { success: false, message: "Snippet code is required." };
  }

  const localSnippet = createLocalSnippet(
    {
      name,
      description,
      code,
      placement,
      is_active,
      order_index,
    },
    id,
  );

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: localSnippet,
      message: "Snippet updated in demo mode. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      success: true,
      data: localSnippet,
      message: "Supabase client unavailable. Snippet updated locally only.",
    };
  }

  const { data, error } = await supabase
    .from("marketing_snippets")
    .update({
      name,
      description,
      code,
      placement,
      is_active,
      order_index,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return {
      success: true,
      data: localSnippet,
      message: "Marketing snippets table unavailable. Change applied locally only.",
    };
  }

  revalidateMarketingRoutes();

  return {
    success: true,
    data: data as MarketingSnippet,
    message: "Snippet updated.",
  };
};

export const deleteMarketingSnippet = async (id: string): Promise<ActionResult<string>> => {
  const snippetId = id.trim();

  if (!snippetId) {
    return { success: false, message: "Snippet ID is required." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: snippetId,
      message: "Snippet removed in demo mode. Connect Supabase to persist changes.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      success: true,
      data: snippetId,
      message: "Supabase client unavailable. Snippet removed locally only.",
    };
  }

  const { error } = await supabase.from("marketing_snippets").delete().eq("id", snippetId);

  if (error) {
    return {
      success: true,
      data: snippetId,
      message: "Marketing snippets table unavailable. Change applied locally only.",
    };
  }

  revalidateMarketingRoutes();

  return {
    success: true,
    data: snippetId,
    message: "Snippet deleted.",
  };
};

export const toggleMarketingSnippet = async (
  id: string,
  is_active: boolean,
): Promise<ActionResult<MarketingSnippet>> => {
  const snippetId = id.trim();

  if (!snippetId) {
    return { success: false, message: "Snippet ID is required." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: {
        id: snippetId,
        name: "",
        description: null,
        code: "",
        placement: "head",
        is_active,
        order_index: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      message: `Snippet ${is_active ? "enabled" : "disabled"} in demo mode.`,
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase
    .from("marketing_snippets")
    .update({ is_active })
    .eq("id", snippetId)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, message: "Unable to update snippet state." };
  }

  revalidateMarketingRoutes();

  return {
    success: true,
    data: data as MarketingSnippet,
    message: `Snippet ${is_active ? "enabled" : "disabled"}.`,
  };
};
