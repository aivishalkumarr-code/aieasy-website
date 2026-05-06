import { Skeleton } from "@/components/ui/skeleton";

export default function BlogsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <Skeleton className="h-11 rounded-xl lg:col-span-2" />
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-12 rounded-xl" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
