export type RazorpayCheckoutSuccess = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export type RazorpayCheckoutOptions = {
  key: string
  amount: number
  currency: string
  name?: string
  description?: string
  order_id: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: { color?: string }
  handler: (response: RazorpayCheckoutSuccess) => void
  modal?: {
    ondismiss?: () => void
  }
}

type RazorpayInstance = {
  open: () => void
  on: (event: string, handler: (...args: unknown[]) => void) => void
}

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

let scriptPromise: Promise<void> | null = null

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only load in the browser.'))
  }
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-elai-razorpay]',
    )
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Razorpay Checkout.')),
      )
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.elaiRazorpay = 'true'
    script.onload = () => resolve()
    script.onerror = () =>
      reject(new Error('Failed to load Razorpay Checkout.'))
    document.body.appendChild(script)
  })

  return scriptPromise
}

export async function openRazorpayCheckout(
  options: Omit<RazorpayCheckoutOptions, 'handler'> & {
    onSuccess: (response: RazorpayCheckoutSuccess) => void
    onDismiss?: () => void
  },
): Promise<void> {
  await loadRazorpayScript()
  if (!window.Razorpay) {
    throw new Error('Razorpay Checkout is unavailable.')
  }

  const rzp = new window.Razorpay({
    key: options.key,
    amount: options.amount,
    currency: options.currency,
    name: options.name || 'Elai',
    description: options.description || 'Order payment',
    order_id: options.order_id,
    prefill: options.prefill,
    theme: options.theme || { color: '#5c6b3a' },
    handler: options.onSuccess,
    modal: {
      ondismiss: options.onDismiss,
    },
  })

  rzp.open()
}
