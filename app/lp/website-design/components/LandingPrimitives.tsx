import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const sectionContainerClass = "mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8";
export const sectionPaddingClass = "py-12 sm:py-14 lg:py-20";
export const sectionPaddingLargeClass = "py-12 sm:py-14 lg:py-24";
export const softCardClass =
  "rounded-2xl border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(15,148,136,0.12)]";
export const primaryButtonClass =
  "rounded-full bg-[#0D9488] px-6 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#0F766E] hover:shadow-[0_20px_60px_rgba(15,148,136,0.18)] sm:px-7 sm:text-base";
export const secondaryButtonClass =
  "rounded-full border border-slate-200/70 bg-white px-6 text-sm font-semibold text-slate-900 transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:text-[#0D9488] hover:shadow-[0_20px_60px_rgba(15,148,136,0.12)] sm:px-7 sm:text-base";

interface SectionIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionIntroProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        isCentered ? "mx-auto max-w-3xl text-center" : "max-w-2xl text-left",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
        {description}
      </p>
    </div>
  );
}

type AccentKey = "teal" | "emerald" | "sky" | "cyan" | "slate";

interface BrowserMockupProps {
  eyebrow: string;
  title: string;
  description: string;
  chips: string[];
  statLabel: string;
  statValue: string;
  columns: string[];
  accent?: AccentKey;
  compact?: boolean;
  className?: string;
}

const accentMap: Record<AccentKey, { gradient: string; tint: string; badge: string }> = {
  teal: {
    gradient: "from-teal-100 via-white to-emerald-50",
    tint: "bg-teal-50 text-teal-700",
    badge: "border-teal-200/80 bg-white/90 text-teal-700",
  },
  emerald: {
    gradient: "from-emerald-100 via-white to-lime-50",
    tint: "bg-emerald-50 text-emerald-700",
    badge: "border-emerald-200/80 bg-white/90 text-emerald-700",
  },
  sky: {
    gradient: "from-sky-100 via-white to-cyan-50",
    tint: "bg-sky-50 text-sky-700",
    badge: "border-sky-200/80 bg-white/90 text-sky-700",
  },
  cyan: {
    gradient: "from-cyan-100 via-white to-teal-50",
    tint: "bg-cyan-50 text-cyan-700",
    badge: "border-cyan-200/80 bg-white/90 text-cyan-700",
  },
  slate: {
    gradient: "from-slate-100 via-white to-slate-50",
    tint: "bg-slate-100 text-slate-700",
    badge: "border-slate-200/80 bg-white/90 text-slate-700",
  },
};

export function BrowserMockup({
  eyebrow,
  title,
  description,
  chips,
  statLabel,
  statValue,
  columns,
  accent = "teal",
  compact = false,
  className,
}: BrowserMockupProps) {
  const palette = accentMap[accent];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.4rem] border border-slate-200/70 bg-slate-50/90 p-3",
        className,
      )}
    >
      <div className="flex items-center justify-between rounded-full border border-white/80 bg-white/80 px-3 py-2 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>
        <div className="rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
          aieasy.in
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-[1.1rem] border border-slate-200/70 bg-white">
        <div
          className={cn(
            "border-b border-slate-200/70 bg-gradient-to-br px-4",
            compact ? "py-4" : "py-5",
            palette.gradient,
          )}
        >
          <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", palette.badge)}>
            {eyebrow}
          </Badge>
          <p
            className={cn(
              "mt-3 font-semibold text-slate-900",
              compact ? "text-sm leading-5" : "text-base leading-6",
            )}
          >
            {title}
          </p>
          <p className={cn("mt-2 text-slate-500", compact ? "text-xs leading-5" : "text-sm leading-6")}>
            {description}
          </p>
        </div>

        <div className={cn("grid gap-2 border-b border-slate-200/70 p-3", compact ? "grid-cols-[1.2fr_0.8fr]" : "grid-cols-[1.15fr_0.85fr]")}>
          <div className={cn("rounded-2xl p-3", palette.tint)}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">
              {statLabel}
            </p>
            <p className={cn("mt-2 font-semibold", compact ? "text-sm" : "text-base")}>
              {statValue}
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-slate-200/70 bg-slate-50 p-3">
            {chips.slice(0, 3).map((chip) => (
              <div
                key={chip}
                className="rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                {chip}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3">
          {columns.slice(0, 3).map((column) => (
            <div
              key={column}
              className="rounded-2xl border border-slate-200/70 bg-slate-50 px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500"
            >
              {column}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
