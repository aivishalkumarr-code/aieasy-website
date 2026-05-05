"use client";

import { useMemo, useRef, useState, useTransition, type ChangeEvent, type DragEvent } from "react";
import {
  Briefcase,
  Building2,
  ExternalLink,
  GraduationCap,
  Heart,
  Home,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  UploadCloud,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  createPortfolioItem,
  deletePortfolioItem,
  setPortfolioVersion,
  updatePortfolioItem,
} from "@/app/dashboard/actions/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { PortfolioCategory, PortfolioItem, PortfolioVersion } from "@/types";

const categories: PortfolioCategory[] = [
  "Business",
  "Healthcare",
  "E-commerce",
  "Education",
  "Real Estate",
  "Hospitality",
];
const filters: Array<PortfolioCategory | "All Projects"> = ["All Projects", ...categories];
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

const categoryIcons: Record<PortfolioCategory, LucideIcon> = {
  Business: Building2,
  Healthcare: Heart,
  "E-commerce": ShoppingCart,
  Education: GraduationCap,
  "Real Estate": Home,
  Hospitality: UtensilsCrossed,
};

const createEmptyForm = () => ({
  name: "",
  category: "Business" as PortfolioCategory,
  website_url: "",
  description: "",
  display_order: "0",
  is_active: true,
});

