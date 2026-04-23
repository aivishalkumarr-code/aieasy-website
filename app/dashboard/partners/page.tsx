import { getPartners } from "@/app/dashboard/actions/partners";
import { PartnersClient } from "@/app/dashboard/partners/PartnersClient";

export default async function PartnersPage() {
  const partners = await getPartners();

  return <PartnersClient initialPartners={partners} />;
}
