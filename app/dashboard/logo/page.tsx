import { getLogos } from "@/app/dashboard/actions/logo";
import { LogoClient } from "@/app/dashboard/logo/LogoClient";

export default async function LogoPage() {
  const logos = await getLogos();

  return <LogoClient initialLogos={logos} />;
}
