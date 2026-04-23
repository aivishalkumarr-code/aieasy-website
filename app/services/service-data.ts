import type { ServiceKey } from "@/types";

import type { ServiceIconName } from "@/app/services/icon-map";

export interface ServicePageBenefit {
  title: string;
  description: string;
  iconName: ServiceIconName;
}

export interface ServicePageMetric {
  value: string;
  label: string;
  context: string;
}

export interface ServicePageData {
  key: ServiceKey;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  iconName: ServiceIconName;
  metaTitle: string;
  metaDescription: string;
  benefits: ServicePageBenefit[];
  steps: string[];
  metrics: ServicePageMetric[];
}

export const SERVICE_PAGE_ORDER = [
  "ai-automation",
  "ai-web-apps",
  "website-design",
  "ai-marketing",
  "ai-content",
  "software-dev",
  "ivr-setup",
  "ai-agents",
  "generative-ai",
] as const;

export const SERVICE_PAGE_DATA = {
  "ai-automation": {
    key: "ai_automation",
    slug: "ai-automation",
    name: "AI Automation",
    tagline: "Automate repetitive work with reliable AI workflows that reduce manual effort and accelerate service delivery.",
    description:
      "We design and deploy AI-led automations that connect your intake, CRM, operations, and reporting systems so your team spends less time on manual follow-up and more time on high-value decisions.",
    iconName: "Workflow",
    metaTitle: "AI Automation Services | AIeasy",
    metaDescription:
      "AIeasy builds AI automation workflows for lead qualification, routing, operations, and internal efficiency.",
    benefits: [
      {
        title: "Faster execution",
        description: "Reduce repetitive admin work and move requests through your funnel without human bottlenecks.",
        iconName: "Zap",
      },
      {
        title: "Reliable handoffs",
        description: "Connect forms, CRMs, inboxes, and dashboards so every lead or request reaches the right team instantly.",
        iconName: "ShieldCheck",
      },
      {
        title: "Clear visibility",
        description: "Track what is automated, what still needs review, and where the next growth opportunity sits.",
        iconName: "BarChart3",
      },
    ],
    steps: [
      "Audit the current workflow, inputs, approvals, and downstream systems.",
      "Design the automation map with AI decision points and human review checkpoints.",
      "Integrate the workflow with your CRM, email, internal tools, and reporting stack.",
      "Launch, monitor, and optimize based on throughput, errors, and conversion impact.",
    ],
    metrics: [
      {
        value: "62%",
        label: "faster response time",
        context: "Typical improvement for inbound qualification and follow-up workflows.",
      },
      {
        value: "12 hrs",
        label: "saved per week",
        context: "Recovered from repetitive admin and coordination work.",
      },
      {
        value: "3.1x",
        label: "more qualified leads",
        context: "When routing and scoring are automated end-to-end.",
      },
    ],
  },
  "ai-web-apps": {
    key: "ai_web_app",
    slug: "ai-web-apps",
    name: "AI Web Apps",
    tagline: "Launch polished AI products and internal tools with production-ready UX, secure auth, and measurable outcomes.",
    description:
      "From client-facing copilots to internal dashboards, we build AI web apps that combine product design, data workflows, model orchestration, and resilient full-stack engineering.",
    iconName: "Globe",
    metaTitle: "AI Web App Development | AIeasy",
    metaDescription:
      "Build AI web apps with AIeasy, from dashboards and copilots to secure client-facing AI platforms.",
    benefits: [
      {
        title: "Product-ready experiences",
        description: "Deliver premium interfaces that feel fast, intuitive, and trustworthy from day one.",
        iconName: "LayoutDashboard",
      },
      {
        title: "Scalable AI architecture",
        description: "Support model orchestration, role-based access, analytics, and future feature expansion.",
        iconName: "Cpu",
      },
      {
        title: "Adoption-focused UX",
        description: "Design flows that help internal teams and customers understand and trust AI outputs.",
        iconName: "Users",
      },
    ],
    steps: [
      "Define the product scope, user journeys, and the AI moments that matter most.",
      "Design the app experience, states, and information architecture around clarity and speed.",
      "Build the front end, back end, integrations, and AI orchestration layer.",
      "Launch with analytics, feedback loops, and a roadmap for iteration.",
    ],
    metrics: [
      {
        value: "2.4x",
        label: "faster support triage",
        context: "Seen in AI-assisted internal dashboards for support operations.",
      },
      {
        value: "48%",
        label: "lower manual review load",
        context: "When AI summaries and recommendations are embedded in workflows.",
      },
      {
        value: "6 weeks",
        label: "typical MVP window",
        context: "For focused launches with a single core workflow.",
      },
    ],
  },
  "website-design": {
    key: "website_design",
    slug: "website-design",
    name: "Website Design",
    tagline: "Design premium, conversion-focused websites that make complex AI offerings easy to understand and trust.",
    description:
      "We create modern high-performance marketing websites with clear messaging, refined layouts, and intentional motion so visitors understand your offer quickly and convert with confidence.",
    iconName: "Palette",
    metaTitle: "Website Design Services | AIeasy",
    metaDescription:
      "Premium website design and implementation for AI, SaaS, and service businesses by AIeasy.",
    benefits: [
      {
        title: "Sharper positioning",
        description: "Turn complex offers into clear, buyer-friendly messaging and page structure.",
        iconName: "Target",
      },
      {
        title: "Better conversion paths",
        description: "Guide visitors toward inquiry, booking, or demo actions with less friction.",
        iconName: "Rocket",
      },
      {
        title: "Performance-first build",
        description: "Ship responsive pages with modern interaction patterns and strong loading performance.",
        iconName: "CheckCircle2",
      },
    ],
    steps: [
      "Clarify audience, positioning, offers, and the conversion journey.",
      "Create wireframes and visual direction aligned to your brand and buyer trust signals.",
      "Build responsive marketing pages with CMS-ready structure and reusable sections.",
      "Refine copy, launch analytics, and optimize based on conversion behavior.",
    ],
    metrics: [
      {
        value: "41%",
        label: "more demo requests",
        context: "Common after sharper positioning and stronger page hierarchy.",
      },
      {
        value: "34%",
        label: "lower bounce rate",
        context: "Driven by better readability, pacing, and visual trust cues.",
      },
      {
        value: "90+",
        label: "performance scores",
        context: "Achievable with disciplined front-end implementation.",
      },
    ],
  },
  "ai-marketing": {
    key: "ai_marketing",
    slug: "ai-marketing",
    name: "AI Marketing",
    tagline: "Scale growth systems with AI-assisted campaign planning, reporting, segmentation, and lead nurturing.",
    description:
      "We help marketing teams combine strategy, automation, and analytics so campaigns move faster, insights arrive sooner, and follow-up stays consistent across channels.",
    iconName: "TrendingUp",
    metaTitle: "AI Marketing Services | AIeasy",
    metaDescription:
      "AIeasy delivers AI marketing systems for campaign execution, reporting, lead nurturing, and growth analytics.",
    benefits: [
      {
        title: "Smarter targeting",
        description: "Use AI-assisted segmentation and signal detection to prioritize high-intent audiences.",
        iconName: "Search",
      },
      {
        title: "Faster campaign loops",
        description: "Compress the time from planning to launch with reusable AI-supported execution systems.",
        iconName: "Zap",
      },
      {
        title: "Stronger reporting",
        description: "Turn fragmented campaign data into executive-ready visibility and action plans.",
        iconName: "BarChart3",
      },
    ],
    steps: [
      "Audit current channels, attribution gaps, and reporting bottlenecks.",
      "Design AI-supported workflows for campaign planning, content production, and nurture logic.",
      "Connect analytics, CRM, and communication tools into one operating system.",
      "Optimize on a weekly cadence using conversion, quality, and pipeline signals.",
    ],
    metrics: [
      {
        value: "3x",
        label: "qualified pipeline lift",
        context: "When lead scoring and nurture flows are aligned to buyer intent.",
      },
      {
        value: "45%",
        label: "faster reporting cycles",
        context: "By automating campaign summaries and performance rollups.",
      },
      {
        value: "28%",
        label: "lower CAC pressure",
        context: "Through tighter targeting and better follow-up orchestration.",
      },
    ],
  },
  "ai-content": {
    key: "ai_content",
    slug: "ai-content",
    name: "AI Content",
    tagline: "Build editorial systems that produce SEO-ready, sales-ready, and brand-aligned content at scale.",
    description:
      "We design AI content engines that help teams move from ad hoc writing to structured briefs, approval loops, repurposing workflows, and search-focused publishing systems.",
    iconName: "FileText",
    metaTitle: "AI Content Services | AIeasy",
    metaDescription:
      "AIeasy creates AI content systems for SEO, editorial workflows, briefs, and multi-channel content repurposing.",
    benefits: [
      {
        title: "Consistent output quality",
        description: "Standardize briefs, voice guidance, and human review steps across every asset.",
        iconName: "ShieldCheck",
      },
      {
        title: "SEO momentum",
        description: "Produce content mapped to search intent, conversion stages, and internal linking goals.",
        iconName: "Search",
      },
      {
        title: "Multi-channel reuse",
        description: "Turn one strategic asset into blogs, newsletters, sales enablement, and social content.",
        iconName: "Layers3",
      },
    ],
    steps: [
      "Map your content goals, funnel stages, topics, and review process.",
      "Create the AI-assisted brief, drafting, QA, and approval workflow.",
      "Build templates for SEO pages, thought leadership, and repurposed assets.",
      "Track output quality, rankings, and conversion performance over time.",
    ],
    metrics: [
      {
        value: "78%",
        label: "organic traffic growth",
        context: "Observed after structured SEO publishing and refresh cycles.",
      },
      {
        value: "4x",
        label: "faster content throughput",
        context: "With reusable research, briefs, and review frameworks.",
      },
      {
        value: "60%",
        label: "less drafting overhead",
        context: "For lean teams publishing across multiple channels.",
      },
    ],
  },
  "software-dev": {
    key: "software_development",
    slug: "software-dev",
    name: "Software Development",
    tagline: "Ship custom software with strong foundations, clean UX, and the integrations your team actually needs.",
    description:
      "We build full-stack systems for operations, service delivery, and customer experience—covering planning, architecture, implementation, and long-term maintainability.",
    iconName: "Code",
    metaTitle: "Software Development Services | AIeasy",
    metaDescription:
      "Custom software development, integrations, and full-stack delivery for modern service businesses.",
    benefits: [
      {
        title: "Built for real operations",
        description: "Design systems around the workflows your team uses every day, not generic templates.",
        iconName: "LayoutDashboard",
      },
      {
        title: "Integration-ready architecture",
        description: "Connect CRMs, internal tools, AI services, and data sources without brittle workarounds.",
        iconName: "Database",
      },
      {
        title: "Maintainable delivery",
        description: "Ship software that your team can extend confidently after launch.",
        iconName: "ShieldCheck",
      },
    ],
    steps: [
      "Define the product scope, technical constraints, and priority workflows.",
      "Plan the architecture, data model, and phased release path.",
      "Build the application, integrations, and operational tooling.",
      "Test, launch, and support the next round of product improvements.",
    ],
    metrics: [
      {
        value: "99.9%",
        label: "uptime targets",
        context: "For stable internal and client-facing delivery systems.",
      },
      {
        value: "52%",
        label: "fewer workflow handoff errors",
        context: "After consolidating fragmented tools into one platform.",
      },
      {
        value: "8 weeks",
        label: "for scoped launches",
        context: "When requirements are prioritized around one critical workflow.",
      },
    ],
  },
  "ivr-setup": {
    key: "ivr_setup",
    slug: "ivr-setup",
    name: "IVR Setup",
    tagline: "Deploy AI-assisted voice journeys that qualify callers, route intent, and capture more appointments automatically.",
    description:
      "We help teams modernize phone workflows with intelligent IVR design, voice qualification, routing logic, and CRM-connected follow-up.",
    iconName: "Phone",
    metaTitle: "IVR Setup Services | AIeasy",
    metaDescription:
      "AIeasy designs and deploys IVR systems for call routing, qualification, appointment capture, and support triage.",
    benefits: [
      {
        title: "Higher routing accuracy",
        description: "Understand caller intent faster and send each conversation to the right destination.",
        iconName: "Phone",
      },
      {
        title: "Better caller experience",
        description: "Replace clunky phone trees with clear flows and AI-assisted qualification prompts.",
        iconName: "MessageSquare",
      },
      {
        title: "Operational insight",
        description: "Track call volumes, conversion points, and missed opportunities in one place.",
        iconName: "BarChart3",
      },
    ],
    steps: [
      "Map your current call journeys, edge cases, and escalation rules.",
      "Design prompts, branching logic, and fallback paths for human handoff.",
      "Integrate the IVR flow with booking, CRM, and support systems.",
      "Monitor recordings, routing outcomes, and conversion performance to optimize the flow.",
    ],
    metrics: [
      {
        value: "91%",
        label: "qualification accuracy",
        context: "For structured call flows tied to real business rules.",
      },
      {
        value: "2x",
        label: "appointment bookings",
        context: "After removing friction and improving call routing logic.",
      },
      {
        value: "38%",
        label: "lower missed-call leakage",
        context: "With smarter routing and after-hours capture flows.",
      },
    ],
  },
  "ai-agents": {
    key: "ai_agents",
    slug: "ai-agents",
    name: "AI Agents",
    tagline: "Create autonomous AI agents that can reason through complex workflows, trigger actions, and keep teams in the loop.",
    description:
      "We design AI agents for multi-step operational work—from onboarding and support to research, triage, and internal execution—so your team can automate beyond simple rules.",
    iconName: "Bot",
    metaTitle: "AI Agents Development | AIeasy",
    metaDescription:
      "AIeasy builds autonomous AI agents for complex workflows, decision making, research, and multi-step task execution.",
    benefits: [
      {
        title: "Autonomous task handling",
        description: "Move beyond chatbots into agents that can plan, decide, and act across systems.",
        iconName: "Bot",
      },
      {
        title: "Human-in-the-loop control",
        description: "Set review gates for sensitive actions while keeping the rest of the workflow automated.",
        iconName: "BrainCircuit",
      },
      {
        title: "Cross-tool orchestration",
        description: "Coordinate CRM, docs, messaging, and internal systems from a single agent workflow.",
        iconName: "Workflow",
      },
    ],
    steps: [
      "Identify the multi-step workflow where AI autonomy can deliver the biggest operational lift.",
      "Define agent goals, constraints, approval logic, and fallback behavior.",
      "Connect the agent to your tools, knowledge sources, and execution endpoints.",
      "Monitor quality, override patterns, and outcomes to improve autonomy safely.",
    ],
    metrics: [
      {
        value: "15 hrs",
        label: "saved weekly per teammate",
        context: "When onboarding and repetitive coordination tasks are agent-run.",
      },
      {
        value: "4.6x",
        label: "faster task completion",
        context: "For structured internal workflows with clear success criteria.",
      },
      {
        value: "24/7",
        label: "workflow coverage",
        context: "Agents can monitor and act outside normal working hours.",
      },
    ],
  },
  "generative-ai": {
    key: "generative_ai",
    slug: "generative-ai",
    name: "Generative AI Solutions",
    tagline: "Build custom GenAI products for content, media, documents, and specialized business workflows.",
    description:
      "We create tailored generative AI systems for branded content, image and video workflows, knowledge extraction, document intelligence, and embedded creative tooling.",
    iconName: "Sparkles",
    metaTitle: "Generative AI Solutions | AIeasy",
    metaDescription:
      "Custom generative AI solutions for content engines, document processing, image generation, and intelligent media workflows.",
    benefits: [
      {
        title: "Custom GenAI workflows",
        description: "Design generation systems around your brand, assets, and operating needs instead of generic prompts.",
        iconName: "Sparkles",
      },
      {
        title: "Document intelligence",
        description: "Extract, classify, summarize, and route information from complex files with precision.",
        iconName: "FileText",
      },
      {
        title: "Creative scale",
        description: "Generate visual and written assets faster while preserving review control and quality standards.",
        iconName: "Layers3",
      },
    ],
    steps: [
      "Define the content, document, or media workflow that needs intelligence and scale.",
      "Design the generation pipeline, review controls, and quality benchmarks.",
      "Integrate models, storage, and interfaces into a usable business workflow.",
      "Measure output quality, turnaround time, and business impact after launch.",
    ],
    metrics: [
      {
        value: "70%",
        label: "faster document processing",
        context: "When extraction, summaries, and routing are AI-assisted.",
      },
      {
        value: "5x",
        label: "creative throughput",
        context: "For teams repurposing branded assets across formats.",
      },
      {
        value: "92%",
        label: "structured data accuracy",
        context: "On well-defined document intelligence use cases.",
      },
    ],
  },
} satisfies Record<string, ServicePageData>;

export const FEATURED_SERVICE_SLUGS = SERVICE_PAGE_ORDER.slice(0, 6) as Array<(typeof SERVICE_PAGE_ORDER)[number]>;

export const getServicePage = (slug: string) =>
  SERVICE_PAGE_DATA[slug as keyof typeof SERVICE_PAGE_DATA];

export const SERVICE_PAGE_LIST = SERVICE_PAGE_ORDER.map(
  (slug) => SERVICE_PAGE_DATA[slug],
);
