import { getCurrentLogo } from "@/app/dashboard/actions/logo";
import { LogoClient } from "@/app/dashboard/logo/LogoClient";

export default async function LogoPage() {
  const currentLogo = await getCurrentLogo();

  return <LogoClient currentLogo={currentLogo} />;
}
