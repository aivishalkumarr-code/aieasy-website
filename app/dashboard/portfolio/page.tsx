import { getPortfolioItems } from "@/app/dashboard/actions/portfolio";
import { PortfolioClient } from "@/app/dashboard/portfolio/PortfolioClient";

export default async function PortfolioPage() {
  const items = await getPortfolioItems({ includeInactive: true, useFallback: false });

  return <PortfolioClient initialItems={items} />;
}
