import { ArrowUpRight, BadgeDollarSign, FileText, Mail, Users } from "lucide-react";

import { getContacts, getDeals } from "@/app/dashboard/actions/crm";
import { getSentEmails } from "@/app/dashboard/actions/emails";
import { getQuotes } from "@/app/dashboard/actions/quotes";
import { formatCurrency } from "@/types";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));

export default async function DashboardPage() {
  const [contacts, deals, quotes, sentEmails] = await Promise.all([
    getContacts(),
    getDeals(),
    getQuotes(),
    getSentEmails(),
  ]);

  const openPipeline = deals.filter((deal) => deal.stage !== "Won");
  const pipelineValue = openPipeline.reduce((total, deal) => total + deal.value, 0);
  const quoteValue = quotes.reduce((total, quote) => total + quote.total, 0);
  const closeRate = contacts.length
    ? Math.round((contacts.filter((contact) => contact.status === "Closed").length / contacts.length) * 100)
    : 0;

  const stats = [
    {
      label: "Active leads",
      value: `${contacts.length}`,
      detail: `${closeRate}% lead close rate`,
      icon: Users,
    },
    {
      label: "Pipeline value",
      value: formatCurrency(pipelineValue),
      detail: `${openPipeline.length} open deals`,
      icon: BadgeDollarSign,
    },
    {
      label: "Quotes drafted",
      value: `${quotes.length}`,
      detail: formatCurrency(quoteValue),
      icon: FileText,
    },
    {
      label: "Emails sent",
      value: `${sentEmails.length}`,
      detail: "Template history tracked",
      icon: Mail,
    },
  ];

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#1D4ED8]">
                  Live
                </span>
              </div>
              <p className="mt-6 text-sm text-[#6B7280]">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1A1A1A]">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-[#6B7280]">{stat.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A]">Recent lead activity</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                New and recently updated contacts entering the funnel.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F6F2] px-3 py-1 text-xs font-medium text-[#4B5563]">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Updated daily
            </span>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Company</th>
                  <th className="pb-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {contacts.slice(0, 5).map((contact) => (
                  <tr key={contact.id} className="border-b border-[#F3F4F6] last:border-b-0">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-[#1A1A1A]">{contact.name}</p>
                        <p className="text-[#6B7280]">{contact.email}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#1D4ED8]">
                        {contact.status}
                      </span>
                    </td>
                    <td className="py-4 text-[#4B5563]">{contact.company ?? "—"}</td>
                    <td className="py-4 text-[#4B5563]">{formatDate(contact.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="grid gap-4">
          <article className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Stage distribution</h2>
            <div className="mt-5 space-y-4">
              {["Discovery", "Qualified", "Proposal", "Negotiation", "Won"].map((stage) => {
                const count = deals.filter((deal) => deal.stage === stage).length;
                const share = deals.length ? Math.max((count / deals.length) * 100, count ? 8 : 0) : 0;

                return (
                  <div key={stage}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-[#1A1A1A]">{stage}</span>
                      <span className="text-[#6B7280]">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F1F5F4]">
                      <div
                        className="h-2 rounded-full bg-[#2563EB]"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Recent email sends</h2>
            <div className="mt-5 space-y-4">
              {sentEmails.slice(0, 4).map((email) => (
                <div key={email.id} className="rounded-[1.25rem] bg-[#F8FAF9] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-[#1A1A1A]">{email.subject}</p>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#2563EB]">
                      {email.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#6B7280]">{email.to_email}</p>
                  <p className="mt-2 text-xs text-[#9CA3AF]">{formatDate(email.sent_at)}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
