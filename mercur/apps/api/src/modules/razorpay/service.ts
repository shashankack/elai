import {
  AbstractPaymentProvider,
  BigNumber,
  MathBN,
  MedusaError,
  isDefined,
} from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import crypto from "node:crypto"
import Razorpay from "razorpay"

type RazorpayOptions = {
  key_id: string
  key_secret: string
  webhook_secret?: string
  /**
   * Auto-capture on Razorpay order creation (1 = capture immediately).
   * Default: 1
   */
  payment_capture?: 0 | 1
}

type InjectedDependencies = {
  logger: Logger
}

type RazorpaySessionData = {
  id: string
  razorpay_order_id: string
  amount: number
  currency: string
  key_id: string
  razorpay_payment_id?: string
  razorpay_signature?: string
}

function toNumber(amount: InitiatePaymentInput["amount"]): number {
  if (typeof amount === "number") return amount
  if (typeof amount === "string") return Number(amount)
  if (amount && typeof amount === "object" && "numeric" in amount) {
    return Number((amount as { numeric: number }).numeric)
  }
  return Number(amount)
}

/** Medusa passes major units; Razorpay expects paise for INR. */
function toSmallestUnit(amount: InitiatePaymentInput["amount"], currency: string): number {
  const major = toNumber(amount)
  const code = currency.toUpperCase()
  const zeroDecimal = new Set([
    "BIF",
    "CLP",
    "DJF",
    "GNF",
    "JPY",
    "KMF",
    "KRW",
    "MGA",
    "PYG",
    "RWF",
    "UGX",
    "VND",
    "VUV",
    "XAF",
    "XOF",
    "XPF",
  ])
  if (zeroDecimal.has(code)) {
    return Math.round(major)
  }
  return Math.round(new BigNumber(MathBN.mult(major, 100)).numeric)
}

function fromSmallestUnit(amount: number, currency: string): number {
  const code = currency.toUpperCase()
  const zeroDecimal = new Set([
    "BIF",
    "CLP",
    "DJF",
    "GNF",
    "JPY",
    "KMF",
    "KRW",
    "MGA",
    "PYG",
    "RWF",
    "UGX",
    "VND",
    "VUV",
    "XAF",
    "XOF",
    "XPF",
  ])
  if (zeroDecimal.has(code)) return amount
  return new BigNumber(MathBN.div(amount, 100)).numeric
}

class RazorpayProviderService extends AbstractPaymentProvider<RazorpayOptions> {
  static identifier = "razorpay"

  protected logger_: Logger
  protected options_: RazorpayOptions
  protected client_: Razorpay

