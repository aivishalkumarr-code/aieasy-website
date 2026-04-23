export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal Sent" | "Closed";
export type DealStage =
  | "Discovery"
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Won";
export type QuoteStatus = "Draft" | "Sent" | "Accepted" | "Expired";
export type EmailStatus = "queued" | "sent" | "failed";
export type EmailTemplateId =
  | "intro"
  | "proposal_followup"
  | "quote_delivery"
  | "quote_with_accept";
export type ServiceKey =
  | "ai_automation"
  | "ai_web_app"
  | "website_design"
  | "ai_marketing"
  | "ai_content"
  | "software_development"
  | "ivr_setup"
  | "ai_agents"
  | "generative_ai";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
}

export interface Deal {
  id: string;
  title: string;
  contact_id: string;
  value: number;
  stage: DealStage;
  probability: number;
  expected_close_date: string | null;
  notes: string | null;
  created_at?: string;
}

export interface QuoteServiceItem {
  key: ServiceKey;
  label: string;
  description: string;
  basePrice: number;
  customPrice: number;
  notes: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  contact_id: string;
  services: QuoteServiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: QuoteStatus;
  valid_until: string;
  created_at?: string;
  global_notes?: string | null;
}

export interface SentEmail {
  id: string;
  to_email: string;
  to_name: string | null;
  subject: string;
  template: EmailTemplateId | null;
  status: EmailStatus;
  sent_at: string;
}

export interface SEOSetting {
  id: string;
  page_path: string;
  title: string;
  description: string;
  keywords: string;
  og_image: string | null;
}

export interface PartnerLogo {
  id: string;
  name: string;
  image_url: string;
  url: string | null;
  display_order: number;
  created_at?: string;
}

export interface PartnerInput {
  name: string;
  image_url: string;
  url?: string | null;
  display_order: number;
}

export interface ServiceCatalogItem {
  key: ServiceKey;
  label: string;
  description: string;
  price: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  message?: string;
}

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Closed",
];

export const DEAL_STAGES: DealStage[] = [
  "Discovery",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
];

export const QUOTE_STATUSES: QuoteStatus[] = [
  "Draft",
  "Sent",
  "Accepted",
  "Expired",
];

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    key: "ai_automation",
    label: "AI Automation",
    description: "Workflow automation, qualification logic, and system orchestration.",
    price: 75000,
  },
  {
    key: "ai_web_app",
    label: "AI Web Apps",
    description: "Custom AI-powered internal or customer-facing web applications.",
    price: 150000,
  },
  {
    key: "website_design",
    label: "Website Design",
    description: "High-converting responsive website design and implementation.",
    price: 50000,
  },
  {
    key: "ai_marketing",
    label: "AI Marketing",
    description: "Campaign systems, reporting automation, and lead nurturing flows.",
    price: 40000,
  },
  {
    key: "ai_content",
    label: "AI Content",
    description: "SEO content engine, editorial workflows, and content repurposing.",
    price: 25000,
  },
  {
    key: "software_development",
    label: "Software Development",
    description: "Full-stack feature delivery, integrations, and platform engineering.",
    price: 200000,
  },
  {
    key: "ivr_setup",
    label: "IVR Setup",
    description: "Voice assistant setup, call routing, and appointment capture.",
    price: 60000,
  },
  {
    key: "ai_agents",
    label: "AI Agents",
    description:
      "Fully autonomous AI agents that handle complex workflows, decision making, and multi-step tasks.",
    price: 125000,
  },
  {
    key: "generative_ai",
    label: "Generative AI Solutions",
    description:
      "Custom GenAI tools, content engines, image/video generation, and intelligent document processing.",
    price: 110000,
  },
];

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "intro",
    name: "Warm intro",
    subject: "AIeasy next steps for your project",
    body:
      "Hi {{name}},\n\nThanks for exploring AIeasy. I reviewed your requirements and mapped a clear scope for the next phase. I can share a tailored recommendation or jump straight into a short strategy call this week.\n\nBest,\nAIeasy",
  },
  {
    id: "proposal_followup",
    name: "Proposal follow-up",
    subject: "Following up on your AIeasy proposal",
    body:
      "Hi {{name}},\n\nI wanted to follow up on the proposal I sent over. If helpful, I can walk you through the pricing, timeline, and recommended rollout plan in a 20-minute call.\n\nBest,\nAIeasy",
  },
  {
    id: "quote_delivery",
    name: "Quote delivery",
    subject: "Your AIeasy quote is ready",
    body:
      "Hi {{name}},\n\nYour quote is ready. I have attached the pricing summary and key deliverables for review. Let me know if you want alternate service combinations or phased implementation options.\n\nBest,\nAIeasy",
  },
  {
    id: "quote_with_accept",
    name: "Quote with Accept button",
    subject: "Accept Your AIeasy Quote",
    body:
      "Hi {{name}},\n\nYour quote is ready. Click the Accept Quote button to confirm, or review the attached PDF.\n\nBest,\nAIeasy",
  },
];

export const SEO_PAGE_OPTIONS = [
  "/",
  "/about",
  "/services",
  "/blog",
  "/contact",
  "/login",
  "/dashboard",
  "/dashboard/leads",
  "/dashboard/crm",
  "/dashboard/quotes",
  "/dashboard/emails",
  "/dashboard/seo",
  "/dashboard/partners",
] as const;

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const getServiceSubtotal = (services: ServiceKey[]) =>
  services.reduce((total, key) => {
    const service = SERVICE_CATALOG.find((entry) => entry.key === key);
    return total + (service?.price ?? 0);
  }, 0);
