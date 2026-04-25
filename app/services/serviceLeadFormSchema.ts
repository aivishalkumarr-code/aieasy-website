import { z } from "zod";

import {
  getServicePage,
  SERVICE_PAGE_NAMES,
  SERVICE_PAGE_ORDER,
} from "@/app/services/service-data";

export const serviceLeadInputSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().email("Enter a valid email."),
  company: z.string().trim().min(2, "Enter your company name."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
  message: z.string().trim().min(20, "Share a bit more about the project."),
});

export const serviceLeadFormSchema = serviceLeadInputSchema
  .extend({
    serviceName: z.enum(SERVICE_PAGE_NAMES, {
      errorMap: () => ({ message: "Select a service." }),
    }),
    serviceSlug: z.enum(SERVICE_PAGE_ORDER, {
      errorMap: () => ({ message: "Invalid service page." }),
    }),
  })
  .superRefine((values, context) => {
    const service = getServicePage(values.serviceSlug);

    if (!service || service.name !== values.serviceName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["serviceName"],
        message: "Select a valid service.",
      });
    }
  });

export type ServiceLeadInputValues = z.infer<typeof serviceLeadInputSchema>;
export type ServiceLeadFormValues = z.infer<typeof serviceLeadFormSchema>;
