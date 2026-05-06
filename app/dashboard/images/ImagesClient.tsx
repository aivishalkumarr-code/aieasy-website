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

import { assignPortfolioImage } from "@/app/dashboard/actions/portfolio";
import {
  deleteManagedImage,
  updateImage,
  updateBusinessTypeImage,
  updateImageCategory,
  uploadManagedImage,
} from "@/app/dashboard/actions/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BusinessTypeImage, ImageCategory, ManagedImage, PortfolioItem } from "@/types";

interface ImagesClientProps {
  initialImages: ManagedImage[];
  initialPortfolioItems: PortfolioItem[];
  initialBusinessTypeImages: Record<string, BusinessTypeImage>;
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

const categories: ImageCategory[] = ["Landing Page", "Hero", "Portfolio", "Services", "Business Types", "Blog", "General"];
const filters: Array<ImageCategory | "All"> = ["All", ...categories];
const businessTypeOptions = [
  { id: "business", label: "Business & Services" },
  { id: "healthcare", label: "Healthcare & Clinics" },
  { id: "ecommerce", label: "E-commerce Stores" },
  { id: "education", label: "Education & Coaching" },
  { id: "real-estate", label: "Real Estate" },
  { id: "hospitality", label: "Hospitality & Food" },
] as const;
const businessTypeFilenameSeparator = "__";
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

const isBusinessType = (value: string) => businessTypeOptions.some((option) => option.id === value);

const getBusinessTypeFromFilename = (filename: string) => {
  const [candidate] = filename.split(businessTypeFilenameSeparator);
  return isBusinessType(candidate) ? candidate : "";
};

const stripBusinessTypeFromFilename = (filename: string) => {
  const businessType = getBusinessTypeFromFilename(filename);

  if (!businessType) {
    return filename;
  }

  return filename.slice(`${businessType}${businessTypeFilenameSeparator}`.length) || filename;
};

const withBusinessTypeFilename = (filename: string, businessType: string) => {
  const cleanFilename = stripBusinessTypeFromFilename(filename);
  return `${businessType}${businessTypeFilenameSeparator}${cleanFilename}`;
};

export function ImagesClient({ initialImages, initialPortfolioItems, initialBusinessTypeImages }: ImagesClientProps) {
  const [images, setImages] = useState(initialImages);
  const [portfolioItems, setPortfolioItems] = useState(initialPortfolioItems);
  const [activeView, setActiveView] = useState<"all" | "portfolio" | "businessTypes">("all");
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory>("General");
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>(businessTypeOptions[0].id);
  const [activeFilter, setActiveFilter] = useState<ImageCategory | "All">("All");
  const [selectedPortfolioItemId, setSelectedPortfolioItemId] = useState(initialPortfolioItems[0]?.id ?? "");
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

  const portfolioImages = useMemo(
    () => images.filter((image) => (image.category ?? "General") === "Portfolio"),
    [images],
  );

  const businessTypeImages = useMemo(
    () => images.filter((image) => (image.category ?? "General") === "Business Types"),
    [images],
  );

  const businessTypeImageMap = useMemo(() => {
    const mappedImages: Record<string, BusinessTypeImage> = {};

    for (const image of businessTypeImages) {
      const businessType = getBusinessTypeFromFilename(image.filename);

      if (!businessType || mappedImages[businessType]) {
        continue;
      }

      mappedImages[businessType] = {
        id: image.id,
        url: image.url,
        filename: stripBusinessTypeFromFilename(image.filename),
        category: image.category ?? "Business Types",
        width: image.width ?? undefined,
        height: image.height ?? undefined,
        business_type: businessType,
      };
    }

    return mappedImages;
  }, [businessTypeImages]);

  const initialBusinessTypeImageCount = Object.keys(initialBusinessTypeImages).length;

  const selectedPortfolioItem = useMemo(
    () => portfolioItems.find((item) => item.id === selectedPortfolioItemId) ?? portfolioItems[0] ?? null,
    [portfolioItems, selectedPortfolioItemId],
  );

  const portfolioItemsNeedingImages = useMemo(
    () => portfolioItems.filter((item) => !item.image_id),
    [portfolioItems],
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

    if (selectedCategory === "Business Types") {
      formData.append("business_type", selectedBusinessType);
    }

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

  const handleBusinessTypeChange = (image: ManagedImage, businessType: string) => {
    if (!isBusinessType(businessType)) {
      return;
    }

    startTransition(async () => {
      const previousImages = images;
      setImages((current) =>
        current.map((entry) =>
          entry.id === image.id
            ? { ...entry, category: "Business Types", filename: withBusinessTypeFilename(entry.filename, businessType) }
            : entry,
        ),
      );

      const result = await updateBusinessTypeImage(image.id, businessType);

      if (!result.success || !result.data) {
        setImages(previousImages);
        setFeedback({ type: "error", message: result.message ?? "Unable to update business type image." });
        return;
      }

      setImages((current) => current.map((entry) => (entry.id === image.id ? result.data! : entry)));
      setPreviewImage((current) => (current?.id === image.id ? result.data! : current));
      setReplaceTarget((current) => (current?.id === image.id ? result.data! : current));
      setFeedback({ type: "success", message: result.message ?? "Business type image updated." });
    });
  };

  const handleAssignToPortfolio = (image: ManagedImage, portfolioItemId = selectedPortfolioItem?.id ?? "") => {
    if (!portfolioItemId) {
      setFeedback({ type: "error", message: "Choose a portfolio item before assigning an image." });
      return;
    }

    startTransition(async () => {
      const result = await assignPortfolioImage(portfolioItemId, image.id);

      if (!result.success || !result.data) {
        setFeedback({ type: "error", message: result.message ?? "Unable to assign portfolio image." });
        return;
      }

      setPortfolioItems((current) => current.map((item) => (item.id === result.data!.id ? result.data! : item)));
      setImages((current) => current.map((entry) => (entry.id === image.id ? { ...entry, category: "Portfolio" } : entry)));
      setFeedback({ type: "success", message: result.message ?? `Assigned image to ${result.data.title}.` });
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

      <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-[#DDE7E3] bg-white p-2 shadow-card">
        {[
          { id: "all" as const, label: "All Images", count: images.length },
          { id: "portfolio" as const, label: "Portfolio Images", count: portfolioImages.length },
          {
            id: "businessTypes" as const,
            label: "Business Type Images",
            count: Math.max(businessTypeImages.length, initialBusinessTypeImageCount),
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveView(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-[1rem] px-4 py-2 text-sm font-semibold transition-colors",
              activeView === tab.id
                ? "bg-[#2563EB] text-white shadow-lg shadow-blue-600/20"
                : "text-[#4B5563] hover:bg-[#EFF6FF] hover:text-[#2563EB]",
            )}
          >
            {tab.label}
            <span className={cn("rounded-full px-2 py-0.5 text-xs", activeView === tab.id ? "bg-white/20 text-white" : "bg-[#EFF6FF] text-[#2563EB]")}>{tab.count}</span>
          </button>
        ))}
      </div>

      <section className="grid gap-4 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Upload images</h3>
              <p className="mt-1 text-sm text-[#6B7280]">PNG, JPG, or WebP. Maximum 5MB per image.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[420px]">
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
              {selectedCategory === "Business Types" ? (
                <select
                  value={selectedBusinessType}
                  onChange={(event) => setSelectedBusinessType(event.target.value)}
                  className="h-11 rounded-xl border border-[#DDE7E3] bg-white px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
                  aria-label="Business type card"
                >
                  {businessTypeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
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
            <p className="mt-2 text-sm text-[#6B7280]">
              Files will be tagged as {selectedCategory}
              {selectedCategory === "Business Types"
                ? ` and assigned to ${businessTypeOptions.find((option) => option.id === selectedBusinessType)?.label}.`
                : "."}
            </p>
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

      {activeView === "all" ? (
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
                      <p className="truncate text-sm font-semibold text-[#1A1A1A]" title={stripBusinessTypeFromFilename(image.filename)}>
                        {stripBusinessTypeFromFilename(image.filename)}
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

                    {(image.category ?? "General") === "Business Types" ? (
                      <select
                        value={getBusinessTypeFromFilename(image.filename)}
                        disabled={isPending}
                        onChange={(event) => handleBusinessTypeChange(image, event.target.value)}
                        className="h-10 w-full rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
                        aria-label="Business type card"
                      >
                        <option value="">Choose business type card</option>
                        {businessTypeOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : null}

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
      ) : activeView === "portfolio" ? (
        <section className="space-y-4 rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Portfolio Images</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6B7280]">
                Select a portfolio item, then assign any image tagged with the Portfolio category.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-[#EFF6FF] px-3 py-1 font-medium text-[#2563EB]">
                {portfolioImages.length} portfolio images
              </span>
              <span className="rounded-full bg-[#F4F6F2] px-3 py-1 font-medium text-[#4B5563]">
                {portfolioItemsNeedingImages.length} need images
              </span>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#64748B]">Portfolio items</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("Portfolio");
                    fileInputRef.current?.click();
                  }}
                  className="rounded-xl border-[#DDE7E3] bg-white text-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload Portfolio Image
                </Button>
              </div>

              <div className="grid gap-3">
                {portfolioItems.map((item) => {
                  const active = selectedPortfolioItem?.id === item.id;

                  return (
                    <article
                      key={item.id}
                      className={cn(
                        "grid gap-4 rounded-[1.25rem] border p-3 transition-colors sm:grid-cols-[112px_minmax(0,1fr)]",
                        active ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E5E7EB] bg-white hover:border-[#2563EB]/50",
                      )}
                    >
                      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#F4F6F2]">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#2563EB]">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 space-y-3">
                        <div>
                          <p className="truncate text-sm font-semibold text-[#1A1A1A]">{item.title}</p>
                          <p className="mt-1 text-xs text-[#6B7280]">{item.category} · {item.image_id ? "Custom image assigned" : "Using default image"}</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={active ? "default" : "outline"}
                          onClick={() => {
                            setSelectedPortfolioItemId(item.id);
                            setSelectedCategory("Portfolio");
                          }}
                          className={cn(
                            "rounded-xl",
                            active
                              ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                              : "border-[#DDE7E3] bg-white text-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]",
                          )}
                        >
                          Upload/Assign Image
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                Assign to {selectedPortfolioItem?.title ?? "portfolio item"}
              </h4>

              {portfolioImages.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {portfolioImages.map((image) => {
                    const assignedHere = selectedPortfolioItem?.image_id === image.id;

                    return (
                      <article key={image.id} className="overflow-hidden rounded-[1.25rem] border border-[#E5E7EB] bg-white shadow-sm">
                        <button type="button" onClick={() => setPreviewImage(image)} className="group block aspect-[4/3] w-full overflow-hidden bg-[#F4F6F2] text-left">
                          <img src={image.url} alt={image.filename} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                        </button>
                        <div className="space-y-3 p-3">
                          <div>
                            <p className="truncate text-sm font-semibold text-[#1A1A1A]" title={image.filename}>{image.filename}</p>
                            <p className="mt-1 text-xs text-[#6B7280]">{image.width && image.height ? `${image.width}×${image.height}px` : "Dimensions unavailable"}</p>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={isPending || !selectedPortfolioItem || assignedHere}
                              onClick={() => handleAssignToPortfolio(image)}
                              className="rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                            >
                              {assignedHere ? "Assigned" : `Assign to ${selectedPortfolioItem?.title ?? "Portfolio"}`}
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => void handleCopy(image.url)} className="rounded-xl border-[#DDE7E3] bg-white">
                              <Copy className="h-4 w-4" />
                              Copy URL
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
                  <h3 className="mt-4 text-base font-semibold text-[#1A1A1A]">No portfolio images yet</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                    Upload an image with the Portfolio category, then assign it to a portfolio item.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-4 rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Business Type Images</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6B7280]">
                Upload images for the Websites Designed for Your Business Type cards and choose which card each image belongs to.
              </p>
            </div>
            <div className="rounded-full bg-[#EFF6FF] px-3 py-1 text-sm font-medium text-[#2563EB]">
              {Object.keys(businessTypeImageMap).length} of {businessTypeOptions.length} assigned
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {businessTypeOptions.map((option) => {
              const image = businessTypeImageMap[option.id];

              return (
                <article key={option.id} className="overflow-hidden rounded-[1.5rem] border border-[#E5E7EB] bg-white shadow-sm">
                  <div className="aspect-[4/3] overflow-hidden bg-[#F4F6F2]">
                    {image ? (
                      <img src={image.url} alt={option.label} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#2563EB]">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{option.label}</p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {image ? stripBusinessTypeFromFilename(image.filename) : "No custom image assigned"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveView("all");
                        setActiveFilter("Business Types");
                        setSelectedCategory("Business Types");
                        setSelectedBusinessType(option.id);
                        fileInputRef.current?.click();
                      }}
                      className="w-full rounded-xl border-[#DDE7E3] bg-white text-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                    >
                      <UploadCloud className="h-4 w-4" />
                      Upload for this card
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          {businessTypeImages.length ? (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#64748B]">Uploaded business type images</h4>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {businessTypeImages.map((image) => (
                  <article key={image.id} className="overflow-hidden rounded-[1.25rem] border border-[#E5E7EB] bg-white shadow-sm">
                    <button type="button" onClick={() => setPreviewImage(image)} className="group block aspect-[4/3] w-full overflow-hidden bg-[#F4F6F2] text-left">
                      <img src={image.url} alt={stripBusinessTypeFromFilename(image.filename)} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    </button>
                    <div className="space-y-3 p-3">
                      <div>
                        <p className="truncate text-sm font-semibold text-[#1A1A1A]" title={stripBusinessTypeFromFilename(image.filename)}>
                          {stripBusinessTypeFromFilename(image.filename)}
                        </p>
                        <p className="mt-1 text-xs text-[#6B7280]">{image.width && image.height ? `${image.width}×${image.height}px` : "Dimensions unavailable"}</p>
                      </div>
                      <select
                        value={getBusinessTypeFromFilename(image.filename)}
                        disabled={isPending}
                        onChange={(event) => handleBusinessTypeChange(image, event.target.value)}
                        className="h-10 w-full rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
                      >
                        <option value="">Choose business type card</option>
                        {businessTypeOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => void handleCopy(image.url)} className="rounded-xl border-[#DDE7E3] bg-white">
                          <Copy className="h-4 w-4" />
                          Copy URL
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
                          Replace
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}

      {previewImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] p-5">
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Image preview</h3>
                <p className="mt-1 text-sm text-[#6B7280]">{stripBusinessTypeFromFilename(previewImage.filename)}</p>
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
                <img src={previewImage.url} alt={stripBusinessTypeFromFilename(previewImage.filename)} className="max-h-[68vh] max-w-full rounded-2xl object-contain" />
              </div>
              <aside className="space-y-5 p-5">
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF8] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Details</p>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-[#6B7280]">Filename</dt>
                      <dd className="mt-1 break-words font-medium text-[#1A1A1A]">{stripBusinessTypeFromFilename(previewImage.filename)}</dd>
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
                  Upload a new file for <span className="font-medium text-[#1A1A1A]">{stripBusinessTypeFromFilename(replaceTarget.filename)}</span>. The same database record ID will be kept.
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
