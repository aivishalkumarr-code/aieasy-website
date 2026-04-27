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
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitize = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function submitLead(formData: FormData): Promise<SubmitLeadResult> {
  const name = sanitize(formData.get("name"));
  const businessName = sanitize(formData.get("businessName"));
  const email = sanitize(formData.get("email")).toLowerCase();
  const websiteType = sanitize(formData.get("websiteType"));
  const message = sanitize(formData.get("message"));

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

  const websiteTypeLabel = websiteType ? websiteType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Not specified";
  
  const notes = [
    "Service Interest: Website Design",
    `Website Type: ${websiteTypeLabel}`,
    `Business Name: ${businessName}`,
    `Email: ${email || "Not provided"}`,
    `What is your business about?: ${message || "Not provided"}`,
  ].join("\n\n");

  // Insert with fallback if email is empty or if there's an error
  const insertData: any = {
    name,
    email: email || null,
    company: businessName,
    status: "New",
    notes,
    source: leadSource,
    created_at: new Date().toISOString(),
  };

  let { error } = await supabase.from("contacts").insert(insertData);

  // If email column requires value but is empty, try without email
  if (error && error.message && (error.message.includes("email") || error.message.includes("not-null"))) {
    delete insertData.email;
    const result = await supabase.from("contacts").insert(insertData);
    error = result.error;
  }

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        message:
          "This email is already in our system. Please book your free consultation or use another email address.",
      };
    }

    return {
      success: false,
      message: "Failed to save your request. Please try again.",
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
                  <td style="background:linear-gradient(135deg,#0f766e 0%,#0D9488 55%,#14B8A6 100%);padding:36px 40px;text-align:center;">
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
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;border-radius:16px;background-color:#f0fdfa;">
                      <tr>
                        <td style="padding:24px;text-align:center;">
                          <p style="margin:0 0 10px;color:#0D9488;font-size:18px;font-weight:700;">Book your free consultation</p>
                          <p style="margin:0 0 18px;color:#4B5563;font-size:14px;line-height:1.6;">Pick a 30-minute call and we&apos;ll discuss goals, pricing direction, and the fastest path to launch.</p>
                          <a href="${calendlyLink}" style="display:inline-block;background-color:#0D9488;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:9999px;font-weight:600;font-size:14px;">Book on Calendly</a>
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
          <h1 style="margin:0 0 24px;color:#0D9488;font-size:28px;font-weight:700;">New Website Design Lead</h1>
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
