import { z } from "zod";

export const contactServices = [
  "AI Automation",
  "AI Web Apps",
  "Website Design",
  "AI Marketing",
  "AI Content",
  "Software Development",
  "IVR Setup",
  "AI Agents",
  "Generative AI Solutions",
] as const;

export const contactBudgetRanges = [
  "Under $5k",
  "$5k - $10k",
  "$10k - $25k",
  "$25k - $50k",
  "$50k+",
] as const;

export const contactTimelines = [
  "ASAP",
  "2-4 weeks",
  "1-2 months",
  "3+ months",
] as const;

export const contactLeadFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().email("Enter a valid email."),
  company: z.string().trim().min(2, "Enter your company name."),
  serviceInterest: z.enum(contactServices, {
    errorMap: () => ({ message: "Select a service." }),
  }),
  budgetRange: z.enum(contactBudgetRanges, {
    errorMap: () => ({ message: "Select a budget range." }),
  }),
  timeline: z.enum(contactTimelines, {
    errorMap: () => ({ message: "Select a timeline." }),
  }),
  message: z.string().trim().min(20, "Share a bit more about the project."),
});

export type ContactLeadFormValues = z.infer<typeof contactLeadFormSchema>;
