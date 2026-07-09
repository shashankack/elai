import { ReactNode } from "react"

import { ElaiBotanicalDecoration } from "../../onboarding-wizard/elai-botanical-decoration"
import { ElaiOnboardingBrand } from "../../onboarding-wizard/elai-onboarding-brand"

type AuthLayoutProps = {
  children: ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="elai-onboarding-shell relative min-h-dvh bg-[#FFF7D4] text-[#34421E]">
      <ElaiBotanicalDecoration className="pointer-events-none absolute right-0 top-0 hidden h-[420px] w-[180px] opacity-50 md:block" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-14">
        <ElaiOnboardingBrand />

        <div className="elai-onboarding-panel flex flex-1 flex-col border border-[#34421E]/10 bg-white/80 p-6 shadow-[0_16px_48px_rgba(52,66,30,0.07)] sm:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
