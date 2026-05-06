"use server";

import { revalidatePath } from "next/cache";

import {
  DEFAULT_FROM_EMAIL,
  getResendClient,
  isResendConfigured,
} from "@/lib/resend";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

interface SubmitLeadResult {
  success: boolean;
  message?: string;
  name?: string;
}

const calendlyLink = "https://calendly.com/aieasy/30min";
const adminEmail = "hello@aieasy.in";
const leadSource = "Landing Page - Website Design";
const businessTypePopupSource = "landing_page__business_type";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitize = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

type SupabaseInsertError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildPlaceholderEmail = () => `missing-email-${crypto.randomUUID()}@no-email.aieasy.local`;

const isPhoneColumnMissingError = (error: SupabaseInsertError | null) => {
  if (!error) return false;
  const combined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return error.code === "42703" && combined.includes("phone");
};

const isEmailNotNullError = (error: SupabaseInsertError | null) => {
  if (!error) return false;
  const combined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return error.code === "23502" && combined.includes("email");
};

const formatSupabaseErrorMessage = (error: SupabaseInsertError | null) => {
  if (!error) {
    return "Database insert failed with an unknown error.";
  }

  const combined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();

  if (error.code === "23505") {
    return "This email already exists in contacts. Please use a different email or book a consultation directly.";
  }

  if (error.code === "23502" && combined.includes("email")) {
    return "The contacts table requires email (NOT NULL), but no valid email could be stored.";
  }

  if (error.code === "42703") {
    if (combined.includes("phone")) {
      return "The contacts table is missing the phone column. We retried by storing phone in notes.";
    }

    return `Schema mismatch: a required contacts column is missing (${error.message ?? "unknown column"}).`;
  }

  if (error.code === "42P01") {
    return "Schema mismatch: contacts table was not found in Supabase.";
  }

  if (combined.includes("row-level security") || error.code === "42501") {
    return "Insert blocked by Supabase RLS policy. Ensure anon/authenticated INSERT policy on contacts allows WITH CHECK (true).";
  }

  if (combined.includes("invalid input value for enum")) {
    return `Invalid enum value was sent to contacts (${error.message ?? "unknown enum error"}).`;
  }

  return `Supabase insert failed (${error.code ?? "no_code"}): ${error.message ?? "Unknown error"}`;
};

const logSupabaseInsertError = (
  action: "submitLead" | "submitBusinessTypeLead",
  payload: Record<string, unknown>,
  error: SupabaseInsertError | null,
) => {
  console.error(`[${action}] Supabase contacts insert failed`, {
    table: "contacts",
    payload,
    errorCode: error?.code ?? null,
    errorMessage: error?.message ?? null,
    errorDetails: error?.details ?? null,
    errorHint: error?.hint ?? null,
    error,
  });
};

