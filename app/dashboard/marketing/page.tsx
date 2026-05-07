import { getMarketingSnippets } from "@/app/dashboard/actions/marketing";
import { MarketingClient } from "@/app/dashboard/marketing/MarketingClient";

export default async function MarketingPage() {
  const snippets = await getMarketingSnippets();

  return <MarketingClient initialSnippets={snippets} />;
}
