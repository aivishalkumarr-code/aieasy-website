"use server";

import { revalidatePath } from "next/cache";

import { getMockSentEmails } from "@/lib/mock-data";
import { DEFAULT_FROM_EMAIL, getResendClient, isResendConfigured } from "@/lib/resend";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActionResult, EmailTemplateId, SentEmail } from "@/types";

export const getSentEmails = async (): Promise<SentEmail[]> => {
  if (!isSupabaseConfigured()) {
    return getMockSentEmails();
  }

  const supabase = await createClient();

  if (!supabase) {
    return getMockSentEmails();
  }

  const { data, error } = await supabase
    .from("sent_emails")
    .select("*")
    .order("sent_at", { ascending: false });

  if (error || !data) {
    return getMockSentEmails();
  }

  return data as SentEmail[];
};

export const sendEmail = async (payload: {
  toEmail: string;
  toName?: string;
  subject: string;
  template?: EmailTemplateId;
  body: string;
}): Promise<ActionResult<SentEmail>> => {
  let status: SentEmail["status"] = isResendConfigured() ? "sent" : "queued";
  let message = isResendConfigured()
    ? "Email sent successfully."
    : "Resend not configured, email queued locally.";

  if (isResendConfigured()) {
    try {
      const resend = getResendClient();
      const response = await resend?.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: [payload.toEmail],
        subject: payload.subject,
        html: `<div style="font-family: Inter, Arial, sans-serif; white-space: pre-wrap;">${payload.body}</div>`,
      });

      if (response?.error) {
        status = "failed";
        message = response.error.message;
      }
    } catch (error) {
      status = "failed";
      message = error instanceof Error ? error.message : "Failed to send email.";
    }
  }

  const emailRecord: SentEmail = {
    id: crypto.randomUUID(),
    to_email: payload.toEmail.trim().toLowerCase(),
    to_name: payload.toName?.trim() || null,
    subject: payload.subject.trim(),
    template: payload.template || null,
    status,
    sent_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    return {
      success: status !== "failed",
      data: emailRecord,
      message,
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const { data, error } = await supabase
    .from("sent_emails")
    .insert(emailRecord)
    .select("*")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/emails");

  return {
    success: status !== "failed",
    data: data as SentEmail,
    message,
  };
};
