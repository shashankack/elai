import Link from 'next/link'

export default function ProductNotFound() {
  return (
    <main className="elai-shell py-16 text-center">
      <h1 className="font-heading text-3xl text-foreground">Product not found</h1>
      <p className="mt-3 font-subheading text-sm text-foreground/70">
        This product may have been removed or is not available from an approved
        seller.
      </p>
      <Link
        href="/shop"
        className="mt-6 inline-block rounded-full bg-[var(--highlight)] px-6 py-2.5 font-subheading text-sm font-semibold text-white"
      >
        Browse shop
      </Link>
    </main>
  )
}
