"use client";

import { useMemo, useRef, useState, useTransition, type DragEvent } from "react";
import {
  ExternalLink,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  createPortfolioItem,
  deletePortfolioItem,
  updatePortfolioItem,
} from "@/app/dashboard/actions/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { PortfolioCategory, PortfolioItem } from "@/types";

interface PortfolioClientProps {
  initialItems: PortfolioItem[];
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

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

const createEmptyForm = () => ({
  name: "",
  category: "Business" as PortfolioCategory,
  website_url: "",
  description: "",
  display_order: "0",
});

const getExtension = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "";

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

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export function PortfolioClient({ initialItems }: PortfolioClientProps) {
  const [items, setItems] = useState(initialItems);
  const [activeFilter, setActiveFilter] = useState<PortfolioCategory | "All Projects">("All Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState(createEmptyForm());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items
      .filter((item) => activeFilter === "All Projects" || item.category === activeFilter)
      .filter((item) => {
        if (!query) {
          return true;
        }

        return [item.name, item.category, item.description ?? "", item.website_url ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order;
        }

        return a.name.localeCompare(b.name);
      });
  }, [activeFilter, items, searchQuery]);

  const resetForm = () => {
    setEditingItem(null);
    setForm(createEmptyForm());
    setSelectedFile(null);
    setPreviewUrl(null);
    setDragActive(false);
  };

  const handleCreateClick = () => {
    resetForm();
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (item: PortfolioItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      website_url: item.website_url ?? "",
      description: item.description ?? "",
      display_order: `${item.display_order}`,
    });
    setSelectedFile(null);
    setPreviewUrl(item.image_url);
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleFile = (file: File) => {
    const validationMessage = validateFile(file);

    if (validationMessage) {
      setFeedback({ type: "error", message: validationMessage });
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFeedback(null);
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
      setFeedback({ type: "error", message: "Upload a portfolio image." });
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("category", form.category);
    formData.append("website_url", form.website_url.trim());
    formData.append("description", form.description.trim());
    formData.append("display_order", form.display_order || "0");

    if (editingItem) {
      formData.append("id", editingItem.id);
    }

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    startTransition(async () => {
      const result = editingItem
        ? await updatePortfolioItem(formData)
        : await createPortfolioItem(formData);

      if (!result.success || !result.data) {
        setFeedback({ type: "error", message: result.message ?? "Unable to save portfolio item." });
        return;
      }

      setItems((current) => {
        if (editingItem) {
          return current.map((item) => (item.id === editingItem.id ? result.data! : item));
        }

        return [result.data!, ...current];
      });
      setFeedback({ type: "success", message: result.message ?? "Portfolio item saved." });
      resetForm();
      setIsFormOpen(false);
    });
  };

  const handleDelete = (item: PortfolioItem) => {
    if (!window.confirm(`Delete ${item.name}? This will remove the image from Supabase Storage.`)) {
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

  return (
    <div className="space-y-4">
      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Portfolio management</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Add, edit, filter, and publish landing page portfolio items.
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

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                  activeFilter === filter
                    ? "bg-[#2563EB] text-white"
                    : "border border-[#DDE7E3] text-[#4B5563] hover:border-blue-300 hover:text-[#2563EB]",
                )}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search portfolio..."
              className="h-11 rounded-xl border-[#DDE7E3] bg-white pl-9"
            />
          </div>
        </div>

        {isFormOpen ? (
          <div className="mt-6 rounded-[1.5rem] border border-[#DDE7E3] bg-[#FAFAF8] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[#1A1A1A]">
                  {editingItem ? "Edit portfolio item" : "Add new portfolio item"}
                </h3>
                <p className="mt-1 text-sm text-[#6B7280]">Images must be PNG, JPG, or WebP and under 2MB.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  resetForm();
                  setIsFormOpen(false);
                }}
                className="rounded-xl border-[#DDE7E3] bg-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      handleFile(file);
                    }
                  }}
                />
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-white p-5 text-center transition",
                    dragActive ? "border-[#2563EB] bg-blue-50" : "border-[#CBD5E1] hover:border-blue-300",
                  )}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Portfolio preview"
                      className="h-56 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-[#1A1A1A]">Drag and drop an image here</p>
                      <p className="mt-1 text-sm text-[#6B7280]">or click to browse files</p>
                    </div>
                  )}
                </div>
                {selectedFile ? (
                  <p className="mt-2 text-xs text-[#6B7280]">
                    Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Project Name"
                  className="h-11 rounded-xl border-[#DDE7E3] bg-white"
                />
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value as PortfolioCategory }))
                  }
                  className="h-11 rounded-xl border border-[#DDE7E3] bg-white px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <Input
                  value={form.website_url}
                  onChange={(event) => setForm((current) => ({ ...current, website_url: event.target.value }))}
                  placeholder="Website URL (optional)"
                  className="h-11 rounded-xl border-[#DDE7E3] bg-white"
                />
                <Input
                  value={form.display_order}
                  onChange={(event) => setForm((current) => ({ ...current, display_order: event.target.value }))}
                  type="number"
                  placeholder="Display order"
                  className="h-11 rounded-xl border-[#DDE7E3] bg-white"
                />
                <Textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Description (optional)"
                  className="min-h-28 rounded-xl border-[#DDE7E3] bg-white sm:col-span-2"
                />
                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsFormOpen(false);
                    }}
                    className="rounded-xl border-[#DDE7E3] bg-white"
                  >
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
            </div>
          </div>
        ) : null}

        {feedback ? (
          <div
            className={cn(
              "mt-4 rounded-xl border p-4 text-sm",
              feedback.type === "success"
                ? "border-[#2563EB]/20 bg-blue-50 text-[#1D4ED8]"
                : "border-red-200 bg-red-50 text-red-700",
            )}
          >
            <p className="font-medium">{feedback.type === "success" ? "Success" : "Error"}</p>
            <p className="mt-1">{feedback.message}</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Portfolio items</h2>
            <p className="mt-1 text-sm text-[#6B7280]">{filteredItems.length} shown</p>
          </div>
        </div>

        {filteredItems.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
                <div className="relative aspect-[16/10] bg-[#F4F6F2]">
                  <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#2563EB] shadow-sm">
                    {item.category}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-[#1A1A1A]">{item.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#6B7280]">
                        {item.description || "No description added."}
                      </p>
                    </div>
                    <ImagePlus className="h-5 w-5 shrink-0 text-[#2563EB]" />
                  </div>
                  {item.website_url ? (
                    <a
                      href={item.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline"
                    >
                      Visit website <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#F3F4F6] pt-4">
                    <span className="text-xs font-medium text-[#6B7280]">Order {item.display_order}</span>
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
                        className="h-9 w-9 rounded-xl border-red-200 bg-white text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#DDE7E3] bg-[#FAFAF8] p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]">
              <ImagePlus className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-[#1A1A1A]">No portfolio items found</h3>
            <p className="mt-2 text-sm text-[#6B7280]">Create your first portfolio item or adjust filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
