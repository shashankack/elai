import Link from 'next/link'

type ShopPaginationProps = {
  total: number
  limit: number
  offset: number
  baseParams: Record<string, string | undefined>
}

function hrefFor(offset: number, baseParams: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(baseParams)) {
    if (value) params.set(key, value)
  }
  if (offset > 0) params.set('offset', String(offset))
  const qs = params.toString()
  return qs ? `/shop?${qs}` : '/shop'
}

export function ShopPagination({
  total,
  limit,
  offset,
  baseParams,
}: ShopPaginationProps) {
  if (total <= limit) return null

  const page = Math.floor(offset / limit) + 1
  const pageCount = Math.ceil(total / limit)
  const prevOffset = Math.max(0, offset - limit)
  const nextOffset = offset + limit
  const hasPrev = offset > 0
  const hasNext = nextOffset < total

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-color)]/70 pt-6"
      aria-label="Pagination"
    >
      <p className="font-subheading text-sm text-foreground/60">
        Page {page} of {pageCount}
      </p>
      <div className="flex gap-2">
        {hasPrev ? (
          <Link
            href={hrefFor(prevOffset, baseParams)}
            className="rounded-full border border-[var(--border-color)] bg-[#fffef8]/80 px-5 py-2.5 font-subheading text-sm font-semibold text-foreground transition-[transform,border-color,background] duration-300 hover:-translate-y-0.5 hover:border-[var(--highlight)]"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-full px-5 py-2.5 font-subheading text-sm text-foreground/30">
            Previous
          </span>
        )}
        {hasNext ? (
          <Link
            href={hrefFor(nextOffset, baseParams)}
            className="rounded-full bg-[var(--highlight)] px-5 py-2.5 font-subheading text-sm font-semibold text-white shadow-[0_8px_20px_rgba(116,137,86,0.28)] transition-[transform,background] duration-300 hover:-translate-y-0.5 hover:bg-[var(--highlight-dark)]"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-full px-5 py-2.5 font-subheading text-sm text-foreground/30">
            Next
          </span>
        )}
      </div>
    </nav>
  )
}
