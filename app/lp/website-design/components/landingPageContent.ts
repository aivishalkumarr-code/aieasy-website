import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Globe2,
  MessageSquare,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
};

export type WebsiteMockup = {
  eyebrow: string;
  title: string;
  description: string;
  chips: string[];
  statLabel: string;
  statValue: string;
  columns: string[];
  accent?: "teal" | "emerald" | "sky" | "cyan" | "slate";
};

export type WebsiteTypeCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  mockup: WebsiteMockup;
};

export type BenefitCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type PortfolioCard = {
  title: string;
  websiteType: string;
  audience: string;
  goal: string;
  linkLabel: string;
  mockup: WebsiteMockup;
};

export type PricingTier = {
  name: string;
  price: string;
  description: string;
  outcome: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

export type TrustCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type ProcessStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const navLinks: NavLink[] = [
  { label: "Benefits", href: "#benefits" },
  { label: "Work", href: "#work" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const heroBenefitBullets = [
  "Starting at ₹9,999",
  "Free Domain & Hosting for 1 Year",
  "SEO-Friendly + Mobile-Ready",
  "Pay Only When Website Goes Live",
] as const;

export const heroTrustPoints = [
  "Google Ads ready",
  "Fast-loading pages",
  "Built for local lead generation",
] as const;

export const formTrustChips = [
  "No Upfront Cost",
  "Free Consultation",
  "Fast Quote",
] as const;

export const websiteTypeOptions = [
  "Business Website",
  "Ecommerce Website",
  "Landing Page",
  "Real Estate Website",
  "Clinic / Service Website",
] as const;

export const websiteTypes: WebsiteTypeCard[] = [
  {
    title: "Business Website",
    description:
      "Ideal for local companies, agencies and consultants that need a polished online presence with clear enquiry paths.",
    icon: Globe2,
    mockup: {
      eyebrow: "Business",
      title: "Clear services and a stronger first impression",
      description: "Position your offer quickly and make contacting you feel easy.",
      chips: ["About", "Services", "Contact"],
      statLabel: "Primary goal",
      statValue: "More quality enquiries",
      columns: ["Proof", "Offer", "FAQ"],
      accent: "teal",
    },
  },
  {
    title: "Ecommerce Website",
    description:
      "Built for stores that need cleaner product pages, faster mobile browsing and smoother paths to checkout.",
    icon: Rocket,
    mockup: {
      eyebrow: "Ecommerce",
      title: "Product-led layouts built to increase orders",
      description: "Feature bestsellers, trust signals and offer blocks without clutter.",
      chips: ["Products", "Offers", "Checkout"],
      statLabel: "Primary goal",
      statValue: "More add-to-cart actions",
      columns: ["Hero", "Grid", "Reviews"],
      accent: "emerald",
    },
  },
  {
    title: "Landing Page",
    description:
      "Perfect for Google Ads campaigns, new launches or service offers that need one focused conversion flow.",
    icon: Zap,
    mockup: {
      eyebrow: "Landing Page",
      title: "Single-page layouts that keep attention on the CTA",
      description: "Every block supports the offer, proof and next action.",
      chips: ["Offer", "Proof", "CTA"],
      statLabel: "Primary goal",
      statValue: "Higher lead conversion",
      columns: ["Benefits", "Pricing", "Form"],
      accent: "sky",
    },
  },
  {
    title: "Real Estate Website",
    description:
      "Designed for consultants, brokers and developers who need premium presentation and WhatsApp-first lead capture.",
    icon: Building2,
    mockup: {
      eyebrow: "Real Estate",
      title: "Property layouts that look premium and feel credible",
      description: "Guide buyers from location highlights to viewing requests.",
      chips: ["Projects", "Plans", "WhatsApp"],
      statLabel: "Primary goal",
      statValue: "Serious buyer enquiries",
      columns: ["Amenities", "Location", "Lead form"],
      accent: "cyan",
    },
  },
  {
    title: "Clinic / Service Website",
    description:
      "A trust-first layout for clinics, home services and appointment-based businesses that depend on calls and bookings.",
    icon: Phone,
    mockup: {
      eyebrow: "Clinic / Service",
      title: "Make booking, calling and trust-building feel immediate",
      description: "Support mobile users with fast actions and reassuring content.",
      chips: ["Treatments", "Reviews", "Book now"],
      statLabel: "Primary goal",
      statValue: "More bookings and calls",
      columns: ["Doctor", "FAQs", "Map"],
      accent: "slate",
    },
  },
];

export const benefits: BenefitCard[] = [
  {
    title: "Clear Business Positioning",
    description:
      "Explain what you do, who you serve and why a Delhi customer should trust you within the first few seconds.",
    icon: Globe2,
  },
  {
    title: "Mobile-First Design",
    description:
      "Every section is planned for fast thumb-scrolling, easy tapping and readable content on smaller screens.",
    icon: Smartphone,
  },
  {
    title: "Lead-Focused Layout",
    description:
      "CTAs, forms, WhatsApp buttons and proof blocks are placed where visitors are most likely to take action.",
    icon: MessageSquare,
  },
  {
    title: "SEO-Ready Structure",
    description:
      "Clean page hierarchy, crawl-friendly content sections and foundational on-page setup help you start strong.",
    icon: Search,
  },
  {
    title: "Fast Loading Pages",
    description:
      "Lightweight layouts, compressed assets and structured sections reduce drop-off from impatient visitors.",
    icon: Zap,
  },
  {
    title: "Google Ads Ready",
    description:
      "Designed to match ad intent, reduce friction and improve the quality of leads coming from paid traffic.",
    icon: Rocket,
  },
];

export const includedItems = [
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

export const portfolioItems: PortfolioCard[] = [
  {
    title: "Real Estate Website",
    websiteType: "Real Estate Website",
    audience: "Consultants, builders and property advisors",
    goal: "Drive site visits, WhatsApp enquiries and project calls",
    linkLabel: "View Example",
    mockup: {
      eyebrow: "Real Estate",
      title: "Premium project showcase with trust-first enquiry paths",
      description: "Location highlights, inventory blocks and instant contact options.",
      chips: ["Projects", "Floor plans", "Visit"],
      statLabel: "Conversion goal",
      statValue: "Schedule a property call",
      columns: ["Gallery", "Map", "Lead form"],
      accent: "teal",
    },
  },
  {
    title: "Ecommerce Website",
    websiteType: "Ecommerce Website",
    audience: "Retail brands and catalog-led stores",
    goal: "Increase product discovery and purchase intent on mobile",
    linkLabel: "View Example",
    mockup: {
      eyebrow: "Ecommerce",
      title: "Storefront layouts that make browsing and buying feel simple",
      description: "Feature collections, reviews and strong offer zones.",
      chips: ["Collections", "Offers", "Reviews"],
      statLabel: "Conversion goal",
      statValue: "Move visitors to checkout",
      columns: ["Hero", "Categories", "Cart"],
      accent: "emerald",
    },
  },
  {
    title: "Clinic Website",
    websiteType: "Clinic Website",
    audience: "Doctors, wellness clinics and appointment-led practices",
    goal: "Build trust and increase appointments from search and ads",
    linkLabel: "View Example",
    mockup: {
      eyebrow: "Clinic",
      title: "Doctor profiles, treatment pages and clear booking actions",
      description: "Support credibility with proof, FAQs and accessible contact options.",
      chips: ["Treatments", "Doctor", "Book"],
      statLabel: "Conversion goal",
      statValue: "Increase appointment requests",
      columns: ["Proof", "FAQ", "Contact"],
      accent: "sky",
    },
  },
  {
    title: "Service Business Website",
    websiteType: "Service Website",
    audience: "Local service providers and growing SMEs",
    goal: "Generate calls, WhatsApp chats and form submissions",
    linkLabel: "View Example",
    mockup: {
      eyebrow: "Service Business",
      title: "Offer-led service pages with fast paths to conversation",
      description: "Bring your pricing, proof and response speed forward.",
      chips: ["Services", "Pricing", "Call now"],
      statLabel: "Conversion goal",
      statValue: "Increase qualified enquiries",
      columns: ["Offer", "Proof", "CTA"],
      accent: "slate",
    },
  },
];

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter Website",
    price: "₹9,999",
    description:
      "For new or local businesses that need a clean, trustworthy website and a fast launch.",
    outcome: "Launch quickly with a professional online presence.",
    features: [
      "Up to 5 core pages",
      "Mobile responsive design",
      "Basic SEO setup",
      "Contact form + WhatsApp button",
      "Free domain & hosting for 1 year",
    ],
    cta: "Choose Starter",
  },
  {
    name: "Business Website",
    price: "₹19,999",
    description:
      "For growing businesses that want better positioning, stronger lead flow and more polished sections.",
    outcome: "Best balance of trust, lead generation and pricing clarity.",
    features: [
      "Up to 10 pages or key sections",
      "Custom homepage and service layout",
      "Lead-focused landing sections",
      "Analytics setup + speed optimization",
      "Priority support for 1 year",
    ],
    cta: "Choose Business",
    featured: true,
  },
  {
    name: "Premium Website",
    price: "₹34,999",
    description:
      "For brands that need larger builds, more content depth or premium design direction for high-value leads.",
    outcome: "A stronger digital presence for serious growth campaigns.",
    features: [
      "Advanced design system and page depth",
      "Higher-content or multi-section website",
      "Custom inquiry flow or premium layout blocks",
      "Enhanced conversion sections",
      "Dedicated launch support",
    ],
    cta: "Choose Premium",
  },
];

export const trustCards: TrustCard[] = [
  {
    title: "Clear Pricing",
    description:
      "You get visible package direction from the start so there is less confusion and faster decision-making.",
    icon: ShieldCheck,
  },
  {
    title: "Fast Communication",
    description:
      "We keep website projects moving with simple next steps, quick responses and direct coordination.",
    icon: Clock,
  },
  {
    title: "Conversion-Focused Design",
    description:
      "Layouts are designed around getting more enquiries, calls and qualified leads instead of decorative clutter.",
    icon: ArrowRight,
  },
  {
    title: "Support After Launch",
    description:
      "You are not left alone after the website goes live. We help with fixes, updates and launch support.",
    icon: CheckCircle2,
  },
];

export const processSteps: ProcessStep[] = [
  {
    title: "Share Your Requirement",
    description:
      "Tell us about your business, offer, audience and what kind of website you need right now.",
    icon: MessageSquare,
  },
  {
    title: "Get Website Plan & Pricing",
    description:
      "We suggest the right website scope, expected pricing direction and the fastest practical launch path.",
    icon: Search,
  },
  {
    title: "Review the Design",
    description:
      "You review the structure and direction before final development so the website aligns with your business goals.",
    icon: Smartphone,
  },
  {
    title: "Launch Your Website",
    description:
      "Once approved, we complete the build, connect essentials and take the website live with support in place.",
    icon: Rocket,
  },
];

export const faqItems: FaqItem[] = [
  {
    question: "How much does website design cost in Delhi?",
    answer:
      "Our website packages start at ₹9,999 for businesses that need a professional launch-ready presence. The final price depends on the number of sections, features, content requirements and whether you need a landing page, business website or a larger custom build.",
  },
  {
    question: "How long does it take to build a website?",
    answer:
      "Most brochure-style or lead generation websites can be planned and launched in about 7 to 14 days once content and approvals move smoothly. Larger websites, ecommerce builds or multi-page projects usually take longer depending on scope.",
  },
  {
    question: "Do you provide domain and hosting?",
    answer:
      "Yes. Our landing page packages are positioned with free domain and hosting for 1 year, so you do not have to coordinate those essentials separately at the start.",
  },
  {
    question: "Will my website be mobile-friendly?",
    answer:
      "Yes. Every layout is designed mobile-first so visitors can read, scroll, call, message and submit enquiries comfortably from their phones.",
  },
  {
    question: "Can you build ecommerce websites?",
    answer:
      "Yes. We design ecommerce websites for businesses that need product catalogs, offer sections, better trust signals and a smoother mobile buying experience.",
  },
  {
    question: "Do I need to pay upfront?",
    answer:
      "No. The page positioning is designed around giving you a clear website plan first. You can review the scope and direction before making a decision.",
  },
];
