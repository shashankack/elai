import config from "virtual:mercur/config"

import { assetUrl } from "../../utils/asset-url"

type ElaiOnboardingBrandProps = {
  showEyebrow?: boolean
  eyebrow?: string
}

export const ElaiOnboardingBrand = ({
  showEyebrow = true,
  eyebrow = "Vendor application",
}: ElaiOnboardingBrandProps) => {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      {config.logo ? (
        <img
          src={assetUrl(config.logo)}
          alt={config.name ?? "ELAI"}
          className="h-9 w-auto"
        />
      ) : (
        <span className="font-serif text-3xl tracking-wide text-[#34421E]">
          {config.name ?? "ELAI"}
        </span>
      )}
      {showEyebrow && (
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#34421E]/50">
          {eyebrow}
        </p>
      )}
    </div>
  )
}
