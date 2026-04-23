import { Skeleton } from "@/components/ui/skeleton";

export default function PartnersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>

      <div className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-11 rounded-xl lg:col-span-2" />
          <Skeleton className="h-11 rounded-xl lg:col-span-2" />
        </div>
      </div>

      <div className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
