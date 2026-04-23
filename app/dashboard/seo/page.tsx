import { getSEOSettings } from "@/app/dashboard/actions/seo";
import { SEOEditor } from "@/app/dashboard/seo/SEOEditor";

export default async function SEOPage() {
  const settings = await getSEOSettings();

  return <SEOEditor initialSettings={settings} />;
}
