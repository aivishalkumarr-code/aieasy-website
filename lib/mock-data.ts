import {
  EMAIL_TEMPLATES,
  SEO_PAGE_OPTIONS,
  SERVICE_CATALOG,
  getServiceSubtotal,
  type Contact,
  type Deal,
  type Quote,
  type SEOSetting,
  type SentEmail,
} from "@/types";

const contacts: Contact[] = [
  {
    id: "contact-1",
    name: "Aarav Mehta",
    email: "aarav@northstarlabs.ai",
    phone: "+91 98110 32001",
    company: "Northstar Labs",
    status: "New",
    notes: "Interested in an AI automation workflow for inbound qualification.",
    created_at: "2026-04-18T10:15:00.000Z",
  },
  {
    id: "contact-2",
    name: "Sophia Carter",
    email: "sophia@brightframe.co",
    phone: "+1 415 555 0198",
    company: "BrightFrame",
    status: "Qualified",
    notes: "Needs a conversion-focused website redesign and CRM automation.",
    created_at: "2026-04-15T12:30:00.000Z",
  },
  {
    id: "contact-3",
    name: "Ishaan Kapoor",
    email: "ishaan@pulseops.io",
    phone: "+91 98990 11442",
    company: "PulseOps",
    status: "Proposal Sent",
    notes: "Comparing AIeasy with another vendor for a dashboard build.",
    created_at: "2026-04-12T08:45:00.000Z",
  },
  {
    id: "contact-4",
    name: "Maya Chen",
    email: "maya@atlasgrowth.com",
    phone: "+1 646 555 2040",
    company: "Atlas Growth",
    status: "Contacted",
    notes: "Wants SEO content engine and meta optimization support.",
    created_at: "2026-04-10T14:10:00.000Z",
  },
  {
    id: "contact-5",
    name: "Rohan Gupta",
    email: "rohan@callpilot.in",
    phone: "+91 99587 66543",
    company: "CallPilot",
    status: "Closed",
    notes: "Closed after IVR discovery workshop and implementation scope.",
    created_at: "2026-04-06T09:00:00.000Z",
  },
];

const deals: Deal[] = [
  {
    id: "deal-1",
    title: "Northstar qualification automation",
    contact_id: "contact-1",
    value: 7800,
    stage: "Discovery",
    probability: 35,
    expected_close_date: "2026-05-06",
    notes: "Waiting on integration list and sales handoff flow.",
    created_at: "2026-04-18T10:20:00.000Z",
  },
  {
    id: "deal-2",
    title: "BrightFrame growth website",
    contact_id: "contact-2",
    value: 9400,
    stage: "Proposal",
    probability: 70,
    expected_close_date: "2026-04-30",
    notes: "Proposal delivered with phased launch option.",
    created_at: "2026-04-16T13:00:00.000Z",
  },
  {
    id: "deal-3",
    title: "PulseOps ops dashboard",
    contact_id: "contact-3",
    value: 15600,
    stage: "Negotiation",
    probability: 82,
    expected_close_date: "2026-05-14",
    notes: "Legal review in progress.",
    created_at: "2026-04-12T09:30:00.000Z",
  },
  {
    id: "deal-4",
    title: "Atlas SEO workflow",
    contact_id: "contact-4",
    value: 5100,
    stage: "Qualified",
    probability: 55,
    expected_close_date: "2026-05-09",
    notes: "Needs SEO ownership matrix before approval.",
    created_at: "2026-04-10T14:30:00.000Z",
  },
  {
    id: "deal-5",
    title: "CallPilot IVR deployment",
    contact_id: "contact-5",
    value: 8600,
    stage: "Won",
    probability: 100,
    expected_close_date: "2026-04-05",
    notes: "Won and moving into implementation.",
    created_at: "2026-04-04T11:00:00.000Z",
  },
];

const quotes: Quote[] = [
  {
    id: "quote-1",
    quote_number: "AE-240401",
    contact_id: "contact-2",
    services: ["website_design", "ai_marketing"],
    subtotal: getServiceSubtotal(["website_design", "ai_marketing"]),
    tax_rate: 18,
    tax_amount: Math.round(getServiceSubtotal(["website_design", "ai_marketing"]) * 0.18),
    total:
      getServiceSubtotal(["website_design", "ai_marketing"]) +
      Math.round(getServiceSubtotal(["website_design", "ai_marketing"]) * 0.18),
    status: "Sent",
    valid_until: "2026-05-08",
    created_at: "2026-04-08T15:20:00.000Z",
  },
  {
    id: "quote-2",
    quote_number: "AE-240402",
    contact_id: "contact-3",
    services: ["ai_web_app", "software_development"],
    subtotal: getServiceSubtotal(["ai_web_app", "software_development"]),
    tax_rate: 18,
    tax_amount: Math.round(getServiceSubtotal(["ai_web_app", "software_development"]) * 0.18),
    total:
      getServiceSubtotal(["ai_web_app", "software_development"]) +
      Math.round(getServiceSubtotal(["ai_web_app", "software_development"]) * 0.18),
    status: "Draft",
    valid_until: "2026-05-12",
    created_at: "2026-04-12T16:40:00.000Z",
  },
];

const sentEmails: SentEmail[] = [
  {
    id: "email-1",
    to_email: "sophia@brightframe.co",
    to_name: "Sophia Carter",
    subject: EMAIL_TEMPLATES[1].subject,
    template: EMAIL_TEMPLATES[1].id,
    status: "sent",
    sent_at: "2026-04-19T08:30:00.000Z",
  },
  {
    id: "email-2",
    to_email: "ishaan@pulseops.io",
    to_name: "Ishaan Kapoor",
    subject: EMAIL_TEMPLATES[2].subject,
    template: EMAIL_TEMPLATES[2].id,
    status: "sent",
    sent_at: "2026-04-17T17:10:00.000Z",
  },
];

const seoSettings: SEOSetting[] = SEO_PAGE_OPTIONS.map((pagePath, index) => ({
  id: `seo-${index + 1}`,
  page_path: pagePath,
  title: pagePath === "/" ? "AIeasy | Premium AI solutions" : `AIeasy ${pagePath}`,
  description:
    pagePath === "/"
      ? "AIeasy designs, automates, and ships AI experiences for service businesses."
      : `Metadata controls and search settings for ${pagePath}.`,
  keywords:
    pagePath === "/"
      ? "AI automation, web apps, CRM, SEO, quotes"
      : `AIeasy, ${pagePath.replaceAll("/", " ").trim() || "home"}, SEO`,
  og_image: "/og-default.png",
}));

export const getMockContacts = () => contacts.map((contact) => ({ ...contact }));
export const getMockDeals = () => deals.map((deal) => ({ ...deal }));
export const getMockQuotes = () => quotes.map((quote) => ({ ...quote, services: [...quote.services] }));
export const getMockSentEmails = () => sentEmails.map((email) => ({ ...email }));
export const getMockSEOSettings = () => seoSettings.map((setting) => ({ ...setting }));

export const getMockQuoteServices = (serviceKeys: Quote["services"]) =>
  SERVICE_CATALOG.filter((service) => serviceKeys.includes(service.key));
