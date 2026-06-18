import Link from 'next/link'
import { getMercurVendorLoginUrl } from '@/lib/mercur-url'
import { BotanicalDecoration } from '@/components/onboarding/botanical-decoration'

type ThankYouPageProps = {
  searchParams: Promise<{ seller?: string }>
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { seller } = await searchParams

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFF7D4] text-[#34421E]">
      <BotanicalDecoration className="pointer-events-none absolute -left-8 top-0 h-[520px] w-[200px] opacity-50" />
      <BotanicalDecoration className="pointer-events-none absolute -right-12 bottom-0 h-[420px] w-[180px] rotate-180 opacity-40" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16">
        <div className="w-full max-w-lg rounded-[32px] border border-[#34421E]/10 bg-white/80 p-10 text-center shadow-[0_24px_80px_rgba(52,66,30,0.1)] backdrop-blur-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#34421E] text-[#FFF7D4]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12l5 5L19 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#34421E]/50">
            Application received
          </p>
          <h1 className="mt-3 font-serif text-3xl font-normal tracking-[0.02em]">
            You&apos;re on the list
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#34421E]/70">
            Your vendor application{seller ? ` for @${seller}` : ''} is pending ELAI approval.
            We&apos;ll review your GST and bank details, then email you when your store is live.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-[#34421E]/20 bg-white/80 px-6 py-3 text-sm font-medium text-[#34421E] transition hover:border-[#34421E]/35"
            >
              Back to home
            </Link>
            <a
              href={getMercurVendorLoginUrl()}
              className="inline-flex items-center justify-center rounded-full bg-[#34421E] px-6 py-3 text-sm font-medium text-[#FFF7D4] shadow-[0_8px_24px_rgba(52,66,30,0.18)]"
            >
              Vendor dashboard
            </a>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-[#34421E]/50">
            Sign in after approval to add products and manage orders.
          </p>
        </div>
      </div>
    </div>
  )
}
