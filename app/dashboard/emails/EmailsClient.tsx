"use client";

import { useMemo, useState, useTransition } from "react";
import { LoaderCircle, SendHorizontal } from "lucide-react";

import { sendEmail } from "@/app/dashboard/actions/emails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EMAIL_TEMPLATES, type EmailTemplateId, type SentEmail } from "@/types";

interface EmailsClientProps {
  initialSentEmails: SentEmail[];
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export function EmailsClient({ initialSentEmails }: EmailsClientProps) {
  const [emails, setEmails] = useState(initialSentEmails);
  const [templateId, setTemplateId] = useState(EMAIL_TEMPLATES[0]?.id ?? "");
  const defaultTemplate = EMAIL_TEMPLATES[0];
  const [toName, setToName] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState(defaultTemplate?.subject ?? "");
  const [body, setBody] = useState(defaultTemplate?.body ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedTemplate = useMemo(
    () => EMAIL_TEMPLATES.find((template) => template.id === templateId) ?? defaultTemplate,
    [templateId, defaultTemplate],
  );

  const handleTemplateChange = (value: string) => {
    setTemplateId(value);
    const template = EMAIL_TEMPLATES.find((entry) => entry.id === value);

    if (!template) {
      return;
    }

    setSubject(template.subject);
    setBody(template.body);
  };

  const handleSend = () => {
    startTransition(async () => {
      const personalizedBody = body.replaceAll("{{name}}", toName || "there");
      const result = await sendEmail({
        toEmail,
        toName,
        subject,
        template: selectedTemplate?.id as EmailTemplateId,
        body: personalizedBody,
      });

      if (!result.success || !result.data) {
        setFeedback(result.message ?? "Unable to send email.");
        return;
      }

      setEmails((current) => [result.data!, ...current]);
      setFeedback(result.message ?? "Email sent.");
    });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-[#1A1A1A]">Compose email</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Start from a template, personalize the copy, and send with Resend.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">Template</label>
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              value={toName}
              onChange={(event) => setToName(event.target.value)}
              placeholder="Recipient name"
              className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
            <Input
              value={toEmail}
              onChange={(event) => setToEmail(event.target.value)}
              placeholder="Recipient email"
              className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
          </div>

          <Input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Email subject"
            className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
          />

          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="min-h-[260px] rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
          />

          {feedback ? <p className="text-sm text-[#0F766E]">{feedback}</p> : null}

          <Button
            type="button"
            disabled={isPending || !toEmail || !subject || !body}
            onClick={handleSend}
            className="h-11 w-full rounded-xl bg-[#0D9488] text-white hover:bg-[#0F766E]"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            Send email
          </Button>
        </div>
      </article>

      <article className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Sent history</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Review delivery status for outbound messages and quote sends.
            </p>
          </div>
          <span className="rounded-full bg-[#F4F6F2] px-3 py-1 text-xs font-medium text-[#4B5563]">
            {emails.length} records
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                <th className="pb-3 font-medium">Recipient</th>
                <th className="pb-3 font-medium">Subject</th>
                <th className="pb-3 font-medium">Template</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Sent at</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr key={email.id} className="border-b border-[#F3F4F6] last:border-b-0">
                  <td className="py-4">
                    <div>
                      <p className="font-medium text-[#1A1A1A]">{email.to_name ?? "Unknown recipient"}</p>
                      <p className="text-[#6B7280]">{email.to_email}</p>
                    </div>
                  </td>
                  <td className="py-4 text-[#4B5563]">{email.subject}</td>
                  <td className="py-4 text-[#4B5563]">{email.template ?? "custom"}</td>
                  <td className="py-4">
                    <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-medium uppercase text-[#0F766E]">
                      {email.status}
                    </span>
                  </td>
                  <td className="py-4 text-[#4B5563]">{formatDate(email.sent_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
