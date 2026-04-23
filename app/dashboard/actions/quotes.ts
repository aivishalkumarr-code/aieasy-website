"use server";

import { revalidatePath } from "next/cache";
import { jsPDF } from "jspdf";

import { getContacts } from "@/app/dashboard/actions/crm";
import {
  getMockContacts,
  getMockQuotes,
} from "@/lib/mock-data";
import { DEFAULT_FROM_EMAIL, getResendClient, isResendConfigured } from "@/lib/resend";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  formatCurrency,
  type ActionResult,
  type Contact,
  type Quote,
  type QuoteServiceItem,
  type SentEmail,
} from "@/types";

const buildQuoteNumber = () => `AE-${Date.now().toString().slice(-6)}`;
const buildAcceptQuoteUrl = (quote: Quote) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const path = `/api/quotes/accept?quoteId=${encodeURIComponent(quote.id)}&token=${encodeURIComponent(`quote-${quote.id}`)}`;

  return appUrl ? `${appUrl}${path}` : path;
};
const isMissingGlobalNotesColumnError = (message: string) =>
  /global_notes/i.test(message) && /(schema cache|column)/i.test(message);

const generateQuotePDF = (
  quote: Quote,
  contact: Contact,
  services: QuoteServiceItem[]
): Buffer => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // Header with brand color
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, 595, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("AIeasy", 40, 45);
  doc.setFontSize(12);
  doc.text("Premium AI Solutions", 40, 65);

  // Quote title
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(18);
  doc.text("QUOTE", 450, 45);

  // Client info
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Prepared for:", 40, 110);
  doc.setFont("helvetica", "normal");
  doc.text(contact.name, 120, 110);
  doc.text(contact.email, 120, 128);
  if (contact.company) {
    doc.text(contact.company, 120, 146);
  }

  // Quote details
  doc.setFont("helvetica", "bold");
  doc.text("Quote #:", 380, 110);
  doc.setFont("helvetica", "normal");
  doc.text(quote.quote_number, 450, 110);
  doc.setFont("helvetica", "bold");
  doc.text("Valid until:", 380, 128);
  doc.setFont("helvetica", "normal");
  doc.text(quote.valid_until, 450, 128);
  doc.setFont("helvetica", "bold");
  doc.text("Date:", 380, 146);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(quote.created_at || Date.now()).toLocaleDateString(), 450, 146);

  // Divider
  doc.setDrawColor(221, 231, 227);
  doc.line(40, 170, 555, 170);

  // Services table header
  let cursorY = 195;
  doc.setFillColor(248, 250, 249);
  doc.rect(40, cursorY - 12, 515, 25, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text("Service", 50, cursorY);
  doc.text("Description", 250, cursorY);
  doc.text("Price", 520, cursorY, { align: "right" });

  cursorY += 25;
  doc.setTextColor(26, 26, 26);
  doc.setFont("helvetica", "normal");

  services.forEach((service) => {
    // Service name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(service.label, 50, cursorY);

    // Price
    doc.text(formatCurrency(service.customPrice), 520, cursorY, { align: "right" });

    cursorY += 16;

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    const splitDescription = doc.splitTextToSize(service.description, 180);
    doc.text(splitDescription, 50, cursorY);

    // Notes if present
    if (service.notes) {
      cursorY += splitDescription.length * 12;
      doc.setTextColor(13, 148, 136);
      doc.setFontSize(8);
      doc.text(`Note: ${service.notes}`, 50, cursorY);
      doc.setTextColor(107, 114, 128);
      cursorY += 12;
    } else {
      cursorY += splitDescription.length * 12;
    }

    cursorY += 15;
    doc.setTextColor(26, 26, 26);
  });

  // Global notes
  if (quote.global_notes) {
    cursorY += 10;
    doc.setFillColor(236, 253, 245);
    doc.rect(40, cursorY - 5, 515, 40, "F");
    doc.setTextColor(13, 148, 136);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Additional Notes:", 50, cursorY + 8);
    doc.setFont("helvetica", "normal");
    const splitNotes = doc.splitTextToSize(quote.global_notes, 480);
    doc.text(splitNotes, 50, cursorY + 22);
    cursorY += 50;
  }

  // Totals section
  cursorY += 20;
  doc.setDrawColor(221, 231, 227);
  doc.line(320, cursorY - 10, 555, cursorY - 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text("Subtotal:", 380, cursorY);
  doc.text(formatCurrency(quote.subtotal), 545, cursorY, { align: "right" });

  cursorY += 20;
  doc.text(`Tax (${quote.tax_rate}%):`, 380, cursorY);
  doc.text(formatCurrency(quote.tax_amount), 545, cursorY, { align: "right" });

  cursorY += 8;
  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(1);
  doc.line(380, cursorY, 555, cursorY);

  cursorY += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(13, 148, 136);
  doc.text("Total:", 380, cursorY);
  doc.text(formatCurrency(quote.total), 545, cursorY, { align: "right" });

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("AIeasy Solutions Pvt Ltd • Delhi, India", 40, 780);
  doc.text("contact@aieasy.io • www.aieasy.io", 40, 795);

  // Terms
  doc.text("Terms: 50% advance, 50% on delivery. Quote valid for 14 days.", 380, 780, { align: "right" });

  return Buffer.from(doc.output("arraybuffer"));
};

const buildQuoteEmailRows = (services: QuoteServiceItem[]) =>
  services
    .map(
      (service) =>
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
            <strong>${service.label}</strong>
            ${service.notes ? `<br/><span style="font-size: 12px; color: #0D9488;">Note: ${service.notes}</span>` : ""}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">
            ${formatCurrency(service.customPrice)}
          </td>
        </tr>`
    )
    .join("");

const buildQuoteEmailHtml = (contact: Contact, quote: Quote, services: QuoteServiceItem[]) => {
  const servicesList = buildQuoteEmailRows(services);

  return `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AIeasy</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Premium AI Solutions</p>
      </div>
      
      <div style="padding: 30px; background: #ffffff;">
        <h2 style="color: #1A1A1A; margin: 0 0 20px; font-size: 20px;">Your Quote is Ready</h2>
        
        <p style="color: #4B5563; margin: 0 0 20px;">Hi ${contact.name},</p>
        
        <p style="color: #4B5563; margin: 0 0 25px;">
          Thank you for considering AIeasy. Your personalized quote <strong>#${quote.quote_number}</strong> is attached below for your review.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #F8FAF9; border-radius: 12px; overflow: hidden;">
          <thead>
            <tr style="background: #ECFDF5;">
              <th style="padding: 12px; text-align: left; color: #0F766E; font-size: 12px; text-transform: uppercase;">Service</th>
              <th style="padding: 12px; text-align: right; color: #0F766E; font-size: 12px; text-transform: uppercase;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${servicesList}
          </tbody>
        </table>
        
        <div style="background: #F8FAF9; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin: 0 0 8px; color: #4B5563;">
            <span>Subtotal:</span>
            <span>${formatCurrency(quote.subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 0 0 8px; color: #4B5563;">
            <span>Tax (${quote.tax_rate}%):</span>
            <span>${formatCurrency(quote.tax_amount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #0D9488; font-weight: bold; font-size: 18px; color: #0D9488;">
            <span>Total:</span>
            <span>${formatCurrency(quote.total)}</span>
          </div>
        </div>
        
        ${quote.global_notes ? `<div style="background: #ECFDF5; padding: 15px; border-radius: 8px; margin: 20px 0; color: #0F766E; font-size: 14px;"><strong>Additional Notes:</strong><br/>${quote.global_notes}</div>` : ""}
        
        <p style="color: #4B5563; margin: 25px 0 0;">
          <strong>Valid until:</strong> ${quote.valid_until}<br/>
          Please reply to this email if you have any questions or would like to discuss alternate options.
        </p>
        
        <p style="color: #4B5563; margin: 25px 0 0;">
          Best regards,<br/>
          <strong style="color: #0D9488;">AIeasy Team</strong>
        </p>
      </div>
      
      <div style="background: #F4F6F2; padding: 20px 30px; text-align: center; font-size: 12px; color: #6B7280;">
        AIeasy Solutions Pvt Ltd • Delhi, India<br/>
        contact@aieasy.io • www.aieasy.io
      </div>
    </div>
  `;
};

const buildQuoteWithAcceptEmailHtml = (contact: Contact, quote: Quote, services: QuoteServiceItem[]) => {
  const servicesList = buildQuoteEmailRows(services);
  const acceptUrl = buildAcceptQuoteUrl(quote);

  return `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #1A1A1A; max-width: 640px; margin: 0 auto; background: #F8FAF9;">
      <div style="background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); padding: 36px 32px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 30px; letter-spacing: 0.2px;">AIeasy</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Premium AI Solutions</p>
      </div>

      <div style="background: #FFFFFF; padding: 32px;">
        <h2 style="margin: 0 0 16px; font-size: 24px; color: #111827;">Your Quote is Ready for Approval</h2>
        <p style="margin: 0 0 18px; color: #4B5563;">Hi ${contact.name},</p>
        <p style="margin: 0 0 24px; color: #4B5563;">
          Thank you for considering AIeasy. Your quote <strong>#${quote.quote_number}</strong> is attached as a PDF and summarized below for quick review.
        </p>

        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin: 0 0 24px; border: 1px solid #E5E7EB; border-radius: 14px; overflow: hidden;">
          <tbody>
            <tr>
              <td style="padding: 14px 16px; background: #F8FAF9; border-bottom: 1px solid #E5E7EB; width: 42%; font-size: 13px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em;">Quote Number</td>
              <td style="padding: 14px 16px; border-bottom: 1px solid #E5E7EB; font-weight: 600; color: #111827;">${quote.quote_number}</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; background: #F8FAF9; border-bottom: 1px solid #E5E7EB; font-size: 13px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em;">Prepared For</td>
              <td style="padding: 14px 16px; border-bottom: 1px solid #E5E7EB; color: #111827;">
                <strong>${contact.name}</strong><br/>
                <span style="color: #6B7280;">${contact.email}${contact.company ? ` • ${contact.company}` : ""}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; background: #F8FAF9; border-bottom: 1px solid #E5E7EB; font-size: 13px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em;">Issued On</td>
              <td style="padding: 14px 16px; border-bottom: 1px solid #E5E7EB; color: #111827;">${new Date(quote.created_at || Date.now()).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; background: #F8FAF9; font-size: 13px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em;">Valid Until</td>
              <td style="padding: 14px 16px; color: #111827; font-weight: 600;">${quote.valid_until}</td>
            </tr>
          </tbody>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 14px; overflow: hidden;">
          <thead>
            <tr style="background: #ECFDF5;">
              <th style="padding: 14px 16px; text-align: left; color: #0F766E; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Quote Details</th>
              <th style="padding: 14px 16px; text-align: right; color: #0F766E; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${servicesList}
          </tbody>
        </table>

        <div style="background: #F8FAF9; padding: 22px; border: 1px solid #E5E7EB; border-radius: 14px; margin: 0 0 24px;">
          <div style="display: flex; justify-content: space-between; gap: 16px; margin: 0 0 10px; color: #4B5563;">
            <span>Subtotal</span>
            <span>${formatCurrency(quote.subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 16px; margin: 0 0 10px; color: #4B5563;">
            <span>Tax (${quote.tax_rate}%)</span>
            <span>${formatCurrency(quote.tax_amount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 16px; padding-top: 14px; border-top: 2px solid #0D9488; font-weight: 700; font-size: 18px; color: #0D9488;">
            <span>Total</span>
            <span>${formatCurrency(quote.total)}</span>
          </div>
        </div>

        ${quote.global_notes ? `<div style="margin: 0 0 24px; padding: 16px 18px; border-radius: 12px; background: #ECFDF5; color: #0F766E;"><strong>Additional Notes</strong><br/>${quote.global_notes}</div>` : ""}

        <div style="text-align: center; margin: 30px 0 22px;">
          <a href="${acceptUrl}" style="display: inline-block; background: #16A34A; color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 16px; padding: 15px 32px; border-radius: 999px; box-shadow: 0 10px 24px rgba(22, 163, 74, 0.25);">
            Accept Quote
          </a>
        </div>

        <p style="margin: 0 0 12px; color: #4B5563; text-align: center;">
          If the button does not work, copy and paste this link into your browser:<br/>
          <a href="${acceptUrl}" style="color: #0D9488; word-break: break-all;">${acceptUrl}</a>
        </p>

        <div style="margin: 24px 0 0; padding: 16px 18px; border-radius: 12px; background: #FFF7ED; border: 1px solid #FED7AA; color: #9A3412;">
          <strong>Expiry notice:</strong> This quote is valid until ${quote.valid_until}. Pricing and availability may change after the expiry date.
        </div>

        <p style="margin: 24px 0 0; color: #4B5563;">
          Questions or requested revisions? Reply to this email and our team will help right away.
        </p>
      </div>

      <div style="background: #F4F6F2; padding: 22px 32px; text-align: center; font-size: 12px; color: #6B7280;">
        AIeasy Solutions Pvt Ltd • Delhi, India<br/>
        contact@aieasy.io • www.aieasy.io
      </div>
    </div>
  `;
};

const insertSentEmail = async (email: Omit<SentEmail, "id">) => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from("sent_emails").insert(email).select("*").single();
  return data as SentEmail | null;
};

export const getQuotes = async (): Promise<Quote[]> => {
  if (!isSupabaseConfigured()) {
    return getMockQuotes();
  }

  const supabase = await createClient();

  if (!supabase) {
    return getMockQuotes();
  }

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return getMockQuotes();
  }

  return data as Quote[];
};

export const createQuote = async (payload: {
  contactId: string;
  services: QuoteServiceItem[];
  taxRate: number;
  validUntil: string;
  globalNotes?: string;
}): Promise<ActionResult<Quote>> => {
  const subtotal = payload.services.reduce((total, service) => total + service.customPrice, 0);
  const taxAmount = Math.round(subtotal * (payload.taxRate / 100));

  const quote: Quote = {
    id: crypto.randomUUID(),
    quote_number: buildQuoteNumber(),
    contact_id: payload.contactId,
    services: payload.services,
    subtotal,
    tax_rate: payload.taxRate,
    tax_amount: taxAmount,
    total: subtotal + taxAmount,
    status: "Draft",
    valid_until: payload.validUntil,
    created_at: new Date().toISOString(),
    global_notes: payload.globalNotes || null,
  };

  if (!isSupabaseConfigured()) {
    return { success: true, data: quote, message: "Quote created in demo mode." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase client unavailable." };
  }

  const quoteInsert = {
    id: quote.id,
    quote_number: quote.quote_number,
    contact_id: quote.contact_id,
    services: quote.services,
    subtotal: quote.subtotal,
    tax_rate: quote.tax_rate,
    tax_amount: quote.tax_amount,
    total: quote.total,
    status: quote.status,
    valid_until: quote.valid_until,
    created_at: quote.created_at,
  };

  let { data, error } = await supabase
    .from("quotes")
    .insert(
      quote.global_notes
        ? {
            ...quoteInsert,
            global_notes: quote.global_notes,
          }
        : quoteInsert
    )
    .select("*")
    .single();

  if (error && isMissingGlobalNotesColumnError(error.message)) {
    const fallbackResult = await supabase.from("quotes").insert(quoteInsert).select("*").single();
    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/quotes");

  return {
    success: true,
    data: {
      ...(data as Quote),
      global_notes: quote.global_notes,
    },
    message: "Quote created successfully.",
  };
};

const sendQuoteEmailInternal = async ({
  quoteId,
  template,
  buildSubject,
  buildHtml,
}: {
  quoteId: string;
  template: SentEmail["template"];
  buildSubject: (quote: Quote) => string;
  buildHtml: (contact: Contact, quote: Quote, services: QuoteServiceItem[]) => string;
}): Promise<ActionResult<{ quote: Quote; email: SentEmail | null }>> => {
  const mockContacts = getMockContacts();
  const mockQuotes = getMockQuotes();

  const quoteSource = isSupabaseConfigured() ? await getQuotes() : mockQuotes;
  const contactsSource = isSupabaseConfigured() ? await getContacts() : mockContacts;

  const quote = quoteSource.find((entry) => entry.id === quoteId);
  const contact = contactsSource.find((entry) => entry.id === quote?.contact_id);

  if (!quote || !contact) {
    return { success: false, message: "Quote or contact not found." };
  }

  const pdfBuffer = generateQuotePDF(quote, contact, quote.services);
  const subject = buildSubject(quote);

  let status: SentEmail["status"] = isResendConfigured() ? "sent" : "queued";
  let message = isResendConfigured()
    ? "Quote email sent."
    : "Resend not configured, quote email queued locally.";

  if (isResendConfigured()) {
    try {
      const resend = getResendClient();
      const response = await resend?.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: [contact.email],
        subject,
        html: buildHtml(contact, quote, quote.services),
        attachments: [
          {
            filename: `AIeasy-Quote-${quote.quote_number}.pdf`,
            content: pdfBuffer.toString("base64"),
          },
        ],
      });

      if (response?.error) {
        status = "failed";
        message = response.error.message;
      }
    } catch (error) {
      status = "failed";
      message = error instanceof Error ? error.message : "Failed to send quote email.";
    }
  }

  let updatedQuote = quote;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();

    if (supabase) {
      const { data } = await supabase
        .from("quotes")
        .update({ status: status === "failed" ? quote.status : "Sent" })
        .eq("id", quoteId)
        .select("*")
        .single();

      if (data) {
        updatedQuote = data as Quote;
      }
    }
  } else if (status !== "failed") {
    updatedQuote = { ...quote, status: "Sent" };
  }

  const emailRecord = await insertSentEmail({
    to_email: contact.email,
    to_name: contact.name,
    subject,
    template,
    status,
    sent_at: new Date().toISOString(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/quotes");
  revalidatePath("/dashboard/emails");

  return {
    success: status !== "failed",
    data: {
      quote: updatedQuote,
      email:
        emailRecord ?? {
          id: crypto.randomUUID(),
          to_email: contact.email,
          to_name: contact.name,
          subject,
          template,
          status,
          sent_at: new Date().toISOString(),
        },
    },
    message,
  };
};

export const sendQuoteEmail = async (
  quoteId: string
): Promise<ActionResult<{ quote: Quote; email: SentEmail | null }>> =>
  sendQuoteEmailInternal({
    quoteId,
    template: "quote_delivery",
    buildSubject: (quote) => `Your AIeasy Quote ${quote.quote_number}`,
    buildHtml: buildQuoteEmailHtml,
  });

export const sendQuoteWithAcceptButton = async (
  quoteId: string
): Promise<ActionResult<{ quote: Quote; email: SentEmail | null }>> =>
  sendQuoteEmailInternal({
    quoteId,
    template: "quote_with_accept",
    buildSubject: (quote) => `Review and accept your AIeasy quote ${quote.quote_number}`,
    buildHtml: buildQuoteWithAcceptEmailHtml,
  });
