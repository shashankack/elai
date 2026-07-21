import Link from 'next/link'

type ShopStatusProps = {
  title: string
  message: string
}

export function ShopStatus({ title, message }: ShopStatusProps) {
  return (
    <div
      className="shop-card-enter mx-auto max-w-lg bg-[var(--card-bg)] p-8 text-center shadow-[0_12px_36px_rgba(46,62,32,0.08)]"
      style={{ borderRadius: 'var(--radius-xl)' }}
    >
      <h2 className="font-heading text-2xl text-foreground">{title}</h2>
      <p className="mt-3 font-subheading text-sm leading-relaxed text-foreground/70">
        {message}
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-[var(--highlight)] px-6 py-2.5 font-subheading text-sm font-semibold text-white shadow-[0_8px_20px_rgba(116,137,86,0.28)] transition-[transform,background] duration-300 hover:-translate-y-0.5 hover:bg-[var(--highlight-dark)]"
      >
        Back to home
      </Link>
    </div>
  )
}
