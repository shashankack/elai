import { X } from 'lucide-react'
import Link from 'next/link'

const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'created_at', label: 'Newest' },
  { value: 'title', label: 'Name A–Z' },
  { value: '-title', label: 'Name Z–A' },
] as const

type ShopToolbarProps = {
  count: number
  q?: string
  categoryLabel?: string
  sort?: string
  baseParams: Record<string, string | undefined>
}

function buildHref(
  baseParams: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
) {
  const params = new URLSearchParams()
  const merged = { ...baseParams, ...overrides }
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value)
  }
  params.delete('offset')
  const qs = params.toString()
  return qs ? `/shop?${qs}` : '/shop'
}

export function ShopToolbar({
  count,
  q,
  categoryLabel,
  sort = '',
  baseParams,
}: ShopToolbarProps) {
  const title = categoryLabel
    ? categoryLabel
    : q
      ? `Results for “${q}”`
      : 'All accessories'

  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-[var(--border-color)]/70 pb-6 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="shop-card-enter">
        <p className="font-subheading text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--highlight)]">
          Elai Shop
        </p>
        <h1 className="mt-1 font-heading text-3xl text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="mt-1.5 font-subheading text-sm font-medium text-foreground/60">
          {count} product{count === 1 ? '' : 's'}
          {q && categoryLabel ? ` matching “${q}”` : ''}
        </p>
        {q && (
          <Link
            href={buildHref(baseParams, { q: undefined })}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[#fffef8]/90 px-3 py-1.5 font-subheading text-xs font-semibold text-foreground/75 transition-[transform,background,border-color,color] duration-300 hover:-translate-y-0.5 hover:border-[var(--highlight)] hover:text-foreground"
          >
            <X size={12} strokeWidth={2.5} aria-hidden />
            Clear search “{q}”
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-subheading text-xs font-semibold uppercase tracking-wide text-foreground/45">
          Sort
        </span>
        <div className="flex flex-wrap gap-1.5 rounded-full bg-[#fffef8]/80 p-1 ring-1 ring-[var(--border-color)]">
          {SORT_OPTIONS.map((option) => {
            const active = (sort || '') === option.value
            return (
              <Link
                key={option.value || 'featured'}
                href={buildHref(baseParams, {
                  sort: option.value || undefined,
                })}
                className={`rounded-full px-3.5 py-1.5 font-subheading text-xs font-semibold transition-[transform,background,color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  active
                    ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm'
                    : 'text-foreground/70 hover:bg-white/70 hover:text-foreground'
                }`}
              >
                {option.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
