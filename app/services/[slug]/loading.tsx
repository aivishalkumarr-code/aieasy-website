import { Footer } from "@/app/components/Footer";
import { Navigation } from "@/app/components/Navigation";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[#E5E7EB] ${className}`} />;
}

export default function ServicePageLoading() {
  return (
    <>
      <Navigation />
      <main className="pb-24 pt-28">
        <section className="container">
          <div className="rounded-[2rem] border border-[#E5E7EB] bg-white p-8 shadow-card lg:p-12">
            <Skeleton className="h-4 w-40" />
            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
              <div className="space-y-6">
                <Skeleton className="h-14 w-14" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full max-w-2xl" />
                  <Skeleton className="h-8 w-full max-w-3xl" />
                  <Skeleton className="h-24 w-full max-w-3xl" />
                </div>
                <Skeleton className="h-12 w-40 rounded-full" />
              </div>

              <div className="rounded-[1.75rem] border border-[#E5E7EB] bg-[#FAFAF8] p-6">
                <Skeleton className="h-4 w-24" />
                <div className="mt-5 space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[1.25rem] border border-[#E5E7EB] bg-white p-4"
                    >
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="mt-3 h-5 w-32" />
                      <Skeleton className="mt-3 h-16 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-24">
          <Skeleton className="mb-10 h-24 w-full max-w-2xl" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-[#E5E7EB] bg-white p-7 shadow-sm"
              >
                <Skeleton className="h-12 w-12" />
                <Skeleton className="mt-5 h-7 w-40" />
                <Skeleton className="mt-3 h-20 w-full" />
              </div>
            ))}
          </div>
        </section>

        <section className="container pb-24">
          <Skeleton className="mb-10 h-24 w-full max-w-2xl" />
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-[#E5E7EB] bg-white p-7 shadow-sm"
              >
                <Skeleton className="h-4 w-16" />
                <Skeleton className="mt-4 h-16 w-full" />
              </div>
            ))}
          </div>
        </section>

        <section className="container pb-24">
          <Skeleton className="mb-10 h-24 w-full max-w-2xl" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-[#E5E7EB] bg-[#FAFAF8] p-7"
              >
                <Skeleton className="h-10 w-20" />
                <Skeleton className="mt-3 h-6 w-32" />
                <Skeleton className="mt-3 h-20 w-full" />
              </div>
            ))}
          </div>
        </section>

        <section className="container">
          <div className="grid gap-12 rounded-[2rem] border border-[#E5E7EB] bg-white p-8 shadow-card lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:p-10">
            <div className="space-y-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-14 w-full max-w-xl" />
              <Skeleton className="h-24 w-full max-w-2xl" />
              <div className="rounded-[1.5rem] border border-[#E5E7EB] bg-[#FAFAF8] p-6">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-3 h-8 w-48" />
                <Skeleton className="mt-3 h-16 w-full" />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
              <Skeleton className="h-16 w-full" />
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="mt-6 h-32 w-full" />
              <Skeleton className="mt-6 h-12 w-full rounded-full" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
