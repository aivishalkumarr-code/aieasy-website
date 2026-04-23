import { Skeleton } from "@/components/ui/skeleton";

export default function SEOLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-64 rounded-lg" />
        </div>
      </div>

      {/* Tabs */}
      <Skeleton className="h-12 w-64 rounded-xl" />

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
