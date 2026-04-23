"use server";

import { headers } from "next/headers";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

const buildBaseUrl = async () => {
  const headerStore = await headers();
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol =
    headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
};

export const signIn = async (payload: {
  email: string;
  password: string;
}): Promise<ActionResult> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message:
        "Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Signed in successfully." };
};

export const signUp = async (payload: {
  email: string;
  password: string;
}): Promise<ActionResult> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message:
        "Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const baseUrl = await buildBaseUrl();

  const { error } = await supabase.auth.signUp({
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    options: {
      emailRedirectTo: `${baseUrl}/dashboard`,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: "Account created. Check your inbox to confirm your email before signing in.",
  };
};

export const magicLink = async (payload: {
  email: string;
}): Promise<ActionResult> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message:
        "Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const baseUrl = await buildBaseUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email: payload.email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${baseUrl}/dashboard`,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: "Magic link sent. Check your inbox to finish signing in.",
  };
};

export const signOut = async (): Promise<ActionResult> => {
  if (!isSupabaseConfigured()) {
    return { success: true, message: "Signed out of local demo session." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Signed out successfully." };
};
