import Link from 'next/link'

type ShopStatusProps = {
  title: string
  message: string
}

export function ShopStatus({ title, message }: ShopStatusProps) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-8 text-center">
      <h2 className="font-heading text-2xl text-foreground">{title}</h2>
      <p className="mt-3 font-subheading text-sm leading-relaxed text-foreground/70">
        {message}
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-[var(--highlight)] px-6 py-2.5 font-subheading text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  )
}
