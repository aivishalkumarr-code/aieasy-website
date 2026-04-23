"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { submitLandingPageLead } from "@/app/lp/website-design/actions/submitLead";
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

import { SuccessMessage } from "./SuccessMessage";

const phoneRegex = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;

const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  businessName: z.string().trim().min(2, "Enter your business name."),
  phone: z
    .string()
    .trim()
    .refine((value) => phoneRegex.test(value.replace(/\s+/g, "")), {
      message: "Enter a valid Indian phone number.",
    }),
  email: z.string().trim().email("Enter a valid email address."),
  message: z.string().trim().max(1000, "Message must be under 1000 characters.").optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface SubmittedLead {
  email: string;
  phone: string;
  calendlyLink: string;
}

export function LeadForm() {
  const [submittedLead, setSubmittedLead] = useState<SubmittedLead | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      businessName: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setSubmissionError(null);

    startTransition(async () => {
      try {
        const response = await submitLandingPageLead(values);

        if (!response.success) {
          setSubmissionError("Something went wrong. Please try again.");
          return;
        }

        setSubmittedLead({
          email: values.email,
          phone: values.phone,
          calendlyLink: response.calendlyLink,
        });
        form.reset();
      } catch {
        setSubmissionError("Something went wrong. Please try again.");
      }
    });
  });

  if (submittedLead) {
    return (
      <SuccessMessage
        email={submittedLead.email}
        phone={submittedLead.phone}
        calendlyLink={submittedLead.calendlyLink}
      />
    );
  }

  return (
    <div className="rounded-[2rem] border border-[#dceae6] bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold tracking-tight text-[#10231f]">
          Share your project details
        </h3>
        <p className="text-sm leading-6 text-[#5f7773]">
          Fill in the details below and our team will get back to you within 24 hours.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#10231f]">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Rahul Sharma"
                      autoComplete="name"
                      className="h-12 rounded-2xl border-[#dceae6] bg-[#fbfefc]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#10231f]">Business Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your Business Pvt. Ltd."
                      autoComplete="organization"
                      className="h-12 rounded-2xl border-[#dceae6] bg-[#fbfefc]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#10231f]">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="tel"
                      placeholder="+91 9876543210"
                      autoComplete="tel"
                      className="h-12 rounded-2xl border-[#dceae6] bg-[#fbfefc]"
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
                  <FormLabel className="text-[#10231f]">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="hello@business.com"
                      autoComplete="email"
                      className="h-12 rounded-2xl border-[#dceae6] bg-[#fbfefc]"
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
                <FormLabel className="text-[#10231f]">Message / Requirements</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your business, preferred style, pages needed, and any features like WhatsApp, forms, payments, or booking."
                    className="min-h-32 rounded-[1.5rem] border-[#dceae6] bg-[#fbfefc]"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {submissionError ? (
            <p className="text-sm font-medium text-destructive" aria-live="polite">
              {submissionError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="h-12 w-full rounded-full bg-[#0d9488] text-sm font-semibold text-white hover:bg-[#0f766e]"
          >
            {isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Sending your quote request...
              </>
            ) : (
              "Get My Free Quote"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
