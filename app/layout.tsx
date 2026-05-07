import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { PageTransition } from "@/app/components/PageTransition";
import { getLogoByType } from "@/app/dashboard/actions/logo";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const favicon = await getLogoByType("favicon");

  return {
    title: "AIeasy",
    description: "Premium AI solutions company in Delhi.",
    icons: favicon?.url ? { icon: favicon.url } : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-[#FAFAF8] text-[#1A1A1A] antialiased`}>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
