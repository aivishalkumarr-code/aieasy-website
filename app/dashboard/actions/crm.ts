"use server";

import { revalidatePath } from "next/cache";

import { getMockContacts, getMockDeals } from "@/lib/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActionResult, Contact, Deal, DealStage, LeadStatus } from "@/types";

export const getContacts = async (): Promise<Contact[]> => {
  if (!isSupabaseConfigured()) {
    return getMockContacts();
  }

  const supabase = await createClient();

  if (!supabase) {
    return getMockContacts();
  }

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return getMockContacts();
  }

  return data as Contact[];
};

export const createContact = async (payload: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status?: LeadStatus;
  notes?: string;
}): Promise<ActionResult<Contact>> => {
  const contact: Contact = {
    id: crypto.randomUUID(),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || null,
    company: payload.company?.trim() || null,
    status: payload.status ?? "New",
    notes: payload.notes?.trim() || null,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    return { success: true, data: contact, message: "Contact created in demo mode." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert(contact)
    .select("*")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/crm");

  return { success: true, data: data as Contact, message: "Contact created." };
};

export const getDeals = async (): Promise<Deal[]> => {
  if (!isSupabaseConfigured()) {
    return getMockDeals();
  }

  const supabase = await createClient();

  if (!supabase) {
    return getMockDeals();
  }

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return getMockDeals();
  }

  return data as Deal[];
};

export const createDeal = async (payload: {
  title: string;
  contactId: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate?: string;
  notes?: string;
}): Promise<ActionResult<Deal>> => {
  const deal: Deal = {
    id: crypto.randomUUID(),
    title: payload.title.trim(),
    contact_id: payload.contactId,
    value: payload.value,
    stage: payload.stage,
    probability: payload.probability,
    expected_close_date: payload.expectedCloseDate || null,
    notes: payload.notes?.trim() || null,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    return { success: true, data: deal, message: "Deal created in demo mode." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase.from("deals").insert(deal).select("*").single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/crm");

  return { success: true, data: data as Deal, message: "Deal created." };
};

export const updateDealStage = async (
  id: string,
  stage: DealStage,
): Promise<ActionResult<Deal>> => {
  if (!isSupabaseConfigured()) {
    const deal = getMockDeals().find((entry) => entry.id === id);
    return {
      success: true,
      data: deal ? { ...deal, stage } : undefined,
      message: "Deal stage updated in demo mode.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase
    .from("deals")
    .update({ stage })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/crm");

  return { success: true, data: data as Deal, message: "Deal stage updated." };
};
