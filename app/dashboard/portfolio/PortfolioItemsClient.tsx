"use client";

import { useMemo, useRef, useState, useTransition, type ChangeEvent, type DragEvent } from "react";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, LoaderCircle, Pencil, Plus, Search, Trash2, UploadCloud, X } from "lucide-react";

import { createPortfolioItem, deletePortfolioItem, updatePortfolioItem } from "@/app/dashboard/actions/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ManagedImage, PortfolioCategory, PortfolioItem } from "@/types";

const categories: PortfolioCategory[] = ["Business", "Healthcare", "E-commerce", "Education", "Real Estate", "Hospitality"];
const filters: Array<PortfolioCategory | "All Projects"> = ["All Projects", ...categories];
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

const emptyForm = () => ({
  title: "",
  category: "Business" as PortfolioCategory,
  description: "",
  client_name: "",
  live_url: "",
  order_index: "0",
  is_active: true,
  stats: "98% | Client Satisfaction\n40%+ | Lead Growth\n1.8s | Fast Loading\n24/7 | Support",
  features: "Custom Design\nMobile First\nSEO Ready\nFast Loading",
  image_url: "",
  image_id: "",
});

interface PortfolioItemsClientProps {
  initialItems: PortfolioItem[];
  images: ManagedImage[];
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

const getExtension = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "";

const formatStats = (item: PortfolioItem) => item.stats.map((stat) => `${stat.value} | ${stat.label}`).join("\n");
const formatFeatures = (item: PortfolioItem) => item.features.join("\n");

const validateFile = (file: File) => {
  const extension = getExtension(file);

  if (!ACCEPTED_MIME_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(extension)) {
    return "Upload a PNG, JPG, or WebP image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Portfolio images must be 3MB or smaller.";
  }

  return null;
};

const cropAndResizeImage = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const targetWidth = 1400;
      const targetHeight = 875;
      const sourceRatio = image.naturalWidth / image.naturalHeight;
      const targetRatio = targetWidth / targetHeight;
      let sourceWidth = image.naturalWidth;
      let sourceHeight = image.naturalHeight;
      let sourceX = 0;
      let sourceY = 0;

      if (sourceRatio > targetRatio) {
        sourceWidth = image.naturalHeight * targetRatio;
        sourceX = (image.naturalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = image.naturalWidth / targetRatio;
        sourceY = (image.naturalHeight - sourceHeight) / 2;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      canvas.getContext("2d")?.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error("Unable to crop image."));
            return;
          }

          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
        },
        "image/webp",
        0.86,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image."));
    };
    image.src = objectUrl;
  });

