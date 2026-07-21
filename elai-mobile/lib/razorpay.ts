import Constants from 'expo-constants'
import RazorpayCheckout, {
  type RazorpayCheckoutOptions,
  type RazorpaySuccessResponse,
} from 'react-native-razorpay'

export type { RazorpaySuccessResponse }

export function getRazorpayKeyId(sessionKeyId?: string | null): string {
  return (
    sessionKeyId?.trim() ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
    ''
  )
}

export type OpenRazorpayParams = {
  key: string
  amount: number
  currency: string
  orderId: string
  description?: string
  prefill?: RazorpayCheckoutOptions['prefill']
}

/**
 * Opens native Razorpay Checkout.
 * Requires a development/production build (not Expo Go).
 */
export async function openRazorpayCheckout(
  params: OpenRazorpayParams,
): Promise<RazorpaySuccessResponse> {
  if (!params.key) {
    throw new Error(
      'Missing Razorpay key. Set EXPO_PUBLIC_RAZORPAY_KEY_ID or ensure the payment session returns key_id.',
    )
  }
  if (!params.orderId) {
    throw new Error('Missing Razorpay order id on the payment session.')
  }
  if (!params.amount || params.amount < 100) {
    throw new Error('Invalid Razorpay amount (expected paise, minimum ₹1).')
  }

  try {
    return await RazorpayCheckout.open({
      key: params.key,
      amount: params.amount,
      currency: (params.currency || 'INR').toUpperCase(),
      name: 'Elai',
      description: params.description || 'Order payment',
      order_id: params.orderId,
      prefill: params.prefill,
      theme: { color: '#748956' },
    })
  } catch (err) {
    const error = err as {
      code?: number | string
      description?: string
      error?: { description?: string; reason?: string }
    }
    const code = String(error?.code ?? '')
    if (code === '0' || /cancel/i.test(error?.description || '')) {
      throw new Error('Payment cancelled.')
    }
    throw new Error(
      error?.error?.description ||
        error?.description ||
        error?.error?.reason ||
        'Razorpay payment failed.',
    )
  }
}
