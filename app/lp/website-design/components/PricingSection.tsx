import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section className="bg-[#fffdf8] py-20 sm:py-24">
      <div className="container">
        <div className="rounded-[2rem] border border-[#cde6e1] bg-[linear-gradient(135deg,#0d9488_0%,#115e59_100%)] px-6 py-12 text-center text-white shadow-[0_28px_90px_-38px_rgba(13,148,136,0.7)] sm:px-10 sm:py-16">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-white/75">
            Price highlight
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Starting from ₹9,999
          </h2>
          <p className="mt-4 text-lg text-white/80 sm:text-xl">
            One-time payment. No hidden fees.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-full bg-white px-8 font-semibold text-[#0f766e] hover:bg-[#ecf8f6]"
          >
            <Link href="#lead-form">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
