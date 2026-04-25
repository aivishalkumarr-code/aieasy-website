"use client";

import type { MouseEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ScrollToLeadCtaProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ScrollToLeadCta({
  children,
  className,
  onClick,
}: ScrollToLeadCtaProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onClick?.();

    const target = document.getElementById("contact");
    const firstField = document.getElementById("name") as HTMLInputElement | null;

    if (!target) {
      window.location.hash = "contact";
      return;
    }

    const offset = window.innerWidth < 1024 ? 84 : 96;
    const top = Math.max(window.scrollY + target.getBoundingClientRect().top - offset, 0);

    window.history.replaceState(null, "", "#contact");
    window.scrollTo({ top, behavior: "smooth" });

    window.setTimeout(() => {
      firstField?.focus({ preventScroll: true });
    }, 450);
  };

  return (
    <a href="#contact" onClick={handleClick} className={cn(className)}>
      {children}
    </a>
  );
}
