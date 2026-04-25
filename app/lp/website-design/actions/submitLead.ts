"use server";

import { revalidatePath } from "next/cache";

import { DEFAULT_FROM_EMAIL, getResendClient, isResendConfigured } from "@/lib/resend";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

interface SubmitLeadResult {
  success: boolean;
  message?: string;
  name?: string;
}

const adminEmail = "hello@aieasy.in";
const leadSource = "Landing Page - Website Design";

const sanitize = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function submitLead(formData: FormData): Promise<SubmitLeadResult> {
  const name = sanitize(formData.get("name"));
  const businessName = sanitize(formData.get("businessName"));
  const phone = sanitize(formData.get("phone"));
  const websiteType = sanitize(formData.get("websiteType"));
  const message = sanitize(formData.get("message"));
  const phoneDigits = phone.replace(/\D/g, "");
  const generatedEmail = `website-design-${phoneDigits}-${Date.now()}@aieasy.in`;

  if (!name || name.length < 2) {
    return { success: false, message: "Please enter your name." };
  }

  if (!businessName || businessName.length < 2) {
    return { success: false, message: "Please enter your business name." };
  }

  if (!phone || phoneDigits.length < 10) {
    return { success: false, message: "Please enter a valid phone number." };
  }

  if (!websiteType) {
    return { success: false, message: "Please select the website type you need." };
  }

  if (message && message.length < 12) {
    return {
      success: false,
      message: "Add a little more detail about your business or leave that field blank.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message:
        "Form submission is currently unavailable. Please try again later or contact us directly.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      success: false,
      message: "Unable to connect to the database. Please try again later.",
    };
  }

  const notes = [
    "Service Interest: Website Design",
    `Website Type: ${websiteType}`,
    `Business Name: ${businessName}`,
    `Phone: ${phone}`,
    `Requirement Details: ${message || "Not provided"}`,
  ].join("\n\n");

  const { error } = await supabase.from("contacts").insert({
    name,
    email: generatedEmail,
    phone,
    company: businessName,
    status: "New",
    notes,
    source: leadSource,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return {
      success: false,
      message: "Failed to save your request. Please try again.",
    };
  }

  if (isResendConfigured()) {
    const resend = getResendClient();

    if (resend) {
      const safeName = escapeHtml(name);
      const safePhone = escapeHtml(phone);
      const safeBusinessName = escapeHtml(businessName);
      const safeWebsiteType = escapeHtml(websiteType);
      const safeMessage = escapeHtml(message || "Not provided").replace(/\n/g, "<br />");

      await resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: [adminEmail],
        subject: `New Website Design Lead: ${name}`,
        html: buildAdminEmail({
          name: safeName,
          phone: safePhone,
          businessName: safeBusinessName,
          websiteType: safeWebsiteType,
          message: safeMessage,
        }),
      });
    }
  }

  revalidatePath("/lp/website-design");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");

  return {
    success: true,
    name,
    message: "Your request has been submitted successfully!",
  };
}

function buildAdminEmail({
  name,
  phone,
  businessName,
  websiteType,
  message,
}: {
  name: string;
  phone: string;
  businessName: string;
  websiteType: string;
  message: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Website Design Lead</title>
      </head>
      <body style="margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f8fafc;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:20px;padding:36px;box-shadow:0 20px 60px rgba(15,148,136,0.12);">
          <h1 style="margin:0 0 24px;color:#0D9488;font-size:28px;font-weight:700;">New Website Design Lead</h1>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;color:#64748B;width:170px;">Name</td>
              <td style="padding:10px 0;color:#0F172A;font-weight:600;">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#64748B;">Business</td>
              <td style="padding:10px 0;color:#0F172A;">${businessName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#64748B;">Phone</td>
              <td style="padding:10px 0;color:#0F172A;">${phone}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#64748B;">Website Type</td>
              <td style="padding:10px 0;color:#0F172A;">${websiteType}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#64748B;vertical-align:top;">Requirement Details</td>
              <td style="padding:10px 0;color:#0F172A;line-height:1.7;">${message}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#64748B;">Source</td>
              <td style="padding:10px 0;color:#0F172A;">${leadSource}</td>
            </tr>
          </table>
          <div style="margin-top:24px;padding-top:24px;border-top:1px solid #E2E8F0;">
            <p style="margin:0;color:#94A3B8;font-size:12px;">Received at ${new Date().toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
