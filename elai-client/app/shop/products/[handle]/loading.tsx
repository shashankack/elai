export default function ProductLoading() {
  return (
    <main className="pb-16 md:pb-24" aria-busy="true" aria-label="Loading product">
      <div className="elai-commerce-shell pt-6 md:pt-8">
        <div className="h-4 w-40 animate-pulse rounded-full bg-[var(--foreground)]/10" />
      </div>

      <section className="elai-commerce-shell mt-6 grid items-start gap-8 lg:mt-10 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-3">
          <div
            className="aspect-[3/4] animate-pulse bg-[linear-gradient(160deg,#fffdf0_0%,#f3ecd2_100%)] md:aspect-[4/5]"
            style={{ borderRadius: 'var(--radius-xl)' }}
          />
          <div className="flex gap-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 w-16 animate-pulse bg-[var(--foreground)]/8 md:h-20 md:w-20"
                style={{ borderRadius: 'var(--radius-md)' }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="h-3 w-24 animate-pulse rounded-full bg-[var(--foreground)]/10" />
          <div className="h-10 w-4/5 max-w-md animate-pulse rounded-full bg-[var(--foreground)]/12" />
          <div className="h-8 w-28 animate-pulse rounded-full bg-[var(--foreground)]/10" />
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full animate-pulse rounded-full bg-[var(--foreground)]/8" />
            <div className="h-3 w-5/6 animate-pulse rounded-full bg-[var(--foreground)]/8" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-[var(--foreground)]/8" />
          </div>
          <div className="mt-2 h-12 w-full animate-pulse rounded-full bg-[var(--highlight)]/25" />
        </div>
      </section>
    </main>
  )
}
