import { getPortfolioItems, getPortfolioVersion } from "@/app/dashboard/actions/portfolio";
import { PortfolioClient } from "@/app/dashboard/portfolio/PortfolioClient";

export default async function PortfolioPage() {
  const [items, version] = await Promise.all([getPortfolioItems(), getPortfolioVersion()]);

  return <PortfolioClient initialItems={items} initialVersion={version} />;
}
