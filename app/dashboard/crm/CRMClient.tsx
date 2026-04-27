"use client";

import { useMemo, useState, useTransition } from "react";
import { LoaderCircle, Plus } from "lucide-react";

import {
  createContact,
  createDeal,
  updateDealStage,
} from "@/app/dashboard/actions/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DEAL_STAGES,
  LEAD_STATUSES,
  formatCurrency,
  type Contact,
  type Deal,
  type DealStage,
  type LeadStatus,
} from "@/types";

interface CRMClientProps {
  initialContacts: Contact[];
  initialDeals: Deal[];
}

export function CRMClient({ initialContacts, initialDeals }: CRMClientProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [deals, setDeals] = useState(initialDeals);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    status: "New" as LeadStatus,
    notes: "",
  });
  const [dealForm, setDealForm] = useState({
    title: "",
    contactId: initialContacts[0]?.id ?? "",
    value: "3500",
    stage: "Discovery" as DealStage,
    probability: "30",
    expectedCloseDate: "",
    notes: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const contactsById = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact])),
    [contacts],
  );

  const handleContactCreate = () => {
    startTransition(async () => {
      const result = await createContact({
        name: contactForm.name,
        email: contactForm.email,
        company: contactForm.company,
        status: contactForm.status,
        notes: contactForm.notes,
      });

      if (!result.success || !result.data) {
        setFeedback(result.message ?? "Unable to create contact.");
        return;
      }

      setContacts((current) => [result.data!, ...current]);
      setDealForm((current) => ({
        ...current,
        contactId: current.contactId || result.data!.id,
      }));
      setContactForm({
        name: "",
        email: "",
        company: "",
        status: "New",
        notes: "",
      });
      setFeedback(result.message ?? "Contact created.");
    });
  };

  const handleDealCreate = () => {
    startTransition(async () => {
      const result = await createDeal({
        title: dealForm.title,
        contactId: dealForm.contactId,
        value: Number(dealForm.value),
        stage: dealForm.stage,
        probability: Number(dealForm.probability),
        expectedCloseDate: dealForm.expectedCloseDate,
        notes: dealForm.notes,
      });

      if (!result.success || !result.data) {
        setFeedback(result.message ?? "Unable to create deal.");
        return;
      }

      setDeals((current) => [result.data!, ...current]);
      setDealForm((current) => ({
        ...current,
        title: "",
        value: "3500",
        probability: "30",
        expectedCloseDate: "",
        notes: "",
      }));
      setFeedback(result.message ?? "Deal created.");
    });
  };

  const handleStageUpdate = (dealId: string, stage: DealStage) => {
    startTransition(async () => {
      const result = await updateDealStage(dealId, stage);

      if (!result.success) {
        setFeedback(result.message ?? "Unable to update deal stage.");
        return;
      }

      setDeals((current) =>
        current.map((deal) => (deal.id === dealId ? { ...deal, stage } : deal)),
      );
      setFeedback(result.message ?? "Deal stage updated.");
    });
  };

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[0.7fr_0.7fr_1.1fr]">
        <article className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Create contact</h2>
          <div className="mt-5 space-y-3">
            <Input
              value={contactForm.name}
              onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Full name"
              className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
            <Input
              value={contactForm.email}
              onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email address"
              className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
            <Input
              value={contactForm.company}
              onChange={(event) => setContactForm((current) => ({ ...current, company: event.target.value }))}
              placeholder="Company"
              className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
            <Select
              value={contactForm.status}
              onValueChange={(value) => setContactForm((current) => ({ ...current, status: value as LeadStatus }))}
            >
              <SelectTrigger className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]">
                <SelectValue placeholder="Lead status" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={contactForm.notes}
              onChange={(event) => setContactForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Notes"
              className="min-h-[120px] rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
            <Button
              type="button"
              disabled={isPending || !contactForm.name || !contactForm.email}
              onClick={handleContactCreate}
              className="h-11 w-full rounded-xl bg-[#0D9488] text-white hover:bg-[#0F766E]"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save contact
            </Button>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Create deal</h2>
          <div className="mt-5 space-y-3">
            <Input
              value={dealForm.title}
              onChange={(event) => setDealForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Deal title"
              className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
            <Select
              value={dealForm.contactId}
              onValueChange={(value) => setDealForm((current) => ({ ...current, contactId: value }))}
            >
              <SelectTrigger className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="number"
                value={dealForm.value}
                onChange={(event) => setDealForm((current) => ({ ...current, value: event.target.value }))}
                placeholder="Deal value"
                className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
              />
              <Input
                type="number"
                value={dealForm.probability}
                onChange={(event) => setDealForm((current) => ({ ...current, probability: event.target.value }))}
                placeholder="Probability"
                className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
              />
            </div>
            <Select
              value={dealForm.stage}
              onValueChange={(value) => setDealForm((current) => ({ ...current, stage: value as DealStage }))}
            >
              <SelectTrigger className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]">
                <SelectValue placeholder="Deal stage" />
              </SelectTrigger>
              <SelectContent>
                {DEAL_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dealForm.expectedCloseDate}
              onChange={(event) => setDealForm((current) => ({ ...current, expectedCloseDate: event.target.value }))}
              className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
            <Textarea
              value={dealForm.notes}
              onChange={(event) => setDealForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Deal notes"
              className="min-h-[120px] rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
            <Button
              type="button"
              disabled={isPending || !dealForm.title || !dealForm.contactId}
              onClick={handleDealCreate}
              className="h-11 w-full rounded-xl bg-[#0D9488] text-white hover:bg-[#0F766E]"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add deal
            </Button>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A]">Contacts</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Central list of people attached to current opportunities.
              </p>
            </div>
            <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-medium text-[#0F766E]">
              {contacts.length} total
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="rounded-[1.25rem] bg-[#F8FAF9] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{contact.name}</p>
                    <p className="text-sm text-[#6B7280]">{contact.email}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#4B5563]">
                    {contact.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#4B5563]">{contact.company ?? "Independent"}</p>
                {contact.notes ? <p className="mt-2 text-sm text-[#6B7280]">{contact.notes}</p> : null}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Deal pipeline</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Kanban view for moving opportunities through each stage.
            </p>
          </div>
          {feedback ? <p className="text-sm text-[#0F766E]">{feedback}</p> : null}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-5">
          {DEAL_STAGES.map((stage) => (
            <div key={stage} className="rounded-[1.5rem] bg-[#F8FAF9] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-[#1A1A1A]">{stage}</h3>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#4B5563]">
                  {deals.filter((deal) => deal.stage === stage).length}
                </span>
              </div>

              <div className="space-y-3">
                {deals
                  .filter((deal) => deal.stage === stage)
                  .map((deal) => (
                    <article key={deal.id} className="rounded-[1.25rem] border border-white bg-white p-4 shadow-sm">
                      <p className="font-medium text-[#1A1A1A]">{deal.title}</p>
                      <p className="mt-1 text-sm text-[#6B7280]">
                        {contactsById.get(deal.contact_id)?.name ?? "Unknown contact"}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-sm text-[#4B5563]">
                        <span>{formatCurrency(deal.value)}</span>
                        <span>{deal.probability}%</span>
                      </div>
                      <div className="mt-3">
                        <Select
                          value={deal.stage}
                          onValueChange={(value) => handleStageUpdate(deal.id, value as DealStage)}
                        >
                          <SelectTrigger className="h-10 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DEAL_STAGES.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
