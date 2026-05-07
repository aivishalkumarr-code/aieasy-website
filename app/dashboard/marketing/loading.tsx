import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>

      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 2 }).map((__, rowIndex) => (
              <Skeleton key={rowIndex} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
