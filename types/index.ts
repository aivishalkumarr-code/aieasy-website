export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal Sent" | "Closed";
export type DealStage =
  | "Discovery"
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Won";
export type QuoteStatus = "Draft" | "Sent" | "Accepted" | "Expired";
export type EmailStatus = "queued" | "sent" | "failed";
export type LogoType = "main" | "favicon" | "og_image";
export type ImageCategory = "Landing Page" | "Hero" | "Portfolio" | "Services" | "Business Types" | "Blog" | "General";
export type PortfolioCategory = "Business" | "Healthcare" | "E-commerce" | "Education" | "Real Estate" | "Hospitality";
export type PortfolioVersion = "v1" | "v2";
export type BlogPostStatus = "draft" | "published" | "scheduled";

export type SnippetPlacement = "head" | "body_start" | "body_end";

export interface MarketingSnippet {
  id: string;
  name: string;
  description: string | null;
  code: string;
  placement: SnippetPlacement;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}


export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at?: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  status: BlogPostStatus;
  scheduled_at: string | null;
  seo_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  keywords: string | null;
  reading_time: number | null;
  category_id: string | null;
  category?: BlogCategory | null;
  tags?: BlogTag[];
  author_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

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
  company: string | null;
  status: LeadStatus;
  notes: string | null;
  source?: string | null;
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

export interface ManagedLogo {
  id: string;
  type: LogoType;
  url: string;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface LogoInput {
  type: LogoType;
  url: string;
  width?: number | null;
  height?: number | null;
  file_size?: number | null;
}

export interface ManagedImage {
  id: string;
  url: string;
  filename: string;
  category: ImageCategory | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at?: string;
}

export interface BusinessTypeImage {
  id: string;
  url: string;
  filename: string;
  category: string;
  width?: number;
  height?: number;
  business_type?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  client_name: string | null;
  name: string;
  category: PortfolioCategory;
  image_url: string;
  image_id?: string | null;
  website_url: string | null;
  live_url: string | null;
  description: string | null;
  stats: Array<{ label: string; value: string }>;
  features: string[];
  display_order: number;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioInput {
  title: string;
  name: string;
  category: PortfolioCategory;
  image_url: string;
  image_id?: string | null;
  website_url?: string | null;
  live_url?: string | null;
  description?: string | null;
  client_name?: string | null;
  stats?: Array<{ label: string; value: string }>;
  features?: string[];
  display_order?: number;
  order_index?: number;
  is_active?: boolean;
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

export const BLOG_POST_STATUSES: BlogPostStatus[] = ["draft", "published", "scheduled"];

export const SNIPPET_PLACEMENTS: SnippetPlacement[] = ["head", "body_start", "body_end"];

export const SNIPPET_PRESETS: Array<{ name: string; description: string; code: string; placement: SnippetPlacement }> = [
  {
    name: "Google Analytics 4",
    description: "Replace G-XXXXXXXXXX with your Measurement ID",
    placement: "head",
    code: `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>`,
  },
  {
    name: "Google Tag Manager",
    description: "Replace GTM-XXXXXX with your Container ID",
    placement: "head",
    code: `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>`,
  },
  {
    name: "Google Search Console",
    description: "Replace CONTENT with your verification meta tag content",
    placement: "head",
    code: `<meta name="google-site-verification" content="CONTENT" />`,
  },
  {
    name: "Meta Pixel (Facebook)",
    description: "Replace XXXXXXXXXX with your Pixel ID",
    placement: "head",
    code: `<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'XXXXXXXXXX');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=XXXXXXXXXX&ev=PageView&noscript=1"
/></noscript>`,
  },
  {
    name: "LinkedIn Insight Tag",
    description: "Replace XXXXXX with your Partner ID",
    placement: "head",
    code: `<script type="text/javascript">
_linkedin_partner_id = "XXXXXX";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script>
<script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt=""
src="https://px.ads.linkedin.com/collect/?pid=XXXXXX&fmt=gif" />
</noscript>`,
  },
  {
    name: "Microsoft Clarity",
    description: "Replace XXXXXX with your Project ID",
    placement: "head",
    code: `<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "XXXXXX");
</script>`,
  },
  {
    name: "Hotjar",
    description: "Replace XXXXXX with your Site ID",
    placement: "head",
    code: `<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:XXXXXX,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>`,
  },
  {
    name: "GTM Body (noscript)",
    description: "Replace GTM-XXXXXX with your Container ID",
    placement: "body_start",
    code: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
  },
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
  "/blog/:slug",
  "/contact",
  "/login",
  "/dashboard",
  "/dashboard/leads",
  "/dashboard/crm",
  "/dashboard/quotes",
  "/dashboard/emails",
  "/dashboard/seo",
  "/dashboard/partners",
  "/dashboard/images",
  "/dashboard/logo",
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
