"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";

import { setPortfolioVersion } from "@/app/dashboard/actions/portfolio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PortfolioVersion } from "@/types";

interface PortfolioSettingsProps {
  initialVersion: PortfolioVersion;
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

const versions: Array<{ value: PortfolioVersion; title: string; description: string }> = [
  { value: "v1", title: "Portfolio V1 Grid", description: "Classic responsive grid with filters and cards." },
  { value: "v2", title: "Portfolio V2 Carousel", description: "3D center-focused carousel with stats overlays, peek cards, and CTA banner." },
];

export function PortfolioSettings({ initialVersion }: PortfolioSettingsProps) {
  const [version, setVersion] = useState<PortfolioVersion>(initialVersion);
  const [savedVersion, setSavedVersion] = useState<PortfolioVersion>(initialVersion);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();

  const saveVersion = () => {
    setFeedback(null);

    startTransition(async () => {
      const result = await setPortfolioVersion(version);

      if (!result.success || !result.data) {
        setFeedback({ type: "error", message: result.message ?? "Unable to save portfolio version." });
        return;
      }

      setVersion(result.data);
      setSavedVersion(result.data);
      setFeedback({ type: "success", message: result.message ?? "Portfolio version saved." });
    });
  };

  return (
    <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Portfolio version</h2>
          <p className="mt-1 text-sm text-[#6B7280]">Switch the landing page between the grid and carousel portfolio designs.</p>
        </div>
        <Button
          type="button"
          disabled={isPending || version === savedVersion}
          onClick={saveVersion}
          className="h-11 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-60"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Save Version
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {versions.map((option) => {
          const active = version === option.value;

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
                  name="portfolio_version"
                  value={option.value}
                  checked={active}
                  onChange={() => {
                    setVersion(option.value);
                    setFeedback(null);
                  }}
                  className="mt-1 h-4 w-4 accent-[#2563EB]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-[#1A1A1A]">{option.title}</h3>
                    {savedVersion === option.value ? (
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

      {feedback ? (
        <div
          className={cn(
            "mt-4 rounded-xl border p-4 text-sm",
            feedback.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[#2563EB]/20 bg-blue-50 text-[#1D4ED8]",
          )}
        >
          {feedback.message}
        </div>
      ) : null}
    </section>
  );
}
