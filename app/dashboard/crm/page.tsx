import { getContacts, getDeals } from "@/app/dashboard/actions/crm";
import { CRMClient } from "@/app/dashboard/crm/CRMClient";

export default async function CRMPage() {
  const [contacts, deals] = await Promise.all([getContacts(), getDeals()]);

  return <CRMClient initialContacts={contacts} initialDeals={deals} />;
}
