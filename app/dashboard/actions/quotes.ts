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
  type EmailTemplateId,
  type Quote,
  type QuoteServiceItem,
  type SentEmail,
} from "@/types";

const buildQuoteNumber = () => `AE-${Date.now().toString().slice(-6)}`;

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

const buildAcceptQuoteUrl = (quote: Quote) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";

  return `${baseUrl.replace(/\/$/, "")}/api/quotes/accept?quoteId=${encodeURIComponent(quote.id)}&token=${encodeURIComponent(`quote-${quote.id}`)}`;
};

const buildQuoteEmailHtml = (contact: Contact, quote: Quote, services: QuoteServiceItem[]) => {
  const servicesList = services
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

const buildQuoteWithAcceptEmailHtml = (
  contact: Contact,
  quote: Quote,
  services: QuoteServiceItem[]
) => {
  const acceptUrl = buildAcceptQuoteUrl(quote);
  const servicesRows = services
    .map(
      (service) => `
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #E5E7EB; vertical-align: top;">
            <div style="font-weight: 600; color: #111827;">${service.label}</div>
            <div style="margin-top: 4px; font-size: 13px; color: #6B7280;">${service.description}</div>
            ${service.notes ? `<div style="margin-top: 6px; font-size: 12px; color: #0D9488;">Note: ${service.notes}</div>` : ""}
          </td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #E5E7EB; text-align: right; white-space: nowrap; vertical-align: top; font-weight: 600; color: #111827;">
            ${formatCurrency(service.customPrice)}
          </td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #1F2937; background: #F3F7F6; padding: 24px 12px;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #DDE7E3;">
        <div style="background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 30px; font-weight: 700;">AIeasy</h1>
          <p style="color: rgba(255,255,255,0.92); margin: 10px 0 0; font-size: 14px;">Premium AI Solutions</p>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px;">Your Quote is Ready</h2>
          <p style="margin: 0 0 16px; color: #4B5563;">Hi ${contact.name},</p>
          <p style="margin: 0 0 24px; color: #4B5563;">
            Thank you for considering AIeasy. Your quote <strong>#${quote.quote_number}</strong> is attached as a PDF and summarized below for quick review.
          </p>

          <div style="margin: 0 0 24px; border: 1px solid #E5E7EB; border-radius: 14px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #F8FAF9;">
                  <th style="padding: 14px 16px; text-align: left; font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; color: #0F766E;">Service</th>
                  <th style="padding: 14px 16px; text-align: right; font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; color: #0F766E;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${servicesRows}
              </tbody>
            </table>
          </div>

          <div style="background: #F8FAF9; padding: 20px; border-radius: 12px; margin: 0 0 24px;">
            <div style="display: flex; justify-content: space-between; gap: 12px; margin: 0 0 10px; color: #4B5563;">
              <span>Subtotal</span>
              <span>${formatCurrency(quote.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px; margin: 0 0 10px; color: #4B5563;">
              <span>Tax (${quote.tax_rate}%)</span>
              <span>${formatCurrency(quote.tax_amount)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px; padding-top: 12px; border-top: 2px solid #0D9488; font-weight: 700; font-size: 18px; color: #0D9488;">
              <span>Total</span>
              <span>${formatCurrency(quote.total)}</span>
            </div>
          </div>

          ${quote.global_notes ? `<div style="margin: 0 0 24px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 16px; color: #0F766E; font-size: 14px;"><strong>Additional Notes</strong><div style="margin-top: 6px;">${quote.global_notes}</div></div>` : ""}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" style="background: #0D9488; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; letter-spacing: 0.02em;">
              ACCEPT QUOTE
            </a>
          </div>

          <p style="text-align: center; color: #6B7280; font-size: 14px; word-break: break-all; margin: 0 0 24px;">
            Or copy this link: ${acceptUrl}
          </p>

          <p style="margin: 0 0 8px; color: #111827;"><strong>Valid until:</strong> ${quote.valid_until}</p>
          <p style="margin: 0 0 24px; color: #6B7280; font-size: 14px;">
            This quote will expire on the date above. If you would like any adjustments before accepting, simply reply to this email.
          </p>

          <p style="margin: 0; color: #4B5563;">
            Best regards,<br />
            <strong style="color: #0D9488;">AIeasy Team</strong>
          </p>
        </div>

        <div style="background: #F4F6F2; padding: 20px 30px; text-align: center; font-size: 12px; color: #6B7280;">
          AIeasy Solutions Pvt Ltd • Delhi, India<br />
          contact@aieasy.io • www.aieasy.io
        </div>
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

const sendQuoteEmailByTemplate = async (
  quoteId: string,
  options: {
    htmlBuilder: (contact: Contact, quote: Quote, services: QuoteServiceItem[]) => string;
    template: EmailTemplateId;
    successMessage: string;
    queuedMessage: string;
    failureMessage: string;
  }
): Promise<ActionResult<{ quote: Quote; email: SentEmail | null }>> => {
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

  let status: SentEmail["status"] = isResendConfigured() ? "sent" : "queued";
  let message = isResendConfigured()
    ? options.successMessage
    : options.queuedMessage;

  if (isResendConfigured()) {
    try {
      const resend = getResendClient();
      const response = await resend?.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: [contact.email],
        subject: `Your AIeasy Quote ${quote.quote_number}`,
        html: options.htmlBuilder(contact, quote, quote.services),
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
      message = error instanceof Error ? error.message : options.failureMessage;
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

  const subject = `Your AIeasy Quote ${updatedQuote.quote_number}`;
  const sentAt = new Date().toISOString();

  const emailRecord = await insertSentEmail({
    to_email: contact.email,
    to_name: contact.name,
    subject,
    template: options.template,
    status,
    sent_at: sentAt,
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
          template: options.template,
          status,
          sent_at: sentAt,
        },
    },
    message,
  };
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

  const { data, error } = await supabase.from("quotes").insert(quote).select("*").single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/quotes");

  return { success: true, data: data as Quote, message: "Quote created successfully." };
};

export const sendQuoteEmail = async (
  quoteId: string
): Promise<ActionResult<{ quote: Quote; email: SentEmail | null }>> => {
  return sendQuoteEmailByTemplate(quoteId, {
    htmlBuilder: buildQuoteEmailHtml,
    template: "quote_delivery",
    successMessage: "Quote email sent.",
    queuedMessage: "Resend not configured, quote email queued locally.",
    failureMessage: "Failed to send quote email.",
  });
};

export const sendQuoteWithAcceptButton = async (
  quoteId: string
): Promise<ActionResult<{ quote: Quote; email: SentEmail | null }>> =>
  sendQuoteEmailByTemplate(quoteId, {
    htmlBuilder: buildQuoteWithAcceptEmailHtml,
    template: "quote_with_accept",
    successMessage: "Quote email with accept button sent.",
    queuedMessage: "Resend not configured, quote email with accept button queued locally.",
    failureMessage: "Failed to send quote email with accept button.",
  });
