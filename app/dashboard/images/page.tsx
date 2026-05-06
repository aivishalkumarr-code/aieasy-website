import { getBusinessTypeImages, getImages } from "@/app/dashboard/actions/images";
import { getPortfolioItems } from "@/app/dashboard/actions/portfolio";
import { ImagesClient } from "@/app/dashboard/images/ImagesClient";

export default async function ImagesPage() {
  const [images, portfolioItems, businessTypeImages] = await Promise.all([
    getImages(),
    getPortfolioItems(),
    getBusinessTypeImages(),
  ]);

  return (
    <ImagesClient
      initialImages={images}
      initialPortfolioItems={portfolioItems}
      initialBusinessTypeImages={businessTypeImages}
    />
  );
}
