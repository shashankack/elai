import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

type RazorpayConfirmBody = {
  razorpay_payment_id?: string
  razorpay_order_id?: string
  razorpay_signature?: string
}

/**
 * Attach Checkout.js payment fields to the cart's Razorpay payment session
 * so authorizePayment can verify the HMAC before complete.
 */
export async function POST(
  req: AuthenticatedMedusaRequest<RazorpayConfirmBody>,
  res: MedusaResponse,
) {
  const cartId = req.params.id
  const customerId = req.auth_context?.actor_id
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  } = (req.body || {}) as RazorpayConfirmBody

  if (
    !razorpay_payment_id?.trim() ||
    !razorpay_order_id?.trim() ||
    !razorpay_signature?.trim()
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "razorpay_payment_id, razorpay_order_id, and razorpay_signature are required.",
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const payment = req.scope.resolve(Modules.PAYMENT)

  const { data: carts } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "customer_id",
      "payment_collection.id",
      "payment_collection.payment_sessions.id",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.amount",
      "payment_collection.payment_sessions.currency_code",
      "payment_collection.payment_sessions.data",
      "payment_collection.payment_sessions.status",
    ],
    filters: { id: cartId },
  })

  const cart = carts?.[0] as
    | {
        id: string
        customer_id?: string | null
        payment_collection?: {
          id: string
          payment_sessions?: Array<{
            id: string
            provider_id?: string | null
            amount?: number
            currency_code?: string
            data?: Record<string, unknown> | null
            status?: string
          }>
        } | null
      }
    | undefined

  if (!cart) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Cart ${cartId} not found.`)
  }

  if (customerId && cart.customer_id && cart.customer_id !== customerId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Cart does not belong to the authenticated customer.",
    )
  }

  const session = cart.payment_collection?.payment_sessions?.find((s) =>
    String(s.provider_id || "").includes("razorpay"),
  )

  if (!session?.id || session.amount == null || !session.currency_code) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No Razorpay payment session found on this cart.",
    )
  }

  const existing = (session.data || {}) as Record<string, unknown>
  const sessionOrderId = String(
    existing.razorpay_order_id || existing.id || "",
  )

  if (!sessionOrderId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Razorpay payment session is missing an order id.",
    )
  }

  if (sessionOrderId !== razorpay_order_id.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Razorpay order id does not match the payment session.",
    )
  }

  const amount =
    typeof session.amount === "object" &&
    session.amount &&
    "numeric" in (session.amount as object)
      ? Number((session.amount as { numeric: number }).numeric)
      : Number(session.amount)

  const updated = await payment.updatePaymentSession({
    id: session.id,
    amount,
    currency_code: session.currency_code,
    data: {
      ...existing,
      id: sessionOrderId,
      razorpay_order_id: sessionOrderId,
      razorpay_payment_id: razorpay_payment_id.trim(),
      razorpay_signature: razorpay_signature.trim(),
    },
  })

  res.status(200).json({
    payment_session: updated,
  })
}
