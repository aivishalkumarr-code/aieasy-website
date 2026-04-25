"use client";

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type MouseEvent,
} from "react";

import { cn } from "@/lib/utils";

interface ScrollToLeadCtaProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {}

export const ScrollToLeadCta = forwardRef<
  HTMLAnchorElement,
  ScrollToLeadCtaProps
>(({ children, className, href = "#contact", onClick, ...props }, ref) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const hash = href.startsWith("#") ? href.slice(1) : "contact";
    const targetId = hash || "contact";
    const target = document.getElementById(targetId);
    const firstField = document.getElementById("name") as HTMLInputElement | null;

    event.preventDefault();

    if (!target) {
      window.location.hash = targetId;
      return;
    }

    const offset = window.innerWidth < 1024 ? 92 : 104;
    const top = Math.max(
      window.scrollY + target.getBoundingClientRect().top - offset,
      0,
    );

    window.history.replaceState(null, "", `#${targetId}`);
    window.scrollTo({ top, behavior: "smooth" });

    window.setTimeout(() => {
      firstField?.focus({ preventScroll: true });
    }, 420);
  };

  return (
    <a
      ref={ref}
      href={href}
      onClick={handleClick}
      className={cn(className)}
      {...props}
    >
      {children}
    </a>
  );
});

ScrollToLeadCta.displayName = "ScrollToLeadCta";
