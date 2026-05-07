"use client";

interface ScriptInjectorProps {
  html: string;
}

export function MarketingScriptInjector({ html }: ScriptInjectorProps) {
  if (!html.trim()) return null;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