interface PortfolioClientProps {
  initialItems: PortfolioItem[];
  initialVersion: PortfolioVersion;
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

const getExtension = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "";

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export function PortfolioClient({ initialItems, initialVersion }: PortfolioClientProps) {
  const [items, setItems] = useState(initialItems);
  const [displayVersion, setDisplayVersion] = useState<PortfolioVersion>(initialVersion);
  const [savedDisplayVersion, setSavedDisplayVersion] = useState<PortfolioVersion>(initialVersion);
  const [activeFilter, setActiveFilter] = useState<PortfolioCategory | "All Projects">("All Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState(createEmptyForm());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [versionFeedback, setVersionFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isVersionPending, startVersionTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order;
        }

        return a.name.localeCompare(b.name);
      }),
    [items],
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return sortedItems.filter((item) => {
      const matchesFilter = activeFilter === "All Projects" || item.category === activeFilter;
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch) ||
        (item.description ?? "").toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, sortedItems]);

  const validateFile = (file: File) => {
    const extension = getExtension(file);

    if (!ACCEPTED_MIME_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(extension)) {
      return "Upload a PNG, JPG, or WebP image.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Portfolio images must be 2MB or smaller.";
    }

    return null;
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setForm(createEmptyForm());
    resetUpload();
  };

  const handleCreateClick = () => {
    setFeedback(null);
    setEditingItem(null);
    setForm({ ...createEmptyForm(), display_order: `${items.length + 1}` });
    resetUpload();
    setIsFormOpen(true);
  };

  const handleEditClick = (item: PortfolioItem) => {
    setFeedback(null);
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      website_url: item.website_url ?? "",
      description: item.description ?? "",
      display_order: `${item.display_order}`,
      is_active: item.is_active,
    });
    resetUpload();
    setIsFormOpen(true);
  };

  const handleFile = (file: File) => {
    const validationMessage = validateFile(file);

    if (validationMessage) {
      setFeedback({ type: "error", message: validationMessage });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFeedback(null);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setFeedback({ type: "error", message: "Project name is required." });
      return;
    }

    if (!editingItem && !selectedFile) {
      setFeedback({ type: "error", message: "Choose a portfolio image to upload." });
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("category", form.category);
    payload.append("website_url", form.website_url.trim());
    payload.append("description", form.description.trim());
    payload.append("display_order", form.display_order || "0");
    payload.append("is_active", `${form.is_active}`);

    if (selectedFile) {
      payload.append("image", selectedFile);
    }

    if (editingItem) {
      payload.append("id", editingItem.id);
      payload.append("current_image_url", editingItem.image_url);
    }

    startTransition(async () => {
      const result = editingItem
        ? await updatePortfolioItem(payload)
        : await createPortfolioItem(payload);

      if (!result.success || !result.data) {
        setFeedback({ type: "error", message: result.message ?? "Unable to save portfolio item." });
        return;
      }

      setItems((current) => {
        if (editingItem) {
          return current.map((item) => (item.id === editingItem.id ? result.data! : item));
        }

        return [...current, result.data!];
      });
      setFeedback({ type: "success", message: result.message ?? "Portfolio item saved." });
      closeForm();
    });
  };

  const handleDelete = (item: PortfolioItem) => {
    if (!window.confirm(`Delete ${item.name}? This will remove the item and its uploaded image.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deletePortfolioItem(item);

      if (!result.success) {
        setFeedback({ type: "error", message: result.message ?? "Unable to delete portfolio item." });
        return;
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setFeedback({ type: "success", message: result.message ?? "Portfolio item deleted." });
    });
  };

  const handleSaveDisplayVersion = () => {
    setVersionFeedback(null);

    startVersionTransition(async () => {
      const result = await setPortfolioVersion(displayVersion);

      if (!result.success || !result.data) {
        setVersionFeedback({ type: "error", message: result.message ?? "Unable to save portfolio display style." });
        return;
      }

      setDisplayVersion(result.data);
      setSavedDisplayVersion(result.data);
      setVersionFeedback({ type: "success", message: result.message ?? "Portfolio display style saved." });
    });
  };

  return (
    <div className="space-y-4">
      <section id="portfolio-version" className="scroll-mt-8 rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Portfolio Version</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Choose Portfolio Version: V1 (Grid) or V2 (Slider) for the website design landing page.
            </p>
          </div>
          <Button
            type="button"
            disabled={isVersionPending || displayVersion === savedDisplayVersion}
            onClick={handleSaveDisplayVersion}
            className="h-11 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-60"
          >
            {isVersionPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Save Version
          </Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[
            {
              value: "v1" as PortfolioVersion,
              title: "V1 (Grid)",
              description: "Classic responsive card grid with category filters.",
            },
            {
              value: "v2" as PortfolioVersion,
              title: "V2 (Slider)",
              description: "Center-focused carousel with peek cards, stats overlays, and slider controls.",
            },
          ].map((option) => {
            const active = displayVersion === option.value;

            return (
              <label
                key={option.value}
                className={cn(
                  "cursor-pointer rounded-[1.5rem] border bg-white p-4 transition",
                  active ? "border-[#2563EB] bg-blue-50/50 shadow-[0_16px_40px_rgba(37,99,235,0.12)]" : "border-[#DDE7E3] hover:border-blue-300",
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="portfolio_display_style"
                    value={option.value}
                    checked={active}
                    onChange={() => {
                      setDisplayVersion(option.value);
                      setVersionFeedback(null);
                    }}
                    className="mt-1 h-4 w-4 accent-[#2563EB]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-[#1A1A1A]">{option.title}</h3>
                      {savedDisplayVersion === option.value ? (
                        <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-bold text-[#2563EB]">Live</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[#6B7280]">{option.description}</p>

                    <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF8] p-3">
                      {option.value === "v1" ? (
                        <div className="grid grid-cols-3 gap-2">
                          {[0, 1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="overflow-hidden rounded-xl bg-white shadow-sm">
                              <div className="h-12 bg-gradient-to-br from-slate-200 to-blue-100" />
                              <div className="space-y-1.5 p-2">
                                <div className="h-1.5 rounded-full bg-slate-300" />
                                <div className="h-1.5 w-2/3 rounded-full bg-slate-200" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 py-2">
                          <div className="h-24 w-16 rounded-2xl bg-gradient-to-br from-slate-300 to-blue-100 opacity-60" />
                          <div className="h-32 w-36 rounded-2xl bg-gradient-to-br from-[#2563EB] to-slate-900 p-3 shadow-lg">
                            <div className="h-2 w-16 rounded-full bg-white/70" />
                            <div className="mt-12 grid grid-cols-2 gap-1.5">
                              {[0, 1, 2, 3].map((item) => (
                                <div key={item} className="h-5 rounded bg-white/20" />
                              ))}
                            </div>
                          </div>
                          <div className="h-24 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-slate-300 opacity-60" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {versionFeedback ? (
          <div
            className={cn(
              "mt-4 rounded-xl border p-4 text-sm",
              versionFeedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-[#2563EB]/20 bg-blue-50 text-[#1D4ED8]",
            )}
          >
            {versionFeedback.message}
          </div>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Portfolio management</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Add, edit, search, and publish website work shown on the landing page.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCreateClick}
            className="h-11 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" />
            Add Portfolio Item
          </Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by project, category, or description"
              className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8] pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filters.map((filter) => {
              const active = activeFilter === filter;
              const Icon = filter === "All Projects" ? Briefcase : categoryIcons[filter];

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-[#2563EB] text-white"
                      : "border border-[#DDE7E3] bg-white text-[#4B5563] hover:border-blue-300 hover:text-[#2563EB]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {isFormOpen ? (
          <div className="mt-6 rounded-[1.5rem] border border-[#DDE7E3] bg-[#FAFAF8] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">
                  {editingItem ? `Edit ${editingItem.name}` : "Add new portfolio item"}
                </h3>
                <p className="mt-1 text-sm text-[#6B7280]">Upload a compressed image up to 2MB.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={closeForm} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)]">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Project Name</span>
                  <Input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Elite Taxation"
                    className="h-11 rounded-xl border-[#DDE7E3] bg-white"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Category</span>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, category: event.target.value as PortfolioCategory }))
                    }
                    className="h-11 w-full rounded-xl border border-[#DDE7E3] bg-white px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Website URL</span>
                  <Input
                    value={form.website_url}
                    onChange={(event) => setForm((current) => ({ ...current, website_url: event.target.value }))}
                    placeholder="https://example.com"
                    className="h-11 rounded-xl border-[#DDE7E3] bg-white"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Display Order</span>
                  <Input
                    value={form.display_order}
                    onChange={(event) => setForm((current) => ({ ...current, display_order: event.target.value }))}
                    type="number"
                    className="h-11 rounded-xl border-[#DDE7E3] bg-white"
                  />
                </label>

                <label className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Description</span>
                  <Textarea
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Short mockup or result description"
                    className="min-h-28 rounded-xl border-[#DDE7E3] bg-white"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-[#DDE7E3] bg-white px-4 py-3 text-sm font-semibold text-[#1A1A1A] lg:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                    className="h-4 w-4 accent-[#2563EB]"
                  />
                  Show this item on the landing page
                </label>
              </div>

              <div>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-[1.4rem] border border-dashed bg-white p-5 text-center transition",
                    dragActive ? "border-[#2563EB] bg-blue-50" : "border-[#CBD5E1] hover:border-[#2563EB] hover:bg-blue-50/40",
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleInputChange}
                    className="sr-only"
                  />

                  {previewUrl || editingItem?.image_url ? (
                    <div className="w-full">
                      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC]">
                        <img
                          src={previewUrl ?? editingItem?.image_url}
                          alt="Portfolio preview"
                          className="aspect-[16/10] w-full object-cover"
                        />
                      </div>
                      <p className="mt-3 text-sm font-medium text-[#1A1A1A]">
                        {selectedFile ? selectedFile.name : "Current portfolio image"}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {selectedFile ? formatBytes(selectedFile.size) : "Click or drop a new image to replace it."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex max-w-xs flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
                        <UploadCloud className="h-7 w-7" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-[#1A1A1A]">Drag and drop image here</p>
                      <p className="mt-2 text-sm leading-6 text-[#6B7280]">PNG, JPG, or WebP. Maximum 2MB.</p>
                      <Button type="button" variant="outline" className="mt-4 rounded-xl border-[#DDE7E3] bg-white">
                        <ImagePlus className="h-4 w-4" />
                        Choose Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" onClick={closeForm} className="rounded-xl border-[#DDE7E3] bg-white">
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isPending || !form.name.trim() || (!editingItem && !selectedFile)}
                onClick={handleSave}
                className="rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              >
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {editingItem ? "Save changes" : "Create portfolio item"}
              </Button>
            </div>
          </div>
        ) : null}

        {feedback ? (
          <div
            className={cn(
              "mt-4 rounded-xl border p-4 text-sm",
              feedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-[#2563EB]/20 bg-blue-50 text-[#1D4ED8]",
            )}
          >
            {feedback.message}
          </div>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Portfolio items</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Showing {filteredItems.length} of {items.length} projects.
            </p>
          </div>
        </div>

        {filteredItems.length ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const Icon = categoryIcons[item.category];

              return (
                <article key={item.id} className="overflow-hidden rounded-[1.5rem] border border-[#E5E7EB] bg-white shadow-sm">
                  <div className="relative aspect-[16/10] bg-[#F8FAFC]">
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    <span
                      className={cn(
                        "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold",
                        item.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {item.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-[#1A1A1A]">{item.name}</h3>
                          <p className="mt-1 text-sm text-[#6B7280]">{item.category}</p>
                        </div>
                      </div>
                      <p className="shrink-0 rounded-full bg-[#FAFAF8] px-2.5 py-1 text-xs font-semibold text-[#6B7280]">
                        #{item.display_order}
                      </p>
                    </div>

                    {item.description ? (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#4B5563]">{item.description}</p>
                    ) : null}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                      {item.website_url ? (
                        <a
                          href={item.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
                        >
                          Visit <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-sm text-[#9CA3AF]">No URL</span>
                      )}

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(item)}
                          className="h-9 w-9 rounded-xl border-[#DDE7E3] bg-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          className="h-9 w-9 rounded-xl border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#DDE7E3] bg-[#FAFAF8] p-10 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-[#CBD5E1]" />
            <h3 className="mt-4 text-lg font-semibold text-[#1A1A1A]">No portfolio items found</h3>
            <p className="mt-2 text-sm text-[#6B7280]">Adjust your search or add a new portfolio project.</p>
          </div>
        )}
      </section>
    </div>
  );
}
