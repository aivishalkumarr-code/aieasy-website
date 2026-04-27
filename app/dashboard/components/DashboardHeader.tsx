"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { DashboardSidebar } from "@/app/dashboard/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Overview",
    description: "Track pipeline health, quote velocity, and outbound activity.",
  },
  "/dashboard/leads": {
    title: "Leads management",
    description: "Filter, qualify, and update inbound leads with clear statuses.",
  },
  "/dashboard/crm": {
    title: "CRM",
    description: "Manage contacts and move deals through the pipeline.",
  },
  "/dashboard/quotes": {
    title: "Quotes",
    description: "Generate pricing, preview PDFs, and send quotes quickly.",
  },
  "/dashboard/emails": {
    title: "Email system",
    description: "Compose emails from reusable templates and review history.",
  },
  "/dashboard/seo": {
    title: "SEO tools",
    description: "Edit metadata and OG settings across primary pages.",
  },
  "/dashboard/partners": {
    title: "Partners",
    description: "Manage deployment platform logos shown on the homepage.",
  },
};

interface DashboardHeaderProps {
  userEmail: string;
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const pathname = usePathname();
  const current = pageMeta[pathname] ?? pageMeta["/dashboard"];

  return (
    <header className="flex items-start justify-between gap-4 rounded-[2rem] border border-[#DDE7E3] bg-white px-5 py-4 shadow-card sm:px-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#2563EB]">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-3xl">
          {current.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
          {current.description}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-2xl border border-[#DDE7E3] bg-[#FAFAF8] px-4 py-3 text-right sm:block">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#2563EB]">
            Signed in as
          </p>
          <p className="mt-1 text-sm font-medium text-[#1A1A1A]">{userEmail}</p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-[#DDE7E3] bg-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] max-w-sm border-[#DDE7E3] bg-[#FAFAF8] p-4">
            <SheetHeader className="sr-only">
              <SheetTitle>Dashboard navigation</SheetTitle>
            </SheetHeader>
            <DashboardSidebar className="h-full shadow-none" />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
