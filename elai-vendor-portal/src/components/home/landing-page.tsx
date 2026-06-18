import Link from "next/link";
import { BotanicalDecoration } from "@/components/onboarding/botanical-decoration";

const HIGHLIGHTS = [
  {
    title: "Curated reach",
    body: "Sell on a marketplace built for taste, not clutter.",
  },
  {
    title: "Simple fees",
    body: "Straightforward economics you keep more of every sale.",
  },
  {
    title: "Fast onboarding",
    body: "Apply in minutes. Go live after ELAI approval.",
  },
];

export default function LandingPage() {
  return (
    <div className="grid h-[100dvh] overflow-hidden bg-[#FFF7D4] text-[#34421E] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="relative flex min-h-0 flex-col justify-between px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
        <BotanicalDecoration className="pointer-events-none absolute -left-6 top-8 h-[280px] w-[120px] opacity-50 lg:h-[360px] lg:w-[150px]" />

        <header className="relative z-10 flex items-center justify-between">
          <img src="/logo.png" alt="ELAI" className="h-9 w-auto sm:h-10" />
          <Link
            href="/login"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#34421E]/65 transition hover:text-[#34421E]"
          >
            Vendor sign in
          </Link>
        </header>

        <div className="relative z-10 my-6 flex flex-1 flex-col justify-center lg:my-0 lg:max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#34421E]/50">
            Vendor portal
          </p>
          <h1 className="mt-4 font-serif text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.05] tracking-[0.01em]">
            Sell elevated essentials on ELAI
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#34421E]/68 sm:text-[15px]">
            Join our curated marketplace. List your catalog, reach customers
            across India, and get paid through ELAI&apos;s vendor settlement
            flow.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#34421E] px-8 py-3.5 text-sm font-medium text-[#FFF7D4] shadow-[0_10px_30px_rgba(52,66,30,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(52,66,30,0.22)]"
            >
              Become a vendor
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-[#34421E]/20 bg-white/50 px-8 py-3.5 text-sm font-medium text-[#34421E] transition hover:border-[#34421E]/35 hover:bg-white/80"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-[#34421E]/55 sm:hidden">
            Curated reach · Simple fees · Fast onboarding
          </p>

          <ul className="mt-8 hidden gap-3 sm:grid sm:grid-cols-3 lg:mt-10">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-[#34421E]/10 bg-white/45 px-4 py-3 backdrop-blur-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#34421E]/80">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#34421E]/58">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <footer className="relative z-10 text-[11px] uppercase tracking-[0.18em] text-[#34421E]/45">
          © 2026 ELAI · Vendor marketplace
        </footer>
      </section>

      <section className="relative hidden min-h-0 overflow-hidden lg:block">
        <div
          className="absolute inset-0 bg-[#34421E]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, rgba(255,247,212,0.12) 0%, transparent 50%)",
          }}
        />
        <img
          src="/main.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#34421E]/55 via-[#34421E]/10 to-transparent" />
        <BotanicalDecoration className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[220px] opacity-20" />

        <div className="absolute bottom-0 left-0 right-0 p-10 text-[#FFF7D4]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FFF7D4]/55">
            Elevated everyday essentials
          </p>
          <p className="mt-3 max-w-sm font-serif text-2xl leading-snug">
            Products chosen with taste — made to stay in your life, not your
            cart.
          </p>
        </div>
      </section>
    </div>
  );
}
