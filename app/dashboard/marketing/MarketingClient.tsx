"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import {
  createMarketingSnippet,
  deleteMarketingSnippet,
  toggleMarketingSnippet,
  updateMarketingSnippet,
} from "@/app/dashboard/actions/marketing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SNIPPET_PLACEMENTS,
  SNIPPET_PRESETS,
  type MarketingSnippet,
  type SnippetPlacement,
} from "@/types";

interface MarketingClientProps {
  initialSnippets: MarketingSnippet[];
}

interface SnippetFormState {
  name: string;
  description: string;
  code: string;
  placement: SnippetPlacement;
  order_index: string;
  is_active: boolean;
}

const placementMeta: Record<SnippetPlacement, { label: string; badgeClass: string }> = {
  head: {
    label: "Head",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  body_start: {
    label: "Body Start",
    badgeClass: "bg-purple-100 text-purple-700",
  },
  body_end: {
    label: "Body End",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
};

const createEmptyForm = (): SnippetFormState => ({
  name: "",
  description: "",
  code: "",
  placement: "head",
  order_index: "0",
  is_active: true,
});

const buildFormData = (snippet: Partial<MarketingSnippet> & { id?: string; name: string; code: string }) => {
  const formData = new FormData();
  if (snippet.id) {
    formData.set("id", snippet.id);
  }
  formData.set("name", snippet.name);
  formData.set("description", snippet.description ?? "");
  formData.set("code", snippet.code);
  formData.set("placement", snippet.placement ?? "head");
  formData.set("order_index", String(snippet.order_index ?? 0));
  formData.set("is_active", snippet.is_active ? "true" : "false");
  return formData;
};

export function MarketingClient({ initialSnippets }: MarketingClientProps) {
  const [snippets, setSnippets] = useState(initialSnippets);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<MarketingSnippet | null>(null);
  const [form, setForm] = useState<SnippetFormState>(createEmptyForm());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [openSections, setOpenSections] = useState<Record<SnippetPlacement, boolean>>({
    head: true,
    body_start: true,
    body_end: true,
  });

  const grouped = useMemo(() => {
    const base: Record<SnippetPlacement, MarketingSnippet[]> = {
      head: [],
      body_start: [],
      body_end: [],
    };

    snippets.forEach((snippet) => {
      base[snippet.placement].push(snippet);
    });

    for (const placement of SNIPPET_PLACEMENTS) {
      base[placement].sort((a, b) => {
        if (a.order_index !== b.order_index) {
          return a.order_index - b.order_index;
        }
        return a.name.localeCompare(b.name);
      });
    }

    return base;
  }, [snippets]);

  const openCreateForm = () => {
    setEditingSnippet(null);
    setForm(createEmptyForm());
    setIsFormOpen(true);
    setFeedback(null);
  };

  const openEditForm = (snippet: MarketingSnippet) => {
    setEditingSnippet(snippet);
    setForm({
      name: snippet.name,
      description: snippet.description ?? "",
      code: snippet.code,
      placement: snippet.placement,
      order_index: String(snippet.order_index),
      is_active: snippet.is_active,
    });
    setIsFormOpen(true);
    setFeedback(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSnippet(null);
    setForm(createEmptyForm());
  };

  const handlePresetSelect = (value: string) => {
    if (!value) {
      return;
    }

    const preset = SNIPPET_PRESETS[Number(value)];
    if (!preset) {
      return;
    }

    setForm((current) => ({
      ...current,
      name: preset.name,
      description: preset.description,
      code: preset.code,
      placement: preset.placement,
    }));
  };

  const handleSave = () => {
    const payload = {
      id: editingSnippet?.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      code: form.code,
      placement: form.placement,
      order_index: Number(form.order_index || 0),
      is_active: form.is_active,
    };

    startTransition(async () => {
      const result = editingSnippet
        ? await updateMarketingSnippet(buildFormData(payload))
        : await createMarketingSnippet(buildFormData(payload));

      if (!result.success || !result.data) {
        setFeedback(result.message ?? "Unable to save snippet.");
        return;
      }

      setSnippets((current) => {
        if (editingSnippet) {
          return current.map((snippet) => (snippet.id === editingSnippet.id ? result.data! : snippet));
        }
        return [...current, result.data!];
      });

      setFeedback(result.message ?? "Snippet saved.");
      closeForm();
    });
  };

  const handleDelete = (snippet: MarketingSnippet) => {
    if (!window.confirm(`Delete ${snippet.name}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteMarketingSnippet(snippet.id);

      if (!result.success) {
        setFeedback(result.message ?? "Unable to delete snippet.");
        return;
      }

      setSnippets((current) => current.filter((entry) => entry.id !== snippet.id));
      setFeedback(result.message ?? "Snippet deleted.");
    });
  };

  const handleToggle = (snippet: MarketingSnippet) => {
    startTransition(async () => {
      const nextState = !snippet.is_active;
      const result = await toggleMarketingSnippet(snippet.id, nextState);

      if (!result.success) {
        setFeedback(result.message ?? "Unable to update snippet state.");
        return;
      }

      setSnippets((current) =>
        current.map((entry) =>
          entry.id === snippet.id
            ? {
                ...entry,
                is_active: nextState,
                updated_at: new Date().toISOString(),
              }
            : entry,
        ),
      );
      setFeedback(result.message ?? `Snippet ${nextState ? "enabled" : "disabled"}.`);
    });
  };

  const moveSnippet = (snippet: MarketingSnippet, direction: "up" | "down") => {
    const group = grouped[snippet.placement];
    const index = group.findIndex((entry) => entry.id === snippet.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= group.length) {
      return;
    }

    const target = group[targetIndex];

    startTransition(async () => {
      const resultA = await updateMarketingSnippet(
        buildFormData({
          ...snippet,
          order_index: target.order_index,
        }),
      );
      const resultB = await updateMarketingSnippet(
        buildFormData({
          ...target,
          order_index: snippet.order_index,
        }),
      );

      if (!resultA.success || !resultB.success || !resultA.data || !resultB.data) {
        setFeedback(resultA.message ?? resultB.message ?? "Unable to reorder snippets.");
        return;
      }

      setSnippets((current) =>
        current.map((entry) => {
          if (entry.id === snippet.id) {
            return resultA.data!;
          }
          if (entry.id === target.id) {
            return resultB.data!;
          }
          return entry;
        }),
      );
      setFeedback("Snippet order updated.");
    });
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Marketing snippets</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Manage analytics, verification tags, tracking pixels, and custom scripts.
            </p>
          </div>
          <Button
            type="button"
            onClick={openCreateForm}
            className="h-11 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" />
            Add Snippet
          </Button>
        </div>

        {isFormOpen ? (
          <div className="mt-6 rounded-[1.5rem] border border-[#DDE7E3] bg-[#FAFAF8] p-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <select
                defaultValue=""
                onChange={(event) => handlePresetSelect(event.target.value)}
                className="h-11 rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB] lg:col-span-2"
              >
                <option value="">Select preset (optional)</option>
                {SNIPPET_PRESETS.map((preset, index) => (
                  <option key={preset.name} value={index}>
                    {preset.name}
                  </option>
                ))}
              </select>

              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Snippet name"
                className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
              />

              <Input
                value={form.order_index}
                onChange={(event) => setForm((current) => ({ ...current, order_index: event.target.value }))}
                type="number"
                placeholder="Order index"
                className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
              />

              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Description"
                className="min-h-[90px] rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB] lg:col-span-2"
              />

              <select
                value={form.placement}
                onChange={(event) =>
                  setForm((current) => ({ ...current, placement: event.target.value as SnippetPlacement }))
                }
                className="h-11 rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
              >
                <option value="head">Head</option>
                <option value="body_start">Body Start</option>
                <option value="body_end">Body End</option>
              </select>

              <label className="flex h-11 items-center gap-2 rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 text-sm text-[#1A1A1A]">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                  className="h-4 w-4 rounded border-[#DDE7E3]"
                />
                Active
              </label>

              <textarea
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                placeholder="Paste script/snippet code"
                className="min-h-[200px] rounded-xl bg-[#1A1A1A] p-4 font-mono text-sm text-white outline-none lg:col-span-2"
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                className="rounded-xl border-[#DDE7E3] bg-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isPending || !form.name.trim() || !form.code.trim()}
                className="h-11 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              >
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {editingSnippet ? "Save changes" : "Save snippet"}
              </Button>
            </div>
          </div>
        ) : null}

        {feedback ? (
          <div className="mt-4 rounded-xl border border-[#2563EB]/20 bg-green-50 p-4 text-sm text-[#1D4ED8]">
            {feedback}
          </div>
        ) : null}
      </section>

      {SNIPPET_PLACEMENTS.map((placement) => {
        const items = grouped[placement];
        const open = openSections[placement];

        return (
          <section key={placement} className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
            <button
              type="button"
              onClick={() =>
                setOpenSections((current) => ({
                  ...current,
                  [placement]: !current[placement],
                }))
              }
              className="flex w-full items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">{placementMeta[placement].label}</h3>
                <p className="mt-1 text-sm text-[#6B7280]">{items.length} snippets</p>
              </div>
              {open ? <ChevronUp className="h-5 w-5 text-[#6B7280]" /> : <ChevronDown className="h-5 w-5 text-[#6B7280]" />}
            </button>

            {open ? (
              items.length ? (
                <div className="mt-4 space-y-3">
                  {items.map((snippet, index) => (
                    <article
                      key={snippet.id}
                      className="rounded-2xl border border-[#DDE7E3] bg-[#FAFAF8] p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-[#1A1A1A]">{snippet.name}</p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${placementMeta[snippet.placement].badgeClass}`}
                            >
                              {placementMeta[snippet.placement].label}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggle(snippet)}
                              disabled={isPending}
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                                snippet.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {snippet.is_active ? "Active" : "Inactive"}
                            </button>
                          </div>
                          {snippet.description ? (
                            <p className="mt-2 text-sm text-[#4B5563]">{snippet.description}</p>
                          ) : null}
                          <p className="mt-2 text-xs text-[#6B7280]">Order: {snippet.order_index}</p>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={isPending || index === 0}
                            onClick={() => moveSnippet(snippet, "up")}
                            className="h-9 w-9 rounded-xl border-[#DDE7E3] bg-white"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={isPending || index === items.length - 1}
                            onClick={() => moveSnippet(snippet, "down")}
                            className="h-9 w-9 rounded-xl border-[#DDE7E3] bg-white"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => openEditForm(snippet)}
                            className="rounded-xl border-[#DDE7E3] bg-white"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleDelete(snippet)}
                            className="rounded-xl border-[#F3D2D2] bg-white text-[#B91C1C] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[1.5rem] border border-dashed border-[#DDE7E3] bg-[#FAFAF8] p-8 text-center text-sm text-[#6B7280]">
                  No snippets in this placement.
                </div>
              )
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
