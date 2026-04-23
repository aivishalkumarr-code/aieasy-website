"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { jsPDF } from "jspdf";
import { FileText, LoaderCircle, Mail } from "lucide-react";

import { createQuote, sendQuoteEmail } from "@/app/dashboard/actions/quotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SERVICE_CATALOG, formatCurrency, type Contact, type Quote, type ServiceKey } from "@/types";

interface QuotesClientProps {
  initialContacts: Contact[];
  initialQuotes: Quote[];
}

const getNextValidDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
};

export function QuotesClient({ initialContacts, initialQuotes }: QuotesClientProps) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [contactId, setContactId] = useState(initialContacts[0]?.id ?? "");
  const [selectedServices, setSelectedServices] = useState<ServiceKey[]>([]);
  const [taxRate, setTaxRate] = useState("18");
  const [validUntil, setValidUntil] = useState(getNextValidDate());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const contact = initialContacts.find((entry) => entry.id === contactId) ?? initialContacts[0] ?? null;
  const selectedCatalog = SERVICE_CATALOG.filter((service) => selectedServices.includes(service.key));
  const subtotal = selectedCatalog.reduce((total, service) => total + service.price, 0);
  const taxAmount = Math.round(subtotal * (Number(taxRate || 0) / 100));
  const total = subtotal + taxAmount;

  useEffect(() => {
    if (!contact || selectedCatalog.length === 0) {
      setPdfUrl(null);
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("AIeasy Quote Preview", 40, 56);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Prepared for: ${contact.name}`, 40, 92);
    doc.text(`Email: ${contact.email}`, 40, 110);
    doc.text(`Valid until: ${validUntil}`, 40, 128);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 40, 146);

    let cursorY = 190;
    selectedCatalog.forEach((service) => {
      doc.setFont("helvetica", "bold");
      doc.text(service.label, 40, cursorY);
      doc.setFont("helvetica", "normal");
      doc.text(service.description, 40, cursorY + 18, { maxWidth: 360 });
      doc.text(formatCurrency(service.price), 500, cursorY, { align: "right" });
      cursorY += 52;
    });

    doc.setFont("helvetica", "bold");
    doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 40, cursorY + 12);
    doc.text(`Tax (${taxRate}%): ${formatCurrency(taxAmount)}`, 40, cursorY + 32);
    doc.text(`Total: ${formatCurrency(total)}`, 40, cursorY + 56);

    const blob = doc.output("blob");
    const nextUrl = URL.createObjectURL(blob);
    setPdfUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [contact, selectedCatalog, subtotal, taxAmount, taxRate, total, validUntil]);

  const quoteRows = useMemo(
    () =>
      quotes.map((quote) => ({
        ...quote,
        contact: initialContacts.find((entry) => entry.id === quote.contact_id) ?? null,
      })),
    [initialContacts, quotes],
  );

  const toggleService = (serviceKey: ServiceKey) => {
    setSelectedServices((current) =>
      current.includes(serviceKey)
        ? current.filter((entry) => entry !== serviceKey)
        : [...current, serviceKey],
    );
  };

  const handleCreateQuote = () => {
    startTransition(async () => {
      const result = await createQuote({
        contactId,
        services: selectedServices,
        taxRate: Number(taxRate),
        validUntil,
      });

      if (!result.success || !result.data) {
        setFeedback(result.message ?? "Unable to create quote.");
        return;
      }

      setQuotes((current) => [result.data!, ...current]);
      setSelectedServices([]);
      setFeedback(result.message ?? "Quote created.");
    });
  };

  const handleSendQuote = (quoteId: string) => {
    startTransition(async () => {
      const result = await sendQuoteEmail(quoteId);

      if (!result.success || !result.data) {
        setFeedback(result.message ?? "Unable to send quote email.");
        return;
      }

      setQuotes((current) =>
        current.map((quote) =>
          quote.id === quoteId ? { ...quote, status: result.data!.quote.status } : quote,
        ),
      );
      setFeedback(result.message ?? "Quote email sent.");
    });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-4">
        <article className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Quote generator</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Select services, auto-calculate pricing, and generate a PDF preview.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">Client</label>
              <select
                value={contactId}
                onChange={(event) => setContactId(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 text-sm text-[#1A1A1A]"
              >
                {initialContacts.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">Services</label>
              <div className="grid gap-3 md:grid-cols-2">
                {SERVICE_CATALOG.map((service) => {
                  const active = selectedServices.includes(service.key);

                  return (
                    <button
                      key={service.key}
                      type="button"
                      onClick={() => toggleService(service.key)}
                      className={`rounded-[1.25rem] border p-4 text-left transition ${
                        active
                          ? "border-[#0D9488] bg-[#ECFDF5]"
                          : "border-[#DDE7E3] bg-[#FAFAF8] hover:border-[#0D9488]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-[#1A1A1A]">{service.label}</p>
                        <span className="text-sm font-medium text-[#0D9488]">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#6B7280]">{service.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">Tax rate (%)</label>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(event) => setTaxRate(event.target.value)}
                  className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">Valid until</label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(event) => setValidUntil(event.target.value)}
                  className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
                />
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-[#F8FAF9] p-5">
              <div className="flex items-center justify-between text-sm text-[#4B5563]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-[#4B5563]">
                <span>Tax</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#DDE7E3] pt-4 text-base font-semibold text-[#1A1A1A]">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {feedback ? <p className="text-sm text-[#0F766E]">{feedback}</p> : null}

            <Button
              type="button"
              disabled={isPending || !contactId || selectedServices.length === 0}
              onClick={handleCreateQuote}
              className="h-11 w-full rounded-xl bg-[#0D9488] text-white hover:bg-[#0F766E]"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Create quote
            </Button>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A]">Saved quotes</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Send approved pricing summaries to clients by email.
              </p>
            </div>
            <span className="rounded-full bg-[#F4F6F2] px-3 py-1 text-xs font-medium text-[#4B5563]">
              {quotes.length} quotes
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                  <th className="pb-3 font-medium">Quote</th>
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {quoteRows.map((quote) => (
                  <tr key={quote.id} className="border-b border-[#F3F4F6] last:border-b-0">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-[#1A1A1A]">{quote.quote_number}</p>
                        <p className="text-[#6B7280]">Valid until {quote.valid_until}</p>
                      </div>
                    </td>
                    <td className="py-4 text-[#4B5563]">{quote.contact?.name ?? "Unknown contact"}</td>
                    <td className="py-4 text-[#4B5563]">{formatCurrency(quote.total)}</td>
                    <td className="py-4">
                      <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-medium text-[#0F766E]">
                        {quote.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isPending || !quote.contact?.email}
                        onClick={() => handleSendQuote(quote.id)}
                        className="h-10 rounded-xl border-[#DDE7E3] bg-white"
                      >
                        <Mail className="h-4 w-4" />
                        Send email
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <aside className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">PDF preview</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Live preview of the quote document for the current selection.
            </p>
          </div>
          <span className="rounded-full bg-[#F4F6F2] px-3 py-1 text-xs font-medium text-[#4B5563]">
            Auto-generated
          </span>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[#DDE7E3] bg-[#FAFAF8]">
          {pdfUrl ? (
            <iframe title="Quote PDF preview" src={pdfUrl} className="h-[780px] w-full" />
          ) : (
            <div className="flex h-[780px] items-center justify-center px-8 text-center text-sm leading-6 text-[#6B7280]">
              Select a contact and at least one service to generate the PDF preview.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
