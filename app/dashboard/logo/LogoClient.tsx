"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { CheckCircle2, FileImage, LoaderCircle, UploadCloud, XCircle } from "lucide-react";

import { saveLogoToDatabase, uploadLogo } from "@/app/dashboard/actions/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEFAULT_LOGO_URL } from "@/lib/logo";
import { cn } from "@/lib/utils";
import type { LogoType, ManagedLogo } from "@/types";

interface LogoClientProps {
  currentLogo: ManagedLogo;
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

const logoTypes: Array<{ type: LogoType; label: string; description: string; size: string }> = [
  {
    type: "main",
    label: "Main logo",
    description: "Primary website and dashboard brand mark",
    size: "400 × 80px",
  },
  {
    type: "favicon",
    label: "Favicon",
    description: "Browser tab and app icon",
    size: "32 × 32px",
  },
  {
    type: "og_image",
    label: "OG image",
    description: "Social sharing preview image",
    size: "1200 × 630px",
  },
];

const guidelines = [
  { title: "Main logo", size: "400×80px", description: "Use a transparent PNG or SVG for the header." },
  { title: "Favicon", size: "32×32px", description: "Use a square PNG, JPG, or SVG for browser tabs." },
  { title: "Open Graph", size: "1200×630px", description: "Use a JPG or PNG for link previews." },
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const ACCEPTED_EXTENSIONS = ["png", "jpg", "jpeg", "svg"];

const getExtension = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "";

const formatBytes = (bytes: number) => `${Math.round(bytes / 1024)}KB`;

const readImageSize = (file: File): Promise<{ width: number | null; height: number | null }> =>
  new Promise((resolve) => {
    if (file.type === "image/svg+xml" || getExtension(file) === "svg") {
      const reader = new FileReader();

      reader.onload = () => {
        const svg = new DOMParser().parseFromString(String(reader.result ?? ""), "image/svg+xml").documentElement;
        const width = Number.parseInt(svg.getAttribute("width") ?? "", 10);
        const height = Number.parseInt(svg.getAttribute("height") ?? "", 10);
        const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number);

        resolve({
          width: Number.isFinite(width) ? width : viewBox?.[2] ?? null,
          height: Number.isFinite(height) ? height : viewBox?.[3] ?? null,
        });
      };
      reader.onerror = () => resolve({ width: null, height: null });
      reader.readAsText(file);
      return;
    }

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

export function LogoClient({ currentLogo }: LogoClientProps) {
  const [logos, setLogos] = useState<Partial<Record<LogoType, ManagedLogo>>>({ main: currentLogo });
  const [selectedType, setSelectedType] = useState<LogoType>("main");
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedLogo = logos[selectedType] ?? (selectedType === "main" ? currentLogo : null);
  const mainLogoUrl = logos.main?.url || currentLogo.url || DEFAULT_LOGO_URL;
  const faviconUrl = logos.favicon?.url || mainLogoUrl;
  const selectedMeta = logoTypes.find((logo) => logo.type === selectedType) ?? logoTypes[0];

  const validateFile = (file: File) => {
    const extension = getExtension(file);

    if (!ACCEPTED_MIME_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(extension)) {
      return "Upload a PNG, JPG, or SVG file.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Logo file size must be 2MB or smaller.";
    }

    return null;
  };

  const handleFile = async (file: File) => {
    setFeedback(null);
    setSelectedFileName(file.name);

    const validationMessage = validateFile(file);

    if (validationMessage) {
      setFeedback({ type: "error", message: validationMessage });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const dimensions = await readImageSize(file);
      setUploadProgress(30);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", selectedType);

      setUploadProgress(60);
      const uploadResult = await uploadLogo(formData);

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.message ?? "Unable to upload logo.");
      }

      setUploadProgress(85);
      const saveResult = await saveLogoToDatabase(
        uploadResult.data.url,
        selectedType,
        dimensions.width,
        dimensions.height,
      );

      if (!saveResult.success || !saveResult.data) {
        throw new Error(saveResult.message ?? "Unable to save logo metadata.");
      }

      setLogos((current) => ({ ...current, [selectedType]: saveResult.data }));
      setUploadProgress(100);
      setFeedback({ type: "success", message: saveResult.message ?? "Logo uploaded and saved successfully." });
    } catch (error) {
      setUploadProgress(0);
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to upload logo.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      void handleFile(file);
    }

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      void handleFile(file);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="rounded-[2rem] border-[#DDE7E3] bg-white shadow-card">
        <CardHeader className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-xl text-[#1A1A1A]">Logo Management</CardTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
                Upload brand assets for the website header, dashboard sidebar, favicon, and social previews. Accepts PNG, JPG, and SVG up to 2MB.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDE7E3] bg-[#EFF6FF] px-4 py-3 text-sm text-[#1D4ED8]">
              Current target: <span className="font-semibold">{selectedMeta.label}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-0">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-[1.5rem] border border-[#DDE7E3] bg-[#FAFAF8] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563EB]">Current logo preview</p>
              <div className="mt-4 flex min-h-44 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white p-8">
                <img
                  src={selectedLogo?.url || mainLogoUrl}
                  alt={`${selectedMeta.label} preview`}
                  className={cn(
                    "object-contain",
                    selectedType === "favicon" ? "h-16 w-16" : "max-h-28 max-w-full",
                  )}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#6B7280]">
                <span>Recommended: {selectedMeta.size}</span>
                {selectedLogo?.width && selectedLogo.height ? <span>Current: {selectedLogo.width}×{selectedLogo.height}px</span> : null}
                {selectedFileName ? <span>Selected: {selectedFileName}</span> : null}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {logoTypes.map((logo) => (
                  <button
                    key={logo.type}
                    type="button"
                    onClick={() => {
                      setSelectedType(logo.type);
                      setFeedback(null);
                    }}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all",
                      selectedType === logo.type
                        ? "border-[#2563EB] bg-[#EFF6FF] shadow-sm"
                        : "border-[#DDE7E3] bg-white hover:border-[#2563EB]/50",
                    )}
                  >
                    <p className="text-sm font-semibold text-[#1A1A1A]">{logo.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[#6B7280]">{logo.description}</p>
                    <p className="mt-2 text-xs font-semibold text-[#2563EB]">{logo.size}</p>
                  </button>
                ))}
              </div>

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={cn(
                  "rounded-[1.5rem] border-2 border-dashed p-7 text-center transition-colors",
                  dragActive ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#DDE7E3] bg-white hover:border-[#2563EB]/60",
                )}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                  {isUploading ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#1A1A1A]">Drag and drop a logo file</h3>
                <p className="mt-2 text-sm text-[#6B7280]">PNG, JPG, or SVG. Maximum upload size: 2MB.</p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
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
                  Choose file
                </Button>
                {isUploading ? (
                  <div className="mx-auto mt-5 max-w-md">
                    <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                      <div className="h-full rounded-full bg-[#2563EB] transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="mt-2 text-xs font-medium text-[#2563EB]">Uploading {uploadProgress}%</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {feedback ? (
            <div
              className={cn(
                "flex gap-3 rounded-2xl border p-4 text-sm",
                feedback.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800",
              )}
            >
              {feedback.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
              <div>
                <p className="font-semibold">{feedback.type === "success" ? "Success" : "Upload error"}</p>
                <p className="mt-1">{feedback.message}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.3fr]">
        <Card className="rounded-[2rem] border-[#DDE7E3] bg-white shadow-card">
          <CardHeader className="p-6">
            <CardTitle className="text-lg text-[#1A1A1A]">Size guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6 pt-0">
            {guidelines.map((guideline) => (
              <div key={guideline.title} className="rounded-2xl border border-[#DDE7E3] bg-[#FAFAF8] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{guideline.title}</p>
                  <p className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">{guideline.size}</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#6B7280]">{guideline.description}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-[#DDE7E3] bg-white p-4 text-sm text-[#4B5563]">
              <p className="font-semibold text-[#1A1A1A]">Upload rules</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>2MB max file size ({formatBytes(MAX_FILE_SIZE)})</li>
                <li>Accepted formats: PNG, JPG, SVG</li>
                <li>Transparent backgrounds are recommended for main logos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-[#DDE7E3] bg-white shadow-card">
          <CardHeader className="p-6">
            <CardTitle className="text-lg text-[#1A1A1A]">Preview in context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <div className="rounded-2xl border border-[#DDE7E3] bg-[#FAFAF8] p-4">
              <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">Website header</p>
              <div className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
                <img src={mainLogoUrl} alt="Header logo preview" className="h-12 max-w-[220px] object-contain object-left" />
                <div className="hidden gap-5 text-xs font-medium text-[#6B7280] sm:flex">
                  <span>Services</span>
                  <span>Blog</span>
                  <span>Contact</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#DDE7E3] bg-[#FAFAF8] p-4">
                <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">Dashboard sidebar</p>
                <div className="flex items-center gap-3 rounded-2xl border border-[#DDE7E3] bg-white p-4">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[#EFF6FF] p-2">
                    <img src={mainLogoUrl} alt="Sidebar icon preview" className="h-7 w-7 object-contain" />
                  </div>
                  <img src={mainLogoUrl} alt="Sidebar logo preview" className="h-10 max-w-[150px] object-contain object-left" />
                </div>
              </div>

              <div className="rounded-2xl border border-[#DDE7E3] bg-[#FAFAF8] p-4">
                <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">Favicon</p>
                <div className="rounded-2xl border border-[#DDE7E3] bg-white p-3">
                  <div className="flex items-center gap-2 rounded-t-xl border border-[#E5E7EB] bg-[#F4F6F2] px-3 py-2 text-xs text-[#4B5563]">
                    <img src={faviconUrl} alt="Favicon preview" className="h-5 w-5 rounded object-contain" />
                    <span>AIeasy Dashboard</span>
                  </div>
                  <div className="h-14 rounded-b-xl border-x border-b border-[#E5E7EB] bg-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
