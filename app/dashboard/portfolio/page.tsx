import { getImages } from "@/app/dashboard/actions/images";
import { getPortfolioItems, getPortfolioVersion } from "@/app/dashboard/actions/portfolio";
import { PortfolioItemsClient } from "@/app/dashboard/portfolio/PortfolioItemsClient";
import { PortfolioSettings } from "@/app/dashboard/portfolio/PortfolioSettings";

export default async function PortfolioPage() {
  const [items, version, images] = await Promise.all([getPortfolioItems(), getPortfolioVersion(), getImages()]);

  return (
    <div className="space-y-4">
      <PortfolioSettings initialVersion={version} />
      <PortfolioItemsClient initialItems={items} images={images} />
    </div>
  );
}
