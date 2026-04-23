import Link from "next/link";

export function LpFooter() {
  return (
    <footer className="border-t border-[#d9ece8] bg-[#fffdf8] py-10">
      <div className="container flex flex-col gap-5 text-sm text-[#5f7773] sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-base font-semibold text-[#10231f]">AIeasy</p>
          <p>Professional website design services based in Delhi, India</p>
          <p>© 2026 AIeasy. All rights reserved.</p>
        </div>

        <Link
          href="#"
          className="font-medium text-[#0d9488] transition-colors hover:text-[#0f766e]"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
