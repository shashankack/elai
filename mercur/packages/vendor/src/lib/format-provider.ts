/**
 * Providers only have an ID to identify them. Format into a human-readable label.
 * Example IDs: manual_manual, pp_stripe-blik_dkk
 */
export const formatProvider = (id: string) => {
  if (id === "manual_manual" || id === "manual") {
    return "Manual  you book the courier"
  }

  const parts = id.split("_")
  const name = parts[1] || parts[0] || id
  const type = parts[2]

  return (
    name
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ") + (type ? ` (${type.toUpperCase()})` : "")
  )
}
