"use client";

import { useMemo, useRef, useState, useTransition, type ChangeEvent, type DragEvent } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileImage,
  Filter,
  ImageIcon,
  LoaderCircle,
  Pencil,
  Trash2,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";

import {
  deleteManagedImage,
  updateImage,
  updateImageCategory,
  uploadManagedImage,
} from "@/app/dashboard/actions/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ImageCategory, ManagedImage } from "@/types";

interface ImagesClientProps {
  initialImages: ManagedImage[];
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

const categories: ImageCategory[] = ["Landing Page", "Hero", "Portfolio", "Services", "Blog", "General"];
const filters: Array<ImageCategory | "All"> = ["All", ...categories];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

const getExtension = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "";

const formatBytes = (bytes: number | null) => {
  if (!bytes) {
    return "—";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

const readImageSize = (file: File): Promise<{ width: number | null; height: number | null }> =>
  new Promise((resolve) => {
    const previewUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(previewUrl);
    };
    image.onerror = () => {
      resolve({ width: null, height: null });
      URL.revokeObjectURL(previewUrl);
    };
    image.src = previewUrl;
  });

const isCategory = (value: string): value is ImageCategory => categories.includes(value as ImageCategory);

export function ImagesClient({ initialImages }: ImagesClientProps) {
  const [images, setImages] = useState(initialImages);
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory>("General");
  const [activeFilter, setActiveFilter] = useState<ImageCategory | "All">("All");
  const [dragActive, setDragActive] = useState(false);
  const [replaceDragActive, setReplaceDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [replaceProgress, setReplaceProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [previewImage, setPreviewImage] = useState<ManagedImage | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<ManagedImage | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredImages = useMemo(
    () =>
      activeFilter === "All"
        ? images
        : images.filter((image) => (image.category ?? "General") === activeFilter),
    [activeFilter, images],
  );

  const validateFile = (file: File) => {
    const extension = getExtension(file);

    if (!ACCEPTED_MIME_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(extension)) {
      return `${file.name}: Upload a PNG, JPG, or WebP image.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: Image files must be 5MB or smaller.`;
    }

    return null;
  };

  const uploadFile = async (file: File, index: number, total: number) => {
    const validationMessage = validateFile(file);

    if (validationMessage) {
      throw new Error(validationMessage);
    }

    setCurrentFileName(file.name);
    setUploadProgress(total > 1 ? Math.round((index / total) * 100) : 15);

    const dimensions = await readImageSize(file);
    setUploadProgress(total > 1 ? Math.round(((index + 0.35) / total) * 100) : 35);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", selectedCategory);

    if (dimensions.width) {
      formData.append("width", `${dimensions.width}`);
    }

    if (dimensions.height) {
      formData.append("height", `${dimensions.height}`);
    }

    setUploadProgress(total > 1 ? Math.round(((index + 0.7) / total) * 100) : 70);
    const result = await uploadManagedImage(formData);

    if (!result.success || !result.data) {
      throw new Error(result.message ?? "Unable to upload image.");
    }

    setImages((current) => [result.data!, ...current]);
    setUploadProgress(Math.round(((index + 1) / total) * 100));
    return result.message ?? "Image uploaded.";
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);

    if (!files.length) {
      return;
    }

    setFeedback(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      let lastMessage = "Images uploaded successfully.";

      for (const [index, file] of files.entries()) {
        lastMessage = await uploadFile(file, index, files.length);
      }

      setUploadProgress(100);
      setFeedback({
        type: "success",
        message: files.length === 1 ? lastMessage : `${files.length} images uploaded successfully.`,
      });
    } catch (error) {
      setUploadProgress(0);
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to upload image.",
      });
    } finally {
      setIsUploading(false);
      setCurrentFileName(null);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      void handleFiles(files);
    }

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    if (event.dataTransfer.files?.length) {
      void handleFiles(event.dataTransfer.files);
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback({ type: "success", message: "Image URL copied to clipboard." });
    } catch {
      setFeedback({ type: "error", message: "Unable to copy image URL." });
    }
  };

  const handleCategoryChange = (image: ManagedImage, category: ImageCategory) => {
    startTransition(async () => {
      const previousImages = images;
      setImages((current) =>
        current.map((entry) => (entry.id === image.id ? { ...entry, category } : entry)),
      );

      const result = await updateImageCategory(image.id, category);

      if (!result.success || !result.data) {
        setImages(previousImages);
        setFeedback({ type: "error", message: result.message ?? "Unable to update image category." });
        return;
      }

      setImages((current) =>
        current.map((entry) => (entry.id === image.id ? result.data! : entry)),
      );
      setPreviewImage((current) => (current?.id === image.id ? result.data! : current));
      setReplaceTarget((current) => (current?.id === image.id ? result.data! : current));
      setFeedback({ type: "success", message: result.message ?? "Image category updated." });
    });
  };

  const handleDelete = (image: ManagedImage) => {
    if (!window.confirm(`Delete ${image.filename}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteManagedImage(image);

      if (!result.success) {
        setFeedback({ type: "error", message: result.message ?? "Unable to delete image." });
        return;
      }

      setImages((current) => current.filter((entry) => entry.id !== image.id));
      setSelectedImageIds((current) => {
        const next = new Set(current);
        next.delete(image.id);
        return next;
      });
      setPreviewImage((current) => (current?.id === image.id ? null : current));
      setReplaceTarget((current) => (current?.id === image.id ? null : current));
      setFeedback({ type: "success", message: result.message ?? "Image deleted." });
    });
  };

  const handleBulkDelete = () => {
    const selectedImages = images.filter((image) => selectedImageIds.has(image.id));

    if (!selectedImages.length || !window.confirm(`Delete ${selectedImages.length} selected image${selectedImages.length === 1 ? "" : "s"}?`)) {
      return;
    }

    startTransition(async () => {
      const deletedIds: string[] = [];

      for (const image of selectedImages) {
        const result = await deleteManagedImage(image);

        if (!result.success) {
          setImages((current) => current.filter((entry) => !deletedIds.includes(entry.id)));
          setSelectedImageIds((current) => {
            const next = new Set(current);
            deletedIds.forEach((id) => next.delete(id));
            return next;
          });
          setFeedback({ type: "error", message: result.message ?? `Unable to delete ${image.filename}.` });
          return;
        }

        deletedIds.push(image.id);
      }

      setImages((current) => current.filter((entry) => !deletedIds.includes(entry.id)));
      setSelectedImageIds(new Set());
      setPreviewImage((current) => (current && deletedIds.includes(current.id) ? null : current));
      setReplaceTarget((current) => (current && deletedIds.includes(current.id) ? null : current));
      setFeedback({ type: "success", message: `${deletedIds.length} image${deletedIds.length === 1 ? "" : "s"} deleted.` });
    });
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImageIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const openReplaceModal = (image: ManagedImage) => {
    setFeedback(null);
    setReplaceProgress(0);
    setReplaceTarget(image);
  };

  const replaceImageFile = async (file: File, target: ManagedImage) => {
    const validationMessage = validateFile(file);

    if (validationMessage) {
      throw new Error(validationMessage);
    }

    setCurrentFileName(file.name);
    setReplaceProgress(20);
    const dimensions = await readImageSize(file);
    setReplaceProgress(45);

    const formData = new FormData();
    formData.append("id", target.id);
    formData.append("file", file);

    if (dimensions.width) {
      formData.append("width", `${dimensions.width}`);
    }

    if (dimensions.height) {
      formData.append("height", `${dimensions.height}`);
    }

    setReplaceProgress(75);
    const result = await updateImage(formData);

    if (!result.success || !result.data) {
      throw new Error(result.message ?? "Unable to replace image.");
    }

    setImages((current) => current.map((entry) => (entry.id === target.id ? result.data! : entry)));
    setPreviewImage((current) => (current?.id === target.id ? result.data! : current));
    setReplaceTarget(null);
    setReplaceProgress(100);
    setFeedback({ type: "success", message: result.message ?? "Image replaced successfully." });
  };

  const handleReplaceFiles = async (fileList: FileList | File[]) => {
    const file = Array.from(fileList)[0];

    if (!file || !replaceTarget) {
      return;
    }

    setFeedback(null);
    setIsReplacing(true);
    setReplaceProgress(0);

    try {
      await replaceImageFile(file, replaceTarget);
    } catch (error) {
      setReplaceProgress(0);
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to replace image.",
      });
    } finally {
      setIsReplacing(false);
      setCurrentFileName(null);
    }
  };

  const handleReplaceInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      void handleReplaceFiles(files);
    }

    event.target.value = "";
  };

  const handleReplaceDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setReplaceDragActive(false);

    if (event.dataTransfer.files?.length) {
      void handleReplaceFiles(event.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-[#1A1A1A]">Image Management</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Upload, replace, preview, categorize, copy, and delete website images used across landing pages, hero sections, portfolio, services, and blog content.
            </p>
          </div>
          <div className="rounded-2xl border border-[#DDE7E3] bg-[#EFF6FF] px-4 py-3 text-sm text-[#1D4ED8]">
            {images.length} {images.length === 1 ? "image" : "images"} stored
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Upload images</h3>
              <p className="mt-1 text-sm text-[#6B7280]">PNG, JPG, or WebP. Maximum 5MB per image.</p>
            </div>
            <select
              value={selectedCategory}
              onChange={(event) => {
                if (isCategory(event.target.value)) {
                  setSelectedCategory(event.target.value);
                }
              }}
              className="h-11 rounded-xl border border-[#DDE7E3] bg-white px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={cn(
              "mt-5 rounded-[1.5rem] border-2 border-dashed p-8 text-center transition-colors",
              dragActive ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#DDE7E3] bg-[#FAFAF8] hover:border-[#2563EB]/60",
            )}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
              {isUploading ? <LoaderCircle className="h-7 w-7 animate-spin" /> : <UploadCloud className="h-7 w-7" />}
            </div>
            <h3 className="mt-4 text-base font-semibold text-[#1A1A1A]">Drag and drop images here</h3>
            <p className="mt-2 text-sm text-[#6B7280]">Files will be tagged as {selectedCategory}.</p>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              onChange={handleInputChange}
              className="hidden"
            />
            <Button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
            >
              <FileImage className="h-4 w-4" />
              Choose images
            </Button>
            {isUploading ? (
              <div className="mx-auto mt-5 max-w-md">
                <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div className="h-full rounded-full bg-[#2563EB] transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="mt-2 text-xs font-medium text-[#2563EB]">
                  Uploading {currentFileName ? `${currentFileName} · ` : ""}{uploadProgress}%
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Categories</h3>
              <p className="mt-1 text-sm text-[#6B7280]">Filter uploads by where the image will be used.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedImageIds.size ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleBulkDelete}
                  className="rounded-full border-[#F3D2D2] bg-white text-[#B91C1C] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete {selectedImageIds.size} selected
                </Button>
              ) : null}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F6F2] px-3 py-1 text-xs font-medium text-[#4B5563]">
                <Filter className="h-3.5 w-3.5" />
                {filteredImages.length} shown
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  activeFilter === filter
                    ? "border-[#2563EB] bg-[#2563EB] text-white"
                    : "border-[#DDE7E3] bg-white text-[#4B5563] hover:border-[#2563EB]/50 hover:text-[#1A1A1A]",
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          {feedback ? (
            <div
              className={cn(
                "mt-5 flex gap-3 rounded-2xl border p-4 text-sm",
                feedback.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800",
              )}
            >
              {feedback.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
              <p>{feedback.message}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        {filteredImages.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredImages.map((image) => {
              const isSelected = selectedImageIds.has(image.id);

              return (
                <article key={image.id} className="overflow-hidden rounded-[1.5rem] border border-[#E5E7EB] bg-white shadow-sm">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F6F2]">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(image)}
                      className="group h-full w-full text-left"
                      aria-label={`Preview ${image.filename}`}
                    >
                      <img src={image.url} alt={image.filename} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    </button>
                    <label className="absolute left-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/80 bg-white/90 text-[#2563EB] shadow-sm">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleImageSelection(image.id)}
                        className="sr-only"
                        aria-label={`Select ${image.filename}`}
                      />
                      {isSelected ? <Check className="h-4 w-4" /> : <span className="h-4 w-4 rounded border border-[#CBD5E1] bg-white" />}
                    </label>
                    <button
                      type="button"
                      onClick={() => openReplaceModal(image)}
                      className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/80 bg-white/90 text-[#2563EB] shadow-sm transition hover:bg-white"
                      aria-label={`Replace ${image.filename}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-4 p-4">
                    <div>
                      <p className="truncate text-sm font-semibold text-[#1A1A1A]" title={image.filename}>
                        {image.filename}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {image.width && image.height ? `${image.width}×${image.height}px` : "Dimensions unavailable"} · {formatBytes(image.file_size)}
                      </p>
                    </div>

                    <select
                      value={image.category ?? "General"}
                      disabled={isPending}
                      onChange={(event) => {
                        if (isCategory(event.target.value)) {
                          handleCategoryChange(image, event.target.value);
                        }
                      }}
                      className="h-10 w-full rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleCopy(image.url)}
                        className="rounded-xl border-[#DDE7E3] bg-white"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only xl:not-sr-only">Copy</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending || isReplacing}
                        onClick={() => openReplaceModal(image)}
                        className="rounded-xl border-[#DDE7E3] bg-white text-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only xl:not-sr-only">Replace</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleDelete(image)}
                        className="rounded-xl border-[#F3D2D2] bg-white text-[#B91C1C] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only xl:not-sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#DDE7E3] bg-[#FAFAF8] p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
              <ImageIcon className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-[#1A1A1A]">No images found</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
              Upload your first website image or switch to another category filter.
            </p>
          </div>
        )}
      </section>

      {previewImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] p-5">
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Image preview</h3>
                <p className="mt-1 text-sm text-[#6B7280]">{previewImage.filename}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F6F2] text-[#4B5563] transition hover:bg-[#E5E7EB]"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid max-h-[calc(90vh-82px)] overflow-y-auto lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="flex min-h-[360px] items-center justify-center bg-[#0F172A] p-4">
                <img src={previewImage.url} alt={previewImage.filename} className="max-h-[68vh] max-w-full rounded-2xl object-contain" />
              </div>
              <aside className="space-y-5 p-5">
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF8] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Details</p>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-[#6B7280]">Filename</dt>
                      <dd className="mt-1 break-words font-medium text-[#1A1A1A]">{previewImage.filename}</dd>
                    </div>
                    <div>
                      <dt className="text-[#6B7280]">Dimensions</dt>
                      <dd className="mt-1 font-medium text-[#1A1A1A]">
                        {previewImage.width && previewImage.height ? `${previewImage.width}×${previewImage.height}px` : "Unavailable"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#6B7280]">Size</dt>
                      <dd className="mt-1 font-medium text-[#1A1A1A]">{formatBytes(previewImage.file_size)}</dd>
                    </div>
                    <div>
                      <dt className="text-[#6B7280]">URL</dt>
                      <dd className="mt-1 break-all text-xs font-medium text-[#2563EB]">{previewImage.url}</dd>
                    </div>
                  </dl>
                </div>
                <div className="grid gap-2">
                  <Button type="button" onClick={() => void handleCopy(previewImage.url)} className="rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]">
                    <Copy className="h-4 w-4" />
                    Copy URL
                  </Button>
                  <Button type="button" variant="outline" onClick={() => openReplaceModal(previewImage)} className="rounded-xl border-[#DDE7E3] bg-white text-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]">
                    <Pencil className="h-4 w-4" />
                    Replace Image
                  </Button>
                  <a href={previewImage.url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#DDE7E3] bg-white px-4 py-2 text-sm font-medium text-[#1A1A1A] transition hover:bg-[#F4F6F2]">
                    <ExternalLink className="h-4 w-4" />
                    Open full size
                  </a>
                  <Button type="button" variant="outline" disabled={isPending} onClick={() => handleDelete(previewImage)} className="rounded-xl border-[#F3D2D2] bg-white text-[#B91C1C] hover:bg-[#FEF2F2] hover:text-[#B91C1C]">
                    <Trash2 className="h-4 w-4" />
                    Delete Image
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}

      {replaceTarget ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-[#1A1A1A]">Replace Image</h3>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Upload a new file for <span className="font-medium text-[#1A1A1A]">{replaceTarget.filename}</span>. The same database record ID will be kept.
                </p>
              </div>
              <button
                type="button"
                disabled={isReplacing}
                onClick={() => setReplaceTarget(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F6F2] text-[#4B5563] transition hover:bg-[#E5E7EB] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close replace modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setReplaceDragActive(true);
              }}
              onDragLeave={() => setReplaceDragActive(false)}
              onDrop={handleReplaceDrop}
              className={cn(
                "mt-6 rounded-[1.5rem] border-2 border-dashed p-8 text-center transition-colors",
                replaceDragActive ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#DDE7E3] bg-[#FAFAF8] hover:border-[#2563EB]/60",
              )}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                {isReplacing ? <LoaderCircle className="h-7 w-7 animate-spin" /> : <UploadCloud className="h-7 w-7" />}
              </div>
              <h4 className="mt-4 text-base font-semibold text-[#1A1A1A]">Drag and drop replacement image here</h4>
              <p className="mt-2 text-sm text-[#6B7280]">PNG, JPG, or WebP. Maximum 5MB.</p>
              <Input
                ref={replaceFileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                onChange={handleReplaceInputChange}
                className="hidden"
              />
              <Button
                type="button"
                disabled={isReplacing}
                onClick={() => replaceFileInputRef.current?.click()}
                className="mt-5 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              >
                <Pencil className="h-4 w-4" />
                Choose replacement
              </Button>
              {isReplacing ? (
                <div className="mx-auto mt-5 max-w-md">
                  <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div className="h-full rounded-full bg-[#2563EB] transition-all" style={{ width: `${replaceProgress}%` }} />
                  </div>
                  <p className="mt-2 text-xs font-medium text-[#2563EB]">
                    Replacing {currentFileName ? `${currentFileName} · ` : ""}{replaceProgress}%
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
