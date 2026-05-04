import { getImages } from "@/app/dashboard/actions/images";
import { ImagesClient } from "@/app/dashboard/images/ImagesClient";

export default async function ImagesPage() {
  const images = await getImages();

  return <ImagesClient initialImages={images} />;
}
