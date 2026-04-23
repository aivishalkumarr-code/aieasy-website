"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SERVICE_PAGE_DATA, SERVICE_PAGE_ORDER } from "@/app/services/service-data";

const links = [
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Blog", href: "/#blog" },
  { label: "Contact", href: "/contact" },
] as const;

const serviceLinks = SERVICE_PAGE_ORDER.map((slug) => {
  const data = SERVICE_PAGE_DATA[slug];
  return {
    slug,
    name: data.name,
    tagline: data.tagline,
    href: `/services/${slug}`,
  };
});

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const pathname = usePathname();

  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname !== "/" || !href.startsWith("/#")) {
      setOpen(false);
      return;
    }

    const target = document.querySelector(href.slice(1));

    if (!target) {
      setOpen(false);
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", href);
    setOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E5E7EB]/80 bg-[#FAFAF8]/90 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
          AIeasy
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {/* Services Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setServicesOpen((prev) => !prev)}
              className="flex items-center gap-1 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#1A1A1A]"
              aria-expanded={servicesOpen}
              aria-haspopup="true"
            >
              Services
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  servicesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {servicesOpen && (
              <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                <div className="w-[520px] rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-xl">
                  <div className="grid grid-cols-2 gap-1">
                    {serviceLinks.map((service) => (
                      <Link
                        key={service.slug}
                        href={service.href}
                        onClick={() => setServicesOpen(false)}
                        className="group rounded-xl px-3 py-2.5 transition-colors hover:bg-[#F4F6F2]"
                      >
                        <p className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#0D9488]">
                          {service.name}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-[#6B7280]">
                          {service.tagline}
                        </p>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-[#F3F4F6] pt-2">
                    <Link
                      href="/#services"
                      onClick={(event) => {
                        setServicesOpen(false);
                        handleAnchorClick(event, "/#services");
                      }}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-[#0D9488] hover:bg-[#ECFDF5]"
                    >
                      View all services
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(event) => handleAnchorClick(event, link.href)}
              className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#1A1A1A]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild className="rounded-full bg-[#0D9488] px-5 hover:bg-[#14B8A6]">
            <Link href="/contact">Start a project</Link>
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
              {/* Mobile Services accordion */}
              <div className="rounded-2xl border border-[#E5E7EB] bg-white">
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#1A1A1A]"
                  aria-expanded={mobileServicesOpen}
                >
                  Services
                  <ChevronDown
                    className={`h-4 w-4 text-[#6B7280] transition-transform duration-200 ${
                      mobileServicesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileServicesOpen && (
                  <div className="border-t border-[#F3F4F6] p-2">
                    {serviceLinks.map((service) => (
                      <Link
                        key={service.slug}
                        href={service.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-[#4B5563] hover:bg-[#F4F6F2] hover:text-[#0D9488]"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleAnchorClick(event, link.href)}
                  className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-left text-sm font-medium text-[#1A1A1A] transition-colors hover:border-[#0D9488] hover:text-[#0D9488]"
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="mt-2 rounded-full bg-[#0D9488] hover:bg-[#14B8A6]">
                <Link href="/contact" onClick={() => setOpen(false)}>
                  Start a project
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
