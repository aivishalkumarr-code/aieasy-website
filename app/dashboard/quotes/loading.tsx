import { Skeleton } from "@/components/ui/skeleton";

export default function QuotesLoading() {
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Skeleton className="h-14 w-full max-w-md rounded-2xl" />

      {/* Generator Layout */}
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {/* Left Panel */}
        <div className="space-y-4">
          <Skeleton className="h-16 rounded-2xl" />
          
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-xl" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>

          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>

        {/* Right Panel - PDF Preview */}
        <Skeleton className="h-[700px] rounded-2xl" />
      </div>
    </div>
  );
}
