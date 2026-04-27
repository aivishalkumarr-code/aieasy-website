"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { submitContact } from "@/app/contact/actions/submitContact";
import {
  contactBudgetRanges,
  contactLeadFormSchema,
  contactServices,
  contactTimelines,
  type ContactLeadFormValues,
} from "@/app/contact/contactFormSchema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const calendlyUrl = "https://calendly.com/aieasy/30min";

const stepFields: Record<1 | 2 | 3, (keyof ContactLeadFormValues)[]> = {
  1: ["name", "email", "company"],
  2: ["serviceInterest"],
  3: ["budgetRange", "timeline", "message"],
};

export function LeadForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ContactLeadFormValues>({
    resolver: zodResolver(contactLeadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      serviceInterest: undefined,
      budgetRange: undefined,
      timeline: undefined,
      message: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const progress = `${(currentStep / 3) * 100}%`;

  const goNext = async () => {
    if (isSubmitting) {
      return;
    }

    const isValid = await form.trigger(stepFields[currentStep]);

    if (!isValid || currentStep === 3) {
      return;
    }

    setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
  };

  const goBack = () => {
    if (currentStep === 1 || isSubmitting) {
      return;
    }

    setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      const result = await submitContact(values);

      if (result.success) {
        setSubmittedName(result.name || "");
        setIsSubmitted(true);
        return;
      }

      setSubmitError(result.message || "Something went wrong. Please try again.");
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    }
  });

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[420px] flex-col items-center justify-center rounded-[1.75rem] border border-[#E5E7EB] bg-white p-8 text-center shadow-sm"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="mt-6 space-y-3">
          <h3 className="text-2xl font-semibold text-[#1A1A1A]">
            Thanks{submittedName ? `, ${submittedName}` : ""}! We&apos;re on it
          </h3>
          <p className="max-w-md text-sm leading-6 text-[#6B7280]">
            Your project brief has been captured. We&apos;ll review the scope and
            reach out with next steps.
          </p>
        </div>

        <div className="mt-6 w-full max-w-sm rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-5">
          <div className="flex items-center justify-center gap-2 text-[#2563EB]">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">Book Your Free Consultation</span>
          </div>
          <p className="mt-2 text-sm text-[#6B7280]">
            Skip the wait! Schedule a 30-minute call with our team right now.
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
            setCurrentStep(1);
            setIsSubmitted(false);
            setSubmittedName("");
            setSubmitError(null);
          }}
          className="mt-6 rounded-full bg-[#2563EB] px-6 hover:bg-[#1D4ED8]"
        >
          Start another inquiry
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
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#2563EB]">
              Step {currentStep} of 3
            </p>
            <h3 className="text-2xl font-semibold text-[#1A1A1A]">
              Tell us about the engagement
            </h3>
          </div>
          <div className="text-sm text-[#6B7280]">{progress}</div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
            style={{ width: progress }}
          />
        </div>
      </div>

      {submitError ? (
        <div
          aria-live="polite"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600"
        >
          <p className="font-medium">Error</p>
          <p className="mt-1">{submitError}</p>
        </div>
      ) : null}

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {currentStep === 1 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
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
                      <FormItem className="md:col-span-1">
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
                      <FormItem className="md:col-span-2">
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
              ) : null}

              {currentStep === 2 ? (
                <FormField
                  control={form.control}
                  name="serviceInterest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#1A1A1A]">
                        Service interest
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-2xl border-[#E5E7EB] bg-[#FAFAF8]">
                            <SelectValue placeholder="Select the primary service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-[#E5E7EB] bg-white">
                          {contactServices.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {currentStep === 3 ? (
                <div className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="budgetRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1A1A1A]">
                            Budget range
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-2xl border-[#E5E7EB] bg-[#FAFAF8]">
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-[#E5E7EB] bg-white">
                              {contactBudgetRanges.map((budgetRange) => (
                                <SelectItem key={budgetRange} value={budgetRange}>
                                  {budgetRange}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="timeline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1A1A1A]">Timeline</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-2xl border-[#E5E7EB] bg-[#FAFAF8]">
                                <SelectValue placeholder="Select target timeline" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-[#E5E7EB] bg-white">
                              {contactTimelines.map((timeline) => (
                                <SelectItem key={timeline} value={timeline}>
                                  {timeline}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                            placeholder="Describe the workflow, customer experience, or AI use case you want to improve."
                            className="min-h-32 resize-none rounded-[1.25rem] border-[#E5E7EB] bg-[#FAFAF8]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={currentStep === 1 || isSubmitting}
              className="rounded-full border-[#E5E7EB] bg-white px-5 disabled:opacity-50"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={isSubmitting}
                className="rounded-full bg-[#2563EB] px-5 hover:bg-[#1D4ED8]"
              >
                Next step
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#2563EB] px-5 hover:bg-[#1D4ED8] disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit inquiry"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
