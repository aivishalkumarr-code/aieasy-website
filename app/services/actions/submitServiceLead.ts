"use server";

import { revalidatePath } from "next/cache";

import {
  DEFAULT_FROM_EMAIL,
  getResendClient,
  isResendConfigured,
} from "@/lib/resend";
import { addDemoContact } from "@/lib/demo-contacts";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

import {
  serviceLeadFormSchema,
  type ServiceLeadFormValues,
} from "../serviceLeadFormSchema";

interface SubmitServiceLeadResult {
  success: boolean;
  message?: string;
  name?: string;
}

const calendlyLink = "https://calendly.com/aieasy/30min";
const adminEmail = "hello@aieasy.in";

export async function submitServiceLead(
  values: ServiceLeadFormValues,
): Promise<SubmitServiceLeadResult> {
  const parsed = serviceLeadFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Please review the form and try again.",
    };
  }

  const data = parsed.data;
  const source = `Service Page - ${data.serviceName}`;
  const notes = `Service Interest: ${data.serviceName}

Message:
${data.message}`;
  const contact = {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    company: data.company.trim(),
    status: "New" as const,
    notes,
    source,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    addDemoContact(contact);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath(`/services/${data.serviceSlug}`);

    return {
      success: true,
      name: data.name,
      message: "Your service inquiry has been received successfully!",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      success: false,
      message: "Unable to connect to database. Please try again later.",
    };
  }

  const { error } = await supabase
    .from("contacts")
    .insert(contact)
    .select("*")
    .single();

  if (error) {
    console.error("Service lead insert error:", error);
    return {
      success: false,
      message: "Failed to save your submission. Please try again.",
    };
  }

  if (isResendConfigured()) {
    const resend = getResendClient();

    if (resend) {
      try {
        await resend.emails.send({
          from: DEFAULT_FROM_EMAIL,
          to: [data.email],
          subject: `Thanks for requesting a ${data.serviceName} quote`,
          html: buildCustomerEmail(data.name, data.company, data.serviceName),
        });

        await resend.emails.send({
          from: DEFAULT_FROM_EMAIL,
          to: [adminEmail],
          subject: `New ${data.serviceName} lead: ${data.name}`,
          html: buildAdminEmail(data, source),
        });
      } catch (error) {
        console.error("Service lead email error:", error);
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath(`/services/${data.serviceSlug}`);

  return {
    success: true,
    name: data.name,
    message: "Your service inquiry has been received successfully!",
  };
}

function buildCustomerEmail(
  name: string,
  company: string,
  serviceName: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank you from AIeasy</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafaf8;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafaf8;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <tr>
                <td style="background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">AIeasy</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Premium AI Solutions</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #1A1A1A; margin: 0 0 16px 0; font-size: 24px;">Thank you, ${name}!</h2>
                  <p style="color: #6B7280; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                    We&apos;ve received your request for <strong>${serviceName}</strong> from <strong>${company}</strong>.
                  </p>
                  <p style="color: #6B7280; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                    Our team will review your requirements and get back to you within <strong>24 hours</strong>.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #2563EB; border-radius: 12px; margin: 24px 0;">
                    <tr>
                      <td style="padding: 24px; text-align: center;">
                        <p style="color: #ffffff; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Want to skip the wait?</p>
                        <p style="color: rgba(255,255,255,0.9); margin: 0 0 16px 0; font-size: 14px;">Book a free 30-minute consultation with our team right now.</p>
                        <a href="${calendlyLink}" style="display: inline-block; background-color: #ffffff; color: #2563EB; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; font-size: 14px;">Book on Calendly</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 40px; border-top: 1px solid #E5E7EB; text-align: center;">
                  <p style="color: #9CA3AF; margin: 0; font-size: 12px;">
                    AIeasy | Delhi, India<br>
                    hello@aieasy.in
                  </p>
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

function buildAdminEmail(
  values: ServiceLeadFormValues,
  source: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Service Page Lead</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: sans-serif; background-color: #fafaf8;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h1 style="color: #2563EB; margin: 0 0 24px 0;">New Service Page Lead</h1>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; width: 120px;">Name:</td>
            <td style="padding: 8px 0; color: #1A1A1A; font-weight: 600;">${values.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Email:</td>
            <td style="padding: 8px 0; color: #1A1A1A;">${values.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Company:</td>
            <td style="padding: 8px 0; color: #1A1A1A;">${values.company}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Service:</td>
            <td style="padding: 8px 0; color: #1A1A1A;">${values.serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; vertical-align: top;">Message:</td>
            <td style="padding: 8px 0; color: #1A1A1A; white-space: pre-line;">${values.message}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Source:</td>
            <td style="padding: 8px 0; color: #1A1A1A;">${source}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">Received at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
