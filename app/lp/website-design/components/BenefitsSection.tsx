import { Clock3, Headphones, Search, Smartphone } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    title: "Fast Delivery",
    description: "Your website live in 7-14 days",
    icon: Clock3,
  },
  {
    title: "Mobile Responsive",
    description: "Perfect on every device",
    icon: Smartphone,
  },
  {
    title: "SEO Ready",
    description: "Built to rank on Google",
    icon: Search,
  },
  {
    title: "1-Year Support",
    description: "Free maintenance & updates",
    icon: Headphones,
  },
] as const;

export function BenefitsSection() {
  return (
    <section className="bg-[#fffdf8] py-16 sm:py-20">
      <div className="container">
        <div className="mb-10 max-w-2xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0d9488]">
            Why businesses choose AIeasy
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-[#10231f] sm:text-4xl">
            Everything you need for a faster, better website launch
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <Card
                key={benefit.title}
                className="rounded-[1.5rem] border-[#dceae6] bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecf8f6] text-[#0d9488]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#10231f]">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5f7773]">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
