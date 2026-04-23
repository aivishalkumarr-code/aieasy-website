"use server";

import { revalidatePath } from "next/cache";

import { getContacts } from "@/app/dashboard/actions/crm";
import {
  getMockContacts,
  getMockQuotes,
  getMockQuoteServices,
} from "@/lib/mock-data";
import { DEFAULT_FROM_EMAIL, getResendClient, isResendConfigured } from "@/lib/resend";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  formatCurrency,
  getServiceSubtotal,
  type ActionResult,
  type Contact,
  type Quote,
  type SentEmail,
  type ServiceKey,
} from "@/types";

const buildQuoteNumber = () => `AE-${Date.now().toString().slice(-6)}`;

const buildQuoteEmailHtml = (contact: Contact, quote: Quote) => {
  const services = getMockQuoteServices(quote.services)
    .map((service) => `<li>${service.label} — ${formatCurrency(service.price)}</li>`)
    .join("");

  return `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
      <h2 style="margin-bottom: 8px;">AIeasy quote ${quote.quote_number}</h2>
      <p>Hi ${contact.name},</p>
      <p>Thanks for the opportunity. Your quote is attached below as a summary for review.</p>
      <ul>${services}</ul>
      <p><strong>Subtotal:</strong> ${formatCurrency(quote.subtotal)}</p>
      <p><strong>Tax:</strong> ${formatCurrency(quote.tax_amount)}</p>
      <p><strong>Total:</strong> ${formatCurrency(quote.total)}</p>
      <p><strong>Valid until:</strong> ${quote.valid_until}</p>
      <p>Reply to this email if you want alternate scope or phased pricing options.</p>
      <p>Best,<br/>AIeasy</p>
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
  services: ServiceKey[];
  taxRate: number;
  validUntil: string;
}): Promise<ActionResult<Quote>> => {
  const subtotal = getServiceSubtotal(payload.services);
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

  return { success: true, data: data as Quote, message: "Quote created." };
};

export const sendQuoteEmail = async (
  quoteId: string,
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
        subject: `Your AIeasy quote ${quote.quote_number}`,
        html: buildQuoteEmailHtml(contact, quote),
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
    subject: `Your AIeasy quote ${updatedQuote.quote_number}`,
    template: "quote_delivery",
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
          subject: `Your AIeasy quote ${updatedQuote.quote_number}`,
          template: "quote_delivery",
          status,
          sent_at: new Date().toISOString(),
        },
    },
    message,
  };
};
