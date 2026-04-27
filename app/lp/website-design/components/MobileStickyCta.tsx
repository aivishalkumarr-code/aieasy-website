"use client";

import { useEffect, useState } from "react";

import { ScrollToLeadCta } from "./ScrollToLeadCta";

export function MobileStickyCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > 360);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <div
      className={`fixed inset-x-4 bottom-4 z-50 transition-all duration-300 lg:hidden ${
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <ScrollToLeadCta className="flex h-12 items-center justify-center rounded-full bg-[#2563EB] px-6 text-base font-semibold text-white shadow-[0_18px_42px_rgba(15,23,42,0.24)]">
        Get Free Consultation
      </ScrollToLeadCta>
    </div>
  );
}
