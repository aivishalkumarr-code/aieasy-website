import { Clock, Smartphone, Search, HeadphonesIcon } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "Your website delivered in 7-14 days. We prioritize speed without compromising quality.",
    highlight: "7-14 Days",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Looks perfect on all devices - desktop, tablet, and mobile. Google mobile-first optimized.",
    highlight: "100% Responsive",
  },
  {
    icon: Search,
    title: "SEO Ready",
    description: "Built with best SEO practices. Fast loading, proper meta tags, and structured data included.",
    highlight: "SEO Optimized",
  },
  {
    icon: HeadphonesIcon,
    title: "1-Year Support",
    description: "Free maintenance and support for a full year. Minor changes included at no extra cost.",
    highlight: "12 Months Free",
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#1A1A1A] sm:text-4xl">
            Why Choose AIeasy?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[#6B7280]">
            We deliver more than just websites. We deliver results.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-[#E5E7EB] bg-white p-6 transition-all hover:border-[#0D9488]/30 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D9488]/10 text-[#0D9488] transition-all group-hover:bg-[#0D9488] group-hover:text-white">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#1A1A1A]">
                {benefit.title}
              </h3>
              <p className="mb-3 text-sm text-[#6B7280]">
                {benefit.description}
              </p>
              <span className="inline-block rounded-full bg-[#0D9488]/10 px-3 py-1 text-xs font-semibold text-[#0D9488]">
                {benefit.highlight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
