import { getContacts } from "@/app/dashboard/actions/crm";
import { getQuotes } from "@/app/dashboard/actions/quotes";
import { QuotesClient } from "@/app/dashboard/quotes/QuotesClient";

export default async function QuotesPage() {
  const [contacts, quotes] = await Promise.all([getContacts(), getQuotes()]);

  return <QuotesClient initialContacts={contacts} initialQuotes={quotes} />;
}
