import { Skeleton } from "@/components/ui/skeleton";

export default function TodoLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-72 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-[1.5rem]" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-9 rounded-xl" />
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-28 rounded-[1.25rem]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
