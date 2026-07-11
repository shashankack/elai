import { Spinner } from "@medusajs/icons"
import { Text, clx } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

import { HeadingSkeleton, Skeleton, TextSkeleton } from "@components/common/skeleton"

type RouteModalLoadingProps = {
  /** focus = full-screen modal body; drawer = side panel body */
  variant?: "focus" | "drawer"
  className?: string
  label?: string
}

/**
 * Shown inside RouteFocusModal / RouteDrawer while route data loads,
 * so users never see an empty white overlay.
 */
export const RouteModalLoading = ({
  variant = "focus",
  className,
  label,
}: RouteModalLoadingProps) => {
  const { t } = useTranslation()
  const message = label || t("general.loading")

  if (variant === "drawer") {
    return (
      <div
        className={clx("flex flex-col gap-y-4 px-6 py-6", className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex items-center gap-x-2 text-ui-fg-subtle">
          <Spinner className="animate-spin" />
          <Text size="small">{message}</Text>
        </div>
        <HeadingSkeleton characters={18} />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-2/3 rounded-md" />
        <TextSkeleton size="small" characters={40} />
      </div>
    )
  }

  return (
    <div
      className={clx(
        "flex flex-1 flex-col items-center justify-center gap-y-6 px-6 py-16",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-y-3">
        <Spinner className="text-ui-fg-subtle animate-spin" />
        <Text size="small" className="text-ui-fg-subtle">
          {message}
        </Text>
      </div>
      <div className="flex w-full max-w-[480px] flex-col gap-y-4">
        <Skeleton className="h-8 w-3/4 rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-1/2 rounded-md" />
      </div>
    </div>
  )
}
