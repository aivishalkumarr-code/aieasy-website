import { getLeads } from "@/app/dashboard/actions/leads";
import { LeadsClient } from "@/app/dashboard/leads/LeadsClient";

export default async function LeadsPage() {
  const leads = await getLeads();

  return <LeadsClient initialLeads={leads} />;
}
