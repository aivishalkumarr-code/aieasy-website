import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LpHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#d9ece8]/90 bg-[#fffdf8]/90 backdrop-blur">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link href="/lp/website-design" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0d9488] text-sm font-semibold text-white shadow-sm">
            AI
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-[#10231f]">AIeasy</p>
            <p className="text-xs text-[#5f7773]">Website design &amp; development</p>
          </div>
        </Link>

        <Button
          asChild
          className="rounded-full bg-[#0d9488] px-5 text-sm font-semibold text-white hover:bg-[#0f766e]"
        >
          <Link href="#lead-form">Get Your Free Quote</Link>
        </Button>
      </div>
    </header>
  );
}