export async function submitLead(formData: FormData): Promise<SubmitLeadResult> {
  const name = sanitize(formData.get("name"));
  const businessName = sanitize(formData.get("businessName"));
  const email = sanitize(formData.get("email")).toLowerCase();
  const websiteType = sanitize(formData.get("websiteType"));
  const message = sanitize(formData.get("message"));

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

  if (!name || name.length < 2) {
    return { success: false, message: "Please enter your name." };
  }

  if (!businessName || businessName.length < 2) {
    return { success: false, message: "Please enter your business name." };
  }

  if (email && !emailPattern.test(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  if (message && message.length < 12) {
    return {
      success: false,
      message: "Add a little more detail about your business or leave that field blank.",
    };
  }

  const websiteTypeLabel = websiteType ? websiteType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Not specified";
  
  const notes = [
    "Service Interest: Website Design",
    `Website Type: ${websiteTypeLabel}`,
    `Business Name: ${businessName}`,
    `Email: ${email || "Not provided"}`,
    `What is your business about?: ${message || "Not provided"}`,
  ].join("\n\n");

  // Insert with fallback if email is empty or if there's an error
  const insertData: Record<string, unknown> = {
    name,
    email: email || null,
    company: businessName,
    status: "New",
    notes,
    source: leadSource,
    created_at: new Date().toISOString(),
  };

  let { error } = await supabase.from("contacts").insert(insertData);

  if (error && isEmailNotNullError(error)) {
    insertData.email = buildPlaceholderEmail();
    const fallbackResult = await supabase.from("contacts").insert(insertData);
    error = fallbackResult.error;
  }

  if (error) {
    logSupabaseInsertError("submitLead", insertData, error);
    return {
      success: false,
      message: formatSupabaseErrorMessage(error),
    };
  }

  if (isResendConfigured()) {
    const resend = getResendClient();

    if (resend) {
      const safeName = escapeHtml(name);
      const safeBusinessName = escapeHtml(businessName);
      const safeEmail = escapeHtml(email);
      const safeMessage = escapeHtml(message || "Not provided").replace(/\n/g, "<br />");

      const safeWebsiteType = escapeHtml(websiteTypeLabel);

      await Promise.allSettled([
        email ? resend.emails.send({
          from: DEFAULT_FROM_EMAIL,
          to: [email],
          subject: "Your AIeasy website consultation request is confirmed",
          html: buildCustomerEmail({
            name: safeName,
            businessName: safeBusinessName,
          }),
        }) : Promise.resolve(),
        resend.emails.send({
          from: DEFAULT_FROM_EMAIL,
          to: [adminEmail],
          subject: `New Website Design Lead: ${name}`,
          html: buildAdminEmail({
            name: safeName,
            email: safeEmail,
            businessName: safeBusinessName,
            websiteType: safeWebsiteType,
            message: safeMessage,
          }),
        }),
      ]);
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

export async function submitBusinessTypeLead(formData: FormData): Promise<SubmitLeadResult> {
  const name = sanitize(formData.get("name"));
  const phone = sanitize(formData.get("phone"));
  const email = sanitize(formData.get("email")).toLowerCase();
  const businessType = sanitize(formData.get("businessType"));

  if (!name || name.length < 2) {
    return { success: false, message: "Please enter your full name." };
  }

  if (!phone || phone.length < 7) {
    return { success: false, message: "Please enter a valid mobile/phone number." };
  }

  if (!email || !emailPattern.test(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  if (!businessType) {
    return { success: false, message: "Please select a business type." };
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

  const notes = [`Phone: ${phone}`, `Business Type: ${businessType}`].join("\n");
  const insertData: Record<string, unknown> = {
    name,
    email,
    phone,
    company: businessType,
    status: "New",
    source: businessTypePopupSource,
    notes,
    created_at: new Date().toISOString(),
  };

  let { error } = await supabase.from("contacts").insert(insertData);

  if (error && isPhoneColumnMissingError(error)) {
    delete insertData.phone;
    const fallbackInsert = await supabase.from("contacts").insert(insertData);
    error = fallbackInsert.error;
  }

  if (error) {
    logSupabaseInsertError("submitBusinessTypeLead", insertData, error);
    return {
      success: false,
      message: formatSupabaseErrorMessage(error),
    };
  }

  if (isResendConfigured()) {
    const resend = getResendClient();

    if (resend) {
      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safePhone = escapeHtml(phone);
      const safeBusinessType = escapeHtml(businessType);

      await Promise.allSettled([
        resend.emails.send({
          from: DEFAULT_FROM_EMAIL,
          to: [email],
          subject: `Your free website plan request for ${businessType} is confirmed`,
          html: buildBusinessTypeCustomerEmail({
            name: safeName,
            businessType: safeBusinessType,
          }),
        }),
        resend.emails.send({
          from: DEFAULT_FROM_EMAIL,
          to: [adminEmail],
          subject: `New Business Type Lead: ${name} (${businessType})`,
          html: buildBusinessTypeAdminEmail({
            name: safeName,
            email: safeEmail,
            phone: safePhone,
            businessType: safeBusinessType,
          }),
        }),
      ]);
    }
  }

  revalidatePath("/lp/website-design");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");

  return {
    success: true,
    name,
    message: "Thank you! We'll contact you within 24 hours.",
  };
}

function buildBusinessTypeCustomerEmail({
  name,
  businessType,
}: {
  name: string;
  businessType: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your free website plan request is confirmed</title>
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#fafaf8;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafaf8;">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 20px rgba(15,23,42,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#1D4ED8 0%,#2563EB 55%,#3B82F6 100%);padding:36px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">AIeasy</h1>
                    <p style="margin:10px 0 0;color:rgba(255,255,255,0.86);font-size:14px;">Your request is confirmed</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <h2 style="margin:0 0 16px;color:#1A1A1A;font-size:26px;font-weight:700;">Thanks, ${name}.</h2>
                    <p style="margin:0 0 16px;color:#4B5563;font-size:16px;line-height:1.7;">
                      We&apos;ve received your request for a custom website plan for <strong>${businessType}</strong>.
                    </p>
                    <p style="margin:0 0 24px;color:#4B5563;font-size:16px;line-height:1.7;">
                      We&apos;ll contact you within 24 hours with a recommended package and next steps.
                    </p>
                    <a href="${calendlyLink}" style="display:inline-block;background-color:#2563EB;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:9999px;font-weight:600;font-size:14px;">Book a quick call</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildBusinessTypeAdminEmail({
  name,
  email,
  phone,
  businessType,
}: {
  name: string;
  email: string;
  phone: string;
  businessType: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Business Type Lead</title>
      </head>
      <body style="margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#fafaf8;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;padding:36px;box-shadow:0 6px 20px rgba(15,23,42,0.08);">
          <h1 style="margin:0 0 24px;color:#2563EB;font-size:28px;font-weight:700;">New Business Type Lead</h1>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;color:#6B7280;width:150px;">Name</td>
              <td style="padding:10px 0;color:#1A1A1A;font-weight:600;">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;">Email</td>
              <td style="padding:10px 0;color:#1A1A1A;">${email}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;">Phone</td>
              <td style="padding:10px 0;color:#1A1A1A;">${phone}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;">Business Type</td>
              <td style="padding:10px 0;color:#1A1A1A;font-weight:600;">${businessType}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;">Source</td>
              <td style="padding:10px 0;color:#1A1A1A;">${businessTypePopupSource}</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;
}

function buildCustomerEmail({
  name,
  businessName,
}: {
  name: string;
  businessName: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your website consultation request is confirmed</title>
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#fafaf8;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafaf8;">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 20px rgba(15,23,42,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#1D4ED8 0%,#2563EB 55%,#3B82F6 100%);padding:36px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">AIeasy</h1>
                    <p style="margin:10px 0 0;color:rgba(255,255,255,0.86);font-size:14px;">Websites built to grow businesses</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <h2 style="margin:0 0 16px;color:#1A1A1A;font-size:26px;font-weight:700;">Thanks, ${name}.</h2>
                    <p style="margin:0 0 16px;color:#4B5563;font-size:16px;line-height:1.7;">
                      We&apos;ve received your request for a high-converting website for <strong>${businessName}</strong>.
                    </p>
                    <p style="margin:0 0 24px;color:#4B5563;font-size:16px;line-height:1.7;">
                      Our team will review the details and follow up with your next step. If you want faster clarity, book a free consultation right now.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;border-radius:16px;background-color:#EFF6FF;">
                      <tr>
                        <td style="padding:24px;text-align:center;">
                          <p style="margin:0 0 10px;color:#2563EB;font-size:18px;font-weight:700;">Book your free consultation</p>
                          <p style="margin:0 0 18px;color:#4B5563;font-size:14px;line-height:1.6;">Pick a 30-minute call and we&apos;ll discuss goals, pricing direction, and the fastest path to launch.</p>
                          <a href="${calendlyLink}" style="display:inline-block;background-color:#2563EB;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:9999px;font-weight:600;font-size:14px;">Book on Calendly</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0;color:#4B5563;font-size:14px;line-height:1.7;">
                      What happens next:<br>
                      1. We review your business goals<br>
                      2. We recommend the best package or scope<br>
                      3. We align on timeline and priorities<br>
                      4. We launch a website built to win more customers
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px;border-top:1px solid #E5E7EB;text-align:center;">
                    <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.7;">AIeasy • Delhi, India<br>hello@aieasy.in</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildAdminEmail({
  name,
  email,
  businessName,
  websiteType,
  message,
}: {
  name: string;
  email: string;
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
      <body style="margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#fafaf8;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;padding:36px;box-shadow:0 6px 20px rgba(15,23,42,0.08);">
          <h1 style="margin:0 0 24px;color:#2563EB;font-size:28px;font-weight:700;">New Website Design Lead</h1>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;color:#6B7280;width:150px;">Name</td>
              <td style="padding:10px 0;color:#1A1A1A;font-weight:600;">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;">Business</td>
              <td style="padding:10px 0;color:#1A1A1A;">${businessName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;">Website Type</td>
              <td style="padding:10px 0;color:#1A1A1A;font-weight:600;">${websiteType}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;">Email</td>
              <td style="padding:10px 0;color:#1A1A1A;">${email || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;vertical-align:top;">Business details</td>
              <td style="padding:10px 0;color:#1A1A1A;line-height:1.7;">${message}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#6B7280;">Source</td>
              <td style="padding:10px 0;color:#1A1A1A;">${leadSource}</td>
            </tr>
          </table>
          <div style="margin-top:24px;padding-top:24px;border-top:1px solid #E5E7EB;">
            <p style="margin:0;color:#9CA3AF;font-size:12px;">Received at ${new Date().toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
