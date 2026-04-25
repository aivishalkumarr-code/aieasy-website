import { Button } from "@/components/ui/button";

import { ScrollToLeadCta } from "./ScrollToLeadCta";

export function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur md:hidden">
      <Button asChild className="h-12 w-full rounded-full bg-[#0D9488] text-sm font-semibold text-white shadow-[0_20px_60px_rgba(15,148,136,0.16)] transition duration-200 hover:bg-[#0F766E]">
        <ScrollToLeadCta>Get Free Consultation</ScrollToLeadCta>
      </Button>
    </div>
  );
}
