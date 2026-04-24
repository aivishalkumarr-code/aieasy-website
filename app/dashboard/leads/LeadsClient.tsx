"use client";

import { useMemo, useState, useTransition } from "react";
import { LoaderCircle, Save } from "lucide-react";

import { updateLeadNotes, updateLeadStatus } from "@/app/dashboard/actions/leads";
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
import { LEAD_STATUSES, type Contact, type LeadStatus } from "@/types";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-[#EFF6FF] text-[#1D4ED8]",
  Contacted: "bg-[#F5F3FF] text-[#7C3AED]",
  Qualified: "bg-[#ECFDF5] text-[#0F766E]",
  "Proposal Sent": "bg-[#FFF7ED] text-[#C2410C]",
  Closed: "bg-[#0D9488] text-white",
};

interface LeadsClientProps {
  initialLeads: Contact[];
}

export function LeadsClient({ initialLeads }: LeadsClientProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState<LeadStatus | "All">("All");
  const [query, setQuery] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeads[0]?.id ?? "");
  const [notesDraft, setNotesDraft] = useState(initialLeads[0]?.notes ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesFilter = filter === "All" ? true : lead.status === filter;
      const haystack = `${lead.name} ${lead.email} ${lead.company ?? ""}`.toLowerCase();
      const matchesQuery = query ? haystack.includes(query.toLowerCase()) : true;
      return matchesFilter && matchesQuery;
    });
  }, [filter, leads, query]);

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? filteredLeads[0] ?? leads[0];

  const handleLeadSelection = (leadId: string) => {
    setSelectedLeadId(leadId);
    const lead = leads.find((entry) => entry.id === leadId);
    setNotesDraft(lead?.notes ?? "");
    setFeedback(null);
  };

  const handleStatusChange = (leadId: string, status: LeadStatus) => {
    startTransition(async () => {
      const result = await updateLeadStatus(leadId, status);

      if (!result.success) {
        setFeedback(result.message ?? "Unable to update lead status.");
        return;
      }

      setLeads((current) =>
        current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
      );
      setFeedback(result.message ?? "Lead updated.");
    });
  };

  const handleNotesSave = () => {
    if (!selectedLead) {
      return;
    }

    startTransition(async () => {
      const result = await updateLeadNotes(selectedLead.id, notesDraft);

      if (!result.success) {
        setFeedback(result.message ?? "Unable to save notes.");
        return;
      }

      setLeads((current) =>
        current.map((lead) =>
          lead.id === selectedLead.id ? { ...lead, notes: notesDraft } : lead,
        ),
      );
      setFeedback(result.message ?? "Notes saved.");
    });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Lead pipeline</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Filter incoming leads by status and keep qualification notes current.
            </p>
          </div>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search leads"
            className="h-11 w-full rounded-xl border-[#DDE7E3] bg-[#FAFAF8] lg:max-w-xs"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["All", ...LEAD_STATUSES] as const).map((status) => {
            const active = filter === status;
            const count =
              status === "All"
                ? leads.length
                : leads.filter((lead) => lead.status === status).length;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[#0D9488] text-white"
                    : "bg-[#F4F6F2] text-[#4B5563] hover:bg-[#E7F5F2] hover:text-[#0D9488]"
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                <th className="pb-3 font-medium">Lead</th>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="cursor-pointer border-b border-[#F3F4F6] align-top transition hover:bg-[#FAFAF8]"
                  onClick={() => handleLeadSelection(lead.id)}
                >
                  <td className="py-4 pr-4">
                    <div>
                      <p className="font-medium text-[#1A1A1A]">{lead.name}</p>
                      <p className="text-[#6B7280]">{lead.email}</p>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-[#4B5563]">{lead.company ?? "—"}</td>
                  <td className="py-4 pr-4 text-[#4B5563]">
                    <span className="inline-flex items-center rounded-full bg-[#F4F6F2] px-2.5 py-1 text-xs font-medium text-[#4B5563]">
                      {lead.source ?? "Unknown"}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="w-40" onClick={(event) => event.stopPropagation()}>
                      <Select
                        value={lead.status}
                        onValueChange={(value) => handleStatusChange(lead.id, value as LeadStatus)}
                      >
                        <SelectTrigger className="h-10 rounded-xl border-[#DDE7E3] bg-white text-left">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                  <td className="py-4 text-[#4B5563]">{formatDate(lead.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-[#1A1A1A]">Lead notes</h2>
        {selectedLead ? (
          <>
            <div className="mt-5 rounded-[1.5rem] bg-[#F8FAF9] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-[#1A1A1A]">{selectedLead.name}</p>
                  <p className="text-sm text-[#6B7280]">{selectedLead.company ?? selectedLead.email}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[selectedLead.status]}`}>
                  {selectedLead.status}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <label className="text-sm font-medium text-[#1A1A1A]" htmlFor="lead-notes">
                Qualification notes
              </label>
              <Textarea
                id="lead-notes"
                value={notesDraft}
                onChange={(event) => setNotesDraft(event.target.value)}
                className="min-h-[220px] rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
                placeholder="Capture context, blockers, priorities, and follow-up notes."
              />
            </div>

            {feedback ? <p className="mt-3 text-sm text-[#0F766E]">{feedback}</p> : null}

            <Button
              type="button"
              onClick={handleNotesSave}
              disabled={isPending}
              className="mt-5 h-11 w-full rounded-xl bg-[#0D9488] text-white hover:bg-[#0F766E]"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save notes
            </Button>
          </>
        ) : (
          <p className="mt-5 text-sm text-[#6B7280]">Select a lead to view and edit notes.</p>
        )}
      </aside>
    </div>
  );
}