export function PortfolioItemsClient({ initialItems, images }: PortfolioItemsClientProps) {
  const [items, setItems] = useState(initialItems);
  const [activeFilter, setActiveFilter] = useState<PortfolioCategory | "All Projects">("All Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropBeforeUpload, setCropBeforeUpload] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const portfolioImages = useMemo(() => images.filter((image) => (image.category ?? "General") === "Portfolio" || image.category === null), [images]);

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.order_index !== b.order_index) {
          return a.order_index - b.order_index;
        }

        return a.title.localeCompare(b.title);
      }),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sortedItems.filter((item) => {
      const matchesFilter = activeFilter === "All Projects" || item.category === activeFilter;
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.client_name ?? "").toLowerCase().includes(query) ||
        (item.description ?? "").toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, sortedItems]);

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
    setForm(emptyForm());
    resetUpload();
  };

  const openCreateForm = () => {
    setFeedback(null);
    setEditingItem(null);
    setForm({ ...emptyForm(), order_index: `${items.length + 1}` });
    resetUpload();
    setIsFormOpen(true);
  };

  const openEditForm = (item: PortfolioItem) => {
    setFeedback(null);
    setEditingItem(item);
    setForm({
      title: item.title,
      category: item.category,
      description: item.description ?? "",
      client_name: item.client_name ?? "",
      live_url: item.live_url ?? "",
      order_index: `${item.order_index}`,
      is_active: item.is_active,
      stats: formatStats(item),
      features: formatFeatures(item),
      image_url: item.image_url,
      image_id: item.image_id ?? "",
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
    setForm((current) => ({ ...current, image_url: "", image_id: "" }));
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

  const selectManagedImage = (image: ManagedImage) => {
    resetUpload();
    setForm((current) => ({ ...current, image_url: image.url, image_id: image.id }));
  };

  const saveItem = () => {
    if (!form.title.trim()) {
      setFeedback({ type: "error", message: "Project title is required." });
      return;
    }

    startTransition(async () => {
      let uploadFile = selectedFile;

      if (uploadFile && cropBeforeUpload) {
        try {
          uploadFile = await cropAndResizeImage(uploadFile);
        } catch {
          setFeedback({ type: "error", message: "Unable to crop image. Try a different file or disable crop." });
          return;
        }
      }

      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("category", form.category);
      payload.append("description", form.description.trim());
      payload.append("client_name", form.client_name.trim());
      payload.append("live_url", form.live_url.trim());
      payload.append("order_index", form.order_index || "0");
      payload.append("is_active", `${form.is_active}`);
      payload.append("stats", form.stats);
      payload.append("features", form.features);
      payload.append("image_url", form.image_url);
      payload.append("image_id", form.image_id);

      if (uploadFile) {
        payload.append("image", uploadFile);
      }

      if (editingItem) {
        payload.append("id", editingItem.id);
        payload.append("current_image_url", editingItem.image_url);
      }

      const result = editingItem ? await updatePortfolioItem(payload) : await createPortfolioItem(payload);

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

  const updateQuick = (item: PortfolioItem, patch: Partial<PortfolioItem>) => {
    const payload = new FormData();
    const next = { ...item, ...patch };
    payload.append("id", item.id);
    payload.append("title", next.title);
    payload.append("category", next.category);
    payload.append("description", next.description ?? "");
    payload.append("client_name", next.client_name ?? "");
    payload.append("live_url", next.live_url ?? "");
    payload.append("order_index", `${next.order_index}`);
    payload.append("is_active", `${next.is_active}`);
    payload.append("stats", formatStats(next));
    payload.append("features", formatFeatures(next));
    payload.append("image_url", next.image_url);
    payload.append("image_id", next.image_id ?? "");

    startTransition(async () => {
      const result = await updatePortfolioItem(payload);

      if (!result.success || !result.data) {
        setFeedback({ type: "error", message: result.message ?? "Unable to update portfolio item." });
        return;
      }

      setItems((current) => current.map((entry) => (entry.id === item.id ? result.data! : entry)));
      setFeedback({ type: "success", message: result.message ?? "Portfolio item updated." });
    });
  };

  const deleteItem = (item: PortfolioItem) => {
    if (!window.confirm(`Delete ${item.title}?`)) {
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
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Portfolio items</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Manage titles, categories, stats, live URLs, images, active state, and display order.</p>
          </div>
          <Button type="button" onClick={openCreateForm} className="h-11 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]">
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
              placeholder="Search by project, client, category, or description"
              className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8] pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filters.map((filter) => {
              const active = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition",
                    active ? "bg-[#2563EB] text-white" : "border border-[#DDE7E3] bg-white text-[#4B5563] hover:border-blue-300 hover:text-[#2563EB]",
                  )}
                >
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
                <h3 className="text-lg font-semibold text-[#1A1A1A]">{editingItem ? `Edit ${editingItem.title}` : "Add new portfolio item"}</h3>
                <p className="mt-1 text-sm text-[#6B7280]">Upload and crop a custom image or assign an image tagged as Portfolio.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={closeForm} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)]">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Title</span>
                  <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Elite Taxation" className="h-11 rounded-xl border-[#DDE7E3] bg-white" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Category</span>
                  <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as PortfolioCategory }))} className="h-11 w-full rounded-xl border border-[#DDE7E3] bg-white px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]">
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Client Name</span>
                  <Input value={form.client_name} onChange={(event) => setForm((current) => ({ ...current, client_name: event.target.value }))} placeholder="Client or brand name" className="h-11 rounded-xl border-[#DDE7E3] bg-white" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Live URL</span>
                  <Input value={form.live_url} onChange={(event) => setForm((current) => ({ ...current, live_url: event.target.value }))} placeholder="https://example.com" className="h-11 rounded-xl border-[#DDE7E3] bg-white" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Order</span>
                  <Input value={form.order_index} onChange={(event) => setForm((current) => ({ ...current, order_index: event.target.value }))} type="number" className="h-11 rounded-xl border-[#DDE7E3] bg-white" />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-[#DDE7E3] bg-white px-4 py-3 text-sm font-semibold text-[#1A1A1A]">
                  <input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} className="h-4 w-4 accent-[#2563EB]" />
                  Active on landing page
                </label>
                <label className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Description</span>
                  <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Maximize Refunds. Minimize Stress." className="min-h-24 rounded-xl border-[#DDE7E3] bg-white" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Stats</span>
                  <Textarea value={form.stats} onChange={(event) => setForm((current) => ({ ...current, stats: event.target.value }))} className="min-h-32 rounded-xl border-[#DDE7E3] bg-white font-mono text-xs" />
                  <span className="text-xs text-[#6B7280]">One per line: value | label</span>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Features</span>
                  <Textarea value={form.features} onChange={(event) => setForm((current) => ({ ...current, features: event.target.value }))} className="min-h-32 rounded-xl border-[#DDE7E3] bg-white" />
                  <span className="text-xs text-[#6B7280]">One feature per line.</span>
                </label>
              </div>

              <div className="space-y-4">
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-[1.4rem] border border-dashed bg-white p-5 text-center transition",
                    dragActive ? "border-[#2563EB] bg-blue-50" : "border-[#CBD5E1] hover:border-[#2563EB] hover:bg-blue-50/40",
                  )}
                >
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleInputChange} className="sr-only" />
                  {previewUrl || form.image_url ? (
                    <div className="w-full">
                      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC]">
                        <img src={previewUrl ?? form.image_url} alt="Portfolio preview" className="aspect-[16/10] w-full object-cover" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-[#1A1A1A]">{selectedFile ? selectedFile.name : "Assigned image"}</p>
                    </div>
                  ) : (
                    <div className="flex max-w-xs flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]"><UploadCloud className="h-7 w-7" /></div>
                      <p className="mt-4 text-sm font-semibold text-[#1A1A1A]">Drag and drop image here</p>
                      <p className="mt-2 text-sm leading-6 text-[#6B7280]">PNG, JPG, or WebP. Auto tags uploads as Portfolio.</p>
                      <Button type="button" variant="outline" className="mt-4 rounded-xl border-[#DDE7E3] bg-white"><ImagePlus className="h-4 w-4" />Choose Image</Button>
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-[#DDE7E3] bg-white px-4 py-3 text-sm font-semibold text-[#1A1A1A]">
                  <input type="checkbox" checked={cropBeforeUpload} onChange={(event) => setCropBeforeUpload(event.target.checked)} className="h-4 w-4 accent-[#2563EB]" />
                  Crop and resize upload to 16:10 WebP
                </label>
                {portfolioImages.length ? (
                  <div className="rounded-[1.4rem] border border-[#DDE7E3] bg-white p-4">
                    <p className="text-sm font-semibold text-[#1A1A1A]">Assign existing Portfolio image</p>
                    <div className="mt-3 grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pr-1">
                      {portfolioImages.map((image) => (
                        <button key={image.id} type="button" onClick={() => selectManagedImage(image)} className={cn("overflow-hidden rounded-xl border bg-[#F8FAFC]", form.image_id === image.id ? "border-[#2563EB] ring-2 ring-blue-100" : "border-[#E5E7EB]")}> 
                          <img src={image.url} alt={image.filename} className="aspect-[16/10] w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" onClick={closeForm} className="rounded-xl border-[#DDE7E3] bg-white">Cancel</Button>
              <Button type="button" disabled={isPending || !form.title.trim()} onClick={saveItem} className="rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]">
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {editingItem ? "Save Changes" : "Create Portfolio Item"}
              </Button>
            </div>
          </div>
        ) : null}

        {feedback ? (
          <div className={cn("mt-4 rounded-xl border p-4 text-sm", feedback.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[#2563EB]/20 bg-blue-50 text-[#1D4ED8]")}>{feedback.message}</div>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
          <div className="hidden bg-[#FAFAF8] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#6B7280] lg:grid lg:grid-cols-[80px_1.2fr_0.9fr_0.8fr_0.7fr_220px]">
            <span>Image</span><span>Project</span><span>Category</span><span>Status</span><span>Order</span><span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {filteredItems.map((item) => (
              <div key={item.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[80px_1.2fr_0.9fr_0.8fr_0.7fr_220px] lg:items-center">
                <img src={item.image_url} alt={item.title} className="h-16 w-24 rounded-xl object-cover lg:h-14 lg:w-16" />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-[#1A1A1A]">{item.title}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-[#6B7280]">{item.description}</p>
                </div>
                <span className="text-sm font-medium text-[#4B5563]">{item.category}</span>
                <button type="button" onClick={() => updateQuick(item, { is_active: !item.is_active })} className={cn("w-fit rounded-full px-3 py-1 text-xs font-bold", item.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600")}>
                  {item.is_active ? "Active" : "Inactive"}
                </button>
                <div className="flex items-center gap-2">
                  <Input value={item.order_index} type="number" onChange={(event) => updateQuick(item, { order_index: Number(event.target.value) || 0, display_order: Number(event.target.value) || 0 })} className="h-9 w-20 rounded-xl border-[#DDE7E3]" />
                  <Button type="button" variant="outline" size="icon" onClick={() => updateQuick(item, { order_index: item.order_index - 1, display_order: item.order_index - 1 })} className="h-9 w-9 rounded-xl border-[#DDE7E3]"><ArrowUp className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => updateQuick(item, { order_index: item.order_index + 1, display_order: item.order_index + 1 })} className="h-9 w-9 rounded-xl border-[#DDE7E3]"><ArrowDown className="h-4 w-4" /></Button>
                </div>
                <div className="flex justify-start gap-2 lg:justify-end">
                  {item.live_url ? (
                    <a href={item.live_url} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#DDE7E3] text-[#2563EB]"><ExternalLink className="h-4 w-4" /></a>
                  ) : null}
                  <Button type="button" variant="outline" size="icon" onClick={() => openEditForm(item)} className="h-9 w-9 rounded-xl border-[#DDE7E3] bg-white"><Pencil className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => deleteItem(item)} className="h-9 w-9 rounded-xl border-red-100 bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!filteredItems.length ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#DDE7E3] bg-[#FAFAF8] p-10 text-center">
            <h3 className="text-lg font-semibold text-[#1A1A1A]">No portfolio items found</h3>
            <p className="mt-2 text-sm text-[#6B7280]">Adjust your search or add a new portfolio project.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
