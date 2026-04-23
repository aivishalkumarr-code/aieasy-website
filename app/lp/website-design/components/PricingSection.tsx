import { Check } from "lucide-react";

const features = [
  "Custom design tailored to your brand",
  "Up to 5 pages included",
  "Mobile responsive design",
  "SEO optimization",
  "Contact form integration",
  "Social media links",
  "Google Maps integration",
  "1-year free hosting",
  "1-year free support",
  "SSL certificate included",
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#1A1A1A] sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[#6B7280]">
            No hidden fees. No surprises. Just great value.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#0D9488] bg-white shadow-2xl">
            {/* Popular Badge */}
            <div className="absolute right-0 top-0">
              <div className="rotate-45 bg-[#0D9488] px-8 py-1 text-center text-xs font-bold text-white shadow-md translate-x-[30%] translate-y-[150%]">
                BEST VALUE
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <div className="mb-6 text-center">
                <p className="mb-2 text-sm font-medium uppercase tracking-wide text-[#6B7280]">
                  Website Design Package
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-medium text-[#6B7280]">₹</span>
                  <span className="text-6xl font-bold text-[#1A1A1A]">9,999</span>
                </div>
                <p className="mt-2 text-sm text-[#6B7280]">Starting price</p>
              </div>

              <ul className="mb-8 space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10">
                      <Check className="h-3 w-3 text-[#0D9488]" />
                    </div>
                    <span className="text-[#6B7280]">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <a
                  href="#contact"
                  className="flex h-14 items-center justify-center rounded-full bg-[#0D9488] text-base font-semibold text-white shadow-lg transition-all hover:bg-[#14B8A6] hover:shadow-xl"
                >
                  Get Started Now
                </a>
                <p className="text-center text-xs text-[#6B7280]">
                  Need more features? Contact us for custom pricing
                </p>
              </div>

              <div className="mt-6 border-t border-[#E5E7EB] pt-6">
                <p className="text-center text-sm text-[#6B7280]">
                  <span className="font-semibold text-[#1A1A1A]">Need more?</span> E-commerce, custom features, or additional pages available at affordable rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
