"use client";

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { CheckCircle2, FileImage, LoaderCircle, UploadCloud, XCircle } from "lucide-react";

import { ensureLogoBucket, saveLogo } from "@/app/dashboard/actions/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEFAULT_LOGO_URL } from "@/lib/logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { LogoType, ManagedLogo } from "@/types";

interface LogoClientProps {
  initialLogos: ManagedLogo[];
}

interface UploadFeedback {
  type: "success" | "error" | "info";
  message: string;
}

const logoTypes: Array<{ type: LogoType; label: string; description: string; size: string }> = [
  {
    type: "main",
    label: "Main logo",
    description: "Website header and primary brand placement",
    size: "400px × 80px",
  },
  {
    type: "dark",
    label: "Dark variant",
    description: "Optional version for dark backgrounds",
    size: "400px × 80px",
  },
  {
    type: "favicon",
    label: "Favicon",
    description: "Browser tab and app icon",
    size: "32px × 32px or 64px × 64px",
  },
  {
    type: "og_image",
    label: "Social/OG image",
    description: "Social share preview image",
    size: "1200px × 630px",
  },
];

const guidelines = [
  { title: "Main Logo (Header)", size: "400px × 80px", note: "Wide transparent PNG or SVG" },
  { title: "Favicon", size: "32px × 32px or 64px × 64px", note: "Square PNG, JPG, or SVG" },
  { title: "Social/OG Image", size: "1200px × 630px", note: "Large share card image" },
  { title: "Dashboard Logo", size: "200px × 50px", note: "Compact sidebar version" },
];

const maxFileSize = 2 * 1024 * 1024;
const acceptedMimeTypes = ["image/png", "image/svg+xml", "image/jpeg"];
const acceptedExtensions = ["png", "svg", "jpg", "jpeg"];

const getLogoMap = (logos: ManagedLogo[]) =>
  logos.reduce<Partial<Record<LogoType, ManagedLogo>>>((accumulator, logo) => {
    accumulator[logo.type] = logo;
    return accumulator;
  }, {});

const getExtension = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "png";

const getPublicUploadUrl = (path: string) => {
  const supabase = createClient();
  return supabase?.storage.from("logos").getPublicUrl(path).data.publicUrl ?? "";
};

