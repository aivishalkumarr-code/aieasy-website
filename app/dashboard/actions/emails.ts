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

const renderEmailHtml = (body: string) => `
  <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #0F172A; white-space: pre-wrap;">
    <style>
      a.button, .button, a[role="button"] {
        background-color: #2563EB !important;
        color: #ffffff !important;
        border-radius: 9999px !important;
        display: inline-block !important;
        font-weight: 600 !important;
        padding: 12px 24px !important;
        text-decoration: none !important;
      }
      a.button:hover, .button:hover, a[role="button"]:hover {
        background-color: #1D4ED8 !important;
      }
    </style>
    ${body}
  </div>
`;

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
        html: renderEmailHtml(payload.body),
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
