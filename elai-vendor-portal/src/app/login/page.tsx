import Link from 'next/link'
import { getMercurVendorLoginUrl } from '@/lib/mercur-url'

export default function VendorLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF7D4] px-5 text-[#34421E]">
      <div className="w-full max-w-md rounded-[32px] border border-[#34421E]/10 bg-white/80 p-10 text-center shadow-[0_24px_80px_rgba(52,66,30,0.1)] backdrop-blur-sm">
        <img src="/logo.png" alt="ELAI" className="mx-auto mb-8 h-12 w-auto" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#34421E]/50">
          Vendor portal
        </p>
        <h1 className="mt-2 font-serif text-3xl font-normal">Welcome back</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#34421E]/70">
          Manage your catalog, orders, and payouts in the ELAI vendor dashboard.
        </p>
        <a
          href={getMercurVendorLoginUrl()}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#34421E] px-8 py-3.5 text-sm font-medium text-[#FFF7D4] shadow-[0_8px_24px_rgba(52,66,30,0.18)] transition hover:-translate-y-0.5"
        >
          Continue to dashboard
        </a>
        <p className="mt-6 text-sm text-[#34421E]/55">
          New vendor?{' '}
          <Link href="/register" className="font-medium text-[#34421E] underline underline-offset-4">
            Apply here
          </Link>
        </p>
      </div>
    </div>
  )
}