const readImageSize = (file: File): Promise<{ width: number | null; height: number | null }> =>
  new Promise((resolve) => {
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => {
        const svg = new DOMParser().parseFromString(String(reader.result ?? ""), "image/svg+xml")
          .documentElement;
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

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve({ width: null, height: null });
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });

export function LogoClient({ initialLogos }: LogoClientProps) {
  const [logos, setLogos] = useState(initialLogos);
  const [selectedType, setSelectedType] = useState<LogoType>("main");
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedback, setFeedback] = useState<UploadFeedback | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const logoMap = useMemo(() => getLogoMap(logos), [logos]);
  const currentLogo = logoMap[selectedType];
  const mainLogoUrl = logoMap.main?.url || DEFAULT_LOGO_URL;
  const darkLogoUrl = logoMap.dark?.url || mainLogoUrl;
  const faviconUrl = logoMap.favicon?.url || mainLogoUrl;
  const selectedMeta = logoTypes.find((logo) => logo.type === selectedType) ?? logoTypes[0];

  const validateFile = (file: File) => {
    const extension = getExtension(file);

    if (!acceptedMimeTypes.includes(file.type) && !acceptedExtensions.includes(extension)) {
      return "Upload a PNG, SVG, or JPG file.";
    }

    if (file.size > maxFileSize) {
      return "File size must be 2MB or less.";
    }

    return null;
  };

  const uploadWithProgress = async (file: File, path: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient();

    if (!supabaseUrl || !supabaseAnonKey || !supabase) {
      throw new Error("Supabase is not configured. Connect Supabase to upload logos.");
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      throw new Error("Sign in again to upload logo assets.");
    }

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${supabaseUrl}/storage/v1/object/logos/${path}`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("apikey", supabaseAnonKey);
      xhr.setRequestHeader("x-upsert", "true");
      xhr.setRequestHeader("content-type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.min(90, Math.round((event.loaded / event.total) * 90)));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
          return;
        }

        reject(new Error(xhr.responseText || "Storage upload failed."));
      };
      xhr.onerror = () => reject(new Error("Storage upload failed."));
      xhr.send(file);
    });

    return getPublicUploadUrl(path);
  };

  const handleFile = async (file: File) => {
    setFeedback(null);
    const validationMessage = validateFile(file);

    if (validationMessage) {
      setFeedback({ type: "error", message: validationMessage });
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);

    try {
      if (!isSupabaseConfigured()) {
        throw new Error("Supabase is not configured. Connect Supabase to upload logos.");
      }

      const bucket = await ensureLogoBucket();

      if (!bucket.success) {
        throw new Error(bucket.message ?? "Unable to prepare logo storage.");
      }

      const dimensions = await readImageSize(file);
      const extension = getExtension(file) === "jpg" ? "jpg" : getExtension(file);
      const path = `${selectedType}/logo-${Date.now()}.${extension}`;
      const url = await uploadWithProgress(file, path);

      setUploadProgress(95);

      const result = await saveLogo({
        type: selectedType,
        url,
        width: dimensions.width,
        height: dimensions.height,
        file_size: file.size,
      });

      if (!result.success || !result.data) {
        throw new Error(result.message ?? "Unable to save logo metadata.");
      }

      setLogos((current) => {
        const withoutType = current.filter((logo) => logo.type !== selectedType);
        return [result.data!, ...withoutType];
      });
      setUploadProgress(100);
      setFeedback({ type: "success", message: result.message ?? "Logo updated successfully." });
    } catch (error) {
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
    <div className="space-y-4">
      <Card className="rounded-[2rem] border-[#DDE7E3] bg-white shadow-card">
        <CardHeader className="gap-2 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-xl text-[#1A1A1A]">Logo management</CardTitle>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
                Upload PNG, SVG, or JPG brand assets for the website header, dashboard sidebar,
                favicon, and social previews. Max file size: 2MB. Recommended: transparent
                background PNG or SVG.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDE7E3] bg-[#FAFAF8] px-4 py-3 text-sm text-[#4B5563]">
              Current target: <span className="font-semibold text-[#1A1A1A]">{selectedMeta.label}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-0">
          <div className="rounded-[1.5rem] border border-[#DDE7E3] bg-[#FAFAF8] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
              Current preview
            </p>
            <div className="mt-4 flex min-h-40 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white p-8">
              <img
                src={currentLogo?.url || DEFAULT_LOGO_URL}
                alt={`${selectedMeta.label} preview`}
                className={cn(
                  "object-contain",
                  selectedType === "favicon" ? "h-16 w-16" : "max-h-28 max-w-full",
                )}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#6B7280]">
              <span>Recommended: {selectedMeta.size}</span>
              {currentLogo?.width && currentLogo?.height ? (
                <span>
                  Current: {currentLogo.width}px × {currentLogo.height}px
                </span>
              ) : null}
              {currentLogo?.file_size ? <span>{Math.round(currentLogo.file_size / 1024)}KB</span> : null}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {logoTypes.map((logo) => (
              <button
                key={logo.type}
                type="button"
                onClick={() => setSelectedType(logo.type)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all",
                  selectedType === logo.type
                    ? "border-[#2563EB] bg-[#EFF6FF] shadow-sm"
                    : "border-[#DDE7E3] bg-white hover:border-[#2563EB]/40",
                )}
              >
                <p className="text-sm font-semibold text-[#1A1A1A]">{logo.label}</p>
                <p className="mt-1 text-xs text-[#6B7280]">{logo.description}</p>
                <p className="mt-3 text-xs font-medium text-[#2563EB]">{logo.size}</p>
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
              "rounded-[1.5rem] border-2 border-dashed p-8 text-center transition-colors",
              dragActive ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#DDE7E3] bg-white hover:border-[#2563EB]/50",
            )}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
              {isUploading ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
            </div>
            <h3 className="mt-4 text-base font-semibold text-[#1A1A1A]">Drag and drop logo file</h3>
            <p className="mt-2 text-sm text-[#6B7280]">PNG, SVG, or JPG up to 2MB</p>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg"
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
                  <div
                    className="h-full rounded-full bg-[#2563EB] transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-[#2563EB]">Uploading {uploadProgress}%</p>
              </div>
            ) : null}
          </div>

          {feedback ? (
            <div
              className={cn(
                "flex gap-3 rounded-2xl border p-4 text-sm",
                feedback.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : feedback.type === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-blue-200 bg-blue-50 text-blue-800",
              )}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <div>
                <p className="font-medium">{feedback.type === "success" ? "Success" : "Upload issue"}</p>
                <p className="mt-1">{feedback.message}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <Card className="rounded-[2rem] border-[#DDE7E3] bg-white shadow-card">
          <CardHeader className="p-6">
            <CardTitle className="text-lg text-[#1A1A1A]">Size guidelines</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid gap-3 md:grid-cols-2">
              {guidelines.map((guideline) => (
                <div key={guideline.title} className="rounded-2xl border border-[#DDE7E3] bg-[#FAFAF8] p-4">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{guideline.title}</p>
                  <p className="mt-2 text-lg font-semibold text-[#2563EB]">{guideline.size}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">{guideline.note}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-[#DDE7E3] bg-white p-4 text-sm text-[#4B5563]">
              <p className="font-semibold text-[#1A1A1A]">Requirements</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Max file size: 2MB</li>
                <li>Accepted formats: PNG, SVG, JPG</li>
                <li>Recommended: transparent background PNG or SVG</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-[#DDE7E3] bg-white shadow-card">
          <CardHeader className="p-6">
            <CardTitle className="text-lg text-[#1A1A1A]">Context previews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <div className="rounded-2xl border border-[#DDE7E3] bg-[#FAFAF8] p-4">
              <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">Main website header</p>
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
              <div className="rounded-2xl border border-[#DDE7E3] bg-[#111827] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Dark background</p>
                <div className="flex h-24 items-center justify-center rounded-xl border border-white/10 bg-[#020617] p-5">
                  <img src={darkLogoUrl} alt="Dark logo preview" className="max-h-12 max-w-full object-contain" />
                </div>
              </div>
              <div className="rounded-2xl border border-[#DDE7E3] bg-white p-4">
                <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">Light background</p>
                <div className="flex h-24 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] p-5">
                  <img src={mainLogoUrl} alt="Light logo preview" className="max-h-12 max-w-full object-contain" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#DDE7E3] bg-[#FAFAF8] p-4">
                <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">Dashboard sidebar</p>
                <div className="flex items-center gap-3 rounded-2xl border border-[#DDE7E3] bg-white p-4">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[#EFF6FF] p-2">
                    <img src={mainLogoUrl} alt="Compact logo preview" className="h-7 w-7 object-contain" />
                  </div>
                  <img src={mainLogoUrl} alt="Dashboard logo preview" className="h-10 max-w-[150px] object-contain object-left" />
                </div>
              </div>
              <div className="rounded-2xl border border-[#DDE7E3] bg-[#FAFAF8] p-4">
                <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">Favicon preview</p>
                <div className="rounded-2xl border border-[#DDE7E3] bg-white p-3">
                  <div className="flex items-center gap-2 rounded-t-xl border border-[#E5E7EB] bg-[#F4F6F2] px-3 py-2 text-xs text-[#4B5563]">
                    <img src={faviconUrl} alt="Favicon preview" className="h-5 w-5 rounded object-contain" />
                    <span>AIeasy | AI Made Easy</span>
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
