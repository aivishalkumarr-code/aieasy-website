import { getSentEmails } from "@/app/dashboard/actions/emails";
import { EmailsClient } from "@/app/dashboard/emails/EmailsClient";

export default async function EmailsPage() {
  const sentEmails = await getSentEmails();

  return <EmailsClient initialSentEmails={sentEmails} />;
}
