import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Gauge,
  Ghost,
  HandHeart,
  Headphones,
  MessageSquare,
  Phone,
  Rocket,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Target,
  TrendingDown,
  X,
  Zap,
} from "lucide-react";

import { getPortfolioVersion } from "@/app/dashboard/actions/portfolio";

import { LeadForm } from "./components/LeadForm";
import { LpFooter } from "./components/LpFooter";
import { LpHeader } from "./components/LpHeader";
import { MobileStickyCta } from "./components/MobileStickyCta";
import { PortfolioSection } from "./components/PortfolioSection";
import { PortfolioV2 } from "./components/PortfolioV2";
import { ScrollToLeadCta } from "./components/ScrollToLeadCta";

export const metadata: Metadata = {
  title:
    "Website Design Company in Delhi | Professional Web Design Services - AIeasy",
  description:
    "Leading website design company in Delhi. Get a custom, mobile-friendly, SEO-ready business website starting at ₹9,999. Free domain, hosting & support included.",
  keywords: [
    "website design company Delhi",
    "web design Delhi",
    "website design services",
    "business website Delhi",
    "professional website design",
    "website design company India",
    "AIeasy",
  ],
  openGraph: {
    title: "Website Design Company in Delhi | Professional Web Design Services",
    description:
      "Get a custom business website that generates leads. Starting at ₹9,999 with free domain, hosting & SEO.",
    type: "website",
  },
};

const containerClass = "mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8";

const heroFeatureCards: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Built for Google Ads & SEO",
    description: "Rank higher. Get found.",
    icon: Target,
  },
  {
    title: "Mobile-First Design",
    description: "Looks perfect on every device.",
    icon: Smartphone,
  },
  {
    title: "Lightning Fast",
    description: "Better speed. Better results.",
    icon: Zap,
  },
] as const;

const heroPricingBenefits = [
  "Free Domain & Hosting for 1 Year",
  "SEO-Friendly + Mobile-Ready",
  "Pay Only When Website Goes Live",
] as const;

const heroTrustBadges: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "100% Satisfaction",
    description: "We don't stop until you're happy.",
    icon: ShieldCheck,
  },
  {
    title: "Free Support",
    description: "30 days free support after launch.",
    icon: Headphones,
  },
  {
    title: "On-Time Delivery",
    description: "We respect your time and deadlines.",
    icon: Clock,
  },
  {
    title: "Trusted by Businesses",
    description: "Helping businesses grow across Delhi NCR.",
    icon: HandHeart,
  },
] as const;

const problemItems: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Most Websites Don't Bring Leads",
    description: "Pretty websites mean nothing if they don't generate inquiries or sales.",
    icon: TrendingDown,
  },
  {
    title: "Slow Loading = Lost Customers",
    description:
      "A slow website frustrates visitors and makes them leave — for your competitors.",
    icon: Gauge,
  },
  {
    title: "Developers Disappear After Payment",
    description: "No support, no updates, no response — you're left on your own.",
    icon: Ghost,
  },
] as const;

const solutionItems: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "We Build Conversion-Focused Websites",
    description:
      "Every website we build is designed to attract, engage and convert visitors into customers.",
    icon: Target,
  },
  {
    title: "Fast, Mobile-First, SEO-Ready",
    description:
      "Lightning-fast websites that look perfect on every device and rank higher on Google.",
    icon: Rocket,
  },
  {
    title: "Pay Only When Website Goes Live",
    description: "No upfront payment. You pay only when your website is ready and live.",
    icon: ShieldCheck,
  },
] as const;

const businessTypeCards = [
  {
    title: "Business & Services",
    description: "Generate more leads and inquiries for your business.",
    cta: "Get More Leads",
    image:
      "https://images.unsplash.com/photo-1560472354-b33ef0cb7d21?w=600&h=400&fit=crop",
  },
  {
    title: "Healthcare & Clinics",
    description: "Build trust and increase patient bookings online.",
    cta: "Increase Bookings",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=400&fit=crop",
  },
  {
    title: "E-commerce Stores",
    description: "Sell more with fast, secure and mobile-first stores.",
    cta: "Start Selling Online",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
  },
  {
    title: "Education & Coaching",
    description: "Get more student inquiries and grow your enrollments.",
    cta: "Get More Students",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
  },
  {
    title: "Real Estate",
    description: "Showcase listings beautifully and capture quality leads.",
    cta: "Get More Property Leads",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
  },
  {
    title: "Hospitality & Food Businesses",
    description: "Get more bookings and online orders with ease.",
    cta: "Get More Bookings",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
  },
] as const;

