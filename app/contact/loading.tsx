import { Footer } from "@/app/components/Footer";
import { Navigation } from "@/app/components/Navigation";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[#E5E7EB] ${className}`} />;
}

export default function ContactLoading() {
  return (
    <>
      <Navigation />
      <main className="pb-24 pt-28">
        <section className="container">
          <div className="max-w-3xl space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full max-w-2xl" />
            <Skeleton className="h-8 w-full max-w-3xl" />
          </div>
        </section>

        <section className="container py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <div className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-24 w-full max-w-xl" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[1.5rem] border border-[#E5E7EB] bg-white p-5 shadow-sm"
                  >
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="mt-5 h-4 w-24" />
                    <Skeleton className="mt-3 h-7 w-full" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="mt-4 h-2 w-full rounded-full" />
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full md:col-span-2" />
              </div>
              <Skeleton className="mt-6 h-24 w-full" />
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Skeleton className="h-11 w-full sm:w-28" />
                <Skeleton className="h-11 w-full sm:w-40" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
