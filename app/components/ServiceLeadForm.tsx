"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { submitServiceLead } from "@/app/services/actions/submitServiceLead";
import {
  serviceLeadInputSchema,
  type ServiceLeadInputValues,
} from "@/app/services/serviceLeadFormSchema";
import type {
  ServicePageName,
  ServicePageSlug,
} from "@/app/services/service-data";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const calendlyUrl = "https://calendly.com/aieasy/30min";

interface ServiceLeadFormProps {
  serviceName: ServicePageName;
  serviceSlug: ServicePageSlug;
}

export function ServiceLeadForm({
  serviceName,
  serviceSlug,
}: ServiceLeadFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ServiceLeadInputValues>({
    resolver: zodResolver(serviceLeadInputSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    form.reset({
      name: "",
      email: "",
      company: "",
      message: "",
    });
    setIsSubmitted(false);
    setSubmittedName("");
    setSubmitError(null);
  }, [form, serviceName, serviceSlug]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    const result = await submitServiceLead({
      ...values,
      serviceName,
      serviceSlug,
    });

    if (result.success) {
      setSubmittedName(result.name || values.name);
      setIsSubmitted(true);
      return;
    }

    setSubmitError(result.message || "Something went wrong. Please try again.");
  });

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[520px] flex-col items-center justify-center rounded-[1.75rem] border border-[#E5E7EB] bg-white p-8 text-center shadow-sm"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="mt-6 space-y-3">
          <h3 className="text-2xl font-semibold text-[#1A1A1A]">
            Thanks{submittedName ? `, ${submittedName}` : ""}! Your {serviceName} request is in
          </h3>
          <p className="max-w-md text-sm leading-6 text-[#6B7280]">
            We&apos;ve captured your service inquiry and will follow up with the
            right next step for {serviceName}.
          </p>
        </div>

        <div className="mt-6 w-full max-w-sm rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-5">
          <div className="flex items-center justify-center gap-2 text-[#2563EB]">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">Book Your Free Consultation</span>
          </div>
          <p className="mt-2 text-sm text-[#6B7280]">
            Prefer to move faster? Schedule a 30-minute call with our team.
          </p>
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-11 items-center justify-center rounded-full bg-[#1A1A1A] px-6 text-sm font-semibold text-white transition-all hover:bg-[#333]"
          >
            Book on Calendly
          </a>
        </div>

        <Button
          type="button"
          onClick={() => {
            form.reset();
            setIsSubmitted(false);
            setSubmittedName("");
            setSubmitError(null);
          }}
          className="mt-6 rounded-full bg-[#2563EB] px-6 hover:bg-[#1D4ED8]"
        >
          Submit another inquiry
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[1.75rem] border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8"
    >
      {submitError ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600"
        >
          <p className="font-medium">Error</p>
          <p className="mt-1">{submitError}</p>
        </div>
      ) : null}

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="rounded-[1.5rem] border border-[#E5E7EB] bg-[#FAFAF8] p-5">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#2563EB]">
              Service selected
            </p>
            <Input
              value={serviceName}
              readOnly
              disabled
              className="mt-3 h-12 rounded-2xl border-[#DDE7E3] bg-white text-[#1A1A1A] disabled:cursor-default disabled:bg-white disabled:text-[#1A1A1A] disabled:opacity-100"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1A1A]">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jane Smith"
                      className="h-12 rounded-2xl border-[#E5E7EB] bg-[#FAFAF8]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1A1A]">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="jane@company.com"
                      className="h-12 rounded-2xl border-[#E5E7EB] bg-[#FAFAF8]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1A1A]">Company</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="AIeasy"
                      className="h-12 rounded-2xl border-[#E5E7EB] bg-[#FAFAF8]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1A1A]">Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`Tell us what you want to accomplish with ${serviceName}.`}
                    className="min-h-32 resize-none rounded-[1.25rem] border-[#E5E7EB] bg-[#FAFAF8]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-full bg-[#2563EB] px-6 text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending your inquiry...
              </>
            ) : (
              `Get my ${serviceName} quote`
            )}
          </Button>

          <p className="text-center text-xs text-[#6B7280]">
            We&apos;ll use this service page context in the lead source and our follow-up.
          </p>
        </form>
      </Form>
    </motion.div>
  );
}
