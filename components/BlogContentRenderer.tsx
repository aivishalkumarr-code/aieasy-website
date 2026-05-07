import { cn } from "@/lib/utils";

interface BlogContentRendererProps {
  content: string;
  className?: string;
}

export function BlogContentRenderer({ content, className }: BlogContentRendererProps) {
  return (
    <article
      className={cn(
        "max-w-none text-[#1A1A1A]",
        "[&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-4xl [&_h1]:font-bold",
        "[&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-3xl [&_h2]:font-semibold",
        "[&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-2xl [&_h3]:font-semibold",
        "[&_p]:mb-5 [&_p]:leading-8",
        "[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:mb-2",
        "[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[#2563EB] [&_blockquote]:pl-4 [&_blockquote]:italic",
        "[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[#1A1A1A] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-white",
        "[&_code]:font-mono",
        "[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-[#E5E7EB]",
        "[&_th]:border [&_th]:border-[#E5E7EB] [&_th]:bg-[#F8FAFC] [&_th]:p-3 [&_th]:text-left",
        "[&_td]:border [&_td]:border-[#E5E7EB] [&_td]:p-3",
        "[&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl",
        "[&_iframe]:my-6 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-xl",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
