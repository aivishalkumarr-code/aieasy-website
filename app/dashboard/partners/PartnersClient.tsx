"use client";

import { useMemo, useState, useTransition } from "react";
import { LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";

import {
  createPartner,
  deletePartner,
  updatePartner,
} from "@/app/dashboard/actions/partners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PartnerInput, PartnerLogo } from "@/types";

interface PartnersClientProps {
  initialPartners: PartnerLogo[];
}

const createEmptyForm = () => ({
  name: "",
  image_url: "",
  url: "",
  display_order: "0",
});

export function PartnersClient({ initialPartners }: PartnersClientProps) {
  const [partners, setPartners] = useState(initialPartners);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(createEmptyForm());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sortedPartners = useMemo(
    () =>
      [...partners].sort((a, b) => {
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order;
        }

        return a.name.localeCompare(b.name);
      }),
    [partners],
  );

  const handleCreateClick = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (partner: PartnerLogo) => {
    setEditingId(partner.id);
    setForm({
      name: partner.name,
      image_url: partner.image_url,
      url: partner.url ?? "",
      display_order: `${partner.display_order}`,
    });
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const payload: PartnerInput = {
      name: form.name.trim(),
      image_url: form.image_url.trim(),
      url: form.url.trim() || null,
      display_order: Number(form.display_order || 0),
    };

    startTransition(async () => {
      const result = editingId
        ? await updatePartner(editingId, payload)
        : await createPartner(payload);

      if (!result.success || !result.data) {
        setFeedback(result.message ?? "Unable to save partner.");
        return;
      }

      setPartners((current) => {
        if (editingId) {
          return current.map((partner) =>
            partner.id === editingId ? result.data! : partner,
          );
        }

        return [...current, result.data!];
      });
      setFeedback(result.message ?? "Partner saved.");
      setEditingId(null);
      setForm(createEmptyForm());
      setIsFormOpen(false);
    });
  };

  const handleDelete = (partner: PartnerLogo) => {
    if (!window.confirm(`Delete ${partner.name}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deletePartner(partner.id);

      if (!result.success) {
        setFeedback(result.message ?? "Unable to delete partner.");
        return;
      }

      setPartners((current) => current.filter((entry) => entry.id !== partner.id));
      setFeedback(result.message ?? "Partner deleted.");
    });
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Deployment partners</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Manage the logo strip shown on the homepage deployment platforms section.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCreateClick}
            className="h-11 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" />
            Add Partner
          </Button>
        </div>

        {isFormOpen ? (
          <div className="mt-6 rounded-[1.5rem] border border-[#DDE7E3] bg-[#FAFAF8] p-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Partner name"
                className="h-11 rounded-xl border-[#DDE7E3] bg-white"
              />
              <Input
                value={form.display_order}
                onChange={(event) =>
                  setForm((current) => ({ ...current, display_order: event.target.value }))
                }
                type="number"
                placeholder="Display order"
                className="h-11 rounded-xl border-[#DDE7E3] bg-white"
              />
              <Input
                value={form.image_url}
                onChange={(event) =>
                  setForm((current) => ({ ...current, image_url: event.target.value }))
                }
                placeholder="Logo image URL"
                className="h-11 rounded-xl border-[#DDE7E3] bg-white lg:col-span-2"
              />
              <Input
                value={form.url}
                onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
                placeholder="Partner website URL"
                className="h-11 rounded-xl border-[#DDE7E3] bg-white lg:col-span-2"
              />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                  setForm(createEmptyForm());
                }}
                className="rounded-xl border-[#DDE7E3] bg-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isPending || !form.name.trim() || !form.image_url.trim()}
                onClick={handleSave}
                className="rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              >
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {editingId ? "Save changes" : "Create partner"}
              </Button>
            </div>
          </div>
        ) : null}

        {feedback ? (
        <div className={`mt-4 rounded-xl p-4 text-sm ${feedback.includes('error') || feedback.includes('unavailable') || feedback.includes('table') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-[#1D4ED8] border border-[#2563EB]/20'}`}>
          <p className="font-medium">{feedback.includes('error') || feedback.includes('unavailable') || feedback.includes('table') ? '⚠️ Error' : '✓ Success'}</p>
          <p className="mt-1">{feedback}</p>
          {(feedback.includes('table unavailable') || feedback.includes('Partner table')) && (
            <div className="mt-3 rounded-lg bg-white/50 p-3 text-xs">
              <p className="font-semibold">To fix this:</p>
              <ol className="mt-1 list-decimal pl-4 space-y-1">
                <li>Go to your Supabase Dashboard</li>
                <li>Open the SQL Editor</li>
                <li>Run the SQL from <code className="bg-gray-100 px-1 rounded">lib/supabase/migrations/001_partner_logos.sql</code></li>
              </ol>
            </div>
          )}
        </div>
      ) : null}
      </section>

      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                <th className="pb-3 font-medium">Logo</th>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">URL</th>
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPartners.map((partner) => (
                <tr key={partner.id} className="border-b border-[#F3F4F6] last:border-b-0">
                  <td className="py-4 pr-4">
                    <div className="flex h-12 w-20 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white p-2">
                      <img
                        src={partner.image_url}
                        alt={partner.name}
                        width={64}
                        height={32}
                        className="max-h-8 w-auto object-contain"
                      />
                    </div>
                  </td>
                  <td className="py-4 pr-4 font-medium text-[#1A1A1A]">{partner.name}</td>
                  <td className="py-4 pr-4 text-[#4B5563]">
                    {partner.url ? (
                      <a
                        href={partner.url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-[#2563EB] hover:underline"
                      >
                        {partner.url}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-4 pr-4 text-[#4B5563]">{partner.display_order}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(partner)}
                        className="rounded-xl border-[#DDE7E3] bg-white"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(partner)}
                        className="rounded-xl border-[#F3D2D2] bg-white text-[#B91C1C] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
