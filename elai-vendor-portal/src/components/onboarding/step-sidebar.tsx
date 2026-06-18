'use client'

import Link from 'next/link'
import { ONBOARDING_STEPS } from './constants'

type StepSidebarProps = {
  step: number
  progress: number
}

export function StepSidebar({ step, progress }: StepSidebarProps) {
  return (
    <aside className="relative flex flex-col justify-between overflow-hidden border-b border-[#34421E]/10 bg-[#34421E] px-8 py-10 text-[#FFF7D4] lg:min-h-screen lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #FFF7D4 0%, transparent 45%), radial-gradient(circle at 80% 0%, #FFF7D4 0%, transparent 35%)',
        }}
      />

      <div className="relative z-10">
        <Link href="/" className="inline-block">
          <img src="/logo.png" alt="ELAI" className="h-9 w-auto brightness-0 invert opacity-95" />
        </Link>

        <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FFF7D4]/55">
          Vendor application
        </p>
        <h1 className="mt-3 font-serif text-3xl font-normal leading-tight tracking-[0.02em] md:text-[2rem]">
          Join the ELAI
          <br />
          marketplace
        </h1>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#FFF7D4]/72">
          Curated essentials, trusted vendors. Complete four quick steps — we review and
          approve within a few business days.
        </p>

        <div className="mt-10 hidden lg:block">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#FFF7D4]/50">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-[#FFF7D4]/15">
            <div
              className="h-full rounded-full bg-[#FFF7D4] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <ol className="mt-10 space-y-3">
          {ONBOARDING_STEPS.map((item, index) => {
            const done = index < step
            const active = index === step

            return (
              <li
                key={item.id}
                className={`flex items-start gap-3 rounded-2xl px-3 py-3 transition-all duration-300 ${
                  active
                    ? 'bg-[#FFF7D4]/12 ring-1 ring-[#FFF7D4]/15'
                    : done
                      ? 'opacity-90'
                      : 'opacity-45'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    done
                      ? 'bg-[#FFF7D4] text-[#34421E]'
                      : active
                        ? 'bg-[#FFF7D4]/20 text-[#FFF7D4]'
                        : 'bg-[#FFF7D4]/10 text-[#FFF7D4]/70'
                  }`}
                >
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 12l5 5L19 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#FFF7D4]/60">{item.title}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="relative z-10 mt-10 hidden text-xs leading-relaxed text-[#FFF7D4]/50 lg:block">
        <p>Questions? hello@elai.com</p>
        <p className="mt-2">Already approved?</p>
        <Link href="/login" className="mt-1 inline-block text-[#FFF7D4]/85 underline underline-offset-4">
          Sign in to vendor dashboard
        </Link>
      </div>
    </aside>
  )
}
