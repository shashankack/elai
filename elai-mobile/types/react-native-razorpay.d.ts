declare module 'react-native-razorpay' {
  export type RazorpaySuccessResponse = {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }

  export type RazorpayCheckoutOptions = {
    key: string
    amount: number | string
    currency: string
    name?: string
    description?: string
    order_id: string
    image?: string
    prefill?: {
      email?: string
      contact?: string
      name?: string
    }
    theme?: {
      color?: string
    }
    notes?: Record<string, string>
  }

  export type RazorpayError = {
    code?: number | string
    description?: string
    error?: {
      code?: string
      description?: string
      reason?: string
      step?: string
      source?: string
      metadata?: Record<string, unknown>
    }
  }

  const RazorpayCheckout: {
    open: (options: RazorpayCheckoutOptions) => Promise<RazorpaySuccessResponse>
  }

  export default RazorpayCheckout
}