const benefits: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Clear Business Positioning",
    description:
      "We help explain what you offer, who it is for, and why customers should choose you.",
    icon: MessageSquare,
  },
  {
    title: "Mobile-First Design",
    description:
      "Your website is designed to look clean and work smoothly on phones, where most visitors will see it first.",
    icon: Smartphone,
  },
  {
    title: "Lead-Focused Layout",
    description:
      "Calls, WhatsApp, enquiry forms and quote buttons are placed where visitors are most likely to act.",
    icon: Phone,
  },
  {
    title: "SEO-Ready Structure",
    description:
      "Pages are structured with proper headings, service sections and location-focused content.",
    icon: Search,
  },
  {
    title: "Fast Loading Pages",
    description:
      "Clean design, compressed images and lightweight sections help reduce loading delays.",
    icon: Zap,
  },
  {
    title: "Google Ads Ready",
    description:
      "Landing pages can be built to match your ad message, improve clarity and increase enquiry chances.",
    icon: Rocket,
  },
];

const includedItems = [
  "Custom homepage design",
  "Mobile responsive layout",
  "Basic SEO setup",
  "Contact form integration",
  "WhatsApp / call button",
  "Free domain for 1 year",
  "Free hosting for 1 year",
  "Speed optimization",
  "Google Analytics setup",
  "1-year support",
] as const;

const pricingPlans = [
  {
    name: "Starter Website",
    price: "₹9,999",
    badge: undefined,
    description: "Best for new businesses that need a clean online presence.",
    cta: "Start with Starter",
    features: [
      "Up to 5 pages",
      "Mobile responsive design",
      "Contact form",
      "Basic SEO setup",
      "Free domain & hosting for 1 year",
      "1-year support",
    ],
  },
  {
    name: "Business Website",
    price: "₹19,999",
    badge: "Most Popular",
    description:
      "Best for businesses that want more leads, better content and a stronger website structure.",
    cta: "Choose Business Plan",
    features: [
      "Up to 10 pages",
      "Lead generation sections",
      "WhatsApp / call CTA",
      "Advanced SEO structure",
      "Google Analytics setup",
      "Free domain & hosting for 1 year",
      "1-year support",
    ],
  },
  {
    name: "Premium Website",
    price: "₹34,999",
    badge: undefined,
    description:
      "Best for ecommerce, custom layouts, larger websites or businesses that need more functionality.",
    cta: "Discuss Premium Website",
    features: [
      "Custom pages",
      "Ecommerce or advanced functionality",
      "Product/service page structure",
      "Conversion-focused copy sections",
      "Priority support",
      "2-year support",
    ],
  },
] as const;

const trustCards: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Clear Pricing",
    description: "Know the website cost before you start.",
    icon: ShieldCheck,
  },
  {
    title: "Fast Communication",
    description: "Get quick updates during design and development.",
    icon: Clock,
  },
  {
    title: "Conversion-Focused Design",
    description: "Your website is planned around enquiries, not just visuals.",
    icon: Rocket,
  },
  {
    title: "Support After Launch",
    description: "We help with basic updates and guidance after your site goes live.",
    icon: CheckCircle2,
  },
];

const processSteps = [
  {
    title: "Share Your Requirement",
    description:
      "Tell us about your business, services, goals and preferred website style.",
  },
  {
    title: "Get Website Plan & Pricing",
    description:
      "We suggest the right package, content structure and launch timeline.",
  },
  {
    title: "Review the Design",
    description:
      "You review the homepage direction and request changes before final development.",
  },
  {
    title: "Launch Your Website",
    description:
      "Once approved, your website goes live with domain, hosting, forms and basic SEO setup.",
  },
] as const;

const faqs = [
  {
    question: "How much does website design cost in Delhi?",
    answer:
      "Our website packages start from ₹9,999. The final cost depends on the number of pages, features, ecommerce needs and content requirements.",
  },
  {
    question: "How long does it take to build a website?",
    answer:
      "Most business websites can be completed within 7–14 days after content and requirements are confirmed.",
  },
  {
    question: "Do you provide domain and hosting?",
    answer: "Yes, selected packages include free domain and hosting for 1 year.",
  },
  {
    question: "Will my website be mobile-friendly?",
    answer:
      "Yes, every website is designed for mobile, tablet and desktop users.",
  },
  {
    question: "Can you build ecommerce websites?",
    answer:
      "Yes, we can design ecommerce websites with product pages, categories, cart and checkout setup.",
  },
  {
    question: "Do I need to pay upfront?",
    answer:
      "For eligible website packages, you can review the plan first and pay when the website is ready to go live. We’ll confirm the exact payment terms before starting.",
  },
] as const;

