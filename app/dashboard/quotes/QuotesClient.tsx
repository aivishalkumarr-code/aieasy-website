"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { Check, Download, Edit2, FileText, LoaderCircle, Mail, Save, Send, Trash2 } from "lucide-react";

import { createQuote, sendQuoteEmail, sendQuoteWithAcceptButton } from "@/app/dashboard/actions/quotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SERVICE_CATALOG, formatCurrency, type Contact, type Quote, type QuoteServiceItem, type ServiceKey } from "@/types";

interface QuotesClientProps {
  initialContacts: Contact[];
  initialQuotes: Quote[];
}

interface ServiceFormItem {
  key: ServiceKey;
  label: string;
  description: string;
  basePrice: number;
  customPrice: string;
  notes: string;
  selected: boolean;
}

type QuoteSendMode = "simple" | "accept";

const getNextValidDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
};

const createServiceFormItems = (): ServiceFormItem[] =>
  SERVICE_CATALOG.map((service) => ({
    key: service.key,
    label: service.label,
    description: service.description,
    basePrice: service.price,
    customPrice: service.price.toString(),
    notes: "",
    selected: false,
  }));

export function QuotesClient({ initialContacts, initialQuotes }: QuotesClientProps) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [contactId, setContactId] = useState(initialContacts[0]?.id ?? "");
  const [services, setServices] = useState<ServiceFormItem[]>(createServiceFormItems());
  const [taxRate, setTaxRate] = useState("18");
  const [validUntil, setValidUntil] = useState(getNextValidDate());
  const [globalNotes, setGlobalNotes] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [editingPrices, setEditingPrices] = useState<Set<ServiceKey>>(new Set());
  const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"generator" | "history">("generator");

  const pdfRef = useRef<string | null>(null);

  const contact = useMemo(
    () => initialContacts.find((entry) => entry.id === contactId) ?? initialContacts[0] ?? null,
    [contactId, initialContacts]
  );

  const selectedServices = useMemo(() => services.filter((s) => s.selected), [services]);

  const subtotal = useMemo(
    () => selectedServices.reduce((total, service) => total + (parseInt(service.customPrice) || service.basePrice), 0),
    [selectedServices]
  );

  const taxAmount = useMemo(() => Math.round(subtotal * (Number(taxRate || 0) / 100)), [subtotal, taxRate]);
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  // Live PDF generation
  useEffect(() => {
    if (!contact || selectedServices.length === 0) {
      setPdfUrl(null);
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // Header
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
    doc.text("(Pending)", 450, 110);
    doc.setFont("helvetica", "bold");
    doc.text("Valid until:", 380, 128);
    doc.setFont("helvetica", "normal");
    doc.text(validUntil, 450, 128);
    doc.setFont("helvetica", "bold");
    doc.text("Date:", 380, 146);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 450, 146);

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

    selectedServices.forEach((service) => {
      const price = parseInt(service.customPrice) || service.basePrice;
      
      // Service name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(service.label, 50, cursorY);
      
      // Price
      doc.text(formatCurrency(price), 520, cursorY, { align: "right" });
      
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
    if (globalNotes) {
      cursorY += 10;
      doc.setFillColor(236, 253, 245);
      doc.rect(40, cursorY - 5, 515, 40, "F");
      doc.setTextColor(13, 148, 136);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Additional Notes:", 50, cursorY + 8);
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(globalNotes, 480);
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
    doc.text(formatCurrency(subtotal), 545, cursorY, { align: "right" });

    cursorY += 20;
    doc.text(`Tax (${taxRate}%):`, 380, cursorY);
    doc.text(formatCurrency(taxAmount), 545, cursorY, { align: "right" });

    cursorY += 8;
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(1);
    doc.line(380, cursorY, 555, cursorY);

    cursorY += 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(13, 148, 136);
    doc.text("Total:", 380, cursorY);
    doc.text(formatCurrency(total), 545, cursorY, { align: "right" });

    // Footer
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("AIeasy Solutions Pvt Ltd • Delhi, India", 40, 780);
    doc.text("contact@aieasy.io • www.aieasy.io", 40, 795);

    // Terms
    doc.text("Terms: 50% advance, 50% on delivery. Quote valid for 14 days.", 380, 780, { align: "right" });

    const blob = doc.output("blob");
    const nextUrl = URL.createObjectURL(blob);
    
    if (pdfRef.current) {
      URL.revokeObjectURL(pdfRef.current);
    }
    pdfRef.current = nextUrl;
    setPdfUrl(nextUrl);

    return () => {
      if (pdfRef.current) {
        URL.revokeObjectURL(pdfRef.current);
      }
    };
  }, [contact, selectedServices, subtotal, taxAmount, taxRate, total, validUntil, globalNotes]);

  const quoteRows = useMemo(
    () =>
      quotes.map((quote) => ({
        ...quote,
        contact: initialContacts.find((entry) => entry.id === quote.contact_id) ?? null,
      })),
    [initialContacts, quotes]
  );

  const toggleService = (serviceKey: ServiceKey) => {
    setServices((current) =>
      current.map((service) =>
        service.key === serviceKey ? { ...service, selected: !service.selected } : service
      )
    );
  };

  const updateServicePrice = (serviceKey: ServiceKey, price: string) => {
    setServices((current) =>
      current.map((service) =>
        service.key === serviceKey ? { ...service, customPrice: price } : service
      )
    );
  };

  const updateServiceNotes = (serviceKey: ServiceKey, notes: string) => {
    setServices((current) =>
      current.map((service) => (service.key === serviceKey ? { ...service, notes } : service))
    );
  };

  const resetForm = () => {
    setServices(createServiceFormItems());
    setTaxRate("18");
    setValidUntil(getNextValidDate());
    setGlobalNotes("");
    setCreatedQuoteId(null);
    setFeedback(null);
  };

  const handleCreateQuote = async () => {
    if (!contact || selectedServices.length === 0) return;

    setIsCreating(true);
    setFeedback(null);

    const selectedWithPrices: QuoteServiceItem[] = selectedServices.map((service) => ({
      key: service.key,
      label: service.label,
      description: service.description,
      basePrice: service.basePrice,
      customPrice: parseInt(service.customPrice) || service.basePrice,
      notes: service.notes,
    }));

    const result = await createQuote({
      contactId: contact.id,
      services: selectedWithPrices,
      taxRate: Number(taxRate),
      validUntil,
      globalNotes,
    });

    setIsCreating(false);

    if (!result.success || !result.data) {
      setFeedback(result.message ?? "Unable to create quote.");
      return;
    }

    setQuotes((current) => [result.data!, ...current]);
    setCreatedQuoteId(result.data.id);
    setFeedback("Quote saved successfully! You can now send it via email.");
    setActiveTab("history");
  };

  const handleSendQuote = async (quoteId: string, mode: QuoteSendMode = "simple") => {
    setIsSending(quoteId);
    setFeedback(null);

    const result =
      mode === "accept"
        ? await sendQuoteWithAcceptButton(quoteId)
        : await sendQuoteEmail(quoteId);

    setIsSending(null);

    if (!result.success || !result.data) {
      setFeedback(result.message ?? "Unable to send quote email.");
      return;
    }

    setQuotes((current) =>
      current.map((quote) => (quote.id === quoteId ? { ...quote, status: result.data!.quote.status } : quote))
    );
    
    if (quoteId === createdQuoteId) {
      setCreatedQuoteId(null);
    }
    
    setFeedback(
      mode === "accept"
        ? "Quote email with accept button sent successfully!"
        : "Quote email sent successfully!"
    );
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `AIeasy-Quote-${contact?.name?.replace(/\s+/g, "-") || "Draft"}.pdf`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 rounded-2xl border border-[#DDE7E3] bg-white p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab("generator")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "generator" ? "bg-[#0D9488] text-white" : "text-[#4B5563] hover:bg-[#F4F6F2]"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            Quote Generator
          </span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "history" ? "bg-[#0D9488] text-white" : "text-[#4B5563] hover:bg-[#F4F6F2]"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Save className="h-4 w-4" />
            Quote History ({quotes.length})
          </span>
        </button>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            feedback.includes("success")
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback}
        </div>
      )}

      {activeTab === "generator" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
          {/* Left Panel - Generator */}
          <section className="space-y-4">
            <article className="rounded-2xl border border-[#DDE7E3] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#1A1A1A]">Quote Generator</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Select services, customize prices, add notes. PDF preview updates live.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetForm} className="rounded-xl">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              <div className="mt-6 space-y-5">
                {/* Client Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">Client *</label>
                  <select
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 text-sm text-[#1A1A1A] focus:border-[#0D9488] focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                  >
                    {initialContacts.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name} {entry.company ? `(${entry.company})` : ""} - {entry.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Services with editable prices */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-[#1A1A1A]">
                    Services * <span className="font-normal text-[#6B7280]">(Click to select, click price to edit)</span>
                  </label>
                  <div className="grid gap-3">
                    {services.map((service) => {
                      const isEditingPrice = editingPrices.has(service.key);
                      const price = parseInt(service.customPrice) || service.basePrice;

                      return (
                        <div
                          key={service.key}
                          className={`rounded-xl border p-4 transition-all ${
                            service.selected
                              ? "border-[#0D9488] bg-[#ECFDF5] ring-1 ring-[#0D9488]/20"
                              : "border-[#DDE7E3] bg-[#FAFAF8] hover:border-[#0D9488]/40"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleService(service.key)}
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                                service.selected
                                  ? "border-[#0D9488] bg-[#0D9488] text-white"
                                  : "border-[#DDE7E3] bg-white"
                              }`}
                            >
                              {service.selected && <Check className="h-3.5 w-3.5" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              {/* Service name & price */}
                              <div className="flex items-center justify-between gap-4">
                                <p className="font-medium text-[#1A1A1A]">{service.label}</p>
                                
                                {isEditingPrice ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={service.customPrice}
                                      onChange={(e) => updateServicePrice(service.key, e.target.value)}
                                      className="h-8 w-28 rounded-lg border-[#DDE7E3] bg-white text-right text-sm"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => setEditingPrices((prev) => {
                                        const next = new Set(prev);
                                        next.delete(service.key);
                                        return next;
                                      })}
                                      className="rounded-lg p-1 text-[#0D9488] hover:bg-[#0D9488]/10"
                                    >
                                      <Save className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setEditingPrices((prev) => new Set(prev).add(service.key))}
                                    className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-[#0D9488] hover:bg-[#0D9488]/10"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    {formatCurrency(price)}
                                  </button>
                                )}
                              </div>

                              <p className="mt-1 text-sm text-[#6B7280]">{service.description}</p>

                              {/* Notes input when selected */}
                              {service.selected && (
                                <div className="mt-3">
                                  <input
                                    type="text"
                                    placeholder="Add notes for this service (what was discussed with client)..."
                                    value={service.notes}
                                    onChange={(e) => updateServiceNotes(service.key, e.target.value)}
                                    className="w-full rounded-lg border border-[#DDE7E3] bg-white px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#0D9488] focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tax & Valid Until */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">Tax Rate (%)</label>
                    <Input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">Valid Until</label>
                    <Input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
                    />
                  </div>
                </div>

                {/* Global Notes */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                    Overall Quote Notes
                  </label>
                  <textarea
                    value={globalNotes}
                    onChange={(e) => setGlobalNotes(e.target.value)}
                    placeholder="Additional notes that will appear at the end of the quote..."
                    rows={3}
                    className="w-full rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#0D9488] focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                  />
                </div>

                {/* Summary Card */}
                <div className="rounded-2xl bg-gradient-to-br from-[#F8FAF9] to-[#ECFDF5] p-5">
                  <div className="flex items-center justify-between text-sm text-[#4B5563]">
                    <span>Subtotal ({selectedServices.length} services)</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-[#4B5563]">
                    <span>Tax ({taxRate}%)</span>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#0D9488]/20 pt-4">
                    <span className="text-lg font-semibold text-[#1A1A1A]">Total</span>
                    <span className="text-2xl font-bold text-[#0D9488]">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    disabled={isCreating || !contactId || selectedServices.length === 0}
                    onClick={handleCreateQuote}
                    className="h-12 flex-1 rounded-xl bg-[#0D9488] text-white hover:bg-[#0F766E]"
                  >
                  {isCreating ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Quote
                </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!pdfUrl}
                    onClick={downloadPDF}
                    className="h-12 rounded-xl border-[#DDE7E3] px-4"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          </section>

          {/* Right Panel - Live PDF Preview */}
          <aside className="sticky top-4 h-fit">
            <div className="rounded-2xl border border-[#DDE7E3] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">Live PDF Preview</h2>
                  <p className="text-xs text-[#6B7280]">Updates instantly as you edit</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    pdfUrl ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {pdfUrl ? "Ready" : "Select services"}
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-[#DDE7E3] bg-[#FAFAF8]">
                {pdfUrl ? (
                  <iframe title="Quote PDF Preview" src={pdfUrl} className="h-[640px] w-full" />
                ) : (
                  <div className="flex h-[640px] flex-col items-center justify-center px-6 text-center text-sm text-[#6B7280]">
                    <FileText className="mb-3 h-12 w-12 text-[#DDE7E3]" />
                    <p>Select a client and at least one service<br />to generate the PDF preview</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* Quote History Tab */
        <article className="rounded-2xl border border-[#DDE7E3] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A]">Quote History</h2>
              <p className="mt-1 text-sm text-[#6B7280]">View and send saved quotes to clients.</p>
            </div>
            <span className="rounded-full bg-[#F4F6F2] px-3 py-1 text-sm font-medium text-[#4B5563]">
              {quotes.length} quotes
            </span>
          </div>

	          {createdQuoteId && (
            <div className="mt-4 rounded-xl border border-[#0D9488]/30 bg-[#ECFDF5] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D9488] text-white">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1A1A]">Quote saved successfully!</p>
                    <p className="text-sm text-[#6B7280]">Ready to send to {contact?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSendQuote(createdQuoteId, "simple")}
                    disabled={isSending === createdQuoteId}
                    className="h-11 rounded-xl border-[#0D9488]/20 bg-white text-[#0F766E] hover:bg-[#F0FDFA]"
                  >
                    {isSending === createdQuoteId ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    Send Simple Email
                  </Button>
                  <Button
                    onClick={() => handleSendQuote(createdQuoteId, "accept")}
                    disabled={isSending === createdQuoteId}
                    className="h-11 rounded-xl bg-[#16A34A] text-white hover:bg-[#15803D]"
                  >
                    {isSending === createdQuoteId ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send with Accept Button
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                  <th className="pb-3 font-medium">Quote #</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Services</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Valid Until</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quoteRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                      No quotes yet. Create your first quote using the generator.
                    </td>
                  </tr>
                ) : (
                  quoteRows.map((quote) => (
                    <tr key={quote.id} className="border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#FAFAF8]">
                      <td className="py-4 font-medium text-[#1A1A1A]">{quote.quote_number}</td>
                      <td className="py-4">
                        <div>
                          <p className="font-medium text-[#1A1A1A]">{quote.contact?.name ?? "Unknown"}</p>
                          <p className="text-xs text-[#6B7280]">{quote.contact?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 text-[#4B5563]">{quote.services.length} services</td>
                      <td className="py-4 text-right font-medium text-[#1A1A1A]">{formatCurrency(quote.total)}</td>
                      <td className="py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            quote.status === "Sent"
                              ? "bg-blue-100 text-blue-700"
                              : quote.status === "Accepted"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {quote.status}
                        </span>
                      </td>
                      <td className="py-4 text-[#4B5563]">{quote.valid_until}</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {quote.status === "Draft" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isSending === quote.id}
                                onClick={() => handleSendQuote(quote.id, "simple")}
                                className="h-9 rounded-lg border-[#DDE7E3] bg-white text-[#0F766E] hover:bg-[#F0FDFA]"
                              >
                                {isSending === quote.id ? (
                                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Mail className="mr-2 h-4 w-4" />
                                )}
                                Send Simple Email
                              </Button>
                              <Button
                                size="sm"
                                disabled={isSending === quote.id}
                                onClick={() => handleSendQuote(quote.id, "accept")}
                                className="h-9 rounded-lg bg-[#16A34A] text-white hover:bg-[#15803D]"
                              >
                                {isSending === quote.id ? (
                                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="mr-2 h-4 w-4" />
                                )}
                                Send with Accept Button
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </div>
  );
}
