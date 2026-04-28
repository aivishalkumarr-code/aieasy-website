import { getMainLogoUrl } from "@/app/dashboard/actions/logo";
import { NavigationClient } from "@/app/components/NavigationClient";

export async function Navigation() {
  const logoUrl = await getMainLogoUrl();

  return <NavigationClient logoUrl={logoUrl} />;
}