  constructor(container: InjectedDependencies, options: RazorpayOptions) {
    // @ts-expect-error AbstractPaymentProvider constructor typing
    super(container, options)
    this.logger_ = container.logger
    this.options_ = options
    this.client_ = new Razorpay({
      key_id: options.key_id,
      key_secret: options.key_secret,
    })
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!isDefined(options.key_id)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay option `key_id` is required.",
      )
    }
    if (!isDefined(options.key_secret)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay option `key_secret` is required.",
      )
    }
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const { amount, currency_code, context } = input
    const currency = (currency_code || "inr").toLowerCase()
    const paise = toSmallestUnit(amount, currency)

    if (!paise || paise < 100) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay requires a minimum order amount of ₹1.",
      )
    }

    const receipt =
      (typeof context?.idempotency_key === "string" &&
        context.idempotency_key.slice(0, 40)) ||
      `elai_${Date.now()}`

    try {
      const order = await this.client_.orders.create({
        amount: paise,
        currency: currency.toUpperCase(),
        receipt,
        payment_capture: this.options_.payment_capture ?? 1,
        notes: {
          session_id:
            typeof context?.session_id === "string" ? context.session_id : "",
          customer_id:
            typeof context?.customer?.id === "string" ? context.customer.id : "",
        },
      })

      const data: RazorpaySessionData = {
        id: order.id,
        razorpay_order_id: order.id,
        amount: paise,
        currency: currency.toUpperCase(),
        key_id: this.options_.key_id,
      }

      return {
        id: order.id,
        data,
      }
    } catch (error) {
      this.logger_.error(
        `Razorpay initiatePayment failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Could not create Razorpay order: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const data = (input.data || {}) as RazorpaySessionData & Record<string, unknown>
    const orderId = data.razorpay_order_id || data.id

    // Checkout.js success fields: merge onto the existing order without recreating it.
    if (
      orderId &&
      data.razorpay_payment_id &&
      data.razorpay_signature
    ) {
      return {
        data: {
          ...data,
          id: String(orderId),
          razorpay_order_id: String(orderId),
          key_id: this.options_.key_id,
        },
      }
    }

    // Razorpay orders are immutable for amount; create a fresh order.
    return this.initiatePayment(input)
  }

  async authorizePayment(
    input: AuthorizePaymentInput,
  ): Promise<AuthorizePaymentOutput> {
    const data = (input.data || {}) as RazorpaySessionData & Record<string, unknown>
    const orderId = String(data.razorpay_order_id || data.id || "")

    if (!orderId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing Razorpay order id on payment session.",
      )
    }

    // Prefer signature verification when the storefront passed Checkout.js fields.
    if (data.razorpay_payment_id && data.razorpay_signature) {
      const body = `${orderId}|${data.razorpay_payment_id}`
      const expected = crypto
        .createHmac("sha256", this.options_.key_secret)
        .update(body)
        .digest("hex")
      if (expected !== data.razorpay_signature) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Invalid Razorpay payment signature.",
        )
      }
      const payment = await this.client_.payments.fetch(
        String(data.razorpay_payment_id),
      )
      const status =
        payment.status === "captured" ? "captured" : "authorized"
      return {
        status,
        data: {
          ...data,
          id: orderId,
          razorpay_payment_id: payment.id,
          razorpay_status: payment.status,
        },
      }
    }

    // Fallback: poll Razorpay for a successful payment on this order.
    let paid: { id: string; status?: string } | undefined
    for (let attempt = 0; attempt < 5; attempt++) {
      const payments = await this.client_.orders.fetchPayments(orderId)
      paid = (payments.items || []).find(
        (p: { status?: string }) =>
          p.status === "captured" || p.status === "authorized",
      )
      if (paid) break
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
    }

    if (!paid) {
      throw new MedusaError(
        MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
        "Razorpay payment is not authorized yet. Complete payment in Checkout and try again.",
      )
    }

    return {
      status: paid.status === "captured" ? "captured" : "authorized",
      data: {
        ...data,
        id: orderId,
        razorpay_order_id: orderId,
        razorpay_payment_id: paid.id,
        razorpay_status: paid.status,
      },
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const data = (input.data || {}) as RazorpaySessionData & Record<string, unknown>
    const paymentId = data.razorpay_payment_id
      ? String(data.razorpay_payment_id)
      : null

    if (!paymentId) {
      // Already captured at order creation, or authorize stored only order id.
      return { data }
    }

    try {
      const existing = await this.client_.payments.fetch(paymentId)
      if (existing.status === "captured") {
        return { data: { ...data, razorpay_status: "captured" } }
      }
      const amount =
        typeof data.amount === "number"
          ? data.amount
          : Number(existing.amount)
      const captured = await this.client_.payments.capture(
        paymentId,
        amount,
        String(data.currency || existing.currency || "INR"),
      )
      return {
        data: {
          ...data,
          razorpay_payment_id: captured.id,
          razorpay_status: captured.status,
        },
      }
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Razorpay capture failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    // Razorpay does not cancel unpaid orders via a simple API; no-op.
    return { data: input.data }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput,
  ): Promise<GetPaymentStatusOutput> {
    const data = (input.data || {}) as RazorpaySessionData
    const orderId = String(data.razorpay_order_id || data.id || "")
    if (!orderId) return { status: "pending" }

    try {
      if (data.razorpay_payment_id) {
        const payment = await this.client_.payments.fetch(data.razorpay_payment_id)
        if (payment.status === "captured") return { status: "captured" }
        if (payment.status === "authorized") return { status: "authorized" }
        if (payment.status === "failed") return { status: "error" }
        return { status: "pending" }
      }
      const payments = await this.client_.orders.fetchPayments(orderId)
      const paid = (payments.items || []).find(
        (p: { status?: string }) =>
          p.status === "captured" || p.status === "authorized",
      )
      if (!paid) return { status: "pending" }
      return {
        status: paid.status === "captured" ? "captured" : "authorized",
      }
    } catch {
      return { status: "pending" }
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const data = (input.data || {}) as RazorpaySessionData
    const paymentId = data.razorpay_payment_id
    if (!paymentId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cannot refund: missing Razorpay payment id.",
      )
    }

    const amount = input.amount != null ? toSmallestUnit(input.amount, data.currency || "inr") : undefined

    const refund = await this.client_.payments.refund(paymentId, {
      amount,
      speed: "normal",
    })

    return {
      data: {
        ...data,
        razorpay_refund_id: refund.id,
        razorpay_status: "refunded",
      },
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput,
  ): Promise<RetrievePaymentOutput> {
    const data = (input.data || {}) as RazorpaySessionData
    if (data.razorpay_payment_id) {
      const payment = await this.client_.payments.fetch(data.razorpay_payment_id)
      return { data: payment as unknown as Record<string, unknown> }
    }
    if (data.razorpay_order_id || data.id) {
      const order = await this.client_.orders.fetch(
        String(data.razorpay_order_id || data.id),
      )
      return { data: order as unknown as Record<string, unknown> }
    }
    return { data: data as unknown as Record<string, unknown> }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"],
  ): Promise<WebhookActionResult> {
    const { data, rawData, headers } = payload

    if (this.options_.webhook_secret) {
      const signature =
        (headers as Record<string, string>)["x-razorpay-signature"] ||
        (headers as Record<string, string>)["X-Razorpay-Signature"]
      const failed = {
        action: "failed" as const,
        data: {
          session_id: "",
          amount: new BigNumber(0),
        },
      }
      if (!signature || typeof rawData !== "string") {
        this.logger_?.warn?.(
          "Razorpay webhook rejected: missing signature or raw body while webhook_secret is configured.",
        )
        return failed
      }
      const expected = crypto
        .createHmac("sha256", this.options_.webhook_secret)
        .update(rawData)
        .digest("hex")
      if (expected !== signature) {
        this.logger_?.warn?.("Razorpay webhook rejected: invalid signature.")
        return failed
      }
    }

    const event = data as {
      event?: string
      payload?: {
        payment?: {
          entity?: {
            id?: string
            amount?: number
            currency?: string
            order_id?: string
            notes?: { session_id?: string }
            status?: string
          }
        }
      }
    }

    const payment = event.payload?.payment?.entity
    const sessionId = payment?.notes?.session_id || ""
    const currency = payment?.currency || "INR"
    const amountMajor = fromSmallestUnit(Number(payment?.amount || 0), currency)

    switch (event.event) {
      case "payment.captured":
        return {
          action: "captured",
          data: {
            session_id: sessionId,
            amount: new BigNumber(amountMajor),
          },
        }
      case "payment.authorized":
        return {
          action: "authorized",
          data: {
            session_id: sessionId,
            amount: new BigNumber(amountMajor),
          },
        }
      case "payment.failed":
        return {
          action: "failed",
          data: {
            session_id: sessionId,
            amount: new BigNumber(amountMajor),
          },
        }
      default:
        return {
          action: "not_supported",
          data: {
            session_id: sessionId,
            amount: new BigNumber(amountMajor),
          },
        }
    }
  }
}

export default RazorpayProviderService
