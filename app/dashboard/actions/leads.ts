"use server";

import { revalidatePath } from "next/cache";

import { mergeDemoContacts } from "@/lib/demo-contacts";
import { getMockContacts } from "@/lib/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActionResult, Contact, LeadStatus } from "@/types";

export const getLeads = async (status?: LeadStatus): Promise<Contact[]> => {
  if (!isSupabaseConfigured()) {
    return mergeDemoContacts(getMockContacts()).filter((contact) =>
      status ? contact.status === status : true,
    );
  }

  const supabase = await createClient();

  if (!supabase) {
    return mergeDemoContacts(getMockContacts());
  }

  let query = supabase.from("contacts").select("*").order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error || !data) {
    return mergeDemoContacts(getMockContacts()).filter((contact) =>
      status ? contact.status === status : true,
    );
  }

  return data as Contact[];
};

export const updateLeadStatus = async (
  id: string,
  status: LeadStatus,
): Promise<ActionResult<Contact>> => {
  if (!isSupabaseConfigured()) {
    const lead = getMockContacts().find((contact) => contact.id === id);
    return {
      success: true,
      data: lead ? { ...lead, status } : undefined,
      message: "Lead status updated in demo mode.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase
    .from("contacts")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/crm");

  return { success: true, data: data as Contact, message: "Lead status updated." };
};

export const updateLeadNotes = async (
  id: string,
  notes: string,
): Promise<ActionResult<Contact>> => {
  if (!isSupabaseConfigured()) {
    const lead = getMockContacts().find((contact) => contact.id === id);
    return {
      success: true,
      data: lead ? { ...lead, notes } : undefined,
      message: "Lead notes updated in demo mode.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase
    .from("contacts")
    .update({ notes })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/crm");

  return { success: true, data: data as Contact, message: "Lead notes saved." };
};
