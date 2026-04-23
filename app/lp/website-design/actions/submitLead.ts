"use server";

import { revalidatePath } from "next/cache";

import { getResendClient, isResendConfigured, DEFAULT_FROM_EMAIL } from "@/lib/resend";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function submitLandingPageLead(formData: {
  name: string;
  businessName: string;
  phone: string;
  email: string;
  message?: string;
}) {
  const calendlyLink = "https://calendly.com/yourusername/30min";

  const lead = {
    id: crypto.randomUUID(),
    name: formData.name,
    business_name: formData.businessName,
    phone: formData.phone,
    email: formData.email,
    message: formData.message || null,
    source: "lp-website-design",
    status: "New",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const supabase = await createClient();

    if (supabase) {
      await supabase.from("leads").insert(lead);
    }
  }

  if (isResendConfigured()) {
    const resend = getResendClient();

    await resend?.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [formData.email],
      subject: "Thank you for your website design inquiry - AIeasy",
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #0D9488; font-size: 28px; margin-bottom: 20px;">Thank you, ${formData.name}!</h1>
          <p style="color: #1A1A1A; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We&apos;ve received your website design inquiry. Our team will review your requirements and get back to you within 24 hours.
          </p>
          <div style="background: #F4F6F2; padding: 24px; border-radius: 12px; margin: 24px 0;">
            <h2 style="color: #1A1A1A; font-size: 20px; margin-bottom: 12px;">Ready to discuss your project?</h2>
            <p style="color: #6B7280; margin-bottom: 16px;">Book a free 30-minute consultation with our design team.</p>
            <a href="${calendlyLink}" style="display: inline-block; background: #0D9488; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Schedule Your Call</a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">
            Best regards,<br />
            <strong style="color: #0D9488;">AIeasy Team</strong>
          </p>
        </div>
      `,
    });
  }

  revalidatePath("/lp/website-design");

  return { success: true, calendlyLink };
}
