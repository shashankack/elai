import { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { ElaiBotanicalDecoration } from "./elai-botanical-decoration"
import { ElaiOnboardingBrand } from "./elai-onboarding-brand"
import { TOTAL_STEPS, WIZARD_STEPS } from "./constants"

type ElaiOnboardingShellProps = {
  children: ReactNode
  currentStep?: number
  showSteps?: boolean
  onBack?: () => void
  showBack?: boolean
  mobileStepLabel?: string
}

export const ElaiOnboardingShell = ({
  children,
  currentStep = 0,
  showSteps = true,
  onBack,
  showBack,
  mobileStepLabel,
}: ElaiOnboardingShellProps) => {
  const { t } = useTranslation()
  const progress = showSteps
    ? ((currentStep + 1) / TOTAL_STEPS) * 100
    : 25
  const stepMeta = showSteps ? WIZARD_STEPS[currentStep] : null

  return (
    <div className="elai-onboarding-shell relative min-h-dvh bg-[#FFF7D4] text-[#34421E]">
      <ElaiBotanicalDecoration className="pointer-events-none absolute right-0 top-0 hidden h-[420px] w-[180px] opacity-50 md:block" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-14">
        <ElaiOnboardingBrand />

        {showSteps && (
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#34421E]/50">
              <span>
                {t("onboarding.wizard.stepOf", {
                  current: currentStep + 1,
                  total: TOTAL_STEPS,
                })}
                {mobileStepLabel ? ` · ${mobileStepLabel}` : ""}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[#34421E]/10">
              <div
                className="h-full rounded-full bg-[#34421E] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 self-start text-sm text-[#34421E]/60 underline-offset-4 transition hover:text-[#34421E] hover:underline"
          >
            {t("actions.back")}
          </button>
        )}

        {stepMeta && (
          <div className="elai-onboarding-step-header text-center sm:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#34421E]/50">
              {t(stepMeta.labelKey)}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-normal tracking-[0.02em] sm:text-4xl">
              {t(`onboarding.wizard.elai.stepTitles.${stepMeta.id}`)}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#34421E]/65 sm:mx-0">
              {t(`onboarding.wizard.elai.stepDescriptions.${stepMeta.id}`)}
            </p>
          </div>
        )}

        <div className="elai-onboarding-panel mt-8 flex flex-1 flex-col border border-[#34421E]/10 bg-white/80 p-6 shadow-[0_16px_48px_rgba(52,66,30,0.07)] sm:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
