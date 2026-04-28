"use client";

import { useEffect, useRef, useState, type FocusEvent, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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

interface NavigationClientProps {
  logoUrl: string;
}

export function NavigationClient({ logoUrl }: NavigationClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    router.prefetch("/contact");
    serviceLinks.forEach((service) => router.prefetch(service.href));
  }, [router]);

  useEffect(() => {
    setServicesOpen(false);
    setMobileServicesOpen(false);
    setOpen(false);
  }, [pathname]);

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    },
    [],
  );

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openServicesMenu = () => {
    clearCloseTimeout();
    setServicesOpen(true);
  };

  const scheduleServicesClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 120);
  };

  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    setOpen(false);
    setMobileServicesOpen(false);
    setServicesOpen(false);

    if (pathname !== "/" || !href.startsWith("/#")) {
      return;
    }

    const target = document.querySelector(href.slice(1));

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", href);
  };

  const handleDesktopBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    scheduleServicesClose();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E5E7EB]/80 bg-[#FAFAF8]/90 backdrop-blur-xl">
      <div className="container flex h-24 items-center justify-between gap-6">
        <Link href="/" className="flex h-14 w-[220px] shrink-0 items-center md:w-[200px] lg:w-[270px]" aria-label="aicosy home">
          <img
            src={logoUrl}
            alt="aicosy | AI Made Easy"
            className="max-h-14 max-w-full object-contain object-left"
          />
        </Link>

        <nav className="hidden items-center gap-5 lg:gap-8 md:flex">
          <div
            className="relative"
            onMouseEnter={openServicesMenu}
            onMouseLeave={scheduleServicesClose}
            onFocusCapture={openServicesMenu}
            onBlurCapture={handleDesktopBlur}
          >
            <button
              type="button"
              onClick={() => {
                clearCloseTimeout();
                setServicesOpen((prev) => !prev);
              }}
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

            <AnimatePresence>
              {servicesOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 pt-3"
                >
                  <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-xl">
                    <div className="grid grid-cols-2 gap-1">
                      {serviceLinks.map((service) => (
                        <Link
                          key={service.slug}
                          href={service.href}
                          onClick={() => {
                            clearCloseTimeout();
                            setServicesOpen(false);
                          }}
                          className="group rounded-xl px-3 py-2.5 transition-colors hover:bg-[#F4F6F2]"
                        >
                          <p className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#2563EB]">
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
                        onClick={(event) => handleAnchorClick(event, "/#services")}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-[#2563EB] hover:bg-[#EFF6FF]"
                      >
                        View all services
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
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
          <Button asChild className="rounded-full bg-[#2563EB] px-5 hover:bg-[#1D4ED8]">
            <Link href="/contact">Start a project</Link>
          </Button>
        </div>

        <Sheet
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) {
              setMobileServicesOpen(false);
            }
          }}
        >
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
              <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
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
                <AnimatePresence initial={false}>
                  {mobileServicesOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden border-t border-[#F3F4F6]"
                    >
                      <div className="p-2">
                        {serviceLinks.map((service) => (
                          <Link
                            key={service.slug}
                            href={service.href}
                            onClick={() => {
                              setOpen(false);
                              setMobileServicesOpen(false);
                            }}
                            className="block rounded-lg px-3 py-2 text-sm text-[#4B5563] hover:bg-[#F4F6F2] hover:text-[#2563EB]"
                          >
                            {service.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleAnchorClick(event, link.href)}
                  className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-left text-sm font-medium text-[#1A1A1A] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="mt-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8]">
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
