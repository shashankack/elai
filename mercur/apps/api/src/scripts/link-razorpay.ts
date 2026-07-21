/**
 * Link Razorpay (+ system) payment providers to the India / INR region.
 *
 * Usage (from mercur/apps/api):
 *   bun run link:razorpay -- --force
 *
 * Requires RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET so the provider is registered
 * in medusa-config (pp_razorpay_razorpay). Always keeps pp_system_default.
 */
import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

const RAZORPAY_PROVIDER_ID = "pp_razorpay_razorpay"
const SYSTEM_PROVIDER_ID = "pp_system_default"

export default async function linkRazorpay({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const force = (args ?? []).some((a) => a === "force" || a === "--force")

  if (!force) {
    logger.error(
      "Refusing without --force. Example: bun run link:razorpay -- --force",
    )
    return
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    logger.warn(
      "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. " +
        "Provider will not be registered until keys exist and the API restarts. " +
        "Still linking system payment on India region.",
    )
  }

  const regionModule = container.resolve(Modules.REGION)
  const regions = await regionModule.listRegions(
    {},
    { relations: ["countries"], take: 50 },
  )

  const india =
    regions.find(
      (r) =>
        r.currency_code?.toLowerCase() === "inr" ||
        r.countries?.some((c) => c.iso_2 === "in"),
    ) || regions[0]

  if (!india) {
    logger.error("No region found. Run seed first.")
    return
  }

  const providers = [SYSTEM_PROVIDER_ID]
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    providers.push(RAZORPAY_PROVIDER_ID)
  }

  logger.info(
    `Linking payment providers to region ${india.name} (${india.id}): ${providers.join(", ")}`,
  )

  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: india.id },
      update: {
        payment_providers: providers,
      },
    },
  })

  logger.info("=== link:razorpay complete ===")
}
