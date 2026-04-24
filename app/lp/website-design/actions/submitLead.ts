"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getResendClient, isResendConfigured, DEFAULT_FROM_EMAIL } from "@/lib/resend";

interface SubmitLeadResult {
  success: boolean;
  message?: string;
  name?: string;
}

export async function submitLead(formData: FormData): Promise<SubmitLeadResult> {
  const name = formData.get("name") as string;
  const businessName = formData.get("businessName") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // Validation
  if (!name || !phone || !email || !message) {
    return { success: false, message: "Please fill in all required fields." };
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  // Check Supabase is configured
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Form submission is currently unavailable. Please try again later.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      success: false,
      message: "Unable to connect to database. Please try again later.",
    };
  }

  // Format notes from message
  const notes = `Service Interest: Website Design\nMessage:\n${message.trim()}`;

  // Insert into Supabase (NOT upsert - always create new)
  // Try insert with all fields including source
  let insertData: any = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    company: businessName?.trim() || null,
    status: "New",
    notes: notes,
    source: "Landing Page - Website Design",
    created_at: new Date().toISOString(),
  };

  let { data, error } = await supabase
    .from("contacts")
    .insert(insertData)
    .select()
    .single();

  // If source column doesn't exist, try without it
  if (error && error.message && error.message.includes("source")) {
    console.log("Source column missing, trying insert without source field...");
    delete insertData.source;
    const result = await supabase
      .from("contacts")
      .insert(insertData)
      .select()
      .single();
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error("Supabase insert error:", JSON.stringify(error, null, 2));
    return {
      success: false,
      message: `Failed to save lead: ${error.message}`,
    };
  }

  // Send email via Resend if configured
  if (isResendConfigured()) {
    const resend = getResendClient();
    if (resend) {
      try {
        // Send confirmation email to customer
        await resend.emails.send({
          from: DEFAULT_FROM_EMAIL,
          to: [email],
          subject: "Thank you for your interest in AIeasy Website Design!",
          html: buildCustomerEmail(name, businessName),
        });

        // Send notification to admin
        await resend.emails.send({
          from: DEFAULT_FROM_EMAIL,
          to: ["hello@aieasy.in"],
          subject: `New Website Design Lead: ${name}`,
          html: buildAdminEmail(name, email, phone, businessName, message),
        });
      } catch (err) {
        console.error("Resend email error:", err);
        // Don't fail the submission if email fails
      }
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

function buildCustomerEmail(name: string, businessName?: string | null): string {
  const calendlyLink = "https://calendly.com/aieasy/30min";
  
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
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0D9488 0%, #14B8A6 100%); padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">AIeasy</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Premium AI Solutions</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #1A1A1A; margin: 0 0 16px 0; font-size: 24px;">Thank you, ${name}!</h2>
                  <p style="color: #6B7280; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                    We've received your request for website design services. ${businessName ? `We're excited to learn more about <strong>${businessName}</strong>!` : ""}
                  </p>
                  <p style="color: #6B7280; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                    Our team will review your requirements and get back to you within <strong>24 hours</strong> with a custom quote.
                  </p>
                  
                  <!-- CTA Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0D9488; border-radius: 12px; margin: 24px 0;">
                    <tr>
                      <td style="padding: 24px; text-align: center;">
                        <p style="color: #ffffff; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Want to skip the wait?</p>
                        <p style="color: rgba(255,255,255,0.9); margin: 0 0 16px 0; font-size: 14px;">Book a free 30-minute consultation with our team right now.</p>
                        <a href="${calendlyLink}" style="display: inline-block; background-color: #ffffff; color: #0D9488; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; font-size: 14px;">Book on Calendly</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #6B7280; margin: 24px 0 0 0; font-size: 14px; line-height: 1.6;">
                    <strong>What's next?</strong><br>
                    1. We'll review your project requirements<br>
                    2. Our team will prepare a custom quote<br>
                    3. We'll schedule a call to discuss details<br>
                    4. Start your project with confidence
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
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

function buildAdminEmail(name: string, email: string, phone: string, businessName: string | null, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Website Design Lead</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: sans-serif; background-color: #fafaf8;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h1 style="color: #0D9488; margin: 0 0 24px 0;">🎯 New Website Design Lead</h1>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; width: 120px;">Name:</td>
            <td style="padding: 8px 0; color: #1A1A1A; font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Email:</td>
            <td style="padding: 8px 0; color: #1A1A1A;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Phone:</td>
            <td style="padding: 8px 0; color: #1A1A1A;">${phone}</td>
          </tr>
          ${businessName ? `
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Company:</td>
            <td style="padding: 8px 0; color: #1A1A1A;">${businessName}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 8px 0; color: #6B7280; vertical-align: top;">Message:</td>
            <td style="padding: 8px 0; color: #1A1A1A;">${message}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Source:</td>
            <td style="padding: 8px 0; color: #1A1A1A;">Landing Page - Website Design</td>
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
