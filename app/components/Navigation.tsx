"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { label: "Services", href: "#services" },
  { label: "Demo", href: "#demo" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
] as const;

export function Navigation() {
  const [open, setOpen] = useState(false);

  const handleNavigate = (href: string) => {
    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    const top = target.getBoundingClientRect().top + window.scrollY - 96;

    window.scrollTo({ top, behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E5E7EB]/80 bg-[#FAFAF8]/90 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
          AIeasy
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleNavigate(link.href)}
              className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#1A1A1A]"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button
            type="button"
            onClick={() => handleNavigate("#contact")}
            className="rounded-full bg-[#0D9488] px-5 hover:bg-[#14B8A6]"
          >
            Start a project
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-[#E5E7EB] bg-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full max-w-xs border-l border-[#E5E7EB] bg-[#FAFAF8]"
          >
            <SheetHeader>
              <SheetTitle className="text-[#1A1A1A]">Navigate</SheetTitle>
            </SheetHeader>
            <div className="mt-10 flex flex-col gap-3">
              {links.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleNavigate(link.href)}
                  className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-left text-sm font-medium text-[#1A1A1A] transition-colors hover:border-[#0D9488] hover:text-[#0D9488]"
                >
                  {link.label}
                </button>
              ))}
              <Button
                type="button"
                onClick={() => handleNavigate("#contact")}
                className="mt-2 rounded-full bg-[#0D9488] hover:bg-[#14B8A6]"
              >
                Start a project
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
