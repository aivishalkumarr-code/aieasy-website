import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { getActiveMarketingSnippets } from "@/app/dashboard/actions/marketing";
import { MarketingScriptInjector } from "@/app/components/MarketingScriptInjector";
import { PageTransition } from "@/app/components/PageTransition";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AIeasy",
  description: "Premium AI solutions company in Delhi.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const snippets = await getActiveMarketingSnippets();

  const headSnippets = snippets
    .filter((snippet) => snippet.placement === "head")
    .sort((a, b) => a.order_index - b.order_index)
    .map((snippet) => snippet.code)
    .join("\n");

  const bodyStartSnippets = snippets
    .filter((snippet) => snippet.placement === "body_start")
    .sort((a, b) => a.order_index - b.order_index)
    .map((snippet) => snippet.code)
    .join("\n");

  const bodyEndSnippets = snippets
    .filter((snippet) => snippet.placement === "body_end")
    .sort((a, b) => a.order_index - b.order_index)
    .map((snippet) => snippet.code)
    .join("\n");

  return (
    <html lang="en">
      <head>
        {headSnippets ? <span dangerouslySetInnerHTML={{ __html: headSnippets }} /> : null}
      </head>
      <body className={`${inter.variable} bg-[#FAFAF8] text-[#1A1A1A] antialiased`}>
        {bodyStartSnippets ? <MarketingScriptInjector html={bodyStartSnippets} /> : null}
        <PageTransition>{children}</PageTransition>
        {bodyEndSnippets ? <MarketingScriptInjector html={bodyEndSnippets} /> : null}
      </body>
    </html>
  );
}