function SectionIntro({
  eyebrow,
  title,
  description,
  centered = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-[#475569] md:text-lg">{description}</p>
    </div>
  );
}

function CheckItem({ children }: { children: string }) {
  return (
    <li className="flex gap-3 text-sm leading-6 text-[#475569]">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
      <span>{children}</span>
    </li>
  );
}

function ProblemSolutionSection() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className={containerClass}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
            THE PROBLEM (MOST BUSINESSES FACE)
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl lg:text-[44px]">
            Struggling with Websites That <span className="text-[#2563EB]">Don&apos;t Deliver Results?</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#475569] md:text-lg">
            You&apos;re not alone. Most business owners face these same problems. We&apos;re here to change that.
          </p>
        </div>

        <div className="mt-12 grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr]">
          <article className="h-full rounded-2xl border border-red-100 bg-red-50 p-6 shadow-[0_18px_45px_rgba(127,29,29,0.06)] sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <X className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">The Problems You Face</h3>
                <div className="mt-2 h-1 w-20 rounded-full bg-red-400" />
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {problemItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm ring-1 ring-red-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#0F172A]">{item.title}</h4>
                      <p className="mt-1.5 text-sm leading-6 text-[#64748B]">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#2563EB] shadow-[0_16px_40px_rgba(15,23,42,0.14)] ring-1 ring-blue-100">
              <ChevronRight className="h-7 w-7 rotate-90 lg:rotate-0" />
            </div>
          </div>

          <article className="h-full rounded-2xl border border-green-100 bg-green-50 p-6 shadow-[0_18px_45px_rgba(20,83,45,0.06)] sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">Our Solution</h3>
                <div className="mt-2 h-1 w-20 rounded-full bg-green-400" />
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {solutionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm ring-1 ring-green-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#0F172A]">{item.title}</h4>
                      <p className="mt-1.5 text-sm leading-6 text-[#64748B]">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-blue-50 p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-white text-[#2563EB] shadow-sm">
              <Shield className="h-7 w-7" />
              <span className="absolute bottom-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-white">
                <Check className="h-2.5 w-2.5" />
              </span>
            </div>
            <div className="hidden h-14 w-px bg-blue-100 sm:block" />
            <div>
              <p className="text-lg font-bold leading-snug text-[#0F172A]">
                We don&apos;t just build websites. We build growth engines for your business.
              </p>
              <p className="mt-1 text-sm font-semibold text-[#2563EB]">No risk. No stress. Just results.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BusinessTypeSection() {
  return (
    <section id="business-types" className="bg-[#F8FAFC] py-16 lg:py-24">
      <div className={containerClass}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">CATEGORIES</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl lg:text-[44px]">
            Websites Designed for <span className="text-[#2563EB]">Your Business Type</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#475569] md:text-lg">
            Whether you&apos;re a service provider, clinic, or online store — we build websites that bring real customers.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businessTypeCards.map((card) => (
            <article
              key={card.title}
              className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[3/2] overflow-hidden bg-slate-100">
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-xl font-bold text-[#0F172A]">{card.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#475569]">{card.description}</p>
                <ScrollToLeadCta className="mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold text-[#2563EB] transition-all hover:gap-3 hover:text-[#1D4ED8]">
                  {card.cta} <ArrowRight className="h-4 w-4" />
                </ScrollToLeadCta>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-white text-[#2563EB] shadow-sm">
                <MessageSquare className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-bold leading-snug text-[#0F172A]">
                  Not sure what you need?
                </p>
                <p className="mt-1 text-sm leading-6 text-[#475569]">Let us suggest the perfect website for your business.</p>
              </div>
            </div>
            <div className="hidden h-16 w-px bg-blue-200 lg:block" />
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-start xl:flex-row xl:items-center">
              <ScrollToLeadCta className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] sm:w-auto">
                <Calendar className="h-4 w-4" />
                Get Free Consultation
              </ScrollToLeadCta>
              <p className="inline-flex items-center gap-2 text-sm font-medium text-[#475569]">
                <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                No spam. No pressure. 100% Free.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function WebsiteDesignLandingPage() {
  const portfolioVersion = await getPortfolioVersion();

  return (
    <div className="min-h-screen bg-white text-[#0F172A]">
      <LpHeader />

      <main className="overflow-x-clip pb-20 lg:pb-0">
        <section className="relative overflow-hidden bg-white pb-14 pt-10 lg:pb-20 lg:pt-16">
          <div className={containerClass}>
            <div className="grid items-start gap-y-10 lg:grid-cols-[minmax(0,0.55fr)_minmax(420px,0.45fr)] lg:gap-x-12">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563EB] shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  DELHI&apos;S TRUSTED WEBSITE DESIGN COMPANY
                </div>
                <h1 className="mt-5 max-w-[660px] text-4xl font-bold leading-[1.03] tracking-tight text-[#0F172A] md:text-5xl lg:text-[58px]">
                  Get a Website That Brings You More <span className="block text-[#2563EB]">Business</span>
                </h1>
                <p className="mt-5 max-w-[610px] text-base leading-relaxed text-[#475569] md:text-xl">
                  Custom, mobile-friendly, and SEO-ready websites that convert visitors into customers.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {heroFeatureCards.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <article
                        key={feature.title}
                        className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg shadow-blue-600/20">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 text-sm font-bold leading-snug text-[#0F172A]">{feature.title}</h3>
                        <p className="mt-1.5 text-sm leading-5 text-[#64748B]">{feature.description}</p>
                      </article>
                    );
                  })}
                </div>

                <div className="mt-7 grid gap-5 rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/60 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:grid-cols-[0.9fr_1.1fr] sm:items-center sm:p-6">
                  <div>
                    <p className="text-sm font-semibold text-[#475569]">Complete Website Starting at</p>
                    <p className="mt-1 text-4xl font-extrabold tracking-tight text-[#2563EB] md:text-[44px]">₹9,999*</p>
                  </div>
                  <div className="space-y-3">
                    {heroPricingBenefits.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
                        <span className="text-sm font-semibold leading-6 text-[#334155]">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <ScrollToLeadCta className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] sm:w-auto lg:text-base">
                    Get Free Website Consultation <ArrowRight className="h-4 w-4" />
                  </ScrollToLeadCta>
                  <a
                    href="#pricing"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#CBD5E1] bg-white px-6 text-sm font-semibold text-[#0F172A] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 sm:w-auto lg:text-base"
                  >
                    View Website Packages <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-3 text-sm text-[#64748B]">
                  No upfront payment. Get a clear website plan before you decide.
                </p>
              </div>

              <div className="relative w-full max-w-[530px] justify-self-end self-start lg:pt-2">
                <div className="absolute -inset-8 -z-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.20),rgba(236,253,245,0.45)_38%,rgba(255,255,255,0)_72%)] blur-2xl" />
                <div className="relative z-10">
                  <LeadForm />
                </div>
              </div>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {heroTrustBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <article key={badge.title} className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold leading-tight text-[#0F172A]">{badge.title}</h3>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[#64748B]">{badge.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <ProblemSolutionSection />

        <BusinessTypeSection />

        <section id="benefits" className="bg-white py-12 lg:py-24">
          <div className={containerClass}>
            <SectionIntro
              eyebrow="BUILT TO CONVERT"
              title="Your website should bring enquiries, not just sit online."
              description="We design every page with a clear message, fast mobile experience, strong calls-to-action and trust-building sections, so visitors know why they should contact you."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <article key={benefit.title} className="flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">{benefit.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#475569]">{benefit.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#F8FAFC] py-12 lg:py-24">
          <div className={containerClass}>
            <div className="grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
              <div>
                <SectionIntro
                  eyebrow="WHAT’S INCLUDED"
                  title="Everything You Need to Launch a Professional Website"
                  description="From design to domain, hosting, forms and basic SEO setup — we help you launch with everything required to look professional online."
                  centered={false}
                />
                <ScrollToLeadCta className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2563EB] px-7 text-base font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] sm:w-auto">
                  Get My Free Website Plan
                </ScrollToLeadCta>
              </div>
              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {includedItems.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2563EB]" />
                      <span className="text-sm font-semibold text-[#334155]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {portfolioVersion === "v2" ? <PortfolioV2 /> : <PortfolioSection />}

        <section id="pricing" className="scroll-mt-24 bg-[#F8FAFC] py-12 lg:py-24">
          <div className={containerClass}>
            <SectionIntro
              eyebrow="PRICING"
              title="Simple Website Design Packages"
              description="Choose the website package that matches your business stage. If you’re not sure, we’ll recommend the right option after your free consultation."
            />
            <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan) => {
                const featured = Boolean(plan.badge);
                return (
                  <article
                    key={plan.name}
                    className={`flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition-all ${
                      featured
                        ? "border-[#2563EB] shadow-[0_20px_60px_rgba(37,99,235,0.18)] lg:scale-[1.02]"
                        : "border-[#E2E8F0]"
                    }`}
                  >
                    <div className="flex min-h-7 items-center justify-between gap-3">
                      {plan.badge ? (
                        <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#2563EB]">
                          {plan.badge}
                        </span>
                      ) : (
                        <span />
                      )}
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-[#0F172A]">{plan.name}</h3>
                    <p className="mt-3 text-4xl font-bold tracking-tight text-[#0F172A]">{plan.price}</p>
                    <p className="mt-4 min-h-16 text-sm leading-6 text-[#475569]">{plan.description}</p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {plan.features.map((feature) => (
                        <CheckItem key={feature}>{feature}</CheckItem>
                      ))}
                    </ul>
                    <ScrollToLeadCta
                      className={`mt-8 inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                        featured
                          ? "bg-[#2563EB] text-white shadow-lg shadow-blue-600/20 hover:bg-[#1D4ED8]"
                          : "border border-[#E2E8F0] bg-white text-[#0F172A] hover:border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      {plan.cta}
                    </ScrollToLeadCta>
                  </article>
                );
              })}
            </div>
            <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 rounded-3xl border border-blue-100 bg-white p-6 text-center shadow-sm sm:flex-row sm:justify-between sm:text-left">
              <p className="text-base font-semibold text-[#334155]">
                Not sure which package is right? Get a free recommendation based on your business.
              </p>
              <ScrollToLeadCta className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-[#2563EB] px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] sm:w-auto">
                Get Free Recommendation
              </ScrollToLeadCta>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 lg:py-24">
          <div className={containerClass}>
            <SectionIntro
              eyebrow="WHY CHOOSE AIEASY"
              title="A simple, transparent website design experience."
              description="Work with a team focused on clear scope, clean execution and a website your customers can trust."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {trustCards.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#475569]">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#F8FAFC] py-12 lg:py-24">
          <div className={containerClass}>
            <SectionIntro
              eyebrow="HOW IT WORKS"
              title="A simple 4-step website design process."
              description="From first requirement to launch, you get a clear plan and checkpoints before your website goes live."
            />
            <div className="relative mt-12 grid gap-5 lg:grid-cols-4">
              <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-[#E2E8F0] lg:block" />
              {processSteps.map((step, index) => (
                <article key={step.title} className="relative rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB] text-lg font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)]">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#475569]">{step.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 text-center">
              <ScrollToLeadCta className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2563EB] px-7 text-base font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] sm:w-auto">
                Start My Website Plan
              </ScrollToLeadCta>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 bg-white py-12 lg:py-24">
          <div className={containerClass}>
            <SectionIntro
              eyebrow="FAQ"
              title="Website Design Questions, Answered"
              description="Clear answers before you request your free website plan."
            />
            <div className="mx-auto mt-10 max-w-[820px] space-y-3">
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0} className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[#0F172A] [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] text-[#2563EB] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-[#475569]">{faq.answer}</p>
                </details>
              ))}
            </div>
            <div className="mt-10 text-center">
              <ScrollToLeadCta className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2563EB] px-7 text-base font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] sm:w-auto">
                Get Free Consultation
              </ScrollToLeadCta>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-[1180px] overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 to-blue-500 px-6 py-14 text-center text-white shadow-[0_28px_80px_rgba(37,99,235,0.26)] sm:px-10 lg:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">FINAL CALL TO GROW</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
              Ready to Build a Website That Brings More Enquiries?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/86 md:text-lg">
              Tell us about your business and we’ll suggest the right website package, pricing direction and launch timeline.
            </p>
            <ScrollToLeadCta className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-[#2563EB] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#EFF6FF] sm:w-auto">
              Get Free Website Consultation
            </ScrollToLeadCta>
            <p className="mt-4 text-sm text-white/80">No spam. No pressure. Just a clear website plan.</p>
          </div>
        </section>
      </main>

      <LpFooter />
      <MobileStickyCta />
    </div>
  );
}
