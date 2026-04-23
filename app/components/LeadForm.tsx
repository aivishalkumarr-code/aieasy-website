"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const services = [
  "AI Automation",
  "AI Web Apps",
  "Website Design",
  "AI Marketing",
  "AI Content",
  "Software Development",
  "IVR Setup",
] as const;

const budgetRanges = [
  "Under $5k",
  "$5k - $10k",
  "$10k - $25k",
  "$25k - $50k",
  "$50k+",
] as const;

const timelines = ["ASAP", "2-4 weeks", "1-2 months", "3+ months"] as const;

const leadFormSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email."),
  company: z.string().min(2, "Enter your company name."),
  serviceInterest: z.enum(services, {
    errorMap: () => ({ message: "Select a service." }),
  }),
  budgetRange: z.enum(budgetRanges, {
    errorMap: () => ({ message: "Select a budget range." }),
  }),
  timeline: z.enum(timelines, {
    errorMap: () => ({ message: "Select a timeline." }),
  }),
  message: z.string().min(20, "Share a bit more about the project."),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const stepFields: Record<1 | 2 | 3, (keyof LeadFormValues)[]> = {
  1: ["name", "email", "company"],
  2: ["serviceInterest"],
  3: ["budgetRange", "timeline", "message"],
};

export function LeadForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
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

  const progress = useMemo(() => `${(currentStep / 3) * 100}%`, [currentStep]);

  const goNext = async () => {
    const isValid = await form.trigger(stepFields[currentStep]);

    if (!isValid || currentStep === 3) {
      return;
    }

    setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
  };

  const goBack = () => {
    if (currentStep === 1) {
      return;
    }

    setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  const onSubmit = form.handleSubmit(() => {
    setIsSubmitted(true);
  });

  if (isSubmitted) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[1.75rem] border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0D9488]/10 text-[#0D9488]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="mt-6 space-y-3">
          <h3 className="text-2xl font-semibold text-[#1A1A1A]">
            Thanks, we&apos;re on it
          </h3>
          <p className="max-w-md text-sm leading-6 text-[#6B7280]">
            Your project brief has been captured. We&apos;ll review the scope and
            reach out with next steps.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            form.reset();
            setCurrentStep(1);
            setIsSubmitted(false);
          }}
          className="mt-6 rounded-full bg-[#0D9488] px-6 hover:bg-[#14B8A6]"
        >
          Start another inquiry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#0D9488]">
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
            className="h-full rounded-full bg-[#0D9488] transition-all duration-300"
            style={{ width: progress }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
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
                      {services.map((service) => (
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
                          {budgetRanges.map((budgetRange) => (
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
                          {timelines.map((timeline) => (
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
                        className="min-h-32 rounded-[1.25rem] border-[#E5E7EB] bg-[#FAFAF8] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={currentStep === 1}
              className="rounded-full border-[#E5E7EB] bg-white px-5 disabled:opacity-50"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={goNext}
                className="rounded-full bg-[#0D9488] px-5 hover:bg-[#14B8A6]"
              >
                Next step
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="rounded-full bg-[#0D9488] px-5 hover:bg-[#14B8A6]"
              >
                Submit inquiry
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
